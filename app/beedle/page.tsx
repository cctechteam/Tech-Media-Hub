"use client";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import { retrieveSessionToken } from "@/lib/utils";
import { fetchCurrentUser } from "@/lib/serverUtils";
import Image from "next/image";
import CampionBanner from "../../../res/images/CampionBanner.png";

import { useEffect, useState } from "react";

type AttendanceFormData = {
  beedleEmail: string;
  gradeLevel: string;
  className: string;
  classStartTime: string;
  classEndTime: string;
  date: string;
  teacher: string;
  subject: string;
  teacherPresent: string;
  teacherArrivalTime: string;
  homeworkGiven: string;
  studentsPresent: string;
  absentStudents: string[];
  lateStudents: string[];
};

export default function BeedleAttendancePage() {
  const [formData, setFormData] = useState<AttendanceFormData>({
    beedleEmail: "",
    gradeLevel: "",
    className: "",
    classStartTime: "",
    classEndTime: "",
    date: "",
    teacher: "",
    subject: "",
    teacherPresent: "",
    teacherArrivalTime: "",
    homeworkGiven: "",
    studentsPresent: "",
    absentStudents: [""],
    lateStudents: [""]
  });

  useEffect(() => {
    (async () => {
      const cuser = await fetchCurrentUser(retrieveSessionToken());
      const user = cuser ?? { email: "" };
      setFormData(prev => ({
        ...prev,
        "beedleEmail": user?.email ?? ""
      }));
    })();
  }, [])

  const gradeLevels = [
    "1st Form", "2nd Form", "3rd Form", "4th Form", "5th Form", "6B", "6A"
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

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
      [field]: [...prev[field], ""]
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

  const handleSubmit = () => {
    if (formData.classEndTime <= formData.classStartTime) {
      alert("End time must be later than start time.");
      return;
    }

    console.log("Student attendance submitted:", formData);
    alert("Attendance form submitted successfully!");
  };

  const handleReset = () => {
    setFormData({
      beedleEmail: "",
      gradeLevel: "",
      className: "",
      classStartTime: "",
      classEndTime: "",
      date: "",
      teacher: "",
      subject: "",
      teacherPresent: "",
      teacherArrivalTime: "",
      homeworkGiven: "",
      studentsPresent: "",
      absentStudents: [""],
      lateStudents: [""]
    });
  };

  return (
    <main
      className="min-h-screen text-gray-800 bg-gradient-to-br from-red-50 via-white to-indigo-50 relative z-10 max-w-full mx-auto"
      aria-label="Beedle Attendance main content"
    >
      {/* ✅ Campion Banner at the top */}
      <div className="flex justify-center py-6">
        <Image
          src={CampionBanner}
          alt="Campion Banner"
          className="w-[300px] h-auto"
          priority
        />
      </div>

      <h1 className="sr-only">Beedle Student Attendance</h1>
      <Navbar />
      <form className="w-full min-h-screen px-4 py-8" onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-lg shadow-lg border border-blue-100 p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-red-800 mb-2">Student Attendance Form</h2>
              <p className="text-red-600">Class Beedle Session(s) Report</p>
            </div>

            <div className="space-y-6">
              {/* Beedle Information Section */}
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <h3 className="text-xl font-semibold text-blue-800 mb-4">Beedle Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="beedleEmail" className="block text-sm font-medium text-blue-700 mb-2">
                      Your Email *
                    </label>
                    <input
                      type="email"
                      id="beedleEmail"
                      name="beedleEmail"
                      value={formData.beedleEmail}
                      required
                      readOnly
                      className="w-full px-4 py-2 bg-white border border-blue-300 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Loading..."
                    />
                  </div>
                  <div>
                    <label htmlFor="className" className="block text-sm font-medium text-blue-700 mb-2">
                      Grade Level *
                    </label>
                    <select
                      id="gradeLevel"
                      name="gradeLevel"
                      value={formData.gradeLevel}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 bg-white border border-blue-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Grade Level</option>
                      {gradeLevels.map((cls) => (
                        <option key={cls} value={cls}>{cls}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="className" className="block text-sm font-medium text-blue-700 mb-2">
                      Class *
                    </label>
                    <input
                      type="text"
                      id="className"
                      name="className"
                      value={formData.className}
                      placeholder="4C / Homeroom"
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 bg-white border border-blue-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-blue-700 mb-2">
                      Date *
                    </label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 bg-white border border-blue-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Class Information Section */}
              <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                <h3 className="text-xl font-semibold text-green-800 mb-4">Class Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="teacher" className="block text-sm font-medium text-green-700 mb-2">
                      Teacher *
                    </label>
                    <input
                      list="teachers"
                      id="teacher"
                      name="teacher"
                      value={formData.teacher}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 bg-white border border-green-300 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Select or type teacher name"
                    />
                    <datalist id="teachers">
                      {teachers.map((teacher) => (
                        <option key={teacher} value={teacher} />
                      ))}
                    </datalist>
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-green-700 mb-2">
                      Subject *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 bg-white border border-green-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Select Subject</option>
                      {subjects.map((subject) => (
                        <option key={subject} value={subject}>{subject}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="classStartTime" className="block text-sm font-medium text-green-700 mb-2">
                      Class Start Time *
                    </label>
                    <input
                      type="time"
                      id="classStartTime"
                      name="classStartTime"
                      value={formData.classStartTime}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 bg-white border border-green-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="classEndTime" className="block text-sm font-medium text-green-700 mb-2">
                      Class End Time *
                    </label>
                    <input
                      type="time"
                      id="classEndTime"
                      name="classEndTime"
                      value={formData.classEndTime}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 bg-white border border-green-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                </div>
              </div>

              {/* Teacher Attendance Section */}
              <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                <h3 className="text-xl font-semibold text-purple-800 mb-4">Teacher Attendance</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="teacherPresent" className="block text-sm font-medium text-purple-700 mb-2">
                      Was Teacher Present? *
                    </label>
                    <select
                      id="teacherPresent"
                      name="teacherPresent"
                      value={formData.teacherPresent}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 bg-white border border-purple-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Select</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>
                  {formData.teacherPresent === "yes" && (
                    <div>
                      <label htmlFor="teacherArrivalTime" className="block text-sm font-medium text-purple-700 mb-2">
                        Teacher Arrival Time *
                      </label>
                      <input
                        type="time"
                        id="teacherArrivalTime"
                        name="teacherArrivalTime"
                        value={formData.teacherArrivalTime}
                        required
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-white border border-purple-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  )}
                  <div>
                    <label htmlFor="homeworkGiven" className="block text-sm font-medium text-purple-700 mb-2">
                      Homework Given? *
                    </label>
                    <select
                      id="homeworkGiven"
                      name="homeworkGiven"
                      value={formData.homeworkGiven}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 bg-white border border-purple-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Select</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Student Attendance Section */}
              <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
                <h3 className="text-xl font-semibold text-orange-800 mb-4">Student Attendance</h3>
                <div className="mb-4">
                  <label htmlFor="studentsPresent" className="block text-sm font-medium text-orange-700 mb-2">
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
                    className="w-full md:w-48 px-4 py-2 bg-white border border-orange-300 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter number"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Absent Students */}
                  <div>
                    <label className="block text-sm font-medium text-orange-700 mb-2">
                      Absent Students
                    </label>
                    {formData.absentStudents.map((student, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={student}
                          onChange={(e) => handleArrayChange("absentStudents", index, e.target.value)}
                          className="flex-1 px-3 py-2 bg-white border border-orange-300 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                      className="mt-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors duration-200"
                    >
                      + Add Student
                    </button>
                  </div>

                  {/* Late Students */}
                  <div>
                    <label className="block text-sm font-medium text-orange-700 mb-2">
                      Late Students
                    </label>
                    {formData.lateStudents.map((student, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={student}
                          onChange={(e) => handleArrayChange("lateStudents", index, e.target.value)}
                          className="flex-1 px-3 py-2 bg-white border border-orange-300 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                      className="mt-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors duration-200"
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
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
              </div>
            </div>
          </div>
        </div>
      </form>

      <Footer />
    </main>
  );
}
