"use client";

export type Role = "admin" | "supervisor" | "member" | "guest";

const RoleValue: { [role in Role]: number } = {
    admin: 3,
    supervisor: 2,
    member: 1,
    guest: 0,
};

export function RoleToValue(role: Role): number {
    return RoleValue[role];
}

export function ValueToRole(roleValue: number): Role {
    const entry = Object.entries(RoleValue).find(([_, value]) => value === roleValue);
    if (!entry) throw new Error(`Invalid role value: ${roleValue}`);
    return entry[0] as Role;
}

export function IsAdmin(role: Role | number): boolean {
    const _role = typeof role === "string" ? role : ValueToRole(role);
    return _role === "admin";
}

export function IsUserAdmin(user: any): boolean {
    if (!user) return false;
    
    if (user.roles && Array.isArray(user.roles)) {
        return user.roles.includes('admin') || user.roles.includes('super_admin');
    }
    
    if (user.role !== undefined) {
        return IsAdmin(user.role);
    }
    
    return false;
}

export function IsUserSuperAdmin(user: any): boolean {
    if (!user) return false;
    
    if (user.roles && Array.isArray(user.roles)) {
        return user.roles.includes('super_admin');
    }
    
    return false;
}

export function formatDate(date: any) {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}

export function saveSessionToken(token: string) {
    localStorage.setItem("session", token);
}

export function deleteSessionToken() {
    localStorage.removeItem("session");
    document.cookie = "session_token=; path=/; max-age=0";
}

export function retrieveSessionToken(): string {
    return localStorage.getItem("session") ?? "";
}

export function getPrimaryRole(user: any): string {
    try {
        if (!user || !user.roles || !Array.isArray(user.roles) || user.roles.length === 0) {
            return 'student';
        }
        
        if (user.roles.includes('super_admin')) return 'super_admin';
        if (user.roles.includes('admin')) return 'admin';
        if (user.roles.includes('supervisor')) return 'supervisor';
        if (user.roles.includes('beadle')) return 'beadle';
        if (user.roles.includes('student')) return 'student';
        
        return 'student';
    } catch (error) {
        console.error('Error in getPrimaryRole:', error);
        return 'student';
    }
}

export function getAllRoles(user: any): string {
    try {
        if (!user || !user.roles || !Array.isArray(user.roles) || user.roles.length === 0) {
            return 'Student';
        }
        
        return user.roles
            .filter((role: string) => role && typeof role === 'string')
            .map((role: string) => role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' '))
            .join(', ') || 'Student';
    } catch (error) {
        console.error('Error in getAllRoles:', error);
        return 'Student';
    }
}

export function hasRole(user: any, role: string): boolean {
    try {
        if (!user || !user.roles || !Array.isArray(user.roles) || !role || typeof role !== 'string') {
            return role === 'student';
        }
        
        return user.roles.includes(role);
    } catch (error) {
        console.error('Error in hasRole:', error);
        return role === 'student';
    }
}