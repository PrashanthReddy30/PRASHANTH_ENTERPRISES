// Prashanth Enterprises HRMS - Celebration Automation Engine
// Core Server & Client Scheduler:
// - Automatic evaluation at 01:00 AM Asia/Kolkata (IST).
// - Identifies: 1. New Joiners, 2. Birthdays, 3. Work Anniversaries.
// - Idempotency & duplicate prevention using strict event keys.
// - Handles Feb 29 policy, terminated employee exclusions, and catch-up publishing.

import { generateCelebrationPoster, DEFAULT_CELEBRATION_TEMPLATES } from './celebrationImageGenerator.js';

/**
 * Returns date components in Asia/Kolkata (IST) time zone
 */
export function getNowInIST(referenceDate = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  const parts = formatter.formatToParts(referenceDate);
  const partMap = {};
  for (const p of parts) {
    partMap[p.type] = p.value;
  }

  const year = parseInt(partMap.year, 10);
  const month = parseInt(partMap.month, 10); // 1-12
  const day = parseInt(partMap.day, 10);     // 1-31
  const hour = parseInt(partMap.hour, 10);   // 0-23
  const minute = parseInt(partMap.minute, 10);
  const second = parseInt(partMap.second, 10);

  const monthStr = String(month).padStart(2, '0');
  const dayStr = String(day).padStart(2, '0');
  const dateStr = `${year}-${monthStr}-${dayStr}`;

  return {
    year,
    month,
    day,
    hour,
    minute,
    second,
    dateStr,
    isoTimestamp: `${dateStr}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}+05:30`
  };
}

/**
 * Checks if a given year is a leap year
 */
export function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

/**
 * Normalizes any date string (ISO, YYYY-MM-DD, or DD MMM YYYY) into { year, month, day, dateStr }
 */
export function parseDateSafe(rawDate) {
  if (!rawDate) return null;
  if (typeof rawDate === 'object' && rawDate.getFullYear) {
    const y = rawDate.getFullYear();
    const m = rawDate.getMonth() + 1;
    const d = rawDate.getDate();
    return { year: y, month: m, day: d, dateStr: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}` };
  }

  const str = String(rawDate).trim();
  // YYYY-MM-DD format
  const ymdMatch = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (ymdMatch) {
    const y = parseInt(ymdMatch[1], 10);
    const m = parseInt(ymdMatch[2], 10);
    const d = parseInt(ymdMatch[3], 10);
    return { year: y, month: m, day: d, dateStr: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}` };
  }

  // DD MMM YYYY (e.g. 15 Nov 2026 or 12 Jan 2021)
  const dmyMatch = str.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
  if (dmyMatch) {
    const d = parseInt(dmyMatch[1], 10);
    const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const mIdx = monthNames.findIndex(mn => dmyMatch[2].toLowerCase().startsWith(mn));
    const m = mIdx >= 0 ? mIdx + 1 : 1;
    const y = parseInt(dmyMatch[3], 10);
    return { year: y, month: m, day: d, dateStr: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}` };
  }

  // Fallback to Date parser
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = parsed.getMonth() + 1;
    const d = parsed.getDate();
    return { year: y, month: m, day: d, dateStr: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}` };
  }

  return null;
}

/**
 * Calculates completed service years between joining date and target date
 */
export function calculateCompletedYears(joiningDateParsed, targetDateParsed) {
  if (!joiningDateParsed || !targetDateParsed) return 0;
  let years = targetDateParsed.year - joiningDateParsed.year;

  // If anniversary date in target year hasn't occurred yet, subtract 1
  if (
    targetDateParsed.month < joiningDateParsed.month ||
    (targetDateParsed.month === joiningDateParsed.month && targetDateParsed.day < joiningDateParsed.day)
  ) {
    years--;
  }

  return Math.max(0, years);
}

/**
 * Evaluates whether an employee's birthday matches the target date in IST
 */
export function isBirthdayToday(empDobParsed, targetDateParsed, feb29Policy = 'FEB_28') {
  if (!empDobParsed || !targetDateParsed) return false;

  const isFeb29Birth = empDobParsed.month === 2 && empDobParsed.day === 29;
  const isTargetLeap = isLeapYear(targetDateParsed.year);

  if (isFeb29Birth && !isTargetLeap) {
    if (feb29Policy === 'MAR_01') {
      return targetDateParsed.month === 3 && targetDateParsed.day === 1;
    }
    // Default: Celebrate on Feb 28
    return targetDateParsed.month === 2 && targetDateParsed.day === 28;
  }

  return empDobParsed.month === targetDateParsed.month && empDobParsed.day === targetDateParsed.day;
}

/**
 * Formats readable date for celebration posts (e.g. "Today, 28 Nov" or "28 Nov 2026")
 */
function formatPostDate(targetDateParsed) {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const mName = monthNames[targetDateParsed.month - 1] || 'Nov';
  return `${targetDateParsed.day} ${mName} ${targetDateParsed.year}`;
}

/**
 * Core Automation Orchestration Runner
 * Can be executed server-side (Node / Firebase Cloud Functions) or client-side (HRMS Store).
 */
export async function runCelebrationScheduler({
  store,
  targetDateInput = null,
  isManualTrigger = false,
  triggeredBy = 'Automated 01:00 AM Scheduler'
}) {
  const nowIST = getNowInIST();
  const targetDateStr = targetDateInput || nowIST.dateStr;
  const targetDateParsed = parseDateSafe(targetDateStr) || nowIST;

  const data = store.data || store;
  const settings = data.celebrationAutomationSettings || {
    isEnabled: true,
    publishTimeIST: "01:00",
    timeZone: "Asia/Kolkata",
    feb29Policy: "FEB_28",
    newJoinerAutoWelcome: true,
    birthdayAutoWishes: true,
    anniversaryAutoWishes: true,
    milestoneYears: [1, 2, 3, 5, 10, 15, 20],
    catchUpMissedPosts: true
  };

  if (!settings.isEnabled && !isManualTrigger) {
    console.log("[Scheduler] Celebration automation is disabled in settings. Skipping run.");
    return {
      status: 'SKIPPED',
      reason: 'Automation disabled in settings',
      publishedCount: 0
    };
  }

  const employees = (data.employees || []).filter(e => e.status === 'Active');
  const existingPosts = data.employeeEngagementPosts || [];
  const templates = data.celebrationTemplates || DEFAULT_CELEBRATION_TEMPLATES;

  // Active templates lookup
  const welcomeTemplate = templates.find(t => t.category === 'welcome' && t.isActive) || templates.find(t => t.category === 'welcome') || DEFAULT_CELEBRATION_TEMPLATES[0];
  const birthdayTemplate = templates.find(t => t.category === 'birthday' && t.isActive) || templates.find(t => t.category === 'birthday') || DEFAULT_CELEBRATION_TEMPLATES[1];
  const anniversaryTemplate = templates.find(t => t.category === 'anniversary' && t.isActive) || templates.find(t => t.category === 'anniversary') || DEFAULT_CELEBRATION_TEMPLATES[2];

  const eligibleEvents = [];
  const logEntries = [];
  let publishedCount = 0;
  let skippedDuplicates = 0;
  let failedCount = 0;

  for (const emp of employees) {
    // 1. Check New Joiner Welcome
    if (settings.newJoinerAutoWelcome && emp.joiningDate) {
      const joinParsed = parseDateSafe(emp.joiningDate);
      if (joinParsed) {
        const isJoiningToday = joinParsed.dateStr === targetDateParsed.dateStr;
        // Allow catch-up if employee joined recently within 7 days
        const diffDays = Math.round((new Date(targetDateParsed.dateStr) - new Date(joinParsed.dateStr)) / (1000 * 60 * 60 * 24));
        const eligibleCatchUp = settings.catchUpMissedPosts && diffDays >= 0 && diffDays <= 7;

        if (isJoiningToday || eligibleCatchUp) {
          const eventKey = `${emp.id}_welcome_${joinParsed.dateStr}`;
          const isDuplicate = existingPosts.some(p => p.eventKey === eventKey);

          if (isDuplicate) {
            skippedDuplicates++;
          } else {
            eligibleEvents.push({
              category: 'welcome',
              type: 'new_joinee',
              employee: emp,
              eventKey,
              template: welcomeTemplate,
              title: "Welcome to Prashanth Enterprises!",
              subtitle: "New Joiner",
              badge: isJoiningToday ? "Joined Today 🚀" : `Joined ${diffDays}d ago 🚀`,
              dateLabel: isJoiningToday ? "Today" : formatPostDate(joinParsed),
              message: `Welcome to the Prashanth Enterprises family, ${emp.name}! Wishing you a wonderful and fulfilling career journey with us.`
            });
          }
        }
      }
    }

    // 2. Check Birthday
    const rawDob = emp.dob || emp.personal?.dob || emp.dateOfBirth;
    if (settings.birthdayAutoWishes && rawDob) {
      const dobParsed = parseDateSafe(rawDob);
      if (dobParsed && isBirthdayToday(dobParsed, targetDateParsed, settings.feb29Policy)) {
        const eventKey = `${emp.id}_birthday_${targetDateParsed.year}`;
        const isDuplicate = existingPosts.some(p => p.eventKey === eventKey);

        if (isDuplicate) {
          skippedDuplicates++;
        } else {
          eligibleEvents.push({
            category: 'birthday',
            type: 'birthday',
            employee: emp,
            eventKey,
            template: birthdayTemplate,
            title: "Happy Birthday!",
            subtitle: "Birthday Today 🎂",
            badge: "Birthday Today 🎂",
            dateLabel: "Today",
            message: `Wishing you a very Happy Birthday, ${emp.name}! Have an extraordinary year filled with joy, health, and great milestones.`
          });
        }
      }
    }

    // 3. Check Work Anniversary
    if (settings.anniversaryAutoWishes && emp.joiningDate) {
      const joinParsed = parseDateSafe(emp.joiningDate);
      if (joinParsed && joinParsed.month === targetDateParsed.month && joinParsed.day === targetDateParsed.day) {
        const completedYears = calculateCompletedYears(joinParsed, targetDateParsed);
        if (completedYears >= 1) {
          const isMilestone = !settings.milestoneYears || settings.milestoneYears.includes(completedYears);
          if (isMilestone) {
            const eventKey = `${emp.id}_anniversary_${completedYears}yr_${targetDateParsed.year}`;
            const isDuplicate = existingPosts.some(p => p.eventKey === eventKey);

            if (isDuplicate) {
              skippedDuplicates++;
            } else {
              eligibleEvents.push({
                category: 'anniversary',
                type: 'anniversary',
                employee: emp,
                eventKey,
                completedYears,
                template: anniversaryTemplate,
                title: "Celebrating Work Anniversary!",
                subtitle: `${completedYears} Year${completedYears > 1 ? 's' : ''} at Prashanth Enterprises 🎖️`,
                badge: `${completedYears} Years Milestone 🎖️`,
                dateLabel: "Today",
                message: `Congratulations on completing ${completedYears} Year${completedYears > 1 ? 's' : ''} at Prashanth Enterprises, ${emp.name}! Thank you for your leadership, dedication, and impactful contributions.`
              });
            }
          }
        }
      }
    }
  }

  // Process and generate posters for all eligible celebration events
  const newPublishedPosts = [];

  for (const ev of eligibleEvents) {
    try {
      // Generate high-resolution poster using template engine
      const posterUrl = await generateCelebrationPoster(ev.template, ev.employee, {
        completedYears: ev.completedYears || 1,
        message: ev.message,
        badgeTitle: ev.badge,
        badgeSubtitle: ev.subtitle
      });

      const postId = `CEL-${targetDateParsed.year}${String(targetDateParsed.month).padStart(2, '0')}${String(targetDateParsed.day).padStart(2, '0')}-${ev.employee.id}-${ev.category}`;

      const quickWishes = ev.category === 'welcome' ? [
        "🎉 Welcome to Prashanth Enterprises!",
        "👋 So glad to have you on the team!",
        "🚀 Wishing you a wonderful journey here!"
      ] : ev.category === 'birthday' ? [
        "🎂 Wishing you a very Happy Birthday!",
        "🎉 Have a fantastic day and year ahead!",
        "💐 May all your dreams come true!"
      ] : [
        `🎖️ Congratulations on ${ev.completedYears} Years at PE!`,
        "🌟 Thank you for your leadership & dedication!",
        "👏 Here's to many more milestones together!"
      ];

      const newPost = {
        id: postId,
        eventKey: ev.eventKey,
        type: ev.type,
        category: ev.category,
        title: ev.title,
        subtitle: ev.subtitle,
        employeeName: ev.employee.name,
        employeeId: ev.employee.id,
        role: ev.employee.role,
        department: ev.employee.department,
        branch: ev.employee.branch,
        avatar: ev.employee.avatar || ev.employee.personal?.profilePhoto,
        badge: ev.badge,
        date: ev.dateLabel === 'Today' ? `Today, ${targetDateParsed.day} Nov` : ev.dateLabel,
        targetDate: targetDateStr,
        publishedAt: nowIST.isoTimestamp,
        publishedTime: nowIST.isoTimestamp,
        status: 'PUBLISHED',
        templateId: ev.template.id,
        posterUrl,
        quickWishes,
        wishes: [
          {
            id: `w-${Date.now()}-auto`,
            from: "Pooja Hegde",
            role: "VP People Operations",
            avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100",
            message: ev.category === 'welcome' 
              ? `A very warm welcome to Prashanth Enterprises, ${ev.employee.name}! We're thrilled to have you with us! 🚀`
              : ev.category === 'birthday'
              ? `Wishing you a wonderful Birthday, ${ev.employee.name}! Have a joyful celebration! 🎂✨`
              : `Heartiest congratulations ${ev.employee.name} on completing ${ev.completedYears} Year${ev.completedYears > 1 ? 's' : ''}! 🎖️`,
            time: "Just now",
            likes: 1
          }
        ]
      };

      newPublishedPosts.push(newPost);
      publishedCount++;
      logEntries.push(`Published ${ev.category} for ${ev.employee.name} (${ev.employee.id})`);
    } catch (err) {
      console.error(`[Scheduler Error] Failed generating poster for ${ev.employee.name}:`, err);
      failedCount++;
      logEntries.push(`Failed ${ev.category} for ${ev.employee.name}: ${err.message}`);
    }
  }

  // Update store records atomically
  if (store.publishCelebrationPosts) {
    store.publishCelebrationPosts(newPublishedPosts);
  } else if (data.employeeEngagementPosts) {
    data.employeeEngagementPosts = [...newPublishedPosts, ...data.employeeEngagementPosts];
  }

  // Log execution in celebrationProcessingLogs
  const logRecord = {
    id: `LOG-${Date.now()}`,
    timestamp: nowIST.isoTimestamp,
    executionType: isManualTrigger ? 'MANUAL_TRIGGER' : 'SCHEDULED_AUTOMATION',
    timeZone: 'Asia/Kolkata',
    targetDate: targetDateStr,
    status: failedCount > 0 ? (publishedCount > 0 ? 'PARTIAL_SUCCESS' : 'FAILED') : 'SUCCESS',
    evaluatedCount: employees.length,
    publishedCount,
    skippedDuplicates,
    failedCount,
    details: logEntries.join('; ') || 'No eligible new celebrations found today.',
    triggeredBy
  };

  if (store.addCelebrationLog) {
    store.addCelebrationLog(logRecord);
  } else if (data.celebrationProcessingLogs) {
    data.celebrationProcessingLogs.unshift(logRecord);
  }

  // Update automation settings metadata
  if (data.celebrationAutomationSettings) {
    data.celebrationAutomationSettings.lastRunTimestamp = nowIST.isoTimestamp;
    data.celebrationAutomationSettings.lastRunStatus = logRecord.status;
    data.celebrationAutomationSettings.lastRunSummary = `Evaluated ${employees.length} employees. Published ${publishedCount} posts (${skippedDuplicates} duplicates prevented).`;

    // Compute next run: Tomorrow at 01:00 AM IST
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowIST = getNowInIST(tomorrow);
    data.celebrationAutomationSettings.nextRunTimestamp = `${tomorrowIST.dateStr}T01:00:00+05:30`;
  }

  return {
    status: logRecord.status,
    evaluatedCount: employees.length,
    publishedCount,
    skippedDuplicates,
    failedCount,
    log: logRecord
  };
}

/**
 * Initializes the background 01:00 AM IST scheduler loop
 */
let schedulerIntervalId = null;

export function initCelebrationBackgroundScheduler(store) {
  if (schedulerIntervalId) {
    clearInterval(schedulerIntervalId);
  }

  console.log("[Scheduler] Initializing Prashanth Enterprises Celebration Scheduler (01:00 AM Asia/Kolkata)...");

  // Check immediately on load if today's 01:00 AM run is due
  const checkAndRunDueCelebrations = () => {
    try {
      const nowIST = getNowInIST();
      const settings = store.data?.celebrationAutomationSettings;
      if (!settings || !settings.isEnabled) return;

      const lastRun = settings.lastRunTimestamp;
      const lastRunDateStr = lastRun ? lastRun.split('T')[0] : null;

      // If today is different from last run and current hour is >= 1 AM IST, execute!
      if (lastRunDateStr !== nowIST.dateStr && nowIST.hour >= 1) {
        console.log(`[Scheduler] 01:00 AM IST passed for ${nowIST.dateStr}. Running automated celebrations...`);
        runCelebrationScheduler({
          store,
          targetDateInput: nowIST.dateStr,
          isManualTrigger: false,
          triggeredBy: "01:00 AM IST Scheduled Engine"
        });
      }
    } catch (err) {
      console.warn("[Scheduler Check Warning]", err.message);
    }
  };

  // Run on startup
  checkAndRunDueCelebrations();

  // Poll every 60 seconds to detect 01:00 AM IST arrival
  schedulerIntervalId = setInterval(checkAndRunDueCelebrations, 60000);

  return () => {
    if (schedulerIntervalId) {
      clearInterval(schedulerIntervalId);
      schedulerIntervalId = null;
    }
  };
}
