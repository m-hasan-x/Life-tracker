import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Mic,
  Video,
  Play,
  Square,
  Pause,
  Star,
  Film,
  Plus,
  CheckCircle,
  Trash2,
  Volume2,
  Calendar,
  Languages,
  Download,
  Sparkles,
  Camera,
  RotateCcw
} from 'lucide-react';
import { MediaLog } from '../types';
import { saveMediaBlob, getMediaPlaybackUrl, deleteMediaBlob } from '../services/videoStorage';

interface MediaStudioProps {
  isOpen: boolean;
  onClose: () => void;
  mediaLogs: MediaLog[];
  onSaveMediaLog: (log: MediaLog) => void;
  onDeleteMediaLog: (id: string) => void;
  isStandalone?: boolean;
}

export const MediaStudio: React.FC<MediaStudioProps> = ({
  isOpen,
  onClose,
  mediaLogs,
  onSaveMediaLog,
  onDeleteMediaLog,
  isStandalone = false
}) => {
  const [activeTab, setActiveTab] = useState<'video' | 'voice' | 'logs'>('video');
  const [languages, setLanguages] = useState<string[]>([
    'Bengali',
    'English (US)',
    'English (UK)'
  ]);
  const [selectedLang, setSelectedLang] = useState<string>('English (US)');
  const [customLangInput, setCustomLangInput] = useState<string>('');
  const [showAddLang, setShowAddLang] = useState<boolean>(false);

  // Common metadata
  const [topic, setTopic] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [rating, setRating] = useState<number>(5);

  // Recording Engine State
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [recordedMediaUrl, setRecordedMediaUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // References
  const videoLiveRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordedBlobRef = useRef<Blob | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const [resolvedUrls, setResolvedUrls] = useState<Record<string, string>>({});

  // Revive video playback URLs from IndexedDB for persistent offline playback
  useEffect(() => {
    let active = true;
    mediaLogs.forEach(log => {
      getMediaPlaybackUrl(log.id).then(url => {
        if (active && url) {
          setResolvedUrls(prev => ({ ...prev, [log.id]: url }));
        }
      });
    });
    return () => { active = false; };
  }, [mediaLogs]);

  const uploadMediaFile = async (blob: Blob, type: 'video' | 'voice'): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result as string;
        try {
          const res = await fetch('/api/media/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              dataUrl,
              type,
              filename: `${type}_${Date.now()}.webm`
            })
          });
          if (res.ok) {
            const data = await res.json();
            if (data.url) {
              resolve(data.url);
              return;
            }
          }
        } catch (err) {
          console.warn('Backend media upload error; falling back to persistent data URI', err);
        }
        resolve(dataUrl);
      };
      reader.onerror = () => {
        resolve(URL.createObjectURL(blob));
      };
      reader.readAsDataURL(blob);
    });
  };

  // Initialize or cleanup live camera stream
  useEffect(() => {
    if (!isOpen || activeTab === 'logs') {
      stopTracks();
      return;
    }

    if (activeTab === 'video') {
      startCamera();
    } else {
      stopTracks();
    }

    return () => {
      stopTracks();
      clearIntervalTimer();
    };
  }, [isOpen, activeTab]);

  const stopTracks = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  };

  const clearIntervalTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  const startCamera = async () => {
    try {
      stopTracks();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true
      });
      streamRef.current = stream;
      if (videoLiveRef.current) {
        videoLiveRef.current.srcObject = stream;
        videoLiveRef.current.muted = true; // prevent acoustic feedback
        await videoLiveRef.current.play();
      }
    } catch (err) {
      console.warn('Webcam access not allowed or unavailable:', err);
    }
  };

  const startRecording = async () => {
    try {
      setRecordedMediaUrl(null);
      chunksRef.current = [];
      setTimerSeconds(0);

      let stream: MediaStream;
      if (activeTab === 'video') {
        if (!streamRef.current) await startCamera();
        stream = streamRef.current!;
      } else {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
      }

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const mimeType = activeTab === 'video' ? 'video/webm' : 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: mimeType });
        recordedBlobRef.current = blob;
        const url = URL.createObjectURL(blob);
        setRecordedMediaUrl(url);
      };

      recorder.start(250);
      setIsRecording(true);
      setIsPaused(false);

      timerIntervalRef.current = window.setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    } catch (err) {
      alert('Could not start media recording. Please grant microphone and camera permissions.');
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (!isPaused) {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
        clearIntervalTimer();
      } else {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
        timerIntervalRef.current = window.setInterval(() => {
          setTimerSeconds(prev => prev + 1);
        }, 1000);
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      clearIntervalTimer();
      stopTracks();
    }
  };

  const handleSaveLog = async () => {
    if (!recordedMediaUrl) {
      alert('Please record an audio or video session first.');
      return;
    }

    setIsUploading(true);
    let finalMediaUrl = recordedMediaUrl;

    if (recordedBlobRef.current) {
      try {
        finalMediaUrl = await uploadMediaFile(
          recordedBlobRef.current,
          activeTab === 'video' ? 'video' : 'voice'
        );
      } catch (uploadErr) {
        console.warn('Media upload failed, using fallback URL', uploadErr);
      }
    }

    const newLogId = `med_${Date.now()}`;

    // Persist video/audio binary directly to IndexedDB for offline persistence
    if (recordedBlobRef.current) {
      try {
        await saveMediaBlob(
          newLogId,
          recordedBlobRef.current,
          activeTab === 'video' ? 'video/webm' : 'audio/webm'
        );
      } catch (idbErr) {
        console.warn('IndexedDB save failed:', idbErr);
      }
    }

    const newLog: MediaLog = {
      id: newLogId,
      type: activeTab === 'video' ? 'video' : 'voice',
      topic: topic || `${activeTab === 'video' ? 'Video Rehearsal' : 'Voice Practice'} (${selectedLang})`,
      language: selectedLang,
      timestamp: new Date().toISOString(),
      rating,
      notes: notes || 'Session completed successfully.',
      mediaUrl: finalMediaUrl,
      durationSeconds: timerSeconds
    };

    onSaveMediaLog(newLog);
    setIsUploading(false);
    setTopic('');
    setNotes('');
    setRating(5);
    setRecordedMediaUrl(null);
    recordedBlobRef.current = null;
    setTimerSeconds(0);
    setActiveTab('logs');
  };

  const handleDeleteLogItem = async (id: string) => {
    try {
      await deleteMediaBlob(id);
    } catch (e) {
      console.warn('Failed to delete media blob from IndexedDB:', e);
    }
    onDeleteMediaLog(id);
  };

  const handleAddCustomLang = () => {
    const val = customLangInput.trim();
    if (val && !languages.includes(val)) {
      setLanguages(prev => [...prev, val]);
      setSelectedLang(val);
      setCustomLangInput('');
      setShowAddLang(false);
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  const studioContent = (
    <div className={`relative w-full ${isStandalone ? 'bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-2xl shadow-xs' : 'max-w-3xl bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-2xl shadow-2xl max-h-[92vh]'} overflow-hidden flex flex-col`}>

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">MacBook Media & Speaking Studio</h3>
            <p className="text-xs text-slate-500 font-medium">
              Vocal speech practice, live presentation recording & rehearsal review
            </p>
          </div>
        </div>
        {!isStandalone ? (
          <button
            onClick={() => { stopTracks(); onClose(); }}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Offline IndexedDB Enabled
            </span>
          </div>
        )}
      </div>

      {/* Tab Switcher */}
      <div className="px-6 pt-3 pb-2 bg-slate-50/40 border-b border-slate-100">
        <div className="flex gap-2">
          <button
            onClick={() => { stopRecording(); setActiveTab('video'); }}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'video'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
          >
            <Video className="w-4 h-4" />
            <span>Video Studio (Webcam)</span>
          </button>

          <button
            onClick={() => { stopRecording(); setActiveTab('voice'); }}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'voice'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
          >
            <Mic className="w-4 h-4" />
            <span>Voice Studio (Mic)</span>
          </button>

          <button
            onClick={() => { stopRecording(); setActiveTab('logs'); }}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'logs'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
          >
            <Film className="w-4 h-4" />
            <span>Practice Logs ({mediaLogs.length})</span>
          </button>
        </div>
      </div>

      {/* Studio Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        {/* TAB 1 & 2: RECORDING WORKSPACE */}
        {(activeTab === 'video' || activeTab === 'voice') && (
          <div className="space-y-4">

            {/* Language Selector & Session Timer Row */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Languages className="w-3.5 h-3.5 text-purple-600" />
                  Speech Language:
                </span>
                <select
                  value={selectedLang}
                  onChange={(e) => setSelectedLang(e.target.value)}
                  className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                >
                  {languages.map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>

                {!showAddLang ? (
                  <button
                    type="button"
                    onClick={() => setShowAddLang(true)}
                    className="text-xs font-semibold text-purple-600 hover:text-purple-800 px-2 py-1 rounded hover:bg-purple-50"
                  >
                    + Add Language
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      placeholder="Language name"
                      value={customLangInput}
                      onChange={(e) => setCustomLangInput(e.target.value)}
                      className="px-2 py-1 bg-white border border-purple-300 rounded text-xs w-32"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomLang}
                      className="px-2 py-1 bg-purple-600 text-white rounded text-xs font-bold"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddLang(false)}
                      className="px-1 text-slate-400 hover:text-slate-600 text-xs"
                    >
                      &times;
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Duration:</span>
                <span className="text-lg font-black font-mono text-slate-800 bg-white px-3 py-0.5 rounded-lg border border-slate-200 shadow-xs">
                  {formatSeconds(timerSeconds)}
                </span>
              </div>
            </div>

            {/* UNIFIED WEBCAM CONTAINER (Resolved Split-Screen Glitch into Single 16:9 Aspect Video) */}
            {activeTab === 'video' && (
              <div className="relative w-full aspect-video bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-lg flex items-center justify-center">
                {!recordedMediaUrl ? (
                  <>
                    <video
                      ref={videoLiveRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    {isRecording && (
                      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1 bg-rose-600/90 backdrop-blur-sm text-white rounded-full text-xs font-bold animate-pulse">
                        <span className="w-2.5 h-2.5 rounded-full bg-white" />
                        <span>{isPaused ? 'PAUSED' : 'LIVE RECORDING'}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <video
                    src={recordedMediaUrl}
                    controls
                    autoPlay
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
            )}

            {/* VOICE STUDIO WAVEFORM / VISUALIZER BOX */}
            {activeTab === 'voice' && (
              <div className="p-8 bg-gradient-to-b from-slate-50 to-slate-100 rounded-2xl border border-slate-200 text-center space-y-3">
                <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center text-white transition-all shadow-md ${isRecording
                  ? 'bg-rose-600 animate-pulse ring-8 ring-rose-200'
                  : 'bg-purple-600 shadow-purple-500/20'
                  }`}>
                  <Mic className="w-10 h-10" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-800">
                    {isRecording ? (isPaused ? 'Recording Paused' : 'Listening & Recording...') : 'Voice Rehearsal Studio'}
                  </h4>
                  <p className="text-xs text-slate-500">
                    High-fidelity audio recording for speech mastery in {selectedLang}
                  </p>
                </div>
                {recordedMediaUrl && (
                  <div className="pt-2">
                    <audio src={recordedMediaUrl} controls className="w-full max-w-md mx-auto" />
                  </div>
                )}
              </div>
            )}

            {/* Controls Row */}
            <div className="flex items-center justify-center gap-3 pt-2">
              {!isRecording && !recordedMediaUrl && (
                <button
                  type="button"
                  onClick={startRecording}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all"
                >
                  <Play className="w-4 h-4" />
                  <span>Start {activeTab === 'video' ? 'Video' : 'Voice'} Record</span>
                </button>
              )}

              {isRecording && (
                <>
                  <button
                    type="button"
                    onClick={pauseRecording}
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded-xl shadow-md shadow-amber-500/20 flex items-center gap-2 transition-all"
                  >
                    <Pause className="w-4 h-4" />
                    <span>{isPaused ? 'Resume' : 'Pause'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-xl shadow-md shadow-rose-600/20 flex items-center gap-2 transition-all"
                  >
                    <Square className="w-4 h-4" />
                    <span>Stop & Review</span>
                  </button>
                </>
              )}

              {recordedMediaUrl && !isRecording && (
                <button
                  type="button"
                  onClick={startRecording}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-all"
                >
                  Re-Record Session
                </button>
              )}
            </div>

            {/* Post-Recording Metadata Input & Save Commit */}
            {recordedMediaUrl && (
              <div className="p-4 bg-purple-50/50 border border-purple-200/80 rounded-2xl space-y-3 animate-fade-in">
                <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider">
                  Log Rehearsal Performance
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Speech Topic / Presentation Name *
                    </label>
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="e.g. HSC Physics Dynamics Rehearsal"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Self-Performance Rating
                    </label>
                    <div className="flex items-center gap-1 pt-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="p-1 text-slate-300 hover:text-amber-400 transition-colors"
                        >
                          <Star className={`w-5 h-5 ${rating >= star ? 'text-amber-400 fill-amber-400' : ''}`} />
                        </button>
                      ))}
                      <span className="text-xs font-bold text-slate-700 ml-2 font-mono">{rating}/5 Stars</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Delivery & Vocal Feedback Notes
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Eye contact was steady, pacing needs slightly more pauses"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleSaveLog}
                    disabled={isUploading}
                    className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md shadow-purple-600/20 flex items-center gap-2 transition disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>{isUploading ? 'Saving to Server Disk...' : 'Commit to Media Practice Logs'}</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

        {/* TAB 3: MEDIA PRACTICE LOGS TIMELINE */}
        {activeTab === 'logs' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-800">Media Practice History</h4>
              <span className="text-xs text-slate-500 font-medium">{mediaLogs.length} saved entries</span>
            </div>

            {mediaLogs.length === 0 ? (
              <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Film className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-semibold">No media logs recorded yet.</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Record a video or voice rehearsal above to build your timeline.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {mediaLogs.map(log => (
                  <div key={log.id} className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${log.type === 'video' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                          {log.type === 'video' ? <Video className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-slate-800">{log.topic}</h5>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {log.language} &bull; {new Date(log.timestamp).toLocaleDateString()} &bull; {formatSeconds(log.durationSeconds)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center text-amber-400">
                          {Array.from({ length: log.rating }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteLogItem(log.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Playable Inline Player */}
                    {(() => {
                      const playUrl = resolvedUrls[log.id] || log.mediaUrl;
                      return (
                        <>
                          <div className="rounded-lg overflow-hidden bg-slate-900 flex items-center justify-center">
                            {log.type === 'video' ? (
                              <video src={playUrl} controls className="w-full max-h-56 object-contain" />
                            ) : (
                              <audio src={playUrl} controls className="w-full p-2 bg-slate-100" />
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[11px] text-slate-400 font-mono">
                              {log.mediaUrl.startsWith('/uploads') ? '✓ Saved to server disk' : '✓ Persistent IndexedDB storage'}
                            </span>
                            <a
                              href={playUrl}
                              download={`recording_${log.id}.${log.type === 'video' ? 'webm' : 'webm'}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition shadow-xs"
                            >
                              <Download className="w-3.5 h-3.5 text-slate-600" />
                              <span>Download {log.type === 'video' ? 'Video' : 'Audio'}</span>
                            </a>
                          </div>
                        </>
                      );
                    })()}

                    {log.notes && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        {log.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );

  if (isStandalone) {
    return studioContent;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      {studioContent}
    </div>
  );
};
