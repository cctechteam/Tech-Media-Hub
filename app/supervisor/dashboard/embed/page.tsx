"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchCurrentUser } from "@/lib/serverUtils";
import { retrieveSessionToken } from "@/lib/utils";
import { getAllMembersWithRoles, addRoleToMember, removeRoleFromMember } from "@/lib/role-db-helpers";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/Toast";

type User = {
  id: number;
  email: string;
  full_name: string;
  form_class?: string;
  roles: string[];
  roleDetails: any[];
};

export default function SupervisorDashboardEmbed() {
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
      
      const formStudents = allUsers.filter((user: User) => {
        if (!user.form_class) return false;
        
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

  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{color: '#B91C47'}}>
            Form {supervisorForm} Supervisor Dashboard
          </h1>
          <p className="text-lg text-gray-700">
            Manage beadle assignments for Form {supervisorForm}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Supervisor: {currentUser?.full_name}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search by name, email, or form class..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent shadow-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{students.length}</div>
              <div className="text-sm text-blue-800">Total Students</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{beadleCount}</div>
              <div className="text-sm text-green-800">Active Beadles</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold" style={{color: '#B91C47'}}>
                {regularStudentCount}
              </div>
              <div className="text-sm text-red-800">Regular Students</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-bold" style={{color: '#B91C47'}}>
              Form {supervisorForm} Students
            </h2>
            <p className="text-sm text-gray-600">Assign or remove beadle roles</p>
          </div>

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
        </div>
      </div>

      {mounted && <ToastContainer toasts={toasts} onRemove={removeToast} />}
    </div>
  );
}
