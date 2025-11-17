# Project Development Rules

## 1. Code Organization & Structure

### File & Folder Structure
- `/app`: React Native screens and navigation
- `/components`: Reusable React components
- `/contexts`: React Context providers
- `/utils`: Helper functions and utilities
- `/supabase`: Database schema and Supabase-specific code
- `/constants`: Type definitions and static data
- `/assets`: Images and static assets

### Naming Conventions
- Files:
  - React components: PascalCase (e.g., `UserProfile.tsx`)
  - Utilities and helpers: camelCase (e.g., `authHelpers.ts`)
  - Database schema: kebab-case (e.g., `schema.sql`)
- Variables/Functions:
  - Functions: camelCase, verb prefixes (e.g., `getUserProfile`, `handleSubmit`)
  - React hooks: use prefix (e.g., `useAuth`, `useTheme`)
  - Boolean variables: is/has prefix (e.g., `isLoading`, `hasError`)
- Database:
  - Tables: plural, snake_case (e.g., `users`, `lesson_plans`)
  - Columns: snake_case (e.g., `user_id`, `created_at`)
  - Foreign keys: `table_name_id` format

## 2. Code Style & Standards

### TypeScript/React Native
- Use TypeScript for all new code
- Define interfaces for all props and state
- Use functional components with hooks
- Implement proper error boundaries
- Use React Navigation for routing

### Supabase Integration
- All database operations through Supabase client
- Use Row Level Security (RLS) policies
- Implement proper error handling for all Supabase operations
- Use TypeScript types generated from Supabase schema

## 3. Documentation Standards

### Code Documentation
- JSDoc comments for functions and components
- Inline comments for complex logic
- README files for each major directory
- Type definitions in separate files

### Commit Standards
- Conventional Commits format
- Categories: feat, fix, docs, style, refactor, test, chore
- Example: `feat(auth): implement user registration`

## 4. Security Standards

### Authentication
- Implement proper session management
- Use Supabase Auth for all authentication
- Secure storage for tokens
- Implement proper logout cleanup

### Database Security
- Row Level Security (RLS) for all tables
- Principle of least privilege
- Regular security audits
- No sensitive data in client code

## 5. Testing Standards

### Testing Requirements
- Unit tests for utilities
- Component tests for UI
- Integration tests for Supabase operations
- E2E tests for critical flows

## 6. Performance Standards

### Frontend
- Implement proper loading states
- Use proper image optimization
- Implement proper caching
- Monitor and optimize re-renders

### Backend
- Efficient database queries
- Proper indexing
- Implement rate limiting
- Monitor query performance

## 7. Update Process

1. Update userflow.md for feature changes
2. Document changes in changes.md
3. Update relevant documentation
4. Create/update tests
5. Implement changes
6. Review security implications
7. Test thoroughly
8. Update changelog

## 8. API Standards

### Supabase Functions
- Clear function naming
- Proper error handling
- Input validation
- Response format consistency

### Data Validation
- Validate all inputs
- Sanitize user data
- Implement proper error messages
- Use TypeScript for type safety
