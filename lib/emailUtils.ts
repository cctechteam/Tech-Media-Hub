/**
 * Email Utilities for Beadle Slip Reporting System
 * 
 * This module handles the generation of supervisor reports and email content
 * for the daily beadle slip attendance system. It processes attendance data
 * and creates formatted HTML emails for distribution to form supervisors.
 * 
 * Key Features:
 * - Daily supervisor report generation for all form levels
 * - HTML email template creation with Campion College branding
 * - Attendance statistics calculation and visualization
 * - Handling of both data-present and no-submission scenarios
 * - Automatic scheduling support for daily 3:30 PM reports
 * 
 * @author Tech Media Hub Team
 * @version 1.0
 * @since 2024
 */

import { getBeadleSlips } from './serverUtils';

/**
 * SupervisorEmailData Interface
 * 
 * Defines the structure of data used to generate supervisor email reports.
 * Contains all necessary information for creating comprehensive attendance
 * summaries for form supervisors.
 */
export interface SupervisorEmailData {
  supervisorName: string;    // Name of the form supervisor
  supervisorEmail: string;   // Email address of the supervisor
  formLevel: string;         // Form level (1st Form, 2nd Form, etc.)
  date: string;              // Date of the report (YYYY-MM-DD format)
  totalReports: number;      // Total number of beadle slips submitted
  totalAbsent: number;       // Total number of absent students across all classes
  totalLate: number;         // Total number of late students across all classes
  classReports: {            // Array of individual class reports
    className: string;           // Class section (e.g., "4C", "Homeroom")
    subject: string;             // Subject taught
    teacher: string;             // Teacher name
    teacherPresent: boolean;     // Whether teacher was present
    substituteProvided: boolean; // Whether substitute was provided
    absentStudents: string[];    // Names of absent students
    lateStudents: string[];      // Names of late students
    beedleEmail: string;         // Email of student who submitted report
    reportTime: string;          // Class time period
  }[];
  // New grouped data structure for enhanced reporting
  studentAbsences: {         // Students grouped by form class, then alphabetically
    [studentName: string]: {
      classes: string[];         // All classes this student was absent from
      subjects: string[];        // All subjects this student missed
      teachers: string[];        // All teachers this student missed
    };
  };
  studentLateArrivals: {     // Students who were late, grouped similarly
    [studentName: string]: {
      classes: string[];         // All classes this student was late to
      subjects: string[];        // All subjects this student was late for
      teachers: string[];        // All teachers this student was late for
    };
  };
}

/**
 * Generates a daily supervisor report for a specific form level and date
 * 
 * This function:
 * 1. Retrieves all beadle slips from the database
 * 2. Filters slips for the specified form level and date
 * 3. Calculates attendance statistics (absent, late, present counts)
 * 4. Formats class report data for email generation
 * 5. Returns structured data for email template processing
 * 
 * @param formLevel - The form level to generate report for (e.g., "1st Form", "6A")
 * @param date - The date to generate report for (YYYY-MM-DD format)
 * @returns SupervisorEmailData object or null if no data found
 */
export async function generateDailySupervisorReport(formLevel: string, date: string): Promise<SupervisorEmailData | null> {
  try {
    const allSlips = await getBeadleSlips();
    
    console.log(`DEBUG: Total slips in database: ${allSlips.length}`);
    console.log(`DEBUG: Looking for formLevel: "${formLevel}", date: "${date}"`);
    
    // Debug: Log all unique form levels and dates for troubleshooting
    const uniqueForms = [...new Set(allSlips.map(slip => slip.grade_level))];
    const uniqueDates = [...new Set(allSlips.map(slip => slip.date))];
    console.log(`DEBUG: Available form levels:`, uniqueForms);
    console.log(`DEBUG: Available dates:`, uniqueDates);
    
    // Filter slips for specific form and date
    const formSlips = allSlips.filter(slip => 
      slip.grade_level === formLevel && 
      slip.date === date
    );

    console.log(`DEBUG: Found ${formSlips.length} slips for ${formLevel} on ${date}`);

    if (formSlips.length === 0) {
      return null;
    }

    // Calculate totals
    const totalAbsent = formSlips.reduce((sum, slip) => sum + slip.absent_students.length, 0);
    const totalLate = formSlips.reduce((sum, slip) => sum + slip.late_students.length, 0);

    // Format class reports
    const classReports = formSlips.map(slip => ({
      className: slip.class_name,
      subject: slip.subject,
      teacher: slip.teacher,
      teacherPresent: slip.teacher_present === 'yes',
      substituteProvided: slip.substitute_received === 'yes',
      absentStudents: slip.absent_students.filter((student: string) => student.trim() !== ''),
      lateStudents: slip.late_students.filter((student: string) => student.trim() !== ''),
      beedleEmail: slip.beedle_email,
      reportTime: `${slip.class_start_time} - ${slip.class_end_time}`
    }));

    // Group students by their absences and late arrivals
    const studentAbsences: { [studentName: string]: { classes: string[], subjects: string[], teachers: string[] } } = {};
    const studentLateArrivals: { [studentName: string]: { classes: string[], subjects: string[], teachers: string[] } } = {};

    // Process absent students
    formSlips.forEach(slip => {
      slip.absent_students.filter((student: string) => student.trim() !== '').forEach((student: string) => {
        const studentName = student.trim();
        if (!studentAbsences[studentName]) {
          studentAbsences[studentName] = { classes: [], subjects: [], teachers: [] };
        }
        studentAbsences[studentName].classes.push(slip.class_name);
        studentAbsences[studentName].subjects.push(slip.subject);
        studentAbsences[studentName].teachers.push(slip.teacher);
      });
    });

    // Process late students
    formSlips.forEach(slip => {
      slip.late_students.filter((student: string) => student.trim() !== '').forEach((student: string) => {
        const studentName = student.trim();
        if (!studentLateArrivals[studentName]) {
          studentLateArrivals[studentName] = { classes: [], subjects: [], teachers: [] };
        }
        studentLateArrivals[studentName].classes.push(slip.class_name);
        studentLateArrivals[studentName].subjects.push(slip.subject);
        studentLateArrivals[studentName].teachers.push(slip.teacher);
      });
    });

    // Sort students alphabetically
    const sortedAbsentStudents = Object.keys(studentAbsences).sort();
    const sortedLateStudents = Object.keys(studentLateArrivals).sort();
    
    const sortedStudentAbsences: typeof studentAbsences = {};
    const sortedStudentLateArrivals: typeof studentLateArrivals = {};
    
    sortedAbsentStudents.forEach(student => {
      sortedStudentAbsences[student] = studentAbsences[student];
    });
    
    sortedLateStudents.forEach(student => {
      sortedStudentLateArrivals[student] = studentLateArrivals[student];
    });

    return {
      supervisorName: `${formLevel} Form Supervisor`, // This would come from user database
      supervisorEmail: `${formLevel.toLowerCase()}supervisor@campioncollege.com`, // This would come from user database
      formLevel,
      date,
      totalReports: formSlips.length,
      totalAbsent,
      totalLate,
      classReports,
      studentAbsences: sortedStudentAbsences,
      studentLateArrivals: sortedStudentLateArrivals
    };
  } catch (error) {
    console.error('Error generating supervisor report:', error);
    return null;
  }
}

/**
 * Generates HTML email content for supervisor reports
 * 
 * Creates a professionally formatted HTML email with:
 * - Campion College branding and logo
 * - Attendance statistics with color-coded visual indicators
 * - Detailed student lists for absent and late students
 * - Comprehensive class-by-class breakdown table
 * - Responsive design for various email clients
 * 
 * @param reportData - The supervisor report data to format
 * @returns Complete HTML email content as string
 */
export function generateEmailContent(reportData: SupervisorEmailData): string {
  const { formLevel, date, totalReports, totalAbsent, totalLate, classReports, studentAbsences, studentLateArrivals } = reportData;
  
  // Format date for display in email header
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const totalPresent = classReports.reduce((sum, report) => {
    // Calculate present students for each class (total - absent - late)
    const classTotal = report.absentStudents.length + report.lateStudents.length + 25; // Assuming avg class size
    return sum + (classTotal - report.absentStudents.length - report.lateStudents.length);
  }, 0);

  const hasNoIssues = totalLate === 0 && totalAbsent === 0;

  let htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Daily Supervisor Report - ${formLevel}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .title { color: #B91C47; font-size: 24px; font-weight: bold; margin-bottom: 10px; }
        .subtitle { color: #666; margin-bottom: 20px; }
        .divider { height: 3px; background: #B91C47; margin: 20px 0; }
        .stats-container { display: flex; justify-content: space-around; margin: 30px 0; flex-wrap: wrap; }
        .stat-box { text-align: center; padding: 20px; margin: 10px; border-radius: 10px; min-width: 120px; }
        .stat-box.blue { background: #FFF0F3; border: 2px solid #B91C47; }
        .stat-box.green { background: #E8F5E8; border: 2px solid #4CAF50; }
        .stat-box.yellow { background: #FFF8E1; border: 2px solid #FF9800; }
        .stat-box.red { background: #FFEBEE; border: 2px solid #F44336; }
        .stat-number { font-size: 36px; font-weight: bold; margin-bottom: 5px; }
        .stat-number.blue { color: #B91C47; }
        .stat-number.green { color: #4CAF50; }
        .stat-number.yellow { color: #FF9800; }
        .stat-number.red { color: #F44336; }
        .stat-label { font-size: 14px; color: #666; }
        .excellent-box { background: #E8F5E8; border-left: 5px solid #4CAF50; padding: 15px; margin: 20px 0; border-radius: 5px; }
        .late-box { background: #FFF8E1; border-left: 5px solid #FF9800; padding: 15px; margin: 20px 0; border-radius: 5px; }
        .absent-box { background: #FFEBEE; border-left: 5px solid #F44336; padding: 15px; margin: 20px 0; border-radius: 5px; }
        .no-submissions { background: #E8F5E8; border-left: 5px solid #4CAF50; padding: 20px; margin: 20px 0; border-radius: 5px; text-align: center; }
        .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .table th, .table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        .table th { background: #FFF0F3; font-weight: bold; color: #B91C47; }
        .status-present { background: #E8F5E8; color: #4CAF50; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
        .status-late { background: #FFF8E1; color: #FF9800; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
        .status-absent { background: #FFEBEE; color: #F44336; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
        .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
        .student-list { margin: 10px 0; }
        .student-item { background: #f9f9f9; padding: 8px; margin: 4px 0; border-radius: 4px; }
    </style>
</head>
<body>
    <div class="header">
        <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://jamaker.s3.amazonaws.com/flfldr/HjXkRJfpTP3aLTQSJ.png" 
                 alt="Campion College Logo" 
                 style="width: 120px; height: 120px; object-fit: contain;" />
        </div>
        <div class="title">Daily Supervisor Report - Electronic Beadle Slip</div>
        <div class="subtitle"><strong>Form:</strong> ${formLevel} | <strong>Date:</strong> ${formattedDate}</div>
        <div class="divider"></div>
    </div>

    <p>Dear ${formLevel} Form Supervisor,</p>
    <p>Here is your daily summary report for form class <strong>${formLevel}</strong>:</p>

    <div class="stats-container">
        <div class="stat-box blue">
            <div class="stat-number blue">${totalReports}</div>
            <div class="stat-label">Total Submissions</div>
        </div>
        <div class="stat-box green">
            <div class="stat-number green">${totalPresent}</div>
            <div class="stat-label">Present</div>
        </div>
        <div class="stat-box yellow">
            <div class="stat-number yellow">${totalLate}</div>
            <div class="stat-label">Late Arrivals</div>
        </div>
        <div class="stat-box red">
            <div class="stat-number red">${totalAbsent}</div>
            <div class="stat-label">Absences</div>
        </div>
    </div>`;

  if (hasNoIssues) {
    htmlContent += `
    <div class="excellent-box">
        <strong>Excellent Attendance!</strong> All students were present today.
    </div>`;
  } else {
    // Late Students Section - Grouped by Student
    if (totalLate > 0) {
      htmlContent += `
    <div class="late-box">
        <strong>Late Arrivals (${totalLate} total instances)</strong>
        <div class="student-list">`;
      
      Object.entries(studentLateArrivals).forEach(([studentName, data]) => {
        htmlContent += `
            <div class="student-item">
                <strong>${studentName}</strong><br>
                <small>Late to ${data.classes.length} class${data.classes.length > 1 ? 'es' : ''}:</small><br>`;
        
        data.classes.forEach((className, index) => {
          htmlContent += `
                <small style="margin-left: 10px;">• ${data.subjects[index]} - ${className} with ${data.teachers[index]}</small><br>`;
        });
        
        htmlContent += `
            </div>`;
      });
      
      htmlContent += `
        </div>
    </div>`;
    }

    // Absent Students Section - Grouped by Student
    if (totalAbsent > 0) {
      htmlContent += `
    <div class="absent-box">
        <strong>Absences (${totalAbsent} total instances)</strong>
        <div class="student-list">`;
      
      Object.entries(studentAbsences).forEach(([studentName, data]) => {
        htmlContent += `
            <div class="student-item">
                <strong>${studentName}</strong><br>
                <small>Absent from ${data.classes.length} class${data.classes.length > 1 ? 'es' : ''}:</small><br>`;
        
        data.classes.forEach((className, index) => {
          htmlContent += `
                <small style="margin-left: 10px;">• ${data.subjects[index]} - ${className} with ${data.teachers[index]}</small><br>`;
        });
        
        htmlContent += `
            </div>`;
      });
      
      htmlContent += `
        </div>
    </div>`;
    }
  }

  // Detailed Table
  if (classReports.length > 0) {
    htmlContent += `
    <table class="table">
        <thead>
            <tr>
                <th>Student</th>
                <th>Subject</th>
                <th>Teacher</th>
                <th>Time</th>
                <th>Attendance</th>
                <th>Homework</th>
                <th>Behavior</th>
            </tr>
        </thead>
        <tbody>`;

    classReports.forEach(report => {
      // Add rows for each student mentioned in the report
      const allStudents = [...report.absentStudents, ...report.lateStudents];
      
      if (allStudents.length === 0) {
        // If no absent or late students, show a summary row
        htmlContent += `
            <tr>
                <td colspan="7" style="text-align: center; font-style: italic; color: #666;">
                    All students present for ${report.className} - ${report.subject}
                </td>
            </tr>`;
      } else {
        allStudents.forEach(student => {
          const isLate = report.lateStudents.includes(student);
          const isAbsent = report.absentStudents.includes(student);
          
          htmlContent += `
            <tr>
                <td><strong>${student}</strong></td>
                <td>${report.subject}</td>
                <td>${report.teacher}</td>
                <td>${report.reportTime}</td>
                <td>
                    ${isAbsent ? '<span class="status-absent">ABSENT</span>' : 
                      isLate ? '<span class="status-late">LATE</span>' : 
                      '<span class="status-present">PRESENT</span>'}
                </td>
                <td>N/A</td>
                <td>N/A</td>
            </tr>`;
        });
      }
    });

    htmlContent += `
        </tbody>
    </table>`;
  }

  htmlContent += `
    <div class="footer">
        <strong>Electronic Beadle Slip</strong><br>
        Report generated on ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}<br>
        <em>This is an automated email.</em><br><br>
        <em>Best Regards, Software Dev Team, Campion College</em>
    </div>
</body>
</html>`;

  return htmlContent;
}

export function generateNoSubmissionsEmail(formLevel: string, date: string): string {
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Daily Supervisor Report - ${formLevel} - No Submissions</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .title { color: #B91C47; font-size: 24px; font-weight: bold; margin-bottom: 10px; }
        .subtitle { color: #666; margin-bottom: 20px; }
        .divider { height: 3px; background: #B91C47; margin: 20px 0; }
        .no-submissions { background: #E8F5E8; border-left: 5px solid #4CAF50; padding: 20px; margin: 20px 0; border-radius: 5px; text-align: center; }
        .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="header">
        <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://jamaker.s3.amazonaws.com/flfldr/HjXkRJfpTP3aLTQSJ.png" 
                 alt="Campion College Logo" 
                 style="width: 120px; height: 120px; object-fit: contain;" />
        </div>
        <div class="title">Daily Supervisor Report - Electronic Beadle Slip</div>
        <div class="subtitle"><strong>Form:</strong> ${formLevel} | <strong>Date:</strong> ${formattedDate}</div>
        <div class="divider"></div>
    </div>

    <p>Dear ${formLevel} Form Supervisor,</p>
    
    <div class="no-submissions">
        <h3>No Submissions</h3>
        <p>No beadle slips were submitted by beadles in ${formLevel} today.</p>
    </div>

    <p style="margin-top: 30px; text-align: center; font-style: italic;">
        Best Regards,<br>
        Software Dev Team,<br>
        Campion College
    </p>

    <div class="footer">
        <strong>Electronic Beadle Slip</strong><br>
        Report generated on ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}<br>
        <em>This is an automated email.</em>
    </div>
</body>
</html>`;
}

export function generateBeadleConfirmationEmail(slipData: any): string {
  const formattedDate = new Date(slipData.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const submissionTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Beadle Slip Confirmation</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { text-align: center; margin-bottom: 20px; }
        .title { color: #B91C47; font-size: 24px; font-weight: bold; margin-bottom: 20px; text-align: center; }
        .subtitle { color: #666; margin-bottom: 20px; text-align: center; }
        .divider { height: 3px; background: #B91C47; margin: 20px 0; }
        .section { margin: 20px 0; padding: 15px; border-left: 4px solid #B91C47; background: #fef7f7; }
        .section-title { color: #B91C47; font-size: 16px; font-weight: bold; margin-bottom: 10px; }
        .info-row { display: flex; justify-content: space-between; margin: 8px 0; padding: 5px 0; }
        .info-label { font-weight: bold; color: #666; }
        .info-value { color: #333; }
        .status-badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
        .status-present { background: #E8F5E8; color: #4CAF50; }
        .status-late { background: #FFF8E1; color: #FF9800; }
        .status-absent { background: #FFEBEE; color: #F44336; }
        .homework-yes { background: #E8F5E8; color: #4CAF50; }
        .homework-no { background: #FFEBEE; color: #F44336; }
        .confirmation-box { background: #fef7f7; border: 1px solid #B91C47; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px; }
        .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
        .description-box { background: #f9f9f9; border: 1px solid #ddd; padding: 10px; margin: 10px 0; border-radius: 4px; min-height: 40px; }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">
            <img src="https://jamaker.s3.amazonaws.com/flfldr/HjXkRJfpTP3aLTQSJ.png" 
                 alt="Campion College Logo" 
                 style="width: 120px; height: 120px; object-fit: contain; display: block; margin: 0 auto;" />
        </div>
        <div class="title">Beadle Slip Confirmation</div>
        <div class="subtitle">Submission received successfully for <strong>${slipData.beedle_email}</strong></div>
        <div class="divider"></div>
    </div>

    <p>Dear ${slipData.beedle_email.split('@')[0]},</p>
    <p>This confirms your beadle slip submission. Below are the details:</p>

    <div class="section">
        <div class="section-title">Student Information</div>
        <div class="info-row">
            <span class="info-label">Name:</span>
            <span class="info-value">${slipData.beedle_email.split('@')[0]}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Email:</span>
            <span class="info-value">${slipData.beedle_email}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Grade Level:</span>
            <span class="info-value">${slipData.grade_level || 'N/A'}</span>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Class Details</div>
        <div class="info-row">
            <span class="info-label">Subject:</span>
            <span class="info-value">${slipData.subject}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Class:</span>
            <span class="info-value">${slipData.class_name}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Teacher:</span>
            <span class="info-value">${slipData.teacher}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Date:</span>
            <span class="info-value">${formattedDate}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Time:</span>
            <span class="info-value">${slipData.class_start_time} - ${slipData.class_end_time}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Session Type:</span>
            <span class="info-value">${slipData.is_double_session ? 'Double Session (70 minutes)' : 'Single Session (35 minutes)'}</span>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Teacher Attendance</div>
        <div class="info-row">
            <span class="info-label">Teacher Present:</span>
            <span class="info-value">
                <span class="status-badge ${slipData.teacher_present === 'yes' ? 'status-present' : 'status-absent'}">
                    ${slipData.teacher_present === 'yes' ? 'YES' : 'NO'}
                </span>
            </span>
        </div>
        ${slipData.teacher_present === 'yes' && slipData.teacher_arrival_time ? `
        <div class="info-row">
            <span class="info-label">Arrival Time:</span>
            <span class="info-value">${slipData.teacher_arrival_time}</span>
        </div>
        ` : ''}
        ${slipData.teacher_present === 'no' ? `
        <div class="info-row">
            <span class="info-label">Substitute Provided:</span>
            <span class="info-value">
                <span class="status-badge ${slipData.substitute_received === 'yes' ? 'status-present' : 'status-absent'}">
                    ${slipData.substitute_received === 'yes' ? 'YES' : 'NO'}
                </span>
            </span>
        </div>
        ` : ''}
    </div>

    <div class="section">
        <div class="section-title">Student Attendance</div>
        <div class="info-row">
            <span class="info-label">Students Present:</span>
            <span class="info-value">${slipData.students_present || 'Not specified'}</span>
        </div>
        ${slipData.absent_students && slipData.absent_students.length > 0 ? `
        <div style="margin-top: 10px;">
            <span class="info-label">Absent Students (${slipData.absent_students.length}):</span>
            <div class="description-box">
                ${slipData.absent_students.map((student: string) => `<div>• ${student}</div>`).join('')}
            </div>
        </div>
        ` : ''}
        ${slipData.late_students && slipData.late_students.length > 0 ? `
        <div style="margin-top: 10px;">
            <span class="info-label">Late Students (${slipData.late_students.length}):</span>
            <div class="description-box">
                ${slipData.late_students.map((student: string) => `<div>• ${student}</div>`).join('')}
            </div>
        </div>
        ` : ''}
    </div>

    ${slipData.homework_assigned === 'yes' ? `
    <div class="section">
        <div class="section-title">Homework</div>
        <div class="info-row">
            <span class="info-label">Assigned:</span>
            <span class="info-value">
                <span class="status-badge homework-yes">YES</span>
            </span>
        </div>
        <div class="info-row">
            <span class="info-label">Completed:</span>
            <span class="info-value">
                <span class="status-badge ${slipData.homework_completed === 'yes' ? 'homework-yes' : 'homework-no'}">
                    ${slipData.homework_completed === 'yes' ? 'YES' : 'NO'}
                </span>
            </span>
        </div>
        ${slipData.homework_description ? `
        <div style="margin-top: 10px;">
            <span class="info-label">Description:</span>
            <div class="description-box">${slipData.homework_description}</div>
        </div>
        ` : ''}
        ${slipData.homework_due_date ? `
        <div class="info-row">
            <span class="info-label">Due Date:</span>
            <span class="info-value">${new Date(slipData.homework_due_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
        ` : ''}
    </div>
    ` : `
    <div class="section">
        <div class="section-title">Homework</div>
        <div class="info-row">
            <span class="info-label">Assigned:</span>
            <span class="info-value">
                <span class="status-badge homework-no">NO</span>
            </span>
        </div>
    </div>
    `}

    ${slipData.behavior_rating || slipData.notes ? `
    <div class="section">
        <div class="section-title">Additional Information</div>
        ${slipData.behavior_rating ? `
        <div class="info-row">
            <span class="info-label">Behavior:</span>
            <span class="info-value">${slipData.behavior_rating}</span>
        </div>
        ` : ''}
        ${slipData.notes ? `
        <div style="margin-top: 10px;">
            <span class="info-label">Notes:</span>
            <div class="description-box">${slipData.notes}</div>
        </div>
        ` : ''}
    </div>
    ` : ''}

    <div class="confirmation-box">
        <strong>Your submission has been recorded successfully.</strong>
    </div>

    <p>If you have any questions, contact your teacher or supervisor.</p>

    <div class="footer">
        <strong>Electronic Beadle Slip</strong><br>
        Submitted on ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}<br>
        <em>This is an automated email. Do not reply.</em><br><br>
        <em>Best Regards, Software Dev Team, Campion College</em>
    </div>
</body>
</html>`;
}

/**
 * Generates supervisor reports for all form levels on a given date
 * 
 * This is the main function for bulk report generation. It processes
 * all 7 form levels (1st-5th Form, 6A, 6B) and generates appropriate
 * email content for each. Handles both data-present and no-submission
 * scenarios gracefully.
 * 
 * Form Levels Processed:
 * - 1st Form through 5th Form (traditional secondary levels)
 * - 6B (Lower 6th Form) - separate supervisor
 * - 6A (Upper 6th Form) - separate supervisor
 * 
 * @param date - Date to generate reports for (YYYY-MM-DD format)
 * @returns Object mapping form levels to their HTML email content
 */
export async function generateAllSupervisorReports(date: string): Promise<{ [formLevel: string]: string }> {
  // Note: 6B = Lower 6th Form, 6A = Upper 6th Form (each has separate supervisors)
  const formLevels = ['1st Form', '2nd Form', '3rd Form', '4th Form', '5th Form', '6B', '6A'];
  const reports: { [formLevel: string]: string } = {};

  console.log(`DEBUG: Starting report generation for all forms on ${date}`);

  // Process each form level individually
  for (const formLevel of formLevels) {
    console.log(`DEBUG: Processing ${formLevel}...`);
    try {
      const reportData = await generateDailySupervisorReport(formLevel, date);
      if (reportData) {
        console.log(`DEBUG: ${formLevel} - Found data, generating detailed report`);
        reports[formLevel] = generateEmailContent(reportData);
      } else {
        console.log(`DEBUG: ${formLevel} - No data found, generating no-submissions report`);
        // Generate a "no submissions" report for forms without data
        reports[formLevel] = generateNoSubmissionsEmail(formLevel, date);
      }
    } catch (error) {
      console.error(`DEBUG: Error processing ${formLevel}:`, error);
      reports[formLevel] = generateNoSubmissionsEmail(formLevel, date);
    }
  }

  console.log(`DEBUG: Completed processing all forms. Generated ${Object.keys(reports).length} reports`);
  return reports;
}

/**
 * Gets today's date in YYYY-MM-DD format
 * 
 * Utility function for consistent date formatting across the system.
 * Used as default date for report generation.
 * 
 * @returns Today's date in YYYY-MM-DD format
 */
export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Scheduled daily reports function (3:30 PM automation)
 * 
 * This function represents the automated daily report generation that
 * would typically be triggered by a cron job at 3:30 PM each school day.
 * It generates reports for all form levels for the current date.
 * 
 * Current Implementation:
 * - Generates reports for today's date
 * - Logs email content to console for manual distribution
 * - Returns reports object for programmatic access
 * 
 * Future Enhancement:
 * - Integration with email service (SMTP/SendGrid/etc.)
 * - Automatic email distribution to supervisors
 * - Error handling and retry logic
 * - Scheduling via cron job or cloud functions
 * 
 * @returns Object mapping form levels to their HTML email content
 */
export async function scheduledDailyReports() {
  const today = getTodayDate();
  const reports = await generateAllSupervisorReports(today);
  
  console.log('=== DAILY SUPERVISOR REPORTS GENERATED ===');
  console.log(`Date: ${today}`);
  console.log(`Reports generated for ${Object.keys(reports).length} forms`);
  
  // In a real implementation, this would send emails via SMTP/API
  // For now, we log the email content for manual distribution
  Object.entries(reports).forEach(([formLevel, emailContent]) => {
    console.log(`\n=== ${formLevel} REPORT ===`);
    console.log(emailContent);
    console.log(`\n=== END ${formLevel} REPORT ===\n`);
  });
  
  return reports;
}
