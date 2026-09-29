import { describe, it, expect } from 'vitest';

describe('Health Calculations Business Logic', () => {
  describe('BMI Calculation & WHO Classifications', () => {
    const calculateBMI = (heightCm: number, weightKg: number) => {
      if (!heightCm || !weightKg) return 0;
      return Number((weightKg / ((heightCm / 100) ** 2)).toFixed(1));
    };

    const getBMICategory = (bmi: number) => {
      if (bmi < 18.5) return 'Underweight';
      if (bmi < 25) return 'Normal weight';
      if (bmi < 30) return 'Overweight';
      return 'Obese';
    };

    it('calculates BMI correctly for standard adult (170cm, 70kg)', () => {
      const bmi = calculateBMI(170, 70);
      expect(bmi).toBe(24.2);
      expect(getBMICategory(bmi)).toBe('Normal weight');
    });

    it('classifies Underweight when BMI < 18.5', () => {
      const bmi = calculateBMI(180, 55); // 16.98 -> 17.0
      expect(bmi).toBe(17.0);
      expect(getBMICategory(bmi)).toBe('Underweight');
    });

    it('classifies Overweight when BMI is 25.0 to 29.9', () => {
      const bmi = calculateBMI(175, 85); // 27.755 -> 27.8
      expect(bmi).toBe(27.8);
      expect(getBMICategory(bmi)).toBe('Overweight');
    });

    it('classifies Obese when BMI >= 30.0', () => {
      const bmi = calculateBMI(165, 95); // 34.89 -> 34.9
      expect(bmi).toBe(34.9);
      expect(getBMICategory(bmi)).toBe('Obese');
    });
  });

  describe('Harris-Benedict BMR & Expenditure Calculation', () => {
    const calculateBMR = (gender: 'male' | 'female', weight: number, height: number, age: number) => {
      const base = gender === 'male'
        ? 88.36 + 13.4 * weight + 4.8 * height - 5.7 * age
        : 447.6 + 9.2 * weight + 3.1 * height - 4.3 * age;
      return Math.round(base);
    };

    it('calculates accurate BMR for males (Age 30, H 175, W 72)', () => {
      // 88.36 + (13.4 * 72 = 964.8) + (4.8 * 175 = 840) - (5.7 * 30 = 171) = 1722.16 -> 1722
      const bmr = calculateBMR('male', 72, 175, 30);
      expect(bmr).toBe(1722);
    });

    it('calculates accurate BMR for females (Age 30, H 175, W 72)', () => {
      // 447.6 + (9.2 * 72 = 662.4) + (3.1 * 175 = 542.5) - (4.3 * 30 = 129) = 1523.5 -> 1524
      const bmr = calculateBMR('female', 72, 175, 30);
      expect(bmr).toBe(1524);
    });

    it('applies activity multipliers and caloric adjustments accurately', () => {
      const bmr = 1722;
      const activityMultiplier = 1.55; // Moderate active
      const maintenance = Math.round(bmr * activityMultiplier); // 2669.1 -> 2669
      const loss = maintenance - 450; // 2219
      const gain = maintenance + 350; // 3019

      expect(maintenance).toBe(2669);
      expect(loss).toBe(2219);
      expect(gain).toBe(3019);
    });
  });

  describe('Macro Distribution Calculation (30/40/30 split)', () => {
    it('accurately divides calories into grams for Protein (4 kcal/g), Carbs (4 kcal/g), and Fat (9 kcal/g)', () => {
      const calories = 2000;
      const proteinGrams = Math.round((calories * 0.3) / 4); // 600 / 4 = 150
      const carbsGrams = Math.round((calories * 0.4) / 4);   // 800 / 4 = 200
      const fatGrams = Math.round((calories * 0.3) / 9);     // 600 / 9 = 66.66 -> 67

      expect(proteinGrams).toBe(150);
      expect(carbsGrams).toBe(200);
      expect(fatGrams).toBe(67);
    });
  });
});
