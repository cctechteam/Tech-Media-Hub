"use client";

import Image from "next/image";
import Logo from "../res/images/logo.png";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/database";
import { redirect } from "next/navigation";

type NavLink = {
    text: string;
    href?: string;
    sublinks?: { text: string; href: string }[];
};

const Navlinks: NavLink[] = [
    { text: "Home", href: "/" },
    { text: "Fact Book", href: "https://www.campioncollege.com/?p=factBook" },
    { text: "About", href: "/#about" },
    {
        text: "Academics",
        sublinks: [
            { text: "Faculty", href: "https://www.campioncollege.com/?p=faculty" },
        ],
    },
    {
        text: "Student",
        sublinks: [
            { text: "Policies", href: "https://www.campioncollege.com/?p=policies" },
            { text: "Clubs & Societies", href: "https://www.campioncollege.com/?p=clubs_sports" },
            { text: "Beedle Report", href: "/beedle" },
        ],
    },
    { text: "Contact", href: "#contact" },
];

export default function Navbar() {
    const [user, setUser] = useState<any | null>(null);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setUser(data.session?.user ?? null);
        });

        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            const userStored = user;
            setUser(session?.user ?? null);
            if (userStored && session?.user == null) redirect("/auth/login");
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
                    {Navlinks.map((x, i) =>
                        x.sublinks ? (
                            <div
                                key={i}
                                className="relative group"
                            >
                                <button
                                    onMouseEnter={() => setOpenDropdown(x.text)}
                                    className="hover:text-gray-900 transition-colors text-base text-gray-700"
                                >
                                    {x.text} ▼
                                </button>
                                {openDropdown === x.text && (
                                    <div
                                        className="absolute left-0 mt-0 w-48 bg-white border border-gray-200 rounded shadow-lg z-50"
                                        onMouseEnter={() => setOpenDropdown(x.text)}
                                        onMouseLeave={() => setOpenDropdown(null)}
                                    >
                                        {x.sublinks.map((sub, j) => (
                                            <a
                                                key={j}
                                                href={sub.href}
                                                className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                                            >
                                                {sub.text}
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>

                        ) : (
                            <a
                                href={x.href}
                                key={i}
                                className="hover:text-gray-900 transition-colors text-base text-gray-700"
                            >
                                {x.text}
                            </a>
                        )
                    )}
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
