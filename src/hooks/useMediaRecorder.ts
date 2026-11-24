import { useState, useRef, useEffect, useCallback } from 'react';

export interface UseMediaRecorderOptions {
  type: 'video' | 'voice';
  videoElement?: HTMLVideoElement | null;
}

export interface UseMediaRecorderReturn {
  isRecording: boolean;
  isPaused: boolean;
  timerSeconds: number;
  recordedUrl: string | null;
  recordedBlob: Blob | null;
  startRecording: (stream?: MediaStream) => Promise<void>;
  pauseRecording: () => void;
  resumeRecording: () => void;
  stopRecording: () => void;
  clearRecording: () => void;
  formattedTime: string;
}

/**
 * useMediaRecorder
 * A custom React hook that encapsulates the MediaStream and MediaRecorder browser APIs.
 * 
 * Why this hook exists:
 * Separates complex browser media recording state and lifecycle management
 * from UI rendering components, making speech and presentation practice reusable.
 */
export function useMediaRecorder(type: 'video' | 'voice'): UseMediaRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);

  // Stop active media stream tracks
  const stopTracks = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Clear running timer
  const clearTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      stopTracks();
      clearTimer();
    };
  }, [stopTracks, clearTimer]);

  const startRecording = useCallback(async (customStream?: MediaStream) => {
    try {
      // Reset previous state
      setRecordedUrl(null);
      setRecordedBlob(null);
      chunksRef.current = [];
      setTimerSeconds(0);

      let stream = customStream;
      if (!stream) {
        if (type === 'video') {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: true
          });
        } else {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        }
      }
      streamRef.current = stream;

      const mimeType = type === 'video' ? 'video/webm' : 'audio/webm';
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const finalBlob = new Blob(chunksRef.current, { type: mimeType });
        setRecordedBlob(finalBlob);
        const url = URL.createObjectURL(finalBlob);
        setRecordedUrl(url);
      };

      recorder.start(250);
      setIsRecording(true);
      setIsPaused(false);

      clearTimer();
      timerIntervalRef.current = window.setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Failed to start MediaRecorder:', error);
      throw error;
    }
  }, [type, clearTimer]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      clearTimer();
    }
  }, [isRecording, isPaused, clearTimer]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      timerIntervalRef.current = window.setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    }
  }, [isRecording, isPaused]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      clearTimer();
      stopTracks();
    }
  }, [isRecording, clearTimer, stopTracks]);

  const clearRecording = useCallback(() => {
    setRecordedUrl(null);
    setRecordedBlob(null);
    chunksRef.current = [];
    setTimerSeconds(0);
  }, []);

  const minutes = Math.floor(timerSeconds / 60);
  const seconds = timerSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return {
    isRecording,
    isPaused,
    timerSeconds,
    recordedUrl,
    recordedBlob,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    clearRecording,
    formattedTime
  };
}
