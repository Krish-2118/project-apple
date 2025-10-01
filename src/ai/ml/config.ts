/**
 * @fileOverview Configuration for Random Forest ML model - Apple Project
 */

export const ML_CONFIG = {
  // Random Forest Parameters
  model: {
    numTrees: 15,
    maxDepth: 12,
    minSamples: 5,
    featureSubset: 'sqrt',
  },

  // Training Data Configuration
  training: {
    samplesPerCrop: 50,
    trainTestSplit: 0.8,
    randomSeed: 42,
  },

  // Feature Ranges for Indian Agriculture
  featureRanges: {
    soilPH: { min: 4.5, max: 8.5, ideal: 6.5 },
    nitrogen: { min: 20, max: 140, unit: 'kg/ha' },
    phosphorus: { min: 5, max: 145, unit: 'kg/ha' },
    potassium: { min: 5, max: 205, unit: 'kg/ha' },
    temperature: { min: 15, max: 40, unit: '°C' },
    humidity: { min: 30, max: 95, unit: '%' },
    rainfall: { min: 40, max: 250, unit: 'cm' },
  },

  // Soil Types
  soilTypes: [
    'Sandy',
    'Loamy',
    'Clay',
    'Red',
    'Black',
    'Alluvial',
  ] as const,

  // Crop Characteristics
  cropProfiles: {
    rice: {
      label: 'Rice (Paddy)',
      optimalConditions: {
        soilPH: { min: 5.5, max: 7.5, optimal: 6.5 },
        nitrogen: { min: 60, max: 100, optimal: 80 },
        phosphorus: { min: 30, max: 50, optimal: 40 },
        potassium: { min: 30, max: 50, optimal: 40 },
        temperature: { min: 20, max: 35, optimal: 25 },
        humidity: { min: 70, max: 90, optimal: 80 },
        rainfall: { min: 100, max: 200, optimal: 150 },
        preferredSoils: ['Loamy', 'Clay', 'Alluvial'],
      },
      season: ['Kharif', 'Rabi'],
      duration: '120-150 days',
    },
    wheat: {
      label: 'Wheat',
      optimalConditions: {
        soilPH: { min: 6.0, max: 7.5, optimal: 6.8 },
        nitrogen: { min: 80, max: 120, optimal: 100 },
        phosphorus: { min: 40, max: 60, optimal: 50 },
        potassium: { min: 20, max: 40, optimal: 30 },
        temperature: { min: 10, max: 25, optimal: 22 },
        humidity: { min: 50, max: 70, optimal: 60 },
        rainfall: { min: 50, max: 100, optimal: 80 },
        preferredSoils: ['Loamy', 'Black', 'Alluvial'],
      },
      season: ['Rabi'],
      duration: '110-130 days',
    },
    maize: {
      label: 'Maize (Corn)',
      optimalConditions: {
        soilPH: { min: 5.5, max: 7.5, optimal: 6.5 },
        nitrogen: { min: 70, max: 110, optimal: 90 },
        phosphorus: { min: 35, max: 55, optimal: 45 },
        potassium: { min: 35, max: 55, optimal: 45 },
        temperature: { min: 18, max: 32, optimal: 26 },
        humidity: { min: 60, max: 80, optimal: 70 },
        rainfall: { min: 65, max: 115, optimal: 90 },
        preferredSoils: ['Loamy', 'Sandy', 'Black'],
      },
      season: ['Kharif', 'Rabi'],
      duration: '80-110 days',
    },
    cotton: {
      label: 'Cotton',
      optimalConditions: {
        soilPH: { min: 6.0, max: 7.5, optimal: 6.5 },
        nitrogen: { min: 100, max: 140, optimal: 120 },
        phosphorus: { min: 50, max: 70, optimal: 60 },
        potassium: { min: 40, max: 60, optimal: 50 },
        temperature: { min: 21, max: 35, optimal: 28 },
        humidity: { min: 50, max: 80, optimal: 65 },
        rainfall: { min: 75, max: 125, optimal: 100 },
        preferredSoils: ['Black', 'Red', 'Alluvial'],
      },
      season: ['Kharif'],
      duration: '180-210 days',
    },
    sugarcane: {
      label: 'Sugarcane',
      optimalConditions: {
        soilPH: { min: 6.0, max: 7.5, optimal: 6.5 },
        nitrogen: { min: 90, max: 130, optimal: 110 },
        phosphorus: { min: 45, max: 65, optimal: 55 },
        potassium: { min: 50, max: 70, optimal: 60 },
        temperature: { min: 20, max: 40, optimal: 30 },
        humidity: { min: 65, max: 85, optimal: 75 },
        rainfall: { min: 100, max: 180, optimal: 140 },
        preferredSoils: ['Loamy', 'Black', 'Alluvial'],
      },
      season: ['Year-round'],
      duration: '300-365 days',
    },
    pulses: {
      label: 'Pulses (Lentils, Gram)',
      optimalConditions: {
        soilPH: { min: 6.0, max: 8.0, optimal: 7.0 },
        nitrogen: { min: 20, max: 60, optimal: 40 },
        phosphorus: { min: 40, max: 60, optimal: 50 },
        potassium: { min: 30, max: 50, optimal: 40 },
        temperature: { min: 15, max: 30, optimal: 24 },
        humidity: { min: 50, max: 75, optimal: 65 },
        rainfall: { min: 50, max: 90, optimal: 70 },
        preferredSoils: ['Red', 'Black', 'Loamy'],
      },
      season: ['Rabi', 'Kharif'],
      duration: '90-120 days',
    },
    vegetables: {
      label: 'Vegetables',
      optimalConditions: {
        soilPH: { min: 6.0, max: 7.5, optimal: 6.5 },
        nitrogen: { min: 80, max: 120, optimal: 100 },
        phosphorus: { min: 60, max: 80, optimal: 70 },
        potassium: { min: 70, max: 90, optimal: 80 },
        temperature: { min: 15, max: 35, optimal: 25 },
        humidity: { min: 60, max: 85, optimal: 75 },
        rainfall: { min: 80, max: 140, optimal: 110 },
        preferredSoils: ['Loamy', 'Sandy', 'Alluvial'],
      },
      season: ['Year-round'],
      duration: '60-120 days',
    },
    oilseeds: {
      label: 'Oilseeds (Groundnut, Mustard)',
      optimalConditions: {
        soilPH: { min: 6.0, max: 7.5, optimal: 6.8 },
        nitrogen: { min: 50, max: 90, optimal: 70 },
        phosphorus: { min: 50, max: 70, optimal: 60 },
        potassium: { min: 40, max: 60, optimal: 50 },
        temperature: { min: 20, max: 35, optimal: 27 },
        humidity: { min: 50, max: 70, optimal: 60 },
        rainfall: { min: 60, max: 110, optimal: 85 },
        preferredSoils: ['Sandy', 'Red', 'Loamy'],
      },
      season: ['Kharif', 'Rabi'],
      duration: '100-140 days',
    },
  },

  // Prediction Thresholds
  prediction: {
    minConfidenceForML: 0.3,
    topNPredictions: 3,
    diversityThreshold: 0.15,
  },

  // Logging Configuration
  logging: {
    enableTrainingLogs: true,
    enablePredictionLogs: true,
    logLevel: 'info' as 'debug' | 'info' | 'warn' | 'error',
  },
};

// Type exports
export type MLConfig = typeof ML_CONFIG;
export type CropKey = keyof typeof ML_CONFIG.cropProfiles;
export type SoilType = typeof ML_CONFIG.soilTypes[number];

// Validation function
export function validateConfig(): boolean {
  try {
    if (ML_CONFIG.model.numTrees < 1) {
      throw new Error('numTrees must be at least 1');
    }
    if (ML_CONFIG.model.maxDepth < 1) {
      throw new Error('maxDepth must be at least 1');
    }
    if (ML_CONFIG.training.trainTestSplit <= 0 || ML_CONFIG.training.trainTestSplit >= 1) {
      throw new Error('trainTestSplit must be between 0 and 1');
    }

    console.log('✅ ML Configuration validated successfully');
    return true;
  } catch (error) {
    console.error('❌ Configuration validation failed:', error);
    return false;
  }
}

// Export helper to get crop profile
export function getCropProfile(cropKey: string) {
  return ML_CONFIG.cropProfiles[cropKey as CropKey];
}
