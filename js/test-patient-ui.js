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
        
        // Create the icon element
        const iconElement = document.createElement('div');
        iconElement.className = 'test-patient-icon';
        iconElement.innerHTML = '<i class="fas fa-user-md"></i>';
        iconElement.title = 'Test Patient Manager';
        
        // Add click event listener to show the test patient manager
        iconElement.addEventListener('click', () => {
            this.showTestPatientManager();
        });
        
        // Append the icon to the container if it's valid
        if (container) {
            // Check if container is a string (selector)
            if (typeof container === 'string') {
                console.log(`Container is a string: ${container}`);
                
                // If it's an ID without the # prefix, add it
                let selector = container;
                if (!selector.startsWith('#') && !selector.includes(' ') && !selector.includes('.')) {
                    selector = '#' + selector;
                    console.log(`Treating as ID selector: ${selector}`);
                }
                
                // Try to find the element with the selector
                const containerElement = document.querySelector(selector);
                if (containerElement) {
                    containerElement.appendChild(iconElement);
                    console.log(`Appended icon to element found with selector: ${selector}`);
                } else {
                    // Also try getElementById as a fallback
                    const idElement = document.getElementById(container);
                    if (idElement) {
                        idElement.appendChild(iconElement);
                        console.log(`Appended icon to element found with getElementById: ${container}`);
                    } else {
                        console.error(`Could not find element with selector: ${selector} or ID: ${container}`);
                        // Add to body as fallback
                        document.body.appendChild(iconElement);
                        console.log('Appended icon to body as fallback');
                    }
                }
            } 
            // Check if container is a DOM element
            else if (container instanceof Element || container instanceof HTMLDocument) {
                container.appendChild(iconElement);
                console.log('Appended icon to provided DOM element');
            }
            // Check if container has appendChild method
            else if (typeof container.appendChild === 'function') {
                container.appendChild(iconElement);
                console.log('Appended icon to object with appendChild method');
            }
            else {
                console.error('Container is not a valid DOM element or selector:', container);
                // Add to body as fallback
                document.body.appendChild(iconElement);
                console.log('Appended icon to body as fallback');
            }
        } else {
            // If no container provided, append to body
            document.body.appendChild(iconElement);
            console.log('No container provided, appended icon to body');
        }
        
        console.log('Test patient icon created');
        return iconElement;
    }

    /**
     * Shows the test patient manager UI
     */
    showTestPatientManager() {
        console.log('Showing test patient manager...');
        this.toggleSidebar();
    }

    /**
     * Toggles the test patient sidebar
     */
    toggleSidebar() {
        console.log('Toggling test patient sidebar...');
        
        // Get or create the sidebar
        let sidebar = document.querySelector('.test-patient-sidebar');
        let overlay = document.querySelector('.sidebar-overlay');
        
        if (!sidebar) {
            // Create sidebar
            sidebar = document.createElement('div');
            sidebar.className = 'test-patient-sidebar';
            document.body.appendChild(sidebar);
            
            // Create sidebar header
            const sidebarHeader = document.createElement('div');
            sidebarHeader.className = 'sidebar-header';
            sidebar.appendChild(sidebarHeader);
            
            // Create sidebar title
            const sidebarTitle = document.createElement('h2');
            sidebarTitle.textContent = 'Test Patients';
            sidebarHeader.appendChild(sidebarTitle);
            
            // Create close button
            const closeButton = document.createElement('button');
            closeButton.className = 'sidebar-close-btn';
            closeButton.innerHTML = '&times;';
            closeButton.setAttribute('aria-label', 'Close');
            closeButton.addEventListener('click', () => this.toggleSidebar());
            sidebarHeader.appendChild(closeButton);
            
            // Create sidebar content
            const sidebarContent = document.createElement('div');
            sidebarContent.className = 'sidebar-content';
            sidebar.appendChild(sidebarContent);
            
            // Create overlay
            overlay = document.createElement('div');
            overlay.className = 'sidebar-overlay';
            overlay.addEventListener('click', () => this.toggleSidebar());
            document.body.appendChild(overlay);
            
            // Render sidebar content
            this.renderSidebarContent(sidebarContent);
        }
        
        // Toggle sidebar visibility
        sidebar.classList.toggle('active');
        
        // Toggle overlay
        if (overlay) {
            overlay.classList.toggle('active');
        }
        
        // Toggle body class for preventing scrolling
        document.body.classList.toggle('sidebar-open');
        
        // Toggle app container shifting
        const appContainer = document.getElementById('app-container');
        if (appContainer) {
            appContainer.classList.toggle('app-shifted');
        }
        
        console.log('Test patient sidebar toggled');
    }

    /**
     * Creates the patient list in the test patient manager UI
     * @param {HTMLElement} container - The container element to append the list to
     */
    createPatientList(container) {
        console.log('Creating patient list...');
        
        // Clear the container
        container.innerHTML = '';
        
        // Create a header
        const header = document.createElement('div');
        header.className = 'patient-list-header';
        header.innerHTML = '<h2>Test Patients</h2>';
        container.appendChild(header);
        
        // Create "Add Test Patient" button
        const addButton = document.createElement('button');
        addButton.className = 'add-test-patient-button';
        addButton.textContent = 'Add Test Patient';
        addButton.addEventListener('click', () => {
            this.createNewPatient();
        });
        container.appendChild(addButton);
        
        // Get all patients
        const patients = this.testPatientManager.getTestPatients();
        
        // Create patient list
        const patientList = document.createElement('div');
        patientList.className = 'patient-list';
        container.appendChild(patientList);
        
        // Add patients to the list
        if (patients.length > 0) {
            patients.forEach(patient => {
                const patientItem = document.createElement('div');
                patientItem.className = 'patient-item';
                patientItem.innerHTML = `<h3>${patient.name}</h3>`;
                patientItem.addEventListener('click', () => {
                    this.selectPatient(patient.id);
                });
                patientList.appendChild(patientItem);
            });
        } else {
            // No patients message
            const noPatients = document.createElement('div');
            noPatients.className = 'no-patients';
            noPatients.textContent = 'No test patients found. Click "Add Test Patient" to create one.';
            patientList.appendChild(noPatients);
        }
        
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
     * Creates a new test patient
     */
    createNewPatient() {
        console.log('Creating new test patient...');
        
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
        
        // Create a form for the new patient
        const form = document.createElement('form');
        form.className = 'test-patient-form';
        modalBody.appendChild(form);
        
        // Create a form header
        const formHeader = document.createElement('h2');
        formHeader.textContent = 'Create New Test Patient';
        form.appendChild(formHeader);
        
        // Create a name input
        const nameGroup = document.createElement('div');
        nameGroup.className = 'form-group';
        form.appendChild(nameGroup);
        
        const nameLabel = document.createElement('label');
        nameLabel.textContent = 'Patient Name:';
        nameLabel.htmlFor = 'patient-name';
        nameGroup.appendChild(nameLabel);
        
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.id = 'patient-name';
        nameInput.name = 'name';
        nameInput.required = true;
        nameInput.placeholder = 'e.g., Adult Male Patient';
        nameGroup.appendChild(nameInput);
        
        // Create a details input (optional)
        const detailsGroup = document.createElement('div');
        detailsGroup.className = 'form-group';
        form.appendChild(detailsGroup);
        
        const detailsLabel = document.createElement('label');
        detailsLabel.textContent = 'Patient Details (optional):';
        detailsLabel.htmlFor = 'patient-details';
        detailsGroup.appendChild(detailsLabel);
        
        const detailsInput = document.createElement('textarea');
        detailsInput.id = 'patient-details';
        detailsInput.name = 'details';
        detailsInput.placeholder = 'Enter any additional details about this patient';
        detailsInput.rows = 3;
        detailsGroup.appendChild(detailsInput);
        
        // Create form actions
        const formActions = document.createElement('div');
        formActions.className = 'form-actions';
        form.appendChild(formActions);
        
        // Create a cancel button
        const cancelButton = document.createElement('button');
        cancelButton.type = 'button';
        cancelButton.className = 'btn-cancel';
        cancelButton.textContent = 'Cancel';
        cancelButton.addEventListener('click', () => {
            this.createPatientList(modalBody);
        });
        formActions.appendChild(cancelButton);
        
        // Create a submit button
        const submitButton = document.createElement('button');
        submitButton.type = 'submit';
        submitButton.className = 'btn-save';
        submitButton.textContent = 'Create Patient';
        formActions.appendChild(submitButton);
        
        // Add submit event listener
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            
            const name = nameInput.value.trim();
            if (!name) {
                alert('Please enter a name for the test patient');
                return;
            }
            
            // Create the test patient
            const details = detailsInput.value.trim();
            const newPatient = this.testPatientManager.createTestPatient(name, details ? { description: details } : {});
            
            if (newPatient) {
                console.log(`Created new test patient: ${newPatient.name}`);
                
                // Show a notification
                this.showNotification(`Test patient "${newPatient.name}" created successfully`);
                
                // Go back to the patient list
                this.createPatientList(modalBody);
            } else {
                console.error('Failed to create test patient');
                alert('Failed to create test patient. Please try again.');
            }
        });
        
        // Focus the name input
        setTimeout(() => nameInput.focus(), 100);
        
        console.log('Showing new test patient form');
    }
    
    /**
     * Shows a notification message
     * @param {string} message - The message to show
     * @param {number} duration - The duration in milliseconds to show the notification
     */
    showNotification(message, duration = 3000) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'test-patient-notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Remove notification after duration
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, duration);
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

    /**
     * Renders the sidebar content with test patients
     * @param {HTMLElement} sidebarContent - The sidebar content element
     */
    renderSidebarContent(sidebarContent) {
        console.log('Rendering sidebar content...');
        
        // Clear the sidebar content
        sidebarContent.innerHTML = '';
        
        // Get all test patients
        const testPatients = this.testPatientManager.getTestPatients();
        
        // Create accordion items for each patient
        testPatients.forEach(patient => {
            const patientItem = document.createElement('div');
            patientItem.className = 'sidebar-accordion-item expanded'; // Default to expanded
            patientItem.dataset.patientId = patient.id;
            
            // Create patient header with name and edit button
            const patientHeaderContainer = document.createElement('div');
            patientHeaderContainer.className = 'sidebar-accordion-header-container';
            
            // Create editable patient name span
            const patientNameSpan = document.createElement('span');
            patientNameSpan.className = 'patient-name-span';
            patientNameSpan.textContent = patient.name;
            patientNameSpan.contentEditable = false; // Not editable by default
            
            // Create the header that will contain the name span
            const patientHeader = document.createElement('div');
            patientHeader.className = 'sidebar-accordion-header';
            patientHeader.appendChild(patientNameSpan);
            
            // Add expand/collapse functionality
            patientHeader.addEventListener('click', (e) => {
                // Only toggle if we didn't click on the editable span while editing
                if (!(e.target === patientNameSpan && patientNameSpan.contentEditable === 'true')) {
                    patientItem.classList.toggle('expanded');
                }
            });
            
            // Create edit button for patient name
            const editPatientButton = document.createElement('button');
            editPatientButton.className = 'sidebar-edit-patient-btn';
            editPatientButton.textContent = 'Edit';
            editPatientButton.title = 'Edit patient name';
            
            // Function to save the patient name
            const savePatientName = () => {
                const newName = patientNameSpan.textContent.trim();
                if (newName && newName !== patient.name) {
                    // Update the patient name
                    const updatedPatient = this.testPatientManager.updateTestPatient(patient.id, { name: newName });
                    
                    if (updatedPatient) {
                        console.log(`Updated patient name to: ${updatedPatient.name}`);
                        this.showNotification(`Patient name updated to "${updatedPatient.name}"`);
                        patient.name = newName; // Update local reference
                    } else {
                        console.error('Failed to update patient name');
                        patientNameSpan.textContent = patient.name; // Revert to original name
                        this.showNotification('Failed to update patient name', 3000);
                    }
                } else if (!newName) {
                    // If empty, revert to original name
                    patientNameSpan.textContent = patient.name;
                    this.showNotification('Patient name cannot be empty', 3000);
                }
                
                // Reset editing state
                patientNameSpan.contentEditable = false;
                patientNameSpan.classList.remove('editing');
                editPatientButton.textContent = 'Edit';
                editPatientButton.classList.remove('save-mode');
            };
            
            editPatientButton.addEventListener('click', (e) => {
                e.stopPropagation();
                
                if (patientNameSpan.contentEditable === 'true') {
                    // If already editing, save the changes
                    savePatientName();
                } else {
                    // Make the name span editable
                    patientNameSpan.contentEditable = true;
                    patientNameSpan.focus();
                    
                    // Select all text
                    const range = document.createRange();
                    range.selectNodeContents(patientNameSpan);
                    const selection = window.getSelection();
                    selection.removeAllRanges();
                    selection.addRange(range);
                    
                    // Add a class to indicate it's being edited
                    patientNameSpan.classList.add('editing');
                    
                    // Change edit button to save button
                    editPatientButton.textContent = 'Save';
                    editPatientButton.classList.add('save-mode');
                }
            });
            
            // Add blur event to save changes when focus is lost
            patientNameSpan.addEventListener('blur', () => {
                if (patientNameSpan.contentEditable === 'true') {
                    savePatientName();
                }
            });
            
            // Add keydown event to handle Enter and Escape keys
            patientNameSpan.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault(); // Prevent adding a new line
                    savePatientName();
                    patientNameSpan.blur();
                } else if (e.key === 'Escape') {
                    e.preventDefault();
                    patientNameSpan.textContent = patient.name; // Revert to original name
                    patientNameSpan.contentEditable = false;
                    patientNameSpan.classList.remove('editing');
                    editPatientButton.textContent = 'Edit';
                    editPatientButton.classList.remove('save-mode');
                }
            });
            
            patientHeaderContainer.appendChild(patientHeader);
            patientHeaderContainer.appendChild(editPatientButton);
            patientItem.appendChild(patientHeaderContainer);
            
            // Create patient content (test cases)
            const patientContent = document.createElement('div');
            patientContent.className = 'sidebar-accordion-content';
            
            // Get test cases for this patient
            const testCases = this.testPatientManager.getTestCases(patient.id);
            
            if (testCases.length > 0) {
                // Create a list for test cases
                const testCaseList = document.createElement('ul');
                testCaseList.className = 'sidebar-test-case-list';
                
                testCases.forEach(testCase => {
                    const testCaseItem = document.createElement('li');
                    testCaseItem.className = 'sidebar-test-case-item';
                    
                    // Create test case name
                    const testCaseName = document.createElement('span');
                    testCaseName.className = 'sidebar-test-case-name';
                    testCaseName.textContent = testCase.name;
                    
                    // Add click event to apply the test case
                    testCaseName.addEventListener('click', () => {
                        this.applyTestCase(testCase);
                        this.showNotification(`Applied test case: ${testCase.name}`);
                    });
                    
                    // Create edit button
                    const editButton = document.createElement('button');
                    editButton.className = 'sidebar-edit-btn';
                    editButton.textContent = 'Edit';
                    editButton.addEventListener('click', (e) => {
                        e.stopPropagation();
                        console.log(`Edit button clicked for patient ID: ${patient.id}, test case ID: ${testCase.id}`);
                        this.editTestCase(patient.id, testCase.id);
                    });
                    
                    testCaseItem.appendChild(testCaseName);
                    testCaseItem.appendChild(editButton);
                    testCaseList.appendChild(testCaseItem);
                });
                
                patientContent.appendChild(testCaseList);
            } else {
                // No test cases
                const noTestCases = document.createElement('div');
                noTestCases.className = 'no-test-cases';
                noTestCases.textContent = 'No test cases found for this patient.';
                patientContent.appendChild(noTestCases);
            }
            
            // Add button to create new test case
            const addTestCaseButton = document.createElement('button');
            addTestCaseButton.className = 'sidebar-add-test-case-btn';
            addTestCaseButton.textContent = 'Add Test Case';
            addTestCaseButton.addEventListener('click', (e) => {
                e.stopPropagation();
                this.createNewTestCase(patient.id);
            });
            
            patientContent.appendChild(addTestCaseButton);
            patientItem.appendChild(patientContent);
            
            sidebarContent.appendChild(patientItem);
        });
    }

    /**
     * Edit a test case for a patient
     * @param {string} patientId - The ID of the patient
     * @param {string} testCaseId - The ID of the test case to edit
     */
    editTestCase(patientId, testCaseId) {
        console.log(`Editing test case with ID: ${testCaseId} for patient ID: ${patientId}`);
        
        // Get the test case
        const testCase = this.testPatientManager.getTestCase(patientId, testCaseId);
        if (!testCase) {
            console.error(`Test case with ID ${testCaseId} not found for patient ID ${patientId}`);
            return;
        }
        
        // Apply the test case to the concept manager
        this.applyTestCase(testCase);
        
        // Create or get the test case manager modal
        let modal = document.getElementById('test-case-manager-modal');
        if (!modal) {
            // Create the modal
            modal = document.createElement('div');
            modal.id = 'test-case-manager-modal';
            modal.className = 'test-case-manager-modal';
            
            // Create modal content
            const modalContent = document.createElement('div');
            modalContent.className = 'test-case-manager-modal-content';
            modal.appendChild(modalContent);
            
            // Create modal header
            const modalHeader = document.createElement('div');
            modalHeader.className = 'test-case-manager-modal-header';
            modalContent.appendChild(modalHeader);
            
            // Create modal title
            const modalTitle = document.createElement('h2');
            modalTitle.className = 'test-case-manager-modal-title';
            modalTitle.textContent = 'Test Case Manager';
            modalHeader.appendChild(modalTitle);
            
            // Create close button
            const closeButton = document.createElement('button');
            closeButton.className = 'test-case-manager-modal-close';
            closeButton.innerHTML = '&times;';
            closeButton.setAttribute('aria-label', 'Close');
            closeButton.addEventListener('click', () => {
                modal.style.display = 'none';
            });
            modalHeader.appendChild(closeButton);
            
            // Create modal body
            const modalBody = document.createElement('div');
            modalBody.className = 'test-case-manager-modal-body';
            modalContent.appendChild(modalBody);
            
            document.body.appendChild(modal);
        }
        
        // Get the modal body
        const modalBody = modal.querySelector('.test-case-manager-modal-body');
        modalBody.innerHTML = '';
        
        // Update the modal title
        const modalTitle = modal.querySelector('.test-case-manager-modal-title');
        modalTitle.textContent = `Editing Test Case: ${testCase.name}`;
        
        // Create the form
        const form = document.createElement('form');
        form.className = 'test-case-form';
        
        // Create test case name section
        const nameSection = document.createElement('div');
        nameSection.className = 'test-case-form-section';
        
        const nameLabel = document.createElement('label');
        nameLabel.htmlFor = 'test-case-name';
        nameLabel.textContent = 'Test Case Name';
        
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.id = 'test-case-name';
        nameInput.className = 'form-control';
        nameInput.value = testCase.name;
        
        nameSection.appendChild(nameLabel);
        nameSection.appendChild(nameInput);
        form.appendChild(nameSection);
        
        // Create concepts section
        const conceptsSection = document.createElement('div');
        conceptsSection.className = 'test-case-form-section';
        
        const conceptsTitle = document.createElement('h3');
        conceptsTitle.textContent = 'Concepts';
        conceptsSection.appendChild(conceptsTitle);
        
        // Add concepts from the test case
        if (testCase.concepts) {
            const conceptsList = document.createElement('div');
            conceptsList.className = 'concepts-list';
            
            Object.keys(testCase.concepts).forEach(conceptName => {
                const concept = testCase.concepts[conceptName];
                
                const conceptItem = document.createElement('div');
                conceptItem.className = 'concept-item';
                
                const conceptNameLabel = document.createElement('label');
                conceptNameLabel.textContent = conceptName;
                conceptItem.appendChild(conceptNameLabel);
                
                const conceptValueInput = document.createElement('input');
                conceptValueInput.type = 'text';
                conceptValueInput.className = 'form-control';
                conceptValueInput.value = concept.value !== undefined ? concept.value : '';
                conceptValueInput.dataset.conceptName = conceptName;
                conceptItem.appendChild(conceptValueInput);
                
                conceptsList.appendChild(conceptItem);
            });
            
            conceptsSection.appendChild(conceptsList);
        } else {
            const noConceptsMessage = document.createElement('p');
            noConceptsMessage.textContent = 'No concepts found in this test case.';
            conceptsSection.appendChild(noConceptsMessage);
        }
        
        form.appendChild(conceptsSection);
        
        // Create form actions
        const formActions = document.createElement('div');
        formActions.className = 'test-case-form-actions';
        
        // Create cancel button
        const cancelButton = document.createElement('button');
        cancelButton.type = 'button';
        cancelButton.className = 'btn-cancel';
        cancelButton.textContent = 'Cancel';
        cancelButton.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        formActions.appendChild(cancelButton);
        
        // Create save button
        const saveButton = document.createElement('button');
        saveButton.type = 'button';
        saveButton.className = 'btn-save';
        saveButton.textContent = 'Save Test Case';
        saveButton.addEventListener('click', () => {
            // Get the updated test case name
            const updatedName = nameInput.value.trim();
            if (!updatedName) {
                alert('Please enter a name for the test case');
                return;
            }
            
            // Get the updated concepts
            const updatedConcepts = {};
            const conceptInputs = conceptsSection.querySelectorAll('input[data-concept-name]');
            conceptInputs.forEach(input => {
                const conceptName = input.dataset.conceptName;
                const conceptValue = input.value.trim();
                
                if (conceptValue) {
                    updatedConcepts[conceptName] = {
                        value: conceptValue
                    };
                }
            });
            
            // Update the test case
            const updatedTestCase = this.testPatientManager.updateTestCase(
                patientId,
                testCaseId,
                {
                    name: updatedName,
                    concepts: updatedConcepts
                }
            );
            
            if (updatedTestCase) {
                this.showNotification(`Test case "${updatedName}" updated successfully`);
                modal.style.display = 'none';
                
                // Refresh the sidebar if it's open
                const sidebar = document.querySelector('.test-patient-sidebar');
                if (sidebar && sidebar.classList.contains('active')) {
                    const sidebarContent = sidebar.querySelector('.sidebar-content');
                    if (sidebarContent) {
                        this.renderSidebarContent(sidebarContent);
                    }
                }
            } else {
                alert('Failed to update test case. Please try again.');
            }
        });
        formActions.appendChild(saveButton);
        
        form.appendChild(formActions);
        modalBody.appendChild(form);
        
        // Show the modal
        modal.style.display = 'block';
        
        console.log(`Test case loaded for editing: ${testCase.name}`);
    }
}

// Create and export a singleton instance
var testPatientUI = new TestPatientUI();
export default testPatientUI;

// Also make it available globally for testing
window.testPatientUI = testPatientUI; 