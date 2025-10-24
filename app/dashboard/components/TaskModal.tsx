/**
 * Task Modal Component
 * 
 * Modal for creating and managing tasks in the dashboard.
 * Allows users to create new tasks, assign them to team members,
 * and set priorities and due dates.
 */

"use client";

import { useState, useEffect } from "react";
import { FaTimes, FaPlus } from "react-icons/fa";
import { createTask, fetchUsers } from "@/lib/serverUtils";

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onTaskCreated: () => void;
    currentUserId: number;
}

export default function TaskModal({ isOpen, onClose, onTaskCreated, currentUserId }: TaskModalProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [assignedTo, setAssignedTo] = useState("");
    const [priority, setPriority] = useState("medium");
    const [dueDate, setDueDate] = useState("");
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState<any[]>([]);
    const [error, setError] = useState("");

    useEffect(() => {
        if (isOpen) {
            fetchUsers().then(setUsers);
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        
        if (!title.trim()) {
            setError("Task title is required");
            return;
        }

        setLoading(true);
        
        const result = await createTask({
            title: title.trim(),
            description: description.trim() || undefined,
            assigned_to: assignedTo ? parseInt(assignedTo) : undefined,
            created_by: currentUserId,
            priority,
            due_date: dueDate || undefined
        });

        if (result.success) {
            // Reset form
            setTitle("");
            setDescription("");
            setAssignedTo("");
            setPriority("medium");
            setDueDate("");
            onTaskCreated();
            onClose();
        } else {
            setError(result.error || "Failed to create task");
        }
        
        setLoading(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Create New Task</h3>
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
                            Task Title *
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder="Enter task title"
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
                            placeholder="Enter task description"
                            rows={3}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Assign To
                        </label>
                        <select
                            value={assignedTo}
                            onChange={(e) => setAssignedTo(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                            <option value="">Select team member (optional)</option>
                            {users.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.full_name} ({user.email})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Priority
                            </label>
                            <select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Due Date
                            </label>
                            <input
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                        </div>
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
                            <FaPlus className="w-4 h-4" />
                            {loading ? "Creating..." : "Create Task"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
