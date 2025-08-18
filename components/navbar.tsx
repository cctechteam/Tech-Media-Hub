"use client";

import Image from "next/image";
import Logo from "../res/images/logo.png";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/database";
import { redirect } from "next/navigation";
import { CombineNavLinks, CreateNavLink, NavLink, RenderNavLinks } from "./navlinks";
import { fetchCurrentUser } from "@/lib/utils";
import { useRouter } from "next/router";

const Navlinks: NavLink[] = CombineNavLinks(
    CreateNavLink("Home", "/"),
    CreateNavLink("Fact Book", "https://www.campioncollege.com/?p=factBook"),
    CreateNavLink("About", "/#about"),
    CreateNavLink("Academics", undefined, [
        CreateNavLink("Faculty", "https://www.campioncollege.com/?p=faculty")
    ]),
    CreateNavLink("Student", undefined, [
        CreateNavLink("Policies", "https://www.campioncollege.com/?p=policies"),
        CreateNavLink("Clubs & Societies", "https://www.campioncollege.com/?p=clubs_sports"),
        CreateNavLink("Beedle Report", "/beedle")
    ]),
    CreateNavLink("Contact", "#contact")
);

export default function Navbar() {
    const [user, setUser] = useState<any | null>(null);

    useEffect(() => {
        fetchCurrentUser((cuser) => {
            setUser(cuser ?? null);
        }, true, window.location.pathname != "/auth/signup" && window.location.pathname != "/auth/login");

        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (_event == "SIGNED_OUT") {
                redirect("/auth/login");
            }
        });

        return () => {
            listener.subscription.unsubscribe();
        };
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        redirect("/auth/login");
    };

    return (
        <header className="bg-white border-b border-gray-300 sticky z-50 top-0">
            <div className="container mx-auto flex justify-between items-center py-4 px-6">
                <div className="flex items-center space-x-3">
                    <Image
                        src={Logo}
                        alt="Tech Team Logo"
                        width={90}
                        height={48}
                        className="aspect-auto pointer-events-none"
                    />
                    <div className="flex flex-col items-center space-x-3 pointer-events-none">
                        <span className="text-2xl font-bold text-red-600">
                            Campion College
                        </span>
                        <span className="text-xl font-bold text-red-500">
                            Technology & Media Production
                        </span>
                    </div>
                </div>

                {/* Desktop Links */}
                <nav className="hidden md:flex space-x-8 font-medium items-center mx-auto relative">
                    <RenderNavLinks links={Navlinks} />
                </nav>

                {/* Login / Signup / Logout */}
                <div className="ml-6 inline-flex rounded-md overflow-hidden">
                    {user ? (
                        <>
                            <a
                                href="/dashboard"
                                className="px-3 py-1.5 bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors"
                            >
                                Dashboard
                            </a>
                            <button
                                onClick={handleLogout}
                                className="px-3 py-1.5 text-red-600 font-thin hover:bg-gray-200 transition-colors"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <a
                                href="/auth/login"
                                className="px-3 py-1.5 bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors"
                            >
                                Login
                            </a>
                            <a
                                href="/auth/signup"
                                className="px-3 py-1.5 text-red-600 font-semibold hover:bg-gray-200 transition-colors border-l border-red-600"
                            >
                                Signup
                            </a>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
