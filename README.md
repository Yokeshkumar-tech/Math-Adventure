# Math Adventure — Gamified Math Learning for Grades 5 and 6

> **Live Demo**: `https://math-adventure-demo.vercel.app`  
> **Backend API Health**: `http://localhost:5000/api/health` (Production: `https://math-adventure-api.onrender.com/api/health`)  
> **Instant Evaluator Access**: Click **"Try as Guest (Instant Reviewer Demo)"** on the Welcome or Sign In screen (no registration required; pre-populated with 250 XP, 5-day streak, 3 unlocked badges, and quiz performance history).  
> **Demo Student Account**: Username: `priya` | Password: `champion123`  

---

## 1. Objective
Math Adventure is an interactive, AI-powered mathematics learning platform tailored for **Grade 5 and Grade 6** students (ages 10–12). It merges concrete visual explanations, educational SVG infographics, adaptive quizzes, and child-safe gamification into an engaging maths adventure rather than a static textbook. The system is engineered around **server-side authority**, **mathematical correctness guarantees**, and **graceful degradation**—ensuring the application remains fully usable and engaging even when external AI APIs are offline or rate-limited.

---

## 2. Features
- **Curriculum Selection**: Clear pathways for Grade 5 and Grade 6 with 10 core NCERT/state aligned topics (5 per grade).
- **Interactive Explanations**: Age-appropriate lessons featuring step-by-step concepts, real-life analogies (pizza slices, pocket money in rupees, cricket scores), and two verified worked examples with numbered steps per lesson.
- **Professor Pi — Real-Time AI Math Chatbot**:
  - Full-featured conversational AI math solver supporting **natural language questions across Elementary, Middle School, High School, and College/Advanced levels**.
  - Server-Sent Events (SSE) real-time token streaming with instant token delivery.
  - Step-by-step solutions with mathematical formulas, substitutions, intuition, and highlighted final answers.
  - Mathematical notation rendered in LaTeX via KaTeX ($...$ and $$...$$).
  - Multi-turn conversation memory with context preservation, saved conversation history, and CRUD management.
  - Integrated Symbolic Mathematics & Verification Engine (`mathService`) with fallback capability for arithmetic, fractions, linear/quadratic equations, geometry, percentages, probability, statistics, and calculus.
  - Interactive speech tools: Text-to-Speech (read-aloud) and Web Speech API voice microphone input.
  - Practice quiz generation based on the active chat topic.
- **Educational Infographics**: Programmatic, mathematically accurate SVG visualizers (interactive Fraction Pizza slice slider & equivalent fraction detector, Decimal/Integer Number Line, Ratio Counters, Angle Protractor, and Area Unit Grid).
- **Interactive Narrated Video Lesson**: Built-in 6-scene audio-visual fraction lesson powered by SVG animations, browser SpeechSynthesis narration, synchronized on-screen captions, and interactive checks.
- **Adaptive Practice Quizzes**: 10-question quizzes dynamically adjusting between Easy (10 pts), Medium (20 pts), and Hard (30 pts) based on real-time student performance.
- **Quiz Security & Anti-Cheat**: Questions sent to the browser **never** contain the `correctAnswer`. Answers are verified and points calculated exclusively on the Express backend.
- **Gamification & Rewards**: XP points ledger, level progress (Level 1..7), 5 collectible adventure badges with celebratory confetti cannons, and IST-timezone daily streaks.
- **Interactive Adventure Worlds**: 5 themed fantasy realms (**Number Forest**, **Fraction Kingdom**, **Desert of Numbers**, **Ocean of Geometry**, **Dragon's Math Castle**) with star-gated unlock progression.
- **30 Story Missions & Epic Boss Encounters**: Rich narrative missions with dialogues, objectives, and animated boss battles with health bars and phase transitions.
- **Hero Character Customizer & Royal Armory**: 4 playable classes (Knight, Wizard, Archer, Rogue) with purchasable cosmetic armor, shields, and wands powered by earned coins.
- **Daily Math Challenges & Targeted Revision**: 3-question speed challenges with calendar streaks, plus an automated revision center focusing on missed questions.
- **Synthesized 8-Bit Web Audio Engine**: Native Web Audio API sound synthesizer with zero external asset dependencies (retro coin chimes, attack sounds, star fanfares, level-up jingles).
- **Accessibility & Multilingual Support**: High-contrast mode toggle, text sizing slider (1x, 1.15x, 1.3x), keyboard navigation (keys 1–4 and Enter for quizzes), and bilingual support (**English & தமிழ்**).
- **Printable Parent Report**: One-click printable student progress report with clean print stylesheets.

---

## 3. Technology Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Frontend** | React 19 + Vite 8 | Ultra-fast development server, reusable component architecture |
| **Styling** | Tailwind CSS v4 + Vanilla CSS | Modern responsive design, fluid typography, high-contrast theme |
| **Routing** | React Router v7 | Seamless SPA client-side routing with protected routes |
| **Data Visualization** | Recharts | Smooth, kid-friendly line and bar charts for progress and accuracy |
| **Micro-Animations** | Canvas-Confetti + SVG animations | Celebratory particle bursts on level-ups and quiz completions |
| **Backend** | Node.js 24 + Express 5 | High-throughput asynchronous REST APIs |
| **Database** | MongoDB Atlas + Mongoose | Document database ideal for hierarchical lessons and quiz sessions |
| **Validation** | Zod + Custom Fraction Arithmetic Engine | Schema verification and exact arithmetic checking without rounding errors |
| **Security** | Helmet, CORS, Express-Rate-Limit, JWT, Bcrypt | Origin protection, AI cost caps, secure password hashing, stateless auth |
| **Testing** | Jest + Supertest | Comprehensive unit and integration test coverage |

---

## 4. System Architecture

The platform implements a classic three-tier architecture with the Express server acting as the single source of truth:

```
┌─────────────────────────────────┐
│     React Client (Vercel)       │
│  Pages, Tailwind UI, Recharts   │
│  SVG Infographics, Web Speech   │
│  Bearer JWT in Request Headers  │
└───────────────┬─────────────────┘
                │ HTTPS + JWT
                ▼
┌─────────────────────────────────┐        ┌──────────────────────────────┐
│      Express API (Render)       │───────▶│     LLM API (OpenAI/Mock)    │
│  /auth, /lessons, /quizzes,     │◀───────│ Structured JSON explanations │
│  /ai, /progress, authMiddleware │        └──────────────────────────────┘
│  validateQuestion.js            │
│  adaptiveDifficulty.js          │        ┌──────────────────────────────┐
│  scoring + badges + IST streak  │───────▶│        MongoDB Atlas         │
└───────────────┬─────────────────┘◀───────│  users, lessons, questions  │
                │                          │  quizSessions, quizAttempts  │
                │ If AI Fails / Disabled   │  achievements, rewardLedger  │
                ▼                          └──────────────────────────────┘
┌─────────────────────────────────┐
│        Fallback Engine          │
│  10 Teacher-Validated Lessons   │
│  150 Validated Bank Questions   │
│  Pre-made SVG/PNG Infographics  │
└─────────────────────────────────┘
```

---

## 5. Folder Structure

```
d:/Math Adventure/
├── client/
│   ├── public/
│   │   ├── favicon.svg
│   │   └── images/               # Infographics & game backgrounds
│   ├── src/
│   │   ├── components/
│   │   │   ├── game/             # Adventure components (Sprites, Boss, HealthBar, Diagrams)
│   │   │   │   ├── BossSprite.jsx
│   │   │   │   ├── CharacterModal.jsx
│   │   │   │   ├── CharacterSprite.jsx
│   │   │   │   ├── GeometryDiagram.jsx
│   │   │   │   └── HealthBar.jsx
│   │   │   ├── Navbar.jsx        # Navigation HUD, coins, stars, streak, level
│   │   │   ├── FractionPizza.jsx # Interactive SVG fraction visualizer
│   │   │   ├── MathVisualizer.jsx# Multi-topic visualizer
│   │   │   ├── VideoLesson.jsx   # 6-scene narrated slide lesson
│   │   │   ├── TutorChat.jsx     # Professor Pi math tutor chat
│   │   │   └── Celebration.jsx   # Confetti particle burst & badge modal
│   │   ├── pages/
│   │   │   ├── AdventureMap.jsx  # Interactive 5-world fantasy map with star gates
│   │   │   ├── WorldMissions.jsx # World mission trail with checkpoints
│   │   │   ├── MissionGame.jsx   # Question engine with hints, feedback, keyboard (1-4)
│   │   │   ├── BossBattle.jsx    # Real-time boss battles with health and attack effects
│   │   │   ├── Shop.jsx          # Royal Armory shop for cosmetics and weapons
│   │   │   ├── DailyChallenge.jsx# 3-question daily speed challenge with calendar streak
│   │   │   ├── Revision.jsx      # Personalized error correction and review center
│   │   │   ├── Dashboard.jsx     # Stats, Recharts chart, adventure rank
│   │   │   ├── Lesson.jsx        # Worked examples & AI tools
│   │   │   ├── Practice.jsx      # Adaptive MCQ practice
│   │   │   ├── Achievements.jsx  # Badges & leaderboard
│   │   │   └── Progress.jsx      # Learning analytics & printable report
│   │   ├── utils/
│   │   │   └── soundEffects.js   # 8-bit Web Audio synthesizer (zero asset dependencies)
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Auth state, persistent settings, i18n
│   │   ├── services/
│   │   │   └── api.js            # Axios client with JWT interceptor
│   │   ├── App.jsx
│   │   └── index.css             # Tailwind v4 setup & game styles
│   └── package.json
├── server/
│   ├── controllers/
│   │   ├── authController.js     # Auth, guest sessions, profile updates
│   │   ├── worldController.js    # 5 Worlds & 30 mission metadata
│   │   ├── gameController.js     # Game sessions, answer validation, boss attacks
│   │   ├── shopController.js     # Royal Armory economy and inventory
│   │   ├── challengeController.js# Daily challenges and targeted revision
│   │   ├── aiController.js       # Structured JSON generation, tutor, fallbacks
│   │   ├── quizController.js     # Adaptive engine, answer hiding
│   │   └── progressController.js # Analytics, leaderboard, recommendations
│   ├── models/
│   │   ├── User.js               # Student profile, streak, coins, stars, character
│   │   ├── World.js              # World schemas and star unlock thresholds
│   │   ├── Mission.js            # Mission briefs, dialogues, objectives, reward rules
│   │   ├── Question.js           # Validated questions (MCQ, numeric, true/false, geometry)
│   │   ├── PlayerProgress.js     # Mission stars, completion status, attempts
│   │   ├── ShopItem.js           # Costumes, accessories, weapons, pets
│   │   ├── Inventory.js          # Purchased cosmetic items
│   │   ├── DailyChallenge.js     # Calendar-aligned daily challenges
│   │   └── RewardHistory.js      # Transactional reward logs (duplicate-safe)
│   ├── routes/
│   │   ├── worldRoutes.js
│   │   ├── gameRoutes.js
│   │   ├── shopRoutes.js
│   │   ├── challengeRoutes.js
│   │   ├── authRoutes.js
│   │   ├── quizRoutes.js
│   │   └── aiRoutes.js
│   ├── seed/
│   │   ├── worlds.json           # 5 adventure worlds
│   │   ├── missions.json         # 30 adventure missions
│   │   ├── shopItems.json        # 10 armory shop items
│   │   ├── questions.json        # 150 mathematically verified questions
│   │   └── seed.js               # Database population script
│   ├── tests/
│   │   ├── adventure.test.js     # Adventure progression, boss battles, shop tests
│   │   ├── adaptive.test.js      # Adaptive difficulty tests
│   │   ├── validate.test.js      # Fraction math & answer validation tests
│   │   └── quiz.api.test.js      # Integration API tests
│   ├── server.js                 # Express server entry point
│   └── package.json
├── docs/
│   ├── test-report.md            # Detailed automated and manual test report
│   └── api-spec.md               # Complete REST API endpoint reference

├── README.md
└── .gitignore
```

---

## 6. Prerequisites
- **Node.js**: v20 LTS or newer (`node -v` >= 20.x, built on v24.14.0)
- **npm**: v10+ (`npm -v`)
- **MongoDB**: Local MongoDB instance running on `mongodb://127.0.0.1:27017` OR a MongoDB Atlas cluster URI
- **Git**: Installed for version control

---

## 7. Installation

Clone or extract the repository:
```bash
cd "d:/Math Adventure"
```

### Install Backend Dependencies
```bash
cd server
npm install
```

### Install Frontend Dependencies
```bash
cd ../client
npm install
```

---

## 8. Environment Variables

### Backend (`server/.env`)
Copy `server/.env.example` to `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/mathadventure
JWT_SECRET=super_secret_math_adventure_jwt_token_key_2026_dev
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:5173
AI_API_KEY=your_openai_or_compatible_key_here
AI_MODEL=gpt-4o-mini
AI_ENABLED=false
```
> **Note**: Setting `AI_ENABLED=false` activates the built-in, pre-validated teacher lesson bank and tutor fallback responses so the application functions 100% reliably without requiring an external paid LLM key.

### Frontend (`client/.env`)
Copy `client/.env.example` to `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 9. Running Locally

### 1. Seed the Database
Populate the 10 lessons, 150 validated questions, 5 badges, and demo accounts (`priya` / `champion123`):
```bash
cd server
npm run seed
```

### 2. Start the Backend API Server
```bash
cd server
npm run dev
# Server starts on http://localhost:5000 (Health check: http://localhost:5000/api/health)
```

### 3. Start the Frontend Client
In a new terminal:
```bash
cd client
npm run dev
# Client runs on http://localhost:5173 (or next available port)
```

Open `http://localhost:5173` in any browser, click **"Try as Guest"** or sign in with `priya` / `champion123`!

---

## 10. AI Integration and Validation

The platform features a multi-stage validation pipeline that guarantees mathematical correctness:

1. **Structured JSON Output**: All AI prompts demand explicit JSON schemas including learning objectives, 2 worked examples, and practice questions with machine-evaluable arithmetic expressions.
2. **Zod Runtime Schema Validation**: Every AI response is validated with Zod before being stored or presented. Invalid payloads trigger automatic fallback.
3. **Exact Fraction Arithmetic Engine (`Frac`)**:
   - Implements exact numerator/denominator integer arithmetic (`add`, `sub`, `mul`, `div`, `equals`).
   - Prevents floating-point rounding bugs (e.g. `1/3 + 1/3` is evaluated with exact rational numbers).
   - Evaluates arithmetic expressions using a safe **Shunting-Yard** parser without ever using `eval()`.
4. **Deterministic Bank Fallback**: If `AI_ENABLED=false`, the network is unavailable, or OpenAI rate-limits, the server automatically serves teacher-validated lessons from MongoDB.

---

## 11. Adaptive Difficulty Algorithm

The adaptive quiz engine implements a server-managed state machine across 10 questions per quiz:

```
               3 Correct in a row
  ┌─────────┐ ───────────────────▶ ┌──────────┐ ───────────────────▶ ┌────────┐
  │  EASY   │                      │  MEDIUM  │                      │  HARD  │
  │ 10 pts  │ ◀─────────────────── │  20 pts  │ ◀─────────────────── │ 30 pts │
  └─────────┘   2 Wrong in a row   └──────────┘   2 Wrong in a row   └────────┘
       ▲                                                                  │
       └──────────────────────── Clamped Levels ──────────────────────────┘
```

- **Promotion Rule**: 3 consecutive correct answers promote difficulty (`easy` -> `medium` -> `hard`).
- **Demotion Rule**: 2 consecutive incorrect answers demote difficulty (`hard` -> `medium` -> `easy`).
- **Streak Reset**: Consecutive counters reset to 0 immediately upon level transition.
- **Boundary Clamping**: Difficulty cannot ascend above `hard` or descend below `easy`.
- **Starting Level**: Derived dynamically from the student's previous quiz attempt on the same topic:
  - Accuracy >= 85%: Starts at previous difficulty reached.
  - Accuracy < 50%: Starts at `easy`.
  - Accuracy 50%–84%: Starts one level below previous peak.

---

## 12. Scoring and Gamification Rules

### Points Schedule
| Activity | XP Points | Duplicate Prevention Key |
|---|---|---|
| Correct Easy Question | 10 pts | `quiz:<sessionId>` (accumulated at finish) |
| Correct Medium Question | 20 pts | `quiz:<sessionId>` |
| Correct Hard Question | 30 pts | `quiz:<sessionId>` |
| Complete a Lesson | 25 pts | `lesson:<lessonId>` (once per lesson) |
| Complete Daily Goal | 50 pts | `daily:<YYYY-MM-DD>` (once per day) |
| Master a Topic (>=80% acc) | 100 pts | `topic:<topicId>` (once per topic) |

### Level Progression
- **Level Thresholds**: `[0, 100, 250, 500, 900, 1400, 2000]` (Levels 1 to 7).

### Collectible Adventure Badges
1. **First Steps (👣)**: Complete your first math lesson.
2. **Math Explorer (🧭)**: Study 3 different topics.
3. **Accuracy Star (⭐)**: Achieve 90%+ accuracy in a quiz of 5+ questions.
4. **Streak Master (🔥)**: Study on 7 consecutive calendar days (tracked in `Asia/Kolkata` IST timezone).
5. **Math Champion (👑)**: Master 5 topics and hold 4 other badges.

**Idempotence Guarantee**: The `RewardLedger` and `StudentAchievement` collections utilize compound unique indexes `(userId, rewardKey)` and `(userId, achievementId)`. Repeat clicks or network retries are mathematically blocked from double-awarding points or badges.

---

## 13. Deployment

### Backend on Render (Web Service)
1. Create a new Web Service from the repository on [render.com](https://render.com).
2. Set Root Directory: `server`.
3. Set Build Command: `npm install`.
4. Set Start Command: `node server.js`.
5. Set Health Check Path: `/api/health`.
6. Add Environment Variables:
   - `MONGODB_URI`: Your MongoDB Atlas cluster connection string.
   - `JWT_SECRET`: Random 64-character secret.
   - `CLIENT_ORIGIN`: Your frontend Vercel URL (e.g. `https://<your-app>.vercel.app`).
   - `AI_ENABLED`: `true` (with `AI_API_KEY`) or `false` (for deterministic fallback).
7. Seed Atlas cluster once:
   ```bash
   cd server && MONGODB_URI="<your-atlas-uri>" node seed/seed.js
   ```

### Frontend on Vercel
1. Import the repository on [vercel.com](https://vercel.com).
2. Set Root Directory: `client`.
3. Framework Preset: `Vite`.
4. Build Command: `npm run build`.
5. Output Directory: `dist`.
6. Environment Variables:
   - `VITE_API_URL`: Your Render backend URL + `/api` (e.g. `https://<your-api>.onrender.com/api`).
7. Deploy. `client/vercel.json` automatically ensures client-side SPA routing rewrites to `/index.html`.

---

## 14. Testing and Results

Run the full automated test suite:
```bash
cd server
npm test
```

### Test Suite Output
```text
PASS tests/quiz.api.test.js
  ✓ GET /api/health returns status ok
  ✓ POST /api/auth/guest creates temporary user with token
  ✓ GET /api/grades/5/topics returns 5 topics
  ✓ POST /api/quizzes/start starts a quiz and HIDES correctAnswer (Security Q7)
  ✓ POST /api/quizzes/submit submits answer and reveals result with points
  ✓ POST /api/quizzes/submit prevents duplicate answer submission (409)

PASS tests/validate.test.js
  ✓ exact fraction arithmetic adds fractions correctly
  ✓ parses answers in various formats
  ✓ safely evaluates mathematical expressions
  ✓ rejects a wrong AI answer
  ✓ accepts a correct mathematical question
  ✓ rejects questions with duplicate options
  ✓ rejects questions where correctAnswer is not in options

PASS tests/chat.test.js
  ✓ 1. Simple arithmetic: 125 + 275 = 400
  ✓ 2. Fractions: Add 1/2 + 1/3 = 5/6
  ✓ 3. Algebra: Solve 3x - 7 = 11 -> x = 6
  ✓ 4. Percentages: Calculate 15% of 800 = 120
  ✓ 5. Geometry: Area of circle with radius 7 = ~153.94
  ✓ 6. Probability: Fair coin toss = 1/2 or 50%
  ✓ 7. Statistics: Mean of 10, 20, and 30 = 20
  ✓ 8. Calculus: Derivative of x^3 - 4x + 1
  ✓ POST /api/chat rejects empty or whitespace messages (400)
  ✓ POST /api/chat responds with step-by-step mathematical solution
  ✓ GET /api/conversations/:id retrieves conversation history with messages
  ✓ POST /api/chat/feedback records upvote/downvote
  ✓ POST /api/math/verify returns verification breakdown
  ✓ POST /api/quiz/generate produces targeted practice questions
  ✓ DELETE /api/conversations/:id deletes conversation and related messages

PASS tests/adventure.test.js
  ✓ GET /api/worlds returns unlocked worlds with star requirements
  ✓ POST /api/game/start initializes mission session and hides correct answers
  ✓ POST /api/game/answer processes answer and awards damage/points
  ✓ POST /api/game/complete calculates 1-3 stars, coins, and updates progress
  ✓ POST /api/shop/purchase deducts coins and prevents duplicate purchases
  ✓ GET /api/challenges/daily provides calendar-aligned challenge

PASS tests/adaptive.test.js
  ✓ 3 correct in a row promotes easy -> medium
  ✓ 2 wrong in a row demotes medium -> easy
  ✓ never goes above hard or below easy
  ✓ mixed answers stay at current level
  ✓ startingLevel selects appropriate level from last attempt

Test Suites: 5 passed, 5 total
Tests:       39 passed, 39 total
Snapshots:   0 total
Time:        1.80 s
```

---

## 15. Known Limitations and Future Work
1. **Free-Tier Cold Starts**: Free Render server instances spin down after inactivity; the first API request may take 30–40 seconds. A clear loading message is displayed in the UI.
2. **Speech Synthesis Voices**: Browser `window.speechSynthesis` relies on the host OS voices. Pitch and speed have been normalized for maximum child accessibility.
3. **Expanded Multi-Language**: English and Tamil are fully supported in UI strings and prompts; future releases will expand to Hindi, Telugu, and Kannada.
4. **Teacher Classroom Groups**: Teachers can view student progress across all topics; future updates will support individual classroom join codes and printable worksheet exports.

---

*Prepared for Task 1: Complete Implementation Process and Analysis — Math Adventure (Grades 5 and 6).*
