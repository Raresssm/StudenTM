"use client";

import { Task } from "@/types/task";
import { X } from "lucide-react";
import { useState, useEffect } from "react";

interface TaskNotesPanelProps {
  task: Task | null;
  onClose: () => void;
  onUpdateNotes: (taskId: string, notes: string) => void;
}

export default function TaskNotesPanel({
  task,
  onClose,
  onUpdateNotes,
}: TaskNotesPanelProps) {
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (task) {
      // Always load fresh notes from the task
      setNotes(task.notes || "");
    } else {
      setNotes("");
    }
  }, [task]); // Update when task changes

  const handleSave = () => {
    if (task) {
      onUpdateNotes(task.id, notes);
      // Close the panel after saving
      onClose();
    }
  };

  if (!task) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl my-8">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Notes: {task.title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="text-gray-600 dark:text-gray-400" size={24} />
          </button>
        </div>

        <div className="p-6">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={15}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
            placeholder="Add your notes here..."
          />

          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
            >
              Save Notes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
