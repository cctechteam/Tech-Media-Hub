"use client";

import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import { deleteAnnouncement, fetchAnnouncements, fetchCurrentUser, formatDate, Role, ValueToRole } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
import CreateAnnouncementPopup from "./announcements";
import { FaTrash } from "react-icons/fa";

const SECTIONS: {
    id: string,
    title: string,
    description: string,
    permission: Role[]
}[] = [
        {
            id: "announcements",
            title: "Announcements",
            description: "Latest updates and news",
            permission: ["admin", "supervisor", "member", "guest"],
        },
        {
            id: "events",
            title: "Events & Activities",
            description: "Upcoming events and coordination",
            permission: ["admin", "supervisor", "member", "guest"],
        },
        {
            id: "tasks",
            title: "Task Management",
            description: "Project assignments and deadlines",
            permission: ["admin", "supervisor", "member"],
        },
        {
            id: "communication",
            title: "Team Communication",
            description: "Messages and discussion boards",
            permission: ["admin", "supervisor", "member"],
        },
        {
            id: "members",
            title: "Member Directory",
            description: "Team member contacts and roles",
            permission: ["admin", "supervisor"],
        },
        {
            id: "reports",
            title: "Reports & Analytics",
            description: "Performance metrics and insights",
            permission: ["admin", "supervisor"],
        },
        {
            id: "settings",
            title: "System Settings",
            description: "Configure system preferences",
            permission: ["admin"],
        },
        {
            id: "user-management",
            title: "User Management",
            description: "Manage user roles and permissions",
            permission: ["admin"],
        },
    ];

const LOCAL_STORAGE_KEY = "dashboard_section_visibility";
const LOCAL_STORAGE_LAYOUT = "dashboard_layout";

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null);
    const [enabledSections, setEnabledSections] = useState<any>({});
    const [layout, setLayout] = useState("flex");
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [announcements, setAnnouncements] = useState<any>([]);
    const settingsRef = useRef<HTMLDivElement>(null);

    const [creatingAnnouncement, setCreatingAnnouncement] = useState(false);
    const [reloadAnnouncements, setReloadAnnouncements] = useState(false);

    const doReloadAnnouncements = () => setReloadAnnouncements(prev => !prev);

    useEffect(() => {
        fetchCurrentUser(setUser);

        // Load saved prefs
        const savedPrefsRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedPrefsRaw) {
            setEnabledSections(JSON.parse(savedPrefsRaw));
        } else {
            // Default enable permitted sections
            const defaultPrefs: any = {};
            SECTIONS.forEach(section => {
                defaultPrefs[section.id] = true;
            });

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

    useEffect(() => {
        fetchAnnouncements(setAnnouncements);
    }, [creatingAnnouncement, reloadAnnouncements])

    if (!user) {
        return (
            <main className="p-8 text-center text-gray-400">Loading user info...</main>
        );
    }

    function toggleSection(id: any) {
        setEnabledSections((prev: any) => ({ ...prev, [id]: !prev[id] }));
    }

    function renderSection(id: any) {
        switch (id) {
            case "announcements":
                return (
                    <>
                        <div className="h-full">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-red-800">📢 Announcements</h3>
                                {ValueToRole(user.role) === "admin" && (
                                    <button className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors" onClick={() => setCreatingAnnouncement(true)}>
                                        + New
                                    </button>
                                )}
                            </div>
                            <div className="space-y-3 max-h-64 overflow-y-auto">
                                {announcements.map((announcement: any) => (
                                    <div key={announcement.id} className={`p-3 rounded-lg border-l-4 ${announcement.priority === 'high' ? 'border-red-400 bg-red-50' :
                                        announcement.priority === 'medium' ? 'border-yellow-400 bg-yellow-50' :
                                            'border-gray-400 bg-gray-50'
                                        }`}>
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-semibold text-gray-800">{announcement.title}</h4>

                                            <div className="flex justify-around gap-4 items-center">
                                                <span className="text-xs text-gray-500">{formatDate(announcement.created_at)}</span>

                                                {ValueToRole(user.role) === "admin" && (
                                                    <button className="text-gray-500 rounded-lg text-sm hover:text-red-700 transition-colors" onClick={() => {
                                                        deleteAnnouncement(announcement.id);
                                                        doReloadAnnouncements();
                                                    }
                                                    }>
                                                        <FaTrash className="inline-block mr-2" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600">{announcement.content}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <CreateAnnouncementPopup isOpen={creatingAnnouncement} setIsOpen={value => setCreatingAnnouncement(value)} />
                    </>
                );

            case "events":
                return (
                    <div className="h-full">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-red-800">🎯 Events & Activities</h3>
                            <button className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors">
                                + Schedule
                            </button>
                        </div>
                        <div className="space-y-3">
                            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-semibold text-red-800">Team Building Workshop</h4>
                                    <span className="px-2 py-1 bg-red-200 text-red-800 text-xs rounded-full">Upcoming</span>
                                </div>
                                <p className="text-sm text-red-600 mb-1">Aug 25, 2025 • 2:00 PM - 5:00 PM</p>
                                <p className="text-sm text-gray-600">Interactive workshop to strengthen team collaboration</p>
                            </div>
                            <div className="p-3 bg-pink-50 rounded-lg border border-pink-200">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-semibold text-pink-800">Monthly Review Meeting</h4>
                                    <span className="px-2 py-1 bg-pink-200 text-pink-800 text-xs rounded-full">Recurring</span>
                                </div>
                                <p className="text-sm text-pink-600 mb-1">Last Friday of every month</p>
                                <p className="text-sm text-gray-600">Performance review and planning session</p>
                            </div>
                        </div>
                    </div>
                );

            case "tasks":
                return (
                    <div className="h-full">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-red-800">✅ Task Management</h3>
                            <button className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors">
                                + Task
                            </button>
                        </div>
                        <div className="space-y-3">
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                    <h4 className="font-semibold text-red-800">Budget Review</h4>
                                    <span className="text-xs text-red-600">Due Today</span>
                                </div>
                                <p className="text-sm text-gray-600">Review Q4 budget allocations</p>
                            </div>
                            <div className="p-3 bg-pink-50 border border-pink-200 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                                    <h4 className="font-semibold text-pink-800">Event Coordination</h4>
                                    <span className="text-xs text-pink-600">In Progress</span>
                                </div>
                                <p className="text-sm text-gray-600">Coordinate upcoming team building event</p>
                            </div>
                            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                                    <h4 className="font-semibold text-gray-800">Documentation Update</h4>
                                    <span className="text-xs text-gray-600">Completed</span>
                                </div>
                                <p className="text-sm text-gray-600">Updated project documentation</p>
                            </div>
                        </div>
                    </div>
                );

            case "communication":
                return (
                    <div className="h-full">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-red-800">💬 Team Communication</h3>
                            <button className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors">
                                Message
                            </button>
                        </div>
                        <div className="space-y-3">
                            <div className="p-3 bg-white border border-gray-200 rounded-lg">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white text-sm font-bold">JD</div>
                                    <div>
                                        <p className="font-semibold text-gray-800">Jane Doe</p>
                                        <p className="text-xs text-gray-500">2 hours ago</p>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600">Project milestone completed ahead of schedule!</p>
                            </div>
                            <div className="p-3 bg-white border border-gray-200 rounded-lg">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 bg-pink-600 rounded-full flex items-center justify-center text-white text-sm font-bold">MS</div>
                                    <div>
                                        <p className="font-semibold text-gray-800">Mike Smith</p>
                                        <p className="text-xs text-gray-500">5 hours ago</p>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600">Meeting notes from today's session are now available.</p>
                            </div>
                        </div>
                    </div>
                );

            case "members":
                return (
                    <div className="h-full">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-teal-800">👥 Member Directory</h3>
                            <button className="px-3 py-1 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700 transition-colors">
                                Manage
                            </button>
                        </div>
                        <div className="space-y-3">
                            {["John Smith (Admin)", "Jane Doe (Supervisor)", "Mike Smith (Member)", "Sarah Wilson (Member)"].map((member, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-2 bg-white border border-gray-200 rounded-lg">
                                    <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                        {member.split(" ").map(n => n[0]).join("")}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-800">{member}</p>
                                        <div className="flex gap-2">
                                            <span className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></span>
                                            <span className="text-xs text-gray-500">Online</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case "reports":
                return (
                    <div className="h-full">
                        <h3 className="text-xl font-bold text-orange-800 mb-4">📊 Reports & Analytics</h3>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg text-center">
                                <div className="text-2xl font-bold text-orange-800">24</div>
                                <div className="text-sm text-orange-600">Active Tasks</div>
                            </div>
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
                                <div className="text-2xl font-bold text-blue-800">8</div>
                                <div className="text-sm text-blue-600">Events This Month</div>
                            </div>
                        </div>
                        <div className="p-3 bg-white border border-gray-200 rounded-lg">
                            <p className="font-semibold text-gray-800 mb-2">Team Performance</p>
                            <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                                <div className="bg-green-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                            </div>
                            <p className="text-sm text-gray-600">78% completion rate</p>
                        </div>
                    </div>
                );

            case "settings":
                return (
                    <div className="h-full">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">⚙️ System Settings</h3>
                        <div className="space-y-3">
                            <div className="p-3 bg-white border border-gray-200 rounded-lg">
                                <h4 className="font-semibold text-gray-800 mb-2">Notification Preferences</h4>
                                <label className="flex items-center gap-2">
                                    <input type="checkbox" defaultChecked className="accent-blue-600" />
                                    <span className="text-sm text-gray-600">Email notifications</span>
                                </label>
                            </div>
                            <div className="p-3 bg-white border border-gray-200 rounded-lg">
                                <h4 className="font-semibold text-gray-800 mb-2">System Backup</h4>
                                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">
                                    Create Backup
                                </button>
                            </div>
                        </div>
                    </div>
                );

            case "user-management":
                return (
                    <div className="h-full">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-red-800">🔐 User Management</h3>
                            <button className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors">
                                + Add User
                            </button>
                        </div>
                        <div className="space-y-3">
                            <div className="p-3 bg-white border border-gray-200 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-gray-800">Jane Doe</p>
                                        <p className="text-sm text-gray-600">Supervisor</p>
                                    </div>
                                    <button className="text-red-600 hover:text-red-800 text-sm">Edit</button>
                                </div>
                            </div>
                            <div className="p-3 bg-white border border-gray-200 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-gray-800">Mike Smith</p>
                                        <p className="text-sm text-gray-600">Member</p>
                                    </div>
                                    <button className="text-red-600 hover:text-red-800 text-sm">Edit</button>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    }

    const permittedSections = SECTIONS.filter(section => section.permission.includes(ValueToRole(user.role)));
    const enabledPermittedSections = permittedSections.filter(section => enabledSections[section.id]);

    return (<>
        <Navbar />

        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-red-100 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-4">
                            <h1 className="text-2xl font-bold text-red-800"></h1>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${ValueToRole(user.role) === 'admin' ? 'bg-red-100 text-red-800' :
                                ValueToRole(user.role) === 'supervisor' ? 'bg-pink-100 text-pink-800' :
                                    'bg-red-100 text-red-600'
                                }`}>
                                {ValueToRole(user.role).charAt(0).toUpperCase() + ValueToRole(user.role).slice(1)}
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-red-600">Welcome, <strong>{user.full_name ?? "~Unknown~"}</strong></span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Settings Button */}
            <div ref={settingsRef} className="fixed top-20 right-6 z-50">
                <button
                    onClick={() => setSettingsOpen(!settingsOpen)}
                    className="p-3 bg-white shadow-lg rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
                    title="Dashboard Settings"
                >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </button>

                {settingsOpen && (
                    <div className="mt-2 w-72 bg-white rounded-lg shadow-xl p-4 border border-gray-200">
                        <h2 className="text-lg font-semibold mb-4 text-gray-800">Dashboard Settings</h2>

                        <div className="mb-4">
                            <p className="font-medium mb-2 text-gray-700">Layout Style</p>
                            <div className="flex gap-2">
                                {["grid", "flex"].map(style => (
                                    <button
                                        key={style}
                                        onClick={() => setLayout(style)}
                                        className={`flex-1 px-3 py-2 rounded-lg font-medium transition ${layout === style ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        {style.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <p className="font-medium mb-2 text-gray-700">Visible Sections</p>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {permittedSections.map(section => (
                                    <label key={section.id} className="flex items-start gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={enabledSections[section.id] || false}
                                            onChange={() => toggleSection(section.id)}
                                            className="mt-1 accent-red-600"
                                        />
                                        <div>
                                            <div className="font-medium text-gray-800 text-sm">{section.title}</div>
                                            <div className="text-gray-500 text-xs">{section.description}</div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className={`${layout === "grid"
                    ? "grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    : "space-y-6"
                    }`}>
                    {/* Other sections */}
                    {enabledPermittedSections
                        .map(section => (
                            <div key={section.id} className={layout === "grid" ? "lg:col-span-1" : ""}>
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-full">
                                    {renderSection(section.id)}
                                </div>
                            </div>
                        ))}
                </div>

                {enabledPermittedSections.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-4xl mb-4">📋</div>
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">No sections enabled</h3>
                        <p className="text-gray-500">Use the settings button to enable dashboard sections.</p>
                    </div>
                )}
            </main>
        </div>

        <Footer />
    </>);
}