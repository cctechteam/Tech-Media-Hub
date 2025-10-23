/**
 * Utility Functions and Helpers
 * 
 * This module provides common utility functions used throughout the
 * Tech Media Hub application. Includes role management, date formatting,
 * and session token handling for client-side operations.
 * 
 * Key Features:
 * - User role management with numeric values
 * - Date formatting utilities
 * - Session token management (localStorage)
 * - Type-safe role conversions
 * - Admin privilege checking
 * 
 * @author Tech Media Hub Team
 * @version 1.0
 * @since 2024
 */

"use client";

import { getDatabase } from "./database";

/**
 * User Role Type Definition
 * 
 * Defines the available user roles in the system with hierarchical levels:
 * - guest: No special privileges (level 0)
 * - member: Basic user privileges (level 1)
 * - supervisor: Form supervisor privileges (level 2)
 * - admin: Full system administration privileges (level 3)
 */
export type Role = "admin" | "supervisor" | "member" | "guest";

/**
 * Role Value Mapping
 * 
 * Maps role names to numeric values for database storage and comparison.
 * Higher numbers indicate higher privilege levels.
 */
const RoleValue: { [role in Role]: number } = {
    admin: 3,      // Full system access
    supervisor: 2, // Form supervision and reporting
    member: 1,     // Basic user access
    guest: 0,      // Limited/no access
};

/**
 * Converts a Role string to its numeric value
 * 
 * @param role - The role string to convert
 * @returns Numeric value representing the role level
 */
export function RoleToValue(role: Role): number {
    return RoleValue[role];
}

/**
 * Converts a numeric role value back to Role string
 * 
 * @param roleValue - Numeric role value from database
 * @returns Role string corresponding to the numeric value
 * @throws Error if roleValue is invalid
 */
export function ValueToRole(roleValue: number): Role {
    const entry = Object.entries(RoleValue).find(([_, value]) => value === roleValue);
    if (!entry) throw new Error(`Invalid role value: ${roleValue}`);
    return entry[0] as Role;
}

/**
 * Checks if a role has admin privileges
 * 
 * @param role - Role string or numeric value to check
 * @returns True if the role is admin, false otherwise
 */
export function IsAdmin(role: Role | number): boolean {
    const _role = typeof role === "string" ? role : ValueToRole(role);
    return _role === "admin";
}

/**
 * Checks if a user has admin privileges (supports new roles array system)
 * 
 * @param user - User object with role or roles property
 * @returns True if the user has admin privileges, false otherwise
 */
export function IsUserAdmin(user: any): boolean {
    if (!user) return false;
    
    // Check new roles array system first
    if (user.roles && Array.isArray(user.roles)) {
        return user.roles.includes('admin') || user.roles.includes('super_admin');
    }
    
    // Fallback to old role system
    if (user.role !== undefined) {
        return IsAdmin(user.role);
    }
    
    return false;
}

/**
 * Checks if a user has super admin privileges
 * 
 * Super Admin is the highest level role, reserved for the principal and other
 * high-level administrators. Super Admins have all admin privileges plus
 * additional system-wide permissions.
 * 
 * @param user - User object with roles property
 * @returns True if the user has super admin privileges, false otherwise
 */
export function IsUserSuperAdmin(user: any): boolean {
    if (!user) return false;
    
    // Check if user has super_admin role
    if (user.roles && Array.isArray(user.roles)) {
        return user.roles.includes('super_admin');
    }
    
    return false;
}

/**
 * Formats a date object or string to DD/MM/YYYY format
 * 
 * @param date - Date object, string, or any date-like value
 * @returns Formatted date string in DD/MM/YYYY format (e.g., "15/08/2025")
 */
export function formatDate(date: any) {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}

/**
 * Saves a session token to localStorage
 * 
 * @param token - Session token string to store
 */
export function saveSessionToken(token: string) {
    localStorage.setItem("session", token);
}

/**
 * Removes the session token from localStorage
 * Used during logout to clear authentication state
 */
export function deleteSessionToken() {
    localStorage.removeItem("session");
}

/**
 * Retrieves the current session token from localStorage
 * 
 * @returns Session token string, or empty string if not found
 */
export function retrieveSessionToken(): string {
    return localStorage.getItem("session") ?? "";
}