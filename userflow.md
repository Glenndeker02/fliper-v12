# User Flow Documentation

## 1. Onboarding Flow

### 1.1 Initial Launch
1. App opens → Splash screen (`/onboarding/splash`)
2. Auto-redirects after 3s → Welcome screen (`/onboarding/welcome`)

### 1.2 Welcome Carousel
1. Three informational slides:
   - Slide 1: "Never Too Late to Learn" (Swimming safety stats)
   - Slide 2: "Learn at Your Own Pace" (Progressive learning)
   - Slide 3: "Everything You Need" (Features overview)
2. User can:
   - Swipe through slides
   - Skip to account creation
   - Press "Next" or "Get Started"

### 1.3 Account Creation (`/onboarding/account`)
1. User has three authentication options:
   - Email/Password registration
   - Google OAuth
   - Apple OAuth
   - Continue as Guest
2. Required fields for email registration:
   - Full Name
   - Email
   - Password
3. Data flow:
   - Validate input fields
   - Create user in Supabase Auth
   - Create user profile in `profiles` table
   - Handle OAuth provider callbacks
   - Create guest session if chosen

### 1.4 Assessment (`/onboarding/assessment`)
1. User completes swimming assessment
2. Data saved to user profile
3. Generates personalized learning path

### 1.5 Results (`/onboarding/results`)
1. Display assessment results
2. Show recommended learning path
3. Save preferences and settings

## 2. Main App Navigation

### 2.1 Home Tab (`/tabs/home`)
1. Display personalized dashboard:
   - Progress overview
   - Next lessons
   - Recent achievements
2. Data requirements:
   - User profile
   - Learning progress
   - Scheduled lessons
   - Achievement data

### 2.2 Lessons Tab (`/tabs/lessons`)
1. Show available lessons:
   - Categorized by skill level
   - Filtered by user progress
2. Data requirements:
   - Lesson catalog
   - User progress
   - Completion status

### 2.3 Library Tab (`/tabs/library`)
1. Access to resources:
   - Video tutorials
   - Technique guides
   - Safety information
2. Data requirements:
   - Content library
   - User bookmarks
   - View history

### 2.4 Calendar Tab (`/tabs/calendar`)
1. Lesson scheduling:
   - View upcoming lessons
   - Schedule new lessons
   - Manage bookings
2. Data requirements:
   - User schedule
   - Available time slots
   - Booking history

### 2.5 Analytics Tab (`/tabs/analytics`)
1. Progress tracking:
   - Skill development
   - Achievement metrics
   - Learning patterns
2. Data requirements:
   - Progress metrics
   - Assessment data
   - Historical performance

### 2.6 Dryland Tab (`/tabs/dryland`)
1. Land-based exercises:
   - Exercise library
   - Workout plans
   - Progress tracking
2. Data requirements:
   - Exercise catalog
   - Workout history
   - Performance data

### 2.7 More Tab (`/tabs/more`)
1. Additional features:
   - Settings
   - Support
   - Account management
2. Data requirements:
   - User preferences
   - App settings
   - Support tickets

## 3. Feature-Specific Flows

### 3.1 Lesson Detail Flow (`/lessons/[id]`)
1. View lesson details:
   - Description
   - Prerequisites
   - Video content
2. Actions:
   - Start lesson
   - Mark complete
   - Take notes
3. Data requirements:
   - Lesson content
   - Progress tracking
   - Note storage

### 3.2 Dryland Training Flow (`/dryland/[id]`)
1. Access exercise details:
   - Instructions
   - Video demos
   - Safety tips
2. Track completion
3. Data requirements:
   - Exercise content
   - Completion records
   - Progress metrics

### 3.3 Settings Management
1. Accessibility settings (`/settings/accessibility`)
2. Safety preferences (`/settings/safety`)
3. Support access (`/settings/support`)

## 4. Data Synchronization

### 4.1 Real-time Updates
- Progress syncing
- Schedule changes
- Achievement notifications

### 4.2 Offline Support
- Cached lesson content
- Queued progress updates
- Background sync

### 4.3 Cross-device Sync
- Profile data
- Progress tracking
- Preferences

## 5. Security & Privacy

### 5.1 Authentication
- Session management
- Token refresh
- Device tracking

### 5.2 Data Protection
- Encrypted storage
- Secure transmission
- Privacy controls

## 6. Error Handling

### 6.1 Connection Issues
- Offline mode
- Retry mechanisms
- Data recovery

### 6.2 Authentication Errors
- Token expiration
- Invalid credentials
- Account recovery

### 6.3 Data Sync Conflicts
- Version control
- Conflict resolution
- Data reconciliation