"use client";

import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import { formatDate, IsAdmin, retrieveSessionToken, Role, ValueToRole, getPrimaryRole, getAllRoles, hasRole } from "@/lib/utils";
import { fetchAnnouncements, fetchCurrentUser, deleteAnnouncement, fetchTasks, fetchEvents, fetchMessages, getDashboardStats, updateTaskStatus } from "@/lib/serverUtils";
import { useState, useEffect, useRef } from "react";
import CreateAnnouncementPopup from "./announcements";
import TaskModal from "./components/TaskModal";
import EventModal from "./components/EventModal";
import MessageModal from "./components/MessageModal";
import { FaTrash, FaUser, FaCog, FaBell, FaTasks, FaCalendarAlt, FaComments, FaChartLine, FaCheck, FaClock, FaMapMarkerAlt } from "react-icons/fa";
import { CreateNavLink, NavLink, RenderNavLinks } from "@/components/navlinks";
import UserLoading from "@/components/userloading";
import Link from "next/link";

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
    ];

const LOCAL_STORAGE_KEY = "dashboard_section_visibility";
const LOCAL_STORAGE_LAYOUT = "dashboard_layout";

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null);
    const [enabledSections, setEnabledSections] = useState<any>({});
    const [layout, setLayout] = useState("flex");
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [announcements, setAnnouncements] = useState<any>([]);
    const [tasks, setTasks] = useState<any>([]);
    const [events, setEvents] = useState<any>([]);
    const [messages, setMessages] = useState<any>([]);
    const [dashboardStats, setDashboardStats] = useState<any>({ announcements: 0, tasks: 0, events: 0, messages: 0 });
    const settingsRef = useRef<HTMLDivElement>(null);

    const [creatingAnnouncement, setCreatingAnnouncement] = useState(false);
    const [creatingTask, setCreatingTask] = useState(false);
    const [creatingEvent, setCreatingEvent] = useState(false);
    const [creatingMessage, setCreatingMessage] = useState(false);
    const [reloadData, setReloadData] = useState(false);

    const doReloadData = () => setReloadData(prev => !prev);

    useEffect(() => {
        (async () => {
            const cuser = await fetchCurrentUser(retrieveSessionToken());
            setUser(cuser ?? null)
        })();

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

    // Load all dashboard data
    useEffect(() => {
        const loadDashboardData = async () => {
            if (user && user.id) {
                try {
                    const [announcementsData, tasksData, eventsData, messagesData, statsData] = await Promise.all([
                        fetchAnnouncements(),
                        fetchTasks(user.id),
                        fetchEvents(10), // Limit to 10 recent events
                        fetchMessages(user.id, 10), // Limit to 10 recent messages
                        getDashboardStats(user.id)
                    ]);
                    
                    setAnnouncements(announcementsData || []);
                    setTasks(tasksData || []);
                    setEvents(eventsData || []);
                    setMessages(messagesData || []);
                    setDashboardStats(statsData || { announcements: 0, tasks: 0, events: 0, messages: 0 });
                } catch (error) {
                    console.error("Error loading dashboard data:", error);
                    // Set default values on error
                    setAnnouncements([]);
                    setTasks([]);
                    setEvents([]);
                    setMessages([]);
                    setDashboardStats({ announcements: 0, tasks: 0, events: 0, messages: 0 });
                }
            }
        };

        loadDashboardData();
    }, [user, reloadData])

    if (!user)
        return <UserLoading />;

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
                                {hasRole(user, 'admin') && (
                                    <button className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors" onClick={() => setCreatingAnnouncement(true)}>
                                        + New
                                    </button>
                                )}
                            </div>
                            <div className="space-y-3 max-h-64 overflow-y-auto">
                                {announcements.length == 0 && <div className="w-full flex justify-center">
                                    <h4 className="font-light text-gray-800">Nothing to see here.</h4>
                                </div>}

                                {announcements.map((announcement: any) => (
                                    <div key={announcement.id} className={`p-3 rounded-lg border-l-4 ${announcement.priority === 'high' ? 'border-red-400 bg-red-50' :
                                        announcement.priority === 'medium' ? 'border-yellow-400 bg-yellow-50' :
                                            'border-gray-400 bg-gray-50'
                                        }`}>
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-semibold text-gray-800">{announcement.title}</h4>

                                            <div className="flex justify-around gap-4 items-center">
                                                <span className="text-xs text-gray-500">{formatDate(announcement.created_at)}</span>

                                                {hasRole(user, 'admin') && (
                                                    <button className="text-gray-500 rounded-lg text-sm hover:text-red-700 transition-colors" onClick={() => {
                                                        deleteAnnouncement(announcement.id);
                                                        window.setTimeout(() => doReloadData(), 2000);
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
                        <TaskModal 
                            isOpen={creatingTask} 
                            onClose={() => setCreatingTask(false)} 
                            onTaskCreated={doReloadData}
                            currentUserId={user.id}
                        />
                        <EventModal 
                            isOpen={creatingEvent} 
                            onClose={() => setCreatingEvent(false)} 
                            onEventCreated={doReloadData}
                            currentUserId={user.id}
                        />
                        <MessageModal 
                            isOpen={creatingMessage} 
                            onClose={() => setCreatingMessage(false)} 
                            onMessageSent={doReloadData}
                            currentUserId={user.id}
                        />
                    </>
                );

            case "events":
                return (
                    <div className="h-full">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-red-800">🎯 Events & Activities</h3>
                            <button 
                                className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
                                onClick={() => setCreatingEvent(true)}
                            >
                                + Schedule
                            </button>
                        </div>
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                            {events.length === 0 && (
                                <div className="w-full flex justify-center">
                                    <h4 className="font-light text-gray-800">No events scheduled.</h4>
                                </div>
                            )}
                            
                            {events.map((event: any) => {
                                const eventDate = new Date(event.event_date);
                                const isUpcoming = eventDate >= new Date();
                                const colorClass = isUpcoming ? 'border-red-400 bg-red-50' : 'border-gray-400 bg-gray-50';
                                const textClass = isUpcoming ? 'text-red-800' : 'text-gray-800';
                                
                                return (
                                    <div key={event.id} className={`p-3 rounded-lg border-l-4 ${colorClass}`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className={`font-semibold ${textClass}`}>{event.title}</h4>
                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                isUpcoming ? 'bg-red-200 text-red-800' : 'bg-gray-200 text-gray-800'
                                            }`}>
                                                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <FaClock className="w-3 h-3 text-gray-500" />
                                            <p className="text-sm text-gray-600">
                                                {eventDate.toLocaleDateString()}
                                                {event.start_time && ` • ${event.start_time}`}
                                                {event.end_time && ` - ${event.end_time}`}
                                            </p>
                                        </div>
                                        {event.location && (
                                            <div className="flex items-center gap-2 mb-1">
                                                <FaMapMarkerAlt className="w-3 h-3 text-gray-500" />
                                                <p className="text-sm text-gray-600">{event.location}</p>
                                            </div>
                                        )}
                                        {event.description && (
                                            <p className="text-sm text-gray-600">{event.description}</p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );

            case "tasks":
                return (
                    <div className="h-full">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-red-800">✅ Task Management</h3>
                            <button 
                                className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
                                onClick={() => setCreatingTask(true)}
                            >
                                + Task
                            </button>
                        </div>
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                            {tasks.length === 0 && (
                                <div className="w-full flex justify-center">
                                    <h4 className="font-light text-gray-800">No tasks assigned.</h4>
                                </div>
                            )}
                            
                            {tasks.map((task: any) => {
                                const getStatusColor = (status: string) => {
                                    switch (status) {
                                        case 'completed': return { bg: 'bg-green-50', border: 'border-green-200', dot: 'bg-green-500', text: 'text-green-800' };
                                        case 'in_progress': return { bg: 'bg-blue-50', border: 'border-blue-200', dot: 'bg-blue-500', text: 'text-blue-800' };
                                        default: return { bg: 'bg-red-50', border: 'border-red-200', dot: 'bg-red-500', text: 'text-red-800' };
                                    }
                                };
                                
                                const colors = getStatusColor(task.status);
                                const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';
                                
                                return (
                                    <div key={task.id} className={`p-3 ${colors.bg} border ${colors.border} rounded-lg`}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <button
                                                onClick={async () => {
                                                    const newStatus = task.status === 'completed' ? 'pending' : 
                                                                    task.status === 'pending' ? 'in_progress' : 'completed';
                                                    await updateTaskStatus(task.id, newStatus);
                                                    doReloadData();
                                                }}
                                                className={`w-4 h-4 ${colors.dot} rounded-full hover:opacity-80 transition-opacity cursor-pointer flex items-center justify-center`}
                                            >
                                                {task.status === 'completed' && <FaCheck className="w-2 h-2 text-white" />}
                                            </button>
                                            <h4 className={`font-semibold ${colors.text} flex-1`}>{task.title}</h4>
                                            <div className="flex items-center gap-2">
                                                {isOverdue && <span className="text-xs text-red-600 font-medium">Overdue</span>}
                                                {task.due_date && (
                                                    <span className="text-xs text-gray-500">
                                                        Due: {new Date(task.due_date).toLocaleDateString()}
                                                    </span>
                                                )}
                                                <span className={`text-xs ${colors.text} capitalize`}>
                                                    {task.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                        </div>
                                        {task.description && (
                                            <p className="text-sm text-gray-600 ml-6">{task.description}</p>
                                        )}
                                        {task.assignee_name && (
                                            <p className="text-xs text-gray-500 ml-6 mt-1">Assigned to: {task.assignee_name}</p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );

            case "communication":
                return (
                    <div className="h-full">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-red-800">💬 Team Communication</h3>
                            <button 
                                className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
                                onClick={() => setCreatingMessage(true)}
                            >
                                Message
                            </button>
                        </div>
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                            {messages.length === 0 && (
                                <div className="w-full flex justify-center">
                                    <h4 className="font-light text-gray-800">No messages yet.</h4>
                                </div>
                            )}
                            
                            {messages.map((message: any) => {
                                const timeAgo = (date: string) => {
                                    const now = new Date();
                                    const messageDate = new Date(date);
                                    const diffInHours = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60 * 60));
                                    
                                    if (diffInHours < 1) return 'Just now';
                                    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
                                    return messageDate.toLocaleDateString();
                                };
                                
                                return (
                                    <div key={message.id} className={`p-3 border rounded-lg ${
                                        message.is_read ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-200'
                                    }`}>
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                                {(message.sender_name || 'U').charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <p className="font-semibold text-gray-800">{message.sender_name || 'Unknown'}</p>
                                                    <p className="text-xs text-gray-500">{timeAgo(message.created_at)}</p>
                                                </div>
                                                {message.subject && (
                                                    <p className="text-xs text-gray-600 font-medium">{message.subject}</p>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600">{message.content}</p>
                                        {message.message_type === 'broadcast' && (
                                            <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                                Broadcast
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    }

    // Check permissions based on new roles array system
    const permittedSections = SECTIONS.filter(section => {
        // Safety check for user object
        if (!user || !user.roles) {
            return section.permission.includes('guest');
        }
        
        // Check if user has any of the required roles for this section
        return section.permission.some(requiredRole => {
            if (requiredRole === 'member') {
                // 'member' maps to 'student' in new system
                return hasRole(user, 'student');
            }
            if (requiredRole === 'guest') {
                // Everyone has guest access
                return true;
            }
            return hasRole(user, requiredRole);
        });
    });
    const enabledPermittedSections = permittedSections.filter(section => enabledSections[section.id]);

    const navlinks: NavLink[] = [];

    if (hasRole(user, 'admin') || hasRole(user, 'super_admin'))
        navlinks.push(CreateNavLink("Manage Members", "/dashboard/members"));

    return (<>
        <Navbar />

        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
            {/* Modern Header */}
            <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-pink-600 rounded-xl flex items-center justify-center">
                                    <span className="text-white font-bold text-lg">TH</span>
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-gray-800">Tech Hub</h1>
                                    <p className="text-xs text-gray-500">Dashboard</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <RenderNavLinks links={navlinks} />
                        </div>

                        <div className="flex items-center gap-4">
                            {/* User Profile Section */}
                            <div className="flex items-center gap-3">
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-medium text-gray-800">{user.full_name ?? "Unknown User"}</p>
                                    <p className="text-xs text-gray-500">{user.email}</p>
                                </div>
                                <div className="relative group">
                                    <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center cursor-pointer">
                                        <span className="text-white font-semibold text-sm">
                                            {(user.full_name || "U").charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    {/* Enhanced Profile Dropdown */}
                                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 overflow-hidden">
                                        {/* Header with gradient */}
                                        <div className="bg-gradient-to-r from-red-500 to-pink-500 px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center ring-2 ring-white/30">
                                                    <span className="text-white font-bold text-lg">
                                                        {(user.full_name || "U").charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-white text-sm truncate">{user.full_name}</p>
                                                    <p className="text-white/80 text-xs truncate">{user.email}</p>
                                                </div>
                                            </div>
                                            
                                            {/* Role badges */}
                                            <div className="mt-3 flex flex-wrap gap-1">
                                                {user.roles && Array.isArray(user.roles) && user.roles.slice(0, 3).map((role: string) => (
                                                    <span 
                                                        key={role}
                                                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/20 text-white border border-white/30"
                                                    >
                                                        {role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ')}
                                                    </span>
                                                ))}
                                                {user.roles && Array.isArray(user.roles) && user.roles.length > 3 && (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/20 text-white border border-white/30">
                                                        +{user.roles.length - 3} more
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Menu items */}
                                        <div className="p-3">
                                            <Link href="/dashboard/profile" className="flex items-center gap-3 px-3 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-200 group/item">
                                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover/item:bg-blue-200 transition-colors">
                                                    <FaUser className="w-4 h-4 text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">Edit Profile</p>
                                                    <p className="text-xs text-gray-500">Manage your account</p>
                                                </div>
                                            </Link>
                                            
                                            <button className="w-full flex items-center gap-3 px-3 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-200 group/item">
                                                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover/item:bg-gray-200 transition-colors">
                                                    <FaCog className="w-4 h-4 text-gray-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">Settings</p>
                                                    <p className="text-xs text-gray-500">Preferences & privacy</p>
                                                </div>
                                            </button>
                                            
                                            <div className="border-t border-gray-100 my-2"></div>
                                            
                                            <button className="w-full flex items-center gap-3 px-3 py-3 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 group/item">
                                                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center group-hover/item:bg-red-200 transition-colors">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="font-medium">Sign Out</p>
                                                    <p className="text-xs text-red-500">End your session</p>
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
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
                        <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
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

            {/* Welcome Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                <div className="bg-gradient-to-r from-red-600 to-pink-600 rounded-2xl p-8 text-white mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-bold mb-2">Welcome back, {user.full_name?.split(' ')[0] || 'User'}! 👋</h2>
                            <p className="text-red-100 text-lg">Here's what's happening with your projects today.</p>
                        </div>
                        <div className="hidden md:block">
                            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold">{new Date().getDate()}</div>
                                    <div className="text-sm text-red-100">{new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Announcements</p>
                                <p className="text-2xl font-bold text-gray-900">{dashboardStats.announcements}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <FaBell className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Active Tasks</p>
                                <p className="text-2xl font-bold text-gray-900">{dashboardStats.tasks}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <FaTasks className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Upcoming Events</p>
                                <p className="text-2xl font-bold text-gray-900">{dashboardStats.events}</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <FaCalendarAlt className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Messages</p>
                                <p className="text-2xl font-bold text-gray-900">{dashboardStats.messages}</p>
                            </div>
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                <FaComments className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
                <div className={`${layout === "grid"
                    ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
                    : "space-y-6"
                    }`}>
                    {/* Other sections */}
                    {enabledPermittedSections
                        .map(section => (
                            <div key={section.id} className={layout === "grid" ? "" : ""}>
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full hover:shadow-md transition-shadow">
                                    {renderSection(section.id)}
                                </div>
                            </div>
                        ))}
                </div>

                {enabledPermittedSections.length === 0 && (
                    <div className="text-center py-12">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FaChartLine className="w-12 h-12 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">No sections enabled</h3>
                        <p className="text-gray-500 mb-4">Use the settings button to enable dashboard sections.</p>
                        <button 
                            onClick={() => setSettingsOpen(true)}
                            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Open Settings
                        </button>
                    </div>
                )}
            </main>
        </div>

        <Footer />
    </>);
}