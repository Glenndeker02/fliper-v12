# Change Log

## 2025-11-17

### Journal System Implementation (Text, Voice, Video with AI Analysis)
- Created comprehensive journal list screen (`/app/journal/index.tsx`)
  - **Journal Discovery:**
    - Browse all journal entries (text, voice, video)
    - Filter by entry type (All, Text, Voice, Video)
    - Entry cards with previews and AI analysis summaries
    - Stats card showing total entries and journaling streak
    - Pull-to-refresh functionality

  - **Entry Previews:**
    - Entry type badges with color coding
    - Timestamp display (relative and absolute)
    - Text content preview (first 2 lines)
    - Media indicators for voice/video entries
    - AI sentiment analysis preview with color-coded badges
    - Key insights preview
    - Tags display (up to 3 tags + overflow)

  - **UI Features:**
    - Horizontal scrolling filter chips
    - Empty state with call-to-action
    - Add button for quick journal creation
    - JournalModal integration for entry type selection
    - Responsive card layouts with shadows

- Created text journal entry screen (`/app/journal/text.tsx`)
  - **Writing Experience:**
    - Large, auto-focused text input area
    - AI writing prompts (5 prompts)
    - Insertable prompt chips
    - Character count display
    - Keyboard-aware scrolling

  - **Features:**
    - Tag selection (10 suggested tags)
    - Multi-select tag chips with active state
    - Privacy toggle (public/private)
    - Save with loading state
    - Journaling tips card

  - **AI Prompts:**
    - "How did you feel in the water today?"
    - "What was your biggest challenge?"
    - "What are you most proud of?"
    - "What would you like to improve next time?"
    - "Describe your swimming session in one sentence"

- Created voice journal entry screen (`/app/journal/voice.tsx`)
  - **Recording Experience:**
    - Animated waveform during recording
    - Real-time timer display (MM:SS format)
    - Large, accessible record button
    - Pause/resume functionality
    - Stop and complete workflow

  - **Playback Controls:**
    - Play/pause recorded audio
    - Delete and re-record options
    - Visual recording indicator (red dot + "REC")
    - Recording status display

  - **UI Features:**
    - Simulated waveform visualization
    - Recording tips card
    - Prompt suggestions for voice entries
    - Save with upload simulation
    - Clean, focused interface

- Created video journal entry screen (`/app/journal/video.tsx`)
  - **Recording Experience:**
    - Camera preview (front/back camera toggle)
    - Recording timer overlay
    - Large, accessible record button
    - 4:3 aspect ratio video container
    - REC indicator with timestamp

  - **Playback Controls:**
    - Video preview after recording
    - Play/pause functionality
    - Delete and re-record options
    - Flip camera button

  - **UI Features:**
    - Video recording tips card
    - Content suggestions (what to record)
    - Save with upload simulation
    - Landscape mode recommendation
    - Lighting and technique tips

- Existing journal detail screen (`/app/journal/[id].tsx`)
  - Already integrated with Supabase
  - Displays text, voice, and video entries
  - AI analysis display
  - Audio playback for voice entries
  - Video playback with native controls
  - Tags display
  - Delete functionality

### Backend Integration (Existing):
- Supabase `journals` table schema:
  - id, user_id, created_at, updated_at
  - entry_type (text, voice, video)
  - text_content, audio_url, video_url
  - ai_analysis (jsonb)
  - sentiment_score
  - tags (text array)
  - is_private (boolean)

- Existing utility functions in `/utils/supabase.ts`:
  - `createJournal()` - Create new journal entry
  - `getJournalEntries()` - Fetch user's journals
  - `getJournalEntry()` - Fetch single journal
  - `updateJournalEntry()` - Update journal
  - `deleteJournalEntry()` - Delete journal
  - `getJournalAnalytics()` - Get user's journal stats

- AI analysis utilities in `/utils/aiFeedback.ts`:
  - `analyzeJournalEntry()` - AI sentiment analysis

### Features Implemented:
- ✅ Text journal entry creation with AI prompts
- ✅ Voice journal recording (simulated, ready for expo-av)
- ✅ Video journal recording (simulated, ready for expo-camera)
- ✅ Journal list with filtering and previews
- ✅ AI analysis display with sentiment, insights, and recommendations
- ✅ Tag system with suggested tags
- ✅ Privacy controls (public/private)
- ✅ Entry type badges and color coding
- ✅ Character count for text entries
- ✅ Recording timers for voice/video
- ✅ Playback controls for media entries
- ✅ Delete and re-record functionality
- ✅ Pull-to-refresh on list
- ✅ Empty states with helpful messaging
- ✅ Journaling tips and prompts

### Technical Implementation:
- React Native with TypeScript
- Expo Router file-based routing
- KeyboardAvoidingView for text entry
- Timer implementation with useRef and setInterval
- Modal for entry type selection
- Alert dialogs for confirmations
- Gradient backgrounds and shadows
- Responsive layouts for all screen sizes
- Platform-specific UI adjustments (iOS/Android)
- Supabase integration (ready for production)
- Audio/video recording placeholders (ready for expo-av/expo-camera)

### Next Priority Features:
- Implement actual audio recording with expo-av
- Implement actual video recording with expo-camera
- Connect AI analysis to real AI service
- Add voice-to-text transcription
- Add video technique analysis
- Implement journal sharing with coaches/community
- Add journal export functionality
- Create journal analytics dashboard

---

### Pool Practice Session Builder Implementation
- Created pool practice sessions list screen (`/app/pool/index.tsx`)
  - **Session Discovery:**
    - Browse all 5 pre-built pool practice sessions
    - Filter by difficulty level (Beginner, Beg-Int, Intermediate, Advanced)
    - Session cards with thumbnail images
    - Session metadata (duration, calories, intervals count)
    - Focus areas tags display

  - **Session Card Details:**
    - Difficulty level badges with color coding
    - Estimated calories and duration
    - Number of intervals preview
    - Up to 3 focus areas + overflow count
    - Tap to navigate to session player

  - **UI Features:**
    - Horizontal scrolling filter chips
    - Empty state for no results
    - Gradient header background
    - Shadow and elevation for depth
    - Responsive card layouts

- Created pool practice session player screen (`/app/pool/[id].tsx`)
  - **Safety Features:**
    - Safety checklist modal before starting
    - Must confirm safety items to begin
    - Exit confirmation dialog
    - Session abandonment prevention

  - **Session Timer:**
    - Real-time interval countdown timer
    - Total session time tracking
    - Auto-advance to next interval when complete
    - Pause/resume functionality
    - Progress percentage display

  - **Audio Coaching:**
    - Timed audio coaching prompts (at 25%, 50%, 75% of interval)
    - Rotating coaching messages
    - Microphone icon indicator
    - Italic styling for coaching text

  - **Interval Display:**
    - Current interval title and description
    - Interval type badges (warmup, drill, practice, rest, cooldown)
    - Type-specific color coding and emojis
    - Large timer display (MM:SS format)
    - Progress bar with gradient fill

  - **Instructions:**
    - Numbered step-by-step instructions
    - Bulleted list with numbered badges
    - Clear, actionable text
    - Easy-to-read formatting

  - **Session Progress Tracking:**
    - Visual progress list of all intervals
    - Completed intervals marked with checkmark
    - Current interval highlighted
    - Interval duration display
    - Opacity differentiation for past/future intervals

  - **Controls:**
    - Play button to start session
    - Pause/resume button during session
    - Skip to next interval button
    - Large, accessible touch targets
    - Shadow effects for depth

  - **Session Completion:**
    - Completion alert with time summary
    - Option to view summary or exit
    - Total time tracking
    - Success celebration

### Features Implemented:
- ✅ 5 pre-built pool practice sessions from mockData
- ✅ Session list with filtering by difficulty
- ✅ Session player with timer and interval tracking
- ✅ Audio coaching prompts (timed triggers)
- ✅ Safety checklist before starting
- ✅ Auto-advance through intervals
- ✅ Pause/resume functionality
- ✅ Session progress visualization
- ✅ Step-by-step instructions per interval
- ✅ Type-specific color coding (warmup, drill, practice, rest, cooldown)
- ✅ Session completion flow
- ✅ Exit confirmation dialog
- ✅ Responsive design for all screen sizes

### Technical Implementation:
- React Native with TypeScript
- Expo Router for file-based routing
- Timer implementation with useRef and setInterval
- State management with useState
- Modal components for safety checklist
- Alert dialogs for confirmations
- Gradient backgrounds with expo-linear-gradient
- Icon integration with lucide-react-native
- Proper cleanup on component unmount
- Production-ready error handling

### Next Priority Features:
- Integrate XP rewards for session completion
- Connect to Supabase for session progress persistence
- Add session summary screen with stats
- Implement actual audio playback (currently simulated)
- Add session history and analytics
- Custom session builder (future P2 feature)

---

### Advanced Video Player Implementation
- Created comprehensive AdvancedVideoPlayer component (`/components/AdvancedVideoPlayer.tsx`)
  - **Playback Controls:**
    - Play/Pause with center overlay button
    - Skip backward/forward 10 seconds
    - Volume control with slider
    - Mute/unmute toggle
    - Fullscreen mode support

  - **Advanced Features:**
    - Playback speed control (0.5x, 0.75x, 1x, 1.25x, 1.5x)
    - Quality selection (Auto, 1080p, 720p, 480p)
    - Captions toggle
    - Multiple camera angles support
    - Progress tracking with callback
    - Auto-hide controls (3-second timer)
    - Buffering indicator

  - **Chapter Markers:**
    - Timeline with visual chapter markers
    - Color-coded by type (setup, execution, mistakes, tips)
    - Clickable markers to jump to chapters
    - Current chapter display in top bar

  - **Camera Angle Selector:**
    - Horizontal scrollable angle picker
    - Seamless switching between angles
    - Maintains playback position on angle change
    - Visual active state indicator

  - **Settings Modal:**
    - Tabbed interface (Speed, Quality, Captions)
    - Clean modal design with bottom sheet
    - Visual indicators for selected options

  - **UI/UX Enhancements:**
    - Responsive touch controls
    - Accessible control sizes (44pt minimum)
    - Progress slider with chapter markers
    - Time display (current / total)
    - Smooth animations and transitions
    - Dark overlay for better visibility

- Updated lesson detail screen (`/app/lessons/[id].tsx`)
  - Integrated AdvancedVideoPlayer component
  - Removed basic expo-av Video component
  - Added chapter data structure
  - Added camera angle data structure
  - Implemented progress tracking callback
  - Implemented completion callback
  - Maintained existing lesson content (steps, drills, mistakes)

- Installed Dependencies:
  - Added `@react-native-community/slider` for volume and progress controls

### Features Implemented:
- ✅ Professional video player with all controls from PRD
- ✅ Playback speed adjustment (0.5x to 1.5x)
- ✅ Quality selection (Auto, 1080p, 720p, 480p)
- ✅ Caption toggle support
- ✅ Multiple camera angles (Above Water, Underwater, Side View, Split View)
- ✅ Chapter markers with timeline navigation
- ✅ Progress tracking and resume functionality
- ✅ Fullscreen mode
- ✅ Auto-hiding controls
- ✅ Volume control with mute toggle
- ✅ Skip forward/backward 10 seconds
- ✅ Buffering states

### Next Priority Features:
- Journal system UI (text, voice, video entries)
- Achievements UI
- Community feed

---

### Gamification System Implementation
- Created comprehensive gamification utility (`/utils/gamification.ts`)
  - **Level System:**
    - 10 levels from "Water Novice" to "Swimming Champion"
    - Exponential XP progression (100 XP for Level 1, 5500 XP for Level 10)
    - Each level unlocks new perks, features, and content
    - Color-coded levels with unique emojis

  - **XP Rewards System:**
    - 25+ different XP reward types
    - Lessons: 50-150 XP based on completion level
    - Pool sessions: 30-100 XP
    - Dryland workouts: 75 XP
    - Streaks: 20 XP/day + milestone bonuses (7-day, 30-day, 100-day)
    - Journal entries: 30-60 XP based on type
    - Community participation: 5-50 XP
    - Challenges and achievements: 50-1000 XP

  - **Core Functions:**
    - `calculateLevel()` - Determines current level and progress percentage
    - `checkLevelUp()` - Detects level-up events
    - `awardXP()` - Adds XP and checks for level-ups
    - `calculatePoints()` - Separate points system for leaderboards
    - Helper functions for formatting, colors, icons

- Created XPDisplay component (`/components/XPDisplay.tsx`)
  - **Three Variants:**
    - **Mini:** Compact badge + XP count for headers
    - **Compact:** Single-line display with level, title, progress bar
    - **Full:** Detailed card with gradient, stats, progress breakdown

  - **Features:**
    - Gradient backgrounds matching level colors
    - Animated progress bars
    - Level badge with emoji icon
    - XP to next level countdown
    - Tappable to navigate to progress page
    - Responsive design for all screen sizes

- Created LevelUpModal component (`/components/LevelUpModal.tsx`)
  - **Celebration Animation:**
    - Fade and scale entrance animation
    - Animated confetti effect (20 particles)
    - Springy modal appearance
    - Auto-shows perks after 1 second

  - **Visual Design:**
    - Gradient background matching new level color
    - Large level badge with emoji and number
    - Sparkles decoration
    - Trophy icon with total XP
    - Unlocked perks list in card

  - **User Experience:**
    - BlurView background overlay
    - Smooth close animation
    - Scrollable perks list
    - Clear "Continue" button

- Created XPRewardToast component (`/components/XPRewardToast.tsx`)
  - **Toast Notification:**
    - Slides in from top with spring animation
    - Auto-hides after 3 seconds
    - Gradient background (turquoise to coral)
    - Star icon with amount and description
    - Trending up indicator
    - Platform-specific positioning (iOS/Android)

  - **Features:**
    - Non-blocking overlay
    - Smooth entrance/exit animations
    - Formatted XP display (e.g., "1,234 XP")
    - Clear visual hierarchy

- Integrated gamification into home screen (`/app/(tabs)/home.tsx`)
  - Added XP display to header (mini variant)
  - Added XP progress card below header (compact variant)
  - Added level-up modal integration
  - Added XP reward toast integration
  - State management for XP, level-ups, and rewards

### Features Implemented:
- ✅ Complete 10-level progression system
- ✅ XP rewards for 25+ activity types
- ✅ XP display components (3 variants)
- ✅ Level-up celebration modal with animations
- ✅ XP reward toast notifications
- ✅ Progress tracking with percentage
- ✅ Level perks system
- ✅ Home screen integration
- ✅ Formatted XP display (e.g., "1,234 XP")
- ✅ Color-coded levels with emoji icons
- ✅ Gradient backgrounds
- ✅ Responsive design

### Technical Implementation:
- TypeScript with strict typing
- Animated components using React Native Animated API
- Gradient designs with expo-linear-gradient
- BlurView effects for modals
- Reusable component architecture
- Comprehensive utility functions
- Production-ready state management hooks

### Next Priority Features:
- Integrate XP rewards into lesson completion
- Integrate XP rewards into pool session completion
- Connect to Supabase user_profiles table for XP persistence
- Journal system UI
- Community feed

---

### Achievements System Implementation
- Enhanced achievements utility (`/utils/achievements.ts`)
  - **35 Comprehensive Achievements:**
    - Learning (7): First lesson through 50 lessons, module mastery
    - Practice (5): Pool sessions, dryland workouts, balanced training
    - Streak (4): Week, month, 100-day streaks, comeback
    - Social (5): Journal entries, video analysis, community contributions
    - Mastery (4): Technique perfectionist, multi-stroke, safety, endurance
    - Milestone (10): Time-based, XP-based, level-based achievements

  - **4 Achievement Tiers:**
    - Bronze: Entry-level achievements (100-200 XP)
    - Silver: Intermediate achievements (200-500 XP)
    - Gold: Advanced achievements (400-700 XP)
    - Platinum: Elite achievements (800-1500 XP)

  - **Core Functions:**
    - Progress calculation for each achievement
    - Unlock detection and validation
    - Category and tier filtering
    - Secret achievements system
    - Statistics and analytics
    - Recently unlocked sorting
    - Almost unlocked detection (75%+ threshold)

- Created AchievementBadge component (`/components/AchievementBadge.tsx`)
  - **Three Display Variants:**
    - **Compact:** Horizontal layout for lists (icon + title + progress bar)
    - **Default:** Full card with icon, title, description, XP reward, progress
    - **Large:** Detailed card with gradient, stats, unlock date

  - **Visual Features:**
    - Tier-colored gradients and badges
    - Lock icon for locked achievements
    - Progress bars with tier colors
    - XP reward display with star icon
    - Tier badge (Bronze/Silver/Gold/Platinum)
    - Opacity effect for locked achievements
    - Secret achievements show "???" when locked

- Created AchievementUnlockModal component (`/components/AchievementUnlockModal.tsx`)
  - **Celebration Animations:**
    - Fade and scale entrance
    - Icon bounce effect
    - Continuous sparkle animation (6 sparkles)
    - Smooth close animation

  - **Visual Design:**
    - Tier-specific gradient background
    - Large achievement icon with tier ring
    - "ACHIEVEMENT UNLOCKED" badge with trophy icon
    - XP reward display
    - Category badge
    - BlurView background overlay

  - **User Experience:**
    - Tap "Awesome!" button to close
    - Sparkles rotate and fade around screen
    - Smooth animations throughout

- Enhanced achievements screen (`/app/achievements.tsx`)
  - **Statistics Overview:**
    - Total unlocked vs total count
    - Breakdown by tier (Bronze/Silver/Gold/Platinum)
    - Trophy icon for visual appeal

  - **Advanced Filtering:**
    - Category filter (All, Learning, Practice, Streak, Social, Mastery, Milestone)
    - Tier filter (All, Bronze, Silver, Gold, Platinum)
    - "Unlocked Only" toggle filter
    - Horizontal scrolling filter chips

  - **Section List Display:**
    - Grouped by category with section headers
    - Category icon and name
    - Unlocked count per category
    - Progress bars for locked achievements
    - Empty state when no matches

  - **Interaction:**
    - Tap unlocked achievements to view details in modal
    - Secret achievements hidden until unlocked
    - Real-time progress calculation
    - Smooth scrolling

### Features Implemented:
- ✅ 35 total achievements across 6 categories
- ✅ 4-tier system (Bronze, Silver, Gold, Platinum)
- ✅ Secret achievements (4 hidden until unlocked)
- ✅ Progress tracking for all achievements
- ✅ Achievement badge component (3 variants)
- ✅ Unlock celebration modal with animations
- ✅ Full achievements list screen with filters
- ✅ Category and tier filtering
- ✅ Statistics overview
- ✅ XP rewards (100-1500 XP per achievement)
- ✅ Tier-colored gradients and UI elements

### Technical Implementation:
- TypeScript with strict typing
- Comprehensive achievement definition system
- Progress calculation algorithms
- Filtering and sorting utilities
- Animated components (fade, scale, bounce, sparkle)
- Gradient backgrounds with tier colors
- SectionList for performance
- useMemo for optimized filtering
- BlurView effects

### Next Priority Features:
- Integrate achievements checking into user actions
- Connect to Supabase achievements table
- Add achievement unlock triggers
- Journal system UI
- Custom practice session builder
- Community feed

## 2025-10-30

### Authentication System Implementation
- Created Authentication Context
  - Added user session management
  - Added profile management
  - Added auth state change handlers
  - Added profile refresh functionality

### Social Authentication Implementation
- Updated `/app/onboarding/account.tsx`
  - Added Supabase authentication integration
  - Implemented email/password signup
  - Added guest user support
  - Added error handling and loading states
  - Created user profiles on signup

### Files Changed
- Created `/contexts/AuthContext.tsx`
  - Implemented auth state management
  - Added user profile management
  - Added session handling

- Created `/hooks/useAuthCallback.ts`
  - Added OAuth callback handling
  - Added profile creation for OAuth users
  - Added navigation management

- Modified `/app/_layout.tsx`
  - Added AuthProvider to app root
  - Wrapped entire app in auth context

- Modified `/app/onboarding/account.tsx`
  - Added authentication logic
  - Added social authentication (Google, Apple)
  - Added loading states
  - Added error handling
  - Added profile creation

### Authentication Features Implementation
- Created `/app/auth/forgot-password.tsx`
  - Added password reset request flow
  - Added email validation
  - Added success/error handling

- Created `/app/auth/reset-password.tsx`
  - Added password update functionality
  - Added password validation
  - Added confirmation checks

- Created `/app/auth/confirm-email.tsx`
  - Added email verification flow
  - Added resend verification option
  - Added success/error states

- Updated authentication utilities
  - Added password reset functions
  - Added email verification functions
  - Added proper error handling

### Assessment Implementation
- Updated `/app/onboarding/assessment.tsx`
  - Added Supabase integration
  - Implemented assessment data storage
  - Added skill level calculation
  - Added profile updates
  - Added error handling

### Assessment Features
- Data Storage:
  - Saves comprehensive assessment data
  - Stores user preferences
  - Tracks learning goals
  - Records practice environment details

- Skill Level Calculation:
  - Analyzes water comfort
  - Evaluates swimming ability
  - Counts specific skills
  - Determines appropriate learning path

- Profile Integration:
  - Updates user skill level
  - Sets initial module
  - Maintains assessment history
  - Enables progress tracking

### Lesson Scheduling Implementation
- Created calendar interface in `/app/calendar/index.tsx`
  - Added calendar view with lesson markers
  - Implemented lesson list view per day
  - Added lesson status indicators
  - Included time formatting utilities
  - Added navigation to lesson details

- Enhanced `/utils/lessonScheduler.ts`
  - Added comprehensive scheduling utilities
  - Implemented conflict detection
  - Added lesson rescheduling functionality
  - Included status management
  - Added upcoming lessons retrieval

### Features Implemented
- Calendar View:
  - Month/week visualization
  - Daily lesson breakdowns
  - Status indicators (scheduled/completed/missed)
  - Time slot management

- Scheduling System:
  - User preference handling
  - Conflict detection
  - Automatic slot allocation
  - Rescheduling support
  - Status tracking

### Progress Tracking Implementation
- Created progress dashboard in `/app/progress/index.tsx`
  - Added current level display
  - Added lesson completion stats
  - Added streak tracking
  - Implemented module progress visualization
  - Added achievement previews
  - Added activity charts

- Enhanced `/utils/progressTracker.ts`
  - Added comprehensive progress tracking
  - Added streak calculations
  - Added performance metrics
  - Added confidence tracking
  - Added module progress tracking

### Features Implemented
- Progress Dashboard:
  - Current skill level display
  - Lesson completion counter
  - Streak tracking
  - Module progress bars
  - Achievement previews
  - Weekly activity charts

- Progress Tracking System:
  - Lesson completion tracking
  - Performance metrics
  - Confidence scoring
  - Module progress tracking
  - Streak calculations
  - Activity monitoring

### Notification System Implementation
- Created notification utilities in `/utils/notifications.ts`
  - Added push notification setup
  - Added notification preferences management
  - Implemented auth event notifications
  - Added lesson reminders
  - Added progress update notifications
  - Added achievement notifications
  - Added daily tips

- Created notification settings screen in `/app/settings/notifications.tsx`
  - Added preference toggles
  - Added notification descriptions
  - Added push notification registration
  - Added preference persistence
  - Added user-friendly interface

### Features Implemented
- Push Notifications:
  - Device token registration
  - Permission handling
  - Channel configuration
  - Token persistence

- Notification Types:
  - Auth events (login, signup, password reset)
  - Lesson reminders
  - Progress updates
  - Achievement unlocks
  - Daily swimming tips

- User Preferences:
  - Individual toggle controls
  - Persistent settings
  - Category management
  - User-friendly interface

### Next Steps
1. Create adaptive learning algorithms
2. Add social features
3. Implement chat support
4. Add video lessons

### Documentation Setup
- Created `rules.md` with project development standards
  - Defined code organization structure
  - Established naming conventions
  - Set coding standards
  - Created documentation requirements
  - Defined security practices
  
- Created `userflow.md` with complete application flow
  - Documented onboarding process
  - Mapped main navigation flows
  - Defined feature-specific workflows
  - Outlined data synchronization
  - Documented security & error handling

### Schema Analysis
- Reviewed existing Supabase schema in `/supabase/schema.sql`
- Current schema includes:
  - User profiles and authentication
  - Assessment system
  - Journal entries
  - Lesson feedback and scheduling
  - Safety check-ins
  - Achievements and leaderboard
  - Skill progress tracking
  - Row Level Security policies
  - Storage buckets for media

### Files Changed
- Created `/rules.md`
- Created `/userflow.md`
- Created `/changes.md`
- Analyzed `/supabase/schema.sql`

### Next Steps
1. Set up Supabase client integration
2. Implement authentication system
   - Email/password signup
   - OAuth providers (Google, Apple)
   - Guest session handling
3. Create API utility functions for:
   - User management
   - Assessment flow
   - Lesson scheduling
   - Progress tracking
   - Journal entries
4. Replace mock data with real backend calls in:
   - Onboarding flow
   - Main navigation screens
   - Lesson management
   - Progress tracking