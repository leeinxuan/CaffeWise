import { CaffeineLog } from "../types";

// Formula: C(t) = C0 * (0.5)^(elapsed_hours / half_life)
export const calculateCurrentLevel = (logs: CaffeineLog[], halfLifeHours: number): number => {
  const now = Date.now();
  let totalCurrentMg = 0;

  logs.forEach(log => {
    const elapsedHours = (now - log.timestamp) / (1000 * 60 * 60);
    if (elapsedHours >= 0) { // Only count past drinks
      const remaining = log.amountMg * Math.pow(0.5, elapsedHours / halfLifeHours);
      totalCurrentMg += remaining;
    }
  });

  return Math.max(0, totalCurrentMg);
};

// Predict when level will drop below threshold
// Threshold = Current * (0.5)^(t / HL)
// log(Threshold/Current) = (t/HL) * log(0.5)
// t = HL * log(Threshold/Current) / log(0.5)
export const predictClearanceTime = (currentLevel: number, threshold: number, halfLifeHours: number): Date | null => {
  if (currentLevel <= threshold) return new Date(); // Already clear
  
  const hoursRemaining = halfLifeHours * (Math.log(threshold / currentLevel) / Math.log(0.5));
  const clearTime = new Date(Date.now() + hoursRemaining * 60 * 60 * 1000);
  return clearTime;
};

// Helper to format time
export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
