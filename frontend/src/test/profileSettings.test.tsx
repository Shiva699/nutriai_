import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProfileSettings, DashboardOverview } from '../components/Pages';

describe('ProfileSettings Functional, Accessibility, and Dashboard Integration Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('Form Initialization and Prefill', () => {
    it('initializes fresh user with empty fields and does not inject fake/demo values', () => {
      render(
        <MemoryRouter>
          <ProfileSettings theme="dark" setTheme={vi.fn()} />
        </MemoryRouter>
      );

      // Must not contain hardcoded demo persona values
      expect(screen.queryByDisplayValue('Jamie Morgan')).not.toBeInTheDocument();
      expect(screen.queryByDisplayValue('jamie@nutriai.com')).not.toBeInTheDocument();
      expect(screen.queryByDisplayValue('170')).not.toBeInTheDocument();
      expect(screen.queryByDisplayValue('72')).not.toBeInTheDocument();
      expect(screen.queryByDisplayValue('Maintain energy and lean muscle')).not.toBeInTheDocument();

      // Inputs must be empty
      expect(screen.getByLabelText(/Full name/i)).toHaveValue('');
      expect(screen.getByLabelText(/Email address/i)).toHaveValue('');
      expect(screen.getByLabelText(/Age/i)).toHaveValue(null);
      expect(screen.getByLabelText(/Height \(cm\)/i)).toHaveValue(null);
      expect(screen.getByLabelText(/Weight \(kg\)/i)).toHaveValue(null);
      expect(screen.getByLabelText(/Fitness goal/i)).toHaveValue('');
    });

    it('correctly prefills existing genuine profile data from localStorage', () => {
      const stored = {
        fullName: 'Bruce Wayne',
        email: 'bruce@wayne.com',
        age: '35',
        gender: 'Male',
        height: '188',
        weight: '95',
        fitnessGoal: 'Peak athletic conditioning',
      };
      localStorage.setItem('nv_user_profile', JSON.stringify(stored));

      render(
        <MemoryRouter>
          <ProfileSettings theme="dark" setTheme={vi.fn()} />
        </MemoryRouter>
      );

      expect(screen.getByLabelText(/Full name/i)).toHaveValue('Bruce Wayne');
      expect(screen.getByLabelText(/Email address/i)).toHaveValue('bruce@wayne.com');
      expect(screen.getByLabelText(/Age/i)).toHaveValue(35);
      expect(screen.getByLabelText(/Gender/i)).toHaveValue('Male');
      expect(screen.getByLabelText(/Height \(cm\)/i)).toHaveValue(188);
      expect(screen.getByLabelText(/Weight \(kg\)/i)).toHaveValue(95);
      expect(screen.getByLabelText(/Fitness goal/i)).toHaveValue('Peak athletic conditioning');
    });
  });

  describe('Validation and Safe Saving', () => {
    it('rejects invalid age and prevents saving', () => {
      render(
        <MemoryRouter>
          <ProfileSettings theme="dark" setTheme={vi.fn()} />
        </MemoryRouter>
      );

      const ageInput = screen.getByLabelText(/Age/i);
      fireEvent.change(ageInput, { target: { value: '999' } });

      const saveBtn = screen.getByRole('button', { name: /Save changes/i });
      fireEvent.click(saveBtn);

      expect(screen.getByRole('alert')).toHaveTextContent(/valid age between 13 and 120/i);
      expect(localStorage.getItem('nv_user_profile')).toBeNull();
    });

    it('rejects invalid height and prevents saving', () => {
      render(
        <MemoryRouter>
          <ProfileSettings theme="dark" setTheme={vi.fn()} />
        </MemoryRouter>
      );

      const heightInput = screen.getByLabelText(/Height \(cm\)/i);
      fireEvent.change(heightInput, { target: { value: '10' } });

      const saveBtn = screen.getByRole('button', { name: /Save changes/i });
      fireEvent.click(saveBtn);

      expect(screen.getByRole('alert')).toHaveTextContent(/valid height between 50 and 260/i);
      expect(localStorage.getItem('nv_user_profile')).toBeNull();
    });

    it('rejects invalid weight and prevents saving', () => {
      render(
        <MemoryRouter>
          <ProfileSettings theme="dark" setTheme={vi.fn()} />
        </MemoryRouter>
      );

      const weightInput = screen.getByLabelText(/Weight \(kg\)/i);
      fireEvent.change(weightInput, { target: { value: '10' } });

      const saveBtn = screen.getByRole('button', { name: /Save changes/i });
      fireEvent.click(saveBtn);

      expect(screen.getByRole('alert')).toHaveTextContent(/valid weight between 20 and 400/i);
      expect(localStorage.getItem('nv_user_profile')).toBeNull();
    });

    it('rejects invalid email and prevents saving', () => {
      render(
        <MemoryRouter>
          <ProfileSettings theme="dark" setTheme={vi.fn()} />
        </MemoryRouter>
      );

      const emailInput = screen.getByLabelText(/Email address/i);
      fireEvent.change(emailInput, { target: { value: 'not-an-email' } });

      const saveBtn = screen.getByRole('button', { name: /Save changes/i });
      fireEvent.click(saveBtn);

      expect(screen.getByRole('alert')).toHaveTextContent(/valid email address/i);
      expect(localStorage.getItem('nv_user_profile')).toBeNull();
    });

    it('successfully saves valid profile data and updates localStorage keys', async () => {
      render(
        <MemoryRouter>
          <ProfileSettings theme="dark" setTheme={vi.fn()} />
        </MemoryRouter>
      );

      fireEvent.change(screen.getByLabelText(/Full name/i), { target: { value: 'Diana Prince' } });
      fireEvent.change(screen.getByLabelText(/Email address/i), { target: { value: 'diana@example.com' } });
      fireEvent.change(screen.getByLabelText(/Age/i), { target: { value: '28' } });
      fireEvent.change(screen.getByLabelText(/Gender/i), { target: { value: 'Female' } });
      fireEvent.change(screen.getByLabelText(/Height \(cm\)/i), { target: { value: '175' } });
      fireEvent.change(screen.getByLabelText(/Weight \(kg\)/i), { target: { value: '68' } });
      fireEvent.change(screen.getByLabelText(/Fitness goal/i), { target: { value: 'Strength and mobility' } });

      const saveBtn = screen.getByRole('button', { name: /Save changes/i });
      fireEvent.click(saveBtn);

      expect(screen.getByRole('status')).toHaveTextContent(/saved successfully/i);

      // Verify persistent storage
      const savedProfile = JSON.parse(localStorage.getItem('nv_user_profile') || '{}');
      expect(savedProfile.fullName).toBe('Diana Prince');
      expect(savedProfile.height).toBe('175');
      expect(savedProfile.weight).toBe('68');
      expect(savedProfile.fitnessGoal).toBe('Strength and mobility');

      // Verify synchronized lookup keys
      expect(localStorage.getItem('nv_user_name')).toBe('Diana Prince');
      expect(localStorage.getItem('nv_user_height')).toBe('175');
    });
  });

  describe('Preferences Toggles & Theme Controls', () => {
    it('toggles weekly reminder emails and AI coach suggestions', () => {
      render(
        <MemoryRouter>
          <ProfileSettings theme="dark" setTheme={vi.fn()} />
        </MemoryRouter>
      );

      const reminderSwitch = screen.getByRole('switch', { name: /Toggle weekly reminder emails/i });
      const aiCoachSwitch = screen.getByRole('switch', { name: /Toggle AI coach suggestions/i });

      expect(reminderSwitch).toHaveAttribute('aria-checked', 'true');
      expect(aiCoachSwitch).toHaveAttribute('aria-checked', 'true');

      fireEvent.click(reminderSwitch);
      expect(reminderSwitch).toHaveAttribute('aria-checked', 'false');

      fireEvent.click(aiCoachSwitch);
      expect(aiCoachSwitch).toHaveAttribute('aria-checked', 'false');
    });

    it('toggles theme when clicking Switch to Light/Dark', () => {
      const setThemeMock = vi.fn();
      render(
        <MemoryRouter>
          <ProfileSettings theme="dark" setTheme={setThemeMock} />
        </MemoryRouter>
      );

      const themeBtn = screen.getByRole('button', { name: /Switch to Light/i });
      fireEvent.click(themeBtn);
      expect(setThemeMock).toHaveBeenCalledWith('light');
    });
  });

  describe('Safe Handling of Malformed LocalStorage Data', () => {
    it('gracefully handles corrupted JSON in nv_user_profile without crashing', () => {
      localStorage.setItem('nv_user_profile', '{corrupted_json:::');

      expect(() => {
        render(
          <MemoryRouter>
            <ProfileSettings theme="dark" setTheme={vi.fn()} />
          </MemoryRouter>
        );
      }).not.toThrow();

      expect(screen.getByLabelText(/Full name/i)).toHaveValue('');
    });

    it('gracefully handles corrupted JSON in nv_user_preferences without crashing', () => {
      localStorage.setItem('nv_user_preferences', 'null_or_invalid');

      expect(() => {
        render(
          <MemoryRouter>
            <ProfileSettings theme="dark" setTheme={vi.fn()} />
          </MemoryRouter>
        );
      }).not.toThrow();
    });
  });

  describe('Integration with Dashboard Overview', () => {
    it('reflects saved name in Dashboard greeting and genuine metrics without fake goals', () => {
      // 1. Save profile via ProfileSettings
      const { unmount } = render(
        <MemoryRouter>
          <ProfileSettings theme="dark" setTheme={vi.fn()} />
        </MemoryRouter>
      );

      fireEvent.change(screen.getByLabelText(/Full name/i), { target: { value: 'Arthur Curry' } });
      fireEvent.change(screen.getByLabelText(/Age/i), { target: { value: '32' } });
      fireEvent.change(screen.getByLabelText(/Gender/i), { target: { value: 'Male' } });
      fireEvent.change(screen.getByLabelText(/Height \(cm\)/i), { target: { value: '185' } });
      fireEvent.change(screen.getByLabelText(/Weight \(kg\)/i), { target: { value: '85' } });
      // Leave fitness goal empty to verify biometric fields do not activate Goal Completion

      fireEvent.click(screen.getByRole('button', { name: /Save changes/i }));
      unmount();

      // 2. Render DashboardOverview
      render(<DashboardOverview />);

      // Personalized greeting
      expect(screen.getByRole('heading', { name: 'Welcome back, Arthur Curry.' })).toBeInTheDocument();

      // Weight from profile
      expect(screen.getByText('85.0 kg')).toBeInTheDocument();
      expect(screen.getByText('From profile')).toBeInTheDocument();

      // BMI calculated: 85 / (1.85^2) = 24.8
      expect(screen.getByText('24.8')).toBeInTheDocument();
      expect(screen.getByText('Healthy range')).toBeInTheDocument();

      // Goal completion must NOT activate from height and weight alone
      expect(screen.queryByText('100% completed')).not.toBeInTheDocument();
      expect(screen.getByText('Complete your profile to get started.')).toBeInTheDocument();
    });
  });
});
