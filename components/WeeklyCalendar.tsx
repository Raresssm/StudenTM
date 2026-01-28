"use client";

import { Task } from "@/types/task";
import { format, startOfWeek, addDays, isSameDay, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight, BookOpen, User, Trash2, CheckCircle2, Circle, FlaskConical, Presentation, FolderKanban, Calendar, StickyNote } from "lucide-react";
import { useMemo } from "react";
import { getTasksForDateRange } from "@/utils/tasks";
import { getWeekNumberForDate } from "@/utils/semester";

interface WeeklyCalendarProps {
  tasks: Task[];
  selectedDate: string;
  onDateSelect: (date: string) => void;
  onTaskClick: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
  onTaskToggleComplete: (taskId: string) => void;
  onTaskNotes?: (task: Task) => void;
  academicYear?: ReturnType<typeof import("@/utils/semester").createAcademicYear>;
}

export default function WeeklyCalendar({
  tasks,
  selectedDate,
  onDateSelect,
  onTaskClick,
  onTaskDelete,
  onTaskToggleComplete,
  onTaskNotes,
  academicYear,
}: WeeklyCalendarProps) {
  const selectedDateObj = parseISO(selectedDate);
  const currentWeekStart = startOfWeek(selectedDateObj, { weekStartsOn: 1 }); // Monday start
  const weekDays = Array.from({ length: 7 }, (_, i) =>
    addDays(currentWeekStart, i)
  );

  // Generate task instances for the current week
  const weekTasks = useMemo(() => {
    if (weekDays.length === 0) return [];
    const weekStart = weekDays[0];
    const weekEnd = weekDays[6];
    return getTasksForDateRange(tasks, weekStart, weekEnd);
  }, [tasks, weekDays]);

  const getTasksForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return weekTasks.filter((task) => task.date === dateStr);
  };

  const getActivityIcon = (activityType?: string) => {
    switch (activityType) {
      case "seminar":
        return <Presentation className="text-blue-600 dark:text-blue-400 flex-shrink-0" size={16} />;
      case "laboratory":
        return <FlaskConical className="text-blue-600 dark:text-blue-400 flex-shrink-0" size={16} />;
      case "project":
        return <FolderKanban className="text-blue-600 dark:text-blue-400 flex-shrink-0" size={16} />;
      case "course":
      default:
        return <BookOpen className="text-blue-600 dark:text-blue-400 flex-shrink-0" size={16} />;
    }
  };

  const getActivityLabel = (task: Task) => {
    if (task.activityType) {
      return task.activityType.charAt(0).toUpperCase() + task.activityType.slice(1);
    }
    return task.type === "course" ? "Course" : "Personal";
  };

  const goToPreviousWeek = () => {
    const newDate = addDays(selectedDateObj, -7);
    onDateSelect(format(newDate, "yyyy-MM-dd"));
  };

  const goToNextWeek = () => {
    const newDate = addDays(selectedDateObj, 7);
    onDateSelect(format(newDate, "yyyy-MM-dd"));
  };

  const goToToday = () => {
    const today = new Date();
    onDateSelect(format(today, "yyyy-MM-dd"));
  };

  const goToPreviousDay = () => {
    const newDate = addDays(selectedDateObj, -1);
    onDateSelect(format(newDate, "yyyy-MM-dd"));
  };

  const goToNextDay = () => {
    const newDate = addDays(selectedDateObj, 1);
    onDateSelect(format(newDate, "yyyy-MM-dd"));
  };

  const isToday = (date: Date) => {
    return isSameDay(date, new Date());
  };

  const getWeekInfo = () => {
    if (!academicYear) return null;
    const weekStartStr = format(weekDays[0], "yyyy-MM-dd");
    return getWeekNumberForDate(weekStartStr, academicYear);
  };

  const weekInfo = getWeekInfo();
  const dayTasks = getTasksForDate(selectedDateObj);
  const isDayToday = isToday(selectedDateObj);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      {/* Week Slider at Top */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-700 dark:to-purple-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={goToPreviousWeek}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <ChevronLeft className="text-white" size={24} />
          </button>
          
          <div className="flex-1 text-center">
            <div className="flex items-center justify-center gap-3 mb-1">
              <Calendar className="text-white" size={20} />
              {weekInfo ? (
                weekInfo.week > 0 ? (
                  <span className="px-3 py-1 bg-white/20 rounded-md font-bold text-white">
                    Week {weekInfo.week}
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-white/20 rounded-md font-bold text-white">
                    {weekInfo.period}
                  </span>
                )
              ) : (
                <span className="px-3 py-1 bg-white/20 rounded-md font-bold text-white opacity-50">
                  Outside Academic Year
                </span>
              )}
              <h3 className="text-white text-lg font-semibold">
                {format(weekDays[0], "MMM d")} - {format(weekDays[6], "MMM d, yyyy")}
              </h3>
            </div>
            {weekInfo && weekInfo.week > 0 && (
              <div className="text-white/90 text-sm">
                {weekInfo.period}
              </div>
            )}
          </div>

          <button
            onClick={goToNextWeek}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <ChevronRight className="text-white" size={24} />
          </button>
        </div>

        {/* Quick day navigation */}
        <div className="flex items-center justify-center gap-1 mt-4">
          {weekDays.map((day, index) => {
            const dayStr = format(day, "yyyy-MM-dd");
            const isSelected = dayStr === selectedDate;
            const isDayToday = isToday(day);
            const dayTasksCount = getTasksForDate(day).length;

            return (
              <button
                key={index}
                onClick={() => onDateSelect(dayStr)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isSelected
                    ? "bg-white text-indigo-600 dark:text-indigo-600 shadow-md scale-105"
                    : "text-white/80 hover:bg-white/20 hover:text-white"
                }`}
              >
                <div className="text-xs opacity-75">{format(day, "EEE")}</div>
                <div className="flex items-center gap-1">
                  <span>{format(day, "d")}</span>
                  {isDayToday && !isSelected && (
                    <span className="w-1.5 h-1.5 bg-white rounded-full" />
                  )}
                  {dayTasksCount > 0 && (
                    <span className={`text-xs ${isSelected ? "text-indigo-600" : "text-white/60"}`}>
                      ({dayTasksCount})
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Day Display */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                {format(selectedDateObj, "EEEE, MMMM d")}
              </h2>
              {isDayToday && (
                <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-medium">
                  Today
                </span>
              )}
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              {format(selectedDateObj, "yyyy")}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={goToPreviousDay}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronLeft className="text-gray-600 dark:text-gray-400" size={20} />
            </button>
            <button
              onClick={goToToday}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm transition-colors"
            >
              Today
            </button>
            <button
              onClick={goToNextDay}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronRight className="text-gray-600 dark:text-gray-400" size={20} />
            </button>
          </div>
        </div>

        {/* Tasks for Current Day */}
        <div className="space-y-3">
          {dayTasks.length === 0 ? (
            <div className="text-center py-12 animate-fade-in">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
                <Calendar className="text-gray-400 dark:text-gray-500" size={40} />
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-lg font-medium mb-1">
                No tasks for this day
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-sm">
                Click &quot;Add Task&quot; to create one
              </p>
            </div>
          ) : (
            dayTasks.map((task, index) => (
              <div
                key={task.id}
                className={`group p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] animate-fade-in ${
                  task.completed
                    ? "bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 opacity-75"
                    : task.type === "exam"
                    ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700"
                    : task.type === "course"
                    ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700"
                    : "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-700"
                }`}
                onClick={() => onTaskClick(task)}
              >
                <div className="flex items-start gap-3">
                  {/* Only show checkbox for personal tasks */}
                  {task.type === "personal" ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onTaskToggleComplete(task.id);
                      }}
                      className="mt-0.5 flex-shrink-0 transition-transform duration-200 hover:scale-110 active:scale-95"
                    >
                      {task.completed ? (
                        <CheckCircle2
                          className="text-green-600 dark:text-green-400 transition-all duration-300 animate-[checkPop_0.3s_ease-out]"
                          size={24}
                        />
                      ) : (
                        <Circle
                          className="text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200"
                          size={24}
                        />
                      )}
                    </button>
                  ) : null}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {task.type === "exam" ? (
                        <span className="text-red-600 dark:text-red-400 text-lg">📝</span>
                      ) : task.type === "course" ? (
                        getActivityIcon(task.activityType)
                      ) : (
                        <User
                          className="text-purple-600 dark:text-purple-400 flex-shrink-0"
                          size={16}
                        />
                      )}
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {task.type === "exam"
                          ? task.examType
                            ? task.examType.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())
                            : "Exam"
                          : task.type === "course" && task.courseName
                          ? `${task.courseName} - ${getActivityLabel(task)}`
                          : task.type === "course"
                          ? getActivityLabel(task)
                          : "Personal Task"}
                      </span>
                      {task.type === "exam" && task.courseName && (
                        <span className="px-2 py-0.5 bg-red-200 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded text-xs font-medium">
                          {task.courseName}
                        </span>
                      )}
                      {task.frequency === "biweekly" && (
                        <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs font-medium">
                          Biweekly
                        </span>
                      )}
                    </div>
                    <h3
                      className={`text-lg font-bold mb-1 ${
                        task.completed
                          ? "line-through text-gray-500 dark:text-gray-400"
                          : "text-gray-900 dark:text-gray-100"
                      }`}
                    >
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                    {task.startTime && task.endTime && (
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {task.startTime} - {task.endTime}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
                    {onTaskNotes && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onTaskNotes(task);
                        }}
                        className="p-2 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded-lg transition-all"
                        title="View/Edit Notes"
                      >
                        <StickyNote
                          className={`${task.notes ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400 dark:text-gray-500"}`}
                          size={18}
                        />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onTaskDelete(task.id);
                      }}
                      className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all"
                      title="Delete Task"
                    >
                      <Trash2
                        className="text-red-600 dark:text-red-400"
                        size={18}
                      />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
