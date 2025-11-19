"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getBeadleSlips } from "@/lib/serverUtils";
import ProtectedRoute from "@/components/ProtectedRoute";
import Image from "next/image";

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

export default function SupervisorReports() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const form = searchParams.get("form") || "";
  
  const [slips, setSlips] = useState<BeadleSlip[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");

  useEffect(() => {
    fetchReports();
  }, [form]);

  const fetchReports = async () => {
    try {
      const allSlips = await getBeadleSlips();
      
      const formSlips = allSlips.filter((slip: BeadleSlip) => {
        const gradeNumber = slip.grade_level.replace(/\D/g, ""); 
        return gradeNumber === form || slip.grade_level.toUpperCase().includes(form.toUpperCase());
      });

      setSlips(formSlips);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSlips = slips.filter(slip => {
    const matchesSearch = 
      slip.teacher.toLowerCase().includes(searchTerm.toLowerCase()) ||
      slip.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      slip.class_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = !filterDate || slip.date === filterDate;
    
    return matchesSearch && matchesDate;
  });

  return (
    <ProtectedRoute requiredRoles={["supervisor"]} requireAnyRole={true}>
      <main className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Image
                src="/images/Campion_Logo.png"
                alt="Campion College Logo"
                width={120}
                height={120}
                className="object-contain"
                priority
              />
            </div>
            <h1 className="text-3xl font-bold mb-2" style={{color: '#B91C47'}}>
              Form {form} Beadle Reports
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
            {loading ? (
              <div className="p-8 text-center">
                <div className="text-gray-600">Loading reports...</div>
              </div>
            ) : filteredSlips.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No reports found for Form {form}
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Present</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredSlips.map((slip) => (
                      <tr key={slip.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {new Date(slip.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{slip.class_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{slip.teacher}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{slip.subject}</td>
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push("/supervisor/dashboard")}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
