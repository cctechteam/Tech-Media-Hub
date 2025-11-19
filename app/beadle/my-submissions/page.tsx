"use client";

import { getBeadleSlips, fetchCurrentUser } from "@/lib/serverUtils";
import { retrieveSessionToken } from "@/lib/utils";
import { checkBeadleAccess } from "@/lib/beadle-auth";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ToastContainer } from '@/components/Toast';
import { useToast } from '@/hooks/useToast';
import Image from 'next/image';
import { formatJamaicanDate, formatTime, formatJamaicanDateTime } from "@/lib/timeUtils";

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
  is_double_session?: boolean;
  created_at: string;
};

export default function MySubmissionsPage() {
  const router = useRouter();
  const { toasts, error, removeToast } = useToast();
  const [slips, setSlips] = useState<BeadleSlip[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [accessMessage, setAccessMessage] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedSlip, setSelectedSlip] = useState<BeadleSlip | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");

  useEffect(() => {
    checkAccessAndLoadData();
  }, []);

  const checkAccessAndLoadData = async () => {
    const result = await checkBeadleAccess();
    setHasAccess(result.hasAccess);
    setCurrentUser(result.user);
    
    if (!result.hasAccess) {
      setAccessMessage(result.message || "Access denied");
      if (!result.user) {
        setTimeout(() => router.push("/auth/login"), 2000);
      }
      setLoading(false);
      return;
    }

    await loadData();
  };

  const loadData = async () => {
    try {
      const user = await fetchCurrentUser(retrieveSessionToken(), true);
      setCurrentUser(user);
      
      if (user?.email) {
        const allSlips = await getBeadleSlips();
        const mySlips = allSlips.filter(slip => slip.beadle_email === user.email);
        setSlips(mySlips);
      }
    } catch (err) {
      console.error("Error loading submissions:", err);
      error("Failed to load your submissions");
    } finally {
      setLoading(false);
    }
  };



  const filteredSlips = slips.filter(slip => {
    const matchesSearch = searchTerm === "" || 
      slip.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      slip.teacher.toLowerCase().includes(searchTerm.toLowerCase()) ||
      slip.class_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = filterDate === "" || slip.date === filterDate;
    
    return matchesSearch && matchesDate;
  });

  if (loading) {
    return (
      <main className="min-h-screen text-gray-800 bg-gradient-to-br from-red-50 via-white to-indigo-50">
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!hasAccess) {
    return (
      <main className="min-h-screen text-gray-800 bg-gradient-to-br from-red-50 via-red-100/30 to-white flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl border-2 border-red-200 p-12 max-w-2xl w-full text-center">
          <div className="mb-8">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-4xl font-bold mb-4" style={{color: '#B91C47'}}>
              Not a Beadle
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              {accessMessage}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen text-gray-800 bg-gradient-to-br from-red-50 via-white to-indigo-50">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-lg shadow-lg border border-blue-100 p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-2">
              <Image
                src="/images/Campion_Logo.png"
                alt="Campion College Logo"
                width={150}
                height={150}
                className="object-contain"
                priority
              />
            </div>
            <h1 className="text-3xl font-bold mb-2" style={{color: '#B91C47'}}>My Beadle Submissions</h1>
            <p style={{color: '#B91C47'}}>View and track all your submitted attendance reports</p>
          </div>

          <div className="mb-6 space-y-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by teacher, subject, or class..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2" 
                  style={{'--tw-ring-color': '#B91C47'} as any}
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2" 
                  style={{'--tw-ring-color': '#B91C47'} as any}
                />
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setFilterDate("");
                  }}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="text-2xl font-bold" style={{color: '#B91C47'}}>{slips.length}</div>
              <div className="text-red-600 text-sm">Total Reports</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-800">{slips.filter(s => s.teacher_present === 'yes').length}</div>
              <div className="text-green-600 text-sm">Teacher Present</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <div className="text-2xl font-bold text-orange-800">{slips.reduce((sum, s) => sum + s.absent_students.length, 0)}</div>
              <div className="text-orange-600 text-sm">Students Absent</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-800">{slips.reduce((sum, s) => sum + s.late_students.length, 0)}</div>
              <div className="text-yellow-600 text-sm">Students Late</div>
            </div>
          </div>

          {filteredSlips.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-4">
                {slips.length === 0 ? "No submissions yet." : "No submissions match your search criteria."}
              </div>
              <a
                href="/beadle"
                className="inline-block px-6 py-3 text-white font-semibold rounded-lg transition-colors" 
                style={{backgroundColor: '#B91C47'}} 
                onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#A01B3F'} 
                onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#B91C47'}
              >
                Submit New Beadle Slip
              </a>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-white">
                    <th className="border border-gray-300 px-3 py-2 text-left text-sm">Date</th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-sm">Class</th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-sm">Subject</th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-sm">Teacher</th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-sm">Time</th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-sm">Absent / Late / Present</th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSlips.map((slip) => (
                    <tr key={slip.id} className="hover:bg-white">
                      <td className="border border-gray-300 px-3 py-2 text-sm">{formatJamaicanDate(slip.date)}</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">{slip.class_name}</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">{slip.subject}</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span>{slip.teacher}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            slip.teacher_present === 'yes' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {slip.teacher_present === 'yes' ? 'Present' : 'Absent'}
                          </span>
                        </div>
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">
                        {formatTime(slip.class_start_time)} - {formatTime(slip.class_end_time)}
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="bg-red-50 text-red-800 px-2 py-1 rounded font-medium">
                            {slip.absent_students.length}
                          </span>
                          <span className="text-gray-400">/</span>
                          <span className="bg-yellow-50 text-yellow-800 px-2 py-1 rounded font-medium">
                            {slip.late_students.length}
                          </span>
                          <span className="text-gray-400">/</span>
                          <span className="bg-green-50 text-green-800 px-2 py-1 rounded font-medium">
                            {slip.students_present}
                          </span>
                        </div>
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">
                        <button
                          onClick={() => setSelectedSlip(slip)}
                          className="px-3 py-1 text-white rounded hover:opacity-90 transition-opacity text-xs"
                          style={{backgroundColor: '#B91C47'}}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {selectedSlip && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-md animate-fadeIn"
          onClick={() => setSelectedSlip(null)}
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
                  <p className="text-white text-opacity-90 text-sm">{selectedSlip.subject} - {selectedSlip.class_name}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSlip(null)}
                className="w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center text-white text-2xl font-bold transition-all hover:rotate-90 duration-300"
              >
                ×
              </button>
            </div>
            
            <div className="overflow-y-auto max-h-[calc(90vh-88px)] bg-gray-50">
              <div className="p-6 space-y-4">
                {selectedSlip.teacher_present === 'no' && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                    <div className="flex items-center gap-3">
                      <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div>
                        <p className="font-bold text-red-800">Priority Attention Required</p>
                        <p className="text-sm text-red-700">• Teacher absent {selectedSlip.substitute_received === 'yes' ? '(Substitute provided)' : '(No substitute)'}</p>
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
                        <span className="font-semibold text-gray-900 text-right">{selectedSlip.subject}</span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="text-sm text-gray-600">Class:</span>
                        <span className="font-semibold text-gray-900 text-right">{selectedSlip.class_name}</span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="text-sm text-gray-600">Teacher:</span>
                        <span className="font-semibold text-gray-900 text-right">{selectedSlip.teacher}</span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="text-sm text-gray-600">Substitute:</span>
                        <span className={`font-semibold text-right ${selectedSlip.substitute_received === 'yes' ? 'text-green-600' : 'text-gray-400'}`}>
                          {selectedSlip.substitute_received === 'yes' ? 'Provided' : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between items-start pt-2 border-t">
                        <span className="text-sm text-gray-600">Date: {formatJamaicanDate(selectedSlip.date)}</span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="text-sm text-gray-600">Time:</span>
                        <span className="font-semibold text-gray-900">{formatTime(selectedSlip.class_start_time)} - {formatTime(selectedSlip.class_end_time)}</span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="text-sm text-gray-600">Grade Level:</span>
                        <span className="font-semibold text-gray-900">{selectedSlip.grade_level}</span>
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
                        <span className="text-2xl font-bold text-green-600">{selectedSlip.students_present}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Students Absent:</span>
                        <span className="text-2xl font-bold text-red-600">{selectedSlip.absent_students.length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Students Late:</span>
                        <span className="text-2xl font-bold text-orange-600">{selectedSlip.late_students.length}</span>
                      </div>
                      <div className="flex justify-between items-center pt-3 border-t">
                        <span className="text-sm text-gray-600">Teacher Present:</span>
                        <span className={`font-bold text-lg ${selectedSlip.teacher_present === 'yes' ? 'text-green-600' : 'text-red-600'}`}>
                          {selectedSlip.teacher_present === 'yes' ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedSlip.absent_students.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                      <h3 className="font-bold text-gray-800">Absent Students ({selectedSlip.absent_students.length})</h3>
                    </div>
                    <div className="space-y-2">
                      {selectedSlip.absent_students.map((student, idx) => (
                        <div key={idx} className="text-red-700 font-medium bg-red-50 px-3 py-2 rounded-lg">
                          {student}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedSlip.late_students.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="font-bold text-gray-800">Late Students ({selectedSlip.late_students.length})</h3>
                    </div>
                    <div className="space-y-2">
                      {selectedSlip.late_students.map((student, idx) => (
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
                      <span className="ml-2 font-semibold text-blue-900">{selectedSlip.homework_given === 'yes' ? 'yes' : 'no'}</span>
                    </div>
                    <div>
                      <span className="text-blue-700">Beadle:</span>
                      <span className="ml-2 font-semibold text-blue-900">{selectedSlip.beadle_email.split('@')[0]}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-blue-700">Submitted:</span>
                      <span className="ml-2 font-semibold text-blue-900">{formatJamaicanDateTime(selectedSlip.created_at)}</span>
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
                    onClick={() => setSelectedSlip(null)}
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
    </main>
  );
}
