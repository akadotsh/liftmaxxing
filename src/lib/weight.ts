import type { WeightUnit } from '@/lib/storage';

const KG_PER_LB = 0.45359237;

export const displayWeight = (weightKg: number, unit: WeightUnit) =>
  Number((unit === 'lb' ? weightKg / KG_PER_LB : weightKg).toFixed(2));

export const weightInKilograms = (weight: number, unit: WeightUnit) =>
  unit === 'lb' ? weight * KG_PER_LB : weight;
