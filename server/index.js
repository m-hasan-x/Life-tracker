import dotenv from 'dotenv';
import cors from 'cors';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { db, initDatabase } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from process cwd and server/.env explicitly
dotenv.config();
dotenv.config({ path: path.join(__dirname, '.env') });

// Ensure database is initialized on startup
initDatabase();

const app = express();
const port = Number(process.env.PORT) || 5000;

// Setup persistent media storage directory
const mediaUploadsDir = path.join(__dirname, 'uploads', 'media');
if (!fs.existsSync(mediaUploadsDir)) {
  fs.mkdirSync(mediaUploadsDir, { recursive: true });
}

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use('/uploads/media', express.static(mediaUploadsDir));

const normalizeUserId = value => `@${String(value ?? '').trim().toLowerCase().replace(/^@+/, '')}`;

const publicUser = row => ({
  username: row.user_id,
  firstName: row.first_name,
  lastName: row.last_name,
  displayName: [row.first_name, row.last_name].filter(Boolean).join(' ') || row.user_id,
  email: row.email,
  phone: row.phone,
  avatar: null,
  role: 'Member',
  createdAt: row.created_at
});

const sendError = (res, status, message) => res.status(status).json({ error: message });

function hashPassword(password) {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  return `${salt.toString('hex')}:${hash.toString('hex')}`;
}

function verifyPassword(password, storedHash) {
  const [saltHex, hashHex] = String(storedHash ?? '').split(':');
  if (!saltHex || !hashHex || !/^(?:[0-9a-f]{2})+$/i.test(saltHex) || !/^(?:[0-9a-f]{2})+$/i.test(hashHex)) {
    return false;
  }
  const salt = Buffer.from(saltHex, 'hex');
  const expected = Buffer.from(hashHex, 'hex');
  const actual = scryptSync(password, salt, expected.length);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function parseJson(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

// ============================================================================
// SYSTEM & HEALTH ENDPOINTS
// ============================================================================
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'operational',
    service: 'Maksudul OS SQLite API',
    port,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/currency/rates', (_req, res) => {
  res.json({
    base_currency: 'USD',
    rates: {
      BDT: 120.0,
      USD: 1.0
    },
    last_updated: new Date().toISOString()
  });
});

// ============================================================================
// AUTHENTICATION ENDPOINTS
// ============================================================================
app.post('/api/auth/register', (req, res) => {
  const { firstName, lastName = '', username, email, phone = '', password } = req.body ?? {};
  if (![firstName, username, email, password].every(value => typeof value === 'string' && value.trim())) {
    return sendError(res, 400, 'First name, User ID, email, and password are required.');
  }
  const userId = normalizeUserId(username);
  if (!/^@[a-z0-9._-]{3,30}$/.test(userId)) {
    return sendError(res, 400, 'User ID must be 3 to 30 letters, numbers, dots, underscores, or hyphens.');
  }
  if (db.prepare('SELECT 1 FROM users WHERE user_id = ?').get(userId)) {
    return sendError(res, 409, 'This User ID is already taken. Please choose another.');
  }

  const formattedFirstName = firstName.trim().charAt(0).toUpperCase() + firstName.trim().slice(1);
  try {
    db.prepare(`
      INSERT INTO users (user_id, first_name, last_name, email, phone, password_hash)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(userId, formattedFirstName, String(lastName).trim(), email.trim().toLowerCase(), String(phone).trim(), hashPassword(password));
    const user = publicUser(db.prepare('SELECT * FROM users WHERE user_id = ?').get(userId));
    res.status(201).json({ user });
  } catch (error) {
    if (error?.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return sendError(res, 409, 'This User ID is already taken. Please choose another.');
    }
    console.error('Unable to register user:', error);
    sendError(res, 500, 'The account could not be created.');
  }
});

app.post('/api/auth/login', (req, res) => {
  const { identifier, password } = req.body ?? {};
  if (typeof identifier !== 'string' || typeof password !== 'string') {
    return sendError(res, 400, 'User ID or email and password are required.');
  }
  const user = db.prepare(`
    SELECT * FROM users
    WHERE user_id = ? OR lower(email) = lower(?)
  `).get(normalizeUserId(identifier), identifier.trim());
  if (!user || !verifyPassword(password, user.password_hash)) {
    return sendError(res, 401, 'User ID or email and password do not match.');
  }
  res.json({ user: publicUser(user) });
});

// ============================================================================
// USER PASSPORT & PROFILE ENDPOINTS
// ============================================================================
app.get('/api/passport/:userId', (req, res) => {
  const userId = normalizeUserId(req.params.userId);
  const row = db.prepare('SELECT profile_json, custom_fields_json FROM passports WHERE user_id = ?').get(userId);
  if (!row) return res.json({ passport: null });
  res.json({
    passport: {
      ...parseJson(row.profile_json, {}),
      customFields: parseJson(row.custom_fields_json, [])
    }
  });
});

app.post('/api/passport/save', (req, res) => {
  const { userId, passport } = req.body ?? {};
  if (typeof userId !== 'string' || !passport || typeof passport !== 'object' || Array.isArray(passport)) {
    return sendError(res, 400, 'User ID and passport data are required.');
  }
  const profile = { ...passport };
  delete profile.customFields;
  db.prepare(`
    INSERT INTO passports (user_id, profile_json, custom_fields_json, updated_at)
    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(user_id) DO UPDATE SET
      profile_json = excluded.profile_json,
      custom_fields_json = excluded.custom_fields_json,
      updated_at = CURRENT_TIMESTAMP
  `).run(
    normalizeUserId(userId),
    JSON.stringify(profile),
    JSON.stringify(Array.isArray(passport.customFields) ? passport.customFields : [])
  );
  res.json({ saved: true });
});

// ============================================================================
// FINANCIAL LEDGER & ACCOUNTS ENDPOINTS
// ============================================================================
app.get('/api/finance/:userId', (req, res) => {
  const userId = normalizeUserId(req.params.userId);
  const transactionRows = db.prepare('SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC, id DESC').all(userId);
  const accountRow = db.prepare('SELECT accounts_json FROM bank_accounts WHERE user_id = ?').get(userId);
  const transactions = transactionRows.map(row => ({
    ...parseJson(row.metadata_json, {}),
    id: row.transaction_id || String(row.id),
    type: row.type,
    amount: row.amount,
    currency: row.currency || 'BDT',
    amountUSD: row.amount_usd || (row.amount / 120.0),
    category: row.category,
    platform: row.account_name,
    recipient: row.sender_recipient,
    purpose: row.memo,
    date: row.date,
    receiptImage: row.receipt_image
  }));
  res.json({ transactions, accounts: parseJson(accountRow?.accounts_json, []) });
});

const saveTransaction = (req, res) => {
  const { userId, transaction } = req.body ?? {};
  if (typeof userId !== 'string' || !transaction || typeof transaction !== 'object' || Array.isArray(transaction)
    || !['expense', 'income', 'deposit', 'transfer'].includes(transaction.type)
    || !Number.isFinite(Number(transaction.amount))
    || typeof transaction.category !== 'string') {
    return sendError(res, 400, 'A valid user and transaction are required.');
  }
  const transactionId = String(transaction.id ?? '').trim();
  if (!transactionId) return sendError(res, 400, 'Transaction ID is required.');
  const details = JSON.stringify(transaction);
  db.prepare(`
    INSERT INTO transactions (
      user_id, type, amount, currency, amount_usd, category, account_name, sender_recipient, memo, date, transaction_id, receipt_image, metadata_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id, transaction_id) DO UPDATE SET
      type = excluded.type,
      amount = excluded.amount,
      currency = excluded.currency,
      amount_usd = excluded.amount_usd,
      category = excluded.category,
      account_name = excluded.account_name,
      sender_recipient = excluded.sender_recipient,
      memo = excluded.memo,
      date = excluded.date,
      receipt_image = excluded.receipt_image,
      metadata_json = excluded.metadata_json
  `).run(
    normalizeUserId(userId),
    transaction.type,
    Number(transaction.amount),
    transaction.currency || 'BDT',
    Number(transaction.amountUSD || (transaction.amount / 120.0)),
    transaction.category,
    transaction.platform ?? transaction.bankName ?? '',
    transaction.recipient ?? transaction.sender ?? '',
    transaction.purpose ?? transaction.memo ?? '',
    String(transaction.date ?? ''),
    transactionId,
    transaction.receiptImage || null,
    details
  );
  res.status(201).json({ saved: true, id: transactionId });
};

app.post('/api/finance/transaction', saveTransaction);
app.put('/api/finance/transaction', saveTransaction);

app.delete('/api/finance/transaction/:transactionId', (req, res) => {
  const userId = normalizeUserId(req.body?.userId ?? req.query.userId);
  const result = db.prepare('DELETE FROM transactions WHERE user_id = ? AND transaction_id = ?')
    .run(userId, req.params.transactionId);
  if (!result.changes) return sendError(res, 404, 'Transaction not found.');
  res.json({ deleted: true });
});

app.post('/api/finance/bank', (req, res) => {
  const { userId, accounts } = req.body ?? {};
  if (typeof userId !== 'string' || !Array.isArray(accounts)) {
    return sendError(res, 400, 'User ID and an accounts list are required.');
  }
  db.prepare(`
    INSERT INTO bank_accounts (user_id, accounts_json, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(user_id) DO UPDATE SET
      accounts_json = excluded.accounts_json,
      updated_at = CURRENT_TIMESTAMP
  `).run(normalizeUserId(userId), JSON.stringify(accounts));
  res.json({ saved: true });
});

// ============================================================================
// HABITS ENDPOINTS
// ============================================================================
app.get('/api/habits/:userId', (req, res) => {
  const userId = normalizeUserId(req.params.userId);
  const rows = db.prepare('SELECT * FROM habits WHERE user_id = ? ORDER BY id DESC').all(userId);
  const habits = rows.map(r => ({
    id: r.habit_id,
    name: r.name,
    category: r.category,
    frequency: r.frequency,
    timeSchedule: r.time_schedule,
    streak: r.streak,
    completedDates: parseJson(r.completed_dates_json, []),
    attachType: r.attach_type,
    attachFileName: r.attach_file_name,
    attachFileData: r.attach_file_data,
    createdAt: r.created_at
  }));
  res.json({ habits });
});

app.post('/api/habits', (req, res) => {
  const { userId, habit } = req.body ?? {};
  if (!userId || !habit || !habit.name) return sendError(res, 400, 'User ID and habit are required.');
  const habitId = String(habit.id || `hab_${Date.now()}`);

  db.prepare(`
    INSERT INTO habits (habit_id, user_id, name, category, frequency, time_schedule, streak, completed_dates_json, attach_type, attach_file_name, attach_file_data)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(habit_id) DO UPDATE SET
      name = excluded.name,
      category = excluded.category,
      frequency = excluded.frequency,
      time_schedule = excluded.time_schedule,
      streak = excluded.streak,
      completed_dates_json = excluded.completed_dates_json,
      attach_type = excluded.attach_type,
      attach_file_name = excluded.attach_file_name,
      attach_file_data = excluded.attach_file_data
  `).run(
    habitId,
    normalizeUserId(userId),
    habit.name,
    habit.category || 'cat_work',
    habit.frequency || 'daily',
    habit.timeSchedule || '',
    Number(habit.streak || 0),
    JSON.stringify(habit.completedDates || []),
    habit.attachType || 'note',
    habit.attachFileName || '',
    habit.attachFileData || null
  );

  res.status(201).json({ saved: true, id: habitId });
});

app.delete('/api/habits/:habitId', (req, res) => {
  const userId = normalizeUserId(req.body?.userId ?? req.query.userId);
  const result = db.prepare('DELETE FROM habits WHERE user_id = ? AND habit_id = ?').run(userId, req.params.habitId);
  if (!result.changes) return sendError(res, 404, 'Habit not found.');
  res.json({ deleted: true });
});

// ============================================================================
// TASKS (KANBAN) ENDPOINTS
// ============================================================================
app.get('/api/tasks/:userId', (req, res) => {
  const userId = normalizeUserId(req.params.userId);
  const tasks = db.prepare('SELECT * FROM tasks WHERE user_id = ? ORDER BY id DESC').all(userId);
  res.json({ tasks });
});

app.post('/api/tasks', (req, res) => {
  const { userId, task } = req.body ?? {};
  if (!userId || !task || !task.title) return sendError(res, 400, 'User ID and task title are required.');
  const taskId = String(task.id || `task_${Date.now()}`);

  db.prepare(`
    INSERT INTO tasks (task_id, user_id, title, priority, status, due_date)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(task_id) DO UPDATE SET
      title = excluded.title,
      priority = excluded.priority,
      status = excluded.status,
      due_date = excluded.due_date
  `).run(
    taskId,
    normalizeUserId(userId),
    task.title,
    task.priority || 'MEDIUM',
    task.status || 'todo',
    task.dueDate || null
  );

  res.status(201).json({ saved: true, id: taskId });
});

app.delete('/api/tasks/:taskId', (req, res) => {
  const userId = normalizeUserId(req.body?.userId ?? req.query.userId);
  const result = db.prepare('DELETE FROM tasks WHERE user_id = ? AND task_id = ?').run(userId, req.params.taskId);
  if (!result.changes) return sendError(res, 404, 'Task not found.');
  res.json({ deleted: true });
});

// ============================================================================
// MEDIA & PRACTICE LOGS ENDPOINTS
// ============================================================================
app.get('/api/logs/:userId', (req, res) => {
  const userId = normalizeUserId(req.params.userId);
  const rows = db.prepare('SELECT * FROM logs WHERE user_id = ? ORDER BY id DESC').all(userId);
  const logs = rows.map(r => ({
    id: r.log_id,
    type: r.type,
    topic: r.topic,
    language: r.language,
    rating: r.rating,
    notes: r.notes,
    mediaUrl: r.media_url,
    durationSeconds: r.duration_seconds,
    timestamp: r.created_at
  }));
  res.json({ logs });
});

app.post('/api/logs', (req, res) => {
  const { userId, log } = req.body ?? {};
  if (!userId || !log) return sendError(res, 400, 'User ID and log data are required.');
  const logId = String(log.id || `log_${Date.now()}`);

  db.prepare(`
    INSERT INTO logs (log_id, user_id, type, topic, language, rating, notes, media_url, duration_seconds)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(log_id) DO UPDATE SET
      type = excluded.type,
      topic = excluded.topic,
      language = excluded.language,
      rating = excluded.rating,
      notes = excluded.notes,
      media_url = excluded.media_url,
      duration_seconds = excluded.duration_seconds
  `).run(
    logId,
    normalizeUserId(userId),
    log.type || 'video',
    log.topic || '',
    log.language || 'English',
    Number(log.rating || 5),
    log.notes || '',
    log.mediaUrl || '',
    Number(log.durationSeconds || 0)
  );

  res.status(201).json({ saved: true, id: logId });
});

app.delete('/api/logs/:logId', (req, res) => {
  const userId = normalizeUserId(req.body?.userId ?? req.query.userId);
  const result = db.prepare('DELETE FROM logs WHERE user_id = ? AND log_id = ?').run(userId, req.params.logId);
  if (!result.changes) return sendError(res, 404, 'Log not found.');
  res.json({ deleted: true });
});

// ============================================================================
// STUDY SESSIONS & ROUTINE AUTO-SYNC ENDPOINTS
// ============================================================================
app.get('/api/study/:userId', (req, res) => {
  const userId = normalizeUserId(req.params.userId);
  const rows = db.prepare('SELECT * FROM study_sessions WHERE user_id = ? ORDER BY id DESC').all(userId);
  const sessions = rows.map(r => ({
    id: r.session_id,
    date: r.date,
    bookId: r.book_id,
    bookName: r.book_name,
    chapterNumber: r.chapter_number,
    chapterTitle: r.chapter_title,
    durationHours: r.duration_hours,
    notes: r.notes,
    timestamp: r.created_at
  }));
  res.json({ sessions });
});

app.post('/api/study/sync-routine', (req, res) => {
  const { userId, session } = req.body ?? {};
  if (!userId || !session) return sendError(res, 400, 'User ID and session data are required.');
  
  const uId = normalizeUserId(userId);
  const sessionId = String(session.id || `std_${Date.now()}`);
  const today = session.date || new Date().toISOString().split('T')[0];
  const duration = Number(session.durationHours || 1.0);
  const formattedText = `Studied ${session.bookName || 'HSC Textbook'} - Chapter ${session.chapterNumber || 1} (${duration} hrs)`;

  // 1. Record study session
  db.prepare(`
    INSERT INTO study_sessions (session_id, user_id, book_id, book_name, chapter_number, chapter_title, duration_hours, notes, date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(session_id) DO UPDATE SET
      duration_hours = excluded.duration_hours,
      notes = excluded.notes
  `).run(
    sessionId,
    uId,
    session.bookId || '',
    session.bookName || '',
    Number(session.chapterNumber || 1),
    session.chapterTitle || '',
    duration,
    session.notes || '',
    today
  );

  // 2. Auto-sync to Daily Routine timeline
  const existing = db.prepare('SELECT * FROM routines WHERE user_id = ? AND date = ?').get(uId, today);
  if (existing) {
    const updatedSchedule = existing.daily_schedule ? `${existing.daily_schedule}, ${formattedText}` : formattedText;
    const updatedStudy = existing.study + duration;
    const updatedNotes = existing.chapter_notes ? `${existing.chapter_notes} | ${session.notes || ''}` : (session.notes || '');
    db.prepare(`
      UPDATE routines 
      SET daily_schedule = ?, study = ?, chapter_notes = ?, saved_at = CURRENT_TIMESTAMP
      WHERE user_id = ? AND date = ?
    `).run(updatedSchedule, updatedStudy, updatedNotes, uId, today);
  } else {
    db.prepare(`
      INSERT INTO routines (routine_id, user_id, date, daily_schedule, study, sleep, gym, prayer, work, learned)
      VALUES (?, ?, ?, ?, ?, 7.0, 1.0, 1.5, 3.0, ?)
    `).run(`rtn_${Date.now()}`, uId, today, formattedText, duration, formattedText);
  }

  res.json({ 
    synced: true, 
    sessionId, 
    routineText: formattedText,
    hoursCredited: duration 
  });
});

app.get('/api/routines/:userId', (req, res) => {
  const userId = normalizeUserId(req.params.userId);
  const rows = db.prepare('SELECT * FROM routines WHERE user_id = ? ORDER BY date DESC').all(userId);
  const routines = rows.map(r => ({
    id: r.routine_id,
    date: r.date,
    dailySchedule: r.daily_schedule,
    sleep: r.sleep,
    study: r.study,
    gym: r.gym,
    prayer: r.prayer,
    sports: r.sports,
    work: r.work,
    dietLog: r.diet_log,
    goodDeeds: r.good_deeds,
    learned: r.learned,
    chapterNotes: r.chapter_notes,
    books: r.books,
    savedAt: r.saved_at
  }));
  res.json({ routines });
});

// ============================================================================
// ACADEMIC PROFILES ENDPOINTS
// ============================================================================
app.get('/api/academic/:userId', (req, res) => {
  const row = db.prepare('SELECT * FROM academic_profiles WHERE user_id = ?').get(normalizeUserId(req.params.userId));
  if (!row) return res.json({ academic: null });
  res.json({
    academic: {
      academicCountry: row.country,
      academicLevel: row.level,
      academicGroup: row.academic_group,
      academicSubjects: parseJson(row.subjects_json, [])
    }
  });
});

app.post('/api/academic/save', (req, res) => {
  const { userId, academic } = req.body ?? {};
  if (typeof userId !== 'string' || !academic || typeof academic !== 'object' || Array.isArray(academic)) {
    return sendError(res, 400, 'User ID and academic profile are required.');
  }
  db.prepare(`
    INSERT INTO academic_profiles (user_id, country, level, academic_group, subjects_json)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET
      country = excluded.country,
      level = excluded.level,
      academic_group = excluded.academic_group,
      subjects_json = excluded.subjects_json
  `).run(
    normalizeUserId(userId),
    String(academic.academicCountry ?? ''),
    String(academic.academicLevel ?? ''),
    String(academic.academicGroup ?? ''),
    JSON.stringify(Array.isArray(academic.academicSubjects) ? academic.academicSubjects : [])
  );
  res.json({ saved: true });
});

// ============================================================================
// MEDIA STORAGE & PERMANENCE ENDPOINTS
// ============================================================================
app.post('/api/media/upload', (req, res) => {
  const { dataUrl, filename: preferredName, type = 'video' } = req.body ?? {};
  if (!dataUrl || typeof dataUrl !== 'string') {
    return sendError(res, 400, 'dataUrl is required for media upload.');
  }

  try {
    const ext = type === 'voice' ? 'webm' : 'webm';
    const filename = preferredName
      ? preferredName.replace(/[^a-zA-Z0-9._-]/g, '_')
      : `media_${Date.now()}_${randomBytes(4).toString('hex')}.${ext}`;

    const filePath = path.join(mediaUploadsDir, filename);
    const base64Data = dataUrl.replace(/^data:[^;]+;base64,/, '');
    fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));

    const publicUrl = `/uploads/media/${filename}`;
    res.json({
      success: true,
      filename,
      url: publicUrl
    });
  } catch (err) {
    console.error('Media upload error:', err);
    sendError(res, 500, 'Failed to save media recording to server disk.');
  }
});

app.get('/api/media/download/:filename', (req, res) => {
  const safeFilename = path.basename(req.params.filename);
  const filePath = path.join(mediaUploadsDir, safeFilename);
  if (!fs.existsSync(filePath)) {
    return sendError(res, 404, 'Media file not found on server.');
  }
  res.download(filePath, safeFilename);
});

// ============================================================================
// ERROR HANDLERS & SERVER STARTUP
// ============================================================================
app.use((_req, res) => {
  sendError(res, 404, 'API endpoint not found.');
});

app.use((error, _req, res, _next) => {
  console.error('Unhandled local API error:', error);
  res.status(500).json({ error: 'An unexpected local API error occurred.' });
});

app.listen(port, '127.0.0.1', () => {
  console.log(`[Express] Local SQLite API server listening at http://localhost:${port}`);
});
