import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DietPlannerPage } from '../components/Pages';
import * as groq from '../services/groq';

vi.mock('../services/groq', () => ({
  generateDietPlan: vi.fn(),
  askNutritionCoach: vi.fn(),
  analyzeBMI: vi.fn(),
  predictWeightTimeline: vi.fn(),
  calorieRecommendations: vi.fn(),
  hydrationRecommendation: vi.fn(),
  explainMacros: vi.fn(),
  progressSummary: vi.fn(),
  healthScore: vi.fn(),
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <DietPlannerPage />
    </MemoryRouter>
  );
}

function fillValidForm() {
  fireEvent.change(screen.getByLabelText(/Age/i), { target: { value: '30' } });
  fireEvent.change(screen.getByLabelText(/Height \(cm\)/i), { target: { value: '175' } });
  fireEvent.change(screen.getByLabelText(/Weight \(kg\)/i), { target: { value: '70' } });
}

describe('Diet Generator — Functional, Accessibility, and Dashboard Integration Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetAllMocks();
  });

  describe('1. Fresh User State', () => {
    it('shows no fake diet plan when no nv_diet_plan exists in localStorage', () => {
      renderPage();
      // Should show the empty state, not a generated plan
      expect(screen.getByText(/No diet plan yet/i)).toBeInTheDocument();
    });

    it('shows empty numeric fields by default (no hardcoded fake defaults)', () => {
      renderPage();
      const ageInput = screen.getByLabelText(/Age/i) as HTMLInputElement;
      const heightInput = screen.getByLabelText(/Height \(cm\)/i) as HTMLInputElement;
      const weightInput = screen.getByLabelText(/Weight \(kg\)/i) as HTMLInputElement;
      // All should be empty for a fresh user
      expect(ageInput.value).toBe('');
      expect(heightInput.value).toBe('');
      expect(weightInput.value).toBe('');
    });

    it('Generate button is disabled for a fresh user with no inputs', () => {
      renderPage();
      const submitBtn = screen.getByRole('button', { name: /Generate AI Diet Plan/i });
      expect(submitBtn).toBeDisabled();
    });

    it('shows guidance text in empty state', () => {
      renderPage();
      expect(screen.getByText(/Generate AI Diet Plan/i, { selector: 'span' })).toBeInTheDocument();
    });
  });

  describe('2. Profile Auto-fill', () => {
    it('auto-fills age, height, and weight from saved nv_user_profile', () => {
      localStorage.setItem('nv_user_profile', JSON.stringify({
        age: '28',
        gender: 'female',
        height: '165',
        weight: '58',
      }));
      renderPage();
      const ageInput = screen.getByLabelText(/Age/i) as HTMLInputElement;
      const heightInput = screen.getByLabelText(/Height \(cm\)/i) as HTMLInputElement;
      const weightInput = screen.getByLabelText(/Weight \(kg\)/i) as HTMLInputElement;
      expect(ageInput.value).toBe('28');
      expect(heightInput.value).toBe('165');
      expect(weightInput.value).toBe('58');
    });

    it('prefers nv_diet_* over profile auto-fill when both exist', () => {
      localStorage.setItem('nv_user_profile', JSON.stringify({ age: '28' }));
      localStorage.setItem('nv_diet_age', '35');
      renderPage();
      const ageInput = screen.getByLabelText(/Age/i) as HTMLInputElement;
      expect(ageInput.value).toBe('35');
    });
  });

  describe('3. Form Validation', () => {
    it('shows age out-of-range error for age > 120', () => {
      renderPage();
      fireEvent.change(screen.getByLabelText(/Age/i), { target: { value: '150' } });
      expect(screen.getByText(/Please enter an age between 13 and 120/i)).toBeInTheDocument();
    });

    it('shows height out-of-range error for height < 140', () => {
      renderPage();
      fireEvent.change(screen.getByLabelText(/Height \(cm\)/i), { target: { value: '100' } });
      expect(screen.getByText(/Height should be between 140 and 220 cm/i)).toBeInTheDocument();
    });

    it('shows weight out-of-range error for weight > 150', () => {
      renderPage();
      fireEvent.change(screen.getByLabelText(/Weight \(kg\)/i), { target: { value: '200' } });
      expect(screen.getByText(/Weight should be between 40 and 150 kg/i)).toBeInTheDocument();
    });

    it('enables button only when all inputs are within valid ranges', () => {
      renderPage();
      const submitBtn = screen.getByRole('button', { name: /Generate AI Diet Plan/i });
      fillValidForm();
      expect(submitBtn).toBeEnabled();
    });

    it('validation error messages have role="alert" for accessibility', () => {
      renderPage();
      fireEvent.change(screen.getByLabelText(/Age/i), { target: { value: '200' } });
      const alerts = screen.getAllByRole('alert');
      expect(alerts.length).toBeGreaterThan(0);
    });
  });

  describe('4. AI Request and Response', () => {
    it('calls generateDietPlan with form data when submitted', async () => {
      const mockGenerate = vi.mocked(groq.generateDietPlan);
      mockGenerate.mockResolvedValueOnce('Day 1\nBreakfast: Oatmeal');
      renderPage();
      fillValidForm();

      fireEvent.click(screen.getByRole('button', { name: /Generate AI Diet Plan/i }));
      await waitFor(() => expect(mockGenerate).toHaveBeenCalledTimes(1));
      const args = mockGenerate.mock.calls[0][0];
      expect(args).toMatchObject({ age: 30, height: 175, weight: 70 });
    });

    it('shows loading state while generating', async () => {
      const mockGenerate = vi.mocked(groq.generateDietPlan);
      let resolvePromise: (value: string) => void;
      mockGenerate.mockImplementationOnce(() => new Promise((resolve) => { resolvePromise = resolve; }));
      renderPage();
      fillValidForm();

      fireEvent.click(screen.getByRole('button', { name: /Generate AI Diet Plan/i }));
      expect(screen.getByText(/Generating/i)).toBeInTheDocument();
      resolvePromise!('Day 1\nBreakfast: Eggs');
    });

    it('shows an error when AI returns an Error: prefixed response', async () => {
      const mockGenerate = vi.mocked(groq.generateDietPlan);
      mockGenerate.mockResolvedValueOnce('Error: Rate limit exceeded');
      renderPage();
      fillValidForm();

      fireEvent.click(screen.getByRole('button', { name: /Generate AI Diet Plan/i }));
      await waitFor(() => expect(screen.getByText(/AI service unavailable/i)).toBeInTheDocument());
    });

    it('shows an error when generateDietPlan throws', async () => {
      const mockGenerate = vi.mocked(groq.generateDietPlan);
      mockGenerate.mockRejectedValueOnce(new Error('Network error'));
      renderPage();
      fillValidForm();

      fireEvent.click(screen.getByRole('button', { name: /Generate AI Diet Plan/i }));
      await waitFor(() => expect(screen.getByText(/Failed to generate diet plan/i)).toBeInTheDocument());
    });
  });

  describe('5. Diet Plan Storage (Dashboard Integration)', () => {
    it('does NOT falsely activate nv_diet_plan for a fresh user', () => {
      renderPage();
      expect(localStorage.getItem('nv_diet_plan')).toBeNull();
    });

    it('stores nv_diet_goal in localStorage when goal is changed', () => {
      renderPage();
      const goalSelect = screen.getByLabelText(/Goal/i);
      fireEvent.change(goalSelect, { target: { value: 'Muscle Gain' } });
      expect(localStorage.getItem('nv_diet_goal')).toBe('Muscle Gain');
    });

    it('removes nv_diet_plan from localStorage when plan is cleared', async () => {
      const mockGenerate = vi.mocked(groq.generateDietPlan);
      mockGenerate.mockResolvedValueOnce('Day 1\nBreakfast: Oats');
      renderPage();
      fillValidForm();
      fireEvent.click(screen.getByRole('button', { name: /Generate AI Diet Plan/i }));
      await waitFor(() => expect(localStorage.getItem('nv_diet_plan')).toBeTruthy());

      // Trigger regeneration that fails — plan should be cleared during generation
      mockGenerate.mockRejectedValueOnce(new Error('fail'));
      fireEvent.click(screen.getByRole('button', { name: /Regenerate AI Diet Plan/i }));
      await waitFor(() => expect(localStorage.getItem('nv_diet_plan')).toBeNull());
    });
  });

  describe('6. Accessibility', () => {
    it('all form inputs have associated labels (htmlFor/id pairing)', () => {
      renderPage();
      expect(screen.getByLabelText(/Age/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Gender/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Height \(cm\)/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Weight \(kg\)/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Goal/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Diet Type/i)).toBeInTheDocument();
    });

    it('error alerts have role="alert" for screen reader announcement', async () => {
      const mockGenerate = vi.mocked(groq.generateDietPlan);
      mockGenerate.mockRejectedValueOnce(new Error('fail'));
      renderPage();
      fillValidForm();
      fireEvent.click(screen.getByRole('button', { name: /Generate AI Diet Plan/i }));
      await waitFor(() => {
        const alerts = screen.getAllByRole('alert');
        expect(alerts.length).toBeGreaterThan(0);
      });
    });
  });

  describe('7. No Fake/Demo Data', () => {
    it('does not show hardcoded meal cards like "Avocado & Egg Power Bowl"', () => {
      renderPage();
      expect(screen.queryByText(/Avocado & Egg Power Bowl/i)).not.toBeInTheDocument();
    });

    it('does not show hardcoded insight text like "18% reduction in resting heart rate"', () => {
      renderPage();
      expect(screen.queryByText(/18% reduction/i)).not.toBeInTheDocument();
    });

    it('does not show hardcoded "94% Goal Alignment" fake metric on diet page', () => {
      renderPage();
      // InsightCard only appears in AINutritionCoach, not DietPlannerPage
      expect(screen.queryByText(/94%/i)).not.toBeInTheDocument();
    });
  });
});
