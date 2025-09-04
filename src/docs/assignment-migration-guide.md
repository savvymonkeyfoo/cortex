# Assignment Data Layer Migration Guide

## Overview

The assignment system now uses a clean repository pattern that allows easy switching between mock data (for development) and Supabase (for production).

## Architecture

```
UI Components (TasksView, AssignmentArchive)
    ↓
React Hooks (useAssignments, useAssignmentSteps)  
    ↓
Repository Interface (AssignmentsRepo)
    ↓
Implementation (Mock or Supabase)
```

## Files Created

### Core Data Layer
- `/data/assignments.ts` - TypeScript interfaces and types
- `/data/assignments.mock.ts` - Mock implementation with sample data
- `/data/assignments.supabase.ts` - Supabase implementation (ready for production)
- `/data/repo.ts` - Repository selector (single line to switch implementations)

### React Integration
- `/hooks/useAssignments.ts` - React hooks for assignment management
- `/components/AssignmentArchive.tsx` - Archive view component
- Updated `/components/TasksView.tsx` - Live assignments view

### Server Integration
- Extended `/supabase/functions/server/index.tsx` - API endpoints for assignments and steps

## How to Switch Between Mock and Supabase

In `/data/repo.ts`, change this single line:

```typescript
// For development (mock data)
export const repo = mockRepo;

// For production (Supabase)
export const repo = supabaseRepo;
```

## Migration Steps

1. ✅ **Data Layer Added** - Repository interface with mock implementation
2. ✅ **UI Updated** - TasksView and AssignmentArchive now use repository pattern  
3. ✅ **Server Extended** - API endpoints support new assignment operations
4. ✅ **React Hooks** - Clean hooks for assignment state management

### Next Steps (Optional)

5. **Real Supabase Setup** - Create actual Supabase tables using schema in `assignments.supabase.ts`
6. **Realtime Updates** - Add Supabase Realtime for live column updates
7. **Authentication** - Add user-based assignment filtering
8. **Step Persistence** - Implement step CRUD operations in backend

## Supabase Schema (When Ready)

The SQL schema is documented in `/data/assignments.supabase.ts`. To implement:

1. Run the SQL commands in your Supabase dashboard
2. Update environment variables for Supabase connection
3. Change the repository selector in `/data/repo.ts`
4. Test the switch!

## Benefits

- **Clean Separation** - UI doesn't know/care about data source
- **Easy Testing** - Mock data for development, real data for production
- **Incremental Migration** - Switch with a single line change
- **Type Safety** - Full TypeScript support throughout
- **Performance** - React hooks prevent unnecessary re-renders
- **Scalability** - Ready for advanced features like realtime updates

## Example Usage

```typescript
// In any component
const { assignments, loading, createAssignment } = useAssignments(['todo', 'in_progress']);

// Create new assignment
const handleCreate = async () => {
  await createAssignment({
    title: "New Task",
    description: "Task description", 
    status: "todo",
    priority: "medium",
    progress: 0,
    created_by: "user-123"
  });
};
```

The data layer is now completely flexible and production-ready!