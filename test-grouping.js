// Test script for concept grouping
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

// Create a test function to run our tests
async function runTests() {
  try {
    console.log('Loading test-patient-ui.js module...');
    const module = await import('./js/test-patient-ui.js');
    const testPatientUI = module.default;
    
    // Override the loadModelConfiguration method to use our local config
    testPatientUI.loadModelConfiguration = async function() {
      try {
        console.log('Loading model configuration from config/config.json...');
        const response = await fetch('config/config.json');
        if (!response.ok) {
          throw new Error(`Failed to load model configuration: ${response.status} ${response.statusText}`);
        }
        
        // Load the raw config data
        const configData = await response.json();
        
        // Debug the structure of the config
        console.log('\n===== CONFIG STRUCTURE =====');
        console.log('RCONFIG exists:', !!configData.RCONFIG);
        console.log('TABS exists:', !!configData.RCONFIG?.TABS);
        console.log('TABS is array:', Array.isArray(configData.RCONFIG?.TABS));
        console.log('TABS length:', configData.RCONFIG?.TABS?.length);
        
        // Create a model config structure similar to what the app expects
        this.modelConfig = {
          type: 'object',
          value: configData
        };
        
        console.log('\n===== MODEL CONFIG STRUCTURE =====');
        console.log(inspectStructure(this.modelConfig, 0, 4));
        
        console.log('Model configuration loaded successfully');
        return this.modelConfig;
      } catch (error) {
        console.error('Error loading model configuration:', error);
        throw error;
      }
    };
    
    // Override the extractConceptsFromConfig method to debug its execution
    const originalExtractConceptsFromConfig = testPatientUI.extractConceptsFromConfig;
    testPatientUI.extractConceptsFromConfig = function(config, concepts) {
      console.log('\n===== EXTRACT CONCEPTS FROM CONFIG =====');
      console.log('Config structure:', inspectStructure(config, 0, 3));
      console.log('Config RCONFIG exists:', !!config?.RCONFIG);
      console.log('Config RCONFIG.TABS exists:', !!config?.RCONFIG?.TABS);
      
      if (config?.RCONFIG?.TABS) {
        console.log('TABS is array:', Array.isArray(config.RCONFIG.TABS));
        console.log('TABS length:', config.RCONFIG.TABS.length);
      }
      
      // Call the original method
      const result = originalExtractConceptsFromConfig.call(this, config, concepts);
      
      console.log('Result structure:', inspectStructure(result, 0, 2));
      return result;
    };
    
    console.log('Loading model configuration...');
    await testPatientUI.loadModelConfiguration();
    
    // Create some test concepts
    const testConcepts = {
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
    };
    
    console.log('\n===== TESTING CONCEPT GROUPING =====');
    console.log('Available concepts:', Object.keys(testConcepts).length);
    
    // Test the groupConceptsByModelConfig method
    const groupedConcepts = testPatientUI.groupConceptsByModelConfig(testConcepts);
    
    console.log('\n===== GROUPED CONCEPTS RESULT =====');
    console.log(JSON.stringify(groupedConcepts, null, 2));
    console.log('==================================');
    
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
    
    console.log(`\nTotal unique categorized concepts: ${allCategorizedConcepts.size} out of ${Object.keys(testConcepts).length}`);
    console.log(`Uncategorized concepts: ${Object.keys(testConcepts).filter(c => !allCategorizedConcepts.has(c)).join(', ')}`);
    
  } catch (error) {
    console.error('Error running tests:', error);
  }
}

// Run the tests
runTests(); 