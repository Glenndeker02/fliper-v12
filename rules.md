# SwimEase Development Rules & Guidelines

**Project**: SwimEase (AquaCoach)
**Framework**: React Native + Expo SDK 53
**Last Updated**: November 2024

This document outlines development standards and best practices for maintaining code quality and consistency throughout the SwimEase project.

---

## 1. Code Organization & Structure

### File & Folder Structure
```
/app                  # Expo Router screens
  /(tabs)            # Tab navigation screens (home, lessons, analytics, etc.)
  /onboarding        # Onboarding flow (splash, welcome, assessment, results)
  /settings          # Settings screens (accessibility, safety, support)
  /lessons           # Dynamic lesson routes ([id].tsx)
  /dryland           # Dynamic dryland exercise routes ([id].tsx)
/components          # Reusable React components
/contexts            # React contexts (ThemeContext, AuthContext)
/utils               # Utility functions (supabase.ts, aiFeedback.ts, etc.)
/constants           # Type definitions (types.ts, supabaseTypes.ts), colors, mockData
/hooks               # Custom React hooks
/supabase            # Database schema (schema.sql) and migrations
/assets              # Images, fonts, and static assets
```

### Naming Conventions
- **Files**:
  - React components: PascalCase (e.g., `LessonDetailModal.tsx`)
  - Screens: camelCase (e.g., `home.tsx`, `assessment.tsx`)
  - Utilities: camelCase (e.g., `supabase.ts`, `aiFeedback.ts`)
  - Database schema: kebab-case (e.g., `schema.sql`)
- **Variables/Functions**:
  - Functions: camelCase with verb prefixes (e.g., `getUserProfile`, `handleSubmit`)
  - React hooks: `use` prefix (e.g., `useAuth`, `useTheme`)
  - Boolean variables: `is`/`has` prefix (e.g., `isLoading`, `hasError`)
  - Constants: SCREAMING_SNAKE_CASE (e.g., `MAX_LESSON_DURATION`)
- **TypeScript Types**:
  - Interfaces: PascalCase (e.g., `Lesson`, `UserProfile`)
  - Types: PascalCase (e.g., `LessonStatus`, `DifficultyLevel`)
- **Database**:
  - Tables: plural, snake_case (e.g., `user_profiles`, `lesson_progress`)
  - Columns: snake_case (e.g., `user_id`, `created_at`)
  - Foreign keys: `table_name_id` format (e.g., `user_id`, `lesson_id`)

---

## 2. TypeScript Standards

### Strict Mode Compliance
- **Strict mode enabled**: All code must pass TypeScript strict type checking
- **No `any` types**: Use proper type definitions or `unknown` with type guards
- **Explicit return types**: Always declare return types for functions
- **Interface over Type**: Prefer `interface` for object shapes, `type` for unions/intersections
- **Use path aliases**: Import using `@/` prefix (e.g., `@/components`, `@/utils`)

### Example - Good TypeScript:
```typescript
// ✅ Good: Proper types, explicit return type, error handling
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

// ❌ Bad: Using any, no return type, no error handling
async function getUserProfile(userId: any) {
  const data = await supabase.from('user_profiles').select('*').eq('user_id', userId);
  return data;
}
```

---

## 3. React Native & React Best Practices

### Component Standards
- **Functional components only**: No class components
- **Hooks compliance**: Follow React hooks rules (dependencies, order, etc.)
- **Memoization**: Use `useMemo`, `useCallback`, and `React.memo` for performance
- **Avoid inline functions in render**: Extract callbacks to prevent re-renders
- **Platform-specific code**: Use `Platform.OS` checks when needed

### Component Structure Order
```typescript
// 1. Imports (grouped: react, react-native, third-party, local)
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/utils/supabase';

// 2. Types/Interfaces
interface LessonCardProps {
  lessonId: string;
  onPress: () => void;
}

// 3. Component definition
export function LessonCard({ lessonId, onPress }: LessonCardProps) {
  // 4. Hooks (useState, useEffect, custom hooks)
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: lesson } = useQuery(['lesson', lessonId], () => fetchLesson(lessonId));

  // 5. Event handlers
  const handlePress = useCallback(() => {
    setIsExpanded(!isExpanded);
    onPress();
  }, [isExpanded, onPress]);

  // 6. Render helpers
  const renderDifficulty = () => { /* ... */ };

  // 7. Return JSX
  return (
    <TouchableOpacity onPress={handlePress}>
      {/* JSX */}
    </TouchableOpacity>
  );
}
```

---

## 4. Styling Guidelines (NativeWind)

### NativeWind Best Practices
- **Use NativeWind classes**: Prefer `className` over inline `style` prop
- **Theme-aware**: Use theme colors from `ThemeContext` for dynamic theming
- **Responsive design**: Use breakpoint prefixes when needed (`sm:`, `md:`, `lg:`)
- **Consistent spacing**: Use Tailwind spacing scale (4, 8, 12, 16, 20, 24, 32, 40, 48)
- **Avoid arbitrary values**: Use predefined Tailwind values when possible

### Theme System
```typescript
// Access theme via hook
const { theme, toggleTheme } = useTheme();

// Color categories:
theme.colors.primary    // Brand colors (turquoise, coral)
theme.colors.text       // Text colors (primary, secondary, muted)
theme.colors.background // Background colors (white, gray, card)
theme.colors.accent     // UI accents (success, error, warning, info)
theme.colors.ui         // UI elements (border, shadow, overlay)

// Always test in both light and dark mode!
```

---

## 5. Database & Supabase Integration

### Database Operation Rules
- **Centralized functions**: All Supabase operations MUST be in `/utils/supabase.ts`
- **Type safety**: Use types from `constants/supabaseTypes.ts`
- **Error handling**: Always use try-catch blocks for database operations
- **RLS compliance**: All tables have Row Level Security enabled
- **User-scoped queries**: Filter by `auth.uid()` in RLS policies

### Query Patterns
```typescript
// ✅ Good: Centralized, typed, error-handled
export async function updateUserStreak(userId: string, newStreak: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .update({ streak: newStreak, updated_at: new Date().toISOString() })
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating user streak:', error);
    return false;
  }
}

// ❌ Bad: Direct queries in components, no error handling
const { data } = await supabase.from('user_profiles').update({ streak: 5 });
```

---

## 6. State Management Strategy

### When to Use Each Tool
- **React Query**: Server state (database queries, API calls, caching)
- **Zustand**: Global client state (app-wide settings, UI state)
- **React Context**: Theme, authentication, deep prop drilling prevention
- **useState**: Local component state
- **AsyncStorage**: Persistent local data (theme preference, offline cache)

### React Query Best Practices
```typescript
// Query keys: Use descriptive, hierarchical keys
const { data } = useQuery(['user', userId, 'profile'], () => getUserProfile(userId));

// Mutations: Use with optimistic updates
const updateProfileMutation = useMutation(
  (newData) => updateUserProfile(userId, newData),
  {
    onMutate: async (newData) => {
      // Optimistically update UI
      await queryClient.cancelQueries(['user', userId, 'profile']);
      const previous = queryClient.getQueryData(['user', userId, 'profile']);
      queryClient.setQueryData(['user', userId, 'profile'], newData);
      return { previous };
    },
    onError: (err, newData, context) => {
      // Rollback on error
      queryClient.setQueryData(['user', userId, 'profile'], context.previous);
    },
  }
);
```

---

## 7. Navigation (Expo Router)

### Routing Best Practices
- **File-based routing**: Create routes by adding files to `/app`
- **Dynamic routes**: Use `[id].tsx` or `[param].tsx` for dynamic segments
- **Typed navigation**: Use `router.push()` with type-safe paths
- **Deep linking**: Configure `app.json` for deep link support

```typescript
// ✅ Good: Typed navigation
import { router } from 'expo-router';
router.push(`/lessons/${lessonId}`);
router.push({ pathname: '/dryland/[id]', params: { id: exerciseId } });

// ❌ Bad: String concatenation without types
navigation.navigate('Lessons', { id: lessonId });
```

---

## 8. Performance Optimization

### Required Optimizations
1. **Lazy load images**: Use Expo Image with caching
2. **Memoize list items**: Use `React.memo` for FlatList items
3. **Virtualize long lists**: Use `FlatList` with proper `keyExtractor`
4. **Debounce search inputs**: 300ms debounce for search
5. **Optimize re-renders**: Use `useCallback` for callbacks passed to children
6. **Code splitting**: Lazy load non-critical screens

### Video Performance
- **Adaptive streaming**: Use HLS/DASH for video lessons
- **Thumbnail caching**: Generate and cache video thumbnails
- **Quality selection**: Allow user to choose video quality (Auto, 1080p, 720p, 480p)
- **Preload next lesson**: Prefetch next video in sequence

---

## 9. Accessibility Requirements

### Must-Have Accessibility Features
- **Screen reader support**: All interactive elements need `accessibilityLabel`
- **Touch targets**: Minimum 44x44pt touch targets per Apple HIG
- **Color contrast**: WCAG AA compliance (4.5:1 for text, 3:1 for UI)
- **Keyboard navigation**: Support external keyboard navigation
- **Dynamic text**: Support system font scaling
- **VoiceOver/TalkBack testing**: Test with screen readers enabled

### Accessibility Props Example
```typescript
<TouchableOpacity
  accessibilityLabel="Start lesson: Breathing Fundamentals"
  accessibilityHint="Double tap to begin the 12-minute lesson"
  accessibilityRole="button"
  onPress={handleStartLesson}
>
  <Text>Start Lesson</Text>
</TouchableOpacity>
```

---

## 10. Error Handling Standards

### User-Friendly Error Handling
```typescript
// ✅ Good: User-friendly error handling
try {
  const result = await createJournalEntry(userId, content);
  Alert.alert('Success', 'Journal entry saved!');
  return result;
} catch (error) {
  console.error('Failed to create journal entry:', error);
  Alert.alert(
    'Error',
    'Unable to save your journal entry. Please try again.',
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Retry', onPress: () => handleRetry() }
    ]
  );
  return null;
}

// ❌ Bad: Silent failures, no user feedback
try {
  await createJournalEntry(userId, content);
} catch (error) {
  // User has no idea what happened
}
```

### UI Error States
- **Loading**: Show skeleton loader or spinner
- **Error**: Show error message with retry button
- **Empty**: Show empty state with helpful message and action
- **Success**: Show success feedback (toast, checkmark animation)

---

## 11. Security & Privacy

### Security Requirements
- **No hardcoded secrets**: Use environment variables (`.env`)
- **Validate user input**: Sanitize all user inputs before processing
- **Secure storage**: Use Expo SecureStore for sensitive data (tokens, credentials)
- **HTTPS only**: All API calls over HTTPS
- **RLS enforcement**: Database access controlled by Row Level Security policies
- **Auth token handling**: Never log or expose auth tokens in console/errors

### Privacy Compliance (GDPR/CCPA)
- **User consent**: Record consent for data collection
- **Data export**: Support user data export requests
- **Data deletion**: Support account and data deletion
- **Privacy policy**: Link to privacy policy in settings and onboarding
- **Minimal data**: Only collect necessary data for functionality

---

## 12. Feature Development Workflow

### Step-by-Step Implementation Process
1. **Read PRD requirements**: Understand feature from `newprd.md`
2. **Check existing code**: Review similar features for established patterns
3. **Design database schema**: Update Supabase tables if needed (add to `schema.sql`)
4. **Create types**: Add TypeScript interfaces to `constants/types.ts`
5. **Build utilities**: Create helper functions in `/utils`
6. **Build components**: Create reusable components in `/components`
7. **Build screens**: Implement screen with proper navigation in `/app`
8. **Test manually**: Test in Expo Go app on physical device
9. **Test edge cases**: Error states, empty states, loading states
10. **Test accessibility**: VoiceOver/TalkBack testing
11. **Test themes**: Test in both light and dark mode
12. **Update documentation**: Add to README or relevant docs
13. **Commit & push**: Commit with descriptive conventional commit message

### Feature Completion Checklist
Before marking a feature complete, verify:
- [ ] TypeScript types defined in `constants/types.ts`
- [ ] Database operations centralized in `/utils/supabase.ts`
- [ ] Error handling implemented with user-friendly messages
- [ ] Loading states shown during async operations
- [ ] Empty states handled with helpful messaging
- [ ] Dark mode tested and working correctly
- [ ] Accessibility props added to all interactive elements
- [ ] Navigation flows tested end-to-end
- [ ] Responsive on different screen sizes (small to large phones)
- [ ] iOS and Android tested (if possible, or tested in Expo Go)
- [ ] No TypeScript errors
- [ ] No console.error or console.warn in production code

---

## 13. Git & Version Control

### Branch Strategy
- **Main branch**: `main` (production-ready code)
- **Feature branches**: `claude/feature-name-sessionID`
- **Never force push**: To protected branches (main)

### Commit Message Format
```
<type>: <description>

Types:
- feat: New feature
- fix: Bug fix
- refactor: Code refactoring (no functional changes)
- style: Formatting, missing semicolons (no code change)
- docs: Documentation updates
- test: Adding or updating tests
- chore: Build process, dependencies, config changes

Examples:
✅ feat: add pool practice session screen with audio coaching
✅ fix: resolve streak counter reset bug on timezone change
✅ refactor: extract lesson card component from home screen
✅ docs: update README with setup instructions

❌ "updates"
❌ "fixed stuff"
❌ "WIP"
```

### Before Committing
- [ ] Code compiles without errors
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] Linter passes (`npm run lint`)
- [ ] No console.log statements (use console.error for intentional logging)
- [ ] No commented-out code blocks (remove or explain why kept)
- [ ] Imports organized, unused imports removed
- [ ] Code follows style guidelines

---

## 14. Documentation Standards

### Code Documentation
```typescript
/**
 * Calculates the user's adaptive learning path based on assessment data
 * and performance history. Uses machine learning to recommend optimal
 * lesson sequence.
 *
 * @param userId - The unique identifier for the user
 * @param assessmentData - User's initial assessment responses
 * @returns Personalized learning path with recommended lessons
 * @throws {Error} If user not found or assessment incomplete
 *
 * @example
 * const path = await calculateLearningPath('user123', assessmentData);
 * console.log(path.recommendedLessons); // ['lesson1', 'lesson2', ...]
 */
export async function calculateLearningPath(
  userId: string,
  assessmentData: AssessmentData
): Promise<LearningPath> {
  // Implementation
}
```

### When to Add Comments
- **Complex algorithms**: Explain the "why" not the "what"
- **Non-obvious workarounds**: Explain why the workaround is necessary
- **Business logic**: Explain domain-specific rules
- **Magic numbers**: Explain constants with comments
- **TODO/FIXME**: Use sparingly, create issues instead

---

## 15. UI/UX Design Principles (from PRD)

### Core Design Principles
1. **Simplicity First**: Clean, uncluttered interface prioritizing essential information
2. **Motivating, Not Overwhelming**: Celebrate wins, gentle with setbacks
3. **Safety Paramount**: Constant safety reminders, conservative instruction
4. **Progress Visibility**: Always show where user is and how far they've come
5. **Accessibility**: High contrast, large touch targets, screen reader support
6. **Pool-Ready**: High brightness mode, waterproof mode considerations, audio-first when appropriate
7. **Encouraging Tone**: Warm, supportive, non-judgmental throughout app

### UI Standards
- **Buttons**: Minimum 44x44pt, rounded corners (8-12px border radius)
- **Typography**:
  - Headings: 24-32pt, font-semibold
  - Body text: 16-18pt, font-normal
  - Captions: 14pt, font-normal
  - Minimum body text: 16pt (never smaller)
- **Spacing**: 8pt grid system (8, 16, 24, 32, 40, 48, 64)
- **Colors**: Use theme colors consistently across app
- **Animations**: Subtle, < 300ms duration, enhance UX not distract
- **Loading states**: Always show loading indicators for async operations

---

## 16. Testing Standards (Future Implementation)

### Test Types
1. **Unit tests**: Utility functions, helpers (`*.test.ts`)
2. **Component tests**: Reusable components (`*.test.tsx`)
3. **Integration tests**: User flows (onboarding, lesson completion)
4. **E2E tests**: Critical paths (Detox or Maestro)

### Testing Rules (When Tests Added)
- **Test before commit**: Run tests before pushing to main
- **Coverage minimum**: 70% for utilities, 50% for components
- **Mock Supabase**: Use mock Supabase client in tests
- **Snapshot testing**: Use sparingly, prefer behavioral/functional tests

---

## 17. Continuous Improvement

### Ongoing Responsibilities
- **Monitor analytics**: Track user behavior, engagement, drop-off points
- **Collect feedback**: User reviews, support tickets, in-app feedback
- **Performance monitoring**: Track crash rates, load times, memory usage
- **Dependency updates**: Keep dependencies up-to-date for security
- **Security patches**: Apply security updates promptly
- **Refactoring**: Continuously improve code quality and reduce technical debt

### Learning Resources
- **React Native**: https://reactnative.dev/docs
- **Expo**: https://docs.expo.dev/
- **Supabase**: https://supabase.com/docs
- **React Query**: https://tanstack.com/query/latest
- **NativeWind**: https://www.nativewind.dev/

---

## Summary: Golden Rules

1. **Type everything**: Strict TypeScript, no `any` types
2. **Test on device**: Always test on physical device, not just simulator
3. **Error handling**: Always handle errors gracefully with user-friendly messages
4. **Accessibility first**: Support all users with proper accessibility props
5. **Theme-aware**: Test every screen in both light and dark mode
6. **Database centralization**: All Supabase queries in `/utils/supabase.ts`
7. **One feature at a time**: Complete, test, and commit before moving on
8. **User-centric**: Prioritize user experience over clever code
9. **Security conscious**: Never expose secrets, always validate inputs
10. **Document decisions**: Explain complex logic and non-obvious solutions

---

**Remember**: We're building an app that teaches swimming—a potentially life-saving skill. Our code quality, attention to safety features, and accessibility directly impact user well-being and learning outcomes. Code with care and compassion.

---

*Last Updated: November 2024*
*Project: SwimEase (AquaCoach)*
*Tech Stack: React Native + Expo SDK 53 + TypeScript + Supabase + NativeWind*
