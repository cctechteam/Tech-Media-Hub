/**
 * Database Configuration and Schema Setup
 * 
 * This module handles the SQLite database initialization and schema creation
 * for the Tech Media Hub beadle slip management system. It uses better-sqlite3
 * for high-performance synchronous database operations.
 * 
 * Database Tables:
 * - members: User accounts and authentication
 * - announcements: System-wide announcements and notices
 * - sessions: User session management and tokens
 * - beedle_slips: Core attendance data from student reports
 * 
 * @author Tech Media Hub Team
 * @version 1.0
 * @since 2024
 */

"use server";
import Database from "better-sqlite3";

// Initialize SQLite database connection
// Database file is stored in the project root as db.sqlite
const db = new Database("db.sqlite");

/**
 * Database Schema Creation
 * 
 * The following CREATE TABLE statements define the complete database schema.
 * Tables are created with IF NOT EXISTS to prevent errors on subsequent runs.
 */
// Members Table: User accounts and authentication
// Stores user credentials, roles, and basic profile information
db.prepare(`
  CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,    -- Unique user identifier
    full_name TEXT NOT NULL DEFAULT "",      -- User's full name
    email TEXT UNIQUE NOT NULL,              -- Email address (unique login)
    password TEXT NOT NULL,                  -- Hashed password
    role INTEGER NOT NULL DEFAULT 0,         -- Legacy role field (kept for compatibility)
    roles TEXT DEFAULT '["student"]',        -- JSON array of roles (tag-based system)
    form_class TEXT,                         -- Student's form class assignment
    created_at TEXT DEFAULT CURRENT_TIMESTAMP, -- Account creation timestamp
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP  -- Last update timestamp
  )
`).run();

// Add new columns to existing members table if they don't exist
// This handles database migration for existing installations
try {
  db.prepare(`ALTER TABLE members ADD COLUMN roles TEXT DEFAULT '["student"]'`).run();
} catch (e) {
  // Column already exists, ignore error
}

try {
  db.prepare(`ALTER TABLE members ADD COLUMN form_class TEXT`).run();
} catch (e) {
  // Column already exists, ignore error
}

try {
  db.prepare(`ALTER TABLE members ADD COLUMN created_at TEXT DEFAULT CURRENT_TIMESTAMP`).run();
} catch (e) {
  // Column already exists, ignore error
}

try {
  db.prepare(`ALTER TABLE members ADD COLUMN updated_at TEXT`).run();
} catch (e) {
  // Column already exists, ignore error
}

// Ensure updated_at column exists with a more robust check
try {
  const tableInfo = db.prepare("PRAGMA table_info(members)").all() as any[];
  const hasUpdatedAt = tableInfo.some(column => column.name === 'updated_at');
  
  if (!hasUpdatedAt) {
    // SQLite doesn't allow non-constant defaults in ALTER TABLE, so we add the column without default
    db.prepare(`ALTER TABLE members ADD COLUMN updated_at TEXT`).run();
    
    // Then update existing rows to have the current timestamp
    const currentTimestamp = new Date().toISOString();
    db.prepare(`UPDATE members SET updated_at = ? WHERE updated_at IS NULL`).run(currentTimestamp);
    
    console.log("Added updated_at column to members table");
  }
} catch (e) {
  console.log("Could not add updated_at column:", e);
}

// Announcements Table: System-wide notices and updates
// Used for displaying important information to users
db.prepare(`
  CREATE TABLE IF NOT EXISTS announcements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,    -- Unique announcement ID
    title TEXT NOT NULL,                     -- Announcement title
    priority TEXT NOT NULL,                  -- Priority level (high, medium, low)
    content TEXT NOT NULL,                   -- Full announcement content
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP -- Creation timestamp
  )
`).run();

// Sessions Table: User session management
// Tracks active user sessions for authentication
db.prepare(`
  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,    -- Unique session ID
    userId INTEGER NOT NULL,                 -- Reference to members.id
    token TEXT UNIQUE NOT NULL,              -- Unique session token
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,-- Session creation time
    FOREIGN KEY (userId) REFERENCES members(id) ON DELETE CASCADE
  )
`).run();

// Beedle Slips Table: Core attendance data
// Stores all attendance reports submitted by students (beedles)
db.prepare(`
  CREATE TABLE IF NOT EXISTS beedle_slips (
    id INTEGER PRIMARY KEY AUTOINCREMENT,    -- Unique slip ID
    beedle_email TEXT NOT NULL,              -- Email of reporting student
    grade_level TEXT NOT NULL,               -- Form level (1st Form, 2nd Form, etc.)
    class_name TEXT NOT NULL,                -- Class section (4C, Homeroom, etc.)
    class_start_time TEXT NOT NULL,          -- Scheduled start time
    class_end_time TEXT NOT NULL,            -- Calculated end time
    date TEXT NOT NULL,                      -- Date of class (YYYY-MM-DD)
    teacher TEXT NOT NULL,                   -- Assigned teacher name
    subject TEXT NOT NULL,                   -- Subject being taught
    teacher_present TEXT NOT NULL,           -- Teacher presence (yes/no)
    teacher_arrival_time TEXT,               -- Time teacher arrived (if present)
    substitute_received TEXT,                -- Substitute provided (yes/no)
    homework_given TEXT NOT NULL,            -- Homework assigned (yes/no)
    students_present INTEGER NOT NULL,       -- Count of present students
    absent_students TEXT,                    -- JSON array of absent student names
    late_students TEXT,                      -- JSON array of late student names
    created_at TEXT DEFAULT CURRENT_TIMESTAMP -- Submission timestamp
  )
`).run();

// Tasks Table: Project and task management
// Stores tasks assigned to users with status tracking
db.prepare(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,    -- Unique task ID
    title TEXT NOT NULL,                     -- Task title
    description TEXT,                        -- Task description
    assigned_to INTEGER,                     -- User ID task is assigned to
    created_by INTEGER NOT NULL,            -- User ID who created the task
    status TEXT NOT NULL DEFAULT 'pending', -- Task status (pending, in_progress, completed)
    priority TEXT NOT NULL DEFAULT 'medium',-- Priority (high, medium, low)
    due_date TEXT,                          -- Due date (YYYY-MM-DD)
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_to) REFERENCES members(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES members(id) ON DELETE CASCADE
  )
`).run();

// Events Table: Calendar events and activities
// Stores scheduled events and activities
db.prepare(`
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,    -- Unique event ID
    title TEXT NOT NULL,                     -- Event title
    description TEXT,                        -- Event description
    event_date TEXT NOT NULL,               -- Event date (YYYY-MM-DD)
    start_time TEXT,                        -- Start time (HH:MM)
    end_time TEXT,                          -- End time (HH:MM)
    location TEXT,                          -- Event location
    created_by INTEGER NOT NULL,            -- User ID who created the event
    event_type TEXT DEFAULT 'general',     -- Event type (meeting, workshop, general, etc.)
    status TEXT DEFAULT 'upcoming',         -- Status (upcoming, ongoing, completed, cancelled)
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES members(id) ON DELETE CASCADE
  )
`).run();

// Messages Table: Team communication system
// Stores messages between team members
db.prepare(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,    -- Unique message ID
    sender_id INTEGER NOT NULL,              -- User ID of sender
    recipient_id INTEGER,                    -- User ID of recipient (NULL for broadcast)
    subject TEXT,                           -- Message subject
    content TEXT NOT NULL,                  -- Message content
    message_type TEXT DEFAULT 'direct',    -- Type (direct, broadcast, announcement)
    is_read BOOLEAN DEFAULT FALSE,          -- Read status
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES members(id) ON DELETE CASCADE,
    FOREIGN KEY (recipient_id) REFERENCES members(id) ON DELETE CASCADE
  )
`).run();

/**
 * Database Access Function
 * 
 * Provides access to the initialized SQLite database instance.
 * This function is used by other modules to perform database operations.
 * 
 * @returns The better-sqlite3 database instance
 */
export async function getDatabase() {
    return db;
};
