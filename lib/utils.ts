import { redirect } from "next/navigation";
import { supabase } from "./database";


export async function fetchCurrentUser(setUser: (value: any) => void) {
    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
        redirect("/auth/login");
    }

    const { data, error } = await supabase
        .from("members")
        .select("*")
        .eq("id", session.user.id)
        .single();

    if (error) {
        console.error("Error fetching member:", error.message);
    } else {
        setUser(data);
    }
}