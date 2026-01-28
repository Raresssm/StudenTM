export interface Semester {
  id: string;
  name: string; // "First Semester" or "Second Semester"
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  weekCount: number; // Should be 14
  year: number; // Academic year (e.g., 2024)
}

export interface AcademicYear {
  firstSemester: Semester;
  secondSemester: Semester;
  intersemestrialBreakStart: string;
  intersemestrialBreakEnd: string;
  year: number;
}
