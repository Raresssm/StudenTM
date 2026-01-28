"use client";

import { Task } from "@/types/task";
import { useMemo } from "react";
import { CheckCircle2, Clock, BookOpen, GraduationCap } from "lucide-react";

interface TaskStatsProps {
  tasks: Task[];
}

export default function TaskStats({ tasks }: TaskStatsProps) {
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    const courses = tasks.filter(t => t.type === "course").length;
    const exams = tasks.filter(t => t.type === "exam").length;
    const personal = tasks.filter(t => t.type === "personal").length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      pending,
      courses,
      exams,
      personal,
      completionRate,
    };
  }, [tasks]);

  if (stats.total === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border-l-4 border-indigo-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          </div>
          <BookOpen className="text-indigo-500" size={24} />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border-l-4 border-green-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completed}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500">{stats.completionRate}%</p>
          </div>
          <CheckCircle2 className="text-green-500" size={24} />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border-l-4 border-yellow-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pending}</p>
          </div>
          <Clock className="text-yellow-500" size={24} />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border-l-4 border-purple-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Exams</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.exams}</p>
          </div>
          <GraduationCap className="text-purple-500" size={24} />
        </div>
      </div>
    </div>
  );
}
