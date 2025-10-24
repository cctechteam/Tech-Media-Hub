/**
 * Message Modal Component
 * 
 * Modal for creating and sending messages in the dashboard.
 * Allows users to send direct messages to team members
 * or broadcast messages to all users.
 */

"use client";

import { useState, useEffect } from "react";
import { FaTimes, FaPaperPlane } from "react-icons/fa";
import { createMessage, fetchUsers } from "@/lib/serverUtils";

interface MessageModalProps {
    isOpen: boolean;
    onClose: () => void;
    onMessageSent: () => void;
    currentUserId: number;
}

export default function MessageModal({ isOpen, onClose, onMessageSent, currentUserId }: MessageModalProps) {
    const [recipientId, setRecipientId] = useState("");
    const [subject, setSubject] = useState("");
    const [content, setContent] = useState("");
    const [messageType, setMessageType] = useState("direct");
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
        
        if (!content.trim()) {
            setError("Message content is required");
            return;
        }

        if (messageType === "direct" && !recipientId) {
            setError("Please select a recipient for direct messages");
            return;
        }

        setLoading(true);
        
        const result = await createMessage({
            sender_id: currentUserId,
            recipient_id: messageType === "broadcast" ? undefined : parseInt(recipientId),
            subject: subject.trim() || undefined,
            content: content.trim(),
            message_type: messageType
        });

        if (result.success) {
            // Reset form
            setRecipientId("");
            setSubject("");
            setContent("");
            setMessageType("direct");
            onMessageSent();
            onClose();
        } else {
            setError(result.error || "Failed to send message");
        }
        
        setLoading(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Send Message</h3>
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
                            Message Type
                        </label>
                        <select
                            value={messageType}
                            onChange={(e) => setMessageType(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                            <option value="direct">Direct Message</option>
                            <option value="broadcast">Broadcast to All</option>
                        </select>
                    </div>

                    {messageType === "direct" && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Recipient *
                            </label>
                            <select
                                value={recipientId}
                                onChange={(e) => setRecipientId(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                required={messageType === "direct"}
                            >
                                <option value="">Select recipient</option>
                                {users.filter(user => user.id !== currentUserId).map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.full_name} ({user.email})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Subject
                        </label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder="Enter message subject (optional)"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Message *
                        </label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder="Enter your message"
                            rows={4}
                            required
                        />
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
                            <FaPaperPlane className="w-4 h-4" />
                            {loading ? "Sending..." : "Send Message"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
