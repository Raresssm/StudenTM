"use client";

import { useState, useEffect } from "react";
import { Task, TaskType, ActivityType, Frequency, ExamType } from "@/types/task";
import { X } from "lucide-react";
import { getDay, parseISO } from "date-fns";

interface TaskModalProps {
  task: Task | null;
  selectedDate: string;
  onSave: (task: Omit<Task, "id">) => void;
  onClose: () => void;
  academicYear?: ReturnType<typeof import("@/utils/semester").createAcademicYear>;
}

export default function TaskModal({
  task,
  selectedDate,
  onSave,
  onClose,
  academicYear,
}: TaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<TaskType>("personal");
  const [date, setDate] = useState(selectedDate);
  const [completed, setCompleted] = useState(false);
  const [notes, setNotes] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  
  // Semester course fields
  const [isSemesterCourse, setIsSemesterCourse] = useState(false);
  const [activityType, setActivityType] = useState<ActivityType>("course");
  const [frequency, setFrequency] = useState<Frequency>("weekly");
  const [semesterId, setSemesterId] = useState<string>("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState(""); // Auto-set based on semester
  
  // Exam fields
  const [examType, setExamType] = useState<ExamType>("exam");
  const [examResult, setExamResult] = useState<number | undefined>(undefined);
  const [credits, setCredits] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setType(task.type);
      setDate(task.date);
      setCompleted(task.completed);
      setNotes(task.notes || "");
      setStartTime(task.startTime || "");
      setEndTime(task.endTime || "");
      setIsSemesterCourse(!!task.semesterId);
      setActivityType(task.activityType || "course");
      setFrequency(task.frequency || "weekly");
      setSemesterId(task.semesterId || "");
      setStartDate(task.startDate || "");
      setEndDate(task.endDate || "");
      setExamType(task.examType || "exam");
      setExamResult(task.examResult);
      setCredits(task.credits);
    } else {
      // Reset form for new task
      setTitle("");
      setDescription("");
      setType("personal");
      setDate(selectedDate);
      setCompleted(false);
      setNotes("");
      setStartTime("");
      setEndTime("");
      setIsSemesterCourse(false);
      setActivityType("course");
      setFrequency("weekly");
      setSemesterId("");
      setStartDate("");
      setEndDate("");
      setExamType("exam");
      setExamResult(undefined);
      setCredits(undefined);
    }
  }, [task, selectedDate]);

  // Auto-enable semester course when type is "course"
  useEffect(() => {
    if (type === "course" && !task) {
      setIsSemesterCourse(true);
    } else if (type !== "course") {
      setIsSemesterCourse(false);
    }
  }, [type, task]);

  useEffect(() => {
    // When semester course is enabled and academic year is available, set defaults
    if (isSemesterCourse && academicYear && !task) {
      const selectedDateObj = parseISO(selectedDate);
      const firstStart = parseISO(academicYear.firstSemester.startDate);
      const secondStart = parseISO(academicYear.secondSemester.startDate);
      
      // Determine which semester based on selected date
      if (selectedDateObj >= firstStart && selectedDateObj <= parseISO(academicYear.firstSemester.endDate)) {
        setSemesterId(academicYear.firstSemester.id);
        setStartDate(academicYear.firstSemester.startDate);
        setEndDate(academicYear.firstSemester.endDate);
      } else if (selectedDateObj >= secondStart) {
        setSemesterId(academicYear.secondSemester.id);
        setStartDate(academicYear.secondSemester.startDate);
        setEndDate(academicYear.secondSemester.endDate);
      }
    }
  }, [isSemesterCourse, academicYear, selectedDate, task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const dayOfWeek = isSemesterCourse ? getDay(parseISO(startDate || date)) : undefined;

    // Determine exam session ID if it's an exam
    let examSessionId: string | undefined = undefined;
    if (type === "exam" && academicYear) {
      const selectedDateObj = parseISO(date);
      const examStart = parseISO(academicYear.examSession.startDate);
      const examEnd = parseISO(academicYear.examSession.endDate);
      if (selectedDateObj >= examStart && selectedDateObj <= examEnd) {
        examSessionId = academicYear.examSession.id;
      }
    }

    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      type,
      date,
      courseName: undefined, // Deprecated - use title instead
      completed,
      activityType: type === "course" && isSemesterCourse ? activityType : undefined,
      frequency: type === "course" && isSemesterCourse ? frequency : undefined,
      semesterId: type === "course" && isSemesterCourse ? semesterId : undefined,
      startDate: type === "course" && isSemesterCourse ? startDate : undefined,
      endDate: type === "course" && isSemesterCourse ? endDate : undefined,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      notes: notes || undefined,
      examResult: type === "exam" ? examResult : undefined,
      credits: type === "exam" ? credits : undefined,
      dayOfWeek,
      examType: type === "exam" ? examType : undefined,
      examSessionId,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md my-8">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {task ? "Edit Task" : "New Task"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="text-gray-600 dark:text-gray-400" size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Enter task title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
              placeholder="Add task description (optional)"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {type === "personal" && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="completed"
                checked={completed}
                onChange={(e) => setCompleted(e.target.checked)}
                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 rounded"
              />
              <label htmlFor="completed" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Mark as completed
              </label>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Task Type
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setType("personal");
                  setIsSemesterCourse(false);
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  type === "personal"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                Personal
              </button>
              <button
                type="button"
                onClick={() => {
                  setType("course");
                  setIsSemesterCourse(true);
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  type === "course"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                Course
              </button>
              <button
                type="button"
                onClick={() => {
                  setType("exam");
                  setIsSemesterCourse(false);
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  type === "exam"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                Exam
              </button>
            </div>
          </div>

          {type === "exam" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Exam Type
                </label>
                <select
                  value={examType}
                  onChange={(e) => setExamType(e.target.value as ExamType)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="exam">Exam</option>
                  <option value="oral_exam">Oral Exam</option>
                  <option value="written_exam">Written Exam</option>
                  <option value="practical_exam">Practical Exam</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Exam Result (0-10)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={examResult ?? ""}
                    onChange={(e) => setExamResult(e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g., 8.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Credits
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={credits ?? ""}
                    onChange={(e) => setCredits(e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g., 5"
                  />
                </div>
              </div>
            </>
          )}

          {type === "course" && academicYear && (
            <>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    This course will be scheduled for the entire semester
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Activity Type
                    </label>
                    <select
                      value={activityType}
                      onChange={(e) => setActivityType(e.target.value as ActivityType)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="course">Course</option>
                      <option value="seminar">Seminar</option>
                      <option value="laboratory">Laboratory</option>
                      <option value="project">Project</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Frequency
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          value="weekly"
                          checked={frequency === "weekly"}
                          onChange={(e) => setFrequency(e.target.value as Frequency)}
                          className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-gray-700 dark:text-gray-300">Weekly</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          value="biweekly"
                          checked={frequency === "biweekly"}
                          onChange={(e) => setFrequency(e.target.value as Frequency)}
                          className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-gray-700 dark:text-gray-300">Biweekly</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Semester
                    </label>
                    <select
                      value={semesterId}
                      onChange={(e) => {
                        setSemesterId(e.target.value);
                        if (e.target.value === academicYear.firstSemester.id) {
                          setStartDate(academicYear.firstSemester.startDate);
                          setEndDate(academicYear.firstSemester.endDate);
                        } else if (e.target.value === academicYear.secondSemester.id) {
                          setStartDate(academicYear.secondSemester.startDate);
                          setEndDate(academicYear.secondSemester.endDate);
                        }
                      }}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    >
                      <option value="">Select semester</option>
                      <option value={academicYear.firstSemester.id}>
                        {academicYear.firstSemester.name} ({academicYear.firstSemester.startDate} - {academicYear.firstSemester.endDate})
                      </option>
                      <option value={academicYear.secondSemester.id}>
                        {academicYear.secondSemester.name} ({academicYear.secondSemester.startDate} - {academicYear.secondSemester.endDate})
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Start Date (first occurrence)
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Course will automatically end at the end of the semester (week 14)
                    </p>
                  </div>
            </>
          )}

          {!isSemesterCourse && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required={!isSemesterCourse}
              />
            </div>
          )}

          {task && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="completed"
                checked={completed}
                onChange={(e) => setCompleted(e.target.checked)}
                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 rounded"
              />
              <label
                htmlFor="completed"
                className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
              >
                Mark as completed
              </label>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
            >
              {task ? "Update" : "Create"} Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
