"use client";

import { useState } from "react";
import { supabase } from "@/lib/database";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export default function SignupPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");

        if (!email.trim().toLowerCase().endsWith("@campioncollege.com")) {
            setErrorMsg("Only @campioncollege.com email addresses are allowed.");
            return;
        }

        setLoading(true);
        const { error } = await supabase.auth.signUp({ email, password });
        setLoading(false);

        if (error) {
            setErrorMsg(error.message);
        } else {
            router.push("/dashboard");
        }
    };

    return (
        <main className="flex flex-col min-h-screen w-full">
            <Navbar />

            {/* Form Section */}
            <section className="w-full py-12 px-6 md:px-16 lg:px-24 flex justify-center">
                <div className="p-8 rounded-2xl shadow-lg w-full max-w-md">
                    <h1 className="text-3xl font-bold text-red-500 mb-6 text-center">
                        Sign Up
                    </h1>
                    <form onSubmit={handleSignup} className="space-y-4">
                        <input
                            type="email"
                            placeholder="Email (@campioncollege.com)"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 rounded border border-gray-700 focus:outline-none focus:border-red-500"
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password (min 6 chars)"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 rounded border border-gray-700 focus:outline-none focus:border-red-500"
                            required
                        />
                        {errorMsg && <p className="text-red-400 text-sm">{errorMsg}</p>}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded font-semibold transition-colors disabled:opacity-50"
                        >
                            {loading ? "Signing up..." : "Sign Up"}
                        </button>
                    </form>
                    <p className="mt-4 text-sm text-gray-400 text-center">
                        Already have an account?{" "}
                        <a href="/auth/login" className="text-red-500 hover:underline">
                            Login
                        </a>
                    </p>
                </div>
            </section>

            <Footer />
        </main>
    );
}
