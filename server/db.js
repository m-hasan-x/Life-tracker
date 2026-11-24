import Database from 'better-sqlite3';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const serverDirectory = path.dirname(fileURLToPath(import.meta.url));
const databasePath = process.env.DATABASE_PATH 
  ? (path.isAbsolute(process.env.DATABASE_PATH) 
      ? process.env.DATABASE_PATH 
      : path.join(serverDirectory, process.env.DATABASE_PATH))
  : path.join(serverDirectory, 'database.sqlite');

export let db = null;

export function initDatabase() {
  if (db) return db;

  try {
    db = new Database(databasePath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');

    db.exec(`
      -- Users table
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT UNIQUE NOT NULL,
        first_name TEXT,
        last_name TEXT,
        email TEXT,
        phone TEXT,
        password_hash TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- User Passports table
      CREATE TABLE IF NOT EXISTS passports (
        user_id TEXT PRIMARY KEY,
        profile_json TEXT,
        custom_fields_json TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
      );

      -- Tasks (Kanban / Todo) table
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_id TEXT UNIQUE,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        priority TEXT DEFAULT 'MEDIUM',
        status TEXT DEFAULT 'todo',
        due_date TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Habits table
      CREATE TABLE IF NOT EXISTS habits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        habit_id TEXT UNIQUE NOT NULL,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        category TEXT,
        frequency TEXT DEFAULT 'daily',
        time_schedule TEXT,
        streak INTEGER DEFAULT 0,
        completed_dates_json TEXT DEFAULT '[]',
        attach_type TEXT,
        attach_file_name TEXT,
        attach_file_data TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Activity & Practice Logs table
      CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        log_id TEXT UNIQUE,
        user_id TEXT NOT NULL,
        type TEXT,
        topic TEXT,
        language TEXT,
        rating INTEGER DEFAULT 5,
        notes TEXT,
        media_url TEXT,
        duration_seconds INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Financial Transactions table
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        type TEXT,
        amount REAL NOT NULL,
        currency TEXT DEFAULT 'BDT',
        amount_usd REAL,
        category TEXT,
        account_name TEXT,
        sender_recipient TEXT,
        memo TEXT,
        date TEXT NOT NULL,
        transaction_id TEXT NOT NULL,
        receipt_image TEXT,
        metadata_json TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, transaction_id)
      );

      -- Academic Profiles table
      CREATE TABLE IF NOT EXISTS academic_profiles (
        user_id TEXT PRIMARY KEY,
        country TEXT,
        level TEXT,
        academic_group TEXT,
        subjects_json TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Bank & Mobile Banking Accounts table
      CREATE TABLE IF NOT EXISTS bank_accounts (
        user_id TEXT PRIMARY KEY,
        accounts_json TEXT NOT NULL DEFAULT '[]',
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Study Sessions table (HSC Science Tracker)
      CREATE TABLE IF NOT EXISTS study_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT UNIQUE,
        user_id TEXT NOT NULL,
        book_id TEXT,
        book_name TEXT,
        chapter_number INTEGER,
        chapter_title TEXT,
        duration_hours REAL DEFAULT 1.0,
        notes TEXT,
        date TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Daily Routines table (Synced with Study Sessions)
      CREATE TABLE IF NOT EXISTS routines (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        routine_id TEXT UNIQUE,
        user_id TEXT NOT NULL,
        date TEXT NOT NULL,
        daily_schedule TEXT,
        sleep REAL DEFAULT 7.5,
        study REAL DEFAULT 0.0,
        gym REAL DEFAULT 1.0,
        prayer REAL DEFAULT 1.5,
        sports REAL DEFAULT 0.5,
        work REAL DEFAULT 3.0,
        diet_log TEXT,
        good_deeds TEXT,
        learned TEXT,
        chapter_notes TEXT,
        books TEXT,
        saved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, date)
      );
    `);

    console.log(`[SQLite] Database successfully initialized at: ${databasePath}`);
    return db;
  } catch (error) {
    console.error('[SQLite] Failed to initialize database:', error);
    throw error;
  }
}

// Auto-initialize on module load
initDatabase();
