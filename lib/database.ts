"use server";
import Database from "better-sqlite3";

const db = new Database("db.sqlite");

// Create tables if they don't exist
db.prepare(`
  CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL DEFAULT "",
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role INTEGER NOT NULL DEFAULT 0,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS announcements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    priority TEXT NOT NULL,
    content TEXT NOT NULL,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
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

export async function getDatabase() {
    return db;
};
