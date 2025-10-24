/**
 * Signup Page Component
 * 
 * Provides user registration interface for the Tech Media Hub system.
 * Handles new user account creation with full name collection, email/password registration,
 * validates Campion College email domains, and manages the signup process.
 * 
 * Features:
 * - First name and last name collection with grid layout
 * - Email domain validation (@campioncollege.com only)
 * - Password confirmation with matching validation
 * - Password strength requirements (minimum 6 characters)
 * - Comprehensive form validation and error handling
 * - Server-side user registration with full name storage
 * - Loading states and improved error messaging
 * - Modern responsive design with enhanced styling
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
    const [firstName, setFirstName] = useState(""); // User's first name input
    const [lastName, setLastName] = useState("");   // User's last name input
    const [email, setEmail] = useState("");         // User's email input
    const [password, setPassword] = useState("");   // User's password input
    const [confirmPassword, setConfirmPassword] = useState(""); // Password confirmation
    const [errorMsg, setErrorMsg] = useState("");   // Error message display
    const [loading, setLoading] = useState(false);  // Loading state during registration

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");

        // Validate required fields
        if (!firstName.trim()) {
            setErrorMsg("First name is required.");
            return;
        }

        if (!lastName.trim()) {
            setErrorMsg("Last name is required.");
            return;
        }

        if (!email.trim().toLowerCase().endsWith("@campioncollege.com")) {
            setErrorMsg("Only @campioncollege.com email addresses are allowed.");
            return;
        }

        if (password.length < 6) {
            setErrorMsg("Password must be at least 6 characters long.");
            return;
        }

        if (password !== confirmPassword) {
            setErrorMsg("Passwords do not match.");
            return;
        }

        setLoading(true);
        const fullName = `${firstName.trim()} ${lastName.trim()}`;
        const { error } = await signUp({ email, password, fullName });
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
            <section className="w-full py-12 px-6 md:px-16 lg:px-24 flex justify-center bg-gray-50 flex-1">
                <div className="p-8 rounded-2xl shadow-xl bg-white border border-gray-200 w-full max-w-md">
                    <div className="w-full flex pb-4 justify-center pointer-events-none">
                        <Image
                            src={CampionBanner}
                            alt="Campion Banner"
                            className="w-[70%] aspect-auto"
                        />
                    </div>

                    <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Create Account</h2>

                    <form onSubmit={handleSignup} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <input
                                type="text"
                                placeholder="First Name"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="w-full p-3 rounded border border-gray-700 focus:outline-none focus:border-red-500 bg-white text-gray-900"
                                required
                            />
                            <input
                                type="text"
                                placeholder="Last Name"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="w-full p-3 rounded border border-gray-700 focus:outline-none focus:border-red-500 bg-white text-gray-900"
                                required
                            />
                        </div>
                        <input
                            type="email"
                            placeholder="Email (@campioncollege.com)"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 rounded border border-gray-700 focus:outline-none focus:border-red-500 bg-white text-gray-900"
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password (min 6 chars)"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 rounded border border-gray-700 focus:outline-none focus:border-red-500 bg-white text-gray-900"
                            required
                            minLength={6}
                        />
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full p-3 rounded border border-gray-700 focus:outline-none focus:border-red-500 bg-white text-gray-900"
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
