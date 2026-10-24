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

---

## 6. Adventure Worlds & Mission Progression Endpoints

### `GET /api/worlds`
- **Access**: Bearer JWT
- **Description**: Returns all 5 adventure worlds with unlock requirements, current player stars, and lock/unlock statuses.
- **Response**: `{ "worlds": [WorldObject], "playerStars": number, "unlockedWorlds": [string] }`

### `GET /api/worlds/:worldSlug`
- **Access**: Bearer JWT
- **Params**: `worldSlug` (e.g. `number-forest`, `fraction-kingdom`)
- **Description**: Returns the world details, boss metadata, and all missions with stars earned and completion status.
- **Response**: `{ "world": WorldObject, "missions": [MissionWithProgressObject] }`

### `GET /api/missions/:missionId`
- **Access**: Bearer JWT
- **Params**: `missionId` (MongoDB ObjectId)
- **Description**: Retrieves full mission brief, storyline, dialogue, objective, rewards, and question count.
- **Response**: `{ "mission": MissionObject }`

---

## 7. Interactive Game Session Engine Endpoints

### `POST /api/game/start`
- **Access**: Bearer JWT
- **Body**: `{ "missionId": string }`
- **Description**: Initializes a secure game session for the mission. Fetches questions while strictly stripping correct answers.
- **Response**: `{ "sessionId": string, "totalQuestions": number, "question": QuestionObjectWithoutAnswer, "boss": BossObject|null }`

### `GET /api/game/session/:sessionId`
- **Access**: Bearer JWT
- **Params**: `sessionId`
- **Description**: Recovers in-progress game session upon page refresh without losing progress.

### `POST /api/game/hint`
- **Access**: Bearer JWT
- **Body**: `{ "sessionId": string, "questionId": string, "level": 1|2|3 }`
- **Description**: Fetches progressive hint (1: small clue, 2: concept/formula, 3: worked example with different values).
- **Response**: `{ "hint": string, "level": number }`

### `POST /api/game/answer`
- **Access**: Bearer JWT
- **Body**: `{ "sessionId": string, "questionId": string, "answer": string, "timeTakenSeconds": number }`
- **Description**: Server-side answer validation. Checks numerical, fraction, true/false, or multiple-choice input. Calculates points and boss damage.
- **Response**: `{ "correct": boolean, "correctAnswer": string, "explanation": string, "pointsEarned": number, "bossDamage": number, "isComplete": boolean }`

### `POST /api/game/complete`
- **Access**: Bearer JWT
- **Body**: `{ "sessionId": string }`
- **Description**: Finalizes mission on the server. Computes 1-3 stars, coins, and XP. Updates player progress in MongoDB, checks world unlock conditions and achievements.
- **Response**: `{ "stars": number, "coinsEarned": number, "xpEarned": number, "totalCoins": number, "totalStars": number, "unlockedWorlds": [string], "newAchievements": [string] }`

---

## 8. Royal Armory & Character Customization Endpoints

### `GET /api/shop`
- **Access**: Bearer JWT
- **Description**: Fetches all cosmetic items (armor, shields, hats, wands, pets) along with the player's inventory and equipped gear.
- **Response**: `{ "items": [ShopItemObject], "inventory": [InventoryItemObject], "userCoins": number }`

### `POST /api/shop/purchase`
- **Access**: Bearer JWT
- **Body**: `{ "itemId": string }`
- **Description**: Atomically deducts coins, adds item to student's Inventory, logs reward history, and prevents double purchases.
- **Response**: `{ "success": true, "remainingCoins": number, "purchasedItem": ShopItemObject }`

### `POST /api/shop/equip`
- **Access**: Bearer JWT
- **Body**: `{ "itemId": string, "slot": "costume"|"accessory"|"weapon"|"pet" }`
- **Description**: Equips an owned item to the player's character sprite.
- **Response**: `{ "success": true, "equippedGear": Object }`

### `POST /api/player/character`
- **Access**: Bearer JWT
- **Body**: `{ "characterId": "knight"|"wizard"|"archer"|"rogue", "costume": string, "accessory": string }`
- **Description**: Updates the player's selected avatar and sprite customisation.
- **Response**: `{ "success": true, "character": Object }`

---

## 9. Daily Challenge & Targeted Revision Endpoints

### `GET /api/challenges/daily`
- **Access**: Bearer JWT
- **Description**: Retrieves today's 3-question daily speed challenge based on the student's calendar date, along with completion and streak status.
- **Response**: `{ "challenge": DailyChallengeObject, "alreadyCompleted": boolean, "streak": number }`

### `POST /api/challenges/daily/submit`
- **Access**: Bearer JWT
- **Body**: `{ "challengeId": string, "answers": [{ "questionId": string, "answer": string }] }`
- **Description**: Validates daily challenge answers on the server, awards bonus daily coins and streak increments, prevents duplicate daily rewards.
- **Response**: `{ "correctCount": number, "coinsAwarded": number, "newStreak": number }`

### `GET /api/revision`
- **Access**: Bearer JWT
- **Description**: Gathers all questions the student previously answered incorrectly across all missions and generates a custom revision session.
- **Response**: `{ "revisionQuestions": [QuestionObject] }`

### `POST /api/revision/answer`
- **Access**: Bearer JWT
- **Body**: `{ "questionId": string, "answer": string }`
- **Description**: Validates revision answer and removes cleared concepts from the player's review queue.

---

## 10. Professor Pi — Real-Time AI Math Chatbot Endpoints

### `POST /api/chat`
- **Access**: Public / Optional Bearer JWT
- **Headers**: `Accept: text/event-stream` (for SSE token streaming) or `application/json`
- **Body**:
  ```json
  {
    "conversationId": "string (optional)",
    "message": "Solve 3x - 7 = 11",
    "level": "elementary" | "middle" | "high" | "college" | "advanced",
    "stream": true
  }
  ```
- **Description**:
  Sends a natural-language mathematics question to Professor Pi. Solves problem, produces numbered steps, formulas, and verified final answer. When `stream: true`, streams tokens in real time via Server-Sent Events (SSE).
- **Streaming Response (SSE)**:
  `data: {"type": "token", "token": "Subtract"}\n\n`
  `data: {"type": "done", "conversationId": "...", "messageId": "...", "content": "...", "steps": [...], "finalAnswer": "x = 6"}\n\n`
- **JSON Response**:
  ```json
  {
    "success": true,
    "conversationId": "65b...",
    "messageId": "65b...",
    "answer": "Let's solve this step by step...",
    "steps": ["Add 7 to both sides: 3x = 18", "Divide both sides by 3: x = 6"],
    "finalAnswer": "x = 6",
    "source": "ai" | "symbolic_math"
  }
  ```

### `GET /api/conversations`
- **Access**: Public / Optional Bearer JWT
- **Description**: Lists recent conversation threads with timestamps, titles, and topics.
- **Response**: `{ "success": true, "conversations": [ConversationObject] }`

### `POST /api/conversations`
- **Access**: Public / Optional Bearer JWT
- **Body**: `{ "title": "Calculus Derivatives", "level": "college", "topic": "Calculus" }`
- **Response**: `{ "success": true, "conversation": ConversationObject }`

### `GET /api/conversations/:id`
- **Access**: Public / Optional Bearer JWT
- **Params**: `id` (Conversation ObjectId)
- **Description**: Loads complete multi-turn conversation thread and messages.
- **Response**: `{ "success": true, "conversation": ConversationObject, "messages": [MessageObject] }`

### `DELETE /api/conversations/:id`
- **Access**: Public / Optional Bearer JWT
- **Params**: `id` (Conversation ObjectId)
- **Description**: Permanently deletes a conversation thread and all its messages.
- **Response**: `{ "success": true, "message": "Conversation and messages deleted successfully" }`

### `POST /api/chat/feedback`
- **Access**: Public / Optional Bearer JWT
- **Body**: `{ "messageId": string, "feedback": "up" | "down" }`
- **Description**: Records student upvote or downvote for AI response quality.
- **Response**: `{ "success": true, "feedback": "up" | "down" }`

### `POST /api/quiz/generate`
- **Access**: Public / Optional Bearer JWT
- **Body**: `{ "topic": "Algebra", "level": "middle", "count": 3 }`
- **Description**: Generates interactive practice questions based on the current chat topic.
- **Response**: `{ "success": true, "topic": string, "questions": [PracticeQuestionObject] }`

### `POST /api/math/verify`
- **Access**: Public / Optional Bearer JWT
- **Body**: `{ "query": "Solve 2x + 5 = 15" }`
- **Description**: Dedicated mathematical verification service using the exact symbolic calculation engine.
- **Response**:
  ```json
  {
    "success": true,
    "verified": true,
    "topic": "Algebra: Linear Equations",
    "formula": "2x + 5 = 15",
    "steps": ["Subtract 5 from both sides: 2x = 10", "Divide both sides by 2: x = 5", "Verify by substitution: 2(5) + 5 = 15"],
    "finalAnswer": "x = 5"
  }
  ```

