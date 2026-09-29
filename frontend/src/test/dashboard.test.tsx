import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DashboardOverview } from '../components/Pages';
import * as groqService from '../services/groq';

describe('DashboardOverview Component - Clean Health Data Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('TEST 1: fresh user with no health data displays clean empty states without fake demo values', () => {
    render(<DashboardOverview />);

    // Must NOT contain fake demo values
    expect(screen.queryByText('1,850 kcal')).not.toBeInTheDocument();
    expect(screen.queryByText('22.8')).not.toBeInTheDocument();
    expect(screen.queryByText('72.4 kg')).not.toBeInTheDocument();
    expect(screen.queryByText('1.9 L')).not.toBeInTheDocument();
    expect(screen.queryByText('84% completed')).not.toBeInTheDocument();
    expect(screen.queryByText('+1.6 kg gain')).not.toBeInTheDocument();
    expect(screen.queryByText('Tomorrow at 7:30 AM')).not.toBeInTheDocument();
    expect(screen.queryByText('1.9L / 2.0L')).not.toBeInTheDocument();

    // Must show clean empty states
    expect(screen.getByText('No scheduled check-in')).toBeInTheDocument();
    expect(screen.getAllByText('--').length).toBeGreaterThanOrEqual(4);
    expect(screen.getAllByText('No data yet').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('Complete your profile to get started.')).toBeInTheDocument();
    expect(screen.getByText('No water intake logged today. Track your water in Water Tracker.')).toBeInTheDocument();
  });

  it('TEST 2: user with actual profile data displays real weight, calculated BMI, and calculated calories', () => {
    const profile = {
      fullName: 'Sarah Connor',
      email: 'sarah@example.com',
      age: '30',
      gender: 'Female',
      height: '165',
      weight: '60',
      fitnessGoal: 'Stay fit',
    };
    localStorage.setItem('nv_user_profile', JSON.stringify(profile));

    render(<DashboardOverview />);

    // Real weight from profile
    expect(screen.getByText('60.0 kg')).toBeInTheDocument();
    expect(screen.getByText('From profile')).toBeInTheDocument();

    // BMI: 60 / (1.65^2) = 22.0
    expect(screen.getByText('22.0')).toBeInTheDocument();
    expect(screen.getByText('Healthy range')).toBeInTheDocument();

    // Calories: BMR = 447.6 + 9.2*60 + 3.1*165 - 4.3*30 = 1382.1 -> maintenance = 1382.1 * 1.55 = 2142 kcal
    expect(screen.getByText('2,142 kcal')).toBeInTheDocument();
    expect(screen.getByText('Daily target (maintenance)')).toBeInTheDocument();
  });

  it('Goal Completion must NOT show 100% completed merely because hydration goal is complete', () => {
    // 100% hydration logged, but NO profile or overall goals exist
    localStorage.setItem('nv_water_consumed', '2000');
    localStorage.setItem('nv_water_goal', '2000');

    render(<DashboardOverview />);

    // Hydration profile card correctly reflects 2.0L / 2.0L and 100% of goal
    expect(screen.getByText('2.0 L')).toBeInTheDocument();
    expect(screen.getByText('100% of goal')).toBeInTheDocument();
    expect(screen.getByText('2.0L / 2.0L')).toBeInTheDocument();
    expect(screen.getByText('Daily hydration goal achieved! Great job staying hydrated.')).toBeInTheDocument();

    // Goal Completion MUST NOT show 100% completed
    expect(screen.queryByText('100% completed')).not.toBeInTheDocument();
    // Must show empty state with "No data yet"
    expect(screen.getAllByText('No data yet').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Complete your profile to get started.')).toBeInTheDocument();
  });

  it('Goal Completion calculates accurately from genuine available goals when profile exists', () => {
    const profile = {
      fullName: 'Sarah Connor',
      email: 'sarah@example.com',
      age: '30',
      gender: 'Female',
      height: '165',
      weight: '60',
      fitnessGoal: 'Stay fit',
    };
    localStorage.setItem('nv_user_profile', JSON.stringify(profile));
    // Hydration complete (100%), but no diet plan yet (0%) -> average is 50%
    localStorage.setItem('nv_water_consumed', '2000');
    localStorage.setItem('nv_water_goal', '2000');

    render(<DashboardOverview />);

    // Overall completion is 50%, NOT 100%
    expect(screen.queryByText('100% completed')).not.toBeInTheDocument();
    expect(screen.getByText('50% completed')).toBeInTheDocument();
    expect(screen.getByText('50% of your active daily targets achieved.')).toBeInTheDocument();
  });

  it('Goal Completion shows 100% when all genuine active goals are completed', () => {
    const profile = {
      fullName: 'Sarah Connor',
      email: 'sarah@example.com',
      age: '30',
      gender: 'Female',
      height: '165',
      weight: '60',
      fitnessGoal: 'Stay fit',
    };
    localStorage.setItem('nv_user_profile', JSON.stringify(profile));
    localStorage.setItem('nv_diet_plan', 'Day 1\nBreakfast: Oats');
    localStorage.setItem('nv_water_consumed', '2000');
    localStorage.setItem('nv_water_goal', '2000');

    render(<DashboardOverview />);

    // Both diet plan (100%) and hydration (100%) are complete
    expect(screen.getByText('100% completed')).toBeInTheDocument();
    expect(screen.getByText('All active health and nutrition targets on track!')).toBeInTheDocument();
  });

  it('TEST 2 (continued): user with actual weight history displays real trend and entries', () => {
    const realHistory = [
      { date: 'Today', weight: 75.5 },
      { date: '5 days ago', weight: 77.0 },
    ];
    localStorage.setItem('nv_weight_history', JSON.stringify(realHistory));

    render(<DashboardOverview />);

    // Latest weight and change (appears in both summary card and weekly progress list)
    expect(screen.getAllByText('75.5 kg').length).toBe(2);
    expect(screen.getByText('-1.5 kg this week')).toBeInTheDocument();

    // Weekly progress header and entries
    expect(screen.getByText('-1.5 kg loss')).toBeInTheDocument();
    expect(screen.getAllByText('Today').length).toBe(2);
    expect(screen.getByText('5 days ago')).toBeInTheDocument();
  });

  it('rejects stale demo fallback strings from localStorage', () => {
    // Stale demo keys from prior versions
    localStorage.setItem('nv_daily_calories', '1,850 kcal');
    localStorage.setItem('nv_daily_calories_detail', '85% of goal');
    localStorage.setItem('nv_next_checkin', 'Tomorrow at 7:30 AM');
    localStorage.setItem('nv_weight_history', JSON.stringify([
      { date: 'Jun 16', weight: 71.8 },
      { date: 'Jun 18', weight: 72.0 },
      { date: 'Jun 20', weight: 72.1 },
      { date: 'Jun 22', weight: 72.4 },
    ]));

    render(<DashboardOverview />);

    expect(screen.queryByText('1,850 kcal')).not.toBeInTheDocument();
    expect(screen.queryByText('Tomorrow at 7:30 AM')).not.toBeInTheDocument();
    expect(screen.queryByText('+1.6 kg gain')).not.toBeInTheDocument();
    expect(screen.queryByText('84% completed')).not.toBeInTheDocument();
  });

  it('TEST 5: rendering Dashboard does NOT pollute localStorage with fake demo values', () => {
    render(<DashboardOverview />);

    expect(localStorage.getItem('nv_daily_calories')).toBeNull();
    expect(localStorage.getItem('nv_current_bmi')).toBeNull();
    expect(localStorage.getItem('nv_current_weight')).toBeNull();
    expect(localStorage.getItem('nv_water_intake')).toBeNull();
  });

  describe('Dashboard AI Health Score - Empty State & Validation', () => {
    it('disables Refresh button and shows empty state message when no profile data exists', () => {
      render(<DashboardOverview />);

      const refreshBtn = screen.getByRole('button', { name: /Refresh/i });
      expect(refreshBtn).toBeDisabled();
      expect(screen.getByText('Complete your profile to generate your AI Health Score.')).toBeInTheDocument();
      expect(screen.getByText('-')).toBeInTheDocument();
    });

    it('does NOT make AI/API request when clicked without profile data', () => {
      const healthScoreSpy = vi.spyOn(groqService, 'healthScore');
      const coachSpy = vi.spyOn(groqService, 'askNutritionCoach');

      render(<DashboardOverview />);

      const refreshBtn = screen.getByRole('button', { name: /Refresh/i });
      fireEvent.click(refreshBtn);

      expect(healthScoreSpy).not.toHaveBeenCalled();
      expect(coachSpy).not.toHaveBeenCalled();
    });

    it('allows generating AI Health Score and calls API with valid profile data', async () => {
      const profile = {
        fullName: 'Sarah Connor',
        email: 'sarah@example.com',
        age: '30',
        gender: 'Female',
        height: '165',
        weight: '60',
        fitnessGoal: 'Stay fit',
      };
      localStorage.setItem('nv_user_profile', JSON.stringify(profile));

      const healthScoreSpy = vi.spyOn(groqService, 'healthScore').mockResolvedValue('88/100 Optimal');
      const coachSpy = vi.spyOn(groqService, 'askNutritionCoach').mockResolvedValue('Excellent recovery metrics today.');

      render(<DashboardOverview />);

      const refreshBtn = screen.getByRole('button', { name: /Refresh/i });
      expect(refreshBtn).toBeEnabled();
      expect(screen.queryByText('Complete your profile to generate your AI Health Score.')).not.toBeInTheDocument();

      fireEvent.click(refreshBtn);

      await waitFor(() => {
        expect(healthScoreSpy).toHaveBeenCalledWith(expect.objectContaining({
          height: 165,
          weight: 60,
          age: '30',
          gender: 'Female',
          fitnessGoal: 'Stay fit',
        }));
        expect(coachSpy).toHaveBeenCalled();
        expect(screen.getByText('88/100 Optimal')).toBeInTheDocument();
        expect(screen.getByText('Excellent recovery metrics today.')).toBeInTheDocument();
      });
    });

    it('handles API failure gracefully without breaking dashboard or exposing raw errors', async () => {
      const profile = {
        fullName: 'Sarah Connor',
        email: 'sarah@example.com',
        age: '30',
        gender: 'Female',
        height: '165',
        weight: '60',
        fitnessGoal: 'Stay fit',
      };
      localStorage.setItem('nv_user_profile', JSON.stringify(profile));

      vi.spyOn(groqService, 'healthScore').mockRejectedValue(new Error('Internal server error 500'));
      vi.spyOn(groqService, 'askNutritionCoach').mockRejectedValue(new Error('API failure'));

      render(<DashboardOverview />);

      const refreshBtn = screen.getByRole('button', { name: /Refresh/i });
      fireEvent.click(refreshBtn);

      await waitFor(() => {
        expect(screen.getByText('Unable to generate AI Health Score. Please try again later.')).toBeInTheDocument();
      });

      // Raw error message is not exposed
      expect(screen.queryByText(/Internal server error 500/i)).not.toBeInTheDocument();
      // Dashboard remains usable with score showing '-'
      expect(screen.getByText('-')).toBeInTheDocument();
    });
  });

  describe('Dashboard Weekly Progress - Genuine Data & Edge Cases Suite', () => {
    it('displays clean no-data state when no weight history exists', () => {
      render(<DashboardOverview />);

      // Value is '--'
      const weeklyProgressHeadings = screen.getAllByRole('heading', { level: 2 });
      const weeklyHeading = weeklyProgressHeadings.find(h => h.textContent === '--');
      expect(weeklyHeading).toBeDefined();

      // Subtitle/status and helpful message
      expect(screen.getByText('Log entries in Weight Tracker to see weekly progress.')).toBeInTheDocument();
      expect(screen.getAllByText('No data yet').length).toBeGreaterThanOrEqual(1);

      // No fake numbers or trend text
      expect(screen.queryByText('+1.6 kg gain')).not.toBeInTheDocument();
      expect(screen.queryByText('Stable progress')).not.toBeInTheDocument();
    });

    it('correctly handles single entry: shows logged weight clearly without asserting misleading weekly delta', () => {
      const singleEntry = [{ date: 'Today', weight: 74.2 }];
      localStorage.setItem('nv_weight_history', JSON.stringify(singleEntry));

      render(<DashboardOverview />);

      // Single weight is shown clearly
      expect(screen.getAllByText('74.2 kg').length).toBeGreaterThanOrEqual(2);
      expect(screen.getByText('Single entry recorded')).toBeInTheDocument();
      expect(screen.getByText('Log another entry this week to calculate progress.')).toBeInTheDocument();

      // Does NOT assert misleading delta/trend
      expect(screen.queryByText('+0.0 kg')).not.toBeInTheDocument();
      expect(screen.queryByText('+0.0 kg gain')).not.toBeInTheDocument();
      expect(screen.queryByText('0.0 kg loss')).not.toBeInTheDocument();
      expect(screen.queryByText('stable progress')).not.toBeInTheDocument();
    });

    it('calculates weekly change accurately for 2+ genuine entries', () => {
      const history = [
        { date: 'Today', weight: 71.0 },
        { date: '3 days ago', weight: 72.0 },
        { date: '7 days ago', weight: 73.5 },
      ];
      localStorage.setItem('nv_weight_history', JSON.stringify(history));

      render(<DashboardOverview />);

      // 71.0 - 73.5 = -2.5 kg loss
      expect(screen.getByText('-2.5 kg loss')).toBeInTheDocument();
      expect(screen.getByText('Weekly change')).toBeInTheDocument();
      expect(screen.getAllByText('Today').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('3 days ago')).toBeInTheDocument();
      expect(screen.getByText('7 days ago')).toBeInTheDocument();
      expect(screen.queryByText('Log another entry this week to calculate progress.')).not.toBeInTheDocument();
    });

    it('handles zero weight change accurately without misleading gain/loss label', () => {
      const history = [
        { date: 'Today', weight: 70.0 },
        { date: '7 days ago', weight: 70.0 },
      ];
      localStorage.setItem('nv_weight_history', JSON.stringify(history));

      render(<DashboardOverview />);

      expect(screen.getByText('0.0 kg change')).toBeInTheDocument();
      expect(screen.getByText('Weekly change')).toBeInTheDocument();
    });

    it('gracefully handles malformed JSON in localStorage without crashing', () => {
      localStorage.setItem('nv_weight_history', '{invalid-json');

      expect(() => render(<DashboardOverview />)).not.toThrow();
      expect(screen.getByText('Log entries in Weight Tracker to see weekly progress.')).toBeInTheDocument();
    });

    it('filters out corrupted elements and retains only genuine entries', () => {
      const corrupted = [
        null,
        { foo: 'bar' },
        { date: 'Today', weight: 'invalid' },
        { date: 'Today', weight: -70 },
        { date: 'Today', weight: 76.5 },
      ];
      localStorage.setItem('nv_weight_history', JSON.stringify(corrupted));

      render(<DashboardOverview />);

      // Only 76.5 kg is valid -> treated as single valid entry
      expect(screen.getAllByText('76.5 kg').length).toBeGreaterThanOrEqual(2);
      expect(screen.getByText('Single entry recorded')).toBeInTheDocument();
      expect(screen.queryByText('invalid')).not.toBeInTheDocument();
    });

    it('rejects demo mock fallback data when mixed with genuine data', () => {
      const withDemo = [
        { date: 'Today', weight: 75.0 },
        { date: 'Jun 16', weight: 71.8 },
        { date: 'Jun 18', weight: 72.0 },
        { date: 'Jun 20', weight: 72.1 },
        { date: 'Jun 22', weight: 72.4 },
      ];
      localStorage.setItem('nv_weight_history', JSON.stringify(withDemo));

      render(<DashboardOverview />);

      // Only the 1 genuine entry should be kept, demo fallback entries filtered out
      expect(screen.getAllByText('75.0 kg').length).toBeGreaterThanOrEqual(2);
      expect(screen.getByText('Single entry recorded')).toBeInTheDocument();
      // Should not calculate delta against Jun 22 (72.4)
      expect(screen.queryByText('+2.6 kg gain')).not.toBeInTheDocument();
      expect(screen.queryByText('Jun 16')).not.toBeInTheDocument();
      expect(screen.queryByText('Jun 22')).not.toBeInTheDocument();
    });
  });
});
