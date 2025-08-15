"use client";

import { createAnnouncement } from "@/lib/utils";
import { useState } from "react";

interface AnnouncementPopupProps {
    isOpen: boolean,
    setIsOpen: (value: any) => void
}

export default function CreateAnnouncementPopup({ isOpen, setIsOpen }: AnnouncementPopupProps) {
    const [title, setTitle] = useState("");
    const [priority, setPriority] = useState("low");
    const [message, setMessage] = useState("");

    const priorityLevels = [
        "low",
        "medium",
        "high"
    ]
    const handleSubmit = () => {
        createAnnouncement(title, priority, message);

        // Reset form
        setTitle("");
        setMessage("");
        setPriority("low");
        setIsOpen(false);
    };

    return (
        <>
            {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <form className="bg-white rounded-lg p-6 w-full max-w-md relative" onSubmit={(e) => {
                        e.preventDefault();
                        handleSubmit();
                    }}>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                        >
                            ✕
                        </button>

                        <h2 className="text-xl font-bold mb-4">Create Announcement</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter announcement title"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Priority</label>

                                <select
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value)}
                                    required
                                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {priorityLevels.map((cls) => (
                                        <option key={cls} value={cls}>{cls.charAt(0).toUpperCase() + cls.slice(1)}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Content</label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter announcement content"
                                    rows={4}
                                    required
                                />
                            </div>

                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                                >
                                    Submit
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
}
