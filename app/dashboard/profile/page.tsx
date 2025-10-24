/**
 * Edit Profile Page Component
 * 
 * Provides user profile management interface for the Tech Media Hub system.
 * Allows users to update their personal information, change passwords,
 * and manage account settings.
 * 
 * Features:
 * - Personal information editing (name, email, form class)
 * - Password change functionality
 * - Profile picture upload (future enhancement)
 * - Form validation and error handling
 * - Real-time updates with server synchronization
 * - Responsive design with modern UI
 * 
 * Security:
 * - Password confirmation for sensitive changes
 * - Server-side validation and sanitization
 * - Session-based authentication required
 * 
 * @author Tech Media Hub Team
 * @version 1.0
 * @since 2024
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { retrieveSessionToken, ValueToRole, getPrimaryRole, getAllRoles, hasRole } from "@/lib/utils";
import { fetchCurrentUser, updateUserProfile } from "@/lib/serverUtils";
import { FaUser, FaEnvelope, FaLock, FaCamera, FaArrowLeft, FaSave } from "react-icons/fa";
import UserLoading from "@/components/userloading";
import Link from "next/link";

export default function EditProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    // Form state
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [formClass, setFormClass] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Load user data
    useEffect(() => {
        const loadUser = async () => {
            setLoading(true);
            setErrorMsg(""); // Clear any previous errors
            try {
                const sessionToken = retrieveSessionToken();
                if (!sessionToken) {
                    router.push("/auth/login");
                    return;
                }
                
                const currentUser = await fetchCurrentUser(sessionToken);
                if (!currentUser) {
                    router.push("/auth/login");
                    return;
                }
                
                setUser(currentUser);
                
                // Parse full name into first and last name with better error handling
                const fullName = currentUser.full_name || "";
                const nameParts = fullName.trim().split(" ");
                setFirstName(nameParts[0] || "");
                setLastName(nameParts.slice(1).join(" ") || "");
                setEmail(currentUser.email || "");
                setFormClass(currentUser.form_class || "");
            } catch (error) {
                console.error("Error loading user data:", error);
                setErrorMsg("Failed to load user data. Please try refreshing the page.");
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, [router]);

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");
        setSuccessMsg("");

        // Validation
        if (!firstName.trim()) {
            setErrorMsg("First name is required");
            return;
        }

        if (!lastName.trim()) {
            setErrorMsg("Last name is required");
            return;
        }

        if (!email.trim()) {
            setErrorMsg("Email is required");
            return;
        }

        if (!email.toLowerCase().endsWith("@campioncollege.com")) {
            setErrorMsg("Email must be a @campioncollege.com address");
            return;
        }

        // Password validation if changing password
        if (newPassword || confirmPassword) {
            if (!currentPassword) {
                setErrorMsg("Current password is required to change password");
                return;
            }

            if (newPassword.length < 6) {
                setErrorMsg("New password must be at least 6 characters");
                return;
            }

            if (newPassword !== confirmPassword) {
                setErrorMsg("New passwords do not match");
                return;
            }
        }

        setSaveLoading(true);

        try {
            const fullName = `${firstName.trim()} ${lastName.trim()}`;
            const updateData: any = {
                full_name: fullName,
                email: email.trim(),
                form_class: formClass.trim()
            };

            // Include password change if provided
            if (newPassword) {
                updateData.currentPassword = currentPassword;
                updateData.newPassword = newPassword;
            }

            const result = await updateUserProfile(user.id, updateData);

            if (result.success) {
                setSuccessMsg("Profile updated successfully!");
                // Clear password fields
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
                
                // Refresh user data
                const updatedUser = await fetchCurrentUser(retrieveSessionToken());
                setUser(updatedUser);
            } else {
                setErrorMsg(result.error || "Failed to update profile");
            }
        } catch (error) {
            setErrorMsg("An error occurred while updating profile");
        } finally {
            setSaveLoading(false);
        }
    };

    // Show loading state while fetching user data
    if (loading) {
        return <UserLoading />;
    }

    // Show error state if user data failed to load
    if (!user && errorMsg) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FaUser className="w-8 h-8 text-red-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Profile</h2>
                            <p className="text-gray-600 mb-4">{errorMsg}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    // Redirect to login if no user data
    if (!user) {
        return <UserLoading />;
    }

    return (
        <>
            <Navbar />
            
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
                {/* Header */}
                <div className="bg-white shadow-sm border-b border-gray-200">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex items-center gap-4">
                            <Link 
                                href="/dashboard" 
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <FaArrowLeft className="w-5 h-5 text-gray-600" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
                                <p className="text-gray-600">Manage your account information and settings</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Enhanced Profile Summary Card */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                                {/* Header with gradient background */}
                                <div className="bg-gradient-to-br from-red-500 via-pink-500 to-purple-600 px-6 pt-8 pb-6">
                                    <div className="text-center">
                                        <div className="relative inline-block">
                                            <div className="w-28 h-28 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 ring-4 ring-white/30">
                                                <span className="text-white font-bold text-3xl">
                                                    {(user.full_name || "U").charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <button className="absolute bottom-2 right-2 w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl">
                                                <FaCamera className="w-4 h-4" />
                                            </button>
                                        </div>
                                        
                                        <h3 className="text-xl font-bold text-white mb-1">{user.full_name || "Unknown User"}</h3>
                                        <p className="text-white/80 text-sm font-medium">{user.email || "No email"}</p>
                                    </div>
                                </div>

                                {/* Content section */}
                                <div className="p-6">
                                    {/* Role badges */}
                                    <div className="mb-6">
                                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Roles & Permissions</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {user.roles && Array.isArray(user.roles) && user.roles.length > 0 ? (
                                                user.roles.map((role: string) => (
                                                    <span 
                                                        key={role}
                                                        className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${
                                                            role === 'admin' || role === 'super_admin' ? 'bg-red-100 text-red-800 border border-red-200' :
                                                            role === 'supervisor' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                                                            role === 'beadle' ? 'bg-green-100 text-green-800 border border-green-200' :
                                                            'bg-gray-100 text-gray-800 border border-gray-200'
                                                        }`}
                                                    >
                                                        {role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ')}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200">
                                                    Student
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* User details */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <FaUser className="w-4 h-4 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Member Since</p>
                                                <p className="text-sm font-semibold text-gray-900">{user.created_at ? new Date(user.created_at).getFullYear() : new Date().getFullYear()}</p>
                                            </div>
                                        </div>
                                        
                                        {user.form_class && (
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                                    <FaEnvelope className="w-4 h-4 text-green-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Form Class</p>
                                                    <p className="text-sm font-semibold text-gray-900">{user.form_class}</p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                                <FaLock className="w-4 h-4 text-purple-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Account Status</p>
                                                <p className="text-sm font-semibold text-green-600">Active</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quick actions */}
                                    <div className="mt-6 pt-6 border-t border-gray-100">
                                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h4>
                                        <div className="space-y-2">
                                            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                                                <FaUser className="w-4 h-4" />
                                                View Public Profile
                                            </button>
                                            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                                                <FaLock className="w-4 h-4" />
                                                Privacy Settings
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Edit Form */}
                        <div className="lg:col-span-2">
                            <form onSubmit={handleSaveProfile} className="space-y-6">
                                {/* Personal Information */}
                                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                            <FaUser className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">Personal Information</h3>
                                            <p className="text-sm text-gray-600">Update your personal details and contact information</p>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                First Name
                                            </label>
                                            <input
                                                type="text"
                                                value={firstName}
                                                onChange={(e) => setFirstName(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                                required
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Last Name
                                            </label>
                                            <input
                                                type="text"
                                                value={lastName}
                                                onChange={(e) => setLastName(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                            required
                                        />
                                    </div>

                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Form Class (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            value={formClass}
                                            onChange={(e) => setFormClass(e.target.value)}
                                            placeholder="e.g., 6A, 5B, etc."
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                {/* Password Change */}
                                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                                            <FaLock className="w-5 h-5 text-red-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">Security Settings</h3>
                                            <p className="text-sm text-gray-600">Update your password and security preferences</p>
                                        </div>
                                    </div>
                                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                                        <p className="text-sm text-amber-800">
                                            <strong>Note:</strong> Leave password fields blank if you don't want to change your current password.
                                        </p>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Current Password
                                            </label>
                                            <input
                                                type="password"
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    New Password
                                                </label>
                                                <input
                                                    type="password"
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                                    minLength={6}
                                                />
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Confirm New Password
                                                </label>
                                                <input
                                                    type="password"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Messages */}
                                {errorMsg && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                        <p className="text-red-800 text-sm">{errorMsg}</p>
                                    </div>
                                )}

                                {successMsg && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <p className="text-green-800 text-sm">{successMsg}</p>
                                    </div>
                                )}

                                {/* Save Button */}
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={saveLoading}
                                        className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <FaSave className="w-4 h-4" />
                                        {saveLoading ? "Saving..." : "Save Changes"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
}
