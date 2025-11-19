"use server";

import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { getDatabase } from "./database";
import { redirect } from "next/navigation";

const SALT_ROUNDS = 10;

export async function signOut() {
    return { success: true };
}

export async function signUp({ email, password, fullName, formClass }: { email: string; password: string; fullName: string; formClass?: string }) {
    try {
        const db = await getDatabase();
        
        const existing = db.prepare("SELECT id FROM members WHERE email = ?").get(email);
        if (existing) {
            return { error: { message: "Email already registered" } };
        }

        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        const result = db.prepare("INSERT INTO members (email, password, full_name, form_class) VALUES (?, ?, ?, ?)")
            .run(email, passwordHash, fullName, formClass || null);

        const memberId = result.lastInsertRowid as number;
        const studentRole = db.prepare("SELECT id FROM roles WHERE role_name = 'student'").get() as any;
        
        if (studentRole) {
            db.prepare("INSERT INTO member_roles (member_id, role_id) VALUES (?, ?)")
                .run(memberId, studentRole.id);
        }

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

        const user: any = db.prepare("SELECT * FROM members WHERE email = ?").get(email);
        if (!user) {
            return { error: { message: "Email not registered" } };
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return { error: { message: "Invalid password" } };
        }

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

export async function getSession(token: string): Promise<{ user?: any; error?: { message: string } }> {
    try {
        const db = await getDatabase();

        const session = db.prepare(`
            SELECT s.token, s.createdAt, m.id as userId, m.email, m.full_name
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

export async function fetchCurrentUser(
    token: string,
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
        const { getMemberRoles } = await import("./role-db-helpers");

        const member = db.prepare("SELECT * FROM members WHERE id = ?").get(user.userId) as any;

        if (member) {
            const roles = await getMemberRoles(member.id);
            const roleNames = roles.map((r: any) => r.role_name);
            
            console.log(`Current user ${member.full_name} (${member.email}) has roles:`, roleNames);
            return {
                ...member,
                roles: roleNames,
                roleDetails: roles,
                created_at: member.created_at || member.createdAt || new Date().toISOString()
            };
        }
    } catch (err: any) {
        console.error("Error fetching member:", err.message);
    }

    return undefined;
}

export async function fetchUsers() {
    try {
        const { getAllMembersWithRoles } = await import("./role-db-helpers");
        return await getAllMembersWithRoles();
    } catch (err: any) {
        console.error("Error fetching members:", err.message);
    }

    return [];
}

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

export async function createAnnouncement(title: string, priority: string, content: string) {
    try {
        const db = await getDatabase();
        db.prepare("INSERT INTO announcements (title, priority, content) VALUES (?, ?, ?)")
            .run(title, priority, content);
    } catch (err: any) {
        console.error("Error creating announcement:", err.message);
    }
}

export async function deleteAnnouncement(id: number) {
    try {
        const db = await getDatabase();
        db.prepare("DELETE FROM announcements WHERE id = ?").run(id);
    } catch (err: any) {
        console.error("Error deleting announcement:", err.message);
    }
}

export async function saveBeadleSlip(formData: {
    beadleEmail: string;
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
            INSERT INTO beadle_slips (
                beadle_email, grade_level, class_name, class_start_time, class_end_time,
                date, teacher, subject, teacher_present, teacher_arrival_time,
                substitute_received, homework_given, students_present, absent_students, late_students
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        const result = stmt.run(
            formData.beadleEmail,
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
        console.error("Error saving beadle slip:", err.message);
        return { success: false, error: err.message };
    }
}

export async function getBeadleSlips() {
    try {
        const db = await getDatabase();
        
        const slips = db.prepare(`
            SELECT * FROM beadle_slips 
            ORDER BY created_at DESC
        `).all();
        
        return slips.map((slip: any) => ({
            ...slip,
            absent_students: JSON.parse(slip.absent_students || '[]'),
            late_students: JSON.parse(slip.late_students || '[]')
        }));
    } catch (err: any) {
        console.error("Error fetching beadle slips:", err.message);
        return [];
    }
}

export async function deleteBeadleSlip(slipId: number) {
    try {
        const db = await getDatabase();
        
        const existingSlip = db.prepare("SELECT id FROM beadle_slips WHERE id = ?").get(slipId);
        if (!existingSlip) {
            return { success: false, error: "Beadle slip not found" };
        }
        
        const result = db.prepare("DELETE FROM beadle_slips WHERE id = ?").run(slipId);
        
        if (result.changes === 0) {
            return { success: false, error: "Failed to delete beadle slip" };
        }
        
        return { success: true };
    } catch (err: any) {
        console.error("Error deleting beadle slip:", err.message);
        return { success: false, error: err.message };
    }
}

export async function migrateUsersToRoleSystem() {
    try {
        const db = await getDatabase();
        
        const users = db.prepare(`
            SELECT id, role, roles FROM members
        `).all();

        console.log(`Found ${users.length} users to check for migration`);

        for (const user of users as any[]) {
            let shouldUpdate = false;
            let newRoles = ['student'];
            
            if (!user.roles || user.roles === null || user.roles === '') {
                shouldUpdate = true;
                
                if (user.role === 0) {
                    newRoles = ['student'];
                } else if (user.role === 1) {
                    newRoles = ['student', 'beadle'];
                } else if (user.role === 2) {
                    newRoles = ['supervisor', 'student'];
                } else if (user.role === 3) {
                    newRoles = ['admin', 'supervisor', 'student'];
                } else {
                    newRoles = ['student'];
                }
            } else {
                try {
                    const existingRoles = JSON.parse(user.roles);
                    if (Array.isArray(existingRoles) && existingRoles.length > 0) {
                        newRoles = existingRoles.filter(role => 
                            ['student', 'beadle', 'supervisor', 'admin', 'super_admin'].includes(role)
                        );
                        
                        if (newRoles.length === 0) {
                            newRoles = ['student'];
                            shouldUpdate = true;
                        }
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

export async function getAllUsers() {
    try {
        const db = await getDatabase();
        
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

export async function addUserRole(userId: string, roleToAdd: string) {
    try {
        const db = await getDatabase();
        
        const validRoles = ['student', 'beadle', 'supervisor', 'admin', 'tech_team'];
        if (!validRoles.includes(roleToAdd)) {
            return { success: false, error: "Invalid role specified" };
        }

        const user = db.prepare(`SELECT roles FROM members WHERE id = ?`).get(userId) as any;
        if (!user) {
            return { success: false, error: "User not found" };
        }

        const currentRoles = JSON.parse(user.roles || '["student"]');
        
        if (!currentRoles.includes(roleToAdd)) {
            currentRoles.push(roleToAdd);
        }

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

export async function removeUserRole(userId: string, roleToRemove: string) {
    try {
        const db = await getDatabase();
        
        const user = db.prepare(`SELECT roles FROM members WHERE id = ?`).get(userId) as any;
        if (!user) {
            return { success: false, error: "User not found" };
        }

        const currentRoles = JSON.parse(user.roles || '["student"]');
        
        const updatedRoles = currentRoles.filter((role: string) => role !== roleToRemove);
        if (updatedRoles.length === 0) {
            updatedRoles.push('student');
        }

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

export async function setUserRoles(userId: string, newRoles: string[]) {
    try {
        const db = await getDatabase();
        
        const validRoles = ['student', 'beadle', 'supervisor', 'admin', 'tech_team'];
        for (const role of newRoles) {
            if (!validRoles.includes(role)) {
                return { success: false, error: `Invalid role specified: ${role}` };
            }
        }

        if (newRoles.length === 0) {
            newRoles = ['student'];
        }

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

export async function updateUserRole(userId: string, newRole: string) {
    if (newRole === 'student') {
        return removeUserRole(userId, 'beadle');
    } else {
        return addUserRole(userId, newRole);
    }
}

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

export async function createUser(userData: {
    email: string;
    full_name: string;
    form_class?: string;
    role: string;
    password?: string;
}) {
    try {
        const db = await getDatabase();
        
        const existing = db.prepare("SELECT id FROM members WHERE email = ?").get(userData.email);
        if (existing) {
            return { success: false, error: "Email already exists" };
        }

        const defaultPassword = userData.password || 'CampionStudent2024';
        const passwordHash = await bcrypt.hash(defaultPassword, SALT_ROUNDS);

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

export async function updateUserProfile(userId: number, updateData: {
    full_name?: string;
    email?: string;
    form_class?: string;
    currentPassword?: string;
    newPassword?: string;
}) {
    try {
        if (!userId || typeof userId !== 'number') {
            return { success: false, error: "Invalid user ID" };
        }
        
        if (!updateData || typeof updateData !== 'object') {
            return { success: false, error: "Invalid update data" };
        }
        
        const db = await getDatabase();
        
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
        
        if (updateData.email) {
            const existingUser = db.prepare("SELECT id FROM members WHERE email = ? AND id != ?").get(updateData.email, userId);
            if (existingUser) {
                return { success: false, error: "Email address is already in use" };
            }
        }
        
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
        
        const query = `UPDATE members SET ${updateFields.join(", ")} WHERE id = ?`;
        
        const result = db.prepare(query).run(...updateValues, userId);
        
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

export async function getDashboardStats(userId: number) {
    try {
        const db = await getDatabase();
        
        const announcementCount = db.prepare("SELECT COUNT(*) as count FROM announcements").get() as any;
        
        const taskCount = db.prepare(`
            SELECT COUNT(*) as count FROM tasks 
            WHERE assigned_to = ? AND status != 'completed'
        `).get(userId) as any;
        
        const eventCount = db.prepare(`
            SELECT COUNT(*) as count FROM events 
            WHERE event_date >= date('now') AND status = 'upcoming'
        `).get() as any;
        
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