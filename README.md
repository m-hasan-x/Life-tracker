# Maksudul — Personal Productivity & Growth OS

> An enterprise-grade, React-focused personal development application built to demonstrate modern, idiomatic React architecture, reusable component design, custom hooks, and reliable offline data persistence.

---

## 🌟 Executive Overview

**Maksudul Productivity OS** is a unified personal development system designed for students, developers, and knowledge professionals. The application provides an integrated workspace for habit cultivation, academic study planning, milestone goal tracking, speech and presentation practice, financial ledger management, and cognitive performance analytics.

The frontend is constructed exclusively with **React 18**, **TypeScript**, and **Tailwind CSS**, emphasizing clean functional components, clear separation of concerns, and accessible user experience without bloated third-party framework dependencies.

---

## ⚛️ React Architecture & Design Patterns

This repository demonstrates practical, industry-standard React engineering practices:

### 1. Functional Components & Component Composition
- The entire user interface is broken down into single-responsibility functional components located in `src/components/`.
- Complex dashboards compose smaller UI building blocks, avoiding deeply nested JSX or monolithic components.
- Standardized modal components (`FinanceModal`, `MediaStudio`, `ProfileModal`, `UserPassport`) leverage portal-like fixed overlays and fluid image lightboxes.

### 2. React Hooks in Action
| React Hook | Practical Implementation in Project |
| :--- | :--- |
| **`useState`** | Manages local UI interactions, controlled form inputs, modal visibility, and active navigation filters. |
| **`useEffect`** | Synchronizes user data to browser `localStorage`, revives offline IndexedDB media URLs, and initiates data sync cycles. |
| **`useRef`** | Binds direct references to the MacBook `<video>` stream, `MediaRecorder` instances, audio visualizer states, and file upload triggers. |
| **`useMemo`** | Computes expensive aggregations such as financial net balance (BDT/USD conversion), 7-day habit velocity percentages, and debounced list search queries. |
| **`useCallback`** | Memoizes media recorder action handlers (`startRecording`, `stopRecording`, `clearTimer`) to avoid unnecessary re-renders in real-time recording cycles. |
| **`useContext`** | Drives global authentication and user passport profile state via `AuthContext`. |

### 3. Custom React Hooks (`src/hooks/`)
To keep UI components focused purely on presentation, repeated logic is extracted into reusable custom hooks:
- **`useLocalStorage<T>(key, initialValue)`**: Type-safe hook that automatically synchronizes state with `window.localStorage` and manages error boundaries.
- **`useDebounce<T>(value, delay)`**: Delays search query processing until the user finishes typing (applied to Tips, Expenses, and Habit search).
- **`useMediaRecorder(type)`**: Encapsulates browser `MediaStream` and `MediaRecorder` APIs, handling microphone/webcam permissions, chunk aggregation, recording timer ticks, and track cleanup upon component unmount.

---

## 🚀 Key Modules & Capabilities

### 1. Habit Tracker & Stacking Engine
- **6 Core Editable Sample Habits**: Pre-populated with practical habits (Reading, Exercise, Skill Learning, Speaking Practice, Deep Work, and Evening Reflection) that can be edited, renamed, or deleted at any time.
- **Habit Stacking**: Connects existing daily triggers to new habits using James Clear's stacking framework.
- **3-Minute Box Breathing Reset**: An interactive visual breathing guide (Inhale, Hold, Exhale) for stress relief and focus reset.
- **Streak Counters & Attachments**: Attach documents, notes, or web links directly to each habit card.

### 2. Milestone Goals System (`GoalsSection`)
- Organizes objectives across **Daily**, **Weekly**, and **Long-Term** time horizons.
- Interactive progress sliders with quick increments (`+10%`, `+25%`, `Complete`).
- Categorization across Academic, Career, Communication, and Personal Growth.

### 3. History & Performance Analytics (`HistoryAnalytics`)
- **Key Metrics**: 7-Day Completion Velocity, Average Streak Length, Total Check-ins, and Focus Distribution.
- **SVG Velocity Chart**: Native 7-day completion bar chart without heavyweight chart library overhead.
- **30-Day Heatmap Grid**: Visual consistency matrix tracking daily habit completion patterns.
- **Domain Focus Bars**: Quantitative distribution across Work, Mind, Health, Learning, and Speaking.

### 4. Speaking Practice & Media Studio (`MediaStudio`)
- **MacBook Webcam & Voice Studio**: Record video presentations or vocal speech rehearsals directly in the browser via HTML5 MediaRecorder.
- **Speech Language Selector**: Toggle between Bengali, English (US), English (UK), or add custom languages.
- **Performance Self-Review**: 1-to-5 star rating and vocal pacing feedback notes.
- **Persistent IndexedDB Storage**: Video files are automatically saved to client IndexedDB (`videoStorage.ts`), bypassing `localStorage` 5MB quota restrictions and enabling offline playback and direct downloads.

### 5. Growth & Productivity Tips (`TipsSection`)
- Curated principles across **Public Speaking**, **Productivity**, **Mindset & Stoicism**, and **Wellness**.
- Search with instant debouncing (`useDebounce`) and category filtering.
- Ability to bookmark favorite tips and author custom growth principles.

### 6. Notifications & Reminder Center (`NotificationsSection`)
- Unread badge counter visible in the top universal header.
- Filter notifications by type: Habit Reminders, Goal Deadlines, Daily Tasks, and Activity Updates.
- Preference control toggles for reminder times, sound effects, and notification categories.

### 7. Expense Tracker & Multi-Currency Ledger (`ExpenseTrackerSection`)
- Daily income, expense, and account balance monitoring.
- Multi-currency support: Bangladeshi Taka (৳ BDT) and US Dollars ($ USD) with automatic conversion.
- Country presets for Bangladesh and the United States.
- Slip and receipt image attachments with full-screen fluid lightbox viewer.

### 8. Academic Study & Plan (`StudyAndPlan`)
- Syllabus tracking for higher secondary and undergraduate subjects (Physics, Higher Mathematics, Chemistry).
- Study session logger with duration hours, chapter numbers, and topic notes.
- **Auto-Sync Engine**: Study sessions automatically append formatted entries into the **Daily Routine & Reflection Logs** timeline.

---

## 📂 Project Directory Structure

```text
5710/
├── dist/                     # Optimized production bundle
├── public/                   # Static assets & favicon
├── server/                   # Optional SQLite & Express persistence backend
│   ├── database.sqlite       # Local database
│   ├── db.js                 # Database schema initialization
│   ├── index.js              # Express REST endpoints
│   ├── .env.example          # Server environment sample
│   └── uploads/              # Local media files
├── src/
│   ├── assets/               # Local icons and imagery
│   ├── components/           # Reusable React UI Components
│   │   ├── AcademicSelector.tsx      # HSC / Academic syllabus selector
│   │   ├── AuthModal.tsx             # Login / account modal
│   │   ├── ExpenseTrackerSection.tsx # Daily expenses & balance dashboard
│   │   ├── FinanceLedger.tsx         # Account balances & category manager
│   │   ├── FinanceModal.tsx          # Transfer & transaction entry modal
│   │   ├── GoalsSection.tsx          # Daily/weekly/long-term goal manager
│   │   ├── HabitTracker.tsx          # Habit grid, stacks & breathing guide
│   │   ├── HistoryAnalytics.tsx      # 7-day chart & 30-day heatmap
│   │   ├── MediaStudio.tsx           # Webcam/voice studio with IndexedDB
│   │   ├── NotificationsSection.tsx  # Reminder alerts & preference panel
│   │   ├── ProfileModal.tsx          # User settings & security drawer
│   │   ├── StudyAndPlan.tsx          # Syllabus logger & routine sync engine
│   │   ├── TipsSection.tsx           # Growth principles & speech guide
│   │   └── UserPassport.tsx          # Profile & academic credential card
│   ├── context/
│   │   └── AuthContext.tsx           # Authentication Context & Provider
│   ├── hooks/
│   │   ├── index.ts                  # Export barrel
│   │   ├── useDebounce.ts            # Search input debouncing
│   │   ├── useLocalStorage.ts        # Synchronized localStorage hook
│   │   └── useMediaRecorder.ts       # Browser audio/video recording hook
│   ├── services/
│   │   ├── api.ts                    # REST client & error handling
│   │   └── videoStorage.ts           # IndexedDB offline binary storage
│   ├── types/
│   │   ├── auth.ts                   # Auth credentials & user types
│   │   └── index.ts                  # Habit, Goal, Transaction, Tip interfaces
│   ├── App.tsx                       # Main workspace router & state container
│   ├── index.css                     # Tailwind CSS & glassmorphic aesthetics
│   └── main.tsx                      # React root entry point
├── package.json              # Project dependencies & npm scripts
├── tailwind.config.js        # Emerald/Teal/Slate design tokens
├── tsconfig.json             # TypeScript compiler settings
└── vite.config.ts            # Vite bundler configuration
```

---

## 🎨 Visual Identity & Color Palette

The interface preserves a clean **emerald glassmorphism** design language:
- **Primary Emerald**: `#059669` / `#10b981` (growth, streaks, active tabs)
- **Teal Accent**: `#0d9488` / `#14b8a6` (gradients, balance indicators)
- **Deep Slate**: `#0f172a` / `#1e293b` (headings, high-contrast typography)
- **Glass Surfaces**: `rgba(255, 255, 255, 0.85)` with `backdrop-blur-xl` and subtle `rgba(226, 232, 240, 0.8)` borders.

---

## 💻 Getting Started Locally

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Installation & Run

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/maksudul-productivity-os.git
   cd maksudul-productivity-os
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   # Starts Vite frontend (http://localhost:5173) and local Express server (http://localhost:5000)
   npm run dev
   ```

   Alternatively, run only the frontend:
   ```bash
   npm run dev:client
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```
   Compiles TypeScript without errors and outputs optimized bundles to `dist/`.

5. **Preview production build**:
   ```bash
   npm run preview
   ```

---

## 🛡️ License

This project is licensed under the MIT License — feel free to explore, learn from, and adapt for personal growth and academic workflows.
