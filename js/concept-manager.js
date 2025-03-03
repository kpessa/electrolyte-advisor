/**
 * Concept Manager
 * 
 * This class manages the concepts extracted from the configuration file.
 * It provides functionality to instantiate concepts, test expressions,
 * and create a UI for managing concepts.
 */

import { parseConfigForConceptExpressions, createConceptInstantiation, evaluateConceptExpression } from './concept-parser.js';

class ConceptManager {
    constructor() {
        this.config = null;
        this.conceptExpressions = [];
        this.distinctConcepts = [];
        this.conceptInstantiation = {};
    }

    /**
     * Loads the configuration and extracts concepts
     * @returns {Promise} - Promise that resolves when loading is complete
     */
    async loadConfig() {
        try {
            // Use the existing config if available
            if (window.currentConfig) {
                this.config = window.currentConfig;
            } else {
                // Otherwise load it from the server
                const response = await fetch('config/config.json');
                this.config = await response.json();
            }
            
            // Parse the configuration for concept expressions
            const result = parseConfigForConceptExpressions(this.config);
            this.conceptExpressions = result.conceptExpressions;
            this.distinctConcepts = result.distinctConcepts;
            
            // Create concept instantiation object
            this.conceptInstantiation = createConceptInstantiation(this.distinctConcepts);
            
            return true;
        } catch (error) {
            console.error('Error loading configuration:', error);
            throw error;
        }
    }

    /**
     * Gets the list of distinct concepts
     * @returns {string[]} - Array of distinct concept names
     */
    getDistinctConcepts() {
        return this.distinctConcepts;
    }

    /**
     * Gets the list of concept expressions
     * @returns {Object[]} - Array of concept expression objects
     */
    getConceptExpressions() {
        return this.conceptExpressions;
    }

    /**
     * Sets a concept value
     * @param {string} conceptName - The name of the concept
     * @param {*} value - The value to set
     */
    setConceptValue(conceptName, value) {
        if (this.conceptInstantiation[conceptName]) {
            this.conceptInstantiation[conceptName].value = value;
            this.refreshAdvisor();
        }
    }

    /**
     * Sets a concept's active state
     * @param {string} conceptName - The name of the concept
     * @param {boolean} isActive - Whether the concept is active
     */
    setConceptActive(conceptName, isActive) {
        if (this.conceptInstantiation[conceptName]) {
            this.conceptInstantiation[conceptName].isActive = isActive;
            this.refreshAdvisor();
        }
    }

    /**
     * Evaluates a concept expression
     * @param {string} expression - The concept expression to evaluate
     * @returns {boolean} - Result of the evaluation
     */
    evaluateExpression(expression) {
        return evaluateConceptExpression(expression, this.conceptInstantiation);
    }

    /**
     * Refreshes the advisor to reflect concept changes
     */
    refreshAdvisor() {
        // Refresh the advisor if the initializeAdvisor function is available
        if (window.initializeAdvisor) {
            window.initializeAdvisor();
        }
    }

    /**
     * Creates a UI for managing concepts
     * @param {string} containerId - The ID of the container element
     */
    createConceptUI(containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container element with ID "${containerId}" not found.`);
            return;
        }
        
        // Clear the container
        container.innerHTML = '';
        
        // Create the concept manager UI
        const conceptManagerUI = document.createElement('div');
        conceptManagerUI.className = 'concept-manager';
        
        // Create search bar
        const searchContainer = document.createElement('div');
        searchContainer.className = 'search-container';
        
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.className = 'search-input';
        searchInput.placeholder = 'Search concepts and expressions...';
        
        const searchIcon = document.createElement('span');
        searchIcon.className = 'search-icon';
        searchIcon.innerHTML = '🔍';
        
        searchContainer.appendChild(searchIcon);
        searchContainer.appendChild(searchInput);
        conceptManagerUI.appendChild(searchContainer);
        
        // Create the concepts section
        const conceptsSection = document.createElement('div');
        conceptsSection.className = 'concepts-section';
        
        // Create the section header
        const conceptsHeader = document.createElement('h3');
        conceptsHeader.textContent = 'Concepts';
        conceptsSection.appendChild(conceptsHeader);
        
        // Add summary information
        const summaryInfo = document.createElement('div');
        summaryInfo.className = 'concepts-summary';
        summaryInfo.textContent = `Total Concepts: ${this.distinctConcepts.length} | Total Expressions: ${this.conceptExpressions.length}`;
        conceptsSection.appendChild(summaryInfo);
        
        // Create the concepts table
        const conceptsTable = document.createElement('div');
        conceptsTable.className = 'concepts-table';
        
        // Create table header
        const tableHeader = document.createElement('div');
        tableHeader.className = 'concepts-table-header';
        
        const nameHeader = document.createElement('div');
        nameHeader.className = 'concept-column concept-name-column';
        nameHeader.textContent = 'Concept';
        
        const activeHeader = document.createElement('div');
        activeHeader.className = 'concept-column concept-active-column';
        activeHeader.textContent = 'Active';
        
        const valueHeader = document.createElement('div');
        valueHeader.className = 'concept-column concept-value-column';
        valueHeader.textContent = 'Value';
        
        tableHeader.appendChild(nameHeader);
        tableHeader.appendChild(activeHeader);
        tableHeader.appendChild(valueHeader);
        conceptsTable.appendChild(tableHeader);
        
        // Create table rows for each concept
        this.distinctConcepts.forEach(conceptName => {
            const conceptRow = document.createElement('div');
            conceptRow.className = 'concepts-table-row';
            conceptRow.dataset.conceptName = conceptName.toLowerCase();
            
            // Create the concept name cell
            const nameCell = document.createElement('div');
            nameCell.className = 'concept-column concept-name-column';
            nameCell.textContent = conceptName;
            conceptRow.appendChild(nameCell);
            
            // Create the active checkbox cell
            const activeCell = document.createElement('div');
            activeCell.className = 'concept-column concept-active-column';
            
            const activeCheckbox = document.createElement('input');
            activeCheckbox.type = 'checkbox';
            activeCheckbox.className = 'concept-active-checkbox';
            activeCheckbox.checked = this.conceptInstantiation[conceptName].isActive;
            
            activeCheckbox.addEventListener('change', () => {
                this.setConceptActive(conceptName, activeCheckbox.checked);
                this.updateExpressionResults();
            });
            
            activeCell.appendChild(activeCheckbox);
            conceptRow.appendChild(activeCell);
            
            // Create the value input cell
            const valueCell = document.createElement('div');
            valueCell.className = 'concept-column concept-value-column';
            
            const valueInput = document.createElement('input');
            valueInput.type = 'text';
            valueInput.className = 'concept-value-input';
            valueInput.value = this.conceptInstantiation[conceptName].value || '';
            
            valueInput.addEventListener('input', () => {
                this.setConceptValue(conceptName, valueInput.value);
                this.updateExpressionResults();
            });
            
            valueCell.appendChild(valueInput);
            conceptRow.appendChild(valueCell);
            
            conceptsTable.appendChild(conceptRow);
        });
        
        conceptsSection.appendChild(conceptsTable);
        conceptManagerUI.appendChild(conceptsSection);
        
        // Create the expressions section
        const expressionsSection = document.createElement('div');
        expressionsSection.className = 'expressions-section';
        
        // Create the section header
        const expressionsHeader = document.createElement('h3');
        expressionsHeader.textContent = 'Expressions';
        expressionsSection.appendChild(expressionsHeader);
        
        // Create the expressions list
        const expressionsList = document.createElement('div');
        expressionsList.className = 'expressions-list';
        expressionsList.id = 'expressions-list';
        
        // Add each expression to the list
        this.conceptExpressions.forEach((expr, index) => {
            if (!expr.expression) return;
            
            const expressionItem = document.createElement('div');
            expressionItem.className = 'expression-item';
            expressionItem.dataset.index = index;
            expressionItem.dataset.expressionText = expr.expression.toLowerCase();
            
            // Create the expression text
            const expressionText = document.createElement('div');
            expressionText.className = 'expression-text';
            expressionText.textContent = expr.expression;
            expressionItem.appendChild(expressionText);
            
            // Create the expression result
            const expressionResult = document.createElement('div');
            expressionResult.className = 'expression-result';
            expressionResult.textContent = 'Result: ';
            
            const resultValue = document.createElement('span');
            resultValue.className = 'result-value';
            resultValue.textContent = this.evaluateExpression(expr.expression);
            expressionResult.appendChild(resultValue);
            
            expressionItem.appendChild(expressionResult);
            expressionsList.appendChild(expressionItem);
        });
        
        expressionsSection.appendChild(expressionsList);
        conceptManagerUI.appendChild(expressionsSection);
        
        // Add the concept manager UI to the container
        container.appendChild(conceptManagerUI);
        
        // Add search functionality
        searchInput.addEventListener('input', () => {
            const searchTerm = searchInput.value.toLowerCase().trim();
            this.filterConceptsAndExpressions(searchTerm);
        });
    }

    /**
     * Updates the expression results in the UI
     */
    updateExpressionResults() {
        const expressionsList = document.getElementById('expressions-list');
        if (!expressionsList) return;
        
        // Update each expression result
        const expressionItems = expressionsList.querySelectorAll('.expression-item');
        expressionItems.forEach(item => {
            const index = parseInt(item.dataset.index);
            const expr = this.conceptExpressions[index];
            
            if (!expr || !expr.expression) return;
            
            const resultValue = item.querySelector('.result-value');
            if (resultValue) {
                resultValue.textContent = this.evaluateExpression(expr.expression);
                
                // Update the class based on the result
                resultValue.className = 'result-value';
                resultValue.classList.add(resultValue.textContent === 'true' ? 'result-true' : 'result-false');
            }
        });
    }

    /**
     * Filters concepts and expressions based on search term
     * @param {string} searchTerm - The search term to filter by
     */
    filterConceptsAndExpressions(searchTerm) {
        // Filter concepts
        const conceptRows = document.querySelectorAll('.concepts-table-row');
        let visibleConceptsCount = 0;
        
        conceptRows.forEach(row => {
            const conceptName = row.dataset.conceptName;
            const isVisible = !searchTerm || conceptName.includes(searchTerm);
            row.style.display = isVisible ? 'flex' : 'none';
            if (isVisible) visibleConceptsCount++;
        });
        
        // Filter expressions
        const expressionItems = document.querySelectorAll('.expression-item');
        let visibleExpressionsCount = 0;
        
        expressionItems.forEach(item => {
            const expressionText = item.dataset.expressionText;
            const isVisible = !searchTerm || expressionText.includes(searchTerm);
            item.style.display = isVisible ? 'block' : 'none';
            if (isVisible) visibleExpressionsCount++;
        });
        
        // Update summary
        const summaryInfo = document.querySelector('.concepts-summary');
        if (summaryInfo) {
            if (searchTerm) {
                summaryInfo.textContent = `Showing ${visibleConceptsCount} of ${this.distinctConcepts.length} Concepts | ${visibleExpressionsCount} of ${this.conceptExpressions.length} Expressions`;
            } else {
                summaryInfo.textContent = `Total Concepts: ${this.distinctConcepts.length} | Total Expressions: ${this.conceptExpressions.length}`;
            }
        }
        
        // Show/hide "no results" message for concepts
        let noConceptsMessage = document.querySelector('.no-concepts-message');
        if (visibleConceptsCount === 0) {
            if (!noConceptsMessage) {
                noConceptsMessage = document.createElement('div');
                noConceptsMessage.className = 'no-results-message no-concepts-message';
                noConceptsMessage.textContent = 'No matching concepts found';
                const conceptsTable = document.querySelector('.concepts-table');
                conceptsTable.parentNode.insertBefore(noConceptsMessage, conceptsTable.nextSibling);
            }
        } else if (noConceptsMessage) {
            noConceptsMessage.remove();
        }
        
        // Show/hide "no results" message for expressions
        let noExpressionsMessage = document.querySelector('.no-expressions-message');
        if (visibleExpressionsCount === 0) {
            if (!noExpressionsMessage) {
                noExpressionsMessage = document.createElement('div');
                noExpressionsMessage.className = 'no-results-message no-expressions-message';
                noExpressionsMessage.textContent = 'No matching expressions found';
                const expressionsList = document.querySelector('.expressions-list');
                expressionsList.parentNode.insertBefore(noExpressionsMessage, expressionsList.nextSibling);
            }
        } else if (noExpressionsMessage) {
            noExpressionsMessage.remove();
        }
    }

    /**
     * Gets all concepts with their values and active states
     * @returns {Object} - Object containing all concepts
     */
    getAllConcepts() {
        return this.conceptInstantiation;
    }
}

// Export the ConceptManager class
export default ConceptManager; 