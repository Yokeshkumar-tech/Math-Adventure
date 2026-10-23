# Math Adventure — API Specification

Base URL: `http://localhost:5000/api` (Production: `https://<your-backend>.onrender.com/api`)

---

## 1. Authentication Endpoints

### `POST /api/auth/register`
- **Access**: Public
- **Body**: `{ "name": string, "username": string, "password": string, "grade": 5|6, "avatar": string }`
- **Response**: `{ "token": string, "user": UserObject }`

### `POST /api/auth/login`
- **Access**: Public
- **Body**: `{ "username": string, "password": string }`
- **Response**: `{ "token": string, "user": UserObject }`

### `POST /api/auth/guest`
- **Access**: Public
- **Description**: Creates temporary evaluator guest account pre-populated with 250 XP, 5-day streak, 3 unlocked badges, and quiz attempt history.
- **Response**: `{ "token": string, "user": UserObject }`

### `GET /api/auth/me`
- **Access**: Bearer JWT
- **Response**: `{ "user": UserObjectWithLevelInfo }`

### `PATCH /api/users/me`
- **Access**: Bearer JWT
- **Body**: `{ "grade": 5|6, "avatar": string, "displayName": string, "showOnLeaderboard": boolean, "settings": { "fontScale": number, "highContrast": boolean, "language": "en"|"ta" } }`
- **Response**: `{ "user": UpdatedUserObject }`

---

## 2. Lessons & Curriculum Endpoints

### `GET /api/grades/:grade/topics`
- **Access**: Bearer JWT
- **Params**: `grade` = 5 or 6
- **Response**: Array of 5 topic objects with student progress status (`"completed"`, `"in-progress"`, `"not-started"`)

### `GET /api/lessons/:id`
- **Access**: Bearer JWT
- **Params**: `id` = MongoDB ObjectId or topic slug
- **Response**: Complete lesson object with 2 worked examples, explanation, objectives, key points, and infographic type

### `POST /api/lessons/:id/complete`
- **Access**: Bearer JWT
- **Description**: Marks lesson complete, awards 25 points idempotently, checks badge milestones.
- **Response**: `{ "message": string, "pointsAwarded": 25, "totalPoints": number, "newBadges": [] }`

---

## 3. Adaptive Quiz Endpoints

### `POST /api/quizzes/start`
- **Access**: Bearer JWT
- **Body**: `{ "topic": string, "grade": 5|6 }`
- **Description**: Creates quiz session, picks first question at starting difficulty level.
- **Security**: The `correctAnswer` field is explicitly excluded from the response.
- **Response**: `{ "sessionId": string, "question": PublicQuestion, "number": 1, "total": 10, "level": "easy"|"medium"|"hard" }`

### `POST /api/quizzes/submit`
- **Access**: Bearer JWT
- **Body**: `{ "sessionId": string, "questionId": string, "selected": string }`
- **Description**: Verifies answer on server, computes points (10/20/30), updates streak and adaptive level (3 correct promote, 2 wrong demote), returns explanation and next question without answers.
- **Response**: `{ "correct": boolean, "correctAnswer": string, "explanation": string, "pointsEarned": number, "nextLevel": string, "levelChanged": string|null, "isLast": boolean, "nextQuestion": PublicQuestion|null }`

### `POST /api/quizzes/finish`
- **Access**: Bearer JWT
- **Body**: `{ "sessionId": string }`
- **Description**: Computes overall accuracy, persists `QuizAttempt`, awards points via `RewardLedger`, updates streak in IST timezone, checks achievements, returns personalised recommendation.
- **Response**: `{ "attempt": AttemptObject, "newBadges": [], "recommendation": RecommendationObject }`

### `POST /api/quizzes/revision`
- **Access**: Bearer JWT
- **Description**: Aggregates questions previously missed by the student and generates a targeted revision practice session.

### `POST /api/quizzes/daily-challenge`
- **Access**: Bearer JWT
- **Description**: Deterministically seeds 5 daily questions based on current date.

---

## 4. AI & Tutor Endpoints

### `POST /api/ai/explanation`
- **Access**: Bearer JWT (Rate limited: max 30/min)
- **Body**: `{ "grade": 5|6, "topic": string, "mode": "generate"|"simpler"|"example", "currentText": string }`
- **Description**: Calls LLM with Zod validation and exact fraction verification; falls back gracefully to teacher-validated database content if disabled or offline.

### `POST /api/ai/summary`
- **Access**: Bearer JWT
- **Body**: `{ "topic": string, "explanation": string }`
- **Response**: `{ "summary": string, "source": "ai"|"fallback" }`

### `POST /api/ai/tutor`
- **Access**: Bearer JWT
- **Body**: `{ "topic": string, "grade": 5|6, "conversation": [], "message": string }`
- **Description**: Professor Pi kid-safe math tutor; rejects quiz cheating, guides step-by-step.

---

## 5. Analytics & Gamification Endpoints

### `GET /api/progress`
- **Access**: Bearer JWT
- **Response**: Full student dashboard stats, recent 7 quiz attempts for Recharts, topic-level mastery rates, and mistake analysis.

### `GET /api/achievements`
- **Access**: Bearer JWT
- **Response**: All 5 adventure badges with unlocked flags and timestamps.

### `GET /api/leaderboard`
- **Access**: Bearer JWT
- **Response**: Opt-in child-safe weekly leaderboard (nicknames only, guests excluded).

### `GET /api/recommendations`
- **Access**: Bearer JWT
- **Response**: Recommended next learning action (weak topic revision, next module, or hard challenge).

### `GET /api/health`
- **Access**: Public
- **Response**: `{ "status": "ok", "timestamp": string }`
