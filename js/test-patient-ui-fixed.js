/**
 * Test Patient UI
 * 
 * This file handles the UI for the test patient manager, including the modal dialog
 * and interactions with the test patient manager.
 */

import TestPatientManager from './test-patient-manager.js';

class TestPatientUI {
    constructor() {
        this.testPatientManager = new TestPatientManager();
        this.conceptManager = null;
        this.initialized = false;
        this.selectedPatientId = null;
        this.selectedCaseId = null;
        this.modelConfig = null;
    }

    /**
     * Initialize the test patient UI
     * @param {Object} conceptManager - The concept manager instance
     * @returns {Promise} - Promise that resolves when initialization is complete
     */
    async initialize(conceptManager) {
        if (this.initialized) {
            console.log('TestPatientUI already initialized');
            return;
        }
        
        console.log('Initializing TestPatientUI...');
        this.conceptManager = conceptManager;
        
        try {
            // Load the model configuration
            await this.loadModelConfiguration();
            
            // Initialize the test patient manager
            await this.testPatientManager.initialize();
            
            this.initialized = true;
            console.log('TestPatientUI initialized successfully');
        } catch (error) {
            console.error('Error initializing TestPatientUI:', error);
            throw error;
        }
    }

    /**
     * Creates the test patient icon in the UI
     * @param {HTMLElement|string} container - The container element or selector to append the icon to
     * @returns {HTMLElement} - The created icon element
     */
    createTestPatientIcon(container) {
        console.log('Creating test patient icon...');
        
        // Get the container element
        const containerElement = typeof container === 'string' 
            ? document.getElementById(container) 
            : container;
            
        if (!containerElement) {
            console.error(`Container element not found: ${container}`);
            return null;
        }
        
        // Create the icon container
        const iconContainer = document.createElement('div');
        iconContainer.className = 'test-patient-icon-container';
        
        // Create the icon element
        const iconElement = document.createElement('button');
        iconElement.className = 'test-patient-icon';
        iconElement.innerHTML = '👤';
        iconElement.title = 'Test Patient Manager';
        
        // Add click event listener to show the test patient manager
        iconElement.addEventListener('click', () => {
            this.showTestPatientManager();
        });
        
        // Add the icon to the container
        iconContainer.appendChild(iconElement);
        
        // Append the container to the specified container element
        containerElement.appendChild(iconContainer);
        
        console.log('Test patient icon created and added to the container');
        
        return iconElement;
    }

    /**
     * Shows the test patient manager UI
     */
    showTestPatientManager() {
        console.log('Showing test patient manager...');
        
        // Create modal container if it doesn't exist
        let modalContainer = document.getElementById('test-patient-modal');
        if (!modalContainer) {
            modalContainer = document.createElement('div');
            modalContainer.id = 'test-patient-modal';
            modalContainer.className = 'test-patient-modal';
            document.body.appendChild(modalContainer);
            
            // Create modal content
            const modalContent = document.createElement('div');
            modalContent.className = 'test-patient-modal-content';
            modalContainer.appendChild(modalContent);
            
            // Create header
            const header = document.createElement('div');
            header.className = 'test-patient-modal-header';
            modalContent.appendChild(header);
            
            // Create title
            const title = document.createElement('h2');
            title.className = 'test-patient-modal-title';
            title.textContent = 'Test Patient Manager';
            header.appendChild(title);
            
            // Create close button
            const closeButton = document.createElement('button');
            closeButton.className = 'test-patient-modal-close';
            closeButton.innerHTML = '&times;';
            closeButton.addEventListener('click', () => {
                modalContainer.style.display = 'none';
            });
            header.appendChild(closeButton);
            
            // Create body
            const body = document.createElement('div');
            body.className = 'test-patient-modal-body';
            modalContent.appendChild(body);
            
            // Create patient list
            this.createPatientList(body);
        }
        
        // Show the modal
        modalContainer.style.display = 'block';
        
        console.log('Test patient manager shown');
    }

    /**
     * Creates the patient list in the test patient manager UI
     * @param {HTMLElement} container - The container element to append the list to
     */
    createPatientList(container) {
        console.log('Creating patient list...');
        
        // Clear the container
        container.innerHTML = '';
        
        // Get all patients
        const patients = this.testPatientManager.getTestPatients();
        
        // Create patient list
        const patientList = document.createElement('div');
        patientList.className = 'patient-list';
        container.appendChild(patientList);
        
        // Add patients to the list
        patients.forEach(patient => {
            const patientItem = document.createElement('div');
            patientItem.className = 'patient-item';
            patientItem.innerHTML = `<h3>${patient.name}</h3>`;
            patientItem.addEventListener('click', () => {
                this.selectPatient(patient.id);
            });
            patientList.appendChild(patientItem);
        });
        
        console.log('Patient list created with', patients.length, 'patients');
    }

    /**
     * Selects a patient and shows their test cases
     * @param {string} patientId - The ID of the patient to select
     */
    selectPatient(patientId) {
        console.log(`Selecting patient with ID: ${patientId}`);
        
        // Store the selected patient ID
        this.selectedPatientId = patientId;
        
        // Get the patient
        const patient = this.testPatientManager.getTestPatient(patientId);
        if (!patient) {
            console.error(`Patient with ID ${patientId} not found`);
            return;
        }
        
        // Get the modal container
        const modalContainer = document.getElementById('test-patient-modal');
        if (!modalContainer) {
            console.error('Test patient modal container not found');
            return;
        }
        
        // Get the modal body
        const modalBody = modalContainer.querySelector('.test-patient-modal-body');
        if (!modalBody) {
            console.error('Modal body not found');
            return;
        }
        
        // Clear the modal body
        modalBody.innerHTML = '';
        
        // Create a back button
        const backButton = document.createElement('button');
        backButton.className = 'back-button';
        backButton.textContent = '← Back to Patients';
        backButton.addEventListener('click', () => {
            this.createPatientList(modalBody);
        });
        modalBody.appendChild(backButton);
        
        // Create a patient header
        const patientHeader = document.createElement('div');
        patientHeader.className = 'patient-header';
        patientHeader.innerHTML = `<h2>${patient.name}</h2>`;
        modalBody.appendChild(patientHeader);
        
        // Create a test cases container
        const testCasesContainer = document.createElement('div');
        testCasesContainer.className = 'test-cases-container';
        modalBody.appendChild(testCasesContainer);
        
        // Get the test cases
        const testCases = this.testPatientManager.getTestCases(patientId);
        
        // Add test cases to the container
        if (testCases.length > 0) {
            testCases.forEach(testCase => {
                const testCaseItem = document.createElement('div');
                testCaseItem.className = 'test-case-item';
                testCaseItem.innerHTML = `<h3>${testCase.name}</h3>`;
                testCaseItem.addEventListener('click', () => {
                    this.selectTestCase(patientId, testCase.id);
                });
                testCasesContainer.appendChild(testCaseItem);
            });
        } else {
            // No test cases
            const noTestCases = document.createElement('div');
            noTestCases.className = 'no-test-cases';
            noTestCases.textContent = 'No test cases found for this patient.';
            testCasesContainer.appendChild(noTestCases);
        }
        
        // Create a button to add a new test case
        const addTestCaseButton = document.createElement('button');
        addTestCaseButton.className = 'add-test-case-button';
        addTestCaseButton.textContent = 'Add Test Case';
        addTestCaseButton.addEventListener('click', () => {
            this.createNewTestCase(patientId);
        });
        modalBody.appendChild(addTestCaseButton);
        
        console.log(`Selected patient: ${patient.name}`);
    }

    /**
     * Selects a test case and shows its details
     * @param {string} patientId - The ID of the patient
     * @param {string} testCaseId - The ID of the test case to select
     */
    selectTestCase(patientId, testCaseId) {
        console.log(`Selecting test case with ID: ${testCaseId} for patient ID: ${patientId}`);
        
        // Store the selected patient and test case IDs
        this.selectedPatientId = patientId;
        this.selectedCaseId = testCaseId;
        
        // Get the test case
        const testCase = this.testPatientManager.getTestCase(patientId, testCaseId);
        if (!testCase) {
            console.error(`Test case with ID ${testCaseId} not found for patient ID ${patientId}`);
            return;
        }
        
        // Apply the test case to the concept manager
        this.applyTestCase(testCase);
        
        // Close the modal
        const modalContainer = document.getElementById('test-patient-modal');
        if (modalContainer) {
            modalContainer.style.display = 'none';
        }
        
        console.log(`Selected test case: ${testCase.name}`);
    }

    /**
     * Creates a new test case for a patient
     * @param {string} patientId - The ID of the patient
     */
    createNewTestCase(patientId) {
        console.log(`Creating new test case for patient ID: ${patientId}`);
        
        // Get the patient
        const patient = this.testPatientManager.getTestPatient(patientId);
        if (!patient) {
            console.error(`Patient with ID ${patientId} not found`);
            return;
        }
        
        // Get the modal container
        const modalContainer = document.getElementById('test-patient-modal');
        if (!modalContainer) {
            console.error('Test patient modal container not found');
            return;
        }
        
        // Get the modal body
        const modalBody = modalContainer.querySelector('.test-patient-modal-body');
        if (!modalBody) {
            console.error('Modal body not found');
            return;
        }
        
        // Clear the modal body
        modalBody.innerHTML = '';
        
        // Create a back button
        const backButton = document.createElement('button');
        backButton.className = 'back-button';
        backButton.textContent = '← Back to Test Cases';
        backButton.addEventListener('click', () => {
            this.selectPatient(patientId);
        });
        modalBody.appendChild(backButton);
        
        // Create a form for the new test case
        const form = document.createElement('form');
        form.className = 'test-case-form';
        modalBody.appendChild(form);
        
        // Create a name input
        const nameLabel = document.createElement('label');
        nameLabel.textContent = 'Test Case Name:';
        form.appendChild(nameLabel);
        
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.name = 'name';
        nameInput.required = true;
        form.appendChild(nameInput);
        
        // Create a submit button
        const submitButton = document.createElement('button');
        submitButton.type = 'submit';
        submitButton.textContent = 'Create Test Case';
        form.appendChild(submitButton);
        
        // Add submit event listener
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            
            const name = nameInput.value.trim();
            if (!name) {
                alert('Please enter a name for the test case');
                return;
            }
            
            // Create the test case
            const newTestCase = this.testPatientManager.createTestCase(patientId, name);
            if (newTestCase) {
                console.log(`Created new test case: ${newTestCase.name}`);
                
                // Go back to the test cases list
                this.selectPatient(patientId);
            } else {
                console.error('Failed to create test case');
            }
        });
        
        console.log('Showing new test case form');
    }

    /**
     * Applies a test case to the concept manager
     * @param {Object} testCase - The test case to apply
     */
    applyTestCase(testCase) {
        console.log(`Applying test case: ${testCase.name}`);
        
        // Check if we have a concept manager
        if (!this.conceptManager) {
            console.error('Concept manager not available');
            return;
        }
        
        // Apply the test case concepts to the concept manager
        if (testCase.concepts) {
            Object.keys(testCase.concepts).forEach(conceptName => {
                const concept = testCase.concepts[conceptName];
                if (concept && concept.value !== undefined) {
                    this.conceptManager.setConceptValue(conceptName, concept.value);
                    console.log(`Set concept ${conceptName} to value: ${concept.value}`);
                }
            });
        }
        
        // Refresh the UI if needed
        if (window.initializeAdvisor) {
            window.initializeAdvisor();
            console.log('Refreshed advisor with test case data');
        }
    }

    /**
     * Extracts concepts from the configuration
     * @param {Object} config - The configuration object
     * @param {Object} concepts - The concepts object
     * @returns {Object} - The extracted concepts
     */
    extractConceptsFromConfig(config, concepts) {
        console.log('DEBUG: Config structure:', JSON.stringify(config).substring(0, 500) + '...');
        
        // Initialize result structure for different electrolytes
        const result = {
            magnesium: { criteria: {}, order: {} },
            potassium: { criteria: {}, order: {} },
            phosphate: { criteria: {}, order: {} }
        };
        
        // Check for valid configuration
        if (!config) {
            console.log('Invalid configuration: config is null or undefined');
            return result;
        }
        
        // Find TABS array - handle browser vs test environment differences
        let tabsArray = null;
        
        // Additional detailed logging for debugging
        console.log('Config type:', typeof config);
        if (typeof config === 'object') {
            console.log('Config keys:', Object.keys(config));
            if (config.value) {
                console.log('Config.value keys:', Object.keys(config.value));
                if (config.value.RCONFIG) {
                    console.log('Config.value.RCONFIG keys:', Object.keys(config.value.RCONFIG));
                }
            }
        }
        
        // Check for browser environment structure
        if (config.type === 'object' && config.value && config.value.RCONFIG) {
            // In the browser logs we see this structure
            if (config.value.RCONFIG.TABS && Array.isArray(config.value.RCONFIG.TABS)) {
                tabsArray = config.value.RCONFIG.TABS;
                console.log('DEBUG: Found TABS array in config.value.RCONFIG.TABS structure with', tabsArray.length, 'tabs');
            } 
        }
        // Check for test environment structure
        else if (config.RCONFIG && config.RCONFIG.TABS && Array.isArray(config.RCONFIG.TABS)) {
            tabsArray = config.RCONFIG.TABS;
            console.log('DEBUG: Found TABS array in config.RCONFIG.TABS structure with', tabsArray.length, 'tabs');
        }
        // Check if config is already a tab structure (seen in browser logs)
        else if (config.TAB_NAME && config.TAB_KEY) {
            console.log('DEBUG: Config appears to be a single tab object, creating an array with it');
            tabsArray = [config];
        }
        // One more check for a structure seen in browser logs
        else if (config.value && typeof config.value === 'object' && !config.value.RCONFIG) {
            if (config.value.TAB_NAME && config.value.TAB_KEY) {
                console.log('DEBUG: Found single tab object in config.value, creating an array with it');
                tabsArray = [config.value];
            }
        }
        
        if (!tabsArray) {
            console.log('Invalid configuration structure: TABS array not found');
            // More detailed debug output to understand structure
            console.log('Full config structure (truncated):', JSON.stringify(config).substring(0, 1000));
            return result;
        }
        
        console.log('DEBUG: Found', tabsArray.length, 'tabs in configuration');
        
        // Process each tab
        tabsArray.forEach(tab => {
            // Get the tab key, convert to lowercase for consistency
            if (!tab.TAB_KEY) {
                console.log('DEBUG: Tab missing TAB_KEY, skipping');
                return;
            }
            
            const tabKey = String(tab.TAB_KEY).toLowerCase();
            console.log(`DEBUG: Processing tab ${tabKey}`);
            
            // Skip if tab key is not recognized
            if (!result[tabKey]) {
                console.log(`DEBUG: Tab ${tabKey} not recognized, skipping`);
                return;
            }
            
            // Process CRITERIA section
            if (tab.CRITERIA && Array.isArray(tab.CRITERIA)) {
                console.log(`DEBUG: Processing ${tab.CRITERIA.length} criteria for tab ${tabKey}`);
                
                tab.CRITERIA.forEach(criterion => {
                    if (!criterion.CONCEPT_NAME) {
                        console.log('DEBUG: Missing CONCEPT_NAME in criterion:', criterion);
                        return;
                    }
                    
                    // Extract concept names from the expression
                    const extractedConcepts = this.extractAllConceptsFromExpression(criterion.CONCEPT_NAME);
                    
                    extractedConcepts.forEach(conceptName => {
                        if (concepts[conceptName]) {
                            result[tabKey].criteria[conceptName] = concepts[conceptName];
                            console.log(`DEBUG: Added ${conceptName} to ${tabKey} criteria`);
                        }
                    });
                    
                    // Also check DISPLAY field for concepts
                    if (criterion.DISPLAY) {
                        const displayConcepts = this.extractAllConceptsFromExpression(criterion.DISPLAY);
                        
                        displayConcepts.forEach(conceptName => {
                            if (concepts[conceptName]) {
                                result[tabKey].criteria[conceptName] = concepts[conceptName];
                                console.log(`DEBUG: Added ${conceptName} from DISPLAY to ${tabKey} criteria`);
                            }
                        });
                    }
                });
            } else {
                console.log(`DEBUG: No CRITERIA array found for tab ${tabKey}`);
            }
            
            // Process ORDER_SECTIONS section
            if (tab.ORDER_SECTIONS && Array.isArray(tab.ORDER_SECTIONS)) {
                console.log(`DEBUG: Processing ${tab.ORDER_SECTIONS.length} order sections for tab ${tabKey}`);
                
                tab.ORDER_SECTIONS.forEach(section => {
                    if (!section.CONCEPT_NAME) {
                        console.log('DEBUG: Missing CONCEPT_NAME in order section:', section);
                        return;
                    }
                    
                    // Extract concept names from the expression
                    const extractedConcepts = this.extractAllConceptsFromExpression(section.CONCEPT_NAME);
                    
                    extractedConcepts.forEach(conceptName => {
                        if (concepts[conceptName]) {
                            result[tabKey].order[conceptName] = concepts[conceptName];
                            console.log(`DEBUG: Added ${conceptName} to ${tabKey} order`);
                        }
                    });
                    
                    // Also check DISPLAY field for concepts
                    if (section.DISPLAY) {
                        const displayConcepts = this.extractAllConceptsFromExpression(section.DISPLAY);
                        
                        displayConcepts.forEach(conceptName => {
                            if (concepts[conceptName]) {
                                result[tabKey].order[conceptName] = concepts[conceptName];
                                console.log(`DEBUG: Added ${conceptName} from DISPLAY to ${tabKey} order`);
                            }
                        });
                    }
                });
            } else {
                console.log(`DEBUG: No ORDER_SECTIONS array found for tab ${tabKey}`);
            }
        });
        
        return result;
    }

    /**
     * Process all fields in a criterion that might contain concepts
     * @param {Object} criterion - The criterion object
     * @param {Object} concepts - The concepts object
     * @param {Object} targetSection - The target section to add concepts to
     */
    processCriterionFields(criterion, concepts, targetSection) {
        // Process all fields that might contain concepts
        const fieldsToCheck = ['CONCEPT_NAME', 'DISPLAY', 'TOOLTIP'];
        
        fieldsToCheck.forEach(field => {
            let fieldValue = null;
            
            // Handle nested field structure
            if (criterion[field] && typeof criterion[field] === 'object' && criterion[field].value) {
                fieldValue = criterion[field].value;
                console.log(`DEBUG: Found nested ${field}: ${fieldValue}`);
            } else if (criterion[field]) {
                fieldValue = criterion[field];
                console.log(`DEBUG: Found direct ${field}: ${fieldValue}`);
            }
            
            if (fieldValue) {
                const extractedConcepts = this.extractAllConceptsFromExpression(fieldValue);
                extractedConcepts.forEach(concept => {
                    if (concepts[concept]) {
                        targetSection[concept] = concepts[concept];
                        console.log(`Added concept from ${field} to criteria: ${concept}`);
                    }
                });
            }
        });
    }

    /**
     * Process all fields in a section that might contain concepts
     * @param {Object} section - The section object
     * @param {Object} concepts - The concepts object
     * @param {Object} targetSection - The target section to add concepts to
     */
    processSectionFields(section, concepts, targetSection) {
        // Process all fields that might contain concepts
        const fieldsToCheck = ['CONCEPT_NAME', 'SECTION_NAME'];
        
        fieldsToCheck.forEach(field => {
            let fieldValue = null;
            
            // Handle nested field structure
            if (section[field] && typeof section[field] === 'object' && section[field].value) {
                fieldValue = section[field].value;
                console.log(`DEBUG: Found nested ${field}: ${fieldValue}`);
            } else if (section[field]) {
                fieldValue = section[field];
                console.log(`DEBUG: Found direct ${field}: ${fieldValue}`);
            }
            
            if (fieldValue) {
                const extractedConcepts = this.extractAllConceptsFromExpression(fieldValue);
                extractedConcepts.forEach(concept => {
                    if (concepts[concept]) {
                        targetSection[concept] = concepts[concept];
                        console.log(`Added concept from ${field} to order: ${concept}`);
                    }
                });
            }
        });
        
        // Also check for concepts in ORDERS array if it exists
        if (section.ORDERS && Array.isArray(section.ORDERS)) {
            section.ORDERS.forEach(order => {
                if (order.COMMENT) {
                    const commentConcepts = this.extractAllConceptsFromExpression(order.COMMENT);
                    commentConcepts.forEach(concept => {
                        if (concepts[concept]) {
                            targetSection[concept] = concepts[concept];
                            console.log(`Added concept from order COMMENT to order: ${concept}`);
                        }
                    });
                }
            });
        }
    }

    /**
     * Extracts all concepts from an expression
     * @param {string} expression - The expression to extract concepts from
     * @returns {Array} - Array of concept names
     */
    extractAllConceptsFromExpression(expression) {
        if (!expression || typeof expression !== 'string') {
            return [];
        }
        
        const conceptRegex = /\{([^{}]+)\}/g;
        const matches = expression.match(conceptRegex) || [];
        
        return matches.map(match => {
            // Remove the curly braces and any additional properties
            const conceptWithProps = match.substring(1, match.length - 1);
            // Extract just the concept name (before any dot)
            return conceptWithProps.split('.')[0];
        });
    }

    /**
     * Groups concepts by model configuration
     * @param {Object} concepts - The concepts object
     * @returns {Object} - The grouped concepts
     */
    groupConceptsByModelConfig(concepts) {
        console.log('===== STARTING CONCEPT GROUPING PROCESS =====');
        console.log('Grouping concepts by model configuration:', concepts);
        
        // Extract the configuration
        const config = this.modelConfig;
        
        // Use the extractConceptsFromConfig method to categorize concepts
        const result = this.extractConceptsFromConfig(config, concepts);
        
        // Count the number of categorized concepts
        let categorizedCount = 0;
        const uniqueConcepts = new Set();
        
        // Count concepts in each tab
        Object.keys(result).forEach(tabKey => {
            const tab = result[tabKey];
            
            console.log(`Tab ${tabKey}:`);
            console.log(`  Criteria concepts: ${Object.keys(tab.criteria).length}`);
            console.log(`  Order concepts: ${Object.keys(tab.order).length}`);
            console.log(`  Total concepts: ${Object.keys(tab.criteria).length + Object.keys(tab.order).length}`);
            
            Object.keys(tab.criteria).forEach(concept => uniqueConcepts.add(concept));
            Object.keys(tab.order).forEach(concept => uniqueConcepts.add(concept));
        });
        
        categorizedCount = uniqueConcepts.size;
        
        // Get all available concept names
        const availableConceptNames = Object.keys(concepts);
        console.log('Available concept names:', availableConceptNames);
        console.log(`Total unique categorized concepts: ${categorizedCount} out of ${availableConceptNames.length}`);
        
        // Log any uncategorized concepts without using fallback
        if (categorizedCount < availableConceptNames.length) {
            console.log('WARNING: Some concepts were not categorized:');
            
            // Create a list of uncategorized concepts
            availableConceptNames.forEach(concept => {
                if (!uniqueConcepts.has(concept)) {
                    console.log(`  - ${concept}`);
                }
            });
            
            console.log('These concepts will NOT be displayed in the UI as they are not defined in the configuration.');
        }
        
        console.log('\n===== FINAL GROUPED CONCEPTS =====');
        console.log(result);
        console.log('==================================\n');
        
        return result;
    }

    /**
     * Loads the model configuration
     * @returns {Promise} - Promise that resolves when the configuration is loaded
     */
    async loadModelConfiguration() {
        try {
            // Load the configuration from the config file
            const response = await fetch('config/config.json');
            if (!response.ok) {
                throw new Error(`Failed to load configuration: ${response.statusText}`);
            }
            
            // Parse the JSON 
            const configData = await response.json();
            
            // In the browser, the config is directly loaded, but in tests, 
            // it might be wrapped differently. We store it as-is.
            this.modelConfig = configData;
            
            // Log what we loaded
            console.log('DEBUG: Loaded model configuration structure:', 
                        JSON.stringify(this.modelConfig).substring(0, 100) + '...');
            
            return this.modelConfig;
        } catch (error) {
            console.error('Error loading model configuration:', error);
            throw error;
        }
    }
}

// Create and export a singleton instance
var testPatientUI = new TestPatientUI();
export default testPatientUI;

// Also make it available globally for testing
window.testPatientUI = testPatientUI; 