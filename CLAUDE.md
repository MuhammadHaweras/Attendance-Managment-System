# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Student Attendance System - A modern, responsive web application for tracking student attendance. This is a **client-side only** React SPA with no backend. All data persists in browser localStorage.

**Key Technologies:**
- React 19.2.0 with TypeScript 5.8.2
- Vite 6.2.0 (build tool)
- Tailwind CSS 3 (via CDN)
- jsPDF for PDF export (via CDN)
- SheetJS (xlsx) for Excel import (via CDN)

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (http://localhost:3000)
npm run dev

# Build for production (outputs to dist/)
npm run build

# Preview production build locally
npm run preview
```

**Dev Server Configuration:** Port 3000, host 0.0.0.0 (network accessible)

## Architecture

### Client-Side Only Design

This is NOT a full-stack application. There is:
- **No backend server** - all logic runs in the browser
- **No database** - localStorage is the only persistence layer
- **No API** - state managed entirely in React

### Data Persistence

All application state persists to localStorage:
- `classes` - Array of Class objects
- `students` - Array of Student objects
- `attendanceHistory` - Nested object: `{ [date]: { [studentId]: status } }`
- `selectedClassId` - Currently selected class

**Data Flow:**
1. User action triggers state change in [App.tsx](App.tsx)
2. `useEffect` hooks in App.tsx detect changes
3. Data automatically saved to localStorage
4. On page reload, `getInitialState()` reads from localStorage
5. Falls back to sample data if localStorage is empty

### Component Architecture

**App.tsx** is the main orchestrator containing ALL state management. All components are presentational and receive data/handlers via props.

**Key Components:**
- [StudentList.tsx](components/StudentList.tsx) - Table rendering with [StudentRow.tsx](components/StudentRow.tsx)
- [ClassSelector.tsx](components/ClassSelector.tsx) - Class dropdown and management buttons
- [AttendanceSummary.tsx](components/AttendanceSummary.tsx) - Present/Absent/Unmarked count cards
- Modal components: StudentModal, ClassModal, ManageClassesModal, StudentHistoryModal, BulkImportModal

**No routing library** - Navigation handled through modal state management.

### Type System

All types defined in [types.ts](types.ts):

```typescript
interface Class {
  id: number;
  name: string;
}

interface Student {
  id: number;
  name: string;
  rollNumber: string;
  classId: number;  // Foreign key to Class
}

enum AttendanceStatus {
  PRESENT = 'Present',
  ABSENT = 'Absent',
  UNMARKED = 'Unmarked',
}

// Attendance data structure: date → studentId → status
interface AttendanceHistory {
  [date: string]: {
    [studentId: number]: AttendanceStatus;
  };
}
```

### State Management Pattern

App.tsx uses React hooks with performance optimization:

```typescript
// Memoized computations prevent unnecessary re-renders
const studentsInClass = useMemo(() =>
  students.filter(s => s.classId === selectedClassId),
  [students, selectedClassId]
);

const filteredStudents = useMemo(() =>
  studentsInClass.filter(/* search logic */),
  [studentsInClass, searchQuery]
);
```

**Critical Pattern:** Each data type has its own useEffect that syncs to localStorage when state changes.

## Important Implementation Details

### ID Generation Strategy

New IDs use `Math.max(...existingIds) + 1` pattern. When creating students or classes:
```typescript
const newId = students.length > 0
  ? Math.max(...students.map(s => s.id)) + 1
  : 1;
```

### Cascading Deletes

When deleting a class:
1. Delete all students in that class
2. Delete all attendance records for those students
3. If deleted class was selected, switch to first remaining class or null

When deleting a student:
1. Remove student from students array
2. Remove ALL attendance history entries for that student across all dates

### Date Handling

Dates stored as `YYYY-MM-DD` strings. The date picker in App.tsx controls which date's attendance is being recorded. Attendance can be recorded for past/future dates.

### PDF Export Logic

Export button only appears when `isAttendanceComplete` is true (all students marked for selected date). Uses jsPDF and jsPDF-AutoTable loaded from CDN in [index.html](index.html).

### Search Functionality

Search filters students by name OR roll number (case-insensitive). Applied to students in currently selected class only.

### Bulk Import Feature

Students can be imported from Excel (.xlsx, .xls) or CSV files via the BulkImportModal component.

**File Format Requirements:**
- **Column 1:** Roll Number (required)
- **Column 2:** Name (optional, can be blank)
- First row can optionally be a header (auto-detected)

**Import Process:**
1. User clicks "Bulk Import" button in header
2. User selects Excel/CSV file
3. File is parsed client-side using SheetJS (loaded via CDN)
4. Preview table shows all parsed students
5. On confirmation, students are added to selected class with auto-generated IDs
6. Duplicate roll numbers are NOT automatically filtered - user should ensure data is clean

**Implementation Details:**
- Parsing done in [BulkImportModal.tsx](components/BulkImportModal.tsx) using `XLSX.read()` and `XLSX.utils.sheet_to_json()`
- New IDs generated using `Math.max(...existingIds) + 1` pattern
- All imported students assigned to currently selected class
- Import button disabled if no class is selected

## File Organization

```
components/          # All React components (presentational)
App.tsx             # Main container with ALL state and handlers
types.ts            # TypeScript type definitions
constants.ts        # Sample data (not actively used - defaults in App.tsx)
index.tsx           # React DOM mounting point
index.html          # Entry point with CDN imports
vite.config.ts      # Vite configuration (port 3000, env vars)
tsconfig.json       # TypeScript config (ES2022, path aliases)
```

### Critical Files for Most Changes

- **[App.tsx](App.tsx)** - State management, handlers, main UI logic
- **[types.ts](types.ts)** - Type definitions (modify when adding fields)
- **[index.html](index.html)** - CDN dependencies and global styles

## Key Conventions

### Component Props Pattern

All components receive props for:
1. Data to display
2. Event handlers (prefixed with `on*` for DOM events, `handle*` for app logic)
3. State flags (isOpen, isLoading, etc.)

Example from StudentRow:
```typescript
interface StudentRowProps {
  student: Student;
  currentStatus: AttendanceStatus;
  onStatusChange: (studentId: number, status: AttendanceStatus) => void;
  onViewHistory: (student: Student) => void;
  onEdit: (student: Student) => void;
  onDelete: (studentId: number) => void;
}
```

### Modal Management Pattern

Each modal has:
1. `is[Modal]Open` - boolean state
2. `[Entity]ToEdit` - null (create mode) or object (edit mode)
3. `handleOpen[Modal]()` - sets entity and opens modal
4. `handleSave[Entity]()` - create or update logic
5. Modal component receives isOpen, entity, handlers as props

### Error Handling

Validation occurs in modal components (StudentModal, ClassModal). Errors displayed inline. Invalid submissions prevented by disabling save button.

## Styling Approach

**Tailwind CSS** classes for all styling (loaded from CDN). No custom CSS files except for blinking cursor animation in index.html.

**Color Conventions:**
- Primary actions: `indigo-600` / `indigo-700`
- Present status: `green-500`
- Absent status: `red-500`
- Danger actions: `red-600`
- Neutral: `gray-*` shades

**Responsive Design:** Mobile-first with Tailwind breakpoints (sm:, md:, lg:)

## Known Limitations

1. **No backend** - data only exists in browser localStorage (~5-10MB limit)
2. **No multi-device sync** - data tied to single browser on single device
3. **No authentication** - anyone with browser access sees all data
4. **Performance** - suitable for ~100-500 students per class; may degrade with more
5. **No bulk operations** - no CSV import/export (only PDF export)
6. **Browser dependency** - clearing browser data loses all records

## Making Changes

### Adding a New Field to Student/Class

1. Update interface in [types.ts](types.ts)
2. Update form in StudentModal.tsx or ClassModal.tsx
3. Update display in StudentRow.tsx or ClassSelector.tsx
4. Update validation logic in modal component
5. Handle data migration for existing localStorage data (or clear it)

### Adding a New Modal

1. Create modal component in `components/`
2. Add state to App.tsx: `is[Modal]Open`, `[entity]ToEdit`
3. Add open/close handlers to App.tsx
4. Add modal trigger button to appropriate component
5. Pass props from App.tsx to modal component

### Modifying Attendance Logic

Core logic in App.tsx:
- `handleStatusChange()` - updates attendance for student on selected date
- `currentRecords` - memoized getter for selected date's records
- `isAttendanceComplete` - computed property checking if all students marked

Attendance data structure is nested: `attendanceHistory[date][studentId] = status`

### Adding New Dependencies

Install via npm, then:
- For runtime deps: Import in component files
- For CDN deps: Add script tag to [index.html](index.html)
- For types: Install @types/* package

## Build Configuration

**vite.config.ts:**
- Dev server on port 3000, accessible on all network interfaces
- React plugin for Fast Refresh
- Path alias: `@/` maps to project root
- Environment variables: GEMINI_API_KEY (legacy, not used)

**tsconfig.json:**
- Target: ES2022
- JSX: react-jsx (automatic, no React import needed)
- Path aliases: `@/*` resolves to root
- Strict: skipLibCheck enabled

## localStorage Schema

```javascript
{
  "classes": [
    { "id": 1, "name": "Class 10A" }
  ],
  "students": [
    { "id": 1, "name": "John Doe", "rollNumber": "001", "classId": 1 }
  ],
  "attendanceHistory": {
    "2025-10-19": {
      "1": "Present",
      "2": "Absent"
    }
  },
  "selectedClassId": 1
}
```

Access via browser DevTools → Application → Local Storage → http://localhost:3000
