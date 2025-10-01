'use server';

/**
 * @fileOverview Utilities for testing and evaluating the Random Forest model
 */

import { 
  RandomForestClassifier, 
  generateTrainingData, 
  type CropFeatures 
} from './random-forest-model';

// Evaluate model accuracy using cross-validation
export function evaluateModel(): {
  accuracy: number;
  confusionMatrix: Map<string, Map<string, number>>;
  cropAccuracies: Map<string, number>;
} {
  console.log('🧪 Evaluating Random Forest model...');

  const data = generateTrainingData();
  const trainSize = Math.floor(data.length * 0.8);
  
  const shuffled = data.sort(() => Math.random() - 0.5);
  const trainData = shuffled.slice(0, trainSize);
  const testData = shuffled.slice(trainSize);

  const model = new RandomForestClassifier(15, 12, 5);
  model.train(trainData);

  let correct = 0;
  const confusionMatrix = new Map<string, Map<string, number>>();
  const cropCounts = new Map<string, { correct: number; total: number }>();

  testData.forEach(sample => {
    const predictions = model.predict(sample.features);
    const predicted = predictions[0].crop;
    const actual = sample.label;

    if (!confusionMatrix.has(actual)) {
      confusionMatrix.set(actual, new Map());
    }
    const row = confusionMatrix.get(actual)!;
    row.set(predicted, (row.get(predicted) || 0) + 1);

    if (!cropCounts.has(actual)) {
      cropCounts.set(actual, { correct: 0, total: 0 });
    }
    const cropCount = cropCounts.get(actual)!;
    cropCount.total++;
    
    if (predicted === actual) {
      correct++;
      cropCount.correct++;
    }
  });

  const accuracy = correct / testData.length;
  
  const cropAccuracies = new Map<string, number>();
  cropCounts.forEach((count, crop) => {
    cropAccuracies.set(crop, count.correct / count.total);
  });

  console.log(`✅ Model accuracy: ${(accuracy * 100).toFixed(2)}%`);
  console.log('📊 Crop-specific accuracies:');
  cropAccuracies.forEach((acc, crop) => {
    console.log(`   ${crop}: ${(acc * 100).toFixed(2)}%`);
  });

  return {
    accuracy,
    confusionMatrix,
    cropAccuracies,
  };
}

// Test model with sample inputs
export function testModelPredictions(): void {
  console.log('\n🧪 Testing model with sample land descriptions...\n');

  const testCases: Array<{ description: string; features: CropFeatures }> = [
    {
      description: 'Loamy soil with good water retention, pH 6.5, high rainfall area',
      features: {
        soilPH: 6.5,
        nitrogen: 80,
        phosphorus: 40,
        potassium: 40,
        temperature: 25,
        humidity: 80,
        rainfall: 150,
        soilType: 'Loamy',
      },
    },
    {
      description: 'Sandy soil, low rainfall, hot climate',
      features: {
        soilPH: 7.2,
        nitrogen: 50,
        phosphorus: 30,
        potassium: 35,
        temperature: 32,
        humidity: 50,
        rainfall: 60,
        soilType: 'Sandy',
      },
    },
    {
      description: 'Black cotton soil, moderate rainfall, ideal for commercial crops',
      features: {
        soilPH: 6.8,
        nitrogen: 120,
        phosphorus: 60,
        potassium: 50,
        temperature: 28,
        humidity: 65,
        rainfall: 100,
        soilType: 'Black',
      },
    },
    {
      description: 'Red soil with low nitrogen, needs fertilization',
      features: {
        soilPH: 6.0,
        nitrogen: 40,
        phosphorus: 50,
        potassium: 40,
        temperature: 24,
        humidity: 65,
        rainfall: 70,
        soilType: 'Red',
      },
    },
  ];

  const model = new RandomForestClassifier(15, 12, 5);
  const trainingData = generateTrainingData();
  model.train(trainingData);

  testCases.forEach((testCase, idx) => {
    console.log(`Test Case ${idx + 1}: ${testCase.description}`);
    const predictions = model.predict(testCase.features);
    console.log('Predictions:');
    predictions.slice(0, 3).forEach((pred, i) => {
      console.log(`  ${i + 1}. ${pred.crop} - ${(pred.confidence * 100).toFixed(1)}% confidence`);
    });
    console.log('');
  });
}

// Export data for visualization
export function exportTrainingDataSummary() {
  const data = generateTrainingData();
  const summary = new Map<string, {
    count: number;
    avgFeatures: Partial<CropFeatures>;
  }>();

  data.forEach(sample => {
    if (!summary.has(sample.label)) {
      summary.set(sample.label, {
        count: 0,
        avgFeatures: {},
      });
    }

    const entry = summary.get(sample.label)!;
    entry.count++;

    Object.keys(sample.features).forEach(key => {
      const featureKey = key as keyof CropFeatures;
      const value = sample.features[featureKey];
      if (typeof value === 'number') {
        entry.avgFeatures[featureKey] = 
          ((entry.avgFeatures[featureKey] as number || 0) * (entry.count - 1) + value) / entry.count;
      }
    });
  });

  console.log('\n📈 Training Data Summary:');
  console.log(`Total samples: ${data.length}`);
  console.log('\nCrop distribution and average features:');
  
  summary.forEach((stats, crop) => {
    console.log(`\n${crop.toUpperCase()} (${stats.count} samples):`);
    console.log(`  Avg pH: ${(stats.avgFeatures.soilPH as number)?.toFixed(2)}`);
    console.log(`  Avg N: ${(stats.avgFeatures.nitrogen as number)?.toFixed(1)} kg/ha`);
    console.log(`  Avg P: ${(stats.avgFeatures.phosphorus as number)?.toFixed(1)} kg/ha`);
    console.log(`  Avg K: ${(stats.avgFeatures.potassium as number)?.toFixed(1)} kg/ha`);
    console.log(`  Avg Temp: ${(stats.avgFeatures.temperature as number)?.toFixed(1)}°C`);
    console.log(`  Avg Humidity: ${(stats.avgFeatures.humidity as number)?.toFixed(1)}%`);
    console.log(`  Avg Rainfall: ${(stats.avgFeatures.rainfall as number)?.toFixed(1)} cm`);
  });

  return summary;
}
