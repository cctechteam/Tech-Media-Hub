"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { FaUser, FaEnvelope, FaSchool, FaShieldAlt, FaKey, FaEdit, FaSave, FaTimes } from "react-icons/fa";
import { fetchCurrentUser } from "@/lib/serverUtils";
import { retrieveSessionToken } from "@/lib/utils";
import { updateProfile, changePassword } from "@/lib/profile-actions";

interface UserProfile {
  id: number;
  full_name: string;
  email: string;
  form_class: string | null;
  roles: string[];
  roleDetails: any[];
  created_at: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [fullName, setFullName] = useState("");
  const [formClass, setFormClass] = useState("");
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = retrieveSessionToken();
      if (!token) {
        router.push("/auth/login");
        return;
      }

      const userData = await fetchCurrentUser(token, false);
      
      if (userData) {
        setUser(userData);
        setFullName(userData.full_name);
        setFormClass(userData.form_class || "");
      } else {
        router.push("/auth/login");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError("Failed to load profile");
      router.push("/auth/login");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    setError("");
    setMessage("");
    
    if (!user) return;
    
    try {
      const result = await updateProfile(user.id, fullName, formClass || null);
      
      if (result.success) {
        setMessage("Profile updated successfully!");
        setEditing(false);
        await fetchUserProfile();
        setTimeout(() => setMessage(""), 3000);
      } else {
        setError(result.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Failed to update profile");
    }
  };

  const handleChangePassword = async () => {
    setError("");
    setMessage("");
    
    if (!user) return;
    
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    try {
      const result = await changePassword(user.id, currentPassword, newPassword);
      
      if (result.success) {
        setMessage("Password changed successfully!");
        setChangingPassword(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setError(result.error || "Failed to change password");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      setError("Failed to change password");
    }
  };

  const getRoleBadgeColor = (roleName: string) => {
    if (roleName.includes("admin") || roleName === "principal" || roleName === "vice_principal") {
      return "bg-red-100 text-red-800";
    }
    if (roleName.includes("tech_team")) {
      return "bg-orange-100 text-orange-800";
    }
    if (roleName.includes("supervisor")) {
      return "bg-purple-100 text-purple-800";
    }
    if (roleName.includes("staff") || roleName === "teacher" || roleName === "ancillary") {
      return "bg-green-100 text-green-800";
    }
    if (roleName === "beadle") {
      return "bg-blue-100 text-blue-800";
    }
    return "bg-gray-100 text-gray-800";
  };

  const getRoleDisplayName = (role: any) => {
    return role.display_name || role.role_name;
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />
      
      <main className="flex-1 py-8 px-6 md:px-16 lg:px-24">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{color: '#8B1538'}}>
              My Dashboard
            </h1>
            <p className="text-gray-600">
              Manage your profile and view your account information
            </p>
          </div>

          {message && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
              {message}
            </div>
          )}
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
              {error}
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Profile Information</h2>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <FaEdit /> Edit Profile
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <FaUser className="text-gray-400 mt-1" />
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-600">Full Name</label>
                  {editing ? (
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">{user.full_name}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-4">
                <FaEnvelope className="text-gray-400 mt-1" />
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="mt-1 text-gray-900">{user.email}</p>
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <FaSchool className="text-gray-400 mt-1" />
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-600">Form Class</label>
                  {editing ? (
                    <div>
                      <input
                        type="text"
                        value={formClass}
                        onChange={(e) => setFormClass(e.target.value.toUpperCase())}
                        placeholder="e.g., 5-2, 6A-1 (optional)"
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Students: Enter your form class. Staff: Leave blank.
                      </p>
                    </div>
                  ) : (
                    <p className="mt-1 text-gray-900">{user.form_class || "Not set"}</p>
                  )}
                </div>
              </div>

              {editing && (
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleUpdateProfile}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <FaSave /> Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false);
                      setFullName(user.full_name);
                      setFormClass(user.form_class || "");
                      setError("");
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    <FaTimes /> Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <FaShieldAlt className="text-gray-400 text-xl" />
              <h2 className="text-xl font-bold text-gray-800">Your Roles</h2>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {user.roleDetails && user.roleDetails.length > 0 ? (
                user.roleDetails.map((role: any) => (
                  <span
                    key={role.id}
                    className={`px-4 py-2 rounded-full text-sm font-medium ${getRoleBadgeColor(role.role_name)}`}
                  >
                    {getRoleDisplayName(role)}
                  </span>
                ))
              ) : (
                <p className="text-gray-500">No roles assigned</p>
              )}
            </div>
            
            <p className="text-xs text-gray-500 mt-4">
              Contact the Tech Team if you need role changes
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <FaKey className="text-gray-400 text-xl" />
                <h2 className="text-xl font-bold text-gray-800">Change Password</h2>
              </div>
              {!changingPassword && (
                <button
                  onClick={() => setChangingPassword(true)}
                  className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  Change Password
                </button>
              )}
            </div>

            {changingPassword && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    minLength={6}
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleChangePassword}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <FaSave /> Update Password
                  </button>
                  <button
                    onClick={() => {
                      setChangingPassword(false);
                      setCurrentPassword("");
                      setNewPassword("");
                      setConfirmPassword("");
                      setError("");
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    <FaTimes /> Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-600">
              <strong>Account Created:</strong> {new Date(user.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
