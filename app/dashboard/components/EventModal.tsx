/**
 * Event Modal Component
 * 
 * Modal for creating and managing events in the dashboard.
 * Allows users to schedule events, set times and locations,
 * and categorize event types.
 */

"use client";

import { useState } from "react";
import { FaTimes, FaCalendarPlus } from "react-icons/fa";
import { createEvent } from "@/lib/serverUtils";

interface EventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onEventCreated: () => void;
    currentUserId: number;
}

export default function EventModal({ isOpen, onClose, onEventCreated, currentUserId }: EventModalProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [eventDate, setEventDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [location, setLocation] = useState("");
    const [eventType, setEventType] = useState("general");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        
        if (!title.trim()) {
            setError("Event title is required");
            return;
        }

        if (!eventDate) {
            setError("Event date is required");
            return;
        }

        setLoading(true);
        
        const result = await createEvent({
            title: title.trim(),
            description: description.trim() || undefined,
            event_date: eventDate,
            start_time: startTime || undefined,
            end_time: endTime || undefined,
            location: location.trim() || undefined,
            created_by: currentUserId,
            event_type: eventType
        });

        if (result.success) {
            // Reset form
            setTitle("");
            setDescription("");
            setEventDate("");
            setStartTime("");
            setEndTime("");
            setLocation("");
            setEventType("general");
            onEventCreated();
            onClose();
        } else {
            setError(result.error || "Failed to create event");
        }
        
        setLoading(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Schedule New Event</h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <FaTimes className="w-4 h-4 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Event Title *
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder="Enter event title"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder="Enter event description"
                            rows={3}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Event Date *
                        </label>
                        <input
                            type="date"
                            value={eventDate}
                            onChange={(e) => setEventDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Start Time
                            </label>
                            <input
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                End Time
                            </label>
                            <input
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Location
                        </label>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder="Enter event location"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Event Type
                        </label>
                        <select
                            value={eventType}
                            onChange={(e) => setEventType(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                            <option value="general">General</option>
                            <option value="meeting">Meeting</option>
                            <option value="workshop">Workshop</option>
                            <option value="training">Training</option>
                            <option value="social">Social Event</option>
                            <option value="deadline">Deadline</option>
                        </select>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-red-800 text-sm">{error}</p>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                        >
                            <FaCalendarPlus className="w-4 h-4" />
                            {loading ? "Creating..." : "Schedule Event"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
