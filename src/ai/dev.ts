import { config } from 'dotenv';
config();

// Import all flows
import '@/ai/flows/yield-prediction';
import '@/ai/flows/agricultural-alerts';
import '@/ai/flows/crop-recommendation';
import '@/ai/flows/market-analysis';
import '@/ai/flows/yield-enhancement';

// Import ML model initialization
import { initializeModel } from '@/ai/ml/random-forest-model';

// Initialize the Random Forest model on startup
console.log('🚀 Initializing AI services for project-apple...');
initializeModel();
console.log('✅ Random Forest model initialized and ready');

// Optional: Run evaluation on startup (comment out in production)
if (process.env.NODE_ENV === 'development') {
  import('@/ai/ml/utils').then(({ evaluateModel, exportTrainingDataSummary }) => {
    console.log('\n📊 Running model evaluation...');
    evaluateModel();
    exportTrainingDataSummary();
    console.log('\n✅ Evaluation complete\n');
  }).catch(err => {
    console.log('⚠️ ML utils not available:', err.message);
  });
}
