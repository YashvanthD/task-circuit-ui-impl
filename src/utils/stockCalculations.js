/**
 * Stock Calculations Utility
 * Helper functions for stock and growth calculations
 *
 * @module utils/stockCalculations
 */

/**
 * Calculate growth rate in grams per day
 * @param {number} currentWeight - Current average weight in grams
 * @param {number} previousWeight - Previous average weight in grams
 * @param {number} daysBetween - Number of days between measurements
 * @returns {number} Growth rate in g/day
 */
export function calculateGrowthRate(currentWeight, previousWeight, daysBetween) {
  if (!daysBetween || daysBetween === 0) return 0;
  return (currentWeight - previousWeight) / daysBetween;
}

/**
 * Calculate total biomass in kilograms
 * @param {number} count - Number of fish
 * @param {number} avgWeightGrams - Average weight per fish in grams
 * @returns {number} Total biomass in kg
 */
export function calculateBiomass(count, avgWeightGrams) {
  if (!count || !avgWeightGrams) return 0;
  return (count * avgWeightGrams) / 1000;
}

/**
 * Calculate days since a given date
 * @param {string|Date} date - Starting date
 * @returns {number} Number of days
 */
export function getDaysSince(date) {
  if (!date) return 0;
  const startDate = new Date(date);
  const today = new Date();
  const diffTime = Math.abs(today - startDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Calculate average growth rate from sampling history
 * @param {Array} samplings - Array of sampling records (sorted by date)
 * @returns {number} Average growth rate in g/day
 */
export function calculateAverageGrowthRate(samplings) {
  if (!samplings || samplings.length < 2) return 0;

  let totalGrowthRate = 0;
  let count = 0;

  for (let i = 1; i < samplings.length; i++) {
    const current = samplings[i];
    const previous = samplings[i - 1];

    const currentWeight = current.avg_weight || current.averageWeight || 0;
    const previousWeight = previous.avg_weight || previous.averageWeight || 0;

    const currentDate = new Date(current.sampling_date || current.samplingDate || current.date);
    const previousDate = new Date(previous.sampling_date || previous.samplingDate || previous.date);

    const daysBetween = Math.abs((currentDate - previousDate) / (1000 * 60 * 60 * 24));

    if (daysBetween > 0) {
      const growthRate = calculateGrowthRate(currentWeight, previousWeight, daysBetween);
      totalGrowthRate += growthRate;
      count++;
    }
  }

  return count > 0 ? totalGrowthRate / count : 0;
}

/**
 * Get growth status indicator
 * @param {number} growthRate - Growth rate in g/day
 * @returns {Object} Status with color and label
 */
export function getGrowthStatus(growthRate) {
  if (growthRate >= 5) {
    return { color: 'success', label: 'Excellent', icon: '🟢' };
  } else if (growthRate >= 2) {
    return { color: 'warning', label: 'Moderate', icon: '🟡' };
  } else if (growthRate >= 0) {
    return { color: 'info', label: 'Slow', icon: '🔵' };
  } else {
    return { color: 'error', label: 'Declining', icon: '🔴' };
  }
}

/**
 * Calculate projected harvest date based on target weight
 * @param {number} currentWeight - Current average weight in grams
 * @param {number} targetWeight - Target harvest weight in grams
 * @param {number} growthRate - Growth rate in g/day
 * @returns {Date|null} Projected harvest date
 */
export function calculateProjectedHarvestDate(currentWeight, targetWeight, growthRate) {
  if (!growthRate || growthRate <= 0) return null;

  const weightToGain = targetWeight - currentWeight;
  if (weightToGain <= 0) return new Date(); // Already at target

  const daysNeeded = Math.ceil(weightToGain / growthRate);
  const harvestDate = new Date();
  harvestDate.setDate(harvestDate.getDate() + daysNeeded);

  return harvestDate;
}

/**
 * Calculate feed conversion ratio (FCR)
 * @param {number} totalFeedKg - Total feed given in kg
 * @param {number} biomassGainKg - Biomass gain in kg
 * @returns {number} FCR value
 */
export function calculateFCR(totalFeedKg, biomassGainKg) {
  if (!biomassGainKg || biomassGainKg === 0) return 0;
  return totalFeedKg / biomassGainKg;
}

/**
 * Calculate survival rate
 * @param {number} currentCount - Current fish count
 * @param {number} initialCount - Initial fish count
 * @returns {number} Survival rate as percentage (0-100)
 */
export function calculateSurvivalRate(currentCount, initialCount) {
  if (!initialCount || initialCount === 0) return 0;
  return (currentCount / initialCount) * 100;
}

export default {
  calculateGrowthRate,
  calculateBiomass,
  getDaysSince,
  calculateAverageGrowthRate,
  getGrowthStatus,
  calculateProjectedHarvestDate,
  calculateFCR,
  calculateSurvivalRate,
};
