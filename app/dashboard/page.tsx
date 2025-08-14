"use client";

import Navbar from "@/components/navbar";
import { supabase } from "@/lib/database";
import { redirect } from "next/navigation";
import { useEffect, useState, useRef } from "react";

const SECTIONS = [
    {
        id: "tasks",
        title: "Tasks",
        description: "Your personal and team tasks.",
        permission: ["admin", "member", "guest"],
    },
];

const LOCAL_STORAGE_KEY = "dashboard_section_visibility";
const LOCAL_STORAGE_LAYOUT = "dashboard_layout";

export default function DashboardPage() {
    const [user, setUser] = useState<any | null>(null);
    const [enabledSections, setEnabledSections] = useState<Record<string, boolean>>(
        {}
    );
    const [layout, setLayout] = useState<"grid" | "flex">("grid");
    const [settingsOpen, setSettingsOpen] = useState(false);
    const settingsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchUser = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (!session?.user) {
                redirect("/auth/login");
                return;
            }

            const { data, error } = await supabase
                .from("members")
                .select("*")
                .eq("id", session.user.id)
                .single();

            if (error) {
                console.error("Error fetching member:", error.message);
            } else {
                setUser(data);
            }
        };

        fetchUser();

        // Load saved prefs
        const savedPrefsRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedPrefsRaw) {
            setEnabledSections(JSON.parse(savedPrefsRaw));
        } else {
            // Default enable permitted sections
            const defaultPrefs: Record<string, boolean> = {};
            setEnabledSections(defaultPrefs);
        }

        // Load saved layout
        const savedLayout = localStorage.getItem(LOCAL_STORAGE_LAYOUT);
        if (savedLayout === "grid" || savedLayout === "flex") {
            setLayout(savedLayout);
        }
    }, []);

    useEffect(() => {
        if (Object.keys(enabledSections).length) {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(enabledSections));
        }
    }, [enabledSections]);

    useEffect(() => {
        localStorage.setItem(LOCAL_STORAGE_LAYOUT, layout);
    }, [layout]);

    // Close settings if click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                settingsRef.current &&
                !settingsRef.current.contains(event.target as Node)
            ) {
                setSettingsOpen(false);
            }
        }
        if (settingsOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [settingsOpen]);

    if (!user) {
        return (
            <main className="p-8 text-center text-gray-400">Loading user info...</main>
        );
    }

    function toggleSection(id: string) {
        setEnabledSections((prev) => ({ ...prev, [id]: !prev[id] }));
    }

    function renderSection(id: string) {
        switch (id) {
            case "tasks":
                return (
                    <>
                        <h3 className="text-xl font-semibold mb-2">Tasks</h3>
                        <p>Here are your tasks and team assignments.</p>
                    </>
                );
            default:
                return null;
        }
    }

    return (
        <>
            <Navbar />

            <style>{`
        /* Stylish techy animated background */
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        body,html,#__next {
          height: 100%;
          margin: 0;
          font-family: Arial, sans-serif;
          background: linear-gradient(-45deg, #1a1a1a, #2a2a2a, #151515, #272727);
          background-size: 400% 400%;
          animation: gradientShift 20s ease infinite;
        }
      `}</style>

            {/* Floating settings button + dropdown */}
            <div
                ref={settingsRef}
                className="fixed top-[4.5rem] right-6 z-50"
                aria-label="Dashboard Settings"
            >
                <button
                    aria-expanded={settingsOpen}
                    aria-haspopup="true"
                    aria-controls="settings-menu"
                    onClick={() => setSettingsOpen((o) => !o)}
                    className="p-2 rounded-full bg-gray-800 bg-opacity-80 hover:bg-red-600 transition-colors shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    title="Dashboard Settings"
                >
                    <svg
                        className="w-6 h-6 text-red-500"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                    >
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51z" />
                    </svg>
                    <span className="sr-only">Open dashboard settings</span>
                </button>

                {settingsOpen && (
                    <div
                        id="settings-menu"
                        className="mt-2 w-72 bg-gray-800 bg-opacity-95 rounded-lg shadow-lg p-4 ring-1 ring-black ring-opacity-5"
                        role="menu"
                        aria-orientation="vertical"
                    >
                        <h2 className="text-xl font-semibold mb-4 text-red-500">Settings</h2>

                        {/* Layout toggle */}
                        <div className="mb-6">
                            <p className="font-semibold mb-2 text-white">Layout Style</p>
                            <div className="flex gap-2">
                                {(["grid", "flex"] as const).map((style) => (
                                    <button
                                        key={style}
                                        onClick={() => setLayout(style)}
                                        className={`flex-1 px-3 py-2 rounded-lg font-semibold transition text-center
                      ${layout === style
                                                ? "bg-red-600 text-white shadow-md"
                                                : "bg-gray-700 text-gray-300 hover:bg-red-700 hover:text-white"
                                            }
                    `}
                                        aria-pressed={layout === style}
                                        type="button"
                                    >
                                        {style.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Section toggles */}
                        <div>
                            <p className="font-semibold mb-2 text-white">Manage Sections</p>
                            <div className="flex flex-col gap-2 max-h-64 overflow-auto">
                                {SECTIONS.map((section) => {
                                    const hasPermission = section.permission.includes(user.role);
                                    return (
                                        <label
                                            key={section.id}
                                            className={`flex items-center cursor-pointer select-none ${!hasPermission ? "opacity-40 cursor-not-allowed" : ""
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                disabled={!hasPermission}
                                                checked={enabledSections[section.id] || false}
                                                onChange={() => toggleSection(section.id)}
                                                className="mr-2 w-5 h-5 accent-red-600"
                                            />
                                            <div>
                                                <div className="font-semibold text-red-400">
                                                    {section.title}
                                                </div>
                                                <div className="text-gray-400 text-xs">{section.description}</div>
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <main
                className="min-h-screen text-white bg-transparent relative z-10 max-w-full mx-auto"
                aria-label="Dashboard main content"
            >
                <h1 className="sr-only">Dashboard</h1>
                <p className="mb-6 w-full p-6 text-gray-300 max-w-xl">
                    Welcome,{" "}
                    <span className="text-red-500 font-semibold">{user.email}</span>!
                </p>

                {/* Render enabled sections */}
                <section
                    className={`${layout === "grid"
                        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                        : "flex flex-col"
                        } w-full min-h-screen`}

                    style={{ backgroundColor: "#101828FF" }}
                >
                    {SECTIONS.filter(
                        (section) =>
                            enabledSections[section.id] && section.permission.includes(user.role)
                    ).map((section) => (
                        <section
                            key={section.id}
                            className="p-6 shadow-lg border-b border-gray-700"
                            aria-label={section.title}
                        >
                            {renderSection(section.id)}
                        </section>
                    ))}
                </section>
            </main>
        </>
    );
}