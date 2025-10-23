"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import Image from "next/image";
import { fetchUsers, addUserRole, removeUserRole, setUserRoles, updateUserFormClass } from "@/lib/serverUtils";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/Toast";

type User = {
  id: string;
  email: string;
  full_name: string;
  form_class?: string;
  roles: string[];
  created_at: string;
};

export default function AdminDashboard() {
  const [mounted, setMounted] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const { toasts, success, error, warning, removeToast } = useToast();

  useEffect(() => {
    setMounted(true);
    fetchUsersData();
  }, []);

  const fetchUsersData = async () => {
    try {
      setLoading(true);
      console.log("Fetching users...");
      const userData = await fetchUsers();
      console.log("Received user data:", userData);
      setUsers(userData);
      
      if (userData.length === 0) {
        warning("No users found in database. Check console for details.");
      } else {
        console.log(`Successfully loaded ${userData.length} users`);
      }
    } catch (err) {
      error("Failed to fetch users");
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleToggle = async (userId: string, role: string) => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) return;

      const hasRole = user.roles.includes(role);
      const result = hasRole 
        ? await removeUserRole(userId, role)
        : await addUserRole(userId, role);

      if (result.success) {
        fetchUsersData();
        success(`Successfully ${hasRole ? 'removed' : 'added'} ${role} role`);
      } else {
        error(`Failed to update role: ${result.error}`);
      }
    } catch (err) {
      error("Failed to update user role");
      console.error("Error updating role:", err);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.form_class?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesRole = filterRole === "all" || user.roles.includes(filterRole);
    return matchesSearch && matchesRole;
  });

  if (!mounted) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50">
        <Navbar />
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="text-xl text-gray-600">Loading admin dashboard...</div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <Image
              src="/images/Campion_Logo.png"
              alt="Campion College Logo"
              width={150}
              height={150}
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-4xl font-bold mb-4" style={{color: '#B91C47'}}>Admin Dashboard</h1>
          <p className="text-xl max-w-2xl mx-auto" style={{color: '#B91C47'}}>
            Complete system administration and user management
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between mb-6">
            <div className="flex-1 w-full lg:w-auto">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent shadow-sm"
                style={{'--tw-ring-color': '#B91C47'} as any}
              />
            </div>
            
            <div className="flex gap-3">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent shadow-sm"
                style={{'--tw-ring-color': '#B91C47'} as any}
              >
                <option value="all">All Roles</option>
                <option value="student">Students</option>
                <option value="beadle">Beadles</option>
                <option value="supervisor">Supervisors</option>
                <option value="admin">Admins</option>
                <option value="tech_team">Tech Team</option>
              </select>
              
              <button
                onClick={fetchUsersData}
                disabled={loading}
                className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? "Loading..." : "Refresh"}
              </button>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{users.filter(u => u.roles.includes('student')).length}</div>
              <div className="text-sm text-blue-800">Students</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{users.filter(u => u.roles.includes('beadle')).length}</div>
              <div className="text-sm text-green-800">Beadles</div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{users.filter(u => u.roles.includes('supervisor')).length}</div>
              <div className="text-sm text-purple-800">Supervisors</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold" style={{color: '#B91C47'}}>{users.filter(u => u.roles.includes('admin')).length}</div>
              <div className="text-sm text-red-800">Admins</div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-purple-800">{users.filter(u => u.roles.includes('super_admin')).length}</div>
              <div className="text-sm text-purple-800">Super Admins</div>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{users.filter(u => u.roles.includes('tech_team')).length}</div>
              <div className="text-sm text-orange-800">Tech Team</div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold" style={{color: '#B91C47'}}>User Management</h2>
            <p className="text-gray-600">Manage all user accounts and role assignments</p>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="text-gray-600">Loading users...</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Roles</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role Management</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          {user.form_class && (
                            <div className="text-xs text-gray-400">{user.form_class}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {user.roles.map(role => (
                            <span 
                              key={role}
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                role === 'admin' 
                                  ? 'bg-red-100 text-red-800'
                                  : role === 'supervisor'
                                  ? 'bg-purple-100 text-purple-800'
                                  : role === 'beadle' 
                                  ? 'bg-green-100 text-green-800'
                                  : role === 'tech_team'
                                  ? 'bg-orange-100 text-orange-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {role.charAt(0).toUpperCase() + role.slice(1)}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="grid grid-cols-2 gap-2">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={user.roles.includes('student')}
                              onChange={() => handleRoleToggle(user.id, 'student')}
                              className="rounded border-gray-300 text-red-600 focus:ring-red-500 mr-2"
                            />
                            <span className="text-sm">Student</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={user.roles.includes('beadle')}
                              onChange={() => handleRoleToggle(user.id, 'beadle')}
                              className="rounded border-gray-300 text-red-600 focus:ring-red-500 mr-2"
                            />
                            <span className="text-sm">Beadle</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={user.roles.includes('supervisor')}
                              onChange={() => handleRoleToggle(user.id, 'supervisor')}
                              className="rounded border-gray-300 text-red-600 focus:ring-red-500 mr-2"
                            />
                            <span className="text-sm">Supervisor</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={user.roles.includes('admin')}
                              onChange={() => handleRoleToggle(user.id, 'admin')}
                              className="rounded border-gray-300 text-red-600 focus:ring-red-500 mr-2"
                            />
                            <span className="text-sm">Admin</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={user.roles.includes('tech_team')}
                              onChange={() => handleRoleToggle(user.id, 'tech_team')}
                              className="rounded border-gray-300 text-red-600 focus:ring-red-500 mr-2"
                            />
                            <span className="text-sm">Tech Team</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={user.roles.includes('super_admin')}
                              onChange={() => handleRoleToggle(user.id, 'super_admin')}
                              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 mr-2"
                            />
                            <span className="text-sm font-semibold text-purple-800">Super Admin</span>
                          </label>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredUsers.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  No users found matching your search criteria.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
      
      {mounted && <ToastContainer toasts={toasts} onRemove={removeToast} />}
    </main>
  );
}
