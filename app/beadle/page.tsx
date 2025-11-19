"use client";
import { ToastContainer } from "@/components/Toast";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { useToast } from "@/hooks/useToast";
import { useConfirmation } from "@/hooks/useConfirmation";
import { retrieveSessionToken } from "@/lib/utils";
import { fetchCurrentUser, saveBeadleSlip } from "@/lib/serverUtils";
import { generateBeadleConfirmationEmail } from '@/lib/emailUtils';
import { checkBeadleAccess } from "@/lib/beadle-auth";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { useEffect, useState } from "react";

type AttendanceFormData = {
  beadleEmail: string;
  form: string; 
  formClass: string;
  classStartTime: string;
  classEndTime: string;
  date: string;
  teacher: string;
  subject: string;
  teacherPresent: string;
  teacherArrivalTime: string;
  substituteReceived: string;
  homeworkGiven: string; 
  studentsPresent: string;
  absentStudents: string[];
  lateStudents: string[];
  isDoubleSession: boolean;
};

export default function BeadleAttendancePage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false); 
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [accessMessage, setAccessMessage] = useState("");
  const [currentUserData, setCurrentUserData] = useState<any>(null);
  const { toasts, success, error, warning, removeToast } = useToast();
  const { isOpen, options, confirm, handleConfirm, handleCancel } = useConfirmation();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [submittedData, setSubmittedData] = useState<any>(null);

  const [formData, setFormData] = useState<AttendanceFormData>({
    beadleEmail: "",
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
-
  useEffect(() => {
    setIsMounted(true);
    checkAccessAndLoadUser();
  }, []);

  const checkAccessAndLoadUser = async () => {
    const result = await checkBeadleAccess();
    setHasAccess(result.hasAccess);
    setCurrentUserData(result.user);
    
    if (!result.hasAccess) {
      setAccessMessage(result.message || "Access denied");
      if (!result.user) {
        setTimeout(() => router.push("/auth/login"), 2000);
      }
      setLoading(false);
      return;
    }

    const cuser = await fetchCurrentUser(retrieveSessionToken());
    const user = cuser ?? { email: "", form_class: "" };
    
    // Extract form level from user's form_class (e.g., "5-2" -> "5th", "6A-1" -> "6A")
    let userForm = "";
    if (user?.form_class) {
      const formClass = user.form_class.toUpperCase();
      if (formClass.startsWith("1")) userForm = "1st";
      else if (formClass.startsWith("2")) userForm = "2nd";
      else if (formClass.startsWith("3")) userForm = "3rd";
      else if (formClass.startsWith("4")) userForm = "4th";
      else if (formClass.startsWith("5")) userForm = "5th";
      else if (formClass.includes("6A")) userForm = "6A";
      else if (formClass.includes("6B")) userForm = "6B";
    }
    
    setFormData(prev => ({
      ...prev,
      "beadleEmail": user?.email ?? "",
      "form": userForm
    }));
    setLoading(false);
  }

  const formLevels = [
    { value: "1st", label: "1st" },
    { value: "2nd", label: "2nd" },
    { value: "3rd", label: "3rd" },
    { value: "4th", label: "4th" },
    { value: "5th", label: "5th" },
    { value: "6B", label: "6B (Lower 6th)" },
    { value: "6A", label: "6A (Upper 6th)" }
  ];

  const teachers = [
    "Ms. Johnson", "Mr. Smith", "Mrs. Davis", "Dr. Brown", "Ms. Wilson",
    "Mr. Taylor", "Mrs. Anderson", "Ms. Thomas", "Mr. Jackson", "Mrs. White"
  ];

  const subjects = [
    "Accounts", "Additional Mathematics", "Art", "Biology", "Caribbean Studies",
    "Chemistry", "Christian Living", "Communication Studies", "Computer Science", "Digital Media",
    "Drama", "Economics", "Electrical & Electronic Technology", "English Language", "English Literature",
    "French", "Geography", "History", "Information Technology", "Integrated Science",
    "Law", "Management of Business", "Mathematics", "Music", "Personal Development",
    "Physical Education", "Physics", "Principles of Accounts", "Principles of Business", "Sociology",
    "Spanish", "Technical Drawing"
  ];

  const calculateEndTime = (startTime: string, isDouble: boolean) => {
    if (!startTime) return "";
    
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
  
    const additionalMinutes = isDouble ? 70 : 35;
    startDate.setMinutes(startDate.getMinutes() + additionalMinutes);
    
    const endHours = startDate.getHours().toString().padStart(2, '0');
    const endMinutes = startDate.getMinutes().toString().padStart(2, '0');
    
    return `${endHours}:${endMinutes}`;
  };

  const handleInputChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    // Validate formClass input
    if (name === 'formClass' && value) {
      const form = formData.form;
      const inputValue = value.toUpperCase();
      
      // Skip validation for 6th form (6A and 6B)
      if (form !== '6A' && form !== '6B') {
        // Extract the form number (1st -> 1, 2nd -> 2, etc.)
        const formNumber = form.replace(/[^0-9]/g, '');
        
        // Check if the input starts with the correct form number
        if (formNumber && !inputValue.startsWith(formNumber)) {
          error(`Form class must start with ${formNumber} for ${form} form students`);
          return;
        }
      }
    }
    
    setFormData(prev => {
      const updated = {
        ...prev,
        [name]: newValue
      };

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
      const result = await saveBeadleSlip(formData);
      if (result.success) {
        setSubmittedData({
          ...formData,
          id: result.id || Math.floor(Math.random() * 10000), 
          date: formData.date,
          beadle_email: formData.beadleEmail,
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
          attendance_status: 'present',
          homework_assigned: formData.homeworkGiven,
          homework_completed: 'yes',
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
        beadleEmail: "",
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

  if (!isMounted || loading) {
    return (
      <main className="min-h-screen text-gray-800 bg-gradient-to-br from-red-50 via-white to-indigo-50 relative z-10 max-w-full mx-auto">
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
      <main className="min-h-screen text-gray-800 bg-gradient-to-br from-red-50 via-red-100/30 to-white relative z-10 max-w-full mx-auto flex items-center justify-center p-6">
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
    <main
      className="min-h-screen text-gray-800 bg-gradient-to-br from-red-100 via-red-50 to-white relative z-10 max-w-full mx-auto"
      aria-label="Beadle Attendance main content"
    >
      <h1 className="sr-only">Beadle Student Attendance</h1>
      <form className="w-full min-h-screen px-4 py-8" onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-lg shadow-lg border border-red-200 p-8">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-2">
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
              <p style={{color: '#B91C47'}}>Class Beadle Session(s) Report</p>
              <div className="mt-2 text-sm text-gray-600">
                <p className="font-medium">Electronic Beadle Slip</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-red-50 p-6 rounded-lg border border-red-200">
                <h3 className="text-xl font-semibold mb-4" style={{color: '#B91C47'}}>Beadle Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="beadleEmail" className="block text-sm font-medium mb-2" style={{color: '#B91C47'}}>
                      Your Email *
                    </label>
                    <input
                      type="email"
                      id="beadleEmail"
                      name="beadleEmail"
                      value={isMounted ? formData.beadleEmail : ""}
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
                      disabled
                      title="Your form level (automatically set from your profile)"
                      className="w-full px-4 py-2 bg-gray-100 border border-red-300 rounded-lg text-gray-800 cursor-not-allowed"
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
                      placeholder={
                        formData.form === '6A' || formData.form === '6B' 
                          ? "e.g., Biology-1, Physics-2, or 6A-1" 
                          : formData.form 
                            ? `Must start with ${formData.form.replace(/[^0-9]/g, '')} (e.g., ${formData.form.replace(/[^0-9]/g, '')}-2, ${formData.form.replace(/[^0-9]/g, '')}A)` 
                            : "1-2 / 4A / [Subject/6A]-1"
                      }
                      onChange={handleInputChange}
                      required
                      title={
                        formData.form === '6A' || formData.form === '6B'
                          ? "6th form: Enter subject name or form class (e.g., Biology-1, 6A-2)"
                          : formData.form
                            ? `Must start with ${formData.form.replace(/[^0-9]/g, '')} for ${formData.form} form`
                            : "Enter the specific form class or group"
                      }
                      className="w-full px-4 py-2 bg-white border border-red-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:border-transparent"
                      style={{'--tw-ring-color': '#B91C47'} as any}
                    />
                    {formData.form && formData.form !== '6A' && formData.form !== '6B' && (
                      <p className="text-xs text-gray-600 mt-1">
                        Must start with {formData.form.replace(/[^0-9]/g, '')} (e.g., {formData.form.replace(/[^0-9]/g, '')}-2, {formData.form.replace(/[^0-9]/g, '')}A)
                      </p>
                    )}
                    {(formData.form === '6A' || formData.form === '6B') && (
                      <p className="text-xs text-gray-600 mt-1">
                        6th form: Can start with subject name or form number (e.g., Biology-1, Physics-2, 6A-1)
                      </p>
                    )}
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

              <div className="bg-red-50 p-6 rounded-lg border border-red-200">
                <h3 className="text-xl font-semibold mb-4" style={{color: '#B91C47'}}>Teacher Attendance</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  
                  {formData.teacherPresent === "yes" && (
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
                        className="w-full md:w-64 px-4 py-2 bg-white border border-red-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:border-transparent"
                        style={{'--tw-ring-color': '#B91C47'} as any}
                      />
                    </div>
                  )}
                  
                  {formData.teacherPresent === "no" && (
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
                        className="w-full md:w-64 px-4 py-2 bg-white border border-red-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:border-transparent"
                        style={{'--tw-ring-color': '#B91C47'} as any}
                      >
                        <option value="">Select</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

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
                  href="/beadle/view"
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
      
      {isMounted && <ToastContainer toasts={toasts} onRemove={removeToast} />}
      
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
                  __html: generateBeadleConfirmationEmail(submittedData) 
                }}
              />
            </div>
            
            <div className="px-6 py-4 flex justify-between items-center border-t" style={{backgroundColor: '#fef7f7', borderTopColor: '#B91C47'}}>
              <button
                onClick={() => {
                  const printWindow = window.open('', '_blank');
                  if (printWindow) {
                    printWindow.document.write(generateBeadleConfirmationEmail(submittedData));
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
                  setFormData({
                    beadleEmail: "",
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
