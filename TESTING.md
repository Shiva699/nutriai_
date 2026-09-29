# NutriAI — QA & Testing Documentation

This document provides an overview of the Quality Assurance methodology, test execution results, automated test framework, defect findings, and test execution procedures implemented for the NutriAI application.

---

## 1. QA Approach

NutriAI was evaluated using a multi-tiered software testing methodology designed to validate application behavior across multiple layers of the stack:

1. **Static Analysis & Code Quality:** TypeScript strict type checking (`tsc --noEmit`), ESLint syntax/quality analysis, and build verification (`vite build`).
2. **Manual Exploratory & Functional Testing:** Systematic verification of navigation flows, form constraints, responsive views, state persistence across browser reloads, and file generation (PDF).
3. **Backend API & Middleware Testing:** Black-box HTTP validation of health checks, request validation schemas, CORS preflight policies, and security headers.
4. **Automated Unit & Component Testing:** Fast, hermetic unit tests verifying mathematical algorithms, parsing logic, text sanitizers, and React component interactions with mocked services.
5. **AI Integration Diagnostics:** Evaluation of LLM request envelopes, prompt templates, loading states, error responses, and multimodal capabilities.

---

## 2. Test Execution Metrics

All metrics represent genuine test execution performed directly against the repository code and runtime:

| Metric | Count | Details |
| :--- | :--- | :--- |
| **Total Test Cases Defined** | **48** | Documented in [`TEST_CASES.md`](./TEST_CASES.md) |
| **Test Cases Actually Executed** | **32** | Interactive manual + API + unit execution |
| ↳ **PASS** | **24** | Verified functional requirements & resolved defects |
| ↳ **FAIL** | **0** | All documented functional defects resolved & verified |
| ↳ **BLOCKED** | **8** | AI generation blocked by upstream Groq 401 invalid key |
| **Not Executed** | **16** | Lower priority edge-case workflows reserved for future cycles |
| **Automated Test Suites** | **5** | Vitest test files in `frontend/src/test/` |
| **Automated Tests Executed** | **34** | 100% passing across mathematical, parser, vision, and UI tests |

---

## 3. Automated Testing Architecture

### 3.1 Framework Selection
* **Runner:** [Vitest v2.1.9](https://vitest.dev/) — Chosen for native integration with Vite 5, ES modules, fast execution, and zero-config TypeScript compatibility.
* **Component Testing:** [React Testing Library v16](https://testing-library.com/) — Simulates actual user interactions and DOM accessibility without implementation coupling.
* **DOM Environment:** [jsdom](https://github.com/jsdom/jsdom) with `@testing-library/jest-dom` custom matchers.

### 3.2 Automated Test Coverage Breakdown
1. **`src/test/calculators.test.ts` (8 tests):**
   * Body Mass Index (BMI) calculation formula (`weight / height^2`).
   * World Health Organization (WHO) BMI classifications: Underweight (< 18.5), Normal (18.5–24.9), Overweight (25–29.9), Obese (>= 30).
   * Harris-Benedict Basal Metabolic Rate (BMR) for males and females.
   * Total Daily Energy Expenditure (TDEE) activity multipliers and deficit/surplus caloric targets.
   * Macro distribution formula (30% Protein @ 4 kcal/g, 40% Carbs @ 4 kcal/g, 30% Fat @ 9 kcal/g).
2. **`src/test/aiText.test.ts` (5 tests):**
   * Stripping bold and italic markdown delimiters (`**`, `*`).
   * Removing code block syntax and inline backticks.
   * Removing markdown headers (`###`).
   * Stripping list bullet characters (`-`, `*`, `1.`).
   * Whitespace and double-space normalization.
3. **`src/test/dietPlanParser.test.ts` (5 tests):**
   * Fallback object generation on empty or malformed input.
   * 7-day multi-meal parsing into Breakfast, Lunch, Dinner, Snack objects.
   * Asset image association based on meal keywords.
   * Regression tests for label-first macro formatting (`Protein: 25g`).
   * Bidirectional parsing for value-first, unitless, and space-separated formats.
4. **`src/test/components.test.tsx` (11 tests):**
   * `BMICalculator`: Initial calculation rendering and dynamic recalculation on height/weight input changes.
   * `WaterTracker`: +250ml single-click increments, storage syncing, and full reset behavior.
   * `FoodAnalyzer`: Initial disabled button state, preview container, and clear/reset interaction.
   * `SavedPlans`: Empty list rendering and form validation alert on empty plan name.
   * `DietPlannerPage`: Out-of-bounds boundary validation (Age 999 disabled, height/weight boundaries, valid state enable).
5. **`src/test/groqService.test.ts` (5 tests):**
   * `generateDietPlan` envelope structure, HTTP POST method, and metadata validation.
   * `askNutritionCoach` query dispatch and response extraction.
   * `analyzeFoodImage` payload structure and multimodal image packaging.
   * Graceful handling of network exceptions without unhandled promises.
   * Proper propagation and formatting of HTTP error status codes.

---

## 4. How to Run the Tests

### 4.1 Prerequisites
* Node.js >= 18 (Tested on Node v22.23.1)
* Dependencies installed in `frontend` and `backend`:
  ```bash
  cd frontend && npm install --legacy-peer-deps
  cd ../backend && npm install
  ```

### 4.2 Run Frontend Automated Tests
From the `frontend/` directory:
```bash
# Run all tests once
npm test

# Run tests in interactive watch mode
npm run test:watch
```

### 4.3 Run Static Analysis & Build Verification
```bash
# TypeScript compilation check (0 errors)
npx tsc --noEmit

# Frontend production bundle build (0 errors)
npm run build

# ESLint code quality check (0 errors, 0 warnings)
npm run lint
```

### 4.4 Run Backend Checks & API Verification
```bash
cd backend

# Validate syntax
node --check server.js
node --check routes/chat.js

# Start backend server
node server.js
```
In another terminal, test backend endpoints:
```bash
# Health check (Expected: 200 OK "Backend Running 🚀")
curl http://localhost:5000/

# Configuration check (Expected: 200 OK with envLoaded: true)
curl http://localhost:5000/api/debug

# Empty payload validation (Expected: 400 Bad Request with error: "Message is required")
curl -X POST http://localhost:5000/api/chat -H "Content-Type: application/json" -d "{\"message\":\"\"}"
```

---

## 5. Known Limitations & Edge Cases

1. **Upstream AI Dependency (Groq API Key):** Live AI calls depend on a valid, unexpired `GROQ_API_KEY`. When the key is unconfigured or invalid in local development, Groq returns HTTP 401. The frontend displays graceful error fallbacks.
2. **Food Analyzer Vision Pipeline:** The backend is configured to route food analysis requests to `qwen/qwen3.8-27b` with multimodal image payloads. Successful inference requires an active Groq API key with vision model permissions.
3. **Client-Side Persistence:** Application state is stored in browser `localStorage`. Private browsing or cache clearing removes saved diet plans, weight logs, and water intake history.
4. **CORS Development Support:** Backend CORS dynamically supports local Vite ports (`5173`, `4173`, `3000`) and loopback addresses, alongside the production Vercel deployment.

---

## 6. Future QA & Testing Improvements

1. **End-to-End Testing:** Implement Playwright smoke tests for cross-browser visual validation and mobile viewport navigation.
2. **Backend API Automation:** Introduce Supertest integration test suite for backend route validation within a GitHub Actions CI pipeline.
3. **Mock Service Worker (MSW):** Integrate MSW to intercept network requests at the browser layer for reliable offline manual QA testing.
4. **CI/CD Integration:** Set up automated test execution on Pull Requests to enforce 0 TypeScript errors and 100% test pass rate.
