# StudenTM - Student Task Manager

A modern, full-stack web application designed for students to manage their academic schedule, courses, exams, and personal tasks. Built with Next.js and Supabase, it provides a seamless experience with real-time cloud synchronization across all devices.

## 🎯 Project Overview

StudenTM helps students organize their academic life by providing:
- A **weekly calendar view** for visualizing tasks and schedules
- **Semester-aware course management** with recurring class schedules
- **Exam tracking** with grade calculation during exam sessions
- **Personal task management** with completion tracking
- **Secure cloud storage** so data is accessible from any device

## 🏗️ Architecture

### Frontend Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Next.js 14 (App Router)              │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Pages     │  │ Components  │  │    Providers        │  │
│  │  - /        │  │ - Calendar  │  │  - AuthProvider     │  │
│  │  - /login   │  │ - TaskModal │  │  (React Context)    │  │
│  │  - /signup  │  │ - Toast     │  │                     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                    Middleware (Auth Protection)              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Supabase Client SDK                      │
│              (Browser Client + Server Client)                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        Supabase Backend                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │  PostgreSQL  │  │     Auth     │  │   Row Level      │   │
│  │   Database   │  │   Service    │  │   Security       │   │
│  └──────────────┘  └──────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Backend Architecture (Supabase)

The application uses **Supabase** as a Backend-as-a-Service (BaaS), which provides:

1. **PostgreSQL Database**
   - Stores all task data with full relational capabilities
   - Supports complex queries and indexing for performance
   - Schema defined in `supabase/migrations/001_create_tasks_table.sql`

2. **Authentication Service**
   - Email/password authentication
   - Google OAuth integration
   - Session management with secure cookies
   - JWT-based token authentication

3. **Row Level Security (RLS)**
   - Database-level security policies
   - Users can only access their own data
   - Policies enforced on every query automatically

### Data Flow

```
User Action → React Component → Supabase Client → Supabase API → PostgreSQL
                                                       ↓
                                              RLS Policy Check
                                                       ↓
                                              Data Returned/Modified
```

## ✨ Features

### Authentication System
- **Email/Password Login**: Traditional authentication with email verification
- **Google OAuth**: One-click sign-in with Google account
- **Session Persistence**: Stay logged in across browser sessions
- **Secure Logout**: Proper session cleanup on sign out
- **Protected Routes**: Middleware redirects unauthenticated users to login

### Task Management
- **Create Tasks**: Add courses, personal tasks, or exams
- **Edit Tasks**: Modify any task details
- **Delete Tasks**: Remove individual tasks or entire course series
- **Complete Tasks**: Mark personal tasks as done with satisfying animations

### Course Management
- **Semester-Based Scheduling**: Define courses within academic semesters
- **Recurring Classes**: Set weekly or biweekly recurring schedules
- **Activity Types**: Differentiate between lectures, seminars, labs, and projects
- **Automatic Instance Generation**: Creates all class instances for the semester

### Calendar Features
- **Weekly View**: See your entire week at a glance
- **Day Navigation**: Quick navigation between days and weeks
- **Week Numbers**: Academic week tracking within semesters
- **Today Indicator**: Visual highlight for current day
- **Task Count Badges**: See how many tasks per day

### Exam Features
- **Exam Tracking**: Record exams with dates and times
- **Grade Recording**: Input exam results
- **Credit Weights**: Assign credits to exams
- **Average Calculator**: Automatic weighted average during exam sessions

### Notes System
- **Task Notes**: Add detailed notes to any task
- **Quick Access**: Slide-out panel for viewing/editing notes
- **Auto-Save**: Notes are saved automatically to the cloud

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **Next.js 14** | React framework with App Router, SSR, and API routes |
| **TypeScript** | Type-safe JavaScript for better developer experience |
| **Tailwind CSS** | Utility-first CSS framework for rapid styling |
| **Lucide React** | Beautiful, consistent icon library |
| **date-fns** | Modern JavaScript date utility library |

### Backend (Supabase)
| Service | Purpose |
|---------|---------|
| **PostgreSQL** | Primary database for all application data |
| **Supabase Auth** | User authentication and session management |
| **Supabase Realtime** | (Available) Real-time data subscriptions |
| **Row Level Security** | Database-level access control |

### Development Tools
| Tool | Purpose |
|------|---------|
| **ESLint** | Code linting and style enforcement |
| **PostCSS** | CSS processing for Tailwind |
| **Autoprefixer** | Automatic CSS vendor prefixes |

## 📁 Project Structure

```
StudenTM/
├── app/                          # Next.js App Router
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts          # OAuth callback handler
│   ├── login/
│   │   └── page.tsx              # Login page
│   ├── signup/
│   │   └── page.tsx              # Signup page
│   ├── globals.css               # Global styles and animations
│   ├── layout.tsx                # Root layout with AuthProvider
│   └── page.tsx                  # Main application (dashboard)
│
├── components/
│   ├── Auth.tsx                  # Login/signup form with OAuth
│   ├── AuthProvider.tsx          # Authentication context provider
│   ├── ExamAverageCalculator.tsx # Exam grade calculator
│   ├── TaskModal.tsx             # Task create/edit modal
│   ├── TaskNotesPanel.tsx        # Notes slide-out panel
│   ├── TaskStats.tsx             # Task statistics display
│   ├── Toast.tsx                 # Notification toasts
│   └── WeeklyCalendar.tsx        # Main calendar component
│
├── lib/
│   └── supabase/
│       ├── client.ts             # Browser Supabase client
│       ├── server.ts             # Server Supabase client
│       └── middleware.ts         # Auth middleware utilities
│
├── types/
│   ├── semester.ts               # Semester type definitions
│   └── task.ts                   # Task type definitions
│
├── utils/
│   ├── semester.ts               # Semester utility functions
│   ├── supabase-tasks.ts         # Task CRUD operations
│   └── tasks.ts                  # Task helper functions
│
├── supabase/
│   └── migrations/
│       └── 001_create_tasks_table.sql  # Database schema
│
├── middleware.ts                 # Next.js middleware for auth
├── .env.local                    # Environment variables (not in git)
└── package.json                  # Dependencies and scripts
```

## 🗄️ Database Schema

### Tasks Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT | Primary key (timestamp-based) |
| `user_id` | UUID | Foreign key to auth.users |
| `title` | TEXT | Task title |
| `description` | TEXT | Optional description |
| `type` | TEXT | 'course', 'personal', or 'exam' |
| `date` | TEXT | Task date (YYYY-MM-DD) |
| `completed` | BOOLEAN | Completion status |
| `notes` | TEXT | Optional notes |
| `start_time` | TEXT | Start time (HH:mm) |
| `end_time` | TEXT | End time (HH:mm) |
| `activity_type` | TEXT | 'course', 'seminar', 'laboratory', 'project' |
| `frequency` | TEXT | 'weekly' or 'biweekly' |
| `semester_id` | TEXT | Reference to semester |
| `exam_type` | TEXT | Type of exam |
| `exam_result` | NUMERIC | Exam grade |
| `credits` | NUMERIC | Course credits |
| `created_at` | TIMESTAMP | Auto-generated |
| `updated_at` | TIMESTAMP | Auto-updated |

### Security Policies

```sql
-- Users can only see their own tasks
CREATE POLICY "Users can view their own tasks"
  ON tasks FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert their own tasks
CREATE POLICY "Users can insert their own tasks"
  ON tasks FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own tasks
CREATE POLICY "Users can update their own tasks"
  ON tasks FOR UPDATE USING (auth.uid() = user_id);

-- Users can only delete their own tasks
CREATE POLICY "Users can delete their own tasks"
  ON tasks FOR DELETE USING (auth.uid() = user_id);
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- Supabase account (free tier available)

### Installation

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd StudenTM
npm install
```

2. **Configure Supabase:**
   - Create a project at [supabase.com](https://supabase.com)
   - Copy your project URL and anon key from Settings → API

3. **Set environment variables:**
```bash
# Create .env.local file
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

4. **Run database migration:**
   - Go to Supabase SQL Editor
   - Run the script from `supabase/migrations/001_create_tasks_table.sql`

5. **Start development server:**
```bash
npm run dev
```

6. **Open the app:**
   - Navigate to [http://localhost:3000](http://localhost:3000)
   - Create an account and start managing tasks!

## 🔒 Security Features

- **Authentication**: Handled by Supabase Auth with secure password hashing
- **Row Level Security**: All database queries filtered by user_id automatically
- **HTTPS**: All API calls encrypted in transit
- **Session Management**: Secure cookie-based sessions with automatic refresh
- **Input Validation**: Type checking with TypeScript, database constraints

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## 🎨 UI/UX Features

- **Dark Mode Support**: Automatic detection of system preference
- **Smooth Animations**: Transitions and micro-interactions
- **Loading States**: Spinners and skeleton states during data fetching
- **Toast Notifications**: Success and error feedback
- **Keyboard Shortcuts**: Quick navigation with arrow keys, 'T' for today

## 📄 License

This project is for educational purposes.

---


