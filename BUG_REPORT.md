# NutriAI — Software Defect & Bug Report

This document records genuine, reproducible defects identified through static code inspection, manual exploratory testing, API inspection, and build validation of the NutriAI application, along with resolution and verification details.

---

## Defect Summary
| Bug ID | Title | Module | Severity | Priority | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **BUG-001** | Backend CORS policy rejects frontend dev runner port 4173 | Backend API | Major | High | **Fixed** |
| **BUG-002** | Food Analyzer sends image to text-only LLM without vision pipeline | Food Analyzer / AI | Major | High | **Fixed** |
| **BUG-003** | Diet Planner form allows submission of out-of-bounds input values | Diet Planner | Medium | High | **Fixed** |
| **BUG-004** | Meal macro regex parser fails when labels precede values (`Protein: 25g`) | Diet Plan Parser | Medium | Medium | **Fixed** |
| **BUG-005** | Landing page newsletter subscription form triggers browser page reload | Landing Page | Low | Low | **Fixed** |
| **BUG-006** | 46 ESLint errors across frontend components fail CI/linter check | Code Quality | Medium | Medium | **Fixed** |
| **BUG-007** | Broken hardcoded paths in `start-dev.cmd` script | Developer Tooling | Low | Low | **Fixed** |

---

### BUG-001: Backend CORS policy rejects frontend dev runner port 4173
* **Bug ID:** BUG-001
* **Module:** Backend API / Middleware (`server.js`)
* **Severity:** Major
* **Priority:** High
* **Environment:** Node.js v22.23.1, Windows 11
* **Preconditions:** Backend server running on port 5000. Frontend launched using `npm run dev` (`scripts/dev.mjs` which binds to port 4173).
* **Steps to Reproduce:**
  1. Start backend server: `cd backend && node server.js`.
  2. Start frontend dev runner: `cd frontend && npm run dev` (starts on `http://localhost:4173`).
  3. Send an HTTP request (or preflight `OPTIONS`) from `http://localhost:4173` to `http://localhost:5000/api/chat`.
* **Expected Result:**
  Backend CORS middleware accepts requests originating from `http://localhost:4173` during local development and sets `Access-Control-Allow-Origin`.
* **Actual Result (Before Fix):**
  Backend rejected the request and threw an unhandled error:
  `CORS policy: Origin http://localhost:4173 is not allowed`, resulting in an HTTP 500 response.
* **Resolution & Fix Details:**
  Updated `allowedOrigins` in [`backend/server.js`](file:///c:/Users/251124/OneDrive/Desktop/nutriai/backend/server.js) with regex matching for local loopback addresses (`localhost` and `127.0.0.1` on any port) alongside the production Vercel URL (`https://nutriai-sable.vercel.app`).
* **Verification:**
  Sent preflight `OPTIONS` and `GET` requests with `Origin: http://localhost:4173` against the backend server; confirmed HTTP 200/204 response with header `Access-Control-Allow-Origin: http://localhost:4173`.
* **Status:** **Fixed**

---

### BUG-002: Food Analyzer sends image to text-only LLM without vision pipeline
* **Bug ID:** BUG-002
* **Module:** Food Analyzer / AI Service (`FoodAnalyzer.tsx`, `groq.ts`, `routes/chat.js`)
* **Severity:** Major
* **Priority:** High
* **Environment:** Frontend React + Express backend
* **Preconditions:** User navigates to `/food-analyzer`.
* **Steps to Reproduce:**
  1. Upload a picture of a meal (e.g. salad or grilled chicken).
  2. Click "Analyze Image".
  3. Inspect the outgoing payload and backend handler in `backend/routes/chat.js`.
* **Expected Result:**
  The image data (base64 data URL) is passed to a multimodal vision model (e.g., `qwen/qwen3.8-27b`) with image content blocks.
* **Actual Result (Before Fix):**
  The frontend sent `meta: { type: "food_analyzer", image: base64 }` and `message: "Analyze food image"`. The backend ignored `meta.image` and passed only the string `"Analyze food image"` to text-only model `llama-3.3-70b-versatile`.
* **Resolution & Fix Details:**
  In [`backend/routes/chat.js`](file:///c:/Users/251124/OneDrive/Desktop/nutriai/backend/routes/chat.js):
  - Detected `food_analyzer` requests and verified image payload existence and format.
  - Dynamically switched model to Groq multimodal vision model `qwen/qwen3.8-27b`.
  - Built multimodal message structure containing both text prompt and `{ type: "image_url", image_url: { url: dataUrl } }`.
  - Handled invalid/missing images gracefully with HTTP 400.
* **Verification:**
  Verified request payload formatting in `frontend/src/services/groq.ts` and automated unit test in `frontend/src/test/groqService.test.ts`.
* **Status:** **Fixed**

---

### BUG-003: Diet Planner form allows submission of out-of-bounds input values
* **Bug ID:** BUG-003
* **Module:** Diet Planner (`Pages.tsx`, `routes/chat.js`)
* **Severity:** Medium
* **Priority:** High
* **Environment:** All browsers
* **Preconditions:** User is on `/diet-planner`.
* **Steps to Reproduce:**
  1. Enter Age: `999` (exceeds max 80).
  2. Enter Height: `350` (exceeds max 220).
  3. Enter Weight: `500` (exceeds max 150).
  4. Note that red warning text appears below inputs.
  5. Click "Generate AI Diet Plan".
* **Expected Result:**
  The "Generate AI Diet Plan" submit button is disabled when input values violate validation boundaries, and submission is prevented.
* **Actual Result (Before Fix):**
  The submit button only checked `loading` (`disabled={loading}`). Clicking the button dispatched out-of-bounds inputs to the backend.
* **Resolution & Fix Details:**
  - In [`frontend/src/components/Pages.tsx`](file:///c:/Users/251124/OneDrive/Desktop/nutriai/frontend/src/components/Pages.tsx): Computed `isAgeValid` (18–80), `isHeightValid` (140–220 cm), `isWeightValid` (40–150 kg), and combined `isFormValid`. Set `disabled={loading || !isFormValid}` on the submit button. Added guard in `handleGenerate` setting error state if invoked with invalid data.
  - In [`backend/routes/chat.js`](file:///c:/Users/251124/OneDrive/Desktop/nutriai/backend/routes/chat.js): Added server-side boundary validation returning HTTP 400 if age, height, or weight are out of valid ranges.
* **Verification:**
  Automated tests in `frontend/src/test/components.test.tsx` verify the submit button is disabled when age 999 or out-of-bound dimensions are entered and enabled when values are within boundaries.
* **Status:** **Fixed**

---

### BUG-004: Meal macro regex parser fails when labels precede values (`Protein: 25g`)
* **Bug ID:** BUG-004
* **Module:** Diet Plan Parser (`dietPlanParser.ts`)
* **Severity:** Medium
* **Priority:** Medium
* **Environment:** Node.js / Browser JavaScript runtime
* **Preconditions:** AI response generated with standard label-first formatting.
* **Steps to Reproduce:**
  1. Provide a response string containing: `"Breakfast: Scrambled eggs. Calories: 350. Protein: 25g. Carbs: 5g. Fat: 22g."`
  2. Call `parseDietPlanResponse(text)`.
  3. Inspect `parsedDays[0].meals[0].protein`.
* **Expected Result:**
  `protein` is parsed as numerical value `25`.
* **Actual Result (Before Fix):**
  `protein` returned `null` because regex only looked for value-first format (`25g protein`).
* **Resolution & Fix Details:**
  Implemented bidirectional extraction helper `extractMacro(text, ...patterns)` in [`frontend/src/components/dietPlanParser.ts`](file:///c:/Users/251124/OneDrive/Desktop/nutriai/frontend/src/components/dietPlanParser.ts). The parser now matches both label-first (`Protein: 25g`, `Carbs: 40g`, `Fat: 15g`) and value-first (`25g protein`) formats.
* **Verification:**
  All 5 unit tests in `frontend/src/test/dietPlanParser.test.ts` pass, including regression cases specifically checking label-first format.
* **Status:** **Fixed**

---

### BUG-005: Landing page newsletter subscription form triggers browser page reload
* **Bug ID:** BUG-005
* **Module:** Landing Page (`LandingPage.tsx`)
* **Severity:** Low
* **Priority:** Low
* **Environment:** All browsers
* **Preconditions:** User on `/`.
* **Steps to Reproduce:**
  1. Scroll down to the newsletter section "Stay in the loop".
  2. Type any email address into the input.
  3. Press Enter or click the "Subscribe" button.
* **Expected Result:**
  The submission is intercepted by an `onSubmit` handler, preventing default page navigation and providing an in-page feedback confirmation message.
* **Actual Result (Before Fix):**
  The `<form>` element had no `onSubmit` handler. The browser performed a full HTTP GET reload with query string parameters.
* **Resolution & Fix Details:**
  In [`frontend/src/components/LandingPage.tsx`](file:///c:/Users/251124/OneDrive/Desktop/nutriai/frontend/src/components/LandingPage.tsx):
  - Added `newsletterEmail` and `newsletterStatus` (`idle` | `success` | `error`) state variables.
  - Added `handleNewsletterSubmit(e: React.FormEvent)` with `e.preventDefault()`.
  - Added email regex validation (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`).
  - Added clear in-place user feedback: "Thank you for subscribing! We'll keep you updated." on success, and "Please enter a valid email address." on invalid input.
* **Verification:**
  Verified form submits asynchronously without reloading the page, renders feedback, and resets appropriately.
* **Status:** **Fixed**

---

### BUG-006: 46 ESLint errors across frontend components fail CI/linter check
* **Bug ID:** BUG-006
* **Module:** Frontend Code Quality
* **Severity:** Medium
* **Priority:** Medium
* **Environment:** Node.js v22.23.1, ESLint v8.57.0
* **Preconditions:** Frontend dependencies installed.
* **Steps to Reproduce:**
  1. Open terminal in `frontend/`.
  2. Run `npm run lint`.
* **Expected Result:**
  Lint checks exit with code 0 (zero errors).
* **Actual Result (Before Fix):**
  ESLint reported 46 errors across 5 files:
  - `FoodAnalyzer.tsx`: Unused variables `file`, `err`.
  - `Pages.tsx`: 28 unused variables/setters/icons.
  - `WeekSelector.tsx`: Unused argument `selectedDay`.
  - `dietPlanParser.ts`: 12 unnecessary regex escape characters.
  - `ProgressRing.tsx`: Unused parameter `color`.
* **Resolution & Fix Details:**
  - Removed unused imports (`FiMessageCircle`, `Card`, `ProgressRing`, `Gauge`, `Avatar`) in `Pages.tsx`.
  - Displayed `file.name` and logged error in `FoodAnalyzer.tsx`.
  - Prefixed unused destructured props with `_` in `WeekSelector.tsx`.
  - Replaced hardcoded gradient color with `color` prop in `ProgressRing.tsx`.
  - Removed unnecessary escape characters in `dietPlanParser.ts`.
  - Applied standard ES2019 optional catch bindings (`catch { ... }`) across `Pages.tsx`.
* **Verification:**
  Executed `npm run lint` in `frontend/`. Command exited with code 0: **0 errors, 0 warnings**.
* **Status:** **Fixed**

---

### BUG-007: Broken hardcoded paths in `start-dev.cmd` script
* **Bug ID:** BUG-007
* **Module:** Developer Tooling (`frontend/scripts/start-dev.cmd`)
* **Severity:** Low
* **Priority:** Low
* **Environment:** Windows Command Prompt
* **Preconditions:** User runs `frontend\scripts\start-dev.cmd`.
* **Steps to Reproduce:**
  1. Execute `frontend\scripts\start-dev.cmd`.
* **Expected Result:**
  Script initiates the development server relative to the project directory.
* **Actual Result (Before Fix):**
  Script attempted to `cd /d C:\Users\251124\OneDrive\Desktop\nutriai` and run `"C:\Program Files\nodejs\node.exe" scripts\dev.mjs`, which fails because paths were hardcoded to a specific machine.
* **Resolution & Fix Details:**
  Updated [`frontend/scripts/start-dev.cmd`](file:///c:/Users/251124/OneDrive/Desktop/nutriai/frontend/scripts/start-dev.cmd) to use relative navigation (`cd /d "%~dp0.."`) and execute `node scripts\dev.mjs` using the system Node binary from `PATH`.
* **Verification:**
  Verified script navigates to the parent directory and references existing `scripts/dev.mjs`.
* **Status:** **Fixed**
