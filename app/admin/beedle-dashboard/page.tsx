"use client";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import { getBeadleSlips } from "@/lib/serverUtils";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { ToastContainer } from '@/components/Toast';
import { useToast } from '@/hooks/useToast';
import Image from 'next/image';

type BeadleSlip = {
  id: number;
  beedle_email: string;
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

type SortField = 'date' | 'teacher' | 'subject' | 'class_name' | 'students_present' | 'created_at';
type SortDirection = 'asc' | 'desc';

function BeedleDashboardContent() {
  const { toasts, success, error, removeToast } = useToast();
  const [slips, setSlips] = useState<BeadleSlip[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGrade, setFilterGrade] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterTeacher, setFilterTeacher] = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const [selectedSlip, setSelectedSlip] = useState<BeadleSlip | null>(null);
  const [mounted, setMounted] = useState(false);
  const [viewedReports, setViewedReports] = useState<Set<number>>(new Set());
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    loadSlips();
  }, []);

  const loadSlips = async () => {
    try {
      const data = await getBeadleSlips();
      setSlips(data);
    } catch (error) {
      console.error("Error loading beadle slips:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSlips = slips.filter(slip => {
    const matchesSearch = searchTerm === "" || 
      slip.teacher.toLowerCase().includes(searchTerm.toLowerCase()) ||
      slip.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      slip.class_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      slip.beedle_email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = filterDate === "" || slip.date === filterDate;
    const matchesGrade = filterGrade === "" || slip.grade_level === filterGrade;
    const matchesTeacher = filterTeacher === "" || slip.teacher.toLowerCase().includes(filterTeacher.toLowerCase());
    const matchesSubject = filterSubject === "" || slip.subject.toLowerCase().includes(filterSubject.toLowerCase());
    
    return matchesSearch && matchesDate && matchesGrade && matchesTeacher && matchesSubject;
  });

  // Group slips by form for supervisor view
  const groupedSlips = filteredSlips.reduce((groups, slip) => {
    const form = slip.grade_level;
    if (!groups[form]) {
      groups[form] = [];
    }
    groups[form].push(slip);
    return groups;
  }, {} as Record<string, BeadleSlip[]>);

  // Calculate supervisor-focused statistics
  const supervisorStats = {
    totalForms: Object.keys(groupedSlips).length,
    totalSlips: filteredSlips.length,
    teachersPresent: filteredSlips.filter(s => s.teacher_present === 'yes').length,
    teachersAbsent: filteredSlips.filter(s => s.teacher_present === 'no').length,
    totalStudents: filteredSlips.reduce((sum, s) => sum + s.students_present, 0),
    totalAbsent: filteredSlips.reduce((sum, s) => sum + s.absent_students.length, 0),
    totalLate: filteredSlips.reduce((sum, s) => sum + s.late_students.length, 0),
    homeworkGiven: filteredSlips.filter(s => s.homework_given === 'yes').length,
  };

  const formatTime = (time: string) => {
    if (!time) return "N/A";
    // Use a more consistent format to avoid hydration issues
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDate = (dateString: string) => {
    // Use a consistent date format to avoid hydration issues
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <main className="min-h-screen text-gray-800 bg-gradient-to-br from-red-50 via-white to-indigo-50">
        <Navbar />
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="text-xl text-gray-600">Loading beadle slips...</div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen text-gray-800 bg-gradient-to-br from-red-50 via-white to-indigo-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-lg shadow-lg border border-blue-100 p-8">
          <div className="text-center mb-8">
            {/* Campion College Logo */}
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
            <h1 className="text-3xl font-bold mb-2" style={{color: '#B91C47'}}>Beadle Slip Dashboard</h1>
            <p style={{color: '#B91C47'}}>Monitor and manage beadle attendance reports across all forms</p>
          </div>

          {/* Supervisor Controls */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by teacher, subject, class, or beadle..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2" style={{'--tw-ring-color': '#B91C47'} as any}
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={filterGrade}
                  onChange={(e) => setFilterGrade(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2" style={{'--tw-ring-color': '#B91C47'} as any}
                >
                  <option value="">All Forms</option>
                  <option value="1st Form">1st Form</option>
                  <option value="2nd Form">2nd Form</option>
                  <option value="3rd Form">3rd Form</option>
                  <option value="4th Form">4th Form</option>
                  <option value="5th Form">5th Form</option>
                  <option value="6B">6B (Lower 6th)</option>
                  <option value="6A">6A (Upper 6th)</option>
                </select>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2" style={{'--tw-ring-color': '#B91C47'} as any}
                />
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setFilterDate("");
                    setFilterGrade("");
                    setFilterTeacher("");
                    setFilterSubject("");
                  }}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          {filteredSlips.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-4">
                {slips.length === 0 ? "No beadle slips submitted yet." : "No slips match your search criteria."}
              </div>
              <a
                href="/beedle"
                className="inline-block px-6 py-3 text-white font-semibold rounded-lg transition-colors" style={{backgroundColor: '#B91C47'}} onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#A01B3F'} onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#B91C47'}
              >
                Submit New Beadle Slip
              </a>
            </div>
          ) : (
            <>
              {/* Supervisor Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <div className="text-2xl font-bold" style={{color: '#B91C47'}}>{supervisorStats.totalForms}</div>
                  <div className="text-red-600 text-sm">Forms Monitored</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <div className="text-2xl font-bold" style={{color: '#B91C47'}}>{supervisorStats.totalSlips}</div>
                  <div className="text-red-600 text-sm">Total Reports</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <div className="text-2xl font-bold text-orange-800">{supervisorStats.totalAbsent}</div>
                  <div className="text-orange-600 text-sm">Students Absent</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <div className="text-2xl font-bold text-yellow-800">{supervisorStats.totalLate}</div>
                  <div className="text-yellow-600 text-sm">Students Late</div>
                </div>
              </div>

              {/* Form-by-Form Breakdown */}
              <div className="space-y-6">
                {Object.entries(groupedSlips).map(([form, formSlips]) => (
                  <div key={form} className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-semibold" style={{color: '#B91C47'}}>{form}</h3>
                      <div className="flex gap-4 text-sm">
                        <span className="bg-red-100 px-2 py-1 rounded" style={{color: '#B91C47'}}>
                          {formSlips.length} reports
                        </span>
                        <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded">
                          {formSlips.reduce((sum, s) => sum + s.students_present, 0)} students
                        </span>
                      </div>
                    </div>

                    {/* Form-specific table */}
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-300">
                        <thead>
                          <tr className="bg-white">
                            <th className="border border-gray-300 px-3 py-2 text-left text-sm">Date</th>
                            <th className="border border-gray-300 px-3 py-2 text-left text-sm">Class</th>
                            <th className="border border-gray-300 px-3 py-2 text-left text-sm">Subject</th>
                            <th className="border border-gray-300 px-3 py-2 text-left text-sm">Teacher</th>
                            <th className="border border-gray-300 px-3 py-2 text-left text-sm">Absent / Late / Present</th>
                            <th className="border border-gray-300 px-3 py-2 text-left text-sm">Beadle</th>
                            <th className="border border-gray-300 px-3 py-2 text-left text-sm">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {formSlips.map((slip) => (
                            <tr key={slip.id} className="hover:bg-white">
                              <td className="border border-gray-300 px-3 py-2 text-sm">{formatDate(slip.date)}</td>
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
                                  {slip.teacher_present === 'no' && slip.substitute_received && (
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                      slip.substitute_received === 'yes'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-orange-100 text-orange-800'
                                    }`}>
                                      {slip.substitute_received === 'yes' ? 'Sub Provided' : 'No Sub'}
                                    </span>
                                  )}
                                </div>
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
                              <td className="border border-gray-300 px-3 py-2 text-sm">{slip.beedle_email.split('@')[0]}</td>
                              <td className="border border-gray-300 px-3 py-2 text-sm">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => {
                                      setSelectedSlip(slip);
                                      setViewedReports(prev => new Set([...prev, slip.id]));
                                    }}
                                    className="px-2 py-1 text-white text-xs rounded transition-colors"
                                    style={{backgroundColor: '#B91C47'}}
                                    onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#A01B3F'}
                                    onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#B91C47'}
                                  >
                                    Details
                                  </button>
                                  {viewedReports.has(slip.id) && (
                                    <span className="text-green-600 text-xs">✓ Viewed</span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedSlip && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="text-white px-6 py-4" style={{backgroundColor: '#B91C47'}}>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="bg-white rounded-full p-2 mr-3 flex items-center justify-center">
                    <Image
                      src="/images/Campion_Logo.png"
                      alt="Campion College Logo"
                      width={32}
                      height={32}
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Beadle Slip Details</h2>
                    <p className="text-red-100">{selectedSlip.subject} - {selectedSlip.class_name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSlip(null)}
                  className="text-white hover:text-red-200 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full transition-colors"
                  onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#A01B3F'}
                  onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = 'transparent'}
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 bg-gray-100 overflow-y-auto max-h-[calc(90vh-80px)]">
              {/* Priority Alert Banner */}
              {(selectedSlip.teacher_present === 'no' || selectedSlip.absent_students.length > 5 || selectedSlip.late_students.length > 3) && (
                <div className="mb-4 bg-red-100 border border-red-300 rounded-lg p-3">
                  <div className="flex items-center">
                    <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center mr-2">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-red-800 text-sm">Priority Attention Required</h4>
                      <div className="text-xs text-red-700 mt-0.5">
                        {selectedSlip.teacher_present === 'no' && (
                          <div>• Teacher absent {selectedSlip.substitute_received === 'no' ? '(No substitute provided)' : '(Substitute provided)'}</div>
                        )}
                        {selectedSlip.absent_students.length > 5 && (
                          <div>• High absence rate ({selectedSlip.absent_students.length} students)</div>
                        )}
                        {selectedSlip.late_students.length > 3 && (
                          <div>• High tardiness ({selectedSlip.late_students.length} students)</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                
                {/* Class Information */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mr-2">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-base font-medium text-gray-800">Class Information</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm">Subject:</span>
                      <span className="font-medium text-gray-900 text-sm">{selectedSlip.subject}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm">Class:</span>
                      <span className="font-medium text-gray-900 text-sm">{selectedSlip.class_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm">Teacher:</span>
                      <span className="font-medium text-gray-900 text-sm">{selectedSlip.teacher}</span>
                    </div>
                    {selectedSlip.teacher_present === 'no' && selectedSlip.substitute_received && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 text-sm">Substitute:</span>
                        <span className={`font-medium text-sm ${selectedSlip.substitute_received === 'yes' ? 'text-green-600' : 'text-red-600'}`}>
                          {selectedSlip.substitute_received === 'yes' ? 'Provided' : 'Not Provided'}
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-600 text-sm">Date: {formatDate(selectedSlip.date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm">Time:</span>
                      <span className="font-medium text-gray-900 text-sm">
                        {formatTime(selectedSlip.class_start_time)} - {formatTime(selectedSlip.class_end_time)}
                        {selectedSlip.is_double_session && (
                          <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full" style={{backgroundColor: '#B91C47', color: 'white'}}>
                            Double Session
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm">Grade Level:</span>
                      <span className="font-medium text-gray-900 text-sm">{selectedSlip.grade_level}</span>
                    </div>
                  </div>
                </div>

                {/* Attendance Summary */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-2">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-base font-medium text-gray-800">Attendance Summary</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm">Students Present:</span>
                      <span className="font-bold text-green-600 text-lg">{selectedSlip.students_present}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm">Students Absent:</span>
                      <span className="font-bold text-red-600 text-lg">{selectedSlip.absent_students.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm">Students Late:</span>
                      <span className="font-bold text-orange-600 text-lg">{selectedSlip.late_students.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm">Teacher Present:</span>
                      <span className={`font-bold text-lg ${selectedSlip.teacher_present === 'yes' ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedSlip.teacher_present === 'yes' ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Student Lists */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                
                {/* Absent Students */}
                {selectedSlip.absent_students.length > 0 ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center mr-2">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <h4 className="font-semibold text-red-800">Absent Students ({selectedSlip.absent_students.length})</h4>
                    </div>
                    <div className="space-y-1">
                      {selectedSlip.absent_students.map((student, index) => (
                        <div key={index} className="text-red-700 font-medium text-sm">
                          {student}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <div className="w-5 h-5 bg-gray-500 rounded-full flex items-center justify-center mr-2">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h4 className="font-semibold text-gray-800">Absent Students ({selectedSlip.absent_students.length})</h4>
                    </div>
                    <div className="space-y-1">
                      <div className="text-gray-500 italic text-sm">No absent students</div>
                    </div>
                  </div>
                )}

                {/* Late Students */}
                {selectedSlip.late_students.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center mr-2">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-base font-medium text-orange-800">Late Students ({selectedSlip.late_students.length})</h3>
                    </div>
                    <div className="space-y-1">
                      {selectedSlip.late_students.map((student, index) => (
                        <div key={index} className="text-yellow-800 py-1">
                          {student}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Additional Information */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center mb-3">
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mr-2">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-base font-medium text-blue-800">Additional Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-blue-700">Homework Given: {selectedSlip.homework_given}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Beadle: {selectedSlip.beedle_email.split('@')[0]}</span>
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <span className="text-blue-700">Submitted: {new Date(selectedSlip.created_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center">
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      const content = `Beadle Slip Report - ${selectedSlip.class_name}\n\nDate: ${formatDate(selectedSlip.date)}\nTeacher: ${selectedSlip.teacher}\nTime: ${formatTime(selectedSlip.class_start_time)} - ${formatTime(selectedSlip.class_end_time)}${selectedSlip.is_double_session ? ' (Double Session)' : ''}\nForm: ${selectedSlip.grade_level}\n\nAttendance:\n- Present: ${selectedSlip.students_present}\n- Absent: ${selectedSlip.absent_students.length}\n- Late: ${selectedSlip.late_students.length}\n\nAbsent Students:\n${selectedSlip.absent_students.map(s => `- ${s}`).join('\n')}\n\nLate Students:\n${selectedSlip.late_students.map(s => `- ${s}`).join('\n')}\n\nAdditional Info:\n- Session Type: ${selectedSlip.is_double_session ? 'Double Session (70 minutes)' : 'Single Session (35 minutes)'}\n- Homework Given: ${selectedSlip.homework_given}\n- Beadle: ${selectedSlip.beedle_email.split('@')[0]}\n- Submitted: ${new Date(selectedSlip.created_at).toLocaleString()}`;
                      navigator.clipboard.writeText(content);
                      success('Report copied to clipboard!');
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>Copy Report</span>
                  </button>
                  
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    <span>Print</span>
                  </button>

                  {(selectedSlip.teacher_present === 'no' || selectedSlip.absent_students.length > 5 || selectedSlip.late_students.length > 3) && (
                    <button
                      onClick={() => {
                        const emailBody = `Priority attention required for ${selectedSlip.class_name} - ${selectedSlip.subject} on ${formatDate(selectedSlip.date)}.\n\nIssues identified:\n${selectedSlip.teacher_present === 'no' ? '- Teacher absent\n' : ''}${selectedSlip.absent_students.length > 5 ? `- High absence rate (${selectedSlip.absent_students.length} students)\n` : ''}${selectedSlip.late_students.length > 3 ? `- High tardiness (${selectedSlip.late_students.length} students)\n` : ''}\n\nPlease review and take appropriate action.`;
                        window.location.href = `mailto:?subject=Priority: ${selectedSlip.class_name} Attendance Issue&body=${encodeURIComponent(emailBody)}`;
                      }}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <span>Flag Issue</span>
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setSelectedSlip(null)}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
      
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </main>
  );
}

// Dynamic import with no SSR to prevent hydration issues
const DynamicBeedleDashboard = dynamic(() => Promise.resolve(BeedleDashboardContent), {
  ssr: false,
  loading: () => (
    <main className="min-h-screen text-gray-800 bg-gradient-to-br from-red-50 via-white to-indigo-50">
      <Navbar />
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-xl text-gray-600">Loading beadle dashboard...</div>
      </div>
      <Footer />
    </main>
  )
});

export default function BeedleDashboard() {
  return <DynamicBeedleDashboard />;
}
