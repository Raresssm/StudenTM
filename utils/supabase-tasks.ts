import { createClient } from "@/lib/supabase/client";
import { Task } from "@/types/task";

const supabase = createClient();

async function getUserId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");
  return user.id;
}

// Database row type (snake_case)
interface TaskRow {
  id: string;
  title: string;
  description: string | null;
  type: string;
  date: string;
  completed: boolean;
  notes: string | null;
  start_time: string | null;
  end_time: string | null;
  course_name: string | null;
  activity_type: string | null;
  frequency: string | null;
  semester_id: string | null;
  start_date: string | null;
  end_date: string | null;
  day_of_week: number | null;
  exam_type: string | null;
  exam_session_id: string | null;
  exam_result: number | null;
  credits: number | null;
  user_id: string;
}

// Convert database row (snake_case) to Task (camelCase)
function rowToTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description || undefined,
    type: row.type as Task["type"],
    date: row.date,
    completed: row.completed,
    notes: row.notes || undefined,
    startTime: row.start_time || undefined,
    endTime: row.end_time || undefined,
    courseName: row.course_name || undefined,
    activityType: row.activity_type as Task["activityType"],
    frequency: row.frequency as Task["frequency"],
    semesterId: row.semester_id || undefined,
    startDate: row.start_date || undefined,
    endDate: row.end_date || undefined,
    dayOfWeek: row.day_of_week ?? undefined,
    examType: row.exam_type as Task["examType"],
    examSessionId: row.exam_session_id || undefined,
    examResult: row.exam_result ?? undefined,
    credits: row.credits ?? undefined,
  };
}

// Convert Task (camelCase) to database row (snake_case)
function taskToRow(task: Task, userId: string): Omit<TaskRow, "user_id"> & { user_id: string } {
  return {
    id: task.id,
    title: task.title,
    description: task.description || null,
    type: task.type,
    date: task.date,
    completed: task.completed,
    notes: task.notes || null,
    start_time: task.startTime || null,
    end_time: task.endTime || null,
    course_name: task.courseName || null,
    activity_type: task.activityType || null,
    frequency: task.frequency || null,
    semester_id: task.semesterId || null,
    start_date: task.startDate || null,
    end_date: task.endDate || null,
    day_of_week: task.dayOfWeek ?? null,
    exam_type: task.examType || null,
    exam_session_id: task.examSessionId || null,
    exam_result: task.examResult ?? null,
    credits: task.credits ?? null,
    user_id: userId,
  };
}

export async function fetchTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .order("date", { ascending: true });

  if (error) {
    console.error("Error fetching tasks:", error);
    throw error;
  }

  return (data || []).map(rowToTask);
}

export async function saveTask(task: Task): Promise<Task> {
  const userId = await getUserId();
  const row = taskToRow(task, userId);
  
  const { data, error } = await supabase
    .from("tasks")
    .upsert(row, { onConflict: "id" })
    .select()
    .single();

  if (error) {
    console.error("Error saving task:", error);
    throw error;
  }

  return rowToTask(data);
}

export async function saveTasks(tasks: Task[]): Promise<void> {
  if (tasks.length === 0) return;

  const userId = await getUserId();
  const rows = tasks.map(task => taskToRow(task, userId));

  const { error } = await supabase
    .from("tasks")
    .upsert(rows, { onConflict: "id" });

  if (error) {
    console.error("Error saving tasks:", error);
    throw error;
  }
}

export async function deleteTask(taskId: string): Promise<void> {
  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId);

  if (error) {
    console.error("Error deleting task:", error);
    throw error;
  }
}

export async function deleteTasks(taskIds: string[]): Promise<void> {
  if (taskIds.length === 0) return;

  const { error } = await supabase
    .from("tasks")
    .delete()
    .in("id", taskIds);

  if (error) {
    console.error("Error deleting tasks:", error);
    throw error;
  }
}
