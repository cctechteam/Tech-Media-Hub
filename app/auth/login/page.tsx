"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import Image from "next/image";
import CampionBanner from "../../../res/images/CampionBanner.png";
import { saveSessionToken } from "@/lib/utils";
import { signInWithPassword } from "@/lib/serverUtils";

export default function LoginPage() {
    const router = useRouter(); 

    const [email, setEmail] = useState("");  
    const [password, setPassword] = useState(""); 
    const [errorMsg, setErrorMsg] = useState("");
    const [loading, setLoading] = useState(false); 

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");

        if (!email.trim()) {
            setErrorMsg("Email is required.");
            return;
        }

        if (!password.trim()) {
            setErrorMsg("Password is required.");
            return;
        }

        if (!email.trim().toLowerCase().endsWith("@campioncollege.com")) {
            setErrorMsg("Only @campioncollege.com email addresses are allowed.");
            return;
        }

        setLoading(true);
        const { error, token } = await signInWithPassword({ email, password });
        setLoading(false);

        if (error) {
            setErrorMsg(error.message);
        } else {
            saveSessionToken(token ?? "");
            document.cookie = `session_token=${token}; path=/; max-age=2592000`;
            router.push("/dashboard");
        }
    };

    return (
        <main className="flex flex-col min-h-screen w-full">
            <Navbar />

            <section className="w-full py-12 px-6 md:px-16 lg:px-24 flex justify-center bg-gradient-to-br from-gray-50 via-red-50/30 to-gray-50 flex-1">
                <div className="p-8 md:p-10 rounded-3xl shadow-2xl bg-white border border-gray-100 w-full max-w-md transform transition-all hover:shadow-3xl">
                    <div className="w-full flex pb-6 justify-center pointer-events-none">
                        <Image
                            src={CampionBanner}
                            alt="Campion Banner"
                            className="w-[70%] aspect-auto drop-shadow-md"
                        />
                    </div>

                    <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">Welcome Back</h2>
                    <p className="text-center text-gray-500 text-sm mb-8">Sign in to your account</p>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="relative">
                            <input
                                type="email"
                                placeholder="Email (@campioncollege.com)"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-3.5 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-white text-gray-900 transition-all placeholder:text-gray-400"
                                required
                            />
                        </div>
                        <div className="relative">
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-3.5 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-white text-gray-900 transition-all placeholder:text-gray-400"
                                required
                            />
                        </div>
                        {errorMsg && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-r-lg">
                                <p className="text-red-600 text-sm font-medium">{errorMsg}</p>
                            </div>
                        )}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3.5 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Logging in...
                                </span>
                            ) : "Login"}
                        </button>
                    </form>
                    <div className="mt-6 pt-6 border-t border-gray-100">
                        <p className="text-sm text-gray-600 text-center">
                            Don&apos;t have an account?{" "}
                            <a href="/auth/signup" className="text-red-600 hover:text-red-700 font-semibold hover:underline transition-colors">
                                Sign up
                            </a>
                        </p>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
