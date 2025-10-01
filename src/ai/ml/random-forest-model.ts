/**
 * @fileOverview Random Forest model for crop prediction - Apple Project
 */

// Feature interface for the model
export interface CropFeatures {
  soilPH: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  temperature: number;
  humidity: number;
  rainfall: number;
  soilType: 'Sandy' | 'Loamy' | 'Clay' | 'Red' | 'Black' | 'Alluvial';
}

// Training data structure
interface TrainingData {
  features: CropFeatures;
  label: string;
}

// Decision tree node
interface TreeNode {
  feature?: keyof CropFeatures;
  threshold?: number;
  left?: TreeNode;
  right?: TreeNode;
  prediction?: string;
  samples?: number;
}

// Generate training data
export function generateTrainingData(): TrainingData[] {
  const trainingData: TrainingData[] = [];

  const cropCharacteristics: Record<string, Partial<CropFeatures>> = {
    rice: { soilPH: 6.5, nitrogen: 80, phosphorus: 40, potassium: 40, temperature: 25, humidity: 80, rainfall: 150 },
    wheat: { soilPH: 6.8, nitrogen: 100, phosphorus: 50, potassium: 30, temperature: 22, humidity: 60, rainfall: 80 },
    cotton: { soilPH: 6.5, nitrogen: 120, phosphorus: 60, potassium: 50, temperature: 28, humidity: 65, rainfall: 100 },
    sugarcane: { soilPH: 6.5, nitrogen: 110, phosphorus: 55, potassium: 60, temperature: 30, humidity: 75, rainfall: 140 },
    maize: { soilPH: 6.5, nitrogen: 90, phosphorus: 45, potassium: 45, temperature: 26, humidity: 70, rainfall: 90 },
    pulses: { soilPH: 7.0, nitrogen: 40, phosphorus: 50, potassium: 40, temperature: 24, humidity: 65, rainfall: 70 },
    vegetables: { soilPH: 6.5, nitrogen: 100, phosphorus: 70, potassium: 80, temperature: 25, humidity: 75, rainfall: 110 },
    oilseeds: { soilPH: 6.8, nitrogen: 70, phosphorus: 60, potassium: 50, temperature: 27, humidity: 60, rainfall: 85 },
  };

  const soilTypes: CropFeatures['soilType'][] = ['Sandy', 'Loamy', 'Clay', 'Red', 'Black', 'Alluvial'];

  Object.entries(cropCharacteristics).forEach(([crop, baseFeatures]) => {
    for (let i = 0; i < 50; i++) {
      const soilType = soilTypes[Math.floor(Math.random() * soilTypes.length)];
      trainingData.push({
        features: {
          soilPH: baseFeatures.soilPH! + (Math.random() - 0.5) * 1.5,
          nitrogen: baseFeatures.nitrogen! + (Math.random() - 0.5) * 40,
          phosphorus: baseFeatures.phosphorus! + (Math.random() - 0.5) * 30,
          potassium: baseFeatures.potassium! + (Math.random() - 0.5) * 30,
          temperature: baseFeatures.temperature! + (Math.random() - 0.5) * 8,
          humidity: baseFeatures.humidity! + (Math.random() - 0.5) * 25,
          rainfall: baseFeatures.rainfall! + (Math.random() - 0.5) * 60,
          soilType,
        },
        label: crop,
      });
    }
  });

  return trainingData;
}

// Random Forest implementation
export class RandomForestClassifier {
  private trees: TreeNode[] = [];
  private numTrees: number;
  private maxDepth: number;
  private minSamples: number;

  constructor(numTrees = 10, maxDepth = 10, minSamples = 5) {
    this.numTrees = numTrees;
    this.maxDepth = maxDepth;
    this.minSamples = minSamples;
  }

  train(data: TrainingData[]): void {
    console.log(`Training Random Forest with ${this.numTrees} trees...`);
    for (let i = 0; i < this.numTrees; i++) {
      const bootstrapSample = this.bootstrapSample(data);
      const tree = this.buildTree(bootstrapSample, 0);
      this.trees.push(tree);
    }
    console.log('Random Forest training complete!');
  }

  private bootstrapSample(data: TrainingData[]): TrainingData[] {
    const sample: TrainingData[] = [];
    for (let i = 0; i < data.length; i++) {
      const randomIndex = Math.floor(Math.random() * data.length);
      sample.push(data[randomIndex]);
    }
    return sample;
  }

  private buildTree(data: TrainingData[], depth: number): TreeNode {
    if (depth >= this.maxDepth || data.length < this.minSamples) {
      return this.createLeafNode(data);
    }

    const split = this.findBestSplit(data);
    if (!split) return this.createLeafNode(data);

    const leftData = data.filter(d => this.evaluateSplit(d.features, split.feature, split.threshold, true));
    const rightData = data.filter(d => this.evaluateSplit(d.features, split.feature, split.threshold, false));

    if (leftData.length === 0 || rightData.length === 0) {
      return this.createLeafNode(data);
    }

    return {
      feature: split.feature,
      threshold: split.threshold,
      left: this.buildTree(leftData, depth + 1),
      right: this.buildTree(rightData, depth + 1),
      samples: data.length,
    };
  }

  private findBestSplit(data: TrainingData[]): { feature: keyof CropFeatures; threshold: number } | null {
    const numericFeatures: (keyof CropFeatures)[] = ['soilPH', 'nitrogen', 'phosphorus', 'potassium', 'temperature', 'humidity', 'rainfall'];

    const selectedFeatures = numericFeatures.sort(() => Math.random() - 0.5).slice(0, Math.ceil(Math.sqrt(numericFeatures.length)));

    let bestGini = Infinity;
    let bestSplit: { feature: keyof CropFeatures; threshold: number } | null = null;

    for (const feature of selectedFeatures) {
      const values = data.map(d => d.features[feature] as number).sort((a, b) => a - b);
      const uniqueValues = [...new Set(values)];

      for (let i = 0; i < uniqueValues.length - 1; i++) {
        const threshold = (uniqueValues[i] + uniqueValues[i + 1]) / 2;
        const gini = this.calculateGini(data, feature, threshold);

        if (gini < bestGini) {
          bestGini = gini;
          bestSplit = { feature, threshold };
        }
      }
    }

    return bestSplit;
  }

  private calculateGini(data: TrainingData[], feature: keyof CropFeatures, threshold: number): number {
    const left = data.filter(d => this.evaluateSplit(d.features, feature, threshold, true));
    const right = data.filter(d => this.evaluateSplit(d.features, feature, threshold, false));
    const total = data.length;

    const giniLeft = this.giniImpurity(left);
    const giniRight = this.giniImpurity(right);

    return (left.length / total) * giniLeft + (right.length / total) * giniRight;
  }

  private giniImpurity(data: TrainingData[]): number {
    if (data.length === 0) return 0;

    const counts = new Map<string, number>();
    data.forEach(d => counts.set(d.label, (counts.get(d.label) || 0) + 1));

    let impurity = 1;
    counts.forEach(count => {
      const prob = count / data.length;
      impurity -= prob * prob;
    });

    return impurity;
  }

  private evaluateSplit(features: CropFeatures, feature: keyof CropFeatures, threshold: number, isLeft: boolean): boolean {
    const value = features[feature];
    if (typeof value === 'number') {
      return isLeft ? value <= threshold : value > threshold;
    }
    return false;
  }

  private createLeafNode(data: TrainingData[]): TreeNode {
    const counts = new Map<string, number>();
    data.forEach(d => counts.set(d.label, (counts.get(d.label) || 0) + 1));

    let maxCount = 0;
    let prediction = '';
    counts.forEach((count, label) => {
      if (count > maxCount) {
        maxCount = count;
        prediction = label;
      }
    });

    return { prediction, samples: data.length };
  }

  private predictTree(tree: TreeNode, features: CropFeatures): string {
    if (tree.prediction) return tree.prediction;

    const value = features[tree.feature!];
    if (typeof value === 'number' && tree.threshold !== undefined) {
      return value <= tree.threshold
        ? this.predictTree(tree.left!, features)
        : this.predictTree(tree.right!, features);
    }

    return tree.prediction || '';
  }

  predict(features: CropFeatures): { crop: string; confidence: number }[] {
    const predictions = this.trees.map(tree => this.predictTree(tree, features));
    const counts = new Map<string, number>();
    predictions.forEach(pred => counts.set(pred, (counts.get(pred) || 0) + 1));

    return Array.from(counts.entries())
      .map(([crop, count]) => ({ crop, confidence: count / this.trees.length }))
      .sort((a, b) => b.confidence - a.confidence);
  }
}

// Singleton instance
let rfModel: RandomForestClassifier | null = null;

// Initialize and train the model
export function initializeModel(): RandomForestClassifier {
  if (!rfModel) {
    console.log('Initializing Random Forest model...');
    rfModel = new RandomForestClassifier(15, 12, 5);
    const trainingData = generateTrainingData();
    rfModel.train(trainingData);
  }
  return rfModel;
}

// Extract features from land description
export function extractFeaturesFromDescription(landDescription: string, region: string): CropFeatures {
  const desc = landDescription.toLowerCase();

  let soilType: CropFeatures['soilType'] = 'Loamy';
  if (desc.includes('sandy')) soilType = 'Sandy';
  else if (desc.includes('clay')) soilType = 'Clay';
  else if (desc.includes('red')) soilType = 'Red';
  else if (desc.includes('black')) soilType = 'Black';
  else if (desc.includes('alluvial')) soilType = 'Alluvial';

  return {
    soilPH: 6.5 + (Math.random() - 0.5) * 0.5,
    nitrogen: 70 + Math.random() * 30,
    phosphorus: 45 + Math.random() * 20,
    potassium: 40 + Math.random() * 20,
    temperature: 26 + (Math.random() - 0.5) * 4,
    humidity: 70 + (Math.random() - 0.5) * 15,
    rainfall: 120 + (Math.random() - 0.5) * 40,
    soilType,
  };
}

// Get model predictions
export function getMLPredictions(features: CropFeatures): { crop: string; confidence: number }[] {
  const model = initializeModel();
  return model.predict(features);
}
