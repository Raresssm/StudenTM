# StudenTM

A modern task tracker for students to manage their courses and personal tasks with a weekly calendar view.

## Features

- 📅 Weekly calendar view with day-by-day breakdown
- 📚 Course task management
- ✅ Personal task tracking
- 🔐 User authentication with Supabase
- ☁️ Cloud storage for tasks
- 🎨 Modern and intuitive UI

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works fine)

### Setup Instructions

1. **Install dependencies:**

```bash
npm install
```

2. **Set up Supabase:**

   - Create a new project at [supabase.com](https://supabase.com)
   - Go to your project settings → API
   - Copy your project URL and anon key

3. **Configure environment variables:**

   Create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Set up the database:**

   - Go to your Supabase project → SQL Editor
   - Run the migration script from `supabase/migrations/001_create_tasks_table.sql`
   - This will create the `tasks` table with Row Level Security (RLS) policies

5. **Run the development server:**

```bash
npm run dev
```

6. **Open your browser:**

   Navigate to [http://localhost:3000](http://localhost:3000)

7. **Create an account:**

   - Click "Sign up" on the login page
   - Enter your email and password (minimum 6 characters)
   - Check your email for verification (if email confirmation is enabled)
   - Sign in and start managing your tasks!

## Database Setup

The application uses Supabase for authentication and data storage. The database schema includes:

- **tasks table**: Stores all user tasks with full task details
- **Row Level Security (RLS)**: Ensures users can only access their own tasks
- **Automatic timestamps**: `created_at` and `updated_at` are automatically managed

To set up the database, run the SQL migration file located at `supabase/migrations/001_create_tasks_table.sql` in your Supabase SQL Editor.

## Tech Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Supabase** - Authentication and database
- **date-fns** - Date manipulation
- **Lucide React** - Icons

## Project Structure

```
├── app/
│   ├── login/          # Login page
│   ├── signup/         # Signup page
│   ├── layout.tsx      # Root layout with AuthProvider
│   └── page.tsx        # Main application page
├── components/
│   ├── Auth.tsx        # Authentication component
│   ├── AuthProvider.tsx # Auth context provider
│   └── ...             # Other components
├── lib/
│   └── supabase/       # Supabase client configuration
├── utils/
│   └── supabase-tasks.ts # Task CRUD operations
└── supabase/
    └── migrations/     # Database migration files
```

## Features in Detail

- **User Authentication**: Secure sign up and sign in with email/password
- **Task Management**: Create, edit, delete, and complete tasks
- **Course Tasks**: Support for semester-based recurring course activities
- **Personal Tasks**: One-time or recurring personal tasks
- **Exam Tracking**: Track exam results and calculate averages
- **Notes**: Add notes to any task
- **Real-time Sync**: All data is stored in Supabase and synced across devices

## Environment Variables

Make sure to set these in your `.env.local` file:

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon/public key

## Security

- All database operations use Row Level Security (RLS)
- Users can only access their own tasks
- Authentication is handled securely by Supabase
- Passwords are hashed and never stored in plain text
