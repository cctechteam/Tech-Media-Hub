import { getBeedleSlips } from './serverUtils';

export interface SupervisorEmailData {
  supervisorName: string;
  supervisorEmail: string;
  formLevel: string;
  date: string;
  totalReports: number;
  totalAbsent: number;
  totalLate: number;
  classReports: {
    className: string;
    subject: string;
    teacher: string;
    teacherPresent: boolean;
    substituteProvided: boolean;
    absentStudents: string[];
    lateStudents: string[];
    beedleEmail: string;
    reportTime: string;
  }[];
}

export async function generateDailySupervisorReport(formLevel: string, date: string): Promise<SupervisorEmailData | null> {
  try {
    const allSlips = await getBeedleSlips();
    
    console.log(`DEBUG: Total slips in database: ${allSlips.length}`);
    console.log(`DEBUG: Looking for formLevel: "${formLevel}", date: "${date}"`);
    
    // Debug: Log all unique form levels and dates
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

    return {
      supervisorName: `${formLevel} Form Supervisor`, // This would come from user database
      supervisorEmail: `${formLevel.toLowerCase()}supervisor@campioncollege.com`, // This would come from user database
      formLevel,
      date,
      totalReports: formSlips.length,
      totalAbsent,
      totalLate,
      classReports
    };
  } catch (error) {
    console.error('Error generating supervisor report:', error);
    return null;
  }
}

export function generateEmailContent(reportData: SupervisorEmailData): string {
  const { formLevel, date, totalReports, totalAbsent, totalLate, classReports } = reportData;
  
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  let emailContent = `
Subject: Daily Beadle Report - ${formLevel} Form - ${formattedDate}

Dear ${formLevel} Form Supervisor,

This is your automated daily beadle slip summary for ${formattedDate}.

=== SUMMARY ===
• Total Reports Received: ${totalReports}
• Total Students Absent: ${totalAbsent}
• Total Students Late: ${totalLate}

=== DETAILED REPORTS ===
`;

  classReports.forEach((report, index) => {
    emailContent += `
${index + 1}. ${report.className} - ${report.subject}
   Time: ${report.reportTime}
   Teacher: ${report.teacher} ${report.teacherPresent ? '(Present)' : '(ABSENT)'}`;
    
    if (!report.teacherPresent) {
      emailContent += ` - ${report.substituteProvided ? 'Substitute Provided' : 'NO SUBSTITUTE'}`;
    }
    
    emailContent += `
   Beadle: ${report.beedleEmail.split('@')[0]}
   
   Students Absent (${report.absentStudents.length}):`;
    
    if (report.absentStudents.length > 0) {
      report.absentStudents.forEach(student => {
        emailContent += `\n   • ${student}`;
      });
    } else {
      emailContent += `\n   • No students absent`;
    }
    
    emailContent += `\n   
   Students Late (${report.lateStudents.length}):`;
    
    if (report.lateStudents.length > 0) {
      report.lateStudents.forEach(student => {
        emailContent += `\n   • ${student}`;
      });
    } else {
      emailContent += `\n   • No students late`;
    }
    
    emailContent += `\n`;
  });

  emailContent += `
=== PRIORITY ATTENTION NEEDED ===`;

  const priorityIssues = classReports.filter(report => 
    !report.teacherPresent && !report.substituteProvided || 
    report.absentStudents.length > 5 ||
    report.lateStudents.length > 3
  );

  if (priorityIssues.length > 0) {
    priorityIssues.forEach(issue => {
      emailContent += `\n• ${issue.className} - ${issue.subject}:`;
      if (!issue.teacherPresent && !issue.substituteProvided) {
        emailContent += ` Teacher absent with no substitute`;
      }
      if (issue.absentStudents.length > 5) {
        emailContent += ` High absence rate (${issue.absentStudents.length} students)`;
      }
      if (issue.lateStudents.length > 3) {
        emailContent += ` High tardiness (${issue.lateStudents.length} students)`;
      }
    });
  } else {
    emailContent += `\n• No priority issues identified`;
  }

  emailContent += `

=== NEXT STEPS ===
Please review this report and take appropriate action for any priority issues.
Access the full dashboard at: [Dashboard URL]

This report was automatically generated by the Beadle Slip System.
Sent from: beadleslip@campioncollege.com

---
Campion College Technology Team
`;

  return emailContent;
}

export function generateNoSubmissionsEmail(formLevel: string, date: string): string {
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `
Subject: Daily Beadle Report - ${formLevel} Form - ${formattedDate} - NO SUBMISSIONS

Dear ${formLevel} Form Supervisor,

This is your automated daily beadle slip summary for ${formattedDate}.

=== SUMMARY ===
• Total Reports Received: 0
• Total Students Absent: 0
• Total Students Late: 0

=== STATUS ===
No beadle slips were submitted for ${formLevel} Form on ${formattedDate}.

This could indicate:
• No classes were scheduled for this form level
• All teachers were present and no attendance issues occurred
• Beadle slips were not submitted (requires follow-up)

=== RECOMMENDED ACTION ===
Please verify with form teachers that:
1. All scheduled classes took place as planned
2. Attendance was properly recorded
3. Any issues were appropriately documented

If classes were held but no slips were submitted, please remind teachers about the beadle slip submission requirement.

Access the full dashboard at: [Dashboard URL]

This report was automatically generated by the Beadle Slip System.
Sent from: beadleslip@campioncollege.com


~ Campion College Technology Team
`;
}

export async function generateAllSupervisorReports(date: string): Promise<{ [formLevel: string]: string }> {
  const formLevels = ['1st Form', '2nd Form', '3rd Form', '4th Form', '5th Form', '6th Form'];
  const reports: { [formLevel: string]: string } = {};

  console.log(`DEBUG: Starting report generation for all forms on ${date}`);

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

// Function to get today's date in YYYY-MM-DD format
export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

// Function that would be called at 3:30 PM daily (placeholder for cron job)
export async function scheduledDailyReports() {
  const today = getTodayDate();
  const reports = await generateAllSupervisorReports(today);
  
  console.log('=== DAILY SUPERVISOR REPORTS GENERATED ===');
  console.log(`Date: ${today}`);
  console.log(`Reports generated for ${Object.keys(reports).length} forms`);
  
  // In a real implementation, this would send emails
  // For now, we'll log the email content for manual sending
  Object.entries(reports).forEach(([formLevel, emailContent]) => {
    console.log(`\n=== ${formLevel} REPORT ===`);
    console.log(emailContent);
    console.log(`\n=== END ${formLevel} REPORT ===\n`);
  });
  
  return reports;
}
