import { Module, Lesson, Exercise, PoolSession, DrylandRoutine, CommunityPost, CommunityUser, CommunityReaction, Challenge, ChallengeLeaderboardEntry } from './types';

export const MODULES: Module[] = [
  {
    id: 'water-confidence',
    level: 'beginner-1',
    title: 'Water Confidence & Safety',
    description: 'Build comfort and safety awareness in water',
    duration: '2-4 weeks',
    prerequisites: [],
    lessons: [
      {
        id: 'getting-comfortable',
        moduleId: 'water-confidence',
        title: 'Getting Comfortable in Water',
        description: 'Learn to relax and move confidently in shallow water',
        duration: '15 min',
        difficulty: 'beginner',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800',
        skills: ['Water entry', 'Walking in water', 'Basic movements'],
        prerequisites: [],
        steps: [],
        drills: [],
        commonMistakes: [],
        checklistItems: [
          'I can enter the water confidently',
          'I can walk comfortably in chest-deep water',
          'I can perform basic movements without fear',
        ],
      },
      {
        id: 'breathing-fundamentals',
        moduleId: 'water-confidence',
        title: 'Breathing Fundamentals',
        description: 'Master rhythmic breathing techniques',
        duration: '15 min',
        difficulty: 'beginner',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=800',
        skills: ['Inhale technique', 'Exhale underwater', 'Breath control'],
        prerequisites: ['getting-comfortable'],
        steps: [
          {
            number: 1,
            title: 'Get Comfortable',
            instruction: 'Stand in chest-deep water where you feel secure. Place both hands on the pool wall or hold onto a stable ladder.',
            keyPoints: ['Feet flat on pool bottom', 'Shoulders relaxed', 'Natural standing posture'],
            safetyNote: 'Always practice in an area where you can stand comfortably',
          },
          {
            number: 2,
            title: 'Face Submersion',
            instruction: 'Take a deep breath through your mouth. Hold your breath and gently lower your face into the water. Keep your mouth and nose closed.',
            keyPoints: ['Eyes can be open or closed', 'Keep face relaxed', 'No need to go deep - just below surface'],
            safetyNote: 'Start with just 2-3 seconds underwater',
          },
          {
            number: 3,
            title: 'Underwater Exhalation',
            instruction: 'While your face is underwater, slowly exhale through your nose (and mouth if comfortable). You should see bubbles.',
            keyPoints: ['Slow, steady exhale', 'Don\'t rush', 'Exhale completely'],
            safetyNote: 'If water goes up your nose, exhale more forcefully through your nose',
          },
          {
            number: 4,
            title: 'Surface Inhalation',
            instruction: 'Lift your head above water and immediately take a quick, deep breath through your mouth. Don\'t wipe your face - just breathe.',
            keyPoints: ['Quick inhale', 'Through mouth only', 'Head doesn\'t need to lift high'],
            safetyNote: 'Practice the timing: exhale underwater, inhale above',
          },
          {
            number: 5,
            title: 'Rhythmic Breathing',
            instruction: 'Repeat steps 2-4 in a rhythm: down and exhale, up and inhale. Start slow and find your comfortable rhythm.',
            keyPoints: ['Establish a steady rhythm', 'Don\'t hold your breath', 'Relaxation is key'],
            safetyNote: 'Take breaks whenever needed - there\'s no rush',
          },
        ],
        drills: [
          {
            id: 'drill-1',
            title: 'Bubble Blowing',
            setup: 'Stand in chest-deep water holding the wall',
            exercise: 'Submerge your face and blow bubbles through your nose for 5 seconds. Surface and breathe. Repeat 10 times.',
            goal: 'Develop comfortable exhalation underwater',
            duration: '3 minutes',
            progression: 'Increase underwater time to 10 seconds, then 15 seconds',
          },
          {
            id: 'drill-2',
            title: 'Bobbing',
            setup: 'Stand in shoulder-deep water',
            exercise: 'Take a breath, submerge completely while exhaling, then surface and inhale. Repeat in a steady rhythm.',
            goal: 'Master the breath cycle: exhale down, inhale up',
            duration: '5 minutes',
            progression: 'Increase depth slightly, speed up rhythm',
          },
          {
            id: 'drill-3',
            title: 'Walking Breath Drill',
            setup: 'Stand in waist-deep water',
            exercise: 'Walk slowly forward. Every 3 steps, turn your head to the side, inhale, turn face down into water, and exhale. Repeat.',
            goal: 'Simulate swimming breathing pattern',
            duration: '4 minutes',
            progression: 'Reduce to every 2 steps, then try while floating on front with kickboard',
          },
        ],
        commonMistakes: [
          {
            id: 'mistake-1',
            wrongDescription: 'Holding breath underwater',
            wrongImageUrl: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400',
            rightDescription: 'Exhaling continuously underwater creates rhythm and prevents CO2 buildup',
            rightImageUrl: 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=400',
          },
          {
            id: 'mistake-2',
            wrongDescription: 'Lifting head too high to breathe',
            wrongImageUrl: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400',
            rightDescription: 'Turn head just enough for mouth to clear water - one goggle stays in water',
            rightImageUrl: 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=400',
          },
          {
            id: 'mistake-3',
            wrongDescription: 'Breathing in through nose',
            wrongImageUrl: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400',
            rightDescription: 'Always inhale through mouth - it\'s faster and prevents water inhalation',
            rightImageUrl: 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=400',
          },
        ],
        checklistItems: [
          'I can exhale comfortably underwater',
          'I can inhale quickly above water',
          'I can maintain rhythmic breathing',
        ],
      },
      {
        id: 'floating-front',
        moduleId: 'water-confidence',
        title: 'Floating on Front',
        description: 'Learn to float face-down with confidence',
        duration: '15 min',
        difficulty: 'beginner',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1560089000-7433a4ebbd64?w=800',
        skills: ['Front float position', 'Relaxation', 'Recovery to standing'],
        prerequisites: ['breathing-fundamentals'],
        steps: [],
        drills: [],
        commonMistakes: [],
        checklistItems: [
          'I can float on my front for 30 seconds',
          'I can remain relaxed while floating',
          'I can recover to standing safely',
        ],
      },
      {
        id: 'floating-back',
        moduleId: 'water-confidence',
        title: 'Floating on Back',
        description: 'Master the essential survival skill of back floating',
        duration: '15 min',
        difficulty: 'beginner',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1576610616656-d3aa5d1f4534?w=800',
        skills: ['Back float position', 'Breathing while floating', 'Recovery technique'],
        prerequisites: ['floating-front'],
        steps: [],
        drills: [],
        commonMistakes: [],
        checklistItems: [
          'I can assume back float position without assistance',
          'I can maintain horizontal body position for 30+ seconds',
          'I can breathe comfortably while floating',
          'I can recover to standing position safely',
        ],
      },
    ],
  },
  {
    id: 'foundation-skills',
    level: 'beginner-2',
    title: 'Foundation Skills',
    description: 'Build fundamental swimming techniques',
    duration: '4-6 weeks',
    prerequisites: ['water-confidence'],
    lessons: [
      {
        id: 'body-position',
        moduleId: 'foundation-skills',
        title: 'Body Position & Streamline',
        description: 'Learn proper horizontal body alignment',
        duration: '20 min',
        difficulty: 'beginner',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1438029071396-1e831a7fa6d8?w=800',
        skills: ['Streamline position', 'Body alignment', 'Core engagement'],
        prerequisites: ['floating-back'],
        steps: [],
        drills: [],
        commonMistakes: [],
        checklistItems: [
          'I can maintain horizontal body position',
          'I understand streamline form',
          'I can engage my core while swimming',
        ],
      },
    ],
  },
];

export const DRYLAND_EXERCISES: Exercise[] = [
  {
    id: 'freestyle-arm-circles',
    title: 'Freestyle Arm Circles',
    category: 'simulation',
    difficulty: 'beginner',
    equipment: [],
    targetedMuscles: ['Shoulders', 'Upper back', 'Core'],
    duration: '2-3 min',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
    steps: [
      {
        number: 1,
        title: 'Setup',
        description: 'Stand with feet shoulder-width apart. Engage your core. Arms relaxed at sides.',
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
      },
      {
        number: 2,
        title: 'Movement',
        description: 'Extend right arm forward and up, mimicking freestyle stroke. Rotate torso as arm moves (simulate breathing rotation). Complete full circle, brushing thumb past thigh. Repeat with left arm. Continue alternating for 30 seconds.',
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
        breathing: 'Exhale as arm pulls back, inhale as arm reaches forward',
        reps: '20 per arm OR 1 minute continuous',
      },
    ],
    formTips: [
      'Keep core tight throughout movement',
      'Full range of motion - fingertips should touch above head',
      'Maintain smooth, controlled rotations',
      'Focus on mimicking your swimming motion',
    ],
    commonMistakes: [
      "Don't shrug shoulders up - keep them relaxed",
      'Avoid stiff, robotic movements - stay fluid',
      "Don't rush - quality over speed",
      'Keep your core engaged throughout',
    ],
    modifications: {
      easier: 'Slow down tempo, focus on form',
      harder: 'Add resistance band, increase speed, hold light weights',
      injury: 'If shoulder pain, reduce range of motion',
    },
    swimmingConnection: 'Strengthens the exact muscle groups used in freestyle stroke. Builds muscle memory for proper arm path and rotation. Improves shoulder endurance for longer swimming sessions.',
  },
  {
    id: 'plank-shoulder-taps',
    title: 'Plank with Shoulder Taps',
    category: 'strength',
    difficulty: 'intermediate',
    equipment: [],
    targetedMuscles: ['Core', 'Shoulders', 'Arms'],
    duration: '3 min',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800',
    steps: [
      {
        number: 1,
        title: 'Starting Position',
        description: 'Begin in high plank position with hands directly under shoulders. Body should form a straight line from head to heels.',
        imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400',
        breathing: 'Breathe steadily throughout',
      },
      {
        number: 2,
        title: 'Shoulder Taps',
        description: 'Keep hips stable. Tap right hand to left shoulder, return to plank. Then tap left hand to right shoulder. Minimize hip rotation.',
        imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400',
        reps: '20 total taps (10 each side)',
      },
    ],
    formTips: [
      'Keep hips square - minimal rotation',
      'Maintain straight line from head to heels',
      'Engage your core to prevent sagging',
      'Move with control, not speed',
    ],
    commonMistakes: [
      "Don't let hips rock side to side",
      'Avoid sagging hips or raised bottom',
      "Don't hold your breath - breathe consistently",
      'Keep neck neutral - look at the floor',
    ],
    modifications: {
      easier: 'Perform from knees instead of toes',
      harder: 'Add push-up between taps, increase reps',
      injury: 'Skip if wrist pain present',
    },
    swimmingConnection: 'Builds core stability essential for maintaining horizontal body position in water. Strengthens shoulders for endurance swimming.',
  },
  {
    id: 'flutter-kicks',
    title: 'Dryland Flutter Kicks',
    category: 'simulation',
    difficulty: 'beginner',
    equipment: [],
    targetedMuscles: ['Hip flexors', 'Quads', 'Core'],
    duration: '2 min',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800',
    steps: [
      {
        number: 1,
        title: 'Position',
        description: 'Lie on back with hands placed under hips for lower back support. Keep lower back pressed to floor. Lift legs slightly off ground.',
        imageUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400',
      },
      {
        number: 2,
        title: 'Kicking',
        description: 'Keep legs relatively straight (slight knee bend). Alternate quick, small kicks. Kick from the hips, not the knees. Pointed toes.',
        imageUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400',
        breathing: 'Breathe steadily throughout',
        reps: '30 seconds, rest, repeat 3 times',
      },
    ],
    formTips: [
      'Keep kicks small and fast - 6 inches amplitude',
      'Point your toes like a ballerina',
      'Kick from the hip, keep knees mostly straight',
      'Press lower back into floor',
    ],
    commonMistakes: [
      "Don't bend knees too much - keep legs extended",
      'Avoid large, slow kicks - keep them quick and compact',
      "Don't arch your lower back off the floor",
      'Keep toes pointed, not flexed',
    ],
    modifications: {
      easier: 'Reduce kick speed and duration, bend knees slightly more',
      harder: 'Lift head and shoulders off ground, increase duration',
      injury: 'Stop if lower back pain occurs. Keep legs higher if needed.',
    },
    swimmingConnection: 'Mimics the exact freestyle and backstroke kick pattern. Builds leg endurance and hip flexor strength for sustained kicking in the pool.',
  },
];

// Dryland Routines (MVP Phase 1: 10 pre-built routines)
export const DRYLAND_ROUTINES: DrylandRoutine[] = [
  {
    id: 'beginner-total-body',
    title: 'Beginner Total Body Warm-up',
    description: 'Perfect pre-swim routine to activate all major muscle groups and prepare your body for the pool',
    level: 'beginner',
    duration: 15,
    focusAreas: ['Full Body', 'Warm-up', 'Mobility'],
    equipment: [],
    exercises: [
      { exerciseId: 'freestyle-arm-circles', duration: 120, reps: 20, restAfter: 30 },
      { exerciseId: 'plank-shoulder-taps', duration: 90, reps: 10, restAfter: 30 },
      { exerciseId: 'flutter-kicks', duration: 120, reps: 30, restAfter: 30 },
      { exerciseId: 'freestyle-arm-circles', duration: 120, reps: 20, restAfter: 30 },
      { exerciseId: 'flutter-kicks', duration: 120, reps: 30, restAfter: 0 },
    ],
    thumbnailUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
    estimatedCalories: 80,
    targetMuscles: ['Full Body', 'Core', 'Shoulders', 'Legs'],
  },
  {
    id: 'core-strength-foundation',
    title: 'Core Strength Foundation',
    description: 'Build the core stability essential for maintaining proper body position in water',
    level: 'beginner',
    duration: 20,
    focusAreas: ['Core', 'Stability', 'Balance'],
    equipment: [],
    exercises: [
      { exerciseId: 'plank-shoulder-taps', duration: 60, sets: 3, restAfter: 30 },
      { exerciseId: 'flutter-kicks', duration: 120, reps: 40, restAfter: 45 },
      { exerciseId: 'plank-shoulder-taps', duration: 90, reps: 15, restAfter: 30 },
      { exerciseId: 'flutter-kicks', duration: 150, reps: 50, restAfter: 45 },
      { exerciseId: 'plank-shoulder-taps', duration: 90, reps: 15, restAfter: 0 },
    ],
    thumbnailUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800',
    estimatedCalories: 110,
    targetMuscles: ['Core', 'Abs', 'Obliques', 'Lower Back'],
  },
  {
    id: 'shoulder-mobility-freestyle',
    title: 'Shoulder Mobility for Freestyle',
    description: 'Improve shoulder flexibility and range of motion for efficient freestyle stroke',
    level: 'beginner',
    duration: 12,
    focusAreas: ['Shoulders', 'Mobility', 'Freestyle'],
    equipment: [],
    exercises: [
      { exerciseId: 'freestyle-arm-circles', duration: 150, reps: 25, restAfter: 30 },
      { exerciseId: 'freestyle-arm-circles', duration: 150, reps: 25, restAfter: 30 },
      { exerciseId: 'plank-shoulder-taps', duration: 60, reps: 10, restAfter: 30 },
      { exerciseId: 'freestyle-arm-circles', duration: 150, reps: 25, restAfter: 0 },
    ],
    thumbnailUrl: 'https://images.unsplash.com/photo-1571019613576-2b22c76fd955?w=800',
    estimatedCalories: 60,
    targetMuscles: ['Shoulders', 'Rotator Cuff', 'Upper Back'],
  },
  {
    id: 'kick-power-development',
    title: 'Kick Power Development',
    description: 'Strengthen legs and hip flexors for more powerful and efficient kicking',
    level: 'intermediate',
    duration: 18,
    focusAreas: ['Legs', 'Kicking', 'Power'],
    equipment: [],
    exercises: [
      { exerciseId: 'flutter-kicks', duration: 180, reps: 60, restAfter: 45 },
      { exerciseId: 'flutter-kicks', duration: 180, reps: 60, restAfter: 45 },
      { exerciseId: 'plank-shoulder-taps', duration: 60, reps: 10, restAfter: 30 },
      { exerciseId: 'flutter-kicks', duration: 240, reps: 80, restAfter: 60 },
      { exerciseId: 'flutter-kicks', duration: 180, reps: 60, restAfter: 0 },
    ],
    thumbnailUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
    estimatedCalories: 100,
    targetMuscles: ['Hip Flexors', 'Quads', 'Hamstrings', 'Glutes'],
  },
  {
    id: 'pre-swim-activation',
    title: '10-Minute Pre-Swim Activation',
    description: 'Quick and effective routine to prepare your body right before entering the pool',
    level: 'beginner',
    duration: 10,
    focusAreas: ['Warm-up', 'Activation', 'Quick Prep'],
    equipment: [],
    exercises: [
      { exerciseId: 'freestyle-arm-circles', duration: 120, reps: 15, restAfter: 20 },
      { exerciseId: 'plank-shoulder-taps', duration: 60, reps: 8, restAfter: 20 },
      { exerciseId: 'flutter-kicks', duration: 90, reps: 20, restAfter: 20 },
      { exerciseId: 'freestyle-arm-circles', duration: 120, reps: 15, restAfter: 0 },
    ],
    thumbnailUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
    estimatedCalories: 50,
    targetMuscles: ['Full Body', 'Core', 'Shoulders'],
  },
  {
    id: 'upper-body-endurance',
    title: 'Upper Body Endurance Builder',
    description: 'Develop arm and shoulder endurance for longer swimming sessions without fatigue',
    level: 'intermediate',
    duration: 25,
    focusAreas: ['Upper Body', 'Endurance', 'Strength'],
    equipment: [],
    exercises: [
      { exerciseId: 'freestyle-arm-circles', duration: 180, reps: 30, restAfter: 45 },
      { exerciseId: 'plank-shoulder-taps', duration: 120, reps: 20, restAfter: 45 },
      { exerciseId: 'freestyle-arm-circles', duration: 180, reps: 30, restAfter: 45 },
      { exerciseId: 'plank-shoulder-taps', duration: 120, reps: 20, restAfter: 45 },
      { exerciseId: 'freestyle-arm-circles', duration: 180, reps: 30, restAfter: 30 },
      { exerciseId: 'plank-shoulder-taps', duration: 120, reps: 20, restAfter: 0 },
    ],
    thumbnailUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
    estimatedCalories: 140,
    targetMuscles: ['Shoulders', 'Arms', 'Upper Back', 'Core'],
  },
  {
    id: 'morning-swimmer-routine',
    title: 'Morning Swimmer Routine',
    description: 'Energizing morning routine to wake up your muscles and prepare for an early swim',
    level: 'beginner',
    duration: 15,
    focusAreas: ['Morning', 'Energy', 'Full Body'],
    equipment: [],
    exercises: [
      { exerciseId: 'freestyle-arm-circles', duration: 120, reps: 20, restAfter: 30 },
      { exerciseId: 'flutter-kicks', duration: 120, reps: 30, restAfter: 30 },
      { exerciseId: 'plank-shoulder-taps', duration: 90, reps: 12, restAfter: 30 },
      { exerciseId: 'freestyle-arm-circles', duration: 120, reps: 20, restAfter: 30 },
      { exerciseId: 'flutter-kicks', duration: 120, reps: 30, restAfter: 0 },
    ],
    thumbnailUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800',
    estimatedCalories: 85,
    targetMuscles: ['Full Body', 'Core', 'Shoulders', 'Legs'],
  },
  {
    id: 'freestyle-technique-dryland',
    title: 'Freestyle Technique Dryland',
    description: 'Perfect your freestyle technique on land with focused movement patterns',
    level: 'intermediate',
    duration: 20,
    focusAreas: ['Freestyle', 'Technique', 'Muscle Memory'],
    equipment: [],
    exercises: [
      { exerciseId: 'freestyle-arm-circles', duration: 180, reps: 25, restAfter: 45 },
      { exerciseId: 'plank-shoulder-taps', duration: 90, reps: 15, restAfter: 45 },
      { exerciseId: 'flutter-kicks', duration: 150, reps: 40, restAfter: 45 },
      { exerciseId: 'freestyle-arm-circles', duration: 180, reps: 25, restAfter: 45 },
      { exerciseId: 'plank-shoulder-taps', duration: 90, reps: 15, restAfter: 30 },
      { exerciseId: 'flutter-kicks', duration: 150, reps: 40, restAfter: 0 },
    ],
    thumbnailUrl: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=800',
    estimatedCalories: 115,
    targetMuscles: ['Shoulders', 'Core', 'Hip Flexors', 'Upper Back'],
  },
  {
    id: 'post-swim-cooldown',
    title: 'Post-Swim Cooldown & Stretch',
    description: 'Gentle routine to cool down after swimming and prevent muscle soreness',
    level: 'beginner',
    duration: 12,
    focusAreas: ['Cooldown', 'Flexibility', 'Recovery'],
    equipment: [],
    exercises: [
      { exerciseId: 'freestyle-arm-circles', duration: 120, reps: 15, restAfter: 30 },
      { exerciseId: 'plank-shoulder-taps', duration: 60, reps: 8, restAfter: 30 },
      { exerciseId: 'flutter-kicks', duration: 90, reps: 20, restAfter: 30 },
      { exerciseId: 'freestyle-arm-circles', duration: 90, reps: 12, restAfter: 0 },
    ],
    thumbnailUrl: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=800',
    estimatedCalories: 55,
    targetMuscles: ['Full Body', 'Shoulders', 'Legs'],
  },
  {
    id: 'advanced-swim-conditioning',
    title: 'Advanced Swim Conditioning',
    description: 'High-intensity dryland routine for experienced swimmers looking to level up',
    level: 'advanced',
    duration: 30,
    focusAreas: ['Conditioning', 'Strength', 'Endurance'],
    equipment: [],
    exercises: [
      { exerciseId: 'freestyle-arm-circles', duration: 240, reps: 40, restAfter: 45 },
      { exerciseId: 'plank-shoulder-taps', duration: 150, reps: 25, restAfter: 45 },
      { exerciseId: 'flutter-kicks', duration: 240, reps: 80, restAfter: 60 },
      { exerciseId: 'freestyle-arm-circles', duration: 240, reps: 40, restAfter: 45 },
      { exerciseId: 'plank-shoulder-taps', duration: 150, reps: 25, restAfter: 45 },
      { exerciseId: 'flutter-kicks', duration: 240, reps: 80, restAfter: 60 },
      { exerciseId: 'plank-shoulder-taps', duration: 150, reps: 25, restAfter: 0 },
    ],
    thumbnailUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800',
    estimatedCalories: 180,
    targetMuscles: ['Full Body', 'Core', 'Shoulders', 'Legs', 'Arms'],
  },
];

export const ASSESSMENT_QUESTIONS = {
  waterComfort: {
    question: 'How comfortable are you in water?',
    options: [
      { value: 'very-uncomfortable', emoji: '😰', label: 'Very Uncomfortable', description: "I'm afraid of water/have had traumatic experience" },
      { value: 'uncomfortable', emoji: '😟', label: 'Uncomfortable', description: "I'm nervous in water deeper than waist-high" },
      { value: 'neutral', emoji: '😐', label: 'Neutral', description: "I'm okay in shallow water but anxious in deep end" },
      { value: 'comfortable', emoji: '🙂', label: 'Comfortable', description: "I can relax in deep water but can't swim well" },
      { value: 'very-comfortable', emoji: '😄', label: 'Very Comfortable', description: "I'm confident in deep water" },
    ],
  },
  swimmingAbility: {
    question: 'Which best describes your swimming ability?',
    options: [
      { value: 'non-swimmer', emoji: '🚫', label: 'Non-swimmer', description: 'I cannot swim at all' },
      { value: 'beginner', emoji: '🌊', label: 'Beginner', description: 'I can float/doggy paddle but no proper strokes' },
      { value: 'basic-swimmer', emoji: '🏊♀️', label: 'Basic Swimmer', description: 'I can do basic freestyle but tire quickly' },
      { value: 'intermediate', emoji: '🏊', label: 'Intermediate', description: 'I can swim multiple strokes with some technique' },
      { value: 'advanced', emoji: '🏊♂️', label: 'Advanced', description: 'I swim regularly with good form' },
    ],
  },
  fitnessLevel: {
    question: 'How would you rate your current fitness level?',
    options: [
      { value: 'sedentary', emoji: '🛋️', label: 'Sedentary', description: 'Little to no regular exercise' },
      { value: 'lightly-active', emoji: '🚶', label: 'Lightly Active', description: 'Walk/light exercise 1-2x per week' },
      { value: 'moderately-active', emoji: '🏃', label: 'Moderately Active', description: 'Exercise 3-4x per week' },
      { value: 'very-active', emoji: '💪', label: 'Very Active', description: 'Exercise 5+ times per week' },
      { value: 'athlete', emoji: '🏋️', label: 'Athlete', description: 'Regular intense training' },
    ],
  },
};

// Pool Practice Sessions (MVP Phase 1: 5 pre-built sessions)
export const POOL_SESSIONS: PoolSession[] = [
  {
    id: 'first-time-in-pool',
    title: 'First Time in Pool',
    description: 'Water confidence focus with gentle encouragement. Perfect for your first pool visit.',
    level: 'beginner',
    duration: 20,
    focusAreas: ['Water Confidence', 'Breathing', 'Floating', 'Basic Movement'],
    equipment: ['Swim cap', 'Goggles', 'Kickboard (optional)'],
    safetyChecklist: [
      'Pool is supervised or swimming with a buddy',
      'Know where emergency equipment is located',
      'Checked water depth - staying in shallow area',
      'Have towel and water bottle ready',
    ],
    intervals: [
      {
        id: 'warmup-1',
        type: 'warmup',
        title: 'Pool Entry & Orientation',
        description: 'Get comfortable in the pool environment',
        duration: 180, // 3 minutes
        instructions: [
          'Enter pool slowly using steps or ladder',
          'Stand in waist-deep water',
          'Get face wet and practice putting face in water',
          'Walk around the shallow end',
        ],
        audioCoaching: [
          'Welcome! Take your time entering the pool. There\'s no rush.',
          'Great job! Now let\'s walk around and get comfortable.',
          'You\'re doing amazing. Take deep breaths and relax.',
        ],
      },
      {
        id: 'drill-1',
        type: 'drill',
        title: 'Breathing Practice',
        description: 'Learn to exhale underwater and inhale above',
        duration: 240, // 4 minutes
        instructions: [
          'Stand in chest-deep water',
          'Take a deep breath above water',
          'Put face in water and exhale slowly through nose',
          'Lift head and inhale quickly',
          'Repeat 10 times',
        ],
        audioCoaching: [
          'Let\'s practice breathing. Take a deep breath in.',
          'Now put your face in and blow bubbles slowly.',
          'Great! Lift your head and breathe in.',
          'You\'re getting it! Keep going at your own pace.',
        ],
      },
      {
        id: 'rest-1',
        type: 'rest',
        title: 'Rest & Hydration',
        description: 'Take a break and drink water',
        duration: 60, // 1 minute
        instructions: ['Hold onto the wall', 'Catch your breath', 'Drink some water'],
        audioCoaching: [
          'Great work! Take a rest.',
          'Drink some water and relax.',
          'You\'re doing fantastic!',
        ],
      },
      {
        id: 'drill-2',
        type: 'drill',
        title: 'Front Float Practice',
        description: 'Learn to relax and float on your front',
        duration: 300, // 5 minutes
        instructions: [
          'Hold the wall with both hands',
          'Take a deep breath',
          'Lean forward and let your legs float up',
          'Hold for 5 seconds',
          'Stand up slowly',
          'Repeat 5 times',
        ],
        audioCoaching: [
          'Now let\'s try floating on your front.',
          'Hold the wall and lean forward gently.',
          'Feel your body naturally wanting to float.',
          'Hold it... and stand up slowly.',
          'Excellent! Your body knows how to float.',
        ],
      },
      {
        id: 'rest-2',
        type: 'rest',
        title: 'Rest Break',
        description: 'Recover before next drill',
        duration: 60, // 1 minute
        instructions: ['Stand in shallow water', 'Breathe normally', 'Shake out your arms'],
        audioCoaching: [
          'Another great effort! Take a break.',
          'You\'re building confidence with every attempt.',
        ],
      },
      {
        id: 'drill-3',
        type: 'drill',
        title: 'Back Float Practice',
        description: 'Float on your back with wall support',
        duration: 300, // 5 minutes
        instructions: [
          'Face the wall and hold it behind you',
          'Gently lean back',
          'Let your legs float up',
          'Keep chin up, look at ceiling',
          'Hold for 5 seconds',
          'Use wall to stand up',
        ],
        audioCoaching: [
          'Time for back floating - a key safety skill.',
          'Hold the wall behind you and lean back gently.',
          'Keep your chin up and look at the ceiling.',
          'Your body naturally floats when you relax.',
          'Perfect! This is great progress.',
        ],
      },
      {
        id: 'practice-1',
        type: 'practice',
        title: 'Gentle Movement',
        description: 'Combine walking and floating',
        duration: 240, // 4 minutes
        instructions: [
          'Walk in waist-deep water (2 minutes)',
          'Practice front float for 3 seconds, then stand (1 minute)',
          'Walk backwards slowly (1 minute)',
        ],
        audioCoaching: [
          'Let\'s practice some gentle movement.',
          'Walk around at your comfortable pace.',
          'Try a quick front float, then stand.',
          'You\'re doing wonderfully!',
        ],
      },
      {
        id: 'cooldown-1',
        type: 'cooldown',
        title: 'Cooldown & Celebration',
        description: 'Gentle movement and reflection',
        duration: 120, // 2 minutes
        instructions: [
          'Walk slowly in shallow water',
          'Take deep breaths',
          'Smile and be proud of yourself!',
        ],
        audioCoaching: [
          'You did it! Your first pool session is complete.',
          'Walk slowly and take deep breaths.',
          'You should be so proud of yourself today.',
          'Remember this feeling - you\'re on your way to becoming a swimmer!',
        ],
      },
    ],
    thumbnailUrl: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800',
    estimatedCalories: 80,
    estimatedDistance: 0, // First session, focus on comfort not distance
  },
  {
    id: 'freestyle-fundamentals',
    title: 'Freestyle Fundamentals',
    description: 'Freestyle skill drills and technique practice for building proper form',
    level: 'beginner-intermediate',
    duration: 30,
    focusAreas: ['Freestyle Technique', 'Breathing Rhythm', 'Body Position', 'Arm Stroke'],
    equipment: ['Swim cap', 'Goggles', 'Kickboard'],
    safetyChecklist: [
      'Pool is supervised or swimming with a buddy',
      'Equipment ready and tested',
      'Warmed up and stretched',
      'Hydration available pool-side',
    ],
    intervals: [
      {
        id: 'warmup-freestyle',
        type: 'warmup',
        title: 'Easy Warm-up',
        description: 'Get blood flowing with gentle swimming',
        duration: 300, // 5 minutes
        instructions: [
          'Swim 50m easy freestyle or mix of strokes',
          'Focus on feeling comfortable, not speed',
          'Take breaks as needed',
        ],
        audioCoaching: [
          'Welcome! Let\'s warm up with some easy swimming.',
          'No rush, just get your body moving.',
          'Take it nice and easy for the first few minutes.',
        ],
      },
      {
        id: 'drill-freestyle-1',
        type: 'drill',
        title: 'Kickboard Flutter Kick',
        description: 'Build leg strength and kick technique',
        duration: 360, // 6 minutes
        instructions: [
          'Hold kickboard with arms extended',
          'Face in water, head in line with body',
          'Flutter kick from hips, not knees',
          'Kick for 25m, rest 30 seconds, repeat 3x',
        ],
        audioCoaching: [
          'Grab your kickboard. Let\'s work on that kick.',
          'Keep your legs long and kick from the hips.',
          'Small, fast kicks work best.',
          'Rest for 30 seconds. Great job!',
        ],
      },
      {
        id: 'rest-freestyle-1',
        type: 'rest',
        title: 'Active Rest',
        description: 'Recover and hydrate',
        duration: 60,
        instructions: ['Stand or float', 'Drink water', 'Shake out legs'],
        audioCoaching: ['Nice work! Take a rest.', 'Drink some water.'],
      },
      {
        id: 'drill-freestyle-2',
        type: 'drill',
        title: 'Catch-Up Drill',
        description: 'Perfect your arm stroke timing',
        duration: 420, // 7 minutes
        instructions: [
          'Swim freestyle but wait for one arm to reach forward before pulling with other',
          'This exaggerates proper timing',
          'Swim 25m catch-up drill, rest 30s, repeat 4x',
        ],
        audioCoaching: [
          'Time for the catch-up drill.',
          'One arm waits while the other completes its stroke.',
          'This helps you feel proper timing.',
          'Touch hands in front before the next stroke.',
        ],
      },
      {
        id: 'rest-freestyle-2',
        type: 'rest',
        title: 'Rest & Reset',
        description: 'Brief recovery',
        duration: 60,
        instructions: ['Tread water or stand', 'Deep breaths'],
        audioCoaching: ['Great technique work!', 'Take a breather.'],
      },
      {
        id: 'practice-freestyle',
        type: 'practice',
        title: 'Full Freestyle Practice',
        description: 'Put it all together',
        duration: 480, // 8 minutes
        instructions: [
          'Swim 50m continuous freestyle',
          'Focus on smooth breathing every 3 strokes',
          'Rest 45 seconds',
          'Repeat 3 times',
        ],
        audioCoaching: [
          'Now let\'s put it all together.',
          'Focus on smooth, rhythmic breathing.',
          'Keep your body streamlined.',
          'You\'re looking great out there!',
          'One more set. You\'ve got this!',
        ],
      },
      {
        id: 'cooldown-freestyle',
        type: 'cooldown',
        title: 'Easy Cooldown',
        description: 'Gentle swimming to finish',
        duration: 180, // 3 minutes
        instructions: [
          'Swim very easy for 100m',
          'Mix strokes if you want',
          'Focus on relaxation',
        ],
        audioCoaching: [
          'Excellent work today!',
          'Cool down with some easy swimming.',
          'You made real progress on your freestyle.',
        ],
      },
    ],
    thumbnailUrl: 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=800',
    estimatedCalories: 200,
    estimatedDistance: 400,
  },
  {
    id: 'endurance-builder',
    title: 'Endurance Builder',
    description: 'Distance and stamina building workout for intermediate swimmers',
    level: 'intermediate',
    duration: 45,
    focusAreas: ['Endurance', 'Pacing', 'Distance Swimming', 'Mental Toughness'],
    equipment: ['Swim cap', 'Goggles', 'Pull buoy (optional)', 'Water bottle'],
    safetyChecklist: [
      'Well hydrated before starting',
      'Pool has lifeguard on duty',
      'Know your limits - can stop anytime',
      'Lane is clear or sharing respectfully',
    ],
    intervals: [
      {
        id: 'warmup-endurance',
        type: 'warmup',
        title: 'Progressive Warm-up',
        description: 'Gradually increase effort',
        duration: 600, // 10 minutes
        instructions: [
          '200m easy swimming (any stroke)',
          '100m breathing drills',
          '100m gradually increasing pace',
        ],
        audioCoaching: [
          'Welcome to endurance training!',
          'Start easy and warm up those muscles.',
          'Gradually pick up the pace.',
        ],
      },
      {
        id: 'practice-endurance-1',
        type: 'practice',
        title: 'Distance Set 1',
        description: 'Sustained moderate effort',
        duration: 900, // 15 minutes
        instructions: [
          '4 x 200m freestyle',
          'Rest 30 seconds between each',
          'Keep consistent pace',
          'Focus on smooth breathing',
        ],
        audioCoaching: [
          'Main set: 4 times 200 meters.',
          'Find your sustainable pace.',
          'Halfway there, keep it steady.',
          'Last one! Strong finish.',
        ],
      },
      {
        id: 'rest-endurance',
        type: 'rest',
        title: 'Active Recovery',
        description: 'Hydrate and recover',
        duration: 120, // 2 minutes
        instructions: ['Easy treading or standing', 'Drink water', 'Stretch arms gently'],
        audioCoaching: [
          'Great job on that set!',
          'Drink water and recover.',
          'You\'re more than halfway done.',
        ],
      },
      {
        id: 'practice-endurance-2',
        type: 'practice',
        title: 'Pyramid Set',
        description: 'Varying distances for mental engagement',
        duration: 900, // 15 minutes
        instructions: [
          '100m, 200m, 300m, 200m, 100m',
          'Rest 20 seconds between each',
          'Maintain effort as distance changes',
        ],
        audioCoaching: [
          'Pyramid set! Building up then back down.',
          '100 meters done. Now 200.',
          'Peak of the pyramid - 300 meters.',
          'Coming back down. 200 meters.',
          'Last one! Finish strong with 100.',
        ],
      },
      {
        id: 'cooldown-endurance',
        type: 'cooldown',
        title: 'Gentle Cooldown',
        description: 'Recover with easy swimming',
        duration: 180, // 3 minutes
        instructions: [
          '200m very easy swimming',
          'Mix strokes if desired',
          'Focus on deep breathing',
        ],
        audioCoaching: [
          'Amazing endurance work today!',
          'Cool down nice and easy.',
          'You just completed 1,600 meters!',
          'Be proud of this achievement.',
        ],
      },
    ],
    thumbnailUrl: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800',
    estimatedCalories: 400,
    estimatedDistance: 1600,
  },
  {
    id: 'technique-refinement',
    title: 'Technique Refinement',
    description: 'Advanced drills for perfecting stroke mechanics and efficiency',
    level: 'intermediate',
    duration: 35,
    focusAreas: ['Stroke Efficiency', 'Body Position', 'Catch Phase', 'Rotation'],
    equipment: ['Swim cap', 'Goggles', 'Fins', 'Pull buoy', 'Kickboard'],
    safetyChecklist: [
      'All equipment tested and ready',
      'Lane space available',
      'Properly warmed up',
      'Ready to focus on quality over quantity',
    ],
    intervals: [
      {
        id: 'warmup-tech',
        type: 'warmup',
        title: 'Technical Warm-up',
        description: 'Prime the body for detail work',
        duration: 420, // 7 minutes
        instructions: [
          '200m swim (mix of strokes)',
          '100m drills (6 kicks, 6 strokes)',
          '100m build pace',
        ],
        audioCoaching: [
          'Let\'s warm up with focus on technique.',
          'Feel the water, connect with your stroke.',
        ],
      },
      {
        id: 'drill-tech-1',
        type: 'drill',
        title: 'Fist Drill',
        description: 'Improve feel for the water',
        duration: 360, // 6 minutes
        instructions: [
          'Swim freestyle with closed fists',
          'Forces you to engage forearm',
          '4 x 50m fist drill',
          'Rest 20 seconds between',
        ],
        audioCoaching: [
          'Close your fists and feel your forearm catch the water.',
          'This improves your overall catch phase.',
          'Notice how your forearm pulls too?',
        ],
      },
      {
        id: 'drill-tech-2',
        type: 'drill',
        title: 'Single Arm Freestyle',
        description: 'Isolate each arm\'s stroke',
        duration: 480, // 8 minutes
        instructions: [
          'Swim with one arm only, other extended',
          '4 x 25m right arm only',
          '4 x 25m left arm only',
          'Focus on high elbow catch',
        ],
        audioCoaching: [
          'One arm at a time. Really feel each stroke.',
          'High elbow, press back through the water.',
          'Now switch to the other arm.',
          'Compare - are they equal?',
        ],
      },
      {
        id: 'rest-tech',
        type: 'rest',
        title: 'Equipment Break',
        description: 'Switch equipment and recover',
        duration: 90,
        instructions: ['Get pull buoy', 'Drink water', 'Stretch shoulders'],
        audioCoaching: ['Grab your pull buoy.', 'Quick water break.'],
      },
      {
        id: 'drill-tech-3',
        type: 'drill',
        title: 'Pull with Buoy',
        description: 'Focus purely on upper body',
        duration: 420, // 7 minutes
        instructions: [
          'Use pull buoy between legs',
          '6 x 50m freestyle pull',
          'Rest 15 seconds between',
          'Focus on rotation and high elbow',
        ],
        audioCoaching: [
          'Pull buoy isolates your upper body.',
          'Rotate your body with each stroke.',
          'Feel that high elbow catch.',
          'Excellent rotation!',
        ],
      },
      {
        id: 'practice-tech',
        type: 'practice',
        title: 'Perfect Stroke Practice',
        description: 'Apply everything you\'ve learned',
        duration: 360, // 6 minutes
        instructions: [
          '4 x 75m freestyle',
          'First 25m: focus on catch',
          'Second 25m: focus on rotation',
          'Third 25m: bring it all together',
          'Rest 20 seconds between',
        ],
        audioCoaching: [
          'Now apply everything.',
          'First 25: catch phase.',
          'Next 25: body rotation.',
          'Last 25: perfect stroke!',
          'Beautiful swimming!',
        ],
      },
      {
        id: 'cooldown-tech',
        type: 'cooldown',
        title: 'Technical Cooldown',
        description: 'Easy swimming with awareness',
        duration: 180, // 3 minutes
        instructions: [
          '200m easy swimming',
          'Think about what you learned',
          'Swim mindfully',
        ],
        audioCoaching: [
          'Excellent technical work!',
          'Cool down and reflect on your improvements.',
          'These drills will transform your swimming.',
        ],
      },
    ],
    thumbnailUrl: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800',
    estimatedCalories: 300,
    estimatedDistance: 1200,
  },
  {
    id: 'multi-stroke-workout',
    title: 'Multi-Stroke Mastery',
    description: 'Practice all four competitive strokes for well-rounded swimming',
    level: 'intermediate',
    duration: 40,
    focusAreas: ['Freestyle', 'Backstroke', 'Breaststroke', 'Butterfly', 'Versatility'],
    equipment: ['Swim cap', 'Goggles', 'Kickboard', 'Water bottle'],
    safetyChecklist: [
      'Know all four strokes at basic level',
      'Lane space for varied movements',
      'Ready for challenging workout',
      'Confident in deep water',
    ],
    intervals: [
      {
        id: 'warmup-multi',
        type: 'warmup',
        title: 'Multi-Stroke Warm-up',
        description: 'Preview all strokes',
        duration: 480, // 8 minutes
        instructions: [
          '400m: 100m each stroke',
          '(Freestyle, Back, Breast, Free)',
          'Easy pace, get feel for each stroke',
        ],
        audioCoaching: [
          'Let\'s warm up with all four strokes.',
          '100 freestyle.',
          'Switch to backstroke.',
          'Now breaststroke.',
          'Finish with freestyle.',
        ],
      },
      {
        id: 'practice-multi-1',
        type: 'practice',
        title: 'Stroke Rotation Set',
        description: 'Build proficiency in each stroke',
        duration: 720, // 12 minutes
        instructions: [
          '3 rounds of:',
          '50m Freestyle',
          '50m Backstroke',
          '50m Breaststroke',
          '50m Freestyle',
          'Rest 30 seconds after each round',
        ],
        audioCoaching: [
          'Round 1! Start with freestyle.',
          'Flip to backstroke.',
          'Breaststroke time.',
          'Back to freestyle.',
          'Rest 30 seconds. Round 2!',
          'You\'re doing great!',
          'Final round - give it your best!',
        ],
      },
      {
        id: 'rest-multi',
        type: 'rest',
        title: 'Midpoint Rest',
        description: 'Recover before intensity',
        duration: 120, // 2 minutes
        instructions: ['Easy treading or floating', 'Drink water', 'Stretch'],
        audioCoaching: [
          'Halfway done! Great versatility.',
          'Hydrate and rest.',
          'You\'re mastering all the strokes!',
        ],
      },
      {
        id: 'drill-multi',
        type: 'drill',
        title: 'Stroke-Specific Drills',
        description: 'Refine each stroke',
        duration: 600, // 10 minutes
        instructions: [
          '4 x 50m Freestyle (focus: breathing)',
          '4 x 50m Backstroke (focus: rotation)',
          '4 x 50m Breaststroke (focus: timing)',
          'Rest 15 seconds between each',
        ],
        audioCoaching: [
          'Freestyle drills: perfect that breathing.',
          'Backstroke: rotate your body.',
          'Breaststroke: timing is everything.',
          'Pull, breathe, kick, glide.',
        ],
      },
      {
        id: 'practice-multi-2',
        type: 'practice',
        title: 'Individual Medley Practice',
        description: 'Transition between strokes',
        duration: 480, // 8 minutes
        instructions: [
          '200m IM order: Fly, Back, Breast, Free',
          '(If not comfortable with fly, do freestyle instead)',
          'Rest 60 seconds',
          'Repeat once',
        ],
        audioCoaching: [
          'Time for individual medley!',
          'Butterfly or freestyle.',
          'Transition to backstroke.',
          'Now breaststroke.',
          'Finish strong with freestyle!',
          'Rest, then one more IM!',
        ],
      },
      {
        id: 'cooldown-multi',
        type: 'cooldown',
        title: 'Choice Cooldown',
        description: 'Easy swimming, your favorite stroke',
        duration: 180, // 3 minutes
        instructions: [
          '200m easy swimming',
          'Choose your favorite stroke',
          'Or mix it up',
          'Nice and relaxed',
        ],
        audioCoaching: [
          'Amazing multi-stroke workout!',
          'Cool down with your favorite stroke.',
          'You\'ve earned this easy swimming.',
          'Great work becoming a versatile swimmer!',
        ],
      },
    ],
    thumbnailUrl: 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=800',
    estimatedCalories: 380,
    estimatedDistance: 1800,
  },
];

// Mock Community Users
const MOCK_USERS: CommunityUser[] = [
  {
    id: 'user-1',
    name: 'Sarah Johnson',
    avatarUrl: 'https://i.pravatar.cc/150?img=1',
    skillLevel: 'beginner-2',
    badges: ['first-lesson', '7-day-streak'],
  },
  {
    id: 'user-2',
    name: 'Mike Chen',
    avatarUrl: 'https://i.pravatar.cc/150?img=3',
    skillLevel: 'intermediate-1',
    badges: ['30-day-streak', '50-lessons'],
  },
  {
    id: 'user-3',
    name: 'Emma Rodriguez',
    avatarUrl: 'https://i.pravatar.cc/150?img=5',
    skillLevel: 'beginner-1',
    badges: ['first-lesson'],
  },
  {
    id: 'user-4',
    name: 'Coach Maria',
    avatarUrl: 'https://i.pravatar.cc/150?img=9',
    skillLevel: 'advanced',
    badges: ['expert', 'coach'],
    isVerified: true,
  },
  {
    id: 'user-5',
    name: 'Alex Kim',
    avatarUrl: 'https://i.pravatar.cc/150?img=7',
    skillLevel: 'intermediate-2',
    badges: ['100-day-streak', '100-lessons', 'technique-master'],
  },
  {
    id: 'user-6',
    name: 'Jessica Lee',
    avatarUrl: 'https://i.pravatar.cc/150?img=10',
    skillLevel: 'beginner-2',
    badges: ['7-day-streak', '10-lessons'],
  },
  {
    id: 'user-7',
    name: 'David Martinez',
    avatarUrl: 'https://i.pravatar.cc/150?img=12',
    skillLevel: 'intermediate-1',
    badges: ['30-day-streak', '25-lessons'],
  },
  {
    id: 'user-8',
    name: 'Coach Lisa',
    avatarUrl: 'https://i.pravatar.cc/150?img=16',
    skillLevel: 'advanced',
    badges: ['expert', 'coach'],
    isVerified: true,
  },
];

// Mock Community Posts
export const COMMUNITY_POSTS: CommunityPost[] = [
  // Pinned Coach Tip
  {
    id: 'post-pinned-1',
    author: MOCK_USERS[3], // Coach Maria
    type: 'tip',
    content: '💡 Weekly Tip: Focus on exhaling underwater! Many beginners hold their breath, which creates tension and makes swimming harder. Practice exhaling slowly through your nose while your face is in the water. This makes inhaling easier and more natural when you turn to breathe. Try it during your next pool session!',
    reactions: [
      { type: 'like', emoji: '❤️', count: 142, userReacted: false },
      { type: 'support', emoji: '💪', count: 87, userReacted: false },
      { type: 'celebrate', emoji: '🎉', count: 23, userReacted: false },
    ],
    commentCount: 34,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    isPinned: true,
    tags: ['breathing', 'technique', 'beginner-tips'],
  },

  // Achievement Post
  {
    id: 'post-1',
    author: MOCK_USERS[1], // Mike Chen
    type: 'achievement',
    content: 'Just earned the "30-Day Streak" achievement! Consistency is key, and this app has kept me motivated every single day. From being afraid of water to swimming confidently - what a journey! 🏊‍♂️',
    achievement: {
      id: 'streak-30',
      title: '30-Day Streak',
      icon: '🔥',
      tier: 'gold',
    },
    reactions: [
      { type: 'celebrate', emoji: '🎉', count: 45, userReacted: true },
      { type: 'motivate', emoji: '🔥', count: 38, userReacted: false },
      { type: 'like', emoji: '❤️', count: 67, userReacted: false },
    ],
    commentCount: 12,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
    tags: ['achievement', 'streak', 'motivation'],
  },

  // Milestone Post with Media
  {
    id: 'post-2',
    author: MOCK_USERS[0], // Sarah Johnson
    type: 'milestone',
    content: 'I DID IT! Swam my first 100 meters without stopping! 🎉 Six weeks ago, I was terrified of putting my face in water. Today, I completed 4 laps continuously. To anyone just starting: it gets easier, I promise! Keep showing up! 💙',
    media: [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=800',
        thumbnailUrl: 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=400',
      },
    ],
    milestone: {
      type: 'distance',
      value: 100,
      label: 'First 100m',
    },
    reactions: [
      { type: 'celebrate', emoji: '🎉', count: 89, userReacted: false },
      { type: 'support', emoji: '💪', count: 56, userReacted: true },
      { type: 'like', emoji: '❤️', count: 103, userReacted: false },
    ],
    commentCount: 27,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    tags: ['milestone', 'first-100m', 'beginner-win'],
  },

  // Story Post
  {
    id: 'post-3',
    author: MOCK_USERS[2], // Emma Rodriguez
    type: 'story',
    content: 'Took my daughter to the pool today and she asked me to teach her to swim. A year ago, I would have had to sit on the sidelines. Today, I was able to get in the water with her and show her basic floating. She was so proud of me, and honestly, I was proud of myself too. This app changed my life. Thank you! 🥺❤️',
    reactions: [
      { type: 'like', emoji: '❤️', count: 156, userReacted: false },
      { type: 'celebrate', emoji: '🎉', count: 42, userReacted: false },
      { type: 'support', emoji: '💪', count: 38, userReacted: false },
    ],
    commentCount: 19,
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    tags: ['story', 'family', 'motivation'],
  },

  // Achievement Post
  {
    id: 'post-4',
    author: MOCK_USERS[4], // Alex Kim
    type: 'achievement',
    content: '100 LESSONS COMPLETED! 🎓 Started as a complete beginner 6 months ago. Now I can swim all four competitive strokes with proper technique. The structured learning path and video breakdowns were game-changers. On to the next 100!',
    achievement: {
      id: 'lessons-100',
      title: '100 Lessons',
      icon: '🎓',
      tier: 'platinum',
    },
    media: [
      {
        type: 'video',
        url: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1600965962361-9035dbfd1c50?w=400',
      },
    ],
    reactions: [
      { type: 'celebrate', emoji: '🎉', count: 78, userReacted: false },
      { type: 'motivate', emoji: '🔥', count: 92, userReacted: false },
      { type: 'like', emoji: '❤️', count: 134, userReacted: true },
    ],
    commentCount: 31,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    tags: ['achievement', '100-lessons', 'dedication'],
  },

  // Tip from Coach
  {
    id: 'post-5',
    author: MOCK_USERS[7], // Coach Lisa
    type: 'tip',
    content: '🏊 Technique Tuesday: Your kick shouldn\'t make huge splashes! A common mistake is kicking from the knees instead of the hips. Keep your legs relatively straight, kick from the hips, and keep your ankles flexible. The motion should be smooth and controlled. Your feet should just break the surface - not create waves! Practice this during your next dryland session.',
    reactions: [
      { type: 'like', emoji: '❤️', count: 98, userReacted: false },
      { type: 'support', emoji: '💪', count: 45, userReacted: false },
    ],
    commentCount: 18,
    createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(), // 18 hours ago
    isPinned: false,
    tags: ['technique', 'kicking', 'coach-tips'],
  },

  // Milestone Post
  {
    id: 'post-6',
    author: MOCK_USERS[5], // Jessica Lee
    type: 'milestone',
    content: 'Just completed my 7-day streak! 🔥 Small wins matter. A week ago I wasn\'t sure if I could commit to daily practice, but here I am! The dryland exercises have been perfect for days when I can\'t get to the pool. Feeling stronger already!',
    milestone: {
      type: 'streak',
      value: 7,
      label: '7-Day Streak',
    },
    reactions: [
      { type: 'celebrate', emoji: '🎉', count: 34, userReacted: false },
      { type: 'motivate', emoji: '🔥', count: 28, userReacted: false },
      { type: 'like', emoji: '❤️', count: 52, userReacted: false },
    ],
    commentCount: 8,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    tags: ['milestone', 'streak', 'consistency'],
  },

  // Story Post
  {
    id: 'post-7',
    author: MOCK_USERS[6], // David Martinez
    type: 'story',
    content: 'Finally conquered my fear of deep water! 🌊 Spent the first 3 weeks of this program just working on shallow-end confidence. Today I jumped into the deep end for the first time in my life (I\'m 34!). The safety lessons and gradual progression made all the difference. Never thought I\'d see this day!',
    reactions: [
      { type: 'celebrate', emoji: '🎉', count: 67, userReacted: true },
      { type: 'support', emoji: '💪', count: 89, userReacted: false },
      { type: 'like', emoji: '❤️', count: 121, userReacted: false },
    ],
    commentCount: 23,
    createdAt: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(), // 30 hours ago
    tags: ['story', 'fear-conquered', 'deep-water'],
  },

  // Question Post (read-only for MVP)
  {
    id: 'post-8',
    author: MOCK_USERS[0], // Sarah Johnson
    type: 'question',
    content: 'Quick question for intermediate swimmers: How long did it take you to feel comfortable with bilateral breathing? I can breathe on my right side fine, but my left side feels so awkward still. Any tips?',
    reactions: [
      { type: 'like', emoji: '❤️', count: 23, userReacted: false },
      { type: 'support', emoji: '💪', count: 12, userReacted: false },
    ],
    commentCount: 15,
    createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(), // 36 hours ago
    tags: ['question', 'breathing', 'technique'],
  },

  // Milestone Post
  {
    id: 'post-9',
    author: MOCK_USERS[1], // Mike Chen
    type: 'milestone',
    content: 'Level up! Just advanced to Intermediate Level 2! 🎯 The adaptive learning really works - the app knew exactly when I was ready to move forward. Excited to start learning butterfly stroke next week. Bring it on!',
    milestone: {
      type: 'level',
      value: 'intermediate-2',
      label: 'Intermediate Level 2',
    },
    reactions: [
      { type: 'celebrate', emoji: '🎉', count: 45, userReacted: false },
      { type: 'motivate', emoji: '🔥', count: 33, userReacted: false },
      { type: 'like', emoji: '❤️', count: 58, userReacted: false },
    ],
    commentCount: 11,
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), // 2 days ago
    tags: ['milestone', 'level-up', 'progression'],
  },

  // Story Post
  {
    id: 'post-10',
    author: MOCK_USERS[4], // Alex Kim
    type: 'story',
    content: 'Completed my first open water swim this weekend! 🌊 Started training with this app in my apartment pool, now I\'m swimming in the ocean. The technique videos prepared me so well - my form held up even with waves and currents. Thank you to this amazing community for the constant encouragement!',
    media: [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1530870110042-98b2cb110834?w=800',
        thumbnailUrl: 'https://images.unsplash.com/photo-1530870110042-98b2cb110834?w=400',
      },
    ],
    reactions: [
      { type: 'celebrate', emoji: '🎉', count: 91, userReacted: false },
      { type: 'motivate', emoji: '🔥', count: 67, userReacted: false },
      { type: 'like', emoji: '❤️', count: 143, userReacted: false },
    ],
    commentCount: 28,
    createdAt: new Date(Date.now() - 60 * 60 * 60 * 1000).toISOString(), // 2.5 days ago
    tags: ['story', 'open-water', 'achievement'],
  },
];

// Mock Challenges (P2)
export const CHALLENGES: Challenge[] = [
  {
    id: 'challenge-1',
    title: '🌊 Weekly Warrior',
    description: 'Complete 500 meters of swimming this week! Track your pool sessions and hit this milestone to prove you\'re committed to your swimming journey.',
    type: 'distance',
    difficulty: 'all-levels',
    goal: {
      type: 'distance',
      target: 500,
      unit: 'meters',
    },
    rewards: {
      xp: 500,
      badge: 'weekly-warrior',
      title: 'Weekly Warrior',
    },
    startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // Started 3 days ago
    endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(), // Ends in 4 days
    participantCount: 2847,
    status: 'active',
    imageUrl: 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=800',
    rules: [
      'Track all pool practice sessions',
      'Only pool sessions count toward distance',
      'Challenge ends Sunday at 11:59 PM',
      'Top 100 finishers get bonus XP',
    ],
  },
  {
    id: 'challenge-2',
    title: '🔥 30-Day Streak Master',
    description: 'Build consistency! Complete at least one swimming activity (lesson, pool session, or dryland) every day for 30 consecutive days.',
    type: 'streak',
    difficulty: 'intermediate',
    goal: {
      type: 'streak',
      target: 30,
      unit: 'days',
    },
    rewards: {
      xp: 1500,
      badge: 'streak-master',
      title: 'Streak Master',
    },
    startDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(), // Started 12 days ago
    endDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(), // Ends in 18 days
    participantCount: 1523,
    status: 'active',
    imageUrl: 'https://images.unsplash.com/photo-1600965962361-9035dbfd1c50?w=800',
    rules: [
      'Complete minimum 1 activity per day',
      'Lessons, pool sessions, and dryland all count',
      'Missing one day resets your streak',
      'Challenge duration is 30 days from start',
    ],
  },
  {
    id: 'challenge-3',
    title: '📚 Knowledge Sprint',
    description: 'Expand your swimming knowledge! Complete 10 video lessons this week to master new techniques and skills.',
    type: 'lessons',
    difficulty: 'beginner',
    goal: {
      type: 'count',
      target: 10,
      unit: 'lessons',
    },
    rewards: {
      xp: 300,
      badge: 'knowledge-sprint',
    },
    startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // Started 2 days ago
    endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // Ends in 5 days
    participantCount: 4231,
    status: 'active',
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
    rules: [
      'Complete full video lessons',
      'Skipping through videos doesn\'t count',
      'All skill levels welcome',
      'Dryland lesson videos count too',
    ],
  },
  {
    id: 'challenge-4',
    title: '💪 Dryland Dedication',
    description: 'Build strength outside the pool! Complete 15 dryland workout sessions to improve your swimming power and endurance.',
    type: 'dryland',
    difficulty: 'intermediate',
    goal: {
      type: 'count',
      target: 15,
      unit: 'sessions',
    },
    rewards: {
      xp: 600,
      badge: 'dryland-dedicated',
      title: 'Dryland Dedicated',
    },
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // Started 7 days ago
    endDate: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000).toISOString(), // Ends in 23 days (30-day challenge)
    participantCount: 982,
    status: 'active',
    imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800',
    rules: [
      'Complete full dryland routines',
      'Custom and pre-built routines both count',
      'Minimum 10 minutes per session',
      '30-day time limit',
    ],
  },
  {
    id: 'challenge-5',
    title: '⏱️ Time Trial Champion',
    description: 'Push your limits! Accumulate 120 minutes of active swimming time in pool sessions this week.',
    type: 'time',
    difficulty: 'advanced',
    goal: {
      type: 'time',
      target: 120,
      unit: 'minutes',
    },
    rewards: {
      xp: 800,
      badge: 'time-trial-champ',
      title: 'Time Trial Champion',
    },
    startDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // Started yesterday
    endDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(), // Ends in 6 days
    participantCount: 567,
    status: 'active',
    imageUrl: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800',
    rules: [
      'Only active swimming time counts',
      'Rest periods don\'t count',
      'Pool practice sessions only',
      'Weekly reset on Mondays',
    ],
  },
  {
    id: 'challenge-6',
    title: '🏊 Summer Splash Challenge',
    description: 'Get ready for summer! Complete 1000 meters of swimming over the next 2 weeks. Perfect for building endurance.',
    type: 'distance',
    difficulty: 'intermediate',
    goal: {
      type: 'distance',
      target: 1000,
      unit: 'meters',
    },
    rewards: {
      xp: 1000,
      badge: 'summer-splash',
      title: 'Summer Swimmer',
    },
    startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Starts in 2 days
    endDate: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000).toISOString(), // 2-week duration
    participantCount: 3456,
    status: 'upcoming',
    imageUrl: 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=800',
    rules: [
      'All pool sessions count',
      'Track your distance accurately',
      '2-week time limit',
      'Beginner and intermediate swimmers encouraged',
    ],
  },
];

// Mock leaderboard entries for challenges
const MOCK_USERS_FOR_LEADERBOARD: any[] = [
  {
    id: 'user-1',
    name: 'Sarah Johnson',
    avatarUrl: 'https://i.pravatar.cc/150?img=1',
    skillLevel: 'beginner-2',
    badges: ['first-lesson', '7-day-streak'],
  },
  {
    id: 'user-2',
    name: 'Mike Chen',
    avatarUrl: 'https://i.pravatar.cc/150?img=3',
    skillLevel: 'intermediate-1',
    badges: ['30-day-streak', '50-lessons'],
  },
  {
    id: 'user-3',
    name: 'Emma Rodriguez',
    avatarUrl: 'https://i.pravatar.cc/150?img=5',
    skillLevel: 'beginner-1',
    badges: ['first-lesson'],
  },
  {
    id: 'user-5',
    name: 'Alex Kim',
    avatarUrl: 'https://i.pravatar.cc/150?img=7',
    skillLevel: 'intermediate-2',
    badges: ['100-day-streak', '100-lessons', 'technique-master'],
  },
  {
    id: 'user-6',
    name: 'Jessica Lee',
    avatarUrl: 'https://i.pravatar.cc/150?img=10',
    skillLevel: 'beginner-2',
    badges: ['7-day-streak', '10-lessons'],
  },
  {
    id: 'user-7',
    name: 'David Martinez',
    avatarUrl: 'https://i.pravatar.cc/150?img=12',
    skillLevel: 'intermediate-1',
    badges: ['30-day-streak', '25-lessons'],
  },
  {
    id: 'user-current',
    name: 'You',
    avatarUrl: 'https://i.pravatar.cc/150?img=20',
    skillLevel: 'beginner-2',
    badges: ['first-lesson', '7-day-streak'],
  },
];

export const getChallengeLeaderboard = (challengeId: string): ChallengeLeaderboardEntry[] => {
  const challenge = CHALLENGES.find(c => c.id === challengeId);
  if (!challenge) return [];

  // Generate mock leaderboard based on challenge type
  const entries: ChallengeLeaderboardEntry[] = MOCK_USERS_FOR_LEADERBOARD.slice(0, 6).map((user, index) => {
    const isCurrentUser = user.id === 'user-current';
    let progress = 0;

    if (challenge.type === 'distance') {
      progress = challenge.goal.target - (index * 50) - Math.random() * 50;
    } else if (challenge.type === 'streak') {
      progress = challenge.goal.target - (index * 3) - Math.floor(Math.random() * 3);
    } else if (challenge.type === 'lessons') {
      progress = challenge.goal.target - (index * 1) - Math.floor(Math.random() * 2);
    } else if (challenge.type === 'time') {
      progress = challenge.goal.target - (index * 15) - Math.random() * 15;
    } else {
      progress = challenge.goal.target - (index * 2) - Math.floor(Math.random() * 2);
    }

    // Current user is at rank 23
    if (isCurrentUser) {
      progress = challenge.goal.target * 0.68; // 68% complete
    }

    return {
      rank: isCurrentUser ? 23 : index + 1,
      user,
      progress: Math.max(0, Math.min(progress, challenge.goal.target)),
      progressPercentage: Math.min(100, (progress / challenge.goal.target) * 100),
      isCurrentUser,
      completedAt: progress >= challenge.goal.target ? new Date().toISOString() : undefined,
    };
  });

  // Sort by progress descending
  return entries.sort((a, b) => b.progress - a.progress);
};
