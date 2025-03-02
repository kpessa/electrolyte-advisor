/**
 * Test Patient Manager
 * 
 * This class manages test patients and test cases for the Electrolyte Advisor.
 * It provides functionality to create, edit, and delete test patients and test cases,
 * and to configure concepts for each test patient and test case.
 */

import { parseConfigForConceptExpressions, createConceptInstantiation, evaluateConceptExpression } from './concept-parser.js';

class TestPatientManager {
    constructor() {
        this.testPatients = [];
        this.conceptManager = null;
        this.initialized = false;
    }

    /**
     * Initializes the test patient manager
     * @param {Object} conceptManager - The concept manager instance
     * @returns {Promise} - Promise that resolves when initialization is complete
     */
    async initialize(conceptManager) {
        if (this.initialized) return;

        try {
            this.conceptManager = conceptManager;
            
            // Load test patients from local storage
            this.loadTestPatientsFromStorage();
            
            this.initialized = true;
            return true;
        } catch (error) {
            console.error('Error initializing test patient manager:', error);
            throw error;
        }
    }

    /**
     * Loads test patients from local storage
     */
    loadTestPatientsFromStorage() {
        try {
            const storedTestPatients = localStorage.getItem('electrolyte_advisor_test_patients');
            if (storedTestPatients) {
                this.testPatients = JSON.parse(storedTestPatients);
            } else {
                // Initialize with an empty array if no test patients are stored
                this.testPatients = [];
            }
        } catch (error) {
            console.error('Error loading test patients from storage:', error);
            this.testPatients = [];
        }
    }

    /**
     * Saves test patients to local storage
     */
    saveTestPatientsToStorage() {
        try {
            localStorage.setItem('electrolyte_advisor_test_patients', JSON.stringify(this.testPatients));
        } catch (error) {
            console.error('Error saving test patients to storage:', error);
        }
    }

    /**
     * Gets all test patients
     * @returns {Array} - Array of test patient objects
     */
    getTestPatients() {
        return this.testPatients;
    }

    /**
     * Gets a test patient by ID
     * @param {string} patientId - The ID of the test patient
     * @returns {Object|null} - The test patient object or null if not found
     */
    getTestPatient(patientId) {
        return this.testPatients.find(patient => patient.id === patientId) || null;
    }

    /**
     * Creates a new test patient
     * @param {string} name - The name of the test patient
     * @param {Object} details - Additional details for the test patient
     * @returns {Object} - The created test patient object
     */
    createTestPatient(name, details = {}) {
        const newPatient = {
            id: this.generateId(),
            name: name,
            details: details,
            testCases: [],
            concepts: this.cloneConceptInstantiation()
        };
        
        this.testPatients.push(newPatient);
        this.saveTestPatientsToStorage();
        
        return newPatient;
    }

    /**
     * Updates a test patient
     * @param {string} patientId - The ID of the test patient to update
     * @param {Object} updates - The updates to apply
     * @returns {Object|null} - The updated test patient object or null if not found
     */
    updateTestPatient(patientId, updates) {
        const patientIndex = this.testPatients.findIndex(patient => patient.id === patientId);
        if (patientIndex === -1) return null;
        
        const updatedPatient = {
            ...this.testPatients[patientIndex],
            ...updates
        };
        
        this.testPatients[patientIndex] = updatedPatient;
        this.saveTestPatientsToStorage();
        
        return updatedPatient;
    }

    /**
     * Deletes a test patient
     * @param {string} patientId - The ID of the test patient to delete
     * @returns {boolean} - Whether the deletion was successful
     */
    deleteTestPatient(patientId) {
        const initialLength = this.testPatients.length;
        this.testPatients = this.testPatients.filter(patient => patient.id !== patientId);
        
        if (this.testPatients.length !== initialLength) {
            this.saveTestPatientsToStorage();
            return true;
        }
        
        return false;
    }

    /**
     * Gets all test cases for a test patient
     * @param {string} patientId - The ID of the test patient
     * @returns {Array} - Array of test case objects
     */
    getTestCases(patientId) {
        const patient = this.getTestPatient(patientId);
        return patient ? patient.testCases : [];
    }

    /**
     * Gets a test case by ID
     * @param {string} patientId - The ID of the test patient
     * @param {string} caseId - The ID of the test case
     * @returns {Object|null} - The test case object or null if not found
     */
    getTestCase(patientId, caseId) {
        const patient = this.getTestPatient(patientId);
        if (!patient) return null;
        
        return patient.testCases.find(testCase => testCase.id === caseId) || null;
    }

    /**
     * Creates a new test case for a test patient
     * @param {string} patientId - The ID of the test patient
     * @param {string} name - The name of the test case
     * @param {Object} details - Additional details for the test case
     * @returns {Object|null} - The created test case object or null if patient not found
     */
    createTestCase(patientId, name, details = {}) {
        const patient = this.getTestPatient(patientId);
        if (!patient) return null;
        
        const newCase = {
            id: this.generateId(),
            name: name,
            details: details,
            concepts: this.cloneConceptInstantiation()
        };
        
        patient.testCases.push(newCase);
        this.saveTestPatientsToStorage();
        
        return newCase;
    }

    /**
     * Updates a test case
     * @param {string} patientId - The ID of the test patient
     * @param {string} caseId - The ID of the test case to update
     * @param {Object} updates - The updates to apply
     * @returns {Object|null} - The updated test case object or null if not found
     */
    updateTestCase(patientId, caseId, updates) {
        const patient = this.getTestPatient(patientId);
        if (!patient) return null;
        
        const caseIndex = patient.testCases.findIndex(testCase => testCase.id === caseId);
        if (caseIndex === -1) return null;
        
        const updatedCase = {
            ...patient.testCases[caseIndex],
            ...updates
        };
        
        patient.testCases[caseIndex] = updatedCase;
        this.saveTestPatientsToStorage();
        
        return updatedCase;
    }

    /**
     * Deletes a test case
     * @param {string} patientId - The ID of the test patient
     * @param {string} caseId - The ID of the test case to delete
     * @returns {boolean} - Whether the deletion was successful
     */
    deleteTestCase(patientId, caseId) {
        const patient = this.getTestPatient(patientId);
        if (!patient) return false;
        
        const initialLength = patient.testCases.length;
        patient.testCases = patient.testCases.filter(testCase => testCase.id !== caseId);
        
        if (patient.testCases.length !== initialLength) {
            this.saveTestPatientsToStorage();
            return true;
        }
        
        return false;
    }

    /**
     * Sets a concept value for a test patient
     * @param {string} patientId - The ID of the test patient
     * @param {string} conceptName - The name of the concept
     * @param {*} value - The value to set
     */
    setPatientConceptValue(patientId, conceptName, value) {
        const patient = this.getTestPatient(patientId);
        if (patient && patient.concepts[conceptName]) {
            patient.concepts[conceptName].value = value;
            this.saveTestPatientsToStorage();
        }
    }

    /**
     * Sets a concept's active state for a test patient
     * @param {string} patientId - The ID of the test patient
     * @param {string} conceptName - The name of the concept
     * @param {boolean} isActive - Whether the concept is active
     */
    setPatientConceptActive(patientId, conceptName, isActive) {
        const patient = this.getTestPatient(patientId);
        if (patient && patient.concepts[conceptName]) {
            patient.concepts[conceptName].isActive = isActive;
            this.saveTestPatientsToStorage();
        }
    }

    /**
     * Sets a concept value for a test case
     * @param {string} patientId - The ID of the test patient
     * @param {string} caseId - The ID of the test case
     * @param {string} conceptName - The name of the concept
     * @param {*} value - The value to set
     */
    setCaseConceptValue(patientId, caseId, conceptName, value) {
        const testCase = this.getTestCase(patientId, caseId);
        if (testCase && testCase.concepts[conceptName]) {
            testCase.concepts[conceptName].value = value;
            this.saveTestPatientsToStorage();
        }
    }

    /**
     * Sets a concept's active state for a test case
     * @param {string} patientId - The ID of the test patient
     * @param {string} caseId - The ID of the test case
     * @param {string} conceptName - The name of the concept
     * @param {boolean} isActive - Whether the concept is active
     */
    setCaseConceptActive(patientId, caseId, conceptName, isActive) {
        const testCase = this.getTestCase(patientId, caseId);
        if (testCase && testCase.concepts[conceptName]) {
            testCase.concepts[conceptName].isActive = isActive;
            this.saveTestPatientsToStorage();
        }
    }

    /**
     * Evaluates a concept expression using a test patient's concepts
     * @param {string} patientId - The ID of the test patient
     * @param {string} expression - The concept expression to evaluate
     * @returns {boolean} - Result of the evaluation
     */
    evaluatePatientExpression(patientId, expression) {
        const patient = this.getTestPatient(patientId);
        if (!patient) return false;
        
        return evaluateConceptExpression(expression, patient.concepts);
    }

    /**
     * Evaluates a concept expression using a test case's concepts
     * @param {string} patientId - The ID of the test patient
     * @param {string} caseId - The ID of the test case
     * @param {string} expression - The concept expression to evaluate
     * @returns {boolean} - Result of the evaluation
     */
    evaluateCaseExpression(patientId, caseId, expression) {
        const testCase = this.getTestCase(patientId, caseId);
        if (!testCase) return false;
        
        return evaluateConceptExpression(expression, testCase.concepts);
    }

    /**
     * Clones the concept instantiation from the concept manager
     * @returns {Object} - Cloned concept instantiation object
     */
    cloneConceptInstantiation() {
        if (!this.conceptManager) {
            console.error('Concept manager not initialized');
            return {};
        }
        
        // Get the concept instantiation from the concept manager
        const conceptInstantiation = this.conceptManager.conceptInstantiation;
        
        // Create a deep clone of the concept instantiation
        const clone = {};
        for (const key in conceptInstantiation) {
            clone[key] = {
                ...conceptInstantiation[key]
            };
        }
        
        return clone;
    }

    /**
     * Generates a unique ID
     * @returns {string} - A unique ID
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }

    /**
     * Evaluates a concept expression for a test patient or test case
     * @param {string} patientId - The ID of the test patient
     * @param {string} caseId - The ID of the test case (optional)
     * @param {string} expression - The concept expression to evaluate
     * @returns {boolean} - Result of the evaluation
     */
    evaluateExpression(patientId, caseId, expression) {
        let concepts = null;
        
        if (caseId) {
            // Get concepts from the test case
            const testCase = this.getTestCase(patientId, caseId);
            if (testCase) {
                concepts = testCase.concepts;
            }
        } else {
            // Get concepts from the test patient
            const patient = this.getTestPatient(patientId);
            if (patient) {
                concepts = patient.concepts;
            }
        }
        
        if (!concepts) return false;
        
        // Evaluate the expression using the concept parser
        return evaluateConceptExpression(expression, concepts);
    }
}

export default TestPatientManager; 