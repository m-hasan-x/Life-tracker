import React, { useState } from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Sparkles, 
  Check, 
  ChevronRight, 
  Award,
  Calendar,
  Flame,
  FileText
} from 'lucide-react';
import { HSCBook, StudySession } from '../types';

interface StudyAndPlanProps {
  onSyncToDailyRoutine: (entry: {
    text: string;
    studyHours: number;
    book: string;
    chapterNotes: string;
  }) => void;
  studySessions: StudySession[];
  onAddStudySession: (session: StudySession) => void;
}

const INITIAL_HSC_BOOKS: HSCBook[] = [
  {
    id: 'phy_1',
    nameEnglish: 'Physics 1st Paper',
    subject: 'Physics',
    paper: 1,
    color: 'from-blue-500 to-indigo-600',
    chapters: [
      { id: 1, number: 1, titleEnglish: 'Physical World & Measurement', completed: true },
      { id: 2, number: 2, titleEnglish: 'Vectors', completed: true },
      { id: 3, number: 3, titleEnglish: 'Dynamics', completed: true },
      { id: 4, number: 4, titleEnglish: 'Newtonian Mechanics', completed: false },
      { id: 5, number: 5, titleEnglish: 'Work, Energy & Power', completed: false },
      { id: 6, number: 6, titleEnglish: 'Gravitation', completed: false },
      { id: 7, number: 7, titleEnglish: 'Structural Properties of Matter', completed: false },
      { id: 8, number: 8, titleEnglish: 'Periodic Motion', completed: false },
      { id: 9, number: 9, titleEnglish: 'Waves', completed: false },
      { id: 10, number: 10, titleEnglish: 'Ideal Gas & Kinetic Theory', completed: false }
    ]
  },
  {
    id: 'phy_2',
    nameEnglish: 'Physics 2nd Paper',
    subject: 'Physics',
    paper: 2,
    color: 'from-indigo-500 to-purple-600',
    chapters: [
      { id: 11, number: 1, titleEnglish: 'Thermodynamics', completed: true },
      { id: 12, number: 2, titleEnglish: 'Electrostatics', completed: true },
      { id: 13, number: 3, titleEnglish: 'Current Electricity', completed: false },
      { id: 14, number: 4, titleEnglish: 'Magnetic Effects of Current', completed: false },
      { id: 15, number: 5, titleEnglish: 'Electromagnetic Induction', completed: false },
      { id: 16, number: 6, titleEnglish: 'Geometrical Optics', completed: false },
      { id: 17, number: 7, titleEnglish: 'Physical Optics', completed: false },
      { id: 18, number: 8, titleEnglish: 'Modern Physics', completed: false },
      { id: 19, number: 9, titleEnglish: 'Atomic Model & Nuclear Physics', completed: false },
      { id: 20, number: 10, titleEnglish: 'Semiconductor & Electronics', completed: false },
      { id: 21, number: 11, titleEnglish: 'Astronomy', completed: false }
    ]
  },
  {
    id: 'chem_1',
    nameEnglish: 'Chemistry 1st Paper',
    subject: 'Chemistry',
    paper: 1,
    color: 'from-emerald-500 to-teal-600',
    chapters: [
      { id: 22, number: 1, titleEnglish: 'Safe Use of Laboratory', completed: true },
      { id: 23, number: 2, titleEnglish: 'Qualitative Chemistry', completed: true },
      { id: 24, number: 3, titleEnglish: 'Periodic Properties & Bonding', completed: false },
      { id: 25, number: 4, titleEnglish: 'Chemical Changes (Equilibrium & Kinetics)', completed: false },
      { id: 26, number: 5, titleEnglish: 'Applied Chemistry', completed: false }
    ]
  },
  {
    id: 'chem_2',
    nameEnglish: 'Chemistry 2nd Paper',
    subject: 'Chemistry',
    paper: 2,
    color: 'from-teal-500 to-cyan-600',
    chapters: [
      { id: 27, number: 1, titleEnglish: 'Environmental Chemistry', completed: true },
      { id: 28, number: 2, titleEnglish: 'Organic Chemistry', completed: false },
      { id: 29, number: 3, titleEnglish: 'Quantitative Chemistry', completed: false },
      { id: 30, number: 4, titleEnglish: 'Electrochemistry', completed: false },
      { id: 31, number: 5, titleEnglish: 'Economic Chemistry', completed: false }
    ]
  },
  {
    id: 'math_1',
    nameEnglish: 'Higher Mathematics 1st Paper',
    subject: 'Mathematics',
    paper: 1,
    color: 'from-amber-500 to-orange-600',
    chapters: [
      { id: 32, number: 1, titleEnglish: 'Matrices & Determinants', completed: true },
      { id: 33, number: 2, titleEnglish: 'Vectors', completed: true },
      { id: 34, number: 3, titleEnglish: 'Straight Lines', completed: true },
      { id: 35, number: 4, titleEnglish: 'Circles', completed: false },
      { id: 36, number: 5, titleEnglish: 'Permutations & Combinations', completed: false },
      { id: 37, number: 6, titleEnglish: 'Trigonometric Ratios', completed: false },
      { id: 38, number: 7, titleEnglish: 'Associated Angles Trigonometry', completed: false },
      { id: 39, number: 8, titleEnglish: 'Functions & Graphs', completed: false },
      { id: 40, number: 9, titleEnglish: 'Differentiation', completed: true },
      { id: 41, number: 10, titleEnglish: 'Integration', completed: false }
    ]
  },
  {
    id: 'math_2',
    nameEnglish: 'Higher Mathematics 2nd Paper',
    subject: 'Mathematics',
    paper: 2,
    color: 'from-rose-500 to-pink-600',
    chapters: [
      { id: 42, number: 1, titleEnglish: 'Real Numbers & Inequalities', completed: true },
      { id: 43, number: 2, titleEnglish: 'Linear Programming', completed: true },
      { id: 44, number: 3, titleEnglish: 'Complex Numbers', completed: false },
      { id: 45, number: 4, titleEnglish: 'Polynomials', completed: false },
      { id: 46, number: 5, titleEnglish: 'Binomial Expansion', completed: false },
      { id: 47, number: 6, titleEnglish: 'Conics (Parabola, Ellipse, Hyperbola)', completed: false },
      { id: 48, number: 7, titleEnglish: 'Inverse Trigonometry', completed: false },
      { id: 49, number: 8, titleEnglish: 'Statics', completed: false },
      { id: 50, number: 9, titleEnglish: 'Dynamics of Particles', completed: false },
      { id: 51, number: 10, titleEnglish: 'Probability & Dispersion', completed: false }
    ]
  },
  {
    id: 'bio_1',
    nameEnglish: 'Botany (Biology 1st Paper)',
    subject: 'Biology',
    paper: 1,
    color: 'from-green-600 to-emerald-700',
    chapters: [
      { id: 52, number: 1, titleEnglish: 'Cell & Its Structure', completed: true },
      { id: 53, number: 2, titleEnglish: 'Cell Division', completed: true },
      { id: 54, number: 3, titleEnglish: 'Cell Chemistry', completed: false },
      { id: 55, number: 4, titleEnglish: 'Microorganisms', completed: false },
      { id: 56, number: 5, titleEnglish: 'Algae & Fungi', completed: false },
      { id: 57, number: 6, titleEnglish: 'Bryophyta & Pteridophyta', completed: false },
      { id: 58, number: 7, titleEnglish: 'Gymnosperms & Angiosperms', completed: false },
      { id: 59, number: 8, titleEnglish: 'Tissue System', completed: false },
      { id: 60, number: 9, titleEnglish: 'Plant Physiology', completed: false },
      { id: 61, number: 10, titleEnglish: 'Plant Reproduction', completed: false },
      { id: 62, number: 11, titleEnglish: 'Biotechnology', completed: false },
      { id: 63, number: 12, titleEnglish: 'Ecology & Biodiversity', completed: false }
    ]
  },
  {
    id: 'ict_1',
    nameEnglish: 'Information & Communication Tech',
    subject: 'ICT',
    paper: 1,
    color: 'from-cyan-600 to-blue-700',
    chapters: [
      { id: 64, number: 1, titleEnglish: 'World & Bangladesh Context', completed: true },
      { id: 65, number: 2, titleEnglish: 'Communication & Networking', completed: true },
      { id: 66, number: 3, titleEnglish: 'Number Systems & Logic Gates', completed: false },
      { id: 67, number: 4, titleEnglish: 'Web Design & HTML', completed: false },
      { id: 68, number: 5, titleEnglish: 'C Programming Language', completed: false },
      { id: 69, number: 6, titleEnglish: 'Database Management', completed: false }
    ]
  }
];

export const StudyAndPlan: React.FC<StudyAndPlanProps> = ({
  onSyncToDailyRoutine,
  studySessions,
  onAddStudySession
}) => {
  const [books, setBooks] = useState<HSCBook[]>(() => {
    const saved = localStorage.getItem('hsc_books_state');
    return saved ? JSON.parse(saved) : INITIAL_HSC_BOOKS;
  });

  const [selectedBook, setSelectedBook] = useState<HSCBook>(books[0]);
  const [targetDailyHours, setTargetDailyHours] = useState<number>(4.5);
  
  // Session Logger State
  const [sessionHours, setSessionHours] = useState<string>('2.0');
  const [selectedChapterNumber, setSelectedChapterNumber] = useState<number>(
    selectedBook.chapters[0]?.number || 1
  );
  const [sessionNotes, setSessionNotes] = useState<string>('');
  const [autoSyncFeedback, setAutoSyncFeedback] = useState<string | null>(null);

  const saveBooksState = (newBooks: HSCBook[]) => {
    setBooks(newBooks);
    localStorage.setItem('hsc_books_state', JSON.stringify(newBooks));
    const updatedSelected = newBooks.find(b => b.id === selectedBook.id);
    if (updatedSelected) setSelectedBook(updatedSelected);
  };

  const toggleChapter = (bookId: string, chapterId: number) => {
    const updated = books.map(book => {
      if (book.id !== bookId) return book;
      return {
        ...book,
        chapters: book.chapters.map(ch => 
          ch.id === chapterId ? { ...ch, completed: !ch.completed } : ch
        )
      };
    });
    saveBooksState(updated);
  };

  const handleLogStudySession = (e: React.FormEvent) => {
    e.preventDefault();
    const duration = parseFloat(sessionHours) || 1.0;
    const currentChapter = selectedBook.chapters.find(c => c.number === selectedChapterNumber);
    const chapterName = currentChapter 
      ? `Chapter ${currentChapter.number}: ${currentChapter.titleEnglish}` 
      : `Chapter ${selectedChapterNumber}`;

    const newSession: StudySession = {
      id: `std_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      bookId: selectedBook.id,
      bookName: selectedBook.nameEnglish,
      chapterNumber: selectedChapterNumber,
      chapterTitle: currentChapter?.titleEnglish || '',
      durationHours: duration,
      notes: sessionNotes || `Studied ${selectedBook.nameEnglish} (${duration} hrs)`,
      timestamp: new Date().toISOString()
    };

    onAddStudySession(newSession);

    // AUTO-SYNC ENGINE: Append formatted entry to Daily Routine & Reflection Logs timeline
    const routineLogText = `Studied ${selectedBook.nameEnglish} - ${chapterName} (${duration} hrs)`;
    onSyncToDailyRoutine({
      text: routineLogText,
      studyHours: duration,
      book: selectedBook.nameEnglish,
      chapterNotes: `${chapterName} - ${sessionNotes || 'Deep study session completed'}`
    });

    setAutoSyncFeedback(`Auto-Synced to Daily Routine: "${routineLogText}"`);
    setTimeout(() => setAutoSyncFeedback(null), 5000);

    setSessionNotes('');
  };

  // Calculations
  const totalChapters = books.reduce((acc, b) => acc + b.chapters.length, 0);
  const completedChaptersCount = books.reduce(
    (acc, b) => acc + b.chapters.filter(c => c.completed).length, 
    0
  );
  const overallPercentage = Math.round((completedChaptersCount / totalChapters) * 100);

  const selectedBookCompleted = selectedBook.chapters.filter(c => c.completed).length;
  const selectedBookPercentage = Math.round((selectedBookCompleted / selectedBook.chapters.length) * 100);

  const todayStudyHours = studySessions
    .filter(s => s.date === new Date().toISOString().split('T')[0])
    .reduce((acc, s) => acc + s.durationHours, 0);

  return (
    <div className="space-y-6">
      
      {/* Top Banner KPI Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500 tracking-wider">HSC Syllabus Progress</p>
            <h3 className="text-2xl font-black text-slate-800 font-mono">{overallPercentage}%</h3>
            <p className="text-[11px] text-slate-400 font-medium">{completedChaptersCount} of {totalChapters} Chapters Done</p>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Today's Study Hours</p>
            <h3 className="text-2xl font-black text-slate-800 font-mono">{todayStudyHours.toFixed(1)} / {targetDailyHours}h</h3>
            <p className="text-[11px] text-emerald-600 font-medium">
              {todayStudyHours >= targetDailyHours ? 'Daily Goal Achieved! 🎉' : `${(targetDailyHours - todayStudyHours).toFixed(1)}h remaining`}
            </p>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Active Science Books</p>
            <h3 className="text-2xl font-black text-slate-800 font-mono">{books.length} Books</h3>
            <p className="text-[11px] text-slate-400 font-medium">NCTB Board Syllabus</p>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Auto-Sync Status</p>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-1.5 text-purple-700">
              <Sparkles className="w-4 h-4" /> Routine Sync Active
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">Updates Daily Routine timeline</p>
          </div>
        </div>
      </div>

      {/* Auto-Sync Real-time Confirmation Toast */}
      {autoSyncFeedback && (
        <div className="p-3.5 bg-purple-50 border border-purple-200 text-purple-800 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs animate-fade-in">
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            {autoSyncFeedback}
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 bg-white px-2 py-0.5 rounded">
            Committed to Routine
          </span>
        </div>
      )}

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Book Selector List (4 Cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
              NCTB Science Textbooks
            </h4>
            <span className="text-xs font-medium text-slate-400">Select to track</span>
          </div>

          <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
            {books.map(b => {
              const comp = b.chapters.filter(c => c.completed).length;
              const pct = Math.round((comp / b.chapters.length) * 100);
              const isSelected = selectedBook.id === b.id;

              return (
                <div
                  key={b.id}
                  onClick={() => {
                    setSelectedBook(b);
                    setSelectedChapterNumber(b.chapters[0]?.number || 1);
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected 
                      ? 'bg-white border-emerald-500/80 shadow-md ring-2 ring-emerald-500/10' 
                      : 'bg-white/60 border-slate-200/70 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-10 rounded-full bg-gradient-to-b ${b.color}`} />
                    <div>
                      <h5 className="text-sm font-bold text-slate-800 leading-snug">{b.nameEnglish}</h5>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-slate-800 font-mono">{pct}%</span>
                    <p className="text-[10px] text-slate-400 font-medium">{comp}/{b.chapters.length} ch</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Book Chapters & Live Study Session Logger (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Active Book Detail Card */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-800">{selectedBook.nameEnglish}</h3>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {selectedBook.nameEnglish}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Check off chapters as you finish revision & test papers
                </p>
              </div>

              <div className="w-48">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Book Completion</span>
                  <span className="font-mono text-emerald-600">{selectedBookPercentage}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
                    style={{ width: `${selectedBookPercentage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Chapter Checklist Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-4">
              {selectedBook.chapters.map(ch => (
                <div
                  key={ch.id}
                  onClick={() => toggleChapter(selectedBook.id, ch.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    ch.completed 
                      ? 'bg-emerald-50/50 border-emerald-200/80 text-emerald-900' 
                      : 'bg-slate-50/50 border-slate-200/60 hover:bg-white text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5 pr-2">
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                      ch.completed ? 'bg-emerald-600 text-white' : 'border border-slate-300 bg-white'
                    }`}>
                      {ch.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <div>
                      <span className="text-xs font-bold">Chapter {ch.number}: {ch.titleEnglish}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold font-mono text-slate-400">
                    Ch {ch.number}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Study Session Logger & Routine Auto-Sync Box */}
          <div className="bg-gradient-to-br from-white to-purple-50/40 rounded-2xl border border-purple-200/60 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-purple-900">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h4 className="text-sm font-bold">Log Study Session (Auto-Syncs to Daily Routine)</h4>
              </div>
              <span className="text-xs font-medium text-purple-700">One-click Sync</span>
            </div>

            <form onSubmit={handleLogStudySession} className="space-y-3.5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Subject / Book</label>
                  <input
                    type="text"
                    disabled
                    value={selectedBook.nameEnglish}
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Target Chapter</label>
                  <select
                    value={selectedChapterNumber}
                    onChange={(e) => setSelectedChapterNumber(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  >
                    {selectedBook.chapters.map(ch => (
                      <option key={ch.id} value={ch.number}>
                        Ch {ch.number}: {ch.titleEnglish}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Study Duration (Hours) *</label>
                  <input
                    type="number"
                    step="0.25"
                    min="0.25"
                    max="12"
                    required
                    value={sessionHours}
                    onChange={(e) => setSessionHours(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Topics Covered / Reflection Notes
                </label>
                <input
                  type="text"
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  placeholder="e.g. Differentiation Tangent formulas, CQ problem sets 1-5"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <p className="text-[11px] text-slate-400">
                  Submitting automatically writes a verified routine entry to today's Daily Log timeline.
                </p>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md shadow-purple-600/20 transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Log & Auto-Sync Routine</span>
                </button>
              </div>
            </form>
          </div>

          {/* Recent Study Sessions Log */}
          {studySessions.length > 0 && (
            <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
              <h4 className="text-sm font-bold text-slate-700">Recent Study Logs (Auto-Synced)</h4>
              <div className="space-y-2">
                {studySessions.slice(0, 4).map(s => (
                  <div key={s.id} className="p-3 bg-slate-50/70 border border-slate-200/60 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <strong className="text-slate-800">{s.bookName} - Chapter {s.chapterNumber}</strong>
                        <p className="text-slate-500">{s.notes}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-emerald-600">{s.durationHours} hrs</span>
                      <p className="text-[10px] text-slate-400">{s.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
};
