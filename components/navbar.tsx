"use client";

import Image from "next/image";
import Logo from "../res/images/logo.png";
import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { CombineNavLinks, CreateNavLink, NavLink, RenderNavLinks } from "./navlinks";
import { fetchCurrentUser } from "@/lib/serverUtils";
import { retrieveSessionToken, deleteSessionToken } from "@/lib/utils";
import { signOut } from "@/lib/serverUtils";

const Navlinks: NavLink[] = CombineNavLinks(
    CreateNavLink("Home", "/"),
    CreateNavLink("About", "/#about"),
    CreateNavLink("Student", undefined, [
        CreateNavLink("Resources", "/resources"),
        CreateNavLink("Beedle Report", "/beedle"),
        CreateNavLink("Beedle Dashboard", "/beedle/view")
    ]),
    CreateNavLink("Admin", undefined, [
        CreateNavLink("Email Reports", "/admin/email-reports")
    ]),
);

export default function Navbar() {
    const [user, setUser] = useState<any | null>(null);

    useEffect(() => {
        (async () => {
            const cuser = await fetchCurrentUser(retrieveSessionToken(), window.location.pathname != "/auth/signup" && window.location.pathname != "/auth/login" && window.location.pathname != "/");

            setUser(cuser ?? null);
        })();
    }, []);

    const handleLogout = async () => {
        await signOut();
        deleteSessionToken();
        setUser(null);
        redirect("/auth/login");
    };

    return (
        <header className="bg-white border-b border-gray-300 sticky top-0 z-50">
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
