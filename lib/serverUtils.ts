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
 * @param fullName - User's full name (first and last name)
 * @returns Object with error property (undefined on success)
 */
export async function signUp({ email, password, fullName }: { email: string; password: string; fullName: string }) {
    try {
        const db = await getDatabase();
        
        // Check if email is already registered
        const existing = db.prepare("SELECT id FROM members WHERE email = ?").get(email);
        if (existing) {
            return { error: { message: "Email already registered" } };
        }

        // Hash password using bcrypt with configured salt rounds
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        // Insert new user into database with full name
        db.prepare("INSERT INTO members (email, password, full_name) VALUES (?, ?, ?)")
            .run(email, passwordHash, fullName);

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
        
        // First, try to migrate users if needed
        await migrateUsersToRoleSystem();

        const member = db.prepare("SELECT * FROM members WHERE id = ?").get(user.userId) as any;

        if (member) {
            // Parse roles JSON and ensure proper structure
            const parsedRoles = JSON.parse(member.roles || '["student"]');
            console.log(`Current user ${member.full_name} (${member.email}) has roles:`, parsedRoles);
            return {
                ...member,
                roles: parsedRoles,
                created_at: member.created_at || member.createdAt || new Date().toISOString()
            };
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

        console.log(`Found ${users.length} users to check for migration`);

        for (const user of users as any[]) {
            let shouldUpdate = false;
            let newRoles = ['student']; // Default to student
            
            // If roles column is null or empty, migrate from old role field
            if (!user.roles || user.roles === null || user.roles === '') {
                shouldUpdate = true;
                
                // Map old integer roles to new string roles
                if (user.role === 0) {
                    newRoles = ['student']; // Regular student
                } else if (user.role === 1) {
                    newRoles = ['student', 'beadle']; // Student + beadle
                } else if (user.role === 2) {
                    newRoles = ['supervisor', 'student']; // Supervisor (also student)
                } else if (user.role === 3) {
                    newRoles = ['admin', 'supervisor', 'student']; // Admin with all privileges
                } else {
                    newRoles = ['student']; // Default fallback
                }
            } else {
                // Parse existing roles and ensure proper role structure
                try {
                    const existingRoles = JSON.parse(user.roles);
                    if (Array.isArray(existingRoles) && existingRoles.length > 0) {
                        // Keep existing roles but ensure they're valid
                        newRoles = existingRoles.filter(role => 
                            ['student', 'beadle', 'supervisor', 'admin', 'super_admin'].includes(role)
                        );
                        
                        // If no valid roles found, default to student
                        if (newRoles.length === 0) {
                            newRoles = ['student'];
                            shouldUpdate = true;
                        }
                        
                        // Don't force student role on admins/supervisors if they don't have it
                        // This preserves the existing role structure
                    } else {
                        newRoles = ['student'];
                        shouldUpdate = true;
                    }
                } catch (e) {
                    newRoles = ['student'];
                    shouldUpdate = true;
                }
            }

            if (shouldUpdate) {
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
 * Debug function to check a specific user's roles
 * @param userEmail - Email of the user to check
 */
export async function debugUserRoles(userEmail: string) {
    try {
        const db = await getDatabase();
        const user = db.prepare("SELECT * FROM members WHERE email = ?").get(userEmail) as any;
        
        if (user) {
            console.log("Raw user data:", user);
            console.log("Raw roles field:", user.roles);
            
            try {
                const parsedRoles = JSON.parse(user.roles || '["student"]');
                console.log("Parsed roles:", parsedRoles);
                return { user, parsedRoles };
            } catch (e) {
                console.log("Error parsing roles:", e);
                return { user, parsedRoles: ["student"] };
            }
        } else {
            console.log("User not found");
            return null;
        }
    } catch (err: any) {
        console.error("Error in debugUserRoles:", err.message);
        return null;
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

        const processedUsers = users.map((user: any) => {
            const parsedRoles = JSON.parse(user.roles || '["student"]');
            console.log(`User ${user.full_name} (${user.email}) has roles:`, parsedRoles);
            return {
                ...user,
                roles: parsedRoles,
                created_at: user.created_at || user.createdAt || new Date().toISOString()
            };
        });
        
        return processedUsers;
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

/**
 * Update User Profile Function
 * 
 * Updates user profile information including name, email, form class, and optionally password.
 * Validates current password if password change is requested.
 * 
 * @param userId - ID of the user to update
 * @param updateData - Object containing profile updates
 * @returns Object with success status and error message if applicable
 */
export async function updateUserProfile(userId: number, updateData: {
    full_name?: string;
    email?: string;
    form_class?: string;
    currentPassword?: string;
    newPassword?: string;
}) {
    try {
        // console.log("updateUserProfile called with:", { userId, updateData });
        
        // Validate inputs
        if (!userId || typeof userId !== 'number') {
            return { success: false, error: "Invalid user ID" };
        }
        
        if (!updateData || typeof updateData !== 'object') {
            return { success: false, error: "Invalid update data" };
        }
        
        const db = await getDatabase();
        
        // If password change is requested, verify current password first
        if (updateData.newPassword && updateData.currentPassword) {
            const user = db.prepare("SELECT password FROM members WHERE id = ?").get(userId) as any;
            if (!user) {
                return { success: false, error: "User not found" };
            }
            
            const isValidPassword = await bcrypt.compare(updateData.currentPassword, user.password);
            if (!isValidPassword) {
                return { success: false, error: "Current password is incorrect" };
            }
        }
        
        // Check if email is already taken by another user
        if (updateData.email) {
            const existingUser = db.prepare("SELECT id FROM members WHERE email = ? AND id != ?").get(updateData.email, userId);
            if (existingUser) {
                return { success: false, error: "Email address is already in use" };
            }
        }
        
        // Build update query dynamically
        const updateFields: string[] = [];
        const updateValues: any[] = [];
        
        if (updateData.full_name) {
            updateFields.push("full_name = ?");
            updateValues.push(updateData.full_name);
        }
        
        if (updateData.email) {
            updateFields.push("email = ?");
            updateValues.push(updateData.email);
        }
        
        if (updateData.form_class !== undefined) {
            updateFields.push("form_class = ?");
            updateValues.push(updateData.form_class || null);
        }
        
        if (updateData.newPassword) {
            const hashedPassword = await bcrypt.hash(updateData.newPassword, SALT_ROUNDS);
            updateFields.push("password = ?");
            updateValues.push(hashedPassword);
        }
        
        // Check if updated_at column exists and add it if it does
        try {
            const tableInfo = db.prepare("PRAGMA table_info(members)").all() as any[];
            const hasUpdatedAt = tableInfo.some((column: any) => column.name === 'updated_at');
            
            if (hasUpdatedAt) {
                updateFields.push("updated_at = ?");
                updateValues.push(new Date().toISOString());
            }
        } catch (e) {
            console.log("Could not check for updated_at column:", e);
        }
        
        if (updateFields.length === 0) {
            return { success: false, error: "No fields to update" };
        }
        
        // Execute update - add userId at the end for WHERE clause
        const query = `UPDATE members SET ${updateFields.join(", ")} WHERE id = ?`;
        // console.log("Executing query:", query);
        // console.log("With values:", [...updateValues, userId]);
        
        const result = db.prepare(query).run(...updateValues, userId);
        // console.log("Query result:", result);
        
        if (result.changes === 0) {
            return { success: false, error: "User not found or no changes made" };
        }
        
        return { success: true };
        
    } catch (err: any) {
        console.error("Error updating user profile:", err.message);
        console.error("Stack trace:", err.stack);
        console.error("Update data:", updateData);
        console.error("User ID:", userId);
        return { success: false, error: `Failed to update profile: ${err.message}` };
    }
}

// ===== TASK MANAGEMENT FUNCTIONS =====

/**
 * Fetch Tasks Function
 * 
 * Retrieves tasks from the database with user information
 * 
 * @param userId - Optional user ID to filter tasks
 * @returns Array of tasks with user details
 */
export async function fetchTasks(userId?: number) {
    try {
        const db = await getDatabase();
        
        let query = `
            SELECT 
                t.*,
                creator.full_name as creator_name,
                assignee.full_name as assignee_name
            FROM tasks t
            LEFT JOIN members creator ON t.created_by = creator.id
            LEFT JOIN members assignee ON t.assigned_to = assignee.id
        `;
        
        if (userId) {
            query += ` WHERE t.assigned_to = ? OR t.created_by = ?`;
            return db.prepare(query + ` ORDER BY t.created_at DESC`).all(userId, userId);
        } else {
            return db.prepare(query + ` ORDER BY t.created_at DESC`).all();
        }
    } catch (err: any) {
        console.error("Error fetching tasks:", err.message);
        return [];
    }
}

/**
 * Create Task Function
 * 
 * Creates a new task in the database
 * 
 * @param taskData - Task information
 * @returns Success status and task ID
 */
export async function createTask(taskData: {
    title: string;
    description?: string;
    assigned_to?: number;
    created_by: number;
    priority?: string;
    due_date?: string;
}) {
    try {
        const db = await getDatabase();
        
        const result = db.prepare(`
            INSERT INTO tasks (title, description, assigned_to, created_by, priority, due_date)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(
            taskData.title,
            taskData.description || null,
            taskData.assigned_to || null,
            taskData.created_by,
            taskData.priority || 'medium',
            taskData.due_date || null
        );
        
        return { success: true, taskId: result.lastInsertRowid };
    } catch (err: any) {
        console.error("Error creating task:", err.message);
        return { success: false, error: "Failed to create task" };
    }
}

/**
 * Update Task Status Function
 * 
 * Updates the status of a task
 * 
 * @param taskId - Task ID to update
 * @param status - New status
 * @returns Success status
 */
export async function updateTaskStatus(taskId: number, status: string) {
    try {
        const db = await getDatabase();
        
        const result = db.prepare(`
            UPDATE tasks 
            SET status = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        `).run(status, taskId);
        
        return { success: result.changes > 0 };
    } catch (err: any) {
        console.error("Error updating task status:", err.message);
        return { success: false, error: "Failed to update task" };
    }
}

// ===== EVENT MANAGEMENT FUNCTIONS =====

/**
 * Fetch Events Function
 * 
 * Retrieves events from the database
 * 
 * @param limit - Optional limit for number of events
 * @returns Array of events
 */
export async function fetchEvents(limit?: number) {
    try {
        const db = await getDatabase();
        
        let query = `
            SELECT 
                e.*,
                creator.full_name as creator_name
            FROM events e
            LEFT JOIN members creator ON e.created_by = creator.id
            ORDER BY e.event_date ASC, e.start_time ASC
        `;
        
        if (limit) {
            query += ` LIMIT ?`;
            return db.prepare(query).all(limit);
        } else {
            return db.prepare(query).all();
        }
    } catch (err: any) {
        console.error("Error fetching events:", err.message);
        return [];
    }
}

/**
 * Create Event Function
 * 
 * Creates a new event in the database
 * 
 * @param eventData - Event information
 * @returns Success status and event ID
 */
export async function createEvent(eventData: {
    title: string;
    description?: string;
    event_date: string;
    start_time?: string;
    end_time?: string;
    location?: string;
    created_by: number;
    event_type?: string;
}) {
    try {
        const db = await getDatabase();
        
        const result = db.prepare(`
            INSERT INTO events (title, description, event_date, start_time, end_time, location, created_by, event_type)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            eventData.title,
            eventData.description || null,
            eventData.event_date,
            eventData.start_time || null,
            eventData.end_time || null,
            eventData.location || null,
            eventData.created_by,
            eventData.event_type || 'general'
        );
        
        return { success: true, eventId: result.lastInsertRowid };
    } catch (err: any) {
        console.error("Error creating event:", err.message);
        return { success: false, error: "Failed to create event" };
    }
}

// ===== MESSAGE MANAGEMENT FUNCTIONS =====

/**
 * Fetch Messages Function
 * 
 * Retrieves messages for a user
 * 
 * @param userId - User ID to fetch messages for
 * @param limit - Optional limit for number of messages
 * @returns Array of messages
 */
export async function fetchMessages(userId: number, limit?: number) {
    try {
        const db = await getDatabase();
        
        let query = `
            SELECT 
                m.*,
                sender.full_name as sender_name
            FROM messages m
            LEFT JOIN members sender ON m.sender_id = sender.id
            WHERE m.recipient_id = ? OR m.recipient_id IS NULL
            ORDER BY m.created_at DESC
        `;
        
        if (limit) {
            query += ` LIMIT ?`;
            return db.prepare(query).all(userId, limit);
        } else {
            return db.prepare(query).all(userId);
        }
    } catch (err: any) {
        console.error("Error fetching messages:", err.message);
        return [];
    }
}

/**
 * Create Message Function
 * 
 * Creates a new message
 * 
 * @param messageData - Message information
 * @returns Success status and message ID
 */
export async function createMessage(messageData: {
    sender_id: number;
    recipient_id?: number;
    subject?: string;
    content: string;
    message_type?: string;
}) {
    try {
        const db = await getDatabase();
        
        const result = db.prepare(`
            INSERT INTO messages (sender_id, recipient_id, subject, content, message_type)
            VALUES (?, ?, ?, ?, ?)
        `).run(
            messageData.sender_id,
            messageData.recipient_id || null,
            messageData.subject || null,
            messageData.content,
            messageData.message_type || 'direct'
        );
        
        return { success: true, messageId: result.lastInsertRowid };
    } catch (err: any) {
        console.error("Error creating message:", err.message);
        return { success: false, error: "Failed to create message" };
    }
}

/**
 * Get Dashboard Stats Function
 * 
 * Retrieves statistics for the dashboard
 * 
 * @param userId - User ID for personalized stats
 * @returns Object with various statistics
 */
export async function getDashboardStats(userId: number) {
    try {
        const db = await getDatabase();
        
        // Get announcement count
        const announcementCount = db.prepare("SELECT COUNT(*) as count FROM announcements").get() as any;
        
        // Get task count for user
        const taskCount = db.prepare(`
            SELECT COUNT(*) as count FROM tasks 
            WHERE assigned_to = ? AND status != 'completed'
        `).get(userId) as any;
        
        // Get upcoming events count
        const eventCount = db.prepare(`
            SELECT COUNT(*) as count FROM events 
            WHERE event_date >= date('now') AND status = 'upcoming'
        `).get() as any;
        
        // Get unread messages count
        const messageCount = db.prepare(`
            SELECT COUNT(*) as count FROM messages 
            WHERE (recipient_id = ? OR recipient_id IS NULL) AND is_read = FALSE
        `).get(userId) as any;
        
        return {
            announcements: announcementCount.count,
            tasks: taskCount.count,
            events: eventCount.count,
            messages: messageCount.count
        };
    } catch (err: any) {
        console.error("Error fetching dashboard stats:", err.message);
        return {
            announcements: 0,
            tasks: 0,
            events: 0,
            messages: 0
        };
    }
}