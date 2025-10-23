/**
 * Signup Page Component
 * 
 * Provides user registration interface for the Tech Media Hub system.
 * Handles new user account creation with email/password registration,
 * validates Campion College email domains, and manages the signup process.
 * 
 * Features:
 * - Email domain validation (@campioncollege.com only)
 * - Password-based account creation
 * - Server-side user registration handling
 * - Loading states and error handling
 * - Responsive design with Campion College branding
 * - Navigation to dashboard on successful registration
 * 
 * Security:
 * - Restricts registration to Campion College email addresses only
 * - Secure password transmission to server for hashing
 * - Duplicate email validation handled server-side
 * 
 * @author Tech Media Hub Team
 * @version 1.0
 * @since 2024
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import Image from "next/image";
import CampionBanner from "../../../res/images/CampionBanner.png";
import { signUp } from "@/lib/serverUtils";

/**
 * SignupPage Component
 * 
 * Main signup page component that handles user registration
 * and redirects to dashboard on successful account creation.
 */
export default function SignupPage() {
    const router = useRouter(); // Next.js router for navigation
    
    // Form state management
    const [email, setEmail] = useState("");         // User's email input
    const [password, setPassword] = useState("");   // User's password input
    const [errorMsg, setErrorMsg] = useState("");   // Error message display
    const [loading, setLoading] = useState(false);  // Loading state during registration

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");

        if (!email.trim().toLowerCase().endsWith("@campioncollege.com")) {
            setErrorMsg("Only @campioncollege.com email addresses are allowed.");
            return;
        }

        setLoading(true);
        const { error } = await signUp({ email, password });
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
                    <div className="w-full flex pb-4 justify-center pointer-events-none">
                        <Image
                            src={CampionBanner}
                            alt="Campion Banner"
                            className="w-[70%] aspect-auto"
                        />
                    </div>

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
