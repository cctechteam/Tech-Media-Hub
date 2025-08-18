import { redirect } from "next/navigation";
import { supabase } from "./database";

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

// Fetches the corresponing record from public.members whose id matchs current session user
export async function fetchCurrentUser(setUser: (value?: any) => void, setOnError = false, redirectToLogin = true) {
    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
        if (redirectToLogin)
            redirect("/auth/login");
        else if (setOnError)
            setUser(undefined);
    }

    const { data, error } = await supabase
        .from("members")
        .select("*")
        .eq("id", session.user.id)
        .single();

    if (error) {
        console.error("Error fetching member:", error.message);
        if (setOnError)
            setUser(undefined)
    } else {
        setUser(data);
    }
}

// Fetches all records from public.members
export async function fetchUsers(setUsers: (value: any) => void) {
    const { data, error } = await supabase
        .from("members")
        .select("*");

    if (error) {
        console.error("Error fetching members:", error.message);
    } else {
        setUsers(data);
    }
}

// Fetches all records from public.announcements
export async function fetchAnnouncements(setAnnouncements: (value: any) => void) {
    const { data, error } = await supabase
        .from("announcements")
        .select("*");

    if (error) {
        console.error("Error fetching announcements:", error.message);
    } else {
        setAnnouncements(data);
    }
}

// Add a record from public.announcements
export async function createAnnouncement(title: string, priority: string, content: string) {
    const { error } = await supabase
        .from("announcements")
        .insert({ title, priority, content });

    if (error) {
        console.error("Error creating announcement:", error.message);
    }
}

// Add a record from public.announcements
export async function deleteAnnouncement(id: number) {
    const { error } = await supabase
        .from("announcements")
        .delete()
        .eq("id", id);

    if (error) {
        console.error("Error creating announcement:", error.message);
    }
}

// e.g. "15/08/2025"
export function formatDate(date: any) {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}