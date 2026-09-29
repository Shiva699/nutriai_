# NutriAI — Software Defect & Bug Report

This document records genuine, reproducible defects identified through static code inspection, manual exploratory testing, API inspection, and build validation of the NutriAI application.

---

## Defect Summary
| Bug ID | Title | Module | Severity | Priority | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **BUG-001** | Backend CORS policy rejects frontend dev runner port 4173 | Backend API | Major | High | Open |
| **BUG-002** | Food Analyzer sends image to text-only LLM without vision pipeline | Food Analyzer / AI | Major | High | Open |
| **BUG-003** | Diet Planner form allows submission of out-of-bounds input values | Diet Planner | Medium | High | Open |
| **BUG-004** | Meal macro regex parser fails when labels precede values (`Protein: 25g`) | Diet Plan Parser | Medium | Medium | Open |
| **BUG-005** | Landing page newsletter subscription form triggers browser page reload | Landing Page | Low | Low | Open |
| **BUG-006** | 46 ESLint errors across frontend components fail CI/linter check | Code Quality | Medium | Medium | Open |
| **BUG-007** | Broken hardcoded paths in `start-dev.cmd` script | Developer Tooling | Low | Low | Open |

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
* **Actual Result:**
  Backend rejects the request and throws an unhandled error:
  `CORS policy: Origin http://localhost:4173 is not allowed`, resulting in an HTTP 500 response.
* **Evidence:**
  In [`backend/server.js`](file:///c:/Users/251124/OneDrive/Desktop/nutriai/backend/server.js#L13-L17):
  ```javascript
  const allowedOrigins = [
    "https://nutriai-sable.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000",
  ];
  ```
  Port `4173` used by `scripts/dev.mjs` is omitted from `allowedOrigins`.
* **Status:** Open

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
  The image data (base64 or binary) is passed to a multimodal vision model (e.g., `llama-3.2-11b-vision-preview`) with image content blocks.
* **Actual Result:**
  The frontend sends `meta: { type: "food_analyzer", image: base64 }` and `message: "Analyze food image"`. The backend ignores `meta.image` and passes only the string `"Analyze food image"` to text-only model `llama-3.3-70b-versatile`. The model hallucinates without ever inspecting the food image.
* **Evidence:**
  In [`backend/routes/chat.js`](file:///c:/Users/251124/OneDrive/Desktop/nutriai/backend/routes/chat.js#L108-L122):
  ```javascript
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: message }, // "Analyze food image" — image is never passed!
    ],
  });
  ```
* **Status:** Open

---

### BUG-003: Diet Planner form allows submission of out-of-bounds input values
* **Bug ID:** BUG-003
* **Module:** Diet Planner (`Pages.tsx`)
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
  The "Generate AI Diet Plan" submit button should be disabled when input values violate validation boundaries, or submission should be blocked with a form error.
* **Actual Result:**
  The submit button is only disabled while `loading` (`disabled={loading}`). Clicking the button dispatches the request to the backend with invalid parameters.
* **Evidence:**
  In [`frontend/src/components/Pages.tsx`](file:///c:/Users/251124/OneDrive/Desktop/nutriai/frontend/src/components/Pages.tsx#L584-L590):
  ```tsx
  <button
    onClick={handleGenerate}
    disabled={loading} // Only checks loading, does not check validation state!
    className="..."
  >
  ```
* **Status:** Open

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
* **Actual Result:**
  `protein` is returned as `null`.
* **Evidence:**
  In [`frontend/src/components/dietPlanParser.ts`](file:///c:/Users/251124/OneDrive/Desktop/nutriai/frontend/src/components/dietPlanParser.ts#L243-L245):
  ```typescript
  protein: extract(text, /(\d{1,3})\s*g\s*protein/i),
  carbs: extract(text, /(\d{1,3})\s*g\s*carb/i),
  fat: extract(text, /(\d{1,3})\s*g\s*fat/i),
  ```
  The regex expects `25g protein` (quantity before word) rather than `Protein: 25g` (word before quantity, as dictated by the system prompt in `chat.js`).
* **Status:** Open

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
* **Actual Result:**
  The `<form>` element has no `onSubmit` handler. The browser performs a full HTTP GET reload with query string parameters.
* **Evidence:**
  In [`frontend/src/components/LandingPage.tsx`](file:///c:/Users/251124/OneDrive/Desktop/nutriai/frontend/src/components/LandingPage.tsx#L239-L242):
  ```tsx
  <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto w-full">
    <input type="email" placeholder="Enter your email" ... />
    <button type="submit" ...>Subscribe</button>
  </form>
  ```
* **Status:** Open

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
* **Actual Result:**
  ESLint reports 46 errors across 5 files:
  - `FoodAnalyzer.tsx`: Unused variables `file`, `err`.
  - `Pages.tsx`: 28 unused variables/setters/icons (`FiMessageCircle`, `Card`, `Gauge`, `Avatar`, etc.).
  - `WeekSelector.tsx`: Unused argument `selectedDay`.
  - `dietPlanParser.ts`: 12 unnecessary regex escape characters (`\.`, `\)`, `\-`, `\*`, `\•`).
  - `ProgressRing.tsx`: Unused parameter `color`.
* **Evidence:**
  Command output:
  `✖ 46 problems (46 errors, 0 warnings)` with exit code 1.
* **Status:** Open

---

### BUG-007: Broken hardcoded paths in `start-dev.cmd` script
* **Bug ID:** BUG-007
* **Module:** Developer Tooling (`frontend/scripts/start-dev.cmd`)
* **Severity:** Low
* **Priority:** Low
* **Environment:** Windows Command Prompt
* **Preconditions:** User runs `frontend\scripts\start-dev.cmd`.
* **Steps to Reproduce:**
  1. Double click or execute `frontend\scripts\start-dev.cmd`.
* **Expected Result:**
  Script initiates the development server relative to the project directory.
* **Actual Result:**
  Script attempts to `cd /d C:\Users\251124\OneDrive\Desktop\nutriai` and runs `"C:\Program Files\nodejs\node.exe" scripts\dev.mjs`, which fails because `scripts/` is located under `frontend/scripts/` and node may not be installed at that specific absolute path.
* **Status:** Open
