/**
 * Navigation Bar Component
 * 
 * Main navigation component for the Tech Media Hub application.
 * Provides responsive navigation with user authentication state management,
 * role-based menu items, and logout functionality.
 * 
 * Features:
 * - Responsive design with mobile hamburger menu
 * - User authentication state display
 * - Role-based navigation items (Student, Supervisor, Admin)
 * - Dropdown menus for organized navigation
 * - Logout functionality with session cleanup
 * - Campion College branding and logo
 * 
 * @author Tech Media Hub Team
 * @version 1.0
 * @since 2024
 */

"use client";

import Image from "next/image";
import Logo from "../res/images/logo.png";
import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { CombineNavLinks, CreateNavLink, NavLink, RenderNavLinks } from "./navlinks";
import { fetchCurrentUser } from "@/lib/serverUtils";
import { retrieveSessionToken, deleteSessionToken } from "@/lib/utils";
import { signOut } from "@/lib/serverUtils";

/**
 * Navigation Links Configuration
 * 
 * Defines the complete navigation structure for the application.
 * Organized by user roles and functionality areas:
 * - Home: Landing page
 * - Resources: Technology resource library
 * - Student: Beedle attendance reporting
 * - Supervisor: Dashboard and report viewing
 * - Admin: System administration and email reports
 */
const Navlinks: NavLink[] = CombineNavLinks(
    CreateNavLink("Home", "/"),
    CreateNavLink("Resources", "/resources"),
    CreateNavLink("Student", undefined, [
        CreateNavLink("Beedle Report", "/beedle")
    ]),
    CreateNavLink("Supervisor", undefined, [
        CreateNavLink("Beedle Dashboard", "/beedle/view"),
        CreateNavLink("Supervisor Dashboard", "/supervisor/dashboard")
    ]),
    CreateNavLink("Admin", undefined, [
        CreateNavLink("Dashboard", "/admin"),
        CreateNavLink("Email Reports", "/admin/email-reports")
    ]),
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
        <header className="bg-white border-b border-gray-300 sticky top-0 z-50">
            <div className="container mx-auto flex justify-between items-center py-4 px-6">
                <div className="flex items-center space-x-4">
                    <Image
                        src={Logo}
                        alt="Tech Team Logo"
                        width={90}
                        height={48}
                        className="aspect-auto pointer-events-none"
                    />
                    <div className="flex flex-col justify-center pointer-events-none">
                        <span className="text-2xl font-bold leading-tight" style={{color: '#8B1538'}}>
                            Campion College
                        </span>
                        <span className="text-lg font-semibold leading-tight" style={{color: '#A91B47'}}>
                            Technology & Media Production
                        </span>
                    </div>
                </div>

                {/* Desktop Links */}
                <nav className="hidden md:flex space-x-2 font-medium items-center mx-auto relative">
                    <RenderNavLinks links={Navlinks} />
                </nav>

                {/* Login / Signup / Logout */}
                <div className="ml-6 inline-flex rounded-md overflow-hidden">
                    {user ? (
                        <>
                            <a
                                href="/dashboard"
                                className="px-3 py-1.5 text-white font-semibold transition-colors"
                                style={{backgroundColor: '#8B1538'}}
                                onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#6D1028'}
                                onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#8B1538'}
                            >
                                Dashboard
                            </a>
                            <button
                                onClick={handleLogout}
                                className="px-3 py-1.5 font-thin hover:bg-gray-200 transition-colors"
                                style={{color: '#8B1538'}}
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <a
                                href="/auth/login"
                                className="px-3 py-1.5 text-white font-semibold transition-colors"
                                style={{backgroundColor: '#8B1538'}}
                                onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#6D1028'}
                                onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#8B1538'}
                            >
                                Login
                            </a>
                            <a
                                href="/auth/signup"
                                className="px-3 py-1.5 font-semibold hover:bg-gray-200 transition-colors border-l"
                                style={{color: '#8B1538', borderColor: '#8B1538'}}
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
