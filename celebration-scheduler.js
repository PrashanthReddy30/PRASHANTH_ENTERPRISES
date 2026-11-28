// Prashanth Enterprises HRMS - Automated Celebration Scheduler (Server / Cron Runner)
// Triggered at 01:00 AM IST (Asia/Kolkata) daily.
// Can be invoked by crontab, systemd timer, or Firebase Scheduled Cloud Functions.

import { 
  getNowInIST, 
  parseDateSafe, 
  calculateCompletedYears, 
  isBirthdayToday, 
  isLeapYear 
} from './src/services/celebrationAutomationEngine.js';
import { generateFallbackSvgPoster } from './src/services/celebrationImageGenerator.js';

console.log('='.repeat(70));
console.log('PRASHANTH ENTERPRISES HRMS — CELEBRATION AUTOMATION ENGINE');
console.log('Triggered at: 01:00 AM IST Scheduled Daily Execution');
console.log('='.repeat(70));

const istNow = getNowInIST();
console.log(`[Engine Time] Current Time in IST (Asia/Kolkata): ${istNow.isoTimestamp}`);
console.log(`[Engine Target Date] Evaluating celebrations for: ${istNow.dateStr}`);
console.log(`[Calendar Check] Is Leap Year (${istNow.year})? ${isLeapYear(istNow.year) ? 'YES' : 'NO'}`);

export async function runServerScheduler(options = {}) {
  const targetDateStr = options.date || istNow.dateStr;
  const targetParsed = parseDateSafe(targetDateStr);
  console.log(`\nEvaluating workforce database for ${targetDateStr}...`);

  // Sample production workforce snapshot from store seed
  const employees = [
    { id: 'PE000', name: 'Prashanth Reddy', role: 'Director of Operations', department: 'Executive Management', branch: 'Hyderabad', joiningDate: '2021-01-12', dob: '1988-10-15', status: 'Active' },
    { id: 'PE001', name: 'Ravi Kumar', role: 'Software Engineer II', department: 'IT', branch: 'Hyderabad', joiningDate: '2024-03-15', dob: '1995-05-20', status: 'Active' },
    { id: 'PE002', name: 'Pooja Hegde', role: 'VP People Operations', department: 'HR', branch: 'Hyderabad', joiningDate: '2022-04-01', dob: '1992-09-12', status: 'Active' },
    { id: 'PE003', name: 'Rajesh Kannan', role: 'VP Engineering & Tech', department: 'IT', branch: 'Chennai', joiningDate: '2022-11-16', dob: '1985-07-08', status: 'Active' },
    { id: 'PE004', name: 'Sneha Kulkarni', role: 'Head of Finance & Treasury', department: 'Finance', branch: 'Mumbai', joiningDate: '2020-08-15', dob: '1994-02-29', status: 'Active' },
    { id: 'PE005', name: 'Kavitha Sharma', role: 'Director Quality Engineering', department: 'Engineering', branch: 'Hyderabad', joiningDate: '2023-06-01', dob: '1994-11-16', status: 'Active' },
    { id: 'PE010', name: 'Ananya Deshmukh', role: 'Senior Frontend Engineer', department: 'Engineering & QA', branch: 'Hyderabad', joiningDate: '2026-11-15', dob: '1996-03-22', status: 'Active' },
    { id: 'PE999', name: 'Ex-Employee Inactive', role: 'Contractor', department: 'Operations', branch: 'Hyderabad', joiningDate: '2020-11-16', dob: '1990-11-16', status: 'Terminated' }
  ];

  const eligibleEvents = [];

  for (const emp of employees) {
    if (emp.status !== 'Active') {
      console.log(`[Filter] Skipping inactive/terminated employee: ${emp.name} (${emp.id})`);
      continue;
    }

    const joiningParsed = parseDateSafe(emp.joiningDate);
    const dobParsed = parseDateSafe(emp.dob);

    // 1. New Joiner Welcome
    if (joiningParsed && joiningParsed.dateStr === targetParsed.dateStr) {
      eligibleEvents.push({
        type: 'welcome',
        employee: emp,
        idempotencyKey: `${emp.id}_welcome_${targetParsed.dateStr}`,
        title: `Welcome to Prashanth Enterprises! (New Joiner)`,
        badgeText: 'New Joiner',
        message: `Heartiest welcome to ${emp.name} joining as ${emp.role} in ${emp.department} (${emp.branch})!`
      });
    }

    // 2. Birthday
    if (dobParsed && isBirthdayToday(dobParsed, targetParsed, 'FEB_28')) {
      eligibleEvents.push({
        type: 'birthday',
        employee: emp,
        idempotencyKey: `${emp.id}_birthday_${targetParsed.year}`,
        title: `Happy Birthday! 🎂`,
        badgeText: 'Birthday Celebration',
        // PRIVACY ENFORCEMENT: Never display year or age
        message: `Wishing ${emp.name} a very Happy Birthday! May the year ahead bring abundant joy and milestones of excellence.`
      });
    }

    // 3. Work Anniversary
    if (joiningParsed && joiningParsed.month === targetParsed.month && joiningParsed.day === targetParsed.day) {
      const completedYears = calculateCompletedYears(joiningParsed, targetParsed);
      if (completedYears > 0) {
        eligibleEvents.push({
          type: 'anniversary',
          employee: emp,
          idempotencyKey: `${emp.id}_anniversary_${targetParsed.year}_${completedYears}y`,
          title: `Happy ${completedYears} Year Work Anniversary! 🎖️`,
          badgeText: `${completedYears} Years Completed`,
          message: `Warmest congratulations to ${emp.name} on completing ${completedYears} year(s) of dedicated service at Prashanth Enterprises!`
        });
      }
    }
  }

  console.log(`\nFound ${eligibleEvents.length} eligible event(s) for ${targetDateStr}:`);
  for (const ev of eligibleEvents) {
    const posterSvg = generateFallbackSvgPoster(null, ev.employee, {
      badgeTitle: ev.title,
      completedYears: ev.completedYears || 1,
      message: ev.message
    });
    console.log(`✓ [${ev.type.toUpperCase()}] ${ev.employee.name} (${ev.employee.id}) - Key: ${ev.idempotencyKey}`);
    console.log(`   Poster Generated: SVG Data URL (${posterSvg.length} bytes)`);
  }

  return eligibleEvents;
}

// Run if called directly via node celebration-scheduler.js
runServerScheduler();
