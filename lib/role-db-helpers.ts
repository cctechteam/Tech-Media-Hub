"use server";

import { getDatabase } from "./database";

export async function getAllRoles() {
  const db = await getDatabase();
  return db.prepare(`
    SELECT * FROM roles 
    ORDER BY permission_level ASC, role_name ASC
  `).all();
}

export async function getRolesByType(type: 'primary' | 'sub') {
  const db = await getDatabase();
  return db.prepare(`
    SELECT * FROM roles 
    WHERE role_type = ?
    ORDER BY permission_level ASC
  `).all(type);
}

export async function getRoleByName(roleName: string) {
  const db = await getDatabase();
  return db.prepare(`
    SELECT * FROM roles WHERE role_name = ?
  `).get(roleName);
}

export async function getMemberRoles(memberId: number) {
  const db = await getDatabase();
  return db.prepare(`
    SELECT r.* 
    FROM roles r
    INNER JOIN member_roles mr ON r.id = mr.role_id
    WHERE mr.member_id = ?
    ORDER BY r.permission_level ASC
  `).all(memberId);
}

export async function getMemberRoleNames(memberId: number): Promise<string[]> {
  const roles = await getMemberRoles(memberId);
  return roles.map((role: any) => role.role_name);
}

export async function memberHasRole(memberId: number, roleName: string): Promise<boolean> {
  const db = await getDatabase();
  const result = db.prepare(`
    SELECT COUNT(*) as count
    FROM member_roles mr
    INNER JOIN roles r ON mr.role_id = r.id
    WHERE mr.member_id = ? AND r.role_name = ?
  `).get(memberId, roleName) as any;
  
  return result.count > 0;
}

export async function memberHasAnyRole(memberId: number, roleNames: string[]): Promise<boolean> {
  const db = await getDatabase();
  const placeholders = roleNames.map(() => '?').join(',');
  const result = db.prepare(`
    SELECT COUNT(*) as count
    FROM member_roles mr
    INNER JOIN roles r ON mr.role_id = r.id
    WHERE mr.member_id = ? AND r.role_name IN (${placeholders})
  `).get(memberId, ...roleNames) as any;
  
  return result.count > 0;
}

export async function getMemberPermissionLevel(memberId: number): Promise<number> {
  const db = await getDatabase();
  const result = db.prepare(`
    SELECT MAX(r.permission_level) as max_level
    FROM member_roles mr
    INNER JOIN roles r ON mr.role_id = r.id
    WHERE mr.member_id = ?
  `).get(memberId) as any;
  
  return result.max_level || 0;
}

export async function addRoleToMember(memberId: number, roleName: string, assignedBy?: number) {
  try {
    const db = await getDatabase();
 
    const role = await getRoleByName(roleName);
    if (!role) {
      return { success: false, error: `Role '${roleName}' not found` };
    }

    const exists = await memberHasRole(memberId, roleName);
    if (exists) {
      return { success: true, message: "Role already assigned" };
    }

    db.prepare(`
      INSERT INTO member_roles (member_id, role_id, assigned_by)
      VALUES (?, ?, ?)
    `).run(memberId, (role as any).id, assignedBy || null);

    db.prepare(`
      UPDATE members SET updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).run(memberId);
    
    return { success: true, message: "Role added successfully" };
  } catch (error: any) {
    console.error("Error adding role:", error);
    return { success: false, error: error.message };
  }
}

export async function removeRoleFromMember(memberId: number, roleName: string) {
  try {
    const db = await getDatabase();

    const role = await getRoleByName(roleName);
    if (!role) {
      return { success: false, error: `Role '${roleName}' not found` };
    }

    db.prepare(`
      DELETE FROM member_roles 
      WHERE member_id = ? AND role_id = ?
    `).run(memberId, (role as any).id);

    const remainingRoles = await getMemberRoles(memberId);
    if (remainingRoles.length === 0) {
      await addRoleToMember(memberId, 'student');
    }

    db.prepare(`
      UPDATE members SET updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).run(memberId);
    
    return { success: true, message: "Role removed successfully" };
  } catch (error: any) {
    console.error("Error removing role:", error);
    return { success: false, error: error.message };
  }
}

export async function setMemberRoles(memberId: number, roleNames: string[], assignedBy?: number) {
  try {
    const db = await getDatabase();

    for (const roleName of roleNames) {
      const role = await getRoleByName(roleName);
      if (!role) {
        return { success: false, error: `Role '${roleName}' not found` };
      }
    }

    db.prepare(`DELETE FROM member_roles WHERE member_id = ?`).run(memberId);

    for (const roleName of roleNames) {
      await addRoleToMember(memberId, roleName, assignedBy);
    }

    if (roleNames.length === 0) {
      await addRoleToMember(memberId, 'student', assignedBy);
    }
    
    return { success: true, message: "Roles updated successfully" };
  } catch (error: any) {
    console.error("Error setting roles:", error);
    return { success: false, error: error.message };
  }
}

export async function getMembersByRole(roleName: string) {
  const db = await getDatabase();
  return db.prepare(`
    SELECT DISTINCT m.*
    FROM members m
    INNER JOIN member_roles mr ON m.id = mr.member_id
    INNER JOIN roles r ON mr.role_id = r.id
    WHERE r.role_name = ?
    ORDER BY m.full_name ASC
  `).all(roleName);
}

export async function getAllMembersWithRoles() {
  const db = await getDatabase();
  const members = db.prepare(`
    SELECT * FROM members ORDER BY full_name ASC
  `).all();
  
  const membersWithRoles = [];
  for (const member of members as any[]) {
    const roles = await getMemberRoles(member.id);
    membersWithRoles.push({
      ...member,
      roles: roles.map((r: any) => r.role_name),
      roleDetails: roles
    });
  }
  
  return membersWithRoles;
}

export async function initializeMemberRoles(memberId: number) {
  return await addRoleToMember(memberId, 'student');
}
