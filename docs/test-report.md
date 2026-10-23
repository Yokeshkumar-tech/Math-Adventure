# Math Adventure — Automated & Manual Test Report

**Date**: 23 October 2026  
**Platform**: Grades 5 & 6 Gamified Mathematics Learning  
**Stack**: React (Vite) + Node.js (Express) + MongoDB + Jest + Supertest  

---

## 1. Automated Test Suite Summary

Executed with: `npm test` in `/server`
- **Total Test Suites**: 3 passed, 3 total
- **Total Tests**: 18 passed, 18 total
- **Execution Time**: ~2.5 seconds

### Test Suites Breakdown

#### 1. `tests/adaptive.test.js` (Adaptive Difficulty Engine)
| # | Test Case Description | Result |
|---|-----------------------|--------|
| 1 | 3 correct in a row promotes `easy` -> `medium` | **PASS** |
| 2 | 2 wrong in a row demotes `medium` -> `easy` | **PASS** |
| 3 | Never goes above `hard` or below `easy` (Boundary clamping) | **PASS** |
| 4 | Mixed answers stay at current level and reset streaks | **PASS** |
| 5 | `startingLevel` selects correct initial level from previous attempt | **PASS** |

#### 2. `tests/validate.test.js` (Mathematical Arithmetic & Question Validation)
| # | Test Case Description | Result |
|---|-----------------------|--------|
| 1 | Exact fraction arithmetic (`Frac` class): `1/2 + 1/2 = 1` without rounding | **PASS** |
| 2 | Parses mixed numbers ("2 1/2"), decimals ("0.75"), units ("15 m", "Rs 40") | **PASS** |
| 3 | Safely evaluates complex expressions `3/4*20`, `25-(3/5*25)` without `eval()` | **PASS** |
| 4 | Rejects wrong AI answer (`correctAnswer: "16"` for `3/4*20`) | **PASS** |
| 5 | Accepts verified mathematical question (`correctAnswer: "15"`) | **PASS** |
| 6 | Rejects questions with duplicate options | **PASS** |
| 7 | Rejects questions where `correctAnswer` is missing from options | **PASS** |

#### 3. `tests/quiz.api.test.js` (Integration API Endpoints)
| # | Test Case Description | Result |
|---|-----------------------|--------|
| 1 | `GET /api/health` returns status: "ok" | **PASS** |
| 2 | `POST /api/auth/guest` creates temporary session with 250 pts, 5-day streak | **PASS** |
| 3 | `GET /api/grades/5/topics` returns 5 topics | **PASS** |
| 4 | `POST /api/quizzes/start` hides `correctAnswer` from payload (**Security Q7**) | **PASS** |
| 5 | `POST /api/quizzes/submit` verifies answer, awards points and returns explanation | **PASS** |
| 6 | `POST /api/quizzes/submit` rejects duplicate answer submission (HTTP 409) | **PASS** |

---

## 2. Question Bank Mathematical Verification

- **Total Seeded Questions**: 150 questions (10 topics × 15 questions: 5 easy, 5 medium, 5 hard)
- **Validation Script**: `server/seed/generateQuestions.js`
- **Verification Rule**: Every numeric question checked by exact fraction evaluator `validateQuestion()`
- **Result**: **150 / 150 (100%) mathematical pass rate**

---

## 3. Manual Traceability Verification (Section 11 Matrix)

| ID | Requirement / Test | Expected Outcome | Verified |
|----|--------------------|------------------|----------|
| **L1** | Grade 5 selection | 5 Grade 5 topics displayed with icons and status | **YES** |
| **L2** | Grade 6 selection | 5 Grade 6 topics displayed | **YES** |
| **L3** | Topic selection | Fractions opens lesson with learning objectives | **YES** |
| **L4** | Worked examples | 2 worked examples with numbered steps | **YES** |
| **A1** | AI explanation | Age-appropriate explanation with structured schema | **YES** |
| **A2** | Explain More Simply | Rewrites current explanation with simpler analogy | **YES** |
| **A3** | AI failure fallback | Saved teacher-validated lesson displayed smoothly | **YES** |
| **A4** | Infographic | Programmatic SVG fraction pizza + sliders + caption | **YES** |
| **A5** | Video lesson | 6 narrated scenes with SpeechSynthesis & captions | **YES** |
| **Q1** | MCQ options | Exactly 4 large multiple-choice buttons (keys 1-4) | **YES** |
| **Q2** | Three levels | Easy (10 pts), Medium (20 pts), Hard (30 pts) reachable | **YES** |
| **Q3** | Correct feedback | Green banner, points added, celebratory feedback | **YES** |
| **Q4** | Incorrect feedback | Orange encouraging banner, correct answer & explanation | **YES** |
| **Q5** | Adaptive change | 3 correct promotes level; 2 wrong demotes level | **YES** |
| **Q6** | Final score | Accuracy calculated on server: (correct / total) × 100 | **YES** |
| **Q7** | Answer hiding | Network inspect reveals `correctAnswer` omitted prior to submit | **YES** |
| **G1** | Points system | Easy +10, Medium +20, Hard +30, Lesson +25, Goal +50 | **YES** |
| **G2** | No double reward | Compound unique indexes block duplicate points | **YES** |
| **G3** | Results saved | `QuizAttempt` and `RewardLedger` saved in MongoDB | **YES** |
| **G4** | Badges | 5 badges unlocked idempotently with confetti fireworks | **YES** |
| **G5** | Persistence | Refreshing page maintains points, streak, and progress | **YES** |
| **U1** | Mobile layout | Responsive on 360px screens without horizontal scroll | **YES** |
| **U2** | Keyboard navigation | Full quiz playable via keys 1-4 and Enter | **YES** |
