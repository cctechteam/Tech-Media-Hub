"use server";
import Database from "better-sqlite3";

const db = new Database("db.sqlite");

db.prepare(`
  CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL DEFAULT "",
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    form_class TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role_name TEXT UNIQUE NOT NULL,
    role_type TEXT NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    permission_level INTEGER NOT NULL DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS member_roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL,
    role_id INTEGER NOT NULL,
    assigned_at TEXT DEFAULT CURRENT_TIMESTAMP,
    assigned_by INTEGER,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES members(id) ON DELETE SET NULL,
    UNIQUE(member_id, role_id)
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    token TEXT UNIQUE NOT NULL,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES members(id) ON DELETE CASCADE
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS beadle_slips (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    beadle_email TEXT NOT NULL,
    grade_level TEXT NOT NULL,
    class_name TEXT NOT NULL,
    class_start_time TEXT NOT NULL,
    class_end_time TEXT NOT NULL,
    date TEXT NOT NULL,
    teacher TEXT NOT NULL,
    subject TEXT NOT NULL,
    teacher_present TEXT NOT NULL,
    teacher_arrival_time TEXT,
    substitute_received TEXT,
    homework_given TEXT NOT NULL,
    students_present INTEGER NOT NULL,
    absent_students TEXT,
    late_students TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`).run();

const seedRoles = [
  { name: 'student', type: 'primary', display: 'Student', desc: 'Regular student', level: 1 },
  { name: 'beadle', type: 'sub', display: 'Beadle', desc: 'Student attendance monitor', level: 2 },

  { name: 'staff', type: 'primary', display: 'Staff', desc: 'School staff member', level: 3 },
  { name: 'teacher', type: 'sub', display: 'Teacher', desc: 'Teaching staff', level: 3 },
  { name: 'ancillary', type: 'sub', display: 'Ancillary Staff', desc: 'Support staff', level: 3 },
  
  { name: 'supervisor', type: 'primary', display: 'Supervisor', desc: 'Form supervisor', level: 4 },
  { name: 'supervisor_1', type: 'sub', display: 'Form 1 Supervisor', desc: 'Supervises Form 1', level: 4 },
  { name: 'supervisor_2', type: 'sub', display: 'Form 2 Supervisor', desc: 'Supervises Form 2', level: 4 },
  { name: 'supervisor_3', type: 'sub', display: 'Form 3 Supervisor', desc: 'Supervises Form 3', level: 4 },
  { name: 'supervisor_4', type: 'sub', display: 'Form 4 Supervisor', desc: 'Supervises Form 4', level: 4 },
  { name: 'supervisor_5', type: 'sub', display: 'Form 5 Supervisor', desc: 'Supervises Form 5', level: 4 },
  { name: 'supervisor_6', type: 'sub', display: 'Form 6 Supervisor', desc: 'Supervises Form 6B', level: 4 },
  { name: 'supervisor_6a', type: 'sub', display: 'Form 6A Supervisor', desc: 'Supervises Form 6A', level: 4 },

  { name: 'tech_team', type: 'primary', display: 'Tech Team', desc: 'Technology team member', level: 5 },
  { name: 'tech_team_member', type: 'sub', display: 'Tech Team Member', desc: 'Regular tech team member', level: 5 },
  { name: 'tech_team_junior_vice_president', type: 'sub', display: 'Tech Team Junior VP', desc: 'Junior Vice President', level: 6 },
  { name: 'tech_team_vice_president', type: 'sub', display: 'Tech Team VP', desc: 'Vice President', level: 7 },
  { name: 'tech_team_president', type: 'sub', display: 'Tech Team President', desc: 'President', level: 8 },

  { name: 'admin', type: 'primary', display: 'Admin', desc: 'Administrator', level: 9 },
  { name: 'dean_of_discipline', type: 'sub', display: 'Dean of Discipline', desc: 'Dean of Discipline', level: 9 },
  { name: 'vice_principal', type: 'sub', display: 'Vice Principal', desc: 'Vice Principal', level: 10 },
  { name: 'principal', type: 'sub', display: 'Principal', desc: 'School Principal', level: 11 }
];

const insertRole = db.prepare(`
  INSERT OR IGNORE INTO roles (role_name, role_type, display_name, description, permission_level)
  VALUES (?, ?, ?, ?, ?)
`);

for (const role of seedRoles) {
  insertRole.run(role.name, role.type, role.display, role.desc, role.level);
}

console.log("✓ Database initialized successfully");
console.log(`✓ ${seedRoles.length} roles seeded`);

export async function getDatabase() {
    return db;
};
