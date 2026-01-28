import { addDays, addWeeks, startOfWeek, parseISO, format, isWeekend, getDay } from "date-fns";

/**
 * Gets the next Monday if the date falls on a weekend, otherwise returns the date
 */
function adjustToMonday(date: Date): Date {
  const dayOfWeek = getDay(date); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  
  if (dayOfWeek === 0) {
    // Sunday - move to next Monday
    return addDays(date, 1);
  } else if (dayOfWeek === 6) {
    // Saturday - move to next Monday
    return addDays(date, 2);
  }
  // Weekday - return as is
  return date;
}

/**
 * Gets the next Monday after a given date
 */
function getNextMonday(date: Date): Date {
  const dayOfWeek = getDay(date);
  if (dayOfWeek === 0) {
    // Sunday - next day is Monday
    return addDays(date, 1);
  } else {
    // Any other day - find next Monday
    const daysUntilMonday = (8 - dayOfWeek) % 7 || 7;
    return addDays(date, daysUntilMonday);
  }
}

/**
 * Calculates the first semester dates
 * Starts October 2nd (or next Monday if weekend) - week counting starts here
 * Continues until Christmas break
 * Resumes 2nd week of January (Monday) + 2 more weeks
 * Total of 14 weeks
 */
export function calculateFirstSemester(year: number): { startDate: Date; endDate: Date; breakStart: Date; breakEnd: Date } {
  // Start date: October 2nd, adjusted to Monday if weekend
  const october2 = new Date(year, 9, 2); // Month is 0-indexed
  const dayOfWeek = getDay(october2);
  
  let startMonday: Date;
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    // Weekend - move to next Monday
    startMonday = adjustToMonday(october2);
  } else {
    // Weekday - start on October 2nd itself
    // Week counting starts from the Monday of the week containing October 2nd
    startMonday = startOfWeek(october2, { weekStartsOn: 1 });
  }
  
  // The actual semester start date (for activities) is October 2nd or next Monday
  const semesterStartDate = dayOfWeek === 0 || dayOfWeek === 6 ? startMonday : october2;

  // Christmas is December 25th
  const christmas = new Date(year, 11, 25);
  const christmasDayOfWeek = getDay(christmas);
  
  // Determine when Christmas break starts
  let christmasBreakStartMonday: Date;
  if (christmasDayOfWeek === 5) {
    // Christmas is on Friday - break starts 2 days before (Wednesday)
    // Get the Monday of that week
    const breakStartWednesday = addDays(christmas, -2);
    christmasBreakStartMonday = startOfWeek(breakStartWednesday, { weekStartsOn: 1 });
  } else {
    // Break starts in the week of Christmas (Monday of that week)
    christmasBreakStartMonday = startOfWeek(christmas, { weekStartsOn: 1 });
  }
  
  // Last week before break is the week before Christmas break week
  const lastWeekBeforeBreakMonday = addWeeks(christmasBreakStartMonday, -1);
  const lastWeekBeforeBreakSunday = addDays(lastWeekBeforeBreakMonday, 6);

  // Break ends before 2nd week of January
  const january1 = new Date(year + 1, 0, 1);
  const firstWeekOfYearMonday = startOfWeek(january1, { weekStartsOn: 1 });
  const secondWeekOfYearMonday = addWeeks(firstWeekOfYearMonday, 1); // Monday of 2nd week
  const breakEndSunday = addDays(secondWeekOfYearMonday, -1); // Sunday before 2nd week starts (end of break)
  
  // After break: 2nd week of January (Monday) is week 13, then week 14
  // We need exactly 2 weeks: week 13 and week 14
  // Week 13 Monday = secondWeekOfYearMonday
  // Week 14 Monday = secondWeekOfYearMonday + 1 week
  // Week 14 Sunday = end of semester
  const week14Monday = addWeeks(secondWeekOfYearMonday, 1); // Monday of week 14
  const lastWeekSunday = addDays(week14Monday, 6); // Sunday of week 14 (end of semester)

  // Total: weeks before break + 2 weeks after break = 14 weeks
  // Break is NOT included in the 14 weeks

  // Ensure startMonday is actually a Monday (normalize to be safe)
  const normalizedStartMonday = startOfWeek(startMonday, { weekStartsOn: 1 });
  
  // The semester start date for date range checking should be the Monday of the week
  // (for week counting), but activities can start on October 2nd itself
  return { 
    startDate: normalizedStartMonday, // Use Monday for date range to include the full week
    endDate: lastWeekSunday,
    breakStart: christmasBreakStartMonday,
    breakEnd: breakEndSunday
  };
}

/**
 * Calculates the exam session
 * Starts on the Monday after first semester ends (which ends on Sunday)
 * 3 weeks total
 */
export function calculateExamSession(
  firstSemesterEnd: Date
): { startDate: Date; endDate: Date } {
  // First semester ends on Sunday, so next Monday is the start
  const startDate = getNextMonday(firstSemesterEnd);
  // 3 weeks: ends on Sunday of the third week
  const endDate = addDays(startDate, 20); // End of third week (Sunday)

  return { startDate, endDate };
}

/**
 * Calculates the intersemestrial break
 * Starts on the Monday after exam session ends (which ends on Sunday)
 * 1 week break
 */
export function calculateIntersemestrialBreak(
  examSessionEnd: Date
): { startDate: Date; endDate: Date } {
  // Exam session ends on Sunday, so next Monday is the start
  const startDate = getNextMonday(examSessionEnd);
  const endDate = addDays(startDate, 6); // End of that week (Sunday)

  return { startDate, endDate };
}

/**
 * Calculates the second semester dates
 * Starts on the Monday after break ends (which ends on Sunday)
 * Total of 14 weeks
 */
export function calculateSecondSemester(
  intersemestrialBreakEnd: Date
): { startDate: Date; endDate: Date } {
  // Break ends on Sunday, so next Monday is the start
  const startDate = getNextMonday(intersemestrialBreakEnd);
  // 14 weeks: weeks 1-14
  const endDate = addDays(addWeeks(startDate, 13), 6); // End of week 14 (Sunday)

  return { startDate, endDate };
}

/**
 * Creates an academic year with both semesters, exam session, and break
 */
export function createAcademicYear(year: number) {
  const firstSemester = calculateFirstSemester(year);
  const examSession = calculateExamSession(firstSemester.endDate);
  const breakPeriod = calculateIntersemestrialBreak(examSession.endDate);
  const secondSemester = calculateSecondSemester(breakPeriod.endDate);

  return {
    firstSemester: {
      id: `first-${year}`,
      name: "First Semester",
      startDate: format(firstSemester.startDate, "yyyy-MM-dd"),
      endDate: format(firstSemester.endDate, "yyyy-MM-dd"),
      breakStart: format(firstSemester.breakStart, "yyyy-MM-dd"),
      breakEnd: format(firstSemester.breakEnd, "yyyy-MM-dd"),
      weekCount: 14,
      year,
    },
    examSession: {
      id: `exam-${year}`,
      name: "Exam Session",
      startDate: format(examSession.startDate, "yyyy-MM-dd"),
      endDate: format(examSession.endDate, "yyyy-MM-dd"),
      weekCount: 3,
      year,
    },
    secondSemester: {
      id: `second-${year}`,
      name: "Second Semester",
      startDate: format(secondSemester.startDate, "yyyy-MM-dd"),
      endDate: format(secondSemester.endDate, "yyyy-MM-dd"),
      weekCount: 14,
      year,
    },
    intersemestrialBreakStart: format(breakPeriod.startDate, "yyyy-MM-dd"),
    intersemestrialBreakEnd: format(breakPeriod.endDate, "yyyy-MM-dd"),
    year,
  };
}

/**
 * Gets which semester/period a date belongs to
 */
export function getSemesterForDate(
  date: string,
  academicYear: ReturnType<typeof createAcademicYear>
): "first" | "exam" | "break" | "second" | null {
  const dateObj = parseISO(date);
  const firstStart = parseISO(academicYear.firstSemester.startDate);
  const firstBreakStart = parseISO(academicYear.firstSemester.breakStart);
  const firstBreakEnd = parseISO(academicYear.firstSemester.breakEnd);
  const firstEnd = parseISO(academicYear.firstSemester.endDate);
  const examStart = parseISO(academicYear.examSession.startDate);
  const examEnd = parseISO(academicYear.examSession.endDate);
  const breakStart = parseISO(academicYear.intersemestrialBreakStart);
  const breakEnd = parseISO(academicYear.intersemestrialBreakEnd);
  const secondStart = parseISO(academicYear.secondSemester.startDate);
  const secondEnd = parseISO(academicYear.secondSemester.endDate);

  // Check if date is in winter break (between first semester parts)
  if (dateObj >= firstBreakStart && dateObj <= firstBreakEnd) {
    return "break";
  }
  
  // Check if date is in first semester (before break or after break)
  // Note: firstEnd is the Sunday of week 14, so dates <= firstEnd are in the semester
  // Dates > firstEnd (Monday after) should be in exam session
  if ((dateObj >= firstStart && dateObj < firstBreakStart) || 
      (dateObj > firstBreakEnd && dateObj <= firstEnd)) {
    return "first";
  } else if (dateObj >= examStart && dateObj <= examEnd) {
    return "exam";
  } else if (dateObj >= breakStart && dateObj <= breakEnd) {
    return "break";
  } else if (dateObj >= secondStart && dateObj <= secondEnd) {
    return "second";
  }

  return null;
}

/**
 * Gets the week number within a semester (1-14) or exam session (1)
 * Weeks start on Monday
 * For first semester, excludes break weeks from the count
 */
export function getWeekNumberInSemester(
  date: string,
  semesterStart: string,
  academicYear?: ReturnType<typeof createAcademicYear>
): number {
  const dateObj = parseISO(date);
  const startObj = parseISO(semesterStart);
  // Ensure semester start is normalized to Monday (it should already be, but normalize to be safe)
  const startOfSemesterWeek = startOfWeek(startObj, { weekStartsOn: 1 }); // Monday
  // Get the Monday of the week containing the date we're checking
  const startOfDateWeek = startOfWeek(dateObj, { weekStartsOn: 1 }); // Monday
  
  // If date is before semester start, return 0 (shouldn't happen, but safety check)
  if (startOfDateWeek < startOfSemesterWeek) {
    return 0;
  }

  // If this is the first semester and there's a break, exclude break weeks
  if (academicYear && semesterStart === academicYear.firstSemester.startDate) {
    const breakStart = parseISO(academicYear.firstSemester.breakStart);
    const breakEnd = parseISO(academicYear.firstSemester.breakEnd);
    const breakStartWeek = startOfWeek(breakStart, { weekStartsOn: 1 });
    const breakEndWeek = startOfWeek(breakEnd, { weekStartsOn: 1 });
    // breakEnd is a Sunday, so the Monday after break ends is the next day
    const resumeWeek = addDays(breakEnd, 1); // Monday after break ends (breakEnd is Sunday)
    
    // Count weeks before break (from semester start Monday to break start Monday)
    // This gives us the number of complete weeks before break
    const weeksBeforeBreak = Math.floor(
      (breakStartWeek.getTime() - startOfSemesterWeek.getTime()) / (7 * 24 * 60 * 60 * 1000)
    );
    
    // If date is during break, return 0 (handled by caller)
    if (startOfDateWeek >= breakStartWeek && startOfDateWeek <= breakEndWeek) {
      return 0; // Break week - not counted
    }
    
    // If date is after break, calculate: weeks before break + weeks after break
    // Normalize resumeWeek to Monday to ensure correct calculation
    const resumeWeekMonday = startOfWeek(resumeWeek, { weekStartsOn: 1 });
    if (startOfDateWeek >= resumeWeekMonday) {
      // Count how many weeks after break ends (from resume week Monday)
      // The resume week itself is week (weeksBeforeBreak + 1)
      const weeksAfterBreak = Math.floor(
        (startOfDateWeek.getTime() - resumeWeekMonday.getTime()) / (7 * 24 * 60 * 60 * 1000)
      );
      // Week number = weeks before break + weeks after break + 1
      // Example: 12 weeks before break, resume week (0 weeks after) = week 13, next week (1 week after) = week 14
      const weekNumber = weeksBeforeBreak + weeksAfterBreak + 1;
      // Cap at exactly 14 weeks - no more, no less
      // If we've exceeded 14, it means we're past the semester end
      if (weekNumber > 14) return 14;
      return weekNumber;
    }
    
    // Date is before break - count from semester start
    const weekNumber = Math.floor(
      (startOfDateWeek.getTime() - startOfSemesterWeek.getTime()) / (7 * 24 * 60 * 60 * 1000)
    ) + 1;
    // Ensure week number is valid (1 to weeksBeforeBreak)
    // If weekNumber < 1, it means date is before semester start - return 0 (not 1!)
    if (weekNumber < 1) return 0;
    if (weekNumber > weeksBeforeBreak) return weeksBeforeBreak;
    return weekNumber;
  }

  // For other semesters/exam sessions, simple calculation
  const diffTime = startOfDateWeek.getTime() - startOfSemesterWeek.getTime();
  const diffWeeks = Math.floor(diffTime / (7 * 24 * 60 * 60 * 1000));
  const weekNumber = diffWeeks + 1;
  
  // Cap at max weeks for the period
  if (academicYear) {
    if (semesterStart === academicYear.secondSemester.startDate) {
      return Math.min(weekNumber, 14); // Second semester: max 14 weeks
    } else if (semesterStart === academicYear.examSession.startDate) {
      return Math.min(weekNumber, 3); // Exam session: max 3 weeks
    }
  }

  return weekNumber;
}

/**
 * Gets the week number for any date in the academic year
 */
export function getWeekNumberForDate(
  date: string,
  academicYear: ReturnType<typeof createAcademicYear>
): { period: string; week: number } | null {
  const period = getSemesterForDate(date, academicYear);
  
  // If date is outside academic year, return null (not week 1!)
  if (!period) return null;

  let week: number;
  let periodName: string;

  if (period === "first") {
    week = getWeekNumberInSemester(date, academicYear.firstSemester.startDate, academicYear);
    // If week is 0, it means date is before semester start - return null
    if (week === 0) return null;
    periodName = academicYear.firstSemester.name;
  } else if (period === "exam") {
    week = getWeekNumberInSemester(date, academicYear.examSession.startDate);
    // If week is 0, it means date is before exam session start - return null
    if (week === 0) return null;
    periodName = academicYear.examSession.name;
  } else if (period === "second") {
    week = getWeekNumberInSemester(date, academicYear.secondSemester.startDate);
    // If week is 0, it means date is before semester start - return null
    if (week === 0) return null;
    periodName = academicYear.secondSemester.name;
  } else {
    return { period: "Break", week: 0 };
  }

  return { period: periodName, week };
}
