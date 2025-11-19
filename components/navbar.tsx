"use client";

import Image from "next/image";
import Logo from "../res/images/Campion_Logo.png";
import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { CombineNavLinks, CreateNavLink, NavLink, RenderNavLinks } from "./navlinks";
import { fetchCurrentUser } from "@/lib/serverUtils";
import { retrieveSessionToken, deleteSessionToken } from "@/lib/utils";
import { signOut } from "@/lib/serverUtils";

const Navlinks: NavLink[] = CombineNavLinks(
    CreateNavLink("Home", "/"),
    CreateNavLink("Tools", "/tools"),
    CreateNavLink("Student", "/student"),
    CreateNavLink("Staff", "/staff"),
    CreateNavLink("Admin", "/admin"),
    CreateNavLink("Tech Team", "/tech-team"),
);

export default function Navbar() {
    const [user, setUser] = useState<any | null>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (!isClient) return;
        
        (async () => {
            const cuser = await fetchCurrentUser(retrieveSessionToken(), window.location.pathname != "/auth/signup" && window.location.pathname != "/auth/login" && window.location.pathname != "/");

            setUser(cuser ?? null);
        })();
    }, [isClient]);

    const handleLogout = async () => {
        await signOut();
        deleteSessionToken();
        setUser(null);
        redirect("/auth/login");
    };

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm backdrop-blur-sm bg-white/95">
            <div className="container mx-auto flex justify-between items-center py-3 px-6">
                <a href="/" className="flex items-center space-x-3 group">
                    <div className="relative">
                        <Image
                            src={Logo}
                            alt="Campion College Logo"
                            width={56}
                            height={56}
                            className="aspect-auto transition-transform duration-300 group-hover:scale-105"
                        />
                    </div>
                    <div className="flex flex-col justify-center">
                        <span className="text-xl font-bold leading-tight transition-colors" style={{color: '#8B1538'}}>
                            Campion College
                        </span>
                        <span className="text-sm font-semibold leading-tight text-gray-600">
                            Resources & Tools Hub
                        </span>
                    </div>
                </a>

                <nav className="hidden md:flex space-x-1 font-medium items-center mx-auto relative z-[60]">
                    <RenderNavLinks links={Navlinks} />
                </nav>

                <div className="ml-6 inline-flex rounded-lg overflow-hidden shadow-sm">
                    {user ? (
                        <>
                            <a
                                href="/dashboard"
                                className="px-5 py-2.5 font-semibold bg-gray-50 hover:bg-gray-100 transition-all duration-300"
                                style={{color: '#8B1538'}}
                            >
                                Dashboard
                            </a>
                            <button
                                onClick={handleLogout}
                                className="px-5 py-2.5 text-white font-semibold transition-all duration-300 hover:shadow-md border-l border-gray-200"
                                style={{backgroundColor: '#8B1538'}}
                                onMouseEnter={(e) => {
                                    (e.target as HTMLElement).style.backgroundColor = '#6D1028';
                                    (e.target as HTMLElement).style.transform = 'translateY(-1px)';
                                }}
                                onMouseLeave={(e) => {
                                    (e.target as HTMLElement).style.backgroundColor = '#8B1538';
                                    (e.target as HTMLElement).style.transform = 'translateY(0)';
                                }}
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <a
                                href="/auth/login"
                                className="px-5 py-2.5 text-white font-semibold transition-all duration-300 hover:shadow-md"
                                style={{backgroundColor: '#8B1538'}}
                                onMouseEnter={(e) => {
                                    (e.target as HTMLElement).style.backgroundColor = '#6D1028';
                                    (e.target as HTMLElement).style.transform = 'translateY(-1px)';
                                }}
                                onMouseLeave={(e) => {
                                    (e.target as HTMLElement).style.backgroundColor = '#8B1538';
                                    (e.target as HTMLElement).style.transform = 'translateY(0)';
                                }}
                            >
                                Login
                            </a>
                            <a
                                href="/auth/signup"
                                className="px-5 py-2.5 font-semibold bg-gray-50 hover:bg-gray-100 transition-all duration-300 border-l border-gray-200"
                                style={{color: '#8B1538'}}
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
