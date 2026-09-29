import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BMICalculator, WaterTracker, SavedPlans } from '../components/Pages';
import FoodAnalyzer from '../components/FoodAnalyzer';

describe('Frontend React Components', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('BMICalculator Component', () => {
    it('renders initial inputs and calculated BMI value', () => {
      render(<BMICalculator />);
      expect(screen.getByText('BMI Calculator')).toBeInTheDocument();
      // Default height: 170, weight: 70 -> 24.2
      expect(screen.getByText('24.2')).toBeInTheDocument();
      expect(screen.getByText('Normal weight')).toBeInTheDocument();
    });

    it('dynamically recalculates BMI and category on input change', () => {
      render(<BMICalculator />);
      const numberInputs = screen.getAllByRole('spinbutton');
      const heightInput = numberInputs[0]; // Height (cm)
      const weightInput = numberInputs[1]; // Weight (kg)

      // Change to Height: 180, Weight: 100 -> 100 / 1.8^2 = 30.86 -> 30.9 (Obese)
      fireEvent.change(heightInput, { target: { value: '180' } });
      fireEvent.change(weightInput, { target: { value: '100' } });

      expect(screen.getByText('30.9')).toBeInTheDocument();
      expect(screen.getByText('Obese')).toBeInTheDocument();
    });
  });

  describe('WaterTracker Component', () => {
    it('increments water intake by 250ml per button click and syncs state', () => {
      render(<WaterTracker />);
      expect(screen.getByText('Water Intake Tracker')).toBeInTheDocument();
      expect(screen.getByText('0 ml consumed so far. Keep it steady to maintain focus and recovery.')).toBeInTheDocument();

      const addBtn = screen.getByText('Add 250ml');
      fireEvent.click(addBtn);

      expect(screen.getByText('250 ml consumed so far. Keep it steady to maintain focus and recovery.')).toBeInTheDocument();
      expect(localStorage.getItem('nv_water_consumed')).toBe('250');
    });

    it('resets water intake to 0 on clicking Reset', () => {
      render(<WaterTracker />);
      const addBtn = screen.getByText('Add 250ml');
      const resetBtn = screen.getByText('Reset');

      fireEvent.click(addBtn);
      fireEvent.click(addBtn);
      expect(screen.getByText('500 ml consumed so far. Keep it steady to maintain focus and recovery.')).toBeInTheDocument();

      fireEvent.click(resetBtn);
      expect(screen.getByText('0 ml consumed so far. Keep it steady to maintain focus and recovery.')).toBeInTheDocument();
      expect(localStorage.getItem('nv_water_consumed')).toBe('0');
    });
  });

  describe('FoodAnalyzer Component', () => {
    it('renders image upload card and disabled Analyze button initially', () => {
      render(<FoodAnalyzer />);
      expect(screen.getByText('Food Analyzer')).toBeInTheDocument();
      expect(screen.getByText('No image uploaded')).toBeInTheDocument();

      const analyzeBtn = screen.getByRole('button', { name: /Analyze Image/i });
      expect(analyzeBtn).toBeDisabled();
    });

    it('resets file selection and preview upon clicking Clear', () => {
      render(<FoodAnalyzer />);
      const clearBtn = screen.getByRole('button', { name: /Clear/i });
      fireEvent.click(clearBtn);

      expect(screen.getByText('No image uploaded')).toBeInTheDocument();
      expect(screen.getByText('No analysis yet.')).toBeInTheDocument();
    });
  });

  describe('SavedPlans Component', () => {
    it('renders empty state when no plans exist', () => {
      render(<SavedPlans />);
      expect(screen.getByText('Saved Diet Plans')).toBeInTheDocument();
      expect(screen.getByText('No diet plans created yet.')).toBeInTheDocument();
    });

    it('validates plan name and alerts when saving an empty plan name', () => {
      const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
      render(<SavedPlans />);

      // Click "Create First Plan"
      fireEvent.click(screen.getByText('Create First Plan'));

      // In modal, clear name and click Save Plan
      const nameInput = screen.getByPlaceholderText(/e\.g\., High Protein Bulking/i);
      fireEvent.change(nameInput, { target: { value: '' } });

      const saveBtn = screen.getByRole('button', { name: /Save Plan/i });
      fireEvent.click(saveBtn);

      expect(alertMock).toHaveBeenCalledWith('Plan name is required');
    });
  });
});
