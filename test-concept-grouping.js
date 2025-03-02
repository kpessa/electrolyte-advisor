// Comprehensive test script for concept grouping
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock browser environment
global.window = {
  currentConfig: null,
  initializeAdvisor: () => console.log('Mock initializeAdvisor called')
};

global.document = {
  getElementById: (id) => ({
    style: {},
    innerHTML: '',
    appendChild: () => {},
    querySelector: () => ({
      textContent: ''
    })
  })
};

// Mock fetch to load files from disk
global.fetch = async (url) => {
  try {
    console.log(`Fetching file: ${url}`);
    
    // Handle different URL formats
    let filePath;
    if (url.startsWith('http')) {
      // Extract the file path from the URL
      filePath = url.replace(/^(https?:\/\/)?[^\/]+\//, '');
    } else {
      filePath = url;
    }
    
    // Resolve the file path relative to the current directory
    const resolvedPath = path.resolve(__dirname, filePath);
    console.log(`Resolved path: ${resolvedPath}`);
    
    const data = await fs.readFile(resolvedPath, 'utf8');
    
    return {
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => {
        try {
          return JSON.parse(data);
        } catch (error) {
          console.error(`Error parsing JSON from ${url}:`, error);
          throw error;
        }
      },
      text: async () => data
    };
  } catch (error) {
    console.error(`Error reading file ${url}:`, error);
    return {
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: async () => { throw new Error(`Failed to load: ${url}`); }
    };
  }
};

// Helper function to inspect object structure
function inspectStructure(obj, depth = 0, maxDepth = 3) {
  if (depth > maxDepth) return '...';
  if (obj === null) return 'null';
  if (obj === undefined) return 'undefined';
  
  const type = typeof obj;
  if (type !== 'object') return type;
  
  if (Array.isArray(obj)) {
    if (obj.length === 0) return 'empty array';
    return `array[${obj.length}]`;
  }
  
  const keys = Object.keys(obj);
  if (keys.length === 0) return 'empty object';
  
  const indent = '  '.repeat(depth);
  const nextIndent = '  '.repeat(depth + 1);
  
  return `{\n${keys.map(key => {
    return `${nextIndent}${key}: ${inspectStructure(obj[key], depth + 1, maxDepth)}`;
  }).join(',\n')}\n${indent}}`;
}

// Test case definitions
const testCases = [
  {
    name: 'Standard Test Case',
    configFile: 'config/config.json',
    concepts: {
      // Magnesium concepts
      'EALABMAGALERT': { value: true },
      'EACRITERIANODIALYSIS': { value: true },
      'EACRITERIAWEIGHT': { value: true },
      'WEIGHTDOSING': { value: 75 },
      'EACRITERIADIGOXINCARDIAC': { value: true },
      'EACRITERIACREATININECLEARANCE': { value: 45 },
      'EACRITERIASERUMCREATININE': { value: 1.2 },
      'EASHOWMAGORDERS': { value: true },
      'EAPROTOCOLMAGIV': { value: false },
      'EACRITERIAVALIDMAGRESULT4H': { value: true },
      'EALABMAGBTW00AND13': { value: true },
      'EAPROTOCOLMAGORAL': { value: true },
      'EACRITERIANOTNPO': { value: true },
      'EALABMAGBTW14AND19': { value: false },
      
      // Potassium concepts
      'EALABPOTALERT': { value: true },
      'EASHOWPOTORDERS': { value: true },
      'EAPROTOCOLPOT': { value: true },
      'EACRITERIAVALIDPOTRESULT4H': { value: true },
      'EALABPOTBTW00AND24': { value: false },
      'EALABPOTBTW25AND29': { value: true },
      'EALABPOTTODO': { value: false },
      'EALABPOTBTW30AND34': { value: false },
      'EALABPOTBTW35AND39': { value: false },
      
      // Phosphate concepts
      'EALABPHOSALERT': { value: true },
      'EASHOWPHOSORDERS': { value: true },
      'EAPROTOCOLPHOSIV': { value: false },
      'EACRITERIAVALIDPHOSRESULT4H': { value: true },
      'EALABPHOSBTW00AND09': { value: true },
      'EAPROTOCOLPHOSORAL': { value: true },
      'ACTIVENPODIETORDER': { value: false },
      'EALABPHOSBTW10AND20': { value: false }
    }
  }
];

// Create a test function to run our tests
async function runTests() {
  try {
    console.log('Loading test-patient-ui.js module...');
    let testPatientUI;
    try {
      // Try to load the fixed version first
      const testPatientUIModule = await import('./js/test-patient-ui-fixed.js');
      testPatientUI = testPatientUIModule.default;
      console.log('Successfully loaded test-patient-ui-fixed.js');
    } catch (error) {
      // Fall back to the original version
      console.log('Failed to load test-patient-ui-fixed.js, falling back to test-patient-ui.js');
      const testPatientUIModule = await import('./js/test-patient-ui.js');
      testPatientUI = testPatientUIModule.default;
    }
    
    // Run each test case
    for (const testCase of testCases) {
      console.log(`\n===== RUNNING TEST CASE: ${testCase.name} =====`);
      
      // Override the loadModelConfiguration method to use our test config
      testPatientUI.loadModelConfiguration = async function() {
        try {
          console.log(`Loading model configuration from ${testCase.configFile}...`);
          const response = await fetch(testCase.configFile);
          if (!response.ok) {
            throw new Error(`Failed to load model configuration: ${response.status} ${response.statusText}`);
          }
          
          // Load the raw config data
          const configData = await response.json();
          
          // Create a model config structure
          this.modelConfig = {
            type: 'object',
            value: configData
          };
          
          console.log('Model configuration loaded successfully');
          return this.modelConfig;
        } catch (error) {
          console.error('Error loading model configuration:', error);
          throw error;
        }
      };
      
      // Load the configuration
      await testPatientUI.loadModelConfiguration();
      
      // Test the groupConceptsByModelConfig method
      console.log('\nTesting concept grouping...');
      console.log('Available concepts:', Object.keys(testCase.concepts).length);
      
      const groupedConcepts = testPatientUI.groupConceptsByModelConfig(testCase.concepts);
      
      // Count concepts in each section
      const allCategorizedConcepts = new Set();
      Object.keys(groupedConcepts).forEach(tabKey => {
        const criteriaCount = Object.keys(groupedConcepts[tabKey]?.criteria || {}).length;
        const orderCount = Object.keys(groupedConcepts[tabKey]?.order || {}).length;
        
        // Add all concepts to the set of categorized concepts
        Object.keys(groupedConcepts[tabKey]?.criteria || {}).forEach(concept => allCategorizedConcepts.add(concept));
        Object.keys(groupedConcepts[tabKey]?.order || {}).forEach(concept => allCategorizedConcepts.add(concept));
        
        console.log(`\nTab: ${tabKey}`);
        console.log(`  Criteria concepts: ${criteriaCount}`);
        console.log(`  Order concepts: ${orderCount}`);
        console.log(`  Total: ${criteriaCount + orderCount}`);
      });
      
      console.log(`\nTotal unique categorized concepts: ${allCategorizedConcepts.size} out of ${Object.keys(testCase.concepts).length}`);
      
      const uncategorizedConcepts = Object.keys(testCase.concepts).filter(c => !allCategorizedConcepts.has(c));
      console.log(`Uncategorized concepts: ${uncategorizedConcepts.join(', ')}`);
      
      // Print a summary of the test results
      console.log('\nTest Results:');
      console.log(`  - Categorized: ${allCategorizedConcepts.size} concepts`);
      console.log(`  - Uncategorized: ${uncategorizedConcepts.length} concepts`);
      console.log(`  - Success Rate: ${Math.round((allCategorizedConcepts.size / Object.keys(testCase.concepts).length) * 100)}%`);
    }
    
  } catch (error) {
    console.error('Error running tests:', error);
  }
}

// Run the tests
runTests(); 