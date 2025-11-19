import { getBeadleSlips } from './serverUtils';
import { getDatabase } from './database';

export interface ReportMetadata {
  htmlContent: string;
  supervisorEmail: string;
  supervisorName: string;
  formLevel: string;
  date: string;
  hasData: boolean;
}

interface SupervisorInfo {
  email: string;
  name: string;
}

interface StudentAttendance {
  [studentName: string]: {
    classes: string[];
    subjects: string[];
    teachers: string[];
  };
}

interface ClassReport {
  className: string;
  subject: string;
  teacher: string;
  teacherPresent: boolean;
  substituteProvided: boolean;
  absentStudents: string[];
  lateStudents: string[];
  reportTime: string;
}

const FORM_LEVELS = ['1st Form', '2nd Form', '3rd Form', '4th Form', '5th Form', '6B', '6A'];

const ROLE_MAP: { [key: string]: string } = {
  '1st Form': 'supervisor_1',
  '2nd Form': 'supervisor_2',
  '3rd Form': 'supervisor_3',
  '4th Form': 'supervisor_4',
  '5th Form': 'supervisor_5',
  '6B': 'supervisor_6',
  '6A': 'supervisor_6a'
};

async function getSupervisorInfo(formLevel: string): Promise<SupervisorInfo> {
  const roleName = ROLE_MAP[formLevel];
  
  if (!roleName) {
    console.warn(`[Email] No role mapping for form level: ${formLevel}`);
    return {
      email: `${formLevel.toLowerCase().replace(/\s+/g, '')}supervisor@campioncollege.com`,
      name: `${formLevel} Supervisor`
    };
  }

  try {
    const db = await getDatabase();
    
    const query = `
      SELECT m.email, m.full_name
      FROM members m
      INNER JOIN member_roles mr ON m.id = mr.member_id
      INNER JOIN roles r ON mr.role_id = r.id
      WHERE r.role_name = ?
      LIMIT 1
    `;
    
    const result = db.prepare(query).get(roleName) as { email: string; full_name: string } | undefined;
    
    if (result && result.email && result.full_name) {
      console.log(`[Email] Found supervisor for ${formLevel}: ${result.full_name} <${result.email}>`);
      return {
        email: result.email,
        name: result.full_name
      };
    }
    
    console.warn(`[Email] No supervisor found for ${formLevel}, using defaults`);
    return {
      email: `${formLevel.toLowerCase().replace(/\s+/g, '')}supervisor@campioncollege.com`,
      name: `${formLevel} Supervisor`
    };
    
  } catch (error) {
    console.error(`[Email] Error fetching supervisor for ${formLevel}:`, error);
    return {
      email: `${formLevel.toLowerCase().replace(/\s+/g, '')}supervisor@campioncollege.com`,
      name: `${formLevel} Supervisor`
    };
  }
}

async function processFormData(formLevel: string, date: string) {
  const allSlips = await getBeadleSlips();
  
  console.log(`[Email] Total slips in database: ${allSlips.length}`);
  console.log(`[Email] Looking for: formLevel="${formLevel}", date="${date}"`);
  
  const uniqueForms = [...new Set(allSlips.map(slip => slip.grade_level))];
  const uniqueDates = [...new Set(allSlips.map(slip => slip.date))];
  console.log(`[Email] Available form levels:`, uniqueForms);
  console.log(`[Email] Available dates:`, uniqueDates);
  
  const formSlips = allSlips.filter(slip => {
    const slipForm = slip.grade_level;
    const matches = slipForm === formLevel || 
                   slipForm === formLevel.replace(' Form', '') ||
                   `${slipForm} Form` === formLevel;
    const dateMatches = slip.date === date;
    return matches && dateMatches;
  });

  console.log(`[Email] Found ${formSlips.length} slips for ${formLevel} on ${date}`);

  if (formSlips.length === 0) {
    return null;
  }

  const totalAbsent = formSlips.reduce((sum, slip) => 
    sum + slip.absent_students.length, 0
  );
  const totalLate = formSlips.reduce((sum, slip) => 
    sum + slip.late_students.length, 0
  );

  const classReports: ClassReport[] = formSlips.map(slip => ({
    className: slip.class_name,
    subject: slip.subject,
    teacher: slip.teacher,
    teacherPresent: slip.teacher_present === 'yes',
    substituteProvided: slip.substitute_received === 'yes',
    absentStudents: slip.absent_students.filter((s: string) => s.trim() !== ''),
    lateStudents: slip.late_students.filter((s: string) => s.trim() !== ''),
    reportTime: `${slip.class_start_time} - ${slip.class_end_time}`
  }));

  const studentAbsences: StudentAttendance = {};
  const studentLateArrivals: StudentAttendance = {};

  formSlips.forEach(slip => {
    slip.absent_students
      .filter((s: string) => s.trim() !== '')
      .forEach((student: string) => {
        const name = student.trim();
        if (!studentAbsences[name]) {
          studentAbsences[name] = { classes: [], subjects: [], teachers: [] };
        }
        studentAbsences[name].classes.push(slip.class_name);
        studentAbsences[name].subjects.push(slip.subject);
        studentAbsences[name].teachers.push(slip.teacher);
      });

    slip.late_students
      .filter((s: string) => s.trim() !== '')
      .forEach((student: string) => {
        const name = student.trim();
        if (!studentLateArrivals[name]) {
          studentLateArrivals[name] = { classes: [], subjects: [], teachers: [] };
        }
        studentLateArrivals[name].classes.push(slip.class_name);
        studentLateArrivals[name].subjects.push(slip.subject);
        studentLateArrivals[name].teachers.push(slip.teacher);
      });
  });

  const sortedAbsences: StudentAttendance = {};
  const sortedLateArrivals: StudentAttendance = {};
  
  Object.keys(studentAbsences).sort().forEach(name => {
    sortedAbsences[name] = studentAbsences[name];
  });
  
  Object.keys(studentLateArrivals).sort().forEach(name => {
    sortedLateArrivals[name] = studentLateArrivals[name];
  });

  return {
    totalReports: formSlips.length,
    totalAbsent,
    totalLate,
    classReports,
    studentAbsences: sortedAbsences,
    studentLateArrivals: sortedLateArrivals
  };
}

function generateDataEmail(
  supervisorName: string,
  formLevel: string,
  date: string,
  data: any
): string {
  const [year, month, day] = date.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const hasNoIssues = data.totalLate === 0 && data.totalAbsent === 0;

  let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Daily Beadle Report - ${formLevel}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .logo { width: 120px; height: 120px; margin: 0 auto 20px; }
    .title { color: #B91C47; font-size: 24px; font-weight: bold; margin-bottom: 10px; }
    .subtitle { color: #666; margin-bottom: 20px; }
    .divider { height: 3px; background: #B91C47; margin: 20px 0; }
    .stats { display: flex; justify-content: space-around; margin: 30px 0; flex-wrap: wrap; }
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
    .box { padding: 15px; margin: 20px 0; border-radius: 5px; }
    .box.green { background: #E8F5E8; border-left: 5px solid #4CAF50; }
    .box.yellow { background: #FFF8E1; border-left: 5px solid #FF9800; }
    .box.red { background: #FFEBEE; border-left: 5px solid #F44336; }
    .student-list { margin: 10px 0; }
    .student-item { background: #f9f9f9; padding: 8px; margin: 4px 0; border-radius: 4px; }
    .table-container { margin: 30px 0; }
    .table-title { color: #B91C47; font-size: 18px; font-weight: bold; margin-bottom: 15px; }
    table { width: 100%; border-collapse: collapse; margin: 10px 0; }
    th, td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 13px; }
    th { background: #FFF0F3; color: #B91C47; font-weight: bold; }
    tr:nth-child(even) { background: #f9f9f9; }
    tr:hover { background: #f5f5f5; }
    .badge { padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; display: inline-block; }
    .badge-green { background: #E8F5E8; color: #4CAF50; }
    .badge-yellow { background: #FFF8E1; color: #FF9800; }
    .badge-red { background: #FFEBEE; color: #F44336; }
    .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="header">
    <img src="https://jamaker.s3.amazonaws.com/flfldr/HjXkRJfpTP3aLTQSJ.png" alt="Campion College Logo" class="logo" />
    <div class="title">Daily Supervisor Report - Electronic Beadle Slip</div>
    <div class="subtitle"><strong>Form:</strong> ${formLevel} | <strong>Date:</strong> ${formattedDate}</div>
    <div class="divider"></div>
  </div>

  <p>Dear ${supervisorName},</p>
  <p>Here is your daily summary report for form class <strong>${formLevel}</strong>:</p>

  <div class="stats">
    <div class="stat-box blue">
      <div class="stat-number blue">${data.totalReports}</div>
      <div class="stat-label">Total Submissions</div>
    </div>
    <div class="stat-box green">
      <div class="stat-number green">${data.totalReports * 25 - data.totalAbsent - data.totalLate}</div>
      <div class="stat-label">Present</div>
    </div>
    <div class="stat-box yellow">
      <div class="stat-number yellow">${data.totalLate}</div>
      <div class="stat-label">Late Arrivals</div>
    </div>
    <div class="stat-box red">
      <div class="stat-number red">${data.totalAbsent}</div>
      <div class="stat-label">Absences</div>
    </div>
  </div>`;

  if (hasNoIssues) {
    html += `
  <div class="box green">
    <strong>Excellent Attendance!</strong> All students were present today.
  </div>`;
  } else {
    if (data.totalLate > 0) {
      html += `
  <div class="box yellow">
    <strong>Late Arrivals (${data.totalLate} total instances)</strong>
    <div class="student-list">`;
      
      Object.entries(data.studentLateArrivals).forEach(([name, info]: [string, any]) => {
        html += `
      <div class="student-item">
        <strong>${name}</strong><br>
        <small>Late to ${info.classes.length} class${info.classes.length > 1 ? 'es' : ''}:</small><br>`;
        info.classes.forEach((cls: string, i: number) => {
          html += `
        <small style="margin-left: 10px;">• ${info.subjects[i]} - ${cls} with ${info.teachers[i]}</small><br>`;
        });
        html += `
      </div>`;
      });
      
      html += `
    </div>
  </div>`;
    }

    if (data.totalAbsent > 0) {
      html += `
  <div class="box red">
    <strong>Absences (${data.totalAbsent} total instances)</strong>
    <div class="student-list">`;
      
      Object.entries(data.studentAbsences).forEach(([name, info]: [string, any]) => {
        html += `
      <div class="student-item">
        <strong>${name}</strong><br>
        <small>Absent from ${info.classes.length} class${info.classes.length > 1 ? 'es' : ''}:</small><br>`;
        info.classes.forEach((cls: string, i: number) => {
          html += `
        <small style="margin-left: 10px;">• ${info.subjects[i]} - ${cls} with ${info.teachers[i]}</small><br>`;
        });
        html += `
      </div>`;
      });
      
      html += `
    </div>
  </div>`;
    }
  }

  html += `
  <div class="table-container">
    <div class="table-title">Class Summary</div>
    <table>
      <thead>
        <tr>
          <th>Class</th>
          <th>Subject</th>
          <th>Teacher</th>
          <th>Time</th>
          <th>Teacher Status</th>
          <th>Absent</th>
          <th>Late</th>
        </tr>
      </thead>
      <tbody>`;
  
  const sortedClasses = [...data.classReports].sort((a, b) => {
    return a.reportTime.localeCompare(b.reportTime);
  });
  
  sortedClasses.forEach((classReport: any) => {
    const teacherStatus = classReport.teacherPresent 
      ? '<span class="badge badge-green">Present</span>' 
      : classReport.substituteProvided
        ? '<span class="badge badge-yellow">Substitute</span>'
        : '<span class="badge badge-red">Absent</span>';
    
    const absentCount = classReport.absentStudents.length;
    const lateCount = classReport.lateStudents.length;
    
    html += `
        <tr>
          <td><strong>${classReport.className}</strong></td>
          <td>${classReport.subject}</td>
          <td>${classReport.teacher}</td>
          <td>${classReport.reportTime}</td>
          <td>${teacherStatus}</td>
          <td>${absentCount > 0 ? `<span class="badge badge-red">${absentCount}</span>` : '0'}</td>
          <td>${lateCount > 0 ? `<span class="badge badge-yellow">${lateCount}</span>` : '0'}</td>
        </tr>`;
  });
  
  html += `
      </tbody>
    </table>
  </div>`;

  html += `
  <div class="footer">
    <strong>Electronic Beadle Slip</strong><br>
    Report generated on ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}<br>
    <em>This is an automated email.</em><br><br>
    <em>Best Regards, Software Dev Team, Campion College</em>
  </div>
</body>
</html>`;

  return html;
}

function generateNoSubmissionsEmail(
  supervisorName: string,
  formLevel: string,
  date: string
): string {
  const [year, month, day] = date.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Daily Beadle Report - ${formLevel}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .logo { width: 120px; height: 120px; margin: 0 auto 20px; }
    .title { color: #B91C47; font-size: 24px; font-weight: bold; margin-bottom: 10px; }
    .subtitle { color: #666; margin-bottom: 20px; }
    .divider { height: 3px; background: #B91C47; margin: 20px 0; }
    .box { background: #E8F5E8; border-left: 5px solid #4CAF50; padding: 20px; margin: 20px 0; border-radius: 5px; text-align: center; }
    .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="header">
    <img src="https://jamaker.s3.amazonaws.com/flfldr/HjXkRJfpTP3aLTQSJ.png" alt="Campion College Logo" class="logo" />
    <div class="title">Daily Supervisor Report - Electronic Beadle Slip</div>
    <div class="subtitle"><strong>Form:</strong> ${formLevel} | <strong>Date:</strong> ${formattedDate}</div>
    <div class="divider"></div>
  </div>

  <p>Dear ${supervisorName},</p>
  
  <div class="box">
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

export async function generateAllSupervisorReports(date: string): Promise<{ [formLevel: string]: ReportMetadata }> {
  console.log(`[Email] Generating reports for ${date}`);
  const reports: { [formLevel: string]: ReportMetadata } = {};

  for (const formLevel of FORM_LEVELS) {
    console.log(`[Email] Processing ${formLevel}...`);
    
    try {
      const supervisor = await getSupervisorInfo(formLevel);

      const data = await processFormData(formLevel, date);
      
      if (data) {
        console.log(`[Email] ${formLevel} - Found ${data.totalReports} submissions`);
        reports[formLevel] = {
          htmlContent: generateDataEmail(supervisor.name, formLevel, date, data),
          supervisorEmail: supervisor.email,
          supervisorName: supervisor.name,
          formLevel,
          date,
          hasData: true
        };
      } else {
        console.log(`[Email] ${formLevel} - No submissions`);
        reports[formLevel] = {
          htmlContent: generateNoSubmissionsEmail(supervisor.name, formLevel, date),
          supervisorEmail: supervisor.email,
          supervisorName: supervisor.name,
          formLevel,
          date,
          hasData: false
        };
      }
    } catch (error) {
      console.error(`[Email] Error processing ${formLevel}:`, error);
      const supervisor = await getSupervisorInfo(formLevel);
      reports[formLevel] = {
        htmlContent: generateNoSubmissionsEmail(supervisor.name, formLevel, date),
        supervisorEmail: supervisor.email,
        supervisorName: supervisor.name,
        formLevel,
        date,
        hasData: false
      };
    }
  }

  console.log(`[Email] Completed - Generated ${Object.keys(reports).length} reports`);
  return reports;
}

export async function scheduledDailyReports() {
  const today = getTodayDate();
  console.log(`[Email] Running scheduled daily reports for ${today} (4:00 PM)`);
  
  const reports = await generateAllSupervisorReports(today);
  
  Object.entries(reports).forEach(([formLevel, report]) => {
    console.log(`[Email] ${formLevel}: ${report.supervisorName} <${report.supervisorEmail}> - ${report.hasData ? 'Has Data' : 'No Data'}`);
  });
  
  return reports;
}

export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

export function generateBeadleConfirmationEmail(slipData: any): string {
  const [year, month, day] = slipData.date.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Beadle Slip Confirmation</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .logo { width: 120px; height: 120px; margin: 0 auto 20px; }
    .title { color: #B91C47; font-size: 24px; font-weight: bold; margin-bottom: 20px; text-align: center; }
    .subtitle { color: #666; margin-bottom: 20px; text-align: center; }
    .divider { height: 3px; background: #B91C47; margin: 20px 0; }
    .section { margin: 20px 0; padding: 15px; border-left: 4px solid #B91C47; background: #fef7f7; }
    .section-title { color: #B91C47; font-size: 16px; font-weight: bold; margin-bottom: 10px; }
    .info-row { display: flex; justify-content: space-between; margin: 8px 0; padding: 5px 0; }
    .info-label { font-weight: bold; color: #666; }
    .info-value { color: #333; }
    .status-badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
    .status-yes { background: #E8F5E8; color: #4CAF50; }
    .status-no { background: #FFEBEE; color: #F44336; }
    .confirmation-box { background: #fef7f7; border: 1px solid #B91C47; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px; }
    .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
    .description-box { background: #f9f9f9; border: 1px solid #ddd; padding: 10px; margin: 10px 0; border-radius: 4px; min-height: 40px; }
  </style>
</head>
<body>
  <div class="header">
    <img src="https://jamaker.s3.amazonaws.com/flfldr/HjXkRJfpTP3aLTQSJ.png" alt="Campion College Logo" class="logo" />
    <div class="title">Beadle Slip Confirmation</div>
    <div class="subtitle">Submission received successfully for <strong>${slipData.beadle_email}</strong></div>
    <div class="divider"></div>
  </div>

  <p>Dear ${slipData.beadle_email.split('@')[0]},</p>
  <p>This confirms your beadle slip submission. Below are the details:</p>

  <div class="section">
    <div class="section-title">Student Information</div>
    <div class="info-row">
      <span class="info-label">Name:</span>
      <span class="info-value">${slipData.beadle_email.split('@')[0]}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Email:</span>
      <span class="info-value">${slipData.beadle_email}</span>
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
  </div>

  <div class="section">
    <div class="section-title">Teacher Attendance</div>
    <div class="info-row">
      <span class="info-label">Teacher Present:</span>
      <span class="info-value">
        <span class="status-badge ${slipData.teacher_present === 'yes' ? 'status-yes' : 'status-no'}">
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
        <span class="status-badge ${slipData.substitute_received === 'yes' ? 'status-yes' : 'status-no'}">
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
