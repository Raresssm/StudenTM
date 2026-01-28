"use client";

import { Task } from "@/types/task";
import { Calculator, History } from "lucide-react";
import { useMemo } from "react";
import { parseISO } from "date-fns";
import { getSemesterForDate } from "@/utils/semester";

interface ExamAverageCalculatorProps {
  tasks: Task[];
  selectedDate: string;
  academicYear?: ReturnType<typeof import("@/utils/semester").createAcademicYear>;
}

interface ExamSessionResults {
  sessionId: string;
  sessionName: string;
  year: number;
  exams: Task[];
  average: number | null;
  totalCredits: number;
}

export default function ExamAverageCalculator({
  tasks,
  selectedDate,
  academicYear,
}: ExamAverageCalculatorProps) {
  // Get current exam session ID based on selected date
  const currentExamSessionId = useMemo(() => {
    if (!academicYear) return null;
    const period = getSemesterForDate(selectedDate, academicYear);
    if (period === "exam") {
      return academicYear.examSession.id;
    }
    return null;
  }, [academicYear, selectedDate]);

  // Group exams by exam session
  const examSessions = useMemo(() => {
    if (!academicYear) return [];

    // Get all exam tasks with results and credits
    const allExams = tasks.filter(
      (task) =>
        task.type === "exam" &&
        task.examResult !== undefined &&
        task.credits !== undefined &&
        task.examResult !== null &&
        task.credits !== null
    );

    // Group by examSessionId
    const grouped = new Map<string, Task[]>();
    
    allExams.forEach((exam) => {
      const sessionId = exam.examSessionId || "unknown";
      if (!grouped.has(sessionId)) {
        grouped.set(sessionId, []);
      }
      grouped.get(sessionId)!.push(exam);
    });

    // Convert to array with calculations
    const sessions: ExamSessionResults[] = [];
    
    grouped.forEach((exams, sessionId) => {
      let totalWeightedSum = 0;
      let totalCredits = 0;

      exams.forEach((exam) => {
        const result = exam.examResult!;
        const credits = exam.credits!;
        totalWeightedSum += result * credits;
        totalCredits += credits;
      });

      const average = totalCredits > 0 ? totalWeightedSum / totalCredits : null;
      
      // Determine session name and year
      let sessionName = "Exam Session";
      let year = new Date().getFullYear();
      
      if (sessionId === academicYear.examSession.id) {
        sessionName = `${academicYear.examSession.name} ${academicYear.examSession.year}`;
        year = academicYear.examSession.year;
      } else if (sessionId.startsWith("exam-")) {
        const yearMatch = sessionId.match(/exam-(\d{4})/);
        if (yearMatch) {
          year = parseInt(yearMatch[1]);
          sessionName = `Exam Session ${year}`;
        }
      }

      sessions.push({
        sessionId,
        sessionName,
        year,
        exams,
        average,
        totalCredits,
      });
    });

    // Sort by year descending (most recent first)
    return sessions.sort((a, b) => b.year - a.year);
  }, [tasks, academicYear]);

  // Get current session results (for the selected date)
  const currentSession = useMemo(() => {
    if (!currentExamSessionId) return null;
    return examSessions.find(s => s.sessionId === currentExamSessionId) || null;
  }, [examSessions, currentExamSessionId]);

  // Show current session if available, otherwise show all history
  const sessionsToShow = currentSession ? [currentSession] : examSessions;

  if (sessionsToShow.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <Calculator className="text-indigo-600 dark:text-indigo-400" size={24} />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {currentSession ? "Exam Results Summary" : "Exam Results History"}
        </h2>
        {examSessions.length > 1 && (
          <History className="text-gray-400 dark:text-gray-500" size={20} />
        )}
      </div>

      {sessionsToShow.map((session) => (
        <div key={session.sessionId} className="mb-6 last:mb-0">
          {examSessions.length > 1 && (
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
              {session.sessionName}
            </h3>
          )}

          <div className="space-y-3 mb-4">
            {session.exams.map((exam) => (
              <div
                key={exam.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {exam.title}
                  </span>
                  {exam.examType && (
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                      ({exam.examType.replace("_", " ")})
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-gray-700 dark:text-gray-300">
                    Result: <strong>{exam.examResult}</strong>
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">
                    Credits: <strong>{exam.credits}</strong>
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-700 dark:text-gray-300">Total Credits:</span>
              <span className="font-bold text-gray-900 dark:text-white">
                {session.totalCredits} / 30
              </span>
            </div>
            {session.average !== null && (
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">Weighted Average:</span>
                <span className="font-bold text-lg text-indigo-600 dark:text-indigo-400">
                  {session.average.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
