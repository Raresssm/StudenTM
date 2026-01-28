import { Task } from "@/types/task";
import { addDays, addWeeks, parseISO, format, getDay } from "date-fns";

/**
 * Generates all recurring task instances for a semester course
 */
export function generateSemesterTaskInstances(task: Task): Task[] {
  if (!task.semesterId || !task.startDate || !task.endDate || !task.frequency) {
    return [task]; // Return single task if not a semester course
  }

  const instances: Task[] = [];
  const startDate = parseISO(task.startDate);
  const endDate = parseISO(task.endDate);
  const targetDayOfWeek = task.dayOfWeek ?? getDay(startDate);
  
  // Find the first occurrence of the target day of week
  const startDayOfWeek = getDay(startDate);
  const daysToFirstOccurrence = (targetDayOfWeek - startDayOfWeek + 7) % 7;
  let currentDate = addDays(startDate, daysToFirstOccurrence);

  // Generate instances
  let weekOffset = 0;
  while (currentDate <= endDate) {
    if (currentDate >= startDate) {
      instances.push({
        ...task,
        id: `${task.id}-${format(currentDate, "yyyy-MM-dd")}`,
        date: format(currentDate, "yyyy-MM-dd"),
      });
    }

    // Move to next occurrence (weekly or biweekly)
    weekOffset += task.frequency === "weekly" ? 1 : 2;
    currentDate = addDays(startDate, daysToFirstOccurrence + (weekOffset * 7));
    
    if (currentDate > endDate) break;
  }

  return instances.length > 0 ? instances : [task];
}

/**
 * Gets all task instances for a given date range
 * This includes both one-time tasks and generated instances from semester courses
 */
export function getTasksForDateRange(
  tasks: Task[],
  startDate: Date,
  endDate: Date
): Task[] {
  const allInstances: Task[] = [];

  // Get parent templates (tasks with semesterId that don't have date suffix in id)
  const parentTemplates = tasks.filter(
    (t) => t.semesterId && t.startDate && t.endDate && !t.id.match(/-\d{4}-\d{2}-\d{2}$/)
  );
  
  // Get regular tasks (non-semester or instances)
  const regularTasks = tasks.filter(
    (t) => !t.semesterId || t.id.match(/-\d{4}-\d{2}-\d{2}$/)
  );

  // Generate instances from parent templates
  for (const parent of parentTemplates) {
    const instances = generateSemesterTaskInstances(parent);
    allInstances.push(...instances);
  }

  // Add regular tasks and instances
  for (const task of regularTasks) {
    const taskDate = parseISO(task.date);
    if (taskDate >= startDate && taskDate <= endDate) {
      allInstances.push(task);
    }
  }

  // Filter to date range
  const filtered = allInstances.filter((task) => {
    const taskDate = parseISO(task.date);
    return taskDate >= startDate && taskDate <= endDate;
  });

  // Remove duplicates based on id
  const unique = filtered.filter(
    (task, index, self) => index === self.findIndex((t) => t.id === task.id)
  );

  return unique;
}
