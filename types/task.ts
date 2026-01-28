export type TaskType = "course" | "personal" | "exam";
export type ActivityType = "course" | "seminar" | "laboratory" | "project";
export type ExamType = "exam" | "oral_exam" | "written_exam" | "practical_exam";
export type Frequency = "weekly" | "biweekly";

export interface Task {
  id: string;
  title: string;
  description?: string;
  type: TaskType;
  date: string; // ISO date string
  completed: boolean;
  notes?: string; // Notes for the task
  startTime?: string; // Start time (HH:mm format) for all tasks
  endTime?: string; // End time (HH:mm format) for all tasks
  // For course tasks
  courseName?: string; // Deprecated - use title instead
  // For semester-based course activities
  activityType?: ActivityType; // course/seminar/laboratory/project
  frequency?: Frequency; // weekly/biweekly
  semesterId?: string; // Which semester this course belongs to
  startDate?: string; // Start date for semester courses
  endDate?: string; // End date for semester courses (auto-set to semester end)
  dayOfWeek?: number; // 0 = Sunday, 1 = Monday, etc.
  // For exam tasks
  examType?: ExamType; // exam/oral_exam/written_exam/practical_exam
  examSessionId?: string; // Which exam session this exam belongs to
  examResult?: number; // Exam result/grade (0-10 or 0-100 scale)
  credits?: number; // Number of credits for the exam (total should be 30)
}
