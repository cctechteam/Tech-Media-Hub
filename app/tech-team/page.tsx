"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { FaUsersCog, FaCog, FaBars, FaTimes, FaSearch, FaEdit, FaSave } from "react-icons/fa";
import ProtectedRoute from "@/components/ProtectedRoute";

interface User {
  id: number;
  full_name: string;
  email: string;
  roles: string[] | string;
  form_class: string | null;
}

export default function TechTeamPortal() {
  const [activeSection, setActiveSection] = useState("roles");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [editingUser, setEditingUser] = useState<number | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const primaryRoles = [
    { value: "student", label: "Student", color: "bg-blue-100 text-blue-800" },
    { value: "staff", label: "Staff", color: "bg-green-100 text-green-800" },
    { value: "supervisor", label: "Supervisor", color: "bg-purple-100 text-purple-800" },
    { value: "tech_team", label: "Tech Team", color: "bg-orange-100 text-orange-800" },
    { value: "admin", label: "Admin", color: "bg-red-100 text-red-800" }
  ];

  const subRoles: Record<string, Array<{value: string, label: string}>> = {
    student: [{ value: "beadle", label: "Beadle" }],
    staff: [
      { value: "teacher", label: "Teacher" },
      { value: "ancillary", label: "Ancillary Staff" }
    ],
    supervisor: [
      { value: "supervisor_1", label: "Form 1 Supervisor" },
      { value: "supervisor_2", label: "Form 2 Supervisor" },
      { value: "supervisor_3", label: "Form 3 Supervisor" },
      { value: "supervisor_4", label: "Form 4 Supervisor" },
      { value: "supervisor_5", label: "Form 5 Supervisor" },
      { value: "supervisor_6", label: "Form 6 Supervisor" },
      { value: "supervisor_6a", label: "Form 6A Supervisor" }
    ],
    tech_team: [
      { value: "tech_team_president", label: "President" },
      { value: "tech_team_vice_president", label: "Vice President" },
      { value: "tech_team_junior_vice_president", label: "Junior Vice President" },
      { value: "tech_team_member", label: "Member" }
    ],
    admin: [
      { value: "principal", label: "Principal" },
      { value: "vice_principal", label: "Vice Principal" },
      { value: "dean_of_discipline", label: "Dean of Discipline" }
    ]
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users/list");
      const data = await response.json();
      setUsers(data.users || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setLoading(false);
    }
  };

  const startEditing = (user: User) => {
    setEditingUser(user.id);
    const roles = Array.isArray(user.roles) ? user.roles : (typeof user.roles === 'string' ? JSON.parse(user.roles) : []);
    setSelectedRoles(roles);
  };

  const cancelEditing = () => {
    setEditingUser(null);
    setSelectedRoles([]);
  };

  const toggleRole = (role: string) => {
    if (selectedRoles.includes(role)) {
      setSelectedRoles(selectedRoles.filter(r => r !== role));
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  const saveRoles = async (userId: number) => {
    try {
      const response = await fetch("/api/users/update-roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, roles: selectedRoles })
      });

      if (response.ok) {
        await fetchUsers();
        setEditingUser(null);
        setSelectedRoles([]);
      }
    } catch (error) {
      console.error("Error updating roles:", error);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    const primary = primaryRoles.find(r => r.value === role);
    if (primary) return primary.color;
    return "bg-gray-100 text-gray-800";
  };

  const getRoleLabel = (role: string) => {
    const primary = primaryRoles.find(r => r.value === role);
    if (primary) return primary.label;

    for (const [key, roles] of Object.entries(subRoles)) {
      const subRole = roles.find(r => r.value === role);
      if (subRole) return subRole.label;
    }

    return role;
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.form_class?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    
    const userRoles = Array.isArray(user.roles) ? user.roles : [];
    const matchesRole = selectedRole === "all" || userRoles.includes(selectedRole);
    return matchesSearch && matchesRole;
  });

  const menuItems = [
    {
      id: "roles",
      name: "Role Management",
      icon: <FaUsersCog className="text-xl" />,
      description: "Manage user roles and permissions",
      link: "/tech-team/role-management"
    },
  ];

  return (
    <ProtectedRoute requiredRoles={["tech_team", "admin"]} requireAnyRole={true}>
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-white to-gray-50">
        <Navbar />
      
      <div className="flex-1 flex">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden fixed bottom-6 right-6 z-50 p-4 text-white rounded-full shadow-campion-lg hover:shadow-campion-xl transition-all duration-300 hover:scale-110"
          style={{backgroundColor: '#8B1538'}}
        >
          {sidebarOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
        </button>

        <aside
          className={`
            fixed md:sticky top-0 left-0 h-screen bg-white border-r border-gray-200 shadow-lg
            transition-transform duration-300 z-40 md:translate-x-0
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            w-64 md:w-72
          `}
          style={{top: '73px'}}
        >
          <div className="p-6">
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold mb-2" style={{color: '#8B1538'}}>
                Tech Team Portal
              </h2>
              <p className="text-sm text-gray-600">
                System management and configuration
              </p>
            </div>

            <nav className="space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-start p-4 rounded-xl transition-all duration-200
                    ${activeSection === item.id 
                      ? 'bg-gradient-to-r from-red-50 to-pink-50 border-l-4 shadow-sm' 
                      : 'hover:bg-gray-50 border-l-4 border-transparent hover:shadow-sm'
                    }
                  `}
                  style={activeSection === item.id ? {borderLeftColor: '#8B1538'} : {}}
                >
                  <div 
                    className={`
                      mr-3 mt-0.5
                      ${activeSection === item.id ? 'text-[#8B1538]' : 'text-gray-400'}
                    `}
                  >
                    {item.icon}
                  </div>
                  <div className="text-left">
                    <div 
                      className={`
                        font-semibold text-sm
                        ${activeSection === item.id ? 'text-[#8B1538]' : 'text-gray-700'}
                      `}
                    >
                      {item.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {item.description}
                    </div>
                  </div>
                </button>
              ))}
            </nav>

            <div className="mt-8 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
              <p className="text-xs text-gray-700 font-bold mb-2 uppercase tracking-wide">
                Coming Soon
              </p>
              <p className="text-xs text-gray-600 leading-relaxed">
                More tech team tools and features will be added here.
              </p>
            </div>
          </div>
        </aside>

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        <main className="flex-1 overflow-auto">
          {activeSection === "roles" && (
            <div className="p-8 bg-gradient-to-br from-red-50 via-white to-blue-50">
              <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-2">
                    <FaUsersCog className="text-3xl" style={{color: '#8B1538'}} />
                    <h1 className="text-3xl font-bold" style={{color: '#8B1538'}}>
                      Role Management
                    </h1>
                  </div>
                  <p className="text-gray-600">
                    Manage user roles and permissions across the system
                  </p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>

                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="all">All Roles</option>
                      {primaryRoles.map(role => (
                        <option key={role.value} value={role.value}>{role.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  {loading ? (
                    <div className="p-12 text-center text-gray-500">
                      Loading users...
                    </div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                      No users found
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              User
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Form Class
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Roles
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {filteredUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4">
                                <div>
                                  <div className="font-medium text-gray-900">{user.full_name}</div>
                                  <div className="text-sm text-gray-500">{user.email}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-sm text-gray-700">
                                  {user.form_class || "-"}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                {editingUser === user.id ? (
                                  <div className="space-y-3">
                                    <div>
                                      <p className="text-xs font-semibold text-gray-600 mb-2">Primary Roles</p>
                                      <div className="flex flex-wrap gap-2">
                                        {primaryRoles.map(role => (
                                          <button
                                            key={role.value}
                                            onClick={() => toggleRole(role.value)}
                                            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                                              selectedRoles.includes(role.value)
                                                ? role.color
                                                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                            }`}
                                          >
                                            {role.label}
                                          </button>
                                        ))}
                                      </div>
                                    </div>

                                    {Object.entries(subRoles).map(([key, roles]) => {
                                      if (!selectedRoles.includes(key)) return null;
                                      return (
                                        <div key={key}>
                                          <p className="text-xs font-semibold text-gray-600 mb-2 capitalize">
                                            {key.replace('_', ' ')} Sub-roles
                                          </p>
                                          <div className="flex flex-wrap gap-2">
                                            {roles.map(role => (
                                              <button
                                                key={role.value}
                                                onClick={() => toggleRole(role.value)}
                                                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                                                  selectedRoles.includes(role.value)
                                                    ? 'bg-indigo-100 text-indigo-800'
                                                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                                }`}
                                              >
                                                {role.label}
                                              </button>
                                            ))}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <div className="flex flex-wrap gap-2">
                                    {(Array.isArray(user.roles) ? user.roles : []).map((role: string) => (
                                      <span
                                        key={role}
                                        className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(role)}`}
                                      >
                                        {getRoleLabel(role)}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4 text-right">
                                {editingUser === user.id ? (
                                  <div className="flex justify-end gap-2">
                                    <button
                                      onClick={() => saveRoles(user.id)}
                                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                      title="Save"
                                    >
                                      <FaSave />
                                    </button>
                                    <button
                                      onClick={cancelEditing}
                                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                      title="Cancel"
                                    >
                                      <FaTimes />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => startEditing(user)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Edit Roles"
                                  >
                                    <FaEdit />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
                  {primaryRoles.map(role => {
                    const count = users.filter(u => {
                      const userRoles = Array.isArray(u.roles) ? u.roles : [];
                      return userRoles.includes(role.value);
                    }).length;
                    return (
                      <div key={role.value} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className={`text-2xl font-bold ${role.color.split(' ')[1]}`}>
                          {count}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">{role.label}s</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
