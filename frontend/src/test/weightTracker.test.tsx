import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { WeightTracker, DashboardOverview } from '../components/Pages';

describe('WeightTracker Functional, Accessibility, and Dashboard Integration Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('1. Fresh User Empty State', () => {
    it('renders clean empty state with no fake data when storage is empty', () => {
      render(
        <BrowserRouter>
          <WeightTracker />
        </BrowserRouter>
      );

      // Verify no fake weights or dates exist
      expect(screen.queryByText('72.4 kg')).not.toBeInTheDocument();
      expect(screen.queryByText('Jun 16')).not.toBeInTheDocument();
      expect(screen.queryByText('Jun 18')).not.toBeInTheDocument();
      expect(screen.queryByText('Jun 20')).not.toBeInTheDocument();
      expect(screen.queryByText('Jun 22')).not.toBeInTheDocument();

      // Weekly progress empty state
      expect(screen.getByText('--')).toBeInTheDocument();
      expect(screen.getByText('No entries logged yet')).toBeInTheDocument();
      expect(screen.getByText(/Current BMI: --/)).toBeInTheDocument();

      // Logged entries empty state
      expect(screen.getByText('Logged entries (0)')).toBeInTheDocument();
      expect(screen.getByText('No weight history yet')).toBeInTheDocument();

      // Trend charts empty state
      expect(screen.getByText('No trend data available')).toBeInTheDocument();
      expect(screen.getByText('No recent logs')).toBeInTheDocument();

      // No fake goal weight prefilled in storage
      expect(localStorage.getItem('nv_goal_weight')).toBeNull();
      expect(localStorage.getItem('nv_current_weight')).toBeNull();
    });
  });

  describe('2. Weight Entry Bounds & Validation', () => {
    it('rejects empty input with clear alert', () => {
      render(
        <BrowserRouter>
          <WeightTracker />
        </BrowserRouter>
      );

      const saveBtn = screen.getByRole('button', { name: /save weight/i });
      fireEvent.click(saveBtn);

      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent(/Please enter a weight value/i);
    });

    it('rejects zero, negative, and impossible weights', () => {
      render(
        <BrowserRouter>
          <WeightTracker />
        </BrowserRouter>
      );

      const weightInput = screen.getByLabelText(/current weight \(kg\)/i);
      const saveBtn = screen.getByRole('button', { name: /save weight/i });

      // Zero
      fireEvent.change(weightInput, { target: { value: '0' } });
      fireEvent.click(saveBtn);
      expect(screen.getByRole('alert')).toHaveTextContent(/greater than 0 kg/i);

      // Negative
      fireEvent.change(weightInput, { target: { value: '-15' } });
      fireEvent.click(saveBtn);
      expect(screen.getByRole('alert')).toHaveTextContent(/greater than 0 kg/i);

      // Under 20 kg
      fireEvent.change(weightInput, { target: { value: '18' } });
      fireEvent.click(saveBtn);
      expect(screen.getByRole('alert')).toHaveTextContent(/between 20 kg and 400 kg/i);

      // Over 400 kg
      fireEvent.change(weightInput, { target: { value: '550' } });
      fireEvent.click(saveBtn);
      expect(screen.getByRole('alert')).toHaveTextContent(/between 20 kg and 400 kg/i);
    });
  });

  describe('3. Valid Weight Logging & Storage Persistence', () => {
    it('accepts valid decimal weight and persists genuine values', async () => {
      render(
        <BrowserRouter>
          <WeightTracker />
        </BrowserRouter>
      );

      const weightInput = screen.getByLabelText(/current weight \(kg\)/i);
      const saveBtn = screen.getByRole('button', { name: /save weight/i });

      fireEvent.change(weightInput, { target: { value: '74.5' } });
      fireEvent.click(saveBtn);

      // Status message confirmation
      expect(screen.getByRole('status')).toHaveTextContent(/Recorded 74.5 kg for Today/i);

      // Verify localStorage was updated
      const rawHistory = localStorage.getItem('nv_weight_history');
      expect(rawHistory).not.toBeNull();
      const parsed = JSON.parse(rawHistory!);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].weight).toBe(74.5);
      expect(parsed[0].date).toBe('Today');

      expect(localStorage.getItem('nv_current_weight')).toBe('74.5 kg');

      // Weekly progress updates to single entry status
      expect(screen.getAllByText('74.5 kg').length).toBeGreaterThan(0);
      expect(screen.getByText('Single entry recorded (log 2+ to see trend)')).toBeInTheDocument();
      expect(screen.getAllByText('Latest').length).toBeGreaterThan(0);
    });

    it('updates existing entry when duplicate date is logged', () => {
      render(
        <BrowserRouter>
          <WeightTracker />
        </BrowserRouter>
      );

      const weightInput = screen.getByLabelText(/current weight \(kg\)/i);
      const saveBtn = screen.getByRole('button', { name: /save weight/i });

      // First entry today
      fireEvent.change(weightInput, { target: { value: '75.0' } });
      fireEvent.click(saveBtn);
      expect(screen.getByRole('status')).toHaveTextContent(/Recorded 75 kg for Today/i);

      // Update entry today
      fireEvent.change(weightInput, { target: { value: '74.2' } });
      fireEvent.click(saveBtn);
      expect(screen.getByRole('status')).toHaveTextContent(/Updated weight for Today to 74.2 kg/i);

      const parsed = JSON.parse(localStorage.getItem('nv_weight_history')!);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].weight).toBe(74.2);
    });
  });

  describe('4. Weekly Progress and Multiple Entries', () => {
    it('calculates weekly progress correctly when 2+ entries exist', () => {
      const existingHistory = [
        { date: 'Today', weight: 70.0 },
        { date: 'Sep 23', weight: 71.5 },
      ];
      localStorage.setItem('nv_weight_history', JSON.stringify(existingHistory));

      render(
        <BrowserRouter>
          <WeightTracker />
        </BrowserRouter>
      );

      // 70.0 - 71.5 = -1.5 kg (loss)
      expect(screen.getAllByText('-1.5 kg').length).toBeGreaterThan(0);
      expect(screen.getByText('Weekly loss')).toBeInTheDocument();
    });

    it('calculates weekly gain correctly', () => {
      const existingHistory = [
        { date: 'Today', weight: 72.8 },
        { date: 'Sep 23', weight: 71.0 },
      ];
      localStorage.setItem('nv_weight_history', JSON.stringify(existingHistory));

      render(
        <BrowserRouter>
          <WeightTracker />
        </BrowserRouter>
      );

      // 72.8 - 71.0 = +1.8 kg (gain)
      expect(screen.getAllByText('+1.8 kg').length).toBeGreaterThan(0);
      expect(screen.getByText('Weekly gain')).toBeInTheDocument();
    });
  });

  describe('5. BMI Calculation Integration', () => {
    it('computes BMI when height is available from localStorage or profile', () => {
      localStorage.setItem('nv_user_height', '180');
      const existingHistory = [{ date: 'Today', weight: 72.9 }];
      localStorage.setItem('nv_weight_history', JSON.stringify(existingHistory));

      render(
        <BrowserRouter>
          <WeightTracker />
        </BrowserRouter>
      );

      // 72.9 / (1.8 ^ 2) = 22.5
      expect(screen.getByText(/Current BMI: 22.5/i)).toBeInTheDocument();
    });
  });

  describe('6. Delete Entry Behavior', () => {
    it('removes only the selected entry and clears storage if last item removed', () => {
      const existingHistory = [
        { date: 'Today', weight: 72.0 },
        { date: 'Sep 20', weight: 73.0 },
      ];
      localStorage.setItem('nv_weight_history', JSON.stringify(existingHistory));
      localStorage.setItem('nv_current_weight', '72.0 kg');

      render(
        <BrowserRouter>
          <WeightTracker />
        </BrowserRouter>
      );

      const deleteButtons = screen.getAllByRole('button', { name: /delete entry for/i });
      expect(deleteButtons).toHaveLength(2);

      // Delete the first entry
      fireEvent.click(deleteButtons[0]);

      expect(screen.getByRole('status')).toHaveTextContent(/Deleted entry for Today/i);

      const updatedHistory = JSON.parse(localStorage.getItem('nv_weight_history')!);
      expect(updatedHistory).toHaveLength(1);
      expect(updatedHistory[0].date).toBe('Sep 20');
      expect(localStorage.getItem('nv_current_weight')).toBe('73.0 kg');

      // Now delete the remaining entry
      const lastDeleteBtn = screen.getByRole('button', { name: /delete entry for Sep 20/i });
      fireEvent.click(lastDeleteBtn);

      expect(localStorage.getItem('nv_current_weight')).toBeNull();
      expect(screen.getByText('No weight history yet')).toBeInTheDocument();
    });
  });

  describe('7. Target / Goal Weight Handling', () => {
    it('does not pre-populate a fake goal weight', () => {
      render(
        <BrowserRouter>
          <WeightTracker />
        </BrowserRouter>
      );

      const goalInput = screen.getByLabelText(/target weight \(kg\)/i) as HTMLInputElement;
      expect(goalInput.value).toBe('');
      expect(localStorage.getItem('nv_goal_weight')).toBeNull();
    });

    it('validates and saves genuine target weight', () => {
      render(
        <BrowserRouter>
          <WeightTracker />
        </BrowserRouter>
      );

      const goalInput = screen.getByLabelText(/target weight \(kg\)/i);
      const setTargetBtn = screen.getByRole('button', { name: /set target/i });

      // Invalid: under 20
      fireEvent.change(goalInput, { target: { value: '10' } });
      fireEvent.click(setTargetBtn);
      expect(screen.getByRole('alert')).toHaveTextContent(/between 20 kg and 400 kg/i);

      // Valid: 68.5 kg
      fireEvent.change(goalInput, { target: { value: '68.5' } });
      fireEvent.click(setTargetBtn);

      expect(screen.getByRole('status')).toHaveTextContent(/Target weight set to 68.5 kg/i);
      expect(localStorage.getItem('nv_goal_weight')).toBe('68.5');

      // Clear target
      const clearBtn = screen.getByRole('button', { name: /clear target weight/i });
      fireEvent.click(clearBtn);

      expect(screen.getByRole('status')).toHaveTextContent(/Target weight cleared/i);
      expect(localStorage.getItem('nv_goal_weight')).toBeNull();
    });

    it('requires both current weight and target weight for AI prediction', async () => {
      render(
        <BrowserRouter>
          <WeightTracker />
        </BrowserRouter>
      );

      const predictBtn = screen.getByRole('button', { name: /ai prediction/i });
      fireEvent.click(predictBtn);

      expect(screen.getByRole('alert')).toHaveTextContent(/Log or enter a valid current weight/i);
    });
  });

  describe('8. Malformed Storage Recovery', () => {
    it('safely recovers from invalid JSON in nv_weight_history without crashing', () => {
      localStorage.setItem('nv_weight_history', '{invalid-json');

      render(
        <BrowserRouter>
          <WeightTracker />
        </BrowserRouter>
      );

      expect(screen.getByText('No weight history yet')).toBeInTheDocument();
      expect(screen.getByText('Logged entries (0)')).toBeInTheDocument();
    });

    it('filters out corrupt objects and non-numeric weights', () => {
      const corruptData = [
        null,
        'not-an-object',
        { date: 'Today', weight: 'invalid' },
        { date: 'Today', weight: -50 },
        { date: 'Valid Date', weight: 65.5 },
      ];
      localStorage.setItem('nv_weight_history', JSON.stringify(corruptData));

      render(
        <BrowserRouter>
          <WeightTracker />
        </BrowserRouter>
      );

      expect(screen.getByText('Logged entries (1)')).toBeInTheDocument();
      expect(screen.getAllByText('65.5 kg').length).toBeGreaterThan(0);
    });
  });

  describe('9. Dashboard Integration', () => {
    it('reflects new WeightTracker entry immediately in Dashboard Overview', async () => {
      const { unmount } = render(
        <BrowserRouter>
          <WeightTracker />
        </BrowserRouter>
      );

      // Log a weight entry in WeightTracker
      const weightInput = screen.getByLabelText(/current weight \(kg\)/i);
      const saveBtn = screen.getByRole('button', { name: /save weight/i });

      fireEvent.change(weightInput, { target: { value: '73.2' } });
      fireEvent.click(saveBtn);

      unmount();

      // Mount DashboardOverview and verify it picks up the genuine entry
      render(
        <BrowserRouter>
          <DashboardOverview />
        </BrowserRouter>
      );

      // Dashboard latest weight should show 73.2 kg
      expect(screen.getAllByText('73.2 kg').length).toBeGreaterThan(0);
      expect(screen.getByText('Latest entry')).toBeInTheDocument();
    });
  });
});
