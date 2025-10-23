"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import Image from "next/image";
import { getAllUsers, addUserRole, removeUserRole, setUserRoles, updateUserFormClass, createUser, bulkUpdateUserRoles } from "@/lib/serverUtils";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/Toast";

type User = {
  id: string;
  email: string;
  full_name: string;
  form_class?: string;
  roles: string[]; // Array of roles (tag-based system)
  created_at: string;
};

export default function SupervisorDashboard() {
  const [mounted, setMounted] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [showAddUser, setShowAddUser] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const { toasts, success, error, warning, removeToast } = useToast();

  useEffect(() => {
    setMounted(true);
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const userData = await getAllUsers();
      setUsers(userData);
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
        // Refresh user data
        fetchUsers();
        success(`Successfully ${hasRole ? 'removed' : 'added'} ${role} role`);
      } else {
        error(`Failed to update role: ${result.error}`);
      }
    } catch (err) {
      error("Failed to update user role");
      console.error("Error updating role:", err);
    }
  };

  const handleFormClassChange = async (userId: string, formClass: string) => {
    try {
      const result = await updateUserFormClass(userId, formClass);
      if (result.success) {
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, form_class: formClass } : user
        ));
        success(`Successfully updated form class to ${formClass}`);
      } else {
        error(`Failed to update form class: ${result.error}`);
      }
    } catch (err) {
      error("Failed to update form class");
      console.error("Error updating form class:", err);
    }
  };

  const handleSelectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map(user => user.id)));
    }
  };

  const handleSelectUser = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleBulkRoleUpdate = async (newRole: 'student' | 'beadle') => {
    if (selectedUsers.size === 0) {
      warning("Please select users to update");
      return;
    }

    try {
      const updates = Array.from(selectedUsers).map(userId => ({
        userId,
        newRole
      }));

      const result = await bulkUpdateUserRoles(updates);
      if (result.success) {
        success(`Successfully updated ${result.successCount} users to ${newRole}`);
        setSelectedUsers(new Set());
        setShowBulkActions(false);
        fetchUsers(); // Refresh the list
      } else {
        error(`Bulk update completed with errors: ${result.errors?.join(', ')}`);
      }
    } catch (err) {
      error("Failed to perform bulk update");
      console.error("Error in bulk update:", err);
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
          <div className="text-xl text-gray-600">Loading supervisor dashboard...</div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          {/* Campion College Logo */}
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
          <h1 className="text-4xl font-bold mb-4" style={{color: '#B91C47'}}>Supervisor Dashboard</h1>
          <p className="text-xl max-w-2xl mx-auto" style={{color: '#B91C47'}}>
            Manage student accounts and assign beadle roles
          </p>
          <div className="mt-2 text-sm text-gray-600">
            <p className="font-medium">Campion College</p>
            <p>Technology & Media Production Department</p>
          </div>
        </div>

        {/* Controls Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between mb-6">
            <div className="flex-1 w-full lg:w-auto">
              <input
                type="text"
                placeholder="Search by name, email, or form class..."
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
              </select>
              
              <button
                onClick={() => setShowAddUser(true)}
                className="px-6 py-3 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                style={{backgroundColor: '#B91C47'}}
                onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#A01B3F'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#B91C47'}
              >
                Add User
              </button>
              
              {selectedUsers.size > 0 && (
                <button
                  onClick={() => setShowBulkActions(true)}
                  className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 hover:bg-blue-600"
                >
                  Bulk Actions ({selectedUsers.size})
                </button>
              )}
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{users.length}</div>
              <div className="text-sm text-blue-800">Total Students</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {users.filter(u => u.roles.includes('beadle')).length}
              </div>
              <div className="text-sm text-green-800">Active Beadles</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold" style={{color: '#B91C47'}}>
                {users.filter(u => u.roles.includes('student') && !u.roles.includes('beadle')).length}
              </div>
              <div className="text-sm text-red-800">Students Only</div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold" style={{color: '#B91C47'}}>Student Accounts</h2>
            <p className="text-gray-600">Manage student roles and beadle assignments</p>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="text-gray-600">Loading students...</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Form Class
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedUsers.has(user.id)}
                          onChange={() => handleSelectUser(user.id)}
                          className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={user.form_class || ''}
                          onChange={(e) => handleFormClassChange(user.id, e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                          style={{'--tw-ring-color': '#B91C47'} as any}
                        >
                          <option value="">Select Form</option>
                          <option value="1st Form">1st Form</option>
                          <option value="2nd Form">2nd Form</option>
                          <option value="3rd Form">3rd Form</option>
                          <option value="4th Form">4th Form</option>
                          <option value="5th Form">5th Form</option>
                          <option value="6A">6A (Upper 6th)</option>
                          <option value="6B">6B (Lower 6th)</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {user.roles.map(role => (
                            <span 
                              key={role}
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                role === 'beadle' 
                                  ? 'bg-green-100 text-green-800' 
                                  : role === 'supervisor'
                                  ? 'bg-blue-100 text-blue-800'
                                  : role === 'admin'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {role.charAt(0).toUpperCase() + role.slice(1)}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex flex-col gap-2">
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
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredUsers.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  No students found matching your search criteria.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold" style={{color: '#B91C47'}}>Add New User</h3>
                <button
                  onClick={() => setShowAddUser(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
            
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const userData = {
                  email: formData.get('email') as string,
                  full_name: formData.get('full_name') as string,
                  form_class: formData.get('form_class') as string,
                  role: formData.get('role') as string,
                };

                try {
                  const result = await createUser(userData);
                  if (result.success) {
                    success(`User created successfully! ${result.defaultPassword ? `Default password: ${result.defaultPassword}` : ''}`);
                    setShowAddUser(false);
                    fetchUsers(); // Refresh the list
                  } else {
                    error(`Failed to create user: ${result.error}`);
                  }
                } catch (err) {
                  error("Failed to create user");
                  console.error("Error creating user:", err);
                }
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="full_name"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{'--tw-ring-color': '#B91C47'} as any}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{'--tw-ring-color': '#B91C47'} as any}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Form Class
                </label>
                <select
                  name="form_class"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{'--tw-ring-color': '#B91C47'} as any}
                >
                  <option value="">Select Form</option>
                  <option value="1st Form">1st Form</option>
                  <option value="2nd Form">2nd Form</option>
                  <option value="3rd Form">3rd Form</option>
                  <option value="4th Form">4th Form</option>
                  <option value="5th Form">5th Form</option>
                  <option value="6A">6A (Upper 6th)</option>
                  <option value="6B">6B (Lower 6th)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role *
                </label>
                <select
                  name="role"
                  required
                  defaultValue="student"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{'--tw-ring-color': '#B91C47'} as any}
                >
                  <option value="student">Student</option>
                  <option value="beadle">Beadle</option>
                </select>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddUser(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-white rounded-md transition-colors"
                  style={{backgroundColor: '#B91C47'}}
                  onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#A01B3F'}
                  onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#B91C47'}
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Actions Modal */}
      {showBulkActions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold" style={{color: '#B91C47'}}>
                  Bulk Actions ({selectedUsers.size} users selected)
                </h3>
                <button
                  onClick={() => setShowBulkActions(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">
                Select an action to apply to all {selectedUsers.size} selected users:
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => handleBulkRoleUpdate('student')}
                  className="w-full px-4 py-3 text-left border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium">Set as Students</div>
                  <div className="text-sm text-gray-500">Remove beadle privileges from selected users</div>
                </button>
                
                <button
                  onClick={() => handleBulkRoleUpdate('beadle')}
                  className="w-full px-4 py-3 text-left border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium">Set as Beadles</div>
                  <div className="text-sm text-gray-500">Grant beadle privileges to selected users</div>
                </button>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowBulkActions(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setSelectedUsers(new Set());
                    setShowBulkActions(false);
                  }}
                  className="flex-1 px-4 py-2 text-white rounded-md transition-colors"
                  style={{backgroundColor: '#B91C47'}}
                  onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#A01B3F'}
                  onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#B91C47'}
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
      
      {/* Toast Notifications */}
      {mounted && <ToastContainer toasts={toasts} onRemove={removeToast} />}
    </main>
  );
}
