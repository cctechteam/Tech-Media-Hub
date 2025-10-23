/**
 * Beedle Attendance Page - Student Attendance Form Interface
 * 
 * This page provides the main interface for students (beedles) to submit
 * attendance reports for their assigned classes. The system captures:
 * - Class information (subject, teacher, time, grade level)
 * - Teacher attendance status and arrival times
 * - Student attendance data (present count, absent/late student names)
 * - Homework assignments and completion status
 * 
 * Key Features:
 * - Auto-calculation of class end times based on session type
 * - Dynamic form fields based on teacher presence
 * - Real-time validation and user feedback
 * - Integration with toast notifications and confirmation modals
 * - Automatic user email population from session
 * 
 * @author Tech Media Hub Team
 * @version 1.0
 * @since 2024
 */

"use client";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import { ToastContainer } from "@/components/Toast";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { useToast } from "@/hooks/useToast";
import { useConfirmation } from "@/hooks/useConfirmation";
import { retrieveSessionToken } from "@/lib/utils";
import { fetchCurrentUser, saveBeedleSlip } from "@/lib/serverUtils";
import { generateBeedleConfirmationEmail } from '@/lib/emailUtils';
import Image from "next/image";

import { useEffect, useState } from "react";

/**
 * AttendanceFormData Type Definition
 * 
 * Defines the structure of the attendance form data that beedles submit.
 * This interface ensures type safety and provides clear documentation
 * of all required fields for attendance reporting.
 */
type AttendanceFormData = {
  beedleEmail: string;        // Email of the student submitting the report (auto-populated)
  form: string;               // Form level (1st, 2nd, 3rd, 4th, 5th, 6B, 6A)
  formClass: string;          // Specific class section/group (e.g., "5 Bio-2", "4C")
  classStartTime: string;     // Scheduled start time for the class period
  classEndTime: string;       // Calculated end time based on session type
  date: string;               // Date when the class took place
  teacher: string;            // Name of the assigned teacher
  subject: string;            // Subject being taught (e.g., "Biology")
  teacherPresent: string;     // Whether teacher was present ("yes"/"no")
  teacherArrivalTime: string; // Time teacher arrived (if present)
  substituteReceived: string; // Whether substitute was provided ("yes"/"no")
  homeworkGiven: string;      // Whether homework was assigned ("yes"/"no")
  studentsPresent: string;    // Total number of students present
  absentStudents: string[];   // Array of absent student names
  lateStudents: string[];     // Array of late student names
  isDoubleSession: boolean;   // Whether this is a double session (70 min vs 35 min)
};

/**
 * BeedleAttendancePage Component
 * 
 * Main component for the student attendance form interface.
 * Handles form state management, validation, submission, and user interactions.
 */
export default function BeedleAttendancePage() {
  // State Management
  const [isMounted, setIsMounted] = useState(false); // Prevents hydration issues
  const { toasts, success, error, warning, removeToast } = useToast(); // Toast notification system
  const { isOpen, options, confirm, handleConfirm, handleCancel } = useConfirmation(); // Confirmation modal system
  const [showConfirmation, setShowConfirmation] = useState(false); // Controls submission confirmation display
  const [submittedData, setSubmittedData] = useState<any>(null); // Stores submitted form data for confirmation

  // Form data state with initial empty values
  const [formData, setFormData] = useState<AttendanceFormData>({
    beedleEmail: "",              // Auto-populated from user session
    form: "",                     // Selected from dropdown (1st, 2nd, etc.)
    formClass: "",                // User input for class section/group (e.g., "5 Bio-2")
    classStartTime: "",           // Time picker input
    classEndTime: "",             // Auto-calculated based on start time and session type
    date: "",                     // Date picker input
    teacher: "",                  // Selected from datalist or typed
    subject: "",                  // Selected from dropdown (e.g., "Biology")
    teacherPresent: "",           // Radio button selection
    teacherArrivalTime: "",       // Conditional field if teacher present
    substituteReceived: "",       // Conditional field if teacher absent
    homeworkGiven: "",            // Radio button selection
    studentsPresent: "",          // Number input
    absentStudents: [""],         // Dynamic array of student names
    lateStudents: [""],           // Dynamic array of student names
    isDoubleSession: false        // Checkbox for session duration
  });

  /**
   * Component initialization effect
   * 
   * Handles:
   * 1. Setting mounted state to prevent hydration issues
   * 2. Fetching current user from session token
   * 3. Auto-populating beedle email field with user's email
   */
  useEffect(() => {
    setIsMounted(true);
    (async () => {
      const cuser = await fetchCurrentUser(retrieveSessionToken());
      const user = cuser ?? { email: "" };
      setFormData(prev => ({
        ...prev,
        "beedleEmail": user?.email ?? ""
      }));
    })();
  }, [])

  /**
   * Form Level Options
   * Defines all available form levels in the school system.
   * Note: 6B = Lower 6th Form, 6A = Upper 6th Form (each has separate supervisors)
   */
  const formLevels = [
    { value: "1st", label: "1st" },
    { value: "2nd", label: "2nd" },
    { value: "3rd", label: "3rd" },
    { value: "4th", label: "4th" },
    { value: "5th", label: "5th" },
    { value: "6B", label: "6B (Lower 6th)" },
    { value: "6A", label: "6A (Upper 6th)" }
  ];

  /**
   * Teacher Names List
   * Predefined list of teachers for the datalist input.
   * Users can select from this list or type a custom name.
   */
  const teachers = [
    "Ms. Johnson", "Mr. Smith", "Mrs. Davis", "Dr. Brown", "Ms. Wilson",
    "Mr. Taylor", "Mrs. Anderson", "Ms. Thomas", "Mr. Jackson", "Mrs. White"
  ];

  /**
   * Subject Options
   * Complete list of all subjects taught at Campion College.
   * Covers academic subjects from Forms 1-6 including specialized courses.
   */
  const subjects = [
    "Accounts", "Additional Mathematics", "Art", "Biology", "Caribbean Studies",
    "Chemistry", "Christian Living", "Communication Studies", "Computer Science", "Digital Media",
    "Drama", "Economics", "Electrical & Electronic Technology", "English Language", "English Literature",
    "French", "Geography", "History", "Information Technology", "Integrated Science",
    "Law", "Management of Business", "Mathematics", "Music", "Personal Development",
    "Physical Education", "Physics", "Principles of Accounts", "Principles of Business", "Sociology",
    "Spanish", "Technical Drawing"
  ];

  /**
   * Calculates class end time based on start time and session type
   * 
   * Campion College class periods are:
   * - Single session: 35 minutes
   * - Double session: 70 minutes (1 hour 10 minutes)
   * 
   * @param startTime - Start time in HH:MM format
   * @param isDouble - Whether this is a double session
   * @returns End time in HH:MM format
   */
  const calculateEndTime = (startTime: string, isDouble: boolean) => {
    if (!startTime) return "";
    
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    
    // Add 35 minutes for single session, 70 minutes (1hr 10min) for double session
    const additionalMinutes = isDouble ? 70 : 35;
    startDate.setMinutes(startDate.getMinutes() + additionalMinutes);
    
    const endHours = startDate.getHours().toString().padStart(2, '0');
    const endMinutes = startDate.getMinutes().toString().padStart(2, '0');
    
    return `${endHours}:${endMinutes}`;
  };

  const handleInputChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => {
      const updated = {
        ...prev,
        [name]: newValue
      };
      
      // Auto-calculate end time when start time or double session changes
      if (name === 'classStartTime' || name === 'isDoubleSession') {
        const startTime = name === 'classStartTime' ? value : prev.classStartTime;
        const isDouble = name === 'isDoubleSession' ? checked : prev.isDoubleSession;
        updated.classEndTime = calculateEndTime(startTime, isDouble);
      }
      
      return updated;
    });
  };

  const handleArrayChange = (field: keyof AttendanceFormData, index: number, value: any) => {
    if (Array.isArray(formData[field])) {
      setFormData(prev => ({
        ...prev,
        [field]: (prev[field] as string[]).map((item, i) => i === index ? value : item)
      }));
    }
  };

  const addArrayItem = (field: keyof AttendanceFormData) => {
    setFormData(prev => ({
      ...prev,
      [field]: Array.isArray(prev[field]) ? [...(prev[field] as string[]), ""] : prev[field]
    }));
  };

  const removeArrayItem = (field: keyof AttendanceFormData, index: any) => {
    if (Array.isArray(formData[field])) {
      if (formData[field].length > 1) {
        setFormData(prev => ({
          ...prev,
          [field]: (prev[field] as string[]).filter((_, i) => i !== index)
        }));
      }
    }
  };

  const handleSubmit = async () => {
    if (formData.classEndTime <= formData.classStartTime) {
      error("End time must be later than start time.");
      return;
    }

    try {
      const result = await saveBeedleSlip(formData);
      if (result.success) {
        // Store the submitted data and show confirmation
        setSubmittedData({
          ...formData,
          id: result.id || Math.floor(Math.random() * 10000), // Use returned ID or generate one
          date: formData.date,
          beedle_email: formData.beedleEmail,
          grade_level: formData.form,
          class_name: formData.formClass,
          class_start_time: formData.classStartTime,
          class_end_time: formData.classEndTime,
          teacher: formData.teacher,
          subject: formData.subject,
          teacher_present: formData.teacherPresent,
          teacher_arrival_time: formData.teacherArrivalTime,
          substitute_received: formData.substituteReceived,
          students_present: formData.studentsPresent,
          absent_students: formData.absentStudents.filter(s => s.trim() !== ''),
          late_students: formData.lateStudents.filter(s => s.trim() !== ''),
          is_double_session: formData.isDoubleSession,
          attendance_status: 'present', // Default to present for the beedle
          homework_assigned: formData.homeworkGiven,
          homework_completed: 'yes', // Default since they're submitting
          homework_description: '', // Not in current form
          homework_due_date: '', // Not in current form
          behavior_rating: '', // Not in current form
          notes: '' // Not in current form
        });
        setShowConfirmation(true);
        success("Attendance form submitted successfully!");
      } else {
        error("Error submitting form: " + result.error);
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      error("Error submitting form. Please try again.");
    }
  };

  const handleReset = async () => {
    const confirmed = await confirm({
      title: "Clear Form",
      message: "Are you sure you want to clear all form data? This action cannot be undone.",
      confirmText: "Clear Form",
      cancelText: "Keep Data",
      confirmVariant: "danger"
    });

    if (confirmed) {
      setFormData({
        beedleEmail: "",
        form: "",
        formClass: "",
        classStartTime: "",
        classEndTime: "",
        date: "",
        teacher: "",
        subject: "",
        teacherPresent: "",
        teacherArrivalTime: "",
        substituteReceived: "",
        homeworkGiven: "",
        studentsPresent: "",
        absentStudents: [""],
        lateStudents: [""],
        isDoubleSession: false
      });
      success("Form cleared successfully.");
    }
  };

  if (!isMounted) {
    return (
      <main className="min-h-screen text-gray-800 bg-gradient-to-br from-red-50 via-white to-indigo-50 relative z-10 max-w-full mx-auto">
        <Navbar />
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="text-xl text-gray-600">Loading...</div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main
      className="min-h-screen text-gray-800 bg-gradient-to-br from-red-100 via-red-50 to-white relative z-10 max-w-full mx-auto"
      aria-label="Beedle Attendance main content"
    >
      <h1 className="sr-only">Beedle Student Attendance</h1>
      <Navbar />
      <form className="w-full min-h-screen px-4 py-8" onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-lg shadow-lg border border-red-200 p-8">
            <div className="text-center mb-8">
              {/* Campion College Logo */}
              <div className="flex justify-center mb-6">
                <Image
                  src="/images/Campion_Logo.png"
                  alt="Campion College Logo"
                  width={240}
                  height={240}
                  className="object-contain"
                  priority
                />
              </div>
              <h2 className="text-3xl font-bold mb-2" style={{color: '#B91C47'}}>Student Attendance Form</h2>
              <p style={{color: '#B91C47'}}>Class Beedle Session(s) Report</p>
              <div className="mt-2 text-sm text-gray-600">
                <p className="font-medium">Campion College</p>
                <p>Electronic Beadle Slip</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Beedle Information Section */}
              <div className="bg-red-50 p-6 rounded-lg border border-red-200">
                <h3 className="text-xl font-semibold mb-4" style={{color: '#B91C47'}}>Beedle Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="beedleEmail" className="block text-sm font-medium mb-2" style={{color: '#B91C47'}}>
                      Your Email *
                    </label>
                    <input
                      type="email"
                      id="beedleEmail"
                      name="beedleEmail"
                      value={isMounted ? formData.beedleEmail : ""}
                      required
                      readOnly
                      title="This is automatically filled with your logged-in email address"
                      className="w-full px-4 py-2 bg-white border border-red-300 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent"
                      style={{'--tw-ring-color': '#B91C47'} as any}
                      placeholder={isMounted ? "Loading..." : ""}
                      suppressHydrationWarning
                    />
                  </div>
                  <div>
                    <label htmlFor="form" className="block text-sm font-medium mb-2" style={{color: '#B91C47'}}>
                      Form *
                    </label>
                    <select
                      id="form"
                      name="form"
                      value={formData.form}
                      onChange={handleInputChange}
                      required
                      title="Select the form level of the class you're monitoring"
                      className="w-full px-4 py-2 bg-white border border-red-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:border-transparent"
                      style={{'--tw-ring-color': '#B91C47'} as any}
                    >
                      <option value="">Select Form</option>
                      {formLevels.map((form) => (
                        <option key={form.value} value={form.value}>{form.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="formClass" className="block text-sm font-medium mb-2" style={{color: '#B91C47'}}>
                      Form Class *
                    </label>
                    <input
                      type="text"
                      id="formClass"
                      name="formClass"
                      value={formData.formClass}
                      placeholder="5 Bio-2 / 4C / Homeroom"
                      onChange={handleInputChange}
                      required
                      title="Enter the specific form class or group (e.g., 5 Bio-2, 4C, etc.)"
                      className="w-full px-4 py-2 bg-white border border-red-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:border-transparent"
                      style={{'--tw-ring-color': '#B91C47'} as any}
                    />
                  </div>
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium mb-2" style={{color: '#B91C47'}}>
                      Date *
                    </label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                      title="Select the date when this class session took place"
                      className="w-full px-4 py-2 bg-white border border-red-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:border-transparent"
                      style={{'--tw-ring-color': '#B91C47'} as any}
                    />
                  </div>
                </div>
              </div>

              {/* Class Information Section */}
              <div className="bg-red-25 p-6 rounded-lg border border-red-200" style={{backgroundColor: '#fef7f7'}}>
                <h3 className="text-xl font-semibold mb-4" style={{color: '#B91C47'}}>Class Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="teacher" className="block text-sm font-medium mb-2" style={{color: '#B91C47'}}>
                      Teacher *
                    </label>
                    <input
                      list="teachers"
                      id="teacher"
                      name="teacher"
                      value={formData.teacher}
                      onChange={handleInputChange}
                      required
                      title="Select from the dropdown or type the teacher's name who was supposed to teach this class"
                      className="w-full px-4 py-2 bg-white border border-red-300 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent"
                      style={{'--tw-ring-color': '#B91C47'} as any}
                      placeholder="Select or type teacher name"
                    />
                    <datalist id="teachers">
                      {teachers.map((teacher) => (
                        <option key={teacher} value={teacher} />
                      ))}
                    </datalist>
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium mb-2" style={{color: '#B91C47'}}>
                      Subject *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      title="Select the subject that was being taught in this class session"
                      className="w-full px-4 py-2 bg-white border border-red-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:border-transparent"
                      style={{'--tw-ring-color': '#B91C47'} as any}
                    >
                      <option value="">Select Subject</option>
                      {subjects.map((subject) => (
                        <option key={subject} value={subject}>{subject}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="classStartTime" className="block text-sm font-medium mb-2" style={{color: '#B91C47'}}>
                      Class Start Time *
                    </label>
                    <input
                      type="time"
                      id="classStartTime"
                      name="classStartTime"
                      value={formData.classStartTime}
                      onChange={handleInputChange}
                      required
                      title="Enter the scheduled start time for this class period"
                      className="w-full px-4 py-2 bg-white border border-red-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:border-transparent"
                      style={{'--tw-ring-color': '#B91C47'} as any}
                    />
                  </div>
                  <div>
                    <label htmlFor="classEndTime" className="block text-sm font-medium mb-2" style={{color: '#B91C47'}}>
                      Class End Time *
                    </label>
                    <input
                      type="time"
                      id="classEndTime"
                      name="classEndTime"
                      value={formData.classEndTime}
                      onChange={handleInputChange}
                      required
                      readOnly
                      title="This is automatically calculated based on start time and session type"
                      className="w-full px-4 py-2 bg-red-50 border border-red-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:border-transparent"
                      style={{'--tw-ring-color': '#B91C47'} as any}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="isDoubleSession"
                        name="isDoubleSession"
                        checked={formData.isDoubleSession}
                        onChange={handleInputChange}
                        className="w-4 h-4 rounded border-gray-300 focus:ring-2"
                        style={{'--tw-ring-color': '#B91C47', 'accentColor': '#B91C47'} as any}
                      />
                      <label htmlFor="isDoubleSession" className="text-sm font-medium" style={{color: '#B91C47'}}>
                        Double Session (70 minutes)
                      </label>
                      <span className="text-xs text-gray-500">
                        {formData.isDoubleSession ? '(1hr 10min class)' : '(35min class)'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      Check this box if the class is a double session. End time will be calculated automatically.
                    </p>
                  </div>

                </div>
              </div>

              {/* Teacher Attendance Section */}
              <div className="bg-red-50 p-6 rounded-lg border border-red-200">
                <h3 className="text-xl font-semibold mb-4" style={{color: '#B91C47'}}>Teacher Attendance</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="teacherPresent" className="block text-sm font-medium mb-2" style={{color: '#B91C47'}}>
                      Was Teacher Present? *
                    </label>
                    <select
                      id="teacherPresent"
                      name="teacherPresent"
                      value={formData.teacherPresent}
                      onChange={handleInputChange}
                      required
                      title="Indicate whether the assigned teacher showed up for this class"
                      className="w-full px-4 py-2 bg-white border border-red-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:border-transparent"
                      style={{'--tw-ring-color': '#B91C47'} as any}
                    >
                      <option value="">Select</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>
                  {isMounted && formData.teacherPresent === "yes" && (
                    <div>
                      <label htmlFor="teacherArrivalTime" className="block text-sm font-medium mb-2" style={{color: '#B91C47'}}>
                        Teacher Arrival Time *
                      </label>
                      <input
                        type="time"
                        id="teacherArrivalTime"
                        name="teacherArrivalTime"
                        value={formData.teacherArrivalTime}
                        required
                        onChange={handleInputChange}
                        title="Record the exact time the teacher arrived at the classroom"
                        className="w-full px-4 py-2 bg-white border border-red-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:border-transparent"
                        style={{'--tw-ring-color': '#B91C47'} as any}
                      />
                    </div>
                  )}
                  {isMounted && formData.teacherPresent === "no" && (
                    <div>
                      <label htmlFor="substituteReceived" className="block text-sm font-medium mb-2" style={{color: '#B91C47'}}>
                        Substitute Teacher Received? *
                      </label>
                      <select
                        id="substituteReceived"
                        name="substituteReceived"
                        value={formData.substituteReceived}
                        onChange={handleInputChange}
                        required
                        title="Indicate whether a substitute teacher was provided for this class"
                        className="w-full px-4 py-2 bg-white border border-red-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:border-transparent"
                        style={{'--tw-ring-color': '#B91C47'} as any}
                      >
                        <option value="">Select</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </div>
                  )}
                  <div>
                    <label htmlFor="homeworkGiven" className="block text-sm font-medium mb-2" style={{color: '#B91C47'}}>
                      Homework Given? *
                    </label>
                    <select
                      id="homeworkGiven"
                      name="homeworkGiven"
                      value={formData.homeworkGiven}
                      onChange={handleInputChange}
                      required
                      title="Indicate whether the teacher assigned homework during this class"
                      className="w-full px-4 py-2 bg-white border border-red-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:border-transparent"
                      style={{'--tw-ring-color': '#B91C47'} as any}
                    >
                      <option value="">Select</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Student Attendance Section */}
              <div className="bg-red-25 p-6 rounded-lg border border-red-200" style={{backgroundColor: '#fef7f7'}}>
                <h3 className="text-xl font-semibold mb-4" style={{color: '#B91C47'}}>Student Attendance</h3>
                <div className="mb-4">
                  <label htmlFor="studentsPresent" className="block text-sm font-medium mb-2" style={{color: '#B91C47'}}>
                    Number of Students Present *
                  </label>
                  <input
                    type="number"
                    id="studentsPresent"
                    name="studentsPresent"
                    value={formData.studentsPresent}
                    onChange={handleInputChange}
                    required
                    min="0"
                    max="50"
                    title="Count and enter the total number of students who attended this class"
                    className="w-full md:w-48 px-4 py-2 bg-white border border-red-300 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{'--tw-ring-color': '#B91C47'} as any}
                    placeholder="Enter number"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Absent Students */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{color: '#B91C47'}}>
                      Absent Students
                    </label>
                    {formData.absentStudents.map((student, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={student}
                          onChange={(e) => handleArrayChange("absentStudents", index, e.target.value)}
                          title="Enter the full name of a student who was absent from this class"
                          className="flex-1 px-3 py-2 bg-white border border-red-300 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          placeholder="Student name"
                        />
                        {formData.absentStudents.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeArrayItem("absentStudents", index)}
                            className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addArrayItem("absentStudents")}
                      className="mt-2 px-4 py-2 text-white rounded-lg transition-colors duration-200"
                      style={{backgroundColor: '#B91C47'}}
                      onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#A01B3F'}
                      onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#B91C47'}
                    >
                      + Add Student
                    </button>
                  </div>

                  {/* Late Students */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{color: '#B91C47'}}>
                      Late Students
                    </label>
                    {formData.lateStudents.map((student, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={student}
                          onChange={(e) => handleArrayChange("lateStudents", index, e.target.value)}
                          title="Enter the full name of a student who arrived late to this class"
                          className="flex-1 px-3 py-2 bg-white border border-red-300 rounded-lg text-gray-800 placeholder-gray-500 back focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          placeholder="Student name"
                        />
                        {formData.lateStudents.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeArrayItem("lateStudents", index)}
                            className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addArrayItem("lateStudents")}
                      className="mt-2 px-4 py-2 text-white rounded-lg transition-colors duration-200"
                      style={{backgroundColor: '#B91C47'}}
                      onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#A01B3F'}
                      onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#B91C47'}
                    >
                      + Add Student
                    </button>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  type="submit"
                  className="px-4 py-2 text-white font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{backgroundColor: '#B91C47', '--tw-ring-color': '#B91C47'} as any}
                  onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#A01B3F'}
                  onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#B91C47'}
                >
                  Submit Attendance
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Clear Form
                </button>
                <a
                  href="/beedle/view"
                  className="px-4 py-2 text-white font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 text-center"
                  style={{backgroundColor: '#B91C47', '--tw-ring-color': '#B91C47'} as any}
                  onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#A01B3F'}
                  onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#B91C47'}
                >
                  View Submitted Slips
                </a>
              </div>
            </div>
          </div>
        </div>
      </form>

      <Footer />
      
      {/* Toast Notifications */}
      {isMounted && <ToastContainer toasts={toasts} onRemove={removeToast} />}
      
      {/* Confirmation Modal */}
      {isMounted && (
        <ConfirmationModal
          isOpen={isOpen}
          title={options.title}
          message={options.message}
          confirmText={options.confirmText}
          cancelText={options.cancelText}
          confirmVariant={options.confirmVariant}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}

      {/* Beedle Confirmation Modal */}
      {showConfirmation && submittedData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="text-white px-6 py-4" style={{backgroundColor: '#B91C47'}}>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Beadle Slip Confirmation</h2>
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="text-white hover:text-red-200 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div 
                id="confirmation-content"
                dangerouslySetInnerHTML={{ 
                  __html: generateBeedleConfirmationEmail(submittedData) 
                }}
              />
            </div>
            
            <div className="px-6 py-4 flex justify-between items-center border-t" style={{backgroundColor: '#fef7f7', borderTopColor: '#B91C47'}}>
              <button
                onClick={() => {
                  const printWindow = window.open('', '_blank');
                  if (printWindow) {
                    printWindow.document.write(generateBeedleConfirmationEmail(submittedData));
                    printWindow.document.close();
                    printWindow.print();
                  }
                }}
                className="px-6 py-3 text-white font-semibold rounded-lg transition-colors shadow-md"
                style={{backgroundColor: '#B91C47'}}
                onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#A01B3F'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#B91C47'}
              >
                Save as PDF
              </button>
              <button
                onClick={() => {
                  setShowConfirmation(false);
                  // Clear form after viewing confirmation
                  setFormData({
                    beedleEmail: "",
                    form: "",
                    formClass: "",
                    classStartTime: "",
                    classEndTime: "",
                    date: "",
                    teacher: "",
                    subject: "",
                    teacherPresent: "",
                    teacherArrivalTime: "",
                    substituteReceived: "",
                    homeworkGiven: "",
                    studentsPresent: "",
                    absentStudents: [""],
                    lateStudents: [""],
                    isDoubleSession: false
                  });
                }}
                className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors shadow-md"
              >
                Close & Clear Form
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
