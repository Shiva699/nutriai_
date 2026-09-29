import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { WaterTracker, DashboardOverview, getTodayDateString } from '../components/Pages';

describe('WaterTracker Functional, Accessibility, and Dashboard Integration Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('1. Fresh User State', () => {
    it('renders clean empty state with 0 consumed and empty history', () => {
      render(
        <BrowserRouter>
          <WaterTracker />
        </BrowserRouter>
      );

      expect(screen.getByText('Water Intake Tracker')).toBeInTheDocument();
      expect(screen.getByText('0 ml consumed so far. Keep it steady to maintain focus and recovery.')).toBeInTheDocument();
      expect(screen.getAllByText('0%').length).toBeGreaterThan(0);
      expect(screen.getByText('No water logged today')).toBeInTheDocument();
    });
  });

  describe('2. Water Intake Logging & Validation', () => {
    it('logs 250ml and 500ml quick add and persists to storage', () => {
      render(
        <BrowserRouter>
          <WaterTracker />
        </BrowserRouter>
      );

      const add250Btn = screen.getByText('Add 250ml');
      fireEvent.click(add250Btn);

      expect(screen.getByText('250 ml consumed so far. Keep it steady to maintain focus and recovery.')).toBeInTheDocument();
      expect(localStorage.getItem('nv_water_consumed')).toBe('250');
      expect(localStorage.getItem('nv_water_date')).toBe(getTodayDateString());
      expect(localStorage.getItem('nv_water_goal')).toBe('2000');

      const add500Btn = screen.getByText('+500ml');
      fireEvent.click(add500Btn);

      expect(screen.getByText('750 ml consumed so far. Keep it steady to maintain focus and recovery.')).toBeInTheDocument();
      expect(localStorage.getItem('nv_water_consumed')).toBe('750');
    });

    it('logs custom intake and rejects invalid/zero/negative values', () => {
      render(
        <BrowserRouter>
          <WaterTracker />
        </BrowserRouter>
      );

      const customInput = screen.getByLabelText(/log custom amount \(ml\)/i);
      const logBtn = screen.getByRole('button', { name: /log intake/i });

      // Reject empty
      fireEvent.click(logBtn);
      expect(screen.getByRole('alert')).toHaveTextContent(/Please enter a water amount/i);

      // Reject zero
      fireEvent.change(customInput, { target: { value: '0' } });
      fireEvent.click(logBtn);
      expect(screen.getByRole('alert')).toHaveTextContent(/greater than 0/i);

      // Reject negative
      fireEvent.change(customInput, { target: { value: '-200' } });
      fireEvent.click(logBtn);
      expect(screen.getByRole('alert')).toHaveTextContent(/greater than 0/i);

      // Accept valid 400ml
      fireEvent.change(customInput, { target: { value: '400' } });
      fireEvent.click(logBtn);

      expect(screen.getByRole('status')).toHaveTextContent(/Recorded 400 ml of water intake/i);
      expect(localStorage.getItem('nv_water_consumed')).toBe('400');
    });
  });

  describe('3. Daily Date Logic', () => {
    it('ignores stale hydration data from yesterday on mount', () => {
      localStorage.setItem('nv_water_consumed', '1500');
      localStorage.setItem('nv_water_goal', '2000');
      localStorage.setItem('nv_water_date', 'yesterday');

      render(
        <BrowserRouter>
          <WaterTracker />
        </BrowserRouter>
      );

      // Consumed should initialize to 0 for today
      expect(screen.getByText('0 ml consumed so far. Keep it steady to maintain focus and recovery.')).toBeInTheDocument();
      expect(screen.getAllByText('0%').length).toBeGreaterThan(0);
    });
  });

  describe('4. Daily Goal Configuration', () => {
    it('configures custom daily goal and validates range', () => {
      render(
        <BrowserRouter>
          <WaterTracker />
        </BrowserRouter>
      );

      const goalInput = screen.getByLabelText(/configure daily goal \(ml\)/i);
      const setGoalBtn = screen.getByRole('button', { name: /set goal/i });

      // Too low (< 500)
      fireEvent.change(goalInput, { target: { value: '300' } });
      fireEvent.click(setGoalBtn);
      expect(screen.getByRole('alert')).toHaveTextContent(/between 500 ml and 10,000 ml/i);

      // Valid 2500 ml
      fireEvent.change(goalInput, { target: { value: '2500' } });
      fireEvent.click(setGoalBtn);

      expect(screen.getByRole('status')).toHaveTextContent(/Daily goal updated to 2500 ml/i);
      expect(localStorage.getItem('nv_water_goal')).toBe('2500');
      expect(screen.getByText('2500 ml')).toBeInTheDocument();
    });
  });

  describe('5. Overflow Handling (> 100%)', () => {
    it('handles intake exceeding goal without capping or breaking progress', () => {
      localStorage.setItem('nv_water_consumed', '2000');
      localStorage.setItem('nv_water_goal', '2000');
      localStorage.setItem('nv_water_date', getTodayDateString());

      render(
        <BrowserRouter>
          <WaterTracker />
        </BrowserRouter>
      );

      const add500Btn = screen.getByText('+500ml');
      fireEvent.click(add500Btn);

      // 2500 / 2000 = 125%
      expect(screen.getByText('125%')).toBeInTheDocument();
      expect(localStorage.getItem('nv_water_consumed')).toBe('2500');

      const progressBar = screen.getByRole('progressbar', { name: /daily water intake progress/i });
      expect(progressBar).toHaveAttribute('aria-valuenow', '2500');
      expect(progressBar).toHaveStyle({ width: '100%' });
    });
  });

  describe('6. History Deletion', () => {
    it('deletes individual history entry and adjusts consumed total', () => {
      render(
        <BrowserRouter>
          <WaterTracker />
        </BrowserRouter>
      );

      const add250Btn = screen.getByText('Add 250ml');
      fireEvent.click(add250Btn);
      fireEvent.click(add250Btn);

      expect(screen.getByText('500 ml consumed so far. Keep it steady to maintain focus and recovery.')).toBeInTheDocument();

      const deleteBtns = screen.getAllByRole('button', { name: /delete 250 ml entry/i });
      expect(deleteBtns).toHaveLength(2);

      fireEvent.click(deleteBtns[0]);

      expect(screen.getByRole('status')).toHaveTextContent(/Removed 250 ml entry/i);
      expect(screen.getByText('250 ml consumed so far. Keep it steady to maintain focus and recovery.')).toBeInTheDocument();
      expect(localStorage.getItem('nv_water_consumed')).toBe('250');
    });
  });

  describe('7. Reset Intake', () => {
    it('resets consumed amount and clears history', () => {
      render(
        <BrowserRouter>
          <WaterTracker />
        </BrowserRouter>
      );

      const add250Btn = screen.getByText('Add 250ml');
      fireEvent.click(add250Btn);

      const resetBtn = screen.getByText('Reset');
      fireEvent.click(resetBtn);

      expect(screen.getByText('0 ml consumed so far. Keep it steady to maintain focus and recovery.')).toBeInTheDocument();
      expect(localStorage.getItem('nv_water_consumed')).toBe('0');
      expect(screen.getByText('No water logged today')).toBeInTheDocument();
    });
  });

  describe('8. Malformed Storage Recovery', () => {
    it('recovers cleanly from invalid JSON in history', () => {
      localStorage.setItem('nv_water_history', '{invalid-json');

      render(
        <BrowserRouter>
          <WaterTracker />
        </BrowserRouter>
      );

      expect(screen.getByText('No water logged today')).toBeInTheDocument();
    });
  });

  describe('9. Dashboard Integration', () => {
    it('updates Dashboard hydration status when water is logged in WaterTracker', () => {
      const { unmount } = render(
        <BrowserRouter>
          <WaterTracker />
        </BrowserRouter>
      );

      const add250Btn = screen.getByText('Add 250ml');
      fireEvent.click(add250Btn);

      unmount();

      render(
        <BrowserRouter>
          <DashboardOverview />
        </BrowserRouter>
      );

      // Dashboard reflects 250ml
      expect(screen.getByText('0.3L / 2.0L')).toBeInTheDocument();
      expect(screen.getByText('0.3 L')).toBeInTheDocument();
      expect(screen.getByText('13% of goal')).toBeInTheDocument();
    });
  });
});
