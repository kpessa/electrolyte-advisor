/**
 * ConceptStateDisplay
 * 
 * A component to display the global concept state in a floating panel
 */
import conceptStateManager from './concept-state-manager.js';

class ConceptStateDisplay {
    constructor() {
        this.container = null;
        this.isVisible = false;
        this.filterText = '';
        
        // Bind methods
        this.toggle = this.toggle.bind(this);
        this.updateDisplay = this.updateDisplay.bind(this);
        this.handleFilterChange = this.handleFilterChange.bind(this);
        
        // Initialize the display
        this.initialize();
    }
    
    initialize() {
        // Create the container
        this.container = document.createElement('div');
        this.container.className = 'concept-state-display';
        this.container.style.display = 'none';
        
        // Create the header
        const header = document.createElement('div');
        header.className = 'concept-state-display-header';
        
        const title = document.createElement('h3');
        title.textContent = 'Global Concept State';
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'concept-state-display-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.addEventListener('click', this.toggle);
        
        header.appendChild(title);
        header.appendChild(closeBtn);
        
        // Create the filter input
        const filterContainer = document.createElement('div');
        filterContainer.className = 'concept-state-filter-container';
        
        const filterInput = document.createElement('input');
        filterInput.type = 'text';
        filterInput.placeholder = 'Filter concepts...';
        filterInput.className = 'concept-state-filter';
        filterInput.addEventListener('input', this.handleFilterChange);
        
        filterContainer.appendChild(filterInput);
        
        // Create the content area
        const content = document.createElement('div');
        content.className = 'concept-state-display-content';
        
        // Add components to the container
        this.container.appendChild(header);
        this.container.appendChild(filterContainer);
        this.container.appendChild(content);
        
        // Add to the document
        document.body.appendChild(this.container);
        
        // Add listener for concept state changes
        conceptStateManager.addListener(() => {
            this.updateDisplay();
        });
        
        // Create toggle button
        this.createToggleButton();
        
        console.log('Concept state display initialized');
    }
    
    createToggleButton() {
        const button = document.createElement('button');
        button.className = 'concept-state-display-toggle';
        button.textContent = '🔍 Concept State';
        button.addEventListener('click', this.toggle);
        
        // Add to the document
        document.body.appendChild(button);
    }
    
    toggle() {
        this.isVisible = !this.isVisible;
        this.container.style.display = this.isVisible ? 'flex' : 'none';
        
        if (this.isVisible) {
            this.updateDisplay();
        }
    }
    
    handleFilterChange(event) {
        this.filterText = event.target.value.toLowerCase();
        this.updateDisplay();
    }
    
    updateDisplay() {
        if (!this.isVisible) return;
        
        const content = this.container.querySelector('.concept-state-display-content');
        content.innerHTML = '';
        
        const allConcepts = conceptStateManager.getAllConcepts();
        const conceptNames = Object.keys(allConcepts).sort();
        
        if (conceptNames.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'concept-state-empty';
            emptyMessage.textContent = 'No concepts defined yet.';
            content.appendChild(emptyMessage);
            return;
        }
        
        // Filter concepts based on search text
        const filteredConcepts = this.filterText 
            ? conceptNames.filter(name => name.toLowerCase().includes(this.filterText))
            : conceptNames;
        
        if (filteredConcepts.length === 0) {
            const noMatchMessage = document.createElement('div');
            noMatchMessage.className = 'concept-state-empty';
            noMatchMessage.textContent = 'No matching concepts found.';
            content.appendChild(noMatchMessage);
            return;
        }
        
        // Create table
        const table = document.createElement('table');
        table.className = 'concept-state-table';
        
        // Create header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        const nameHeader = document.createElement('th');
        nameHeader.textContent = 'Concept';
        
        const valueHeader = document.createElement('th');
        valueHeader.textContent = 'Value';
        
        const stateHeader = document.createElement('th');
        stateHeader.textContent = 'State';
        
        const actionsHeader = document.createElement('th');
        actionsHeader.textContent = 'Actions';
        
        headerRow.appendChild(nameHeader);
        headerRow.appendChild(valueHeader);
        headerRow.appendChild(stateHeader);
        headerRow.appendChild(actionsHeader);
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Create table body
        const tbody = document.createElement('tbody');
        
        filteredConcepts.forEach(conceptName => {
            const concept = allConcepts[conceptName];
            const row = document.createElement('tr');
            
            // Concept name cell
            const nameCell = document.createElement('td');
            nameCell.className = 'concept-state-name';
            nameCell.textContent = conceptName;
            
            // Value cell
            const valueCell = document.createElement('td');
            valueCell.className = 'concept-state-value';
            valueCell.textContent = this.formatValue(concept.value);
            
            // State cell
            const stateCell = document.createElement('td');
            stateCell.className = 'concept-state-state';
            stateCell.textContent = this.formatState(concept.state);
            stateCell.classList.add(this.getStateClass(concept.state));
            
            // Actions cell
            const actionsCell = document.createElement('td');
            actionsCell.className = 'concept-state-actions';
            
            // Reset button
            const resetBtn = document.createElement('button');
            resetBtn.className = 'concept-state-reset-btn';
            resetBtn.textContent = 'Reset';
            resetBtn.addEventListener('click', () => {
                conceptStateManager.resetConcept(conceptName);
            });
            
            actionsCell.appendChild(resetBtn);
            
            // Add cells to row
            row.appendChild(nameCell);
            row.appendChild(valueCell);
            row.appendChild(stateCell);
            row.appendChild(actionsCell);
            
            // Add row to table body
            tbody.appendChild(row);
        });
        
        table.appendChild(tbody);
        content.appendChild(table);
    }
    
    formatValue(value) {
        if (value === undefined || value === null) {
            return 'undefined';
        }
        
        if (typeof value === 'object') {
            return JSON.stringify(value);
        }
        
        return String(value);
    }
    
    formatState(state) {
        if (state === true) {
            return 'true';
        }
        
        if (state === false) {
            return 'false';
        }
        
        return 'undefined';
    }
    
    getStateClass(state) {
        if (state === true) {
            return 'state-true';
        }
        
        if (state === false) {
            return 'state-false';
        }
        
        return 'state-undefined';
    }
}

// Create and export a singleton instance
const conceptStateDisplay = new ConceptStateDisplay();
export default conceptStateDisplay; 