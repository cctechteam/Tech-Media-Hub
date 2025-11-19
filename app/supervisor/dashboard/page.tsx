"use client";

/**
 * Supervisor Dashboard
 * 
 * Allows form supervisors to:
 * - View students in their assigned form
 * - Assign/remove beadle role to students in their form
 * - View beadle reports for their form
 * 
 * @author Campion College Resources & Tools Hub Team
 * @version 2.0
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { fetchCurrentUser } from "@/lib/serverUtils";
import { retrieveSessionToken } from "@/lib/utils";
import { getAllMembersWithRoles, addRoleToMember, removeRoleFromMember } from "@/lib/role-db-helpers";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/Toast";
import ProtectedRoute from "@/components/ProtectedRoute";

type User = {
  id: number;
  email: string;
  full_name: string;
  form_class?: string;
  roles: string[];
  roleDetails: any[];
};

export default function SupervisorDashboard() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [supervisorForm, setSupervisorForm] = useState<string>("");
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toasts, success, error, removeToast } = useToast();

  useEffect(() => {
    setMounted(true);
    initializeDashboard();
  }, []);

  const initializeDashboard = async () => {
    try {
      const token = retrieveSessionToken();
      if (!token) {
        router.push("/auth/login");
        return;
      }

      const user = await fetchCurrentUser(token, false);
      if (!user) {
        router.push("/auth/login");
        return;
      }

      setCurrentUser(user);

      // Determine which form this supervisor manages
      const supervisorRoles = user.roles || [];
      let form = "";
      
      if (supervisorRoles.includes("supervisor_1")) form = "1";
      else if (supervisorRoles.includes("supervisor_2")) form = "2";
      else if (supervisorRoles.includes("supervisor_3")) form = "3";
      else if (supervisorRoles.includes("supervisor_4")) form = "4";
      else if (supervisorRoles.includes("supervisor_5")) form = "5";
      else if (supervisorRoles.includes("supervisor_6")) form = "6";
      else if (supervisorRoles.includes("supervisor_6a")) form = "6A";

      if (!form) {
        error("You are not assigned to supervise any form");
        return;
      }

      setSupervisorForm(form);
      await fetchStudents(form);
    } catch (err) {
      console.error("Error initializing dashboard:", err);
      error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async (form: string) => {
    try {
      const allUsers = await getAllMembersWithRoles();
      
      // Filter students by form class
      const formStudents = allUsers.filter((user: User) => {
        if (!user.form_class) return false;
        
        // Match form class (e.g., "5-2" matches form "5", "6A-1" matches form "6A")
        const formPrefix = user.form_class.split("-")[0].toUpperCase();
        return formPrefix === form.toUpperCase();
      });

      setStudents(formStudents);
    } catch (err) {
      console.error("Error fetching students:", err);
      error("Failed to fetch students");
    }
  };

  const toggleBeadleRole = async (userId: number, currentlyHasRole: boolean) => {
    try {
      const result = currentlyHasRole
        ? await removeRoleFromMember(userId, "beadle")
        : await addRoleToMember(userId, "beadle");

      if (result.success) {
        success(currentlyHasRole ? "Beadle role removed" : "Beadle role assigned");
        await fetchStudents(supervisorForm);
      } else {
        error(result.error || "Failed to update role");
      }
    } catch (err) {
      console.error("Error toggling beadle role:", err);
      error("Failed to update role");
    }
  };

  const filteredStudents = students.filter(student =>
    student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (student.form_class?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  const beadleCount = students.filter(s => s.roles.includes("beadle")).length;
  const regularStudentCount = students.filter(s => !s.roles.includes("beadle")).length;

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute requiredRoles={["supervisor"]} requireAnyRole={true}>
      <main className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
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
            <h1 className="text-4xl font-bold mb-4" style={{color: '#B91C47'}}>
              Form {supervisorForm} Supervisor Dashboard
            </h1>
            <p className="text-xl text-gray-700">
              Manage beadle assignments for Form {supervisorForm}
            </p>
            <div className="mt-2 text-sm text-gray-600">
              <p className="font-medium">Campion College</p>
              <p>Supervisor: {currentUser?.full_name}</p>
            </div>
          </div>

          {/* Search and Stats */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8">
            <div className="mb-6">
              <input
                type="text"
                placeholder="Search by name, email, or form class..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent shadow-sm"
              />
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{students.length}</div>
                <div className="text-sm text-blue-800">Total Students</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{beadleCount}</div>
                <div className="text-sm text-green-800">Active Beadles</div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold" style={{color: '#B91C47'}}>
                  {regularStudentCount}
                </div>
                <div className="text-sm text-red-800">Regular Students</div>
              </div>
            </div>
          </div>

          {/* Students Table */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold" style={{color: '#B91C47'}}>
                Form {supervisorForm} Students
              </h2>
              <p className="text-gray-600">Assign or remove beadle roles</p>
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
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Form Class
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredStudents.map((student) => {
                      const isBeadle = student.roles.includes("beadle");
                      return (
                        <tr key={student.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {student.full_name}
                              </div>
                              <div className="text-sm text-gray-500">{student.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900">
                              {student.form_class || "Not set"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                                isBeadle
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {isBeadle ? "Beadle" : "Student"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => toggleBeadleRole(student.id, isBeadle)}
                              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                isBeadle
                                  ? "bg-red-100 text-red-700 hover:bg-red-200"
                                  : "bg-green-100 text-green-700 hover:bg-green-200"
                              }`}
                            >
                              {isBeadle ? "Remove Beadle" : "Make Beadle"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {filteredStudents.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    No students found in Form {supervisorForm}.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* View Reports Button */}
          <div className="mt-8 text-center">
            <button
              onClick={() => router.push(`/supervisor/reports?form=${supervisorForm}`)}
              className="px-8 py-3 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              style={{backgroundColor: '#B91C47'}}
              onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#A01B3F'}
              onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#B91C47'}
            >
              View Form {supervisorForm} Beadle Reports
            </button>
          </div>
        </div>

        {/* Toast Notifications */}
        {mounted && <ToastContainer toasts={toasts} onRemove={removeToast} />}
      </main>
    </ProtectedRoute>
  );
}
