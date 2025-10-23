/**
 * Server Utilities for Authentication and Data Management
 * 
 * This module provides server-side functions for user authentication,
 * session management, and database operations for the beadle slip system.
 * All functions run on the server side and handle sensitive operations
 * like password hashing and database queries.
 * 
 * Key Features:
 * - User registration and authentication
 * - Session token management
 * - Beadle slip CRUD operations
 * - Announcement management
 * - Secure password handling with bcrypt
 * 
 * @author Tech Media Hub Team
 * @version 1.0
 * @since 2024
 */

"use server";

import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { getDatabase } from "./database";
import { redirect } from "next/navigation";

/**
 * Authentication Configuration
 * 
 * SALT_ROUNDS: Number of rounds for bcrypt password hashing
 * Higher values = more secure but slower processing
 */
const SALT_ROUNDS = 10;

/**
 * Sign Out Function
 * 
 * Currently a placeholder that returns success.
 * In a full implementation, this would:
 * - Invalidate the user's session token
 * - Clear server-side session data
 * - Log the sign-out event
 * 
 * @returns Success response
 */
export async function signOut() {
    return { success: true };
}

/**
 * User Registration Function
 * 
 * Handles new user account creation with the following steps:
 * 1. Validates email uniqueness
 * 2. Hashes password using bcrypt
 * 3. Inserts new user record into database
 * 4. Returns success/error response
 * 
 * @param email - User's email address (must be unique)
 * @param password - Plain text password (will be hashed)
 * @returns Object with error property (undefined on success)
 */
export async function signUp({ email, password }: { email: string; password: string }) {
    try {
        const db = await getDatabase();
        
        // Check if email is already registered
        const existing = db.prepare("SELECT id FROM members WHERE email = ?").get(email);
        if (existing) {
            return { error: { message: "Email already registered" } };
        }

        // Hash password using bcrypt with configured salt rounds
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        // Insert new user into database
        db.prepare("INSERT INTO members (email, password) VALUES (?, ?)")
            .run(email, passwordHash);

        return { error: undefined };
    } catch (err: any) {
        console.error("Error in signUp:", err.message);
        return { error: { message: "Failed to sign up" } };
    }
}

/**
 * User Authentication Function
 * 
 * Handles user login with email and password authentication.
 * Process:
 * 1. Looks up user by email address
 * 2. Compares provided password with stored hash using bcrypt
 * 3. Creates a new session token on successful authentication
 * 4. Returns session token or error message
 * 
 * @param email - User's email address
 * @param password - Plain text password for verification
 * @returns Object containing either session token or error message
 */
export async function signInWithPassword({ email, password }: { email: string; password: string }): Promise<{
    error?: { message: string }
    token?: string
}> {
    try {
        const db = await getDatabase();

        // Look up user by email address
        const user: any = db.prepare("SELECT * FROM members WHERE email = ?").get(email);
        if (!user) {
            return { error: { message: "Email not registered" } };
        }

        // Verify password using bcrypt comparison
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return { error: { message: "Invalid password" } };
        }

        // Create new session token for authenticated user
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
 * Session Creation Function
 * 
 * Creates a new session record for an authenticated user.
 * Generates a unique UUID token and stores it in the database
 * linked to the user's ID.
 * 
 * @param userId - The ID of the user to create a session for
 * @returns Object containing session token or error message
 */
export async function createSession(userId: number): Promise<{ token?: string, error?: { message: string } }> {
    try {
        const db = await getDatabase();

        // Generate unique session token using UUID
        const token = uuidv4();
        db.prepare("INSERT INTO sessions (userId, token) VALUES (?, ?)").run(userId, token);
        return { token };
    } catch (err: any) {
        return { error: { message: "Failed to create session" } };
    }
}

/**
 * Session Lookup Function
 * 
 * Retrieves session information by token and joins with user data.
 * This function validates session tokens and returns associated
 * user information for authentication purposes.
 * 
 * @param token - Session token to look up
 * @returns Object containing user session data or error message
 */
export async function getSession(token: string): Promise<{ user?: any; error?: { message: string } }> {
    try {
        const db = await getDatabase();

        // Join sessions with members table to get complete user info
        const session = db.prepare(`
            SELECT s.token, s.createdAt, m.id as userId, m.email, m.role, m.full_name
             FROM sessions s
             JOIN members m ON s.userId = m.id
             WHERE s.token = ?
        `).get(token);

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
        
        // First, try to migrate users if needed
        await migrateUsersToRoleSystem();
        
        const rows = db.prepare("SELECT * FROM members").all();
        
        // Process rows to include both old and new role systems for compatibility
        return rows.map((user: any) => ({
            ...user,
            roles: JSON.parse(user.roles || '["student"]'),
            // Keep the old role field for backward compatibility
            role: user.role || 0
        }));
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

// BEADLE SLIPS
export async function saveBeadleSlip(formData: {
    beedleEmail: string;
    form: string;
    formClass: string;
    classStartTime: string;
    classEndTime: string;
    date: string;
    teacher: string;
    subject: string;
    teacherPresent: string;
    teacherArrivalTime: string;
    substituteReceived: string;
    homeworkGiven: string;
    studentsPresent: string;
    absentStudents: string[];
    lateStudents: string[];
}) {
    try {
        const db = await getDatabase();
        
        const stmt = db.prepare(`
            INSERT INTO beedle_slips (
                beedle_email, grade_level, class_name, class_start_time, class_end_time,
                date, teacher, subject, teacher_present, teacher_arrival_time,
                substitute_received, homework_given, students_present, absent_students, late_students
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        const result = stmt.run(
            formData.beedleEmail,
            formData.form,
            formData.formClass,
            formData.classStartTime,
            formData.classEndTime,
            formData.date,
            formData.teacher,
            formData.subject,
            formData.teacherPresent,
            formData.teacherArrivalTime || null,
            formData.substituteReceived || null,
            formData.homeworkGiven,
            parseInt(formData.studentsPresent),
            JSON.stringify(formData.absentStudents.filter(s => s.trim() !== '')),
            JSON.stringify(formData.lateStudents.filter(s => s.trim() !== ''))
        );
        
        return { success: true, id: result.lastInsertRowid };
    } catch (err: any) {
        console.error("Error saving beedle slip:", err.message);
        return { success: false, error: err.message };
    }
}

export async function getBeadleSlips() {
    try {
        const db = await getDatabase();
        
        const slips = db.prepare(`
            SELECT * FROM beedle_slips 
            ORDER BY created_at DESC
        `).all();
        
        return slips.map((slip: any) => ({
            ...slip,
            absent_students: JSON.parse(slip.absent_students || '[]'),
            late_students: JSON.parse(slip.late_students || '[]')
        }));
    } catch (err: any) {
        console.error("Error fetching beedle slips:", err.message);
        return [];
    }
}

/**
 * Deletes a beadle slip report from the database
 * 
 * This function allows administrators to remove beadle slip reports.
 * It performs a hard delete from the database and cannot be undone.
 * Should only be called by users with admin privileges.
 * 
 * @param slipId - The ID of the beadle slip to delete
 * @returns Object with success status and optional error message
 */
export async function deleteBeadleSlip(slipId: number) {
    try {
        const db = await getDatabase();
        
        // Verify the slip exists before attempting deletion
        const existingSlip = db.prepare("SELECT id FROM beedle_slips WHERE id = ?").get(slipId);
        if (!existingSlip) {
            return { success: false, error: "Beadle slip not found" };
        }
        
        // Delete the beadle slip
        const result = db.prepare("DELETE FROM beedle_slips WHERE id = ?").run(slipId);
        
        if (result.changes === 0) {
            return { success: false, error: "Failed to delete beadle slip" };
        }
        
        return { success: true };
    } catch (err: any) {
        console.error("Error deleting beadle slip:", err.message);
        return { success: false, error: err.message };
    }
}

// USER MANAGEMENT FUNCTIONS

/**
 * Migrates existing users to the new roles system
 * @returns Success/error result
 */
export async function migrateUsersToRoleSystem() {
    try {
        const db = await getDatabase();
        
        // Get all users with old role system
        const users = db.prepare(`
            SELECT id, role, roles FROM members
        `).all();

        console.log(`Found ${users.length} users to migrate`);

        for (const user of users as any[]) {
            // If roles column is null or empty, migrate from old role field
            if (!user.roles || user.roles === null) {
                let newRoles = ['student']; // Default to student
                
                // Map old integer roles to new string roles
                if (user.role === 0) {
                    newRoles = ['student']; // Regular student
                } else if (user.role === 1) {
                    newRoles = ['student', 'beadle']; // Student + beadle
                } else if (user.role === 2) {
                    newRoles = ['student', 'admin', 'tech_team']; // Tech team member (student + admin)
                } else if (user.role === 3) {
                    newRoles = ['supervisor']; // Pure supervisor (not student)
                } else {
                    newRoles = ['student']; // Default fallback
                }

                // Update the user with new roles
                db.prepare(`
                    UPDATE members 
                    SET roles = ? 
                    WHERE id = ?
                `).run(JSON.stringify(newRoles), user.id);
                
                console.log(`Migrated user ${user.id} to roles: ${JSON.stringify(newRoles)}`);
            }
        }

        return { success: true, migratedCount: users.length };
    } catch (err: any) {
        console.error("Error migrating users:", err.message);
        return { success: false, error: err.message };
    }
}

/**
 * Fetches all users from the database for supervisor management
 * @returns Array of user objects with role information
 */
export async function getAllUsers() {
    try {
        const db = await getDatabase();
        
        // First, try to migrate users if needed
        await migrateUsersToRoleSystem();
        
        const users = db.prepare(`
            SELECT 
                id, 
                email, 
                full_name,
                form_class,
                roles,
                created_at,
                createdAt
            FROM members 
            ORDER BY full_name ASC
        `).all();

        console.log(`Fetched ${users.length} users from database`);

        return users.map((user: any) => ({
            ...user,
            roles: JSON.parse(user.roles || '["student"]'),
            created_at: user.created_at || user.createdAt || new Date().toISOString()
        }));
    } catch (err: any) {
        console.error("Error fetching users:", err.message);
        return [];
    }
}

/**
 * Adds a role to a user (tag-based system)
 * @param userId - The ID of the user to update
 * @param roleToAdd - The role to add
 * @returns Success/error result
 */
export async function addUserRole(userId: string, roleToAdd: string) {
    try {
        const db = await getDatabase();
        
        // Validate role
        const validRoles = ['student', 'beadle', 'supervisor', 'admin', 'tech_team'];
        if (!validRoles.includes(roleToAdd)) {
            return { success: false, error: "Invalid role specified" };
        }

        // Get current roles
        const user = db.prepare(`SELECT roles FROM members WHERE id = ?`).get(userId) as any;
        if (!user) {
            return { success: false, error: "User not found" };
        }

        const currentRoles = JSON.parse(user.roles || '["student"]');
        
        // Add role if not already present
        if (!currentRoles.includes(roleToAdd)) {
            currentRoles.push(roleToAdd);
        }

        // Update user roles
        const result = db.prepare(`
            UPDATE members 
            SET roles = ? 
            WHERE id = ?
        `).run(JSON.stringify(currentRoles), userId);

        if (result.changes === 0) {
            return { success: false, error: "User not found" };
        }

        return { success: true };
    } catch (err: any) {
        console.error("Error adding user role:", err.message);
        return { success: false, error: err.message };
    }
}

/**
 * Removes a role from a user (tag-based system)
 * @param userId - The ID of the user to update
 * @param roleToRemove - The role to remove
 * @returns Success/error result
 */
export async function removeUserRole(userId: string, roleToRemove: string) {
    try {
        const db = await getDatabase();
        
        // Get current roles
        const user = db.prepare(`SELECT roles FROM members WHERE id = ?`).get(userId) as any;
        if (!user) {
            return { success: false, error: "User not found" };
        }

        const currentRoles = JSON.parse(user.roles || '["student"]');
        
        // Remove role if present, but keep at least 'student'
        const updatedRoles = currentRoles.filter((role: string) => role !== roleToRemove);
        if (updatedRoles.length === 0) {
            updatedRoles.push('student'); // Ensure user always has at least student role
        }

        // Update user roles
        const result = db.prepare(`
            UPDATE members 
            SET roles = ? 
            WHERE id = ?
        `).run(JSON.stringify(updatedRoles), userId);

        if (result.changes === 0) {
            return { success: false, error: "User not found" };
        }

        return { success: true };
    } catch (err: any) {
        console.error("Error removing user role:", err.message);
        return { success: false, error: err.message };
    }
}

/**
 * Sets user roles (replaces all current roles)
 * @param userId - The ID of the user to update
 * @param newRoles - Array of roles to set
 * @returns Success/error result
 */
export async function setUserRoles(userId: string, newRoles: string[]) {
    try {
        const db = await getDatabase();
        
        // Validate roles
        const validRoles = ['student', 'beadle', 'supervisor', 'admin', 'tech_team'];
        for (const role of newRoles) {
            if (!validRoles.includes(role)) {
                return { success: false, error: `Invalid role specified: ${role}` };
            }
        }

        // Ensure user always has at least one role
        if (newRoles.length === 0) {
            newRoles = ['student']; // Default to student if no roles specified
        }

        // Update user roles
        const result = db.prepare(`
            UPDATE members 
            SET roles = ? 
            WHERE id = ?
        `).run(JSON.stringify(newRoles), userId);

        if (result.changes === 0) {
            return { success: false, error: "User not found" };
        }

        return { success: true };
    } catch (err: any) {
        console.error("Error setting user roles:", err.message);
        return { success: false, error: err.message };
    }
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use addUserRole or removeUserRole instead
 */
export async function updateUserRole(userId: string, newRole: string) {
    // For backward compatibility, this adds the role if it's not student
    if (newRole === 'student') {
        return removeUserRole(userId, 'beadle'); // Remove beadle role, keeping student
    } else {
        return addUserRole(userId, newRole); // Add the new role
    }
}

/**
 * Updates a user's form class assignment
 * @param userId - The ID of the user to update
 * @param formClass - The form class to assign
 * @returns Success/error result
 */
export async function updateUserFormClass(userId: string, formClass: string) {
    try {
        const db = await getDatabase();
        
        const result = db.prepare(`
            UPDATE members 
            SET form_class = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        `).run(formClass, userId);

        if (result.changes === 0) {
            return { success: false, error: "User not found" };
        }

        return { success: true };
    } catch (err: any) {
        console.error("Error updating user form class:", err.message);
        return { success: false, error: err.message };
    }
}

/**
 * Creates a new user account
 * @param userData - User data including email, name, role, etc.
 * @returns Success/error result with user ID
 */
export async function createUser(userData: {
    email: string;
    full_name: string;
    form_class?: string;
    role: string;
    password?: string;
}) {
    try {
        const db = await getDatabase();
        
        // Check if email already exists
        const existing = db.prepare("SELECT id FROM members WHERE email = ?").get(userData.email);
        if (existing) {
            return { success: false, error: "Email already exists" };
        }

        // Generate default password if not provided
        const defaultPassword = userData.password || 'CampionStudent2024';
        const passwordHash = await bcrypt.hash(defaultPassword, SALT_ROUNDS);

        // Insert new user
        const result = db.prepare(`
            INSERT INTO members (email, password, full_name, form_class, role, created_at)
            VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `).run(
            userData.email,
            passwordHash,
            userData.full_name,
            userData.form_class || null,
            userData.role
        );

        return { 
            success: true, 
            userId: result.lastInsertRowid,
            defaultPassword: userData.password ? null : defaultPassword
        };
    } catch (err: any) {
        console.error("Error creating user:", err.message);
        return { success: false, error: err.message };
    }
}

/**
 * Bulk update user roles
 * @param updates - Array of {userId, newRole} objects
 * @returns Success/error result with update count
 */
export async function bulkUpdateUserRoles(updates: Array<{userId: string, newRole: string}>) {
    try {
        const db = await getDatabase();
        const validRoles = ['student', 'beadle', 'supervisor', 'admin'];
        
        let successCount = 0;
        const errors: string[] = [];

        for (const update of updates) {
            if (!validRoles.includes(update.newRole)) {
                errors.push(`Invalid role ${update.newRole} for user ${update.userId}`);
                continue;
            }

            try {
                const result = db.prepare(`
                    UPDATE members 
                    SET role = ?, updated_at = CURRENT_TIMESTAMP 
                    WHERE id = ?
                `).run(update.newRole, update.userId);

                if (result.changes > 0) {
                    successCount++;
                } else {
                    errors.push(`User ${update.userId} not found`);
                }
            } catch (err: any) {
                errors.push(`Error updating user ${update.userId}: ${err.message}`);
            }
        }

        return { 
            success: errors.length === 0, 
            successCount, 
            errors: errors.length > 0 ? errors : undefined 
        };
    } catch (err: any) {
        console.error("Error in bulk update:", err.message);
        return { success: false, error: err.message };
    }
}