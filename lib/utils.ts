"use client";

import { getDatabase } from "./database";

export type Role = "admin" | "supervisor" | "member" | "guest";

// Assign numeric values to roles
const RoleValue: { [role in Role]: number } = {
    admin: 3,
    supervisor: 2,
    member: 1,
    guest: 0,
};

// Convert Role to numeric value
export function RoleToValue(role: Role): number {
    return RoleValue[role];
}

// Convert numeric value back to Role
export function ValueToRole(roleValue: number): Role {
    const entry = Object.entries(RoleValue).find(([_, value]) => value === roleValue);
    if (!entry) throw new Error(`Invalid role value: ${roleValue}`);
    return entry[0] as Role;
}

// Determines if a role is admin or not
export function IsAdmin(role: Role | number): boolean {
    const _role = typeof role === "string" ? role : ValueToRole(role);
    return _role === "admin";
}

// e.g. "15/08/2025"
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
}

export function retrieveSessionToken(): string {
    return localStorage.getItem("session") ?? "";
}