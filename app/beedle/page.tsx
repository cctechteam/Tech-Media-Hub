"use client";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import { fetchCurrentUser } from "@/lib/utils";
import Image from "next/image"; // ✅ Import Next.js Image

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
    lateStudents: [""],
  });

  useEffect(() => {
    fetchCurrentUser((user: any) => {
      setFormData((prev) => ({
        ...prev,
        beedleEmail: user?.email ?? "",
      }));
    });
  }, []);

  const gradeLevels = [
    "1st Form",
    "2nd Form",
    "3rd Form",
    "4th Form",
    "5th Form",
    "Lower Sixth (6B)",
    "Upper Sixth (6A)",
  ];

  const teachers = [
    "Ms E. Alexander",
    "Dr C. Allen-Pearson",
    "Mr D. Anderson",
    "Mr K. Anthony",
    "Ms K. Armstrong",
    "Mrs D. Atkinson Brown",
    "Ms N. Barnett",
    "Mrs B. Barrett",
    "Ms S. Barton",
    "Ms C. Bennett",
    "Mr N. Bennett",
    "Ms K. Bowen",
    "Mr B. Burnett",
    "Mr D. Cameron",
    "Mr T. Caramulla",
    "Mr K. Chin",
    "Mrs N. Chintersingh",
    "Mr D. Clarke",
    "Ms J. Coke",
    "Mr K. Coke",
    "Mrs S. Cole-Smith",
    "Ms J. Collins",
    "Ms A. Cooke",
    "Mr C. Davis",
    "Mrs D. Deacon-Jones",
    "Ms L. Deslandes",
    "Mrs N. Fearon-Johnson",
    "Ms S. Ffrench",
    "Mrs D. Foote",
    "Mr D. Foster",
    "Ms M. Garrick",
    "Mrs D. Gordon Taylor",
    "Mrs H. Gordon",
    "Ms S. Gordon",
    "Ms C. Grant",
    "Ms L. Green",
    "Ms J. Harvey",
    "Ms C. Haughton",
    "Mrs A. Hay",
    "Mr D. Henry",
    "Ms S. Hitchener",
    "Ms A. Holgate",
    "Mr M. Jackson",
    "Mrs L. James-Dobson",
    "Ms J. Johnson",
    "Ms J. Johnson",
    "Mrs K. Jones",
    "Mrs R. Julian",
    "Mrs S. Kenny-Folkes",
    "Mrs P. Kirby",
    "Mr J. Ledgister",
    "Ms A. Lynch",
    "Mr R. McCreath",
    "Ms M. Meeks",
    "Mr I. Miller",
    "Mr N. Milton",
    "Ms P. Morris",
    "Mrs K. Morrison",
    "Fr D. Mullens",
    "Mr S. Mundell",
    "Mrs T. Myrie-Jones",
    "Mrs T. Nicholson-Gordon",
    "Ms M. Peterkin",
    "Ms R. Quarrie",
    "Mrs G. Rampair",
    "Mrs C. Reid-Neil",
    "Mr R. Robotham",
    "Ms D. Rose",
    "Ms F. Smith",
    "Mrs A. Smith-Harris",
    "Mr C. Soutar",
    "Ms S. Spence",
    "Mrs A. Spencer",
    "Ms V. Stevenson",
    "Ms Kathryn Stewart",
    "Mrs V. Taylor-Smellie",
    "Ms K. Thomas",
    "Mr T. Voche II",
    "Mr D. Walker",
    "Ms G. Walker",
    "Ms C. Walters",
    "Mrs C. Webster",
    "Mr N. Wilkins",
    "Ms S. Williams",
    "Mr C. Willis",
    "Mrs S. Wint-Turner",
    "Mrs R. Wray-Cooke",
    "Mrs A. Yuffon",
  ];

  const subjects = [
    "Mathematics",
    "English",
    "Science",
    "Social Studies",
    "Art",
    "Music",
    "Physical Education",
    "Computer Studies",
    "Spanish",
    "French",
  ];

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleArrayChange = (
    field: keyof AttendanceFormData,
    index: number,
    value: any
  ) => {
    if (Array.isArray(formData[field])) {
      setFormData((prev) => ({
        ...prev,
        [field]: (prev[field] as string[]).map((item, i) =>
          i === index ? value : item
        ),
      }));
    }
  };

  const addArrayItem = (field: keyof AttendanceFormData) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }));
  };

  const removeArrayItem = (field: keyof AttendanceFormData, index: any) => {
    if (Array.isArray(formData[field])) {
      if (formData[field].length > 1) {
        setFormData((prev) => ({
          ...prev,
          [field]: (prev[field] as string[]).filter((_, i) => i !== index),
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
      lateStudents: [""],
    });
  };

  return (
    <main
      className="min-h-screen text-gray-800 bg-gradient-to-br from-red-50 via-white to-indigo-50 relative z-10 max-w-full mx-auto"
      aria-label="Beedle Attendance main content"
    >
      <h1 className="sr-only">Beedle Student Attendance</h1>
      <Navbar />

      <form
        className="w-full min-h-screen px-4 py-8"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-lg shadow-lg border border-blue-100 p-8">
            {/* ✅ Fixed Logo */}
            <div className="flex justify-center mb-6">
              <Image
                src="/images/Campion_Logo.png"
                alt="School Logo"
                width={120}
                height={120}
                className="h-20 w-auto"
              />
            </div>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-red-800 mb-2">
                Student Attendance Form
              </h2>
              <p className="text-red-600">Class Beedle Session(s) Report</p>
            </div>

            {/* ... rest of your form fields go here ... */}
          </div>
        </div>
      </form>

      <Footer />
    </main>
  );
}
