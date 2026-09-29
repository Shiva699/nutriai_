# NutriAI — Software Quality Assurance Test Plan

## 1. Project Overview
NutriAI (`nutriai_`) is an AI-powered personalized nutrition and wellness tracking single-page web application (SPA). It integrates a React 18 / TypeScript frontend powered by Vite with an Express.js (Node.js) backend API proxying requests to Groq Cloud LLMs (`openai/gpt-oss-20b` for text generation and `llama-3.2-11b-vision-preview` for vision analysis). The application offers automated 7-day diet generation, interactive AI nutrition coaching, BMI assessment, caloric and macro breakdown, water intake tracking, weight progress logs, and client-side plan curation, using browser `localStorage` as its persistence layer.

---

## 2. Testing Objective
The objective of this QA initiative is to validate the reliability, functional correctness, boundary limits, user interface behavior, API contracts, security practices, and error resiliency of the NutriAI platform. This test plan establishes a standard QA framework tailored for portfolio demonstration in professional Software Testing / QA engineering roles.

---

## 3. Scope
### 3.1 In-Scope
* **Frontend Modules:**
  * Landing page navigation, visual hierarchy, and links.
  * Dashboard Overview metrics calculation, storage synchronization, and AI health score polling.
  * AI Diet Planner form validation, 7-day schedule parsing, macro totals, and PDF export (`jsPDF`).
  * AI Nutrition Coach chat interface, message history rendering, and loading indicators.
  * Food Analyzer image upload handling, data URL conversion, and feedback states.
  * BMI Calculator mathematical precision, classification thresholds, and AI health analysis.
  * Weight Tracker log insertion, weekly/monthly differential computations, and AI timeline forecasting.
  * Calorie & BMR Calculator Harris-Benedict formula validation and activity multipliers.
  * Water Intake Tracker increments (+250ml), percentage indicators, goal resets, and time-of-day buckets.
  * Macro Calculator 30/40/30 distribution formula and AI explanation requests.
  * Saved Plans client-side CRUD lifecycle (create, read, update, delete) and modal validation.
  * Progress Analytics trend aggregation, goal completion scoring, and AI summary trigger.
  * Profile Settings demographic persistence and Dark/Light theme switching.
* **Backend API & Middleware:**
  * Express routing (`/`, `/api/debug`, `/api/chat`, `/api/chat/test`).
  * CORS origin verification for development and production hosts.
  * Payload validation (`message` requirement, `meta` pass-through).
  * Groq SDK exception handling and status code mapping.
* **Security & Configuration:**
  * Exposure of secrets, API keys, and sensitive environment variables in client bundles.
  * Sanitization of AI outputs against XSS and raw markdown artifacts.

### 3.2 Out of Scope
* Backend multi-tenant database persistence (the application natively operates on client `localStorage`).
* User authentication and RBAC workflows (no auth backend is implemented in the current release).
* Real payment gateway or third-party subscription processing for "Upgrade to Pro".
* Automated cross-browser cloud grid testing (e.g. BrowserStack/SauceLabs) beyond local Chromium/Firefox/WebKit engines.

---

## 4. Modules Under Test
1. **MOD-01: Navigation & Layout (Sidebar, AppHeader, ThemeSwitcher)**
2. **MOD-02: Landing Page & Marketing Components**
3. **MOD-03: Dashboard Overview & Metric Aggregates**
4. **MOD-04: AI Diet Planner & Parser (`dietPlanParser.ts`, `DietPlanRenderer.tsx`)**
5. **MOD-05: AI Nutrition Coach (`AINutritionCoach`)**
6. **MOD-06: Food Analyzer (`FoodAnalyzer.tsx`)**
7. **MOD-07: Health Calculators (BMI, Calorie/BMR, Macro)**
8. **MOD-08: Daily Trackers (Weight Tracker, Water Intake Tracker)**
9. **MOD-09: Saved Plans CRUD Management**
10. **MOD-10: Progress Analytics**
11. **MOD-11: Profile & Preferences Management**
12. **MOD-12: Backend Express API & Groq Gateway**

---

## 5. Test Environment
* **Operating System:** Windows 11 x64
* **Node Runtime:** Node.js v22.23.1, npm v10.9.8
* **Frontend Server:** Vite v5.4.0 (Development: `http://localhost:5173`, Dev runner: `http://localhost:4173`)
* **Backend Server:** Express.js 5.2.1 (`http://localhost:5000`)
* **AI Provider:** Groq Cloud API (`openai/gpt-oss-20b` text, `llama-3.2-11b-vision-preview` vision)
* **Browsers:** Google Chrome, Microsoft Edge, Mozilla Firefox
* **Testing Libraries:** Vitest, React Testing Library, jsdom

---

## 6. QA Methodology & Test Levels
### 6.1 Functional Testing
Verification of business logic against specified functional requirements:
* Form calculations (Harris-Benedict equation, BMI metric calculation, macro division).
* State persistence across route changes and browser refreshes via `localStorage`.
* Week selector date offset calculation (ISO Monday alignment, 7-day increments).
* PDF document assembly with user statistics and meal descriptions.

### 6.2 UI & Usability Testing
* Responsiveness of desktop fixed sidebar (`lg:ml-[280px]`) vs. mobile slide-out drawer (`lg:hidden`).
* Dark/Light mode DOM class mutation (`dark` / `light` on `<html>`) and CSS variable application.
* Form feedback (disabled button state during pending requests, error toasts, validation messages).
* Truncation and responsive reflow of long meal descriptions.

### 6.3 API Testing
* Verification of HTTP response headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection`).
* Verification of CORS Preflight `OPTIONS` requests against allowed vs disallowed origins.
* Response schema compliance (`{ success: boolean, reply?: string, error?: string }`).
* Health check status codes (`200 OK`) and payload inspection on `/api/debug`.

### 6.4 AI & LLM Integration Testing
* Request envelope formatting (passing `meta.type` and formatted prompt string).
* Handling of upstream LLM status codes (401 Unauthorized, 429 Rate Limited, 500 Provider Outage).
* Output sanitization through `sanitizeAIText()` ensuring stripping of raw backticks, markdown headers, and delimiter asterisks.
* Parser robustness under malformed or irregular LLM response structures.

### 6.5 Negative & Boundary Testing
* Submitting empty inputs, negative numbers, zero values, and extreme outliers (e.g. age = 999, weight = -10kg).
* File upload boundaries in Food Analyzer (null selection, unsupported file types).
* Malformed JSON in `localStorage` keys and verification of recovery fallbacks.
* Backend requests missing mandatory `message` parameter.

### 6.6 Regression Testing
* Automated unit and component test suite execution before every release build.
* TypeScript compilation (`tsc --noEmit`) and linter checks (`eslint`).

---

## 7. Entry and Exit Criteria
### 7.1 Entry Criteria
* Codebase compiles with TypeScript without compiler errors (`npx tsc --noEmit` exit code 0).
* Backend service can initialize without fatal module syntax exceptions.
* Environment variables template (`.env.example`) documented.

### 7.2 Exit Criteria
* All critical test cases executed and documented in `TEST_CASES.md`.
* 100% of discovered reproducible defects logged in `BUG_REPORT.md`.
* Core mathematical utilities and parser functions backed by automated unit test coverage.
* Build pipeline passes (`npm run build` exits with code 0).
* Zero exposed credentials or plaintext secrets committed in version control.

---

## 8. Risks and Mitigations
| Risk | Impact | Probability | Mitigation |
| :--- | :--- | :--- | :--- |
| Upstream Groq API quota exhaustion or invalid key | High | High | Mock AI service responses in automated tests; categorize live integration failures as BLOCKED rather than false functional defects. |
| Inconsistent LLM text generation format breaks meal parser | Medium | High | Implement regex fallbacks in `dietPlanParser.ts` and test with real synthetic payloads. |
| Port mismatch between frontend dev script (4173) and backend CORS config (5173/3000) | High | Medium | Document exact startup commands and report CORS restriction bug in QA report. |
| Data loss due to browser storage clearing | Low | Low | Document `localStorage` persistence constraints as expected architectural behavior. |

---

## 9. Assumptions
1. The application operates as a standalone client-managed wellness tool where user data remains local to the user's browser.
2. A valid Groq Cloud API key is provided via `GROQ_API_KEY` in `backend/.env` for live AI generation.
3. The primary supported screen sizes are mobile (>=375px), tablet (>=768px), and desktop (>=1280px).
