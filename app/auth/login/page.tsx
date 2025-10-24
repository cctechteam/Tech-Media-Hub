/**
 * Login Page Component
 * 
 * Provides user authentication interface for the Tech Media Hub system.
 * Handles user login with email/password authentication, validates
 * Campion College email domains, and manages session tokens.
 * 
 * Features:
 * - Email domain validation (@campioncollege.com only)
 * - Enhanced form validation with required field checks
 * - Password authentication with server-side verification
 * - Session token management and storage
 * - Improved loading states and error handling
 * - Modern responsive design with enhanced styling
 * - Navigation to dashboard on successful login
 * 
 * Security:
 * - Restricts access to Campion College email addresses only
 * - Secure password transmission to server
 * - Session token storage in localStorage
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
import { saveSessionToken } from "@/lib/utils";
import { signInWithPassword } from "@/lib/serverUtils";

/**
 * LoginPage Component
 * 
 * Main login page component that handles user authentication
 * and redirects to dashboard on successful login.
 */
export default function LoginPage() {
    const router = useRouter(); // Next.js router for navigation
    
    // Form state management
    const [email, setEmail] = useState("");         // User's email input
    const [password, setPassword] = useState("");   // User's password input
    const [errorMsg, setErrorMsg] = useState("");   // Error message display
    const [loading, setLoading] = useState(false);  // Loading state during authentication

    /**
     * Handles user login form submission
     * 
     * Process:
     * 1. Validates email domain (@campioncollege.com only)
     * 2. Calls server authentication function
     * 3. Stores session token on success
     * 4. Redirects to dashboard or shows error
     * 
     * @param e - Form submission event
     */
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(""); // Clear any previous error messages

        // Validate required fields
        if (!email.trim()) {
            setErrorMsg("Email is required.");
            return;
        }

        if (!password.trim()) {
            setErrorMsg("Password is required.");
            return;
        }

        // Validate email domain - only Campion College emails allowed
        if (!email.trim().toLowerCase().endsWith("@campioncollege.com")) {
            setErrorMsg("Only @campioncollege.com email addresses are allowed.");
            return;
        }

        setLoading(true);
        // Attempt authentication with server
        const { error, token } = await signInWithPassword({ email, password });
        setLoading(false);

        if (error) {
            // Display authentication error to user
            setErrorMsg(error.message);
        } else {
            // Save session token and redirect to dashboard
            saveSessionToken(token ?? "");
            router.push("/dashboard");
        }
    };

    return (
        <main className="flex flex-col min-h-screen w-full">
            <Navbar />

            {/* Form Section */}
            <section className="w-full py-12 px-6 md:px-16 lg:px-24 flex justify-center bg-gray-50 flex-1">
                <div className="p-8 rounded-2xl shadow-xl bg-white border border-gray-200 w-full max-w-md">
                    <div className="w-full flex pb-4 justify-center pointer-events-none">
                        <Image
                            src={CampionBanner}
                            alt="Campion Banner"
                            className="w-[70%] aspect-auto"
                        />
                    </div>

                    <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Welcome Back</h2>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <input
                            type="email"
                            placeholder="Email (@campioncollege.com)"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 rounded border border-gray-700 focus:outline-none focus:border-red-500 bg-white text-gray-900 transition-colors"
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 rounded border border-gray-700 focus:outline-none focus:border-red-500 bg-white text-gray-900 transition-colors"
                            required
                        />
                        {errorMsg && <p className="text-red-400 text-sm">{errorMsg}</p>}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded font-semibold transition-colors disabled:opacity-50"
                        >
                            {loading ? "Logging in..." : "Login"}
                        </button>
                    </form>
                    <p className="mt-4 text-sm text-gray-400 text-center">
                        Don&apos;t have an account?{" "}
                        <a href="/auth/signup" className="text-red-500 hover:underline">
                            Sign up
                        </a>
                    </p>
                </div>
            </section>

            <Footer />
        </main>
    );
}
