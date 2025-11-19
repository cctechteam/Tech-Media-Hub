"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { FaClipboardList, FaChartLine, FaBars, FaTimes } from "react-icons/fa";
import { fetchCurrentUser, getBeadleSlips } from "@/lib/serverUtils";
import { retrieveSessionToken } from "@/lib/utils";
import { getAllMembersWithRoles, addRoleToMember, removeRoleFromMember } from "@/lib/role-db-helpers";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/Toast";
import { formatJamaicanDate, formatTime, formatJamaicanDateTime } from "@/lib/timeUtils";

type User = {
  id: number;
  email: string;
  full_name: string;
  form_class?: string;
  roles: string[];
  roleDetails: any[];
};

type BeadleSlip = {
  id: number;
  beadle_email: string;
  grade_level: string;
  class_name: string;
  class_start_time: string;
  class_end_time: string;
  date: string;
  teacher: string;
  subject: string;
  teacher_present: string;
  teacher_arrival_time: string | null;
  substitute_received: string | null;
  homework_given: string;
  students_present: number;
  absent_students: string[];
  late_students: string[];
  created_at: string;
};

export default function StaffPortal() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("reports");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [supervisorForm, setSupervisorForm] = useState<string>("");
  const [students, setStudents] = useState<User[]>([]);
  const [reports, setReports] = useState<BeadleSlip[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [selectedReport, setSelectedReport] = useState<BeadleSlip | null>(null);
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

      setSupervisorForm(form);
      if (form) {
        await fetchStudents(form);
        await fetchReports(form);
      }
    } catch (err) {
      console.error("Error initializing dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async (form: string) => {
    try {
      const allSlips = await getBeadleSlips();
      
      const formSlips = allSlips.filter((slip: BeadleSlip) => {
        const gradeNumber = slip.grade_level.replace(/\D/g, ""); 
        return gradeNumber === form || slip.grade_level.toUpperCase().includes(form.toUpperCase());
      });

      setReports(formSlips);
    } catch (err) {
      console.error("Error fetching reports:", err);
      error("Failed to fetch reports");
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

  const menuItems = [
    {
      id: "reports",
      name: "View Reports",
      icon: <FaClipboardList className="text-xl" />,
      description: "View submitted Beadle reports",
      link: "/beadle/view"
    },
    {
      id: "supervisor",
      name: "Supervisor Dashboard",
      icon: <FaChartLine className="text-xl" />,
      description: "Access supervisor tools",
      link: "/supervisor/dashboard"
    },
  ];

  return (
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
                Staff Portal
              </h2>
              <p className="text-sm text-gray-600">
                Access staff tools and dashboards
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
                More staff tools and features will be added here.
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

        <main className="flex-1 overflow-auto bg-gradient-to-br from-red-50 via-white to-blue-50">
          {activeSection === "reports" && (
            <div className="p-8">
              <div className="max-w-7xl mx-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                      <p className="mt-4 text-gray-600">Loading...</p>
                    </div>
                  </div>
                ) : !supervisorForm ? (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                    <h2 className="text-2xl font-bold mb-4" style={{color: '#8B1538'}}>
                      Not a Supervisor
                    </h2>
                    <p className="text-gray-600">
                      You are not assigned to supervise any form. Contact the Tech Team if you believe this is an error.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="text-center mb-8">
                      <h1 className="text-3xl font-bold mb-2" style={{color: '#8B1538'}}>
                        Form {supervisorForm} Beadle Reports
                      </h1>
                      <p className="text-gray-600">View attendance reports for your form</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="Search by teacher, subject, or class..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                        <input
                          type="date"
                          value={filterDate}
                          onChange={(e) => setFilterDate(e.target.value)}
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                      {reports.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                          No reports found for Form {supervisorForm}
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teacher</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Present</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {reports
                                .filter(slip => {
                                  const matchesSearch = 
                                    slip.teacher.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    slip.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    slip.class_name.toLowerCase().includes(searchTerm.toLowerCase());
                                  
                                  const matchesDate = !filterDate || slip.date === filterDate;
                                  
                                  return matchesSearch && matchesDate;
                                })
                                .map((slip) => {
                                  const dateObj = new Date(slip.date + 'T12:00:00');
                                  const formattedDate = dateObj.toLocaleDateString('en-US', {
                                    timeZone: 'America/Jamaica',
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit'
                                  });
                                  
                                  return (
                                    <tr key={slip.id} className="hover:bg-gray-50">
                                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {formattedDate}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm">{slip.class_name}</td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm">{slip.teacher}</td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm">{slip.subject}</td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {slip.class_start_time} - {slip.class_end_time}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm">{slip.students_present}</td>
                                      <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                            slip.teacher_present === "yes"
                                              ? "bg-green-100 text-green-800"
                                              : "bg-red-100 text-red-800"
                                          }`}
                                        >
                                          {slip.teacher_present === "yes" ? "Teacher Present" : "Teacher Absent"}
                                        </span>
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                          onClick={() => setSelectedReport(slip)}
                                          className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                                        >
                                          View Details
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">{reports.length}</div>
                        <div className="text-sm text-blue-800">Total Reports</div>
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {reports.filter(r => r.teacher_present === "yes").length}
                        </div>
                        <div className="text-sm text-green-800">Teacher Present</div>
                      </div>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {reports.filter(r => r.teacher_present === "no").length}
                        </div>
                        <div className="text-sm text-red-800">Teacher Absent</div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {activeSection === "supervisor" && (
            <div className="p-8">
              <div className="max-w-7xl mx-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                      <p className="mt-4 text-gray-600">Loading...</p>
                    </div>
                  </div>
                ) : !supervisorForm ? (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                    <h2 className="text-2xl font-bold mb-4" style={{color: '#8B1538'}}>
                      Not a Supervisor
                    </h2>
                    <p className="text-gray-600">
                      You are not assigned to supervise any form. Contact the Tech Team if you believe this is an error.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="text-center mb-8">
                      <h1 className="text-3xl font-bold mb-2" style={{color: '#8B1538'}}>
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
                          <div className="text-2xl font-bold text-green-600">
                            {students.filter(s => s.roles.includes("beadle")).length}
                          </div>
                          <div className="text-sm text-green-800">Active Beadles</div>
                        </div>
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                          <div className="text-2xl font-bold" style={{color: '#8B1538'}}>
                            {students.filter(s => !s.roles.includes("beadle")).length}
                          </div>
                          <div className="text-sm text-red-800">Regular Students</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                      <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-bold" style={{color: '#8B1538'}}>
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
                            {students
                              .filter(student =>
                                student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                (student.form_class?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
                              )
                              .map((student) => {
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

                        {students.filter(student =>
                          student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (student.form_class?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
                        ).length === 0 && (
                          <div className="p-8 text-center text-gray-500">
                            No students found in Form {supervisorForm}.
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      <Footer />
      
      {selectedReport && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-md animate-fadeIn"
          onClick={() => setSelectedReport(null)}
        >
          <div 
            className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gradient-to-r from-[#B91C47] to-[#8B1538] p-6 flex items-center justify-between shadow-lg z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <Image
                    src="/images/Campion_Logo.png"
                    alt="Campion Logo"
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Beadle Slip Details
                  </h2>
                  <p className="text-white text-opacity-90 text-sm">{selectedReport.subject} - {selectedReport.class_name}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center text-white text-2xl font-bold transition-all hover:rotate-90 duration-300"
              >
                ×
              </button>
            </div>
            
            <div className="overflow-y-auto max-h-[calc(90vh-88px)] bg-gray-50">
              <div className="p-6 space-y-4">
                {selectedReport.teacher_present === 'no' && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                    <div className="flex items-center gap-3">
                      <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div>
                        <p className="font-bold text-red-800">Priority Attention Required</p>
                        <p className="text-sm text-red-700">• Teacher absent {selectedReport.substitute_received === 'yes' ? '(Substitute provided)' : '(No substitute)'}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <h3 className="font-bold text-gray-800">Class Information</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <span className="text-sm text-gray-600">Subject:</span>
                        <span className="font-semibold text-gray-900 text-right">{selectedReport.subject}</span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="text-sm text-gray-600">Class:</span>
                        <span className="font-semibold text-gray-900 text-right">{selectedReport.class_name}</span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="text-sm text-gray-600">Teacher:</span>
                        <span className="font-semibold text-gray-900 text-right">{selectedReport.teacher}</span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="text-sm text-gray-600">Substitute:</span>
                        <span className={`font-semibold text-right ${selectedReport.substitute_received === 'yes' ? 'text-green-600' : 'text-gray-400'}`}>
                          {selectedReport.substitute_received === 'yes' ? 'Provided' : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between items-start pt-2 border-t">
                        <span className="text-sm text-gray-600">Date: {formatJamaicanDate(selectedReport.date)}</span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="text-sm text-gray-600">Time:</span>
                        <span className="font-semibold text-gray-900">{formatTime(selectedReport.class_start_time)} - {formatTime(selectedReport.class_end_time)}</span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="text-sm text-gray-600">Grade Level:</span>
                        <span className="font-semibold text-gray-900">{selectedReport.grade_level}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="font-bold text-gray-800">Attendance Summary</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Students Present:</span>
                        <span className="text-2xl font-bold text-green-600">{selectedReport.students_present}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Students Absent:</span>
                        <span className="text-2xl font-bold text-red-600">{selectedReport.absent_students.length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Students Late:</span>
                        <span className="text-2xl font-bold text-orange-600">{selectedReport.late_students.length}</span>
                      </div>
                      <div className="flex justify-between items-center pt-3 border-t">
                        <span className="text-sm text-gray-600">Teacher Present:</span>
                        <span className={`font-bold text-lg ${selectedReport.teacher_present === 'yes' ? 'text-green-600' : 'text-red-600'}`}>
                          {selectedReport.teacher_present === 'yes' ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedReport.absent_students.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                      <h3 className="font-bold text-gray-800">Absent Students ({selectedReport.absent_students.length})</h3>
                    </div>
                    <div className="space-y-2">
                      {selectedReport.absent_students.map((student, idx) => (
                        <div key={idx} className="text-red-700 font-medium bg-red-50 px-3 py-2 rounded-lg">
                          {student}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedReport.late_students.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="font-bold text-gray-800">Late Students ({selectedReport.late_students.length})</h3>
                    </div>
                    <div className="space-y-2">
                      {selectedReport.late_students.map((student, idx) => (
                        <div key={idx} className="text-orange-700 font-medium bg-orange-50 px-3 py-2 rounded-lg">
                          {student}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 rounded-xl shadow-sm border border-blue-200 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-blue-900">Additional Information</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700">Homework Given:</span>
                      <span className="ml-2 font-semibold text-blue-900">{selectedReport.homework_given === 'yes' ? 'yes' : 'no'}</span>
                    </div>
                    <div>
                      <span className="text-blue-700">Beadle:</span>
                      <span className="ml-2 font-semibold text-blue-900">{selectedReport.beadle_email.split('@')[0]}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-blue-700">Submitted:</span>
                      <span className="ml-2 font-semibold text-blue-900">{formatJamaicanDateTime(selectedReport.created_at)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy Report
                  </button>
                  <button
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print
                  </button>
                  <button
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                    </svg>
                    Flag Issue
                  </button>
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {mounted && <ToastContainer toasts={toasts} onRemove={removeToast} />}
    </div>
  );
}
