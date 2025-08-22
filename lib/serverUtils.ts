"use server";

import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { getDatabase } from "./database";
import { redirect } from "next/navigation";

// Authentication: SIGN IN/OUT/UP | SESSIONS
const SALT_ROUNDS = 10;

export async function signOut() {
    return { success: true };
}

export async function signUp({ email, password }: { email: string; password: string }) {
    try {
        const db = await getDatabase();
        // Check if email exists
        const existing = db.prepare("SELECT id FROM members WHERE email = ?").get(email);
        if (existing) {
            return { error: { message: "Email already registered" } };
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        // Insert user
        db.prepare("INSERT INTO members (email, password) VALUES (?, ?)")
            .run(email, passwordHash);

        return { error: undefined };
    } catch (err: any) {
        console.error("Error in signUp:", err.message);
        return { error: { message: "Failed to sign up" } };
    }
}

export async function signInWithPassword({ email, password }: { email: string; password: string }): Promise<{
    error?: { message: string }
    token?: string
}> {
    try {
        const db = await getDatabase();

        // Look up user
        const user: any = db.prepare("SELECT * FROM members WHERE email = ?").get(email);
        if (!user) {
            return { error: { message: "Email not registered" } };
        }

        // Compare password hash
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return { error: { message: "Invalid password" } };
        }

        // Create session token
        const { error, token } = await createSession(user.id);

        if (!error && token) {
            return { token, error: undefined };
        }

        console.error("Error creating session:", error?.message);
        return { error: { message: "Failed to sign in" } };
    } catch (err: any) {
        console.error("Error in signInWithPassword:", err.message);
        return { error: { message: "Failed to sign in" } };
    }
}

/**
 * Create a new session for a user
 */
export async function createSession(userId: number): Promise<{ token?: string, error?: { message: string } }> {
    try {
        const db = await getDatabase();

        const token = uuidv4();
        db.prepare("INSERT INTO sessions (userId, token) VALUES (?, ?)").run(userId, token);
        return { token };
    } catch (err: any) {
        return { error: { message: "Failed to create session" } };
    }
}

/**
 * Look up a session by token
 */
export async function getSession(token: string): Promise<{ user?: any; error?: { message: string } }> {
    try {
        const db = await getDatabase();

        const session = db.prepare(
            `SELECT s.token, s.createdAt, m.id as userId, m.email, m.role, m.full_name
             FROM sessions s
             JOIN members m ON s.userId = m.id
             WHERE s.token = ?`
        ).get(token);

        if (!session) {
            return { error: { message: "Invalid or expired session" } };
        }

        return { user: session };
    } catch (err: any) {
        console.error("Error fetching session:", err.message);
        return { error: { message: "Failed to fetch session" } };
    }
}

export async function deleteUser(id: any) {

}

// Fetches the corresponding record from members whose id matches current session user
export async function fetchCurrentUser(
    token: string, // pass session token (from cookie or header)
    redirectToLogin = true
): Promise<any | undefined> {
    const { user, error } = await getSession(token);

    if (error || !user) {
        if (redirectToLogin) {
            redirect("/auth/login");
        }

        return undefined;
    }

    try {
        const db = await getDatabase();

        const member = db.prepare("SELECT * FROM members WHERE id = ?").get(user.userId);

        if (member) {
            return member;
        }
    } catch (err: any) {
        console.error("Error fetching member:", err.message);
    }

    return undefined;
}

// Fetches all records from members
export async function fetchUsers() {
    try {
        const db = await getDatabase();
        const rows = db.prepare("SELECT * FROM members").all();
        return rows;
    } catch (err: any) {
        console.error("Error fetching members:", err.message);
    }

    return [];
}

// ANNOUNCEMENTS
// Fetches all records from announcements
export async function fetchAnnouncements() {
    try {
        const db = await getDatabase();
        const rows: any = db.prepare("SELECT * FROM announcements").all();
        return rows;
    } catch (err: any) {
        console.error("Error fetching announcements:", err.message);
    }

    return [];
}

// Add a record to announcements
export async function createAnnouncement(title: string, priority: string, content: string) {
    try {
        const db = await getDatabase();
        db.prepare("INSERT INTO announcements (title, priority, content) VALUES (?, ?, ?)")
            .run(title, priority, content);
    } catch (err: any) {
        console.error("Error creating announcement:", err.message);
    }
}

// Delete a record from announcements
export async function deleteAnnouncement(id: number) {
    try {
        const db = await getDatabase();
        db.prepare("DELETE FROM announcements WHERE id = ?").run(id);
    } catch (err: any) {
        console.error("Error deleting announcement:", err.message);
    }
}