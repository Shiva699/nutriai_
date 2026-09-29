# NutriAI — AI-Powered Nutrition & Wellness Platform

NutriAI is a modern nutrition planning and wellness tracking application. It features a React 18 single-page application built with TypeScript, Tailwind CSS, and Vite, paired with a Node.js Express backend integrating with Groq Cloud LLMs.

---

## Features
* **AI Diet Planner:** Generates personalized 7-day meal plans with macro breakdowns and PDF export.
* **AI Nutrition Coach:** Conversational assistant for nutrition and meal guidance.
* **Health Calculators:** Precise calculations for BMI, Harris-Benedict BMR, TDEE, and daily macro targets.
* **Interactive Trackers:** Daily water intake logger (+250ml quick-add) and weight tracking with trend visualizations.
* **Saved Plans:** Client-side management (create, view, edit, delete) of custom meal plans.
* **Profile & Customization:** User demographic settings and instant Dark/Light mode theme toggle.

---

## Technology Stack
* **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Recharts, jsPDF
* **Backend:** Node.js, Express 5, CORS, Dotenv
* **AI Service:** Groq Cloud SDK (`llama-3.1-8b-instant` for text generation, `llama-3.2-11b-vision-preview` for food analysis)
* **Persistence:** Browser `localStorage`

---

## Getting Started

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env   # Configure PORT and GROQ_API_KEY
node server.js         # Starts server on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd frontend
npm install --legacy-peer-deps
npm run dev            # Starts Vite development server
```

---

## Testing & QA

This repository contains a software testing and QA framework designed to validate application logic, UI behavior, security configurations, and API interactions.

### Testing Overview
* **Manual Testing:** 32 prioritized test scenarios executed across navigation, form validation, theme switching, calculation accuracy, and file downloads.
* **Automated Testing:** 29 automated unit and component tests built with **Vitest**, **React Testing Library**, and **jsdom** in `frontend/src/test/`.
* **API Testing:** Health checks, payload schema validation, CORS preflight policies, and HTTP error code handling.
* **AI Testing:** Request payload structure verification, prompt templates, loading states, output sanitization, and fallback parsing.
* **Bug Reporting:** 7 reproducible defects logged in detail with steps to reproduce and root-cause analysis.

### QA Documentation Links
* [**Test Plan (`TEST_PLAN.md`)**](./TEST_PLAN.md): Scope, methodology, test levels, and risk analysis.
* [**Test Cases Matrix (`TEST_CASES.md`)**](./TEST_CASES.md): 48 test cases with execution status (PASS/FAIL/BLOCKED).
* [**Bug Report (`BUG_REPORT.md`)**](./BUG_REPORT.md): 7 real defects identified from code analysis and runtime testing.
* [**Testing Guide (`TESTING.md`)**](./TESTING.md): Detailed QA metrics, suite breakdown, and test commands.

### Test Commands
```bash
# Run all automated tests (Vitest)
cd frontend
npm test

# Run tests in watch mode
npm run test:watch

# Run TypeScript compilation check
npx tsc --noEmit

# Run production build validation
npm run build
```
