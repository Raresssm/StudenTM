"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import WeeklyCalendar from "@/components/WeeklyCalendar";
import TaskModal from "@/components/TaskModal";
import TaskNotesPanel from "@/components/TaskNotesPanel";
import ExamAverageCalculator from "@/components/ExamAverageCalculator";
import TaskStats from "@/components/TaskStats";
import Toast, { ToastType } from "@/components/Toast";
import { useAuth } from "@/components/AuthProvider";
import { Task } from "@/types/task";
import { Plus, LogOut } from "lucide-react";
import { createAcademicYear, getSemesterForDate } from "@/utils/semester";
import { generateSemesterTaskInstances } from "@/utils/tasks";
import { format } from "date-fns";
import { fetchTasks, saveTasks, deleteTask, deleteTasks } from "@/utils/supabase-tasks";

export default function Home() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [notesTask, setNotesTask] = useState<Task | null>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [loading, setLoading] = useState(true);

  const showToast = (message: string, type: ToastType = "success") => {
    setToast({ message, type });
  };

  // Create academic year (starts in 2025)
  const academicYear = useMemo(() => {
    return createAcademicYear(2025);
  }, []);

  // Load tasks from Supabase on mount
  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      setLoading(false);
      return;
    }

    const loadTasks = async () => {
      try {
        setLoading(true);
        const fetchedTasks = await fetchTasks();
        setTasks(fetchedTasks);
      } catch (error) {
        console.error("Error loading tasks:", error);
        showToast("Failed to load tasks", "error");
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, [user, authLoading]);

  // Note: Auto-save removed - we save manually in each handler for better control

  const handleAddTask = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleSaveTask = async (taskData: Omit<Task, "id">) => {
    let updatedTasks: Task[];
    
    if (editingTask) {
      // Check if this is a semester course instance (has date suffix in id)
      const isInstance = editingTask.id.match(/-\d{4}-\d{2}-\d{2}$/);
      
      if (isInstance && editingTask.semesterId) {
        // Editing an instance - update just this instance
        updatedTasks = tasks.map((t) => (t.id === editingTask.id ? { ...taskData, id: editingTask.id } : t));
      } else if (editingTask.semesterId && taskData.semesterId) {
        // Editing parent template - regenerate all instances
        const updatedTask = { ...taskData, id: editingTask.id };
        const otherTasks = tasks.filter((t) => !t.id.startsWith(editingTask.id + "-") && t.id !== editingTask.id);
        const instances = generateSemesterTaskInstances(updatedTask);
        updatedTasks = [...otherTasks, updatedTask, ...instances];
      } else {
        // Regular update (non-semester task)
        updatedTasks = tasks.map((t) => (t.id === editingTask.id ? { ...taskData, id: editingTask.id } : t));
      }
    } else {
      // Add new task
      const newTask: Task = {
        ...taskData,
        id: Date.now().toString(),
      };
      
      // If it's a semester course, store parent template and generate instances
      if (newTask.semesterId && newTask.startDate && newTask.endDate) {
        const instances = generateSemesterTaskInstances(newTask);
        // Store parent template + instances
        updatedTasks = [...tasks, newTask, ...instances];
      } else {
        updatedTasks = [...tasks, newTask];
      }
    }
    
    setTasks(updatedTasks);
    
    // Save to Supabase immediately
    try {
      await saveTasks(updatedTasks);
      setIsModalOpen(false);
      setEditingTask(null);
      showToast(editingTask ? "Task updated successfully!" : "Task created successfully!");
    } catch (error) {
      console.error("Error saving task:", error);
      showToast("Failed to save task", "error");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    // Check if this is an instance of a semester course (has date suffix)
    const isInstance = taskId.match(/-\d{4}-\d{2}-\d{2}$/);
    let taskIdsToDelete: string[];
    let updatedTasks: Task[];
    
    if (isInstance) {
      // Delete just this instance
      taskIdsToDelete = [taskId];
      updatedTasks = tasks.filter((t) => t.id !== taskId);
    } else {
      // Delete parent task and all its instances
      const instanceIds = tasks
        .filter((t) => t.id.startsWith(taskId + "-"))
        .map((t) => t.id);
      taskIdsToDelete = [taskId, ...instanceIds];
      updatedTasks = tasks.filter((t) => !t.id.startsWith(taskId + "-") && t.id !== taskId);
    }
    
    setTasks(updatedTasks);
    
    // Delete from Supabase
    try {
      await deleteTasks(taskIdsToDelete);
      showToast("Task deleted successfully!");
    } catch (error) {
      console.error("Error deleting task:", error);
      showToast("Failed to delete task", "error");
      // Revert on error
      setTasks(tasks);
    }
  };

  const handleToggleComplete = async (taskId: string) => {
    const previousTasks = tasks;
    const updatedTasks = tasks.map((t) =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    setTasks(updatedTasks);
    
    // Save to Supabase
    try {
      const updatedTask = updatedTasks.find((t) => t.id === taskId);
      if (updatedTask) {
        await saveTasks([updatedTask]);
      }
    } catch (error: any) {
      console.error("Error updating task:", error);
      showToast(error?.message || "Failed to update task", "error");
      // Revert on error
      setTasks(previousTasks);
    }
  };

  const handleOpenNotes = (task: Task) => {
    setNotesTask(task);
  };

  const handleUpdateNotes = async (taskId: string, notes: string) => {
    const updatedTasks = tasks.map((t) =>
      t.id === taskId ? { ...t, notes: notes.trim() || undefined } : t
    );
    setTasks(updatedTasks);
    
    // Update the notesTask state to reflect the change immediately
    if (notesTask && notesTask.id === taskId) {
      setNotesTask({ ...notesTask, notes: notes.trim() || undefined });
    }
    
    // Save to Supabase immediately
    try {
      const updatedTask = updatedTasks.find((t) => t.id === taskId);
      if (updatedTask) {
        await saveTasks([updatedTask]);
        showToast("Notes saved successfully!");
      }
    } catch (error) {
      console.error("Error saving notes:", error);
      showToast("Failed to save notes", "error");
    }
  };

  // Check if selected week is in exam session to show calculator
  const isExamSession = useMemo(() => {
    if (!academicYear) return false;
    const period = getSemesterForDate(selectedDate, academicYear);
    return period === "exam";
  }, [academicYear, selectedDate]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (
        (e.target as HTMLElement).tagName === "INPUT" ||
        (e.target as HTMLElement).tagName === "TEXTAREA"
      ) {
        return;
      }

      // Ctrl/Cmd + K to add task
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        handleAddTask();
      }

      // Arrow keys for navigation
      if (e.key === "ArrowLeft" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() - 1);
        setSelectedDate(format(newDate, "yyyy-MM-dd"));
      }

      if (e.key === "ArrowRight" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + 1);
        setSelectedDate(format(newDate, "yyyy-MM-dd"));
      }

      // T for today
      if (e.key === "t" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setSelectedDate(format(new Date(), "yyyy-MM-dd"));
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [selectedDate]);

  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              StudenTM
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Your personal task tracker for courses and personal tasks
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {user?.email}
            </span>
            <button
              onClick={signOut}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg shadow-md transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </header>

        <div className="mb-6 flex items-center justify-between">
          <TaskStats tasks={tasks} />
          <button
            onClick={handleAddTask}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <Plus size={20} />
            Add Task
          </button>
        </div>

        {isExamSession && (
          <ExamAverageCalculator tasks={tasks} selectedDate={selectedDate} academicYear={academicYear} />
        )}

        <WeeklyCalendar
          tasks={tasks}
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          onTaskClick={handleEditTask}
          onTaskDelete={handleDeleteTask}
          onTaskToggleComplete={handleToggleComplete}
          onTaskNotes={handleOpenNotes}
          academicYear={academicYear}
        />

        {isModalOpen && (
          <TaskModal
            task={editingTask}
            selectedDate={selectedDate}
            onSave={handleSaveTask}
            onClose={() => {
              setIsModalOpen(false);
              setEditingTask(null);
            }}
            academicYear={academicYear}
          />
        )}

        {notesTask && (
          <TaskNotesPanel
            task={tasks.find(t => t.id === notesTask.id) || notesTask}
            onClose={() => setNotesTask(null)}
            onUpdateNotes={handleUpdateNotes}
          />
        )}

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </main>
  );
}
