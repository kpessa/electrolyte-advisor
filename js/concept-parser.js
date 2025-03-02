/**
 * Concept Parser Utility
 * 
 * This utility parses concept expressions from the configuration file.
 * It extracts concepts between brackets and provides functionality to
 * instantiate and manage these concepts.
 */

// Regular expressions for matching concept patterns
const CONCEPT_REGEX = /\{([^{}]+)\}/g;
const CONCEPT_EXPRESSION_REGEX = /\[\%\{.*?\}\%\]/g;
const AT_CONCEPT_REGEX = /@concept\{([^{}]+)\}/g;

/**
 * Extracts all concepts from a concept expression string
 * @param {string} expression - The concept expression string
 * @returns {string[]} - Array of extracted concept names
 */
function extractConcepts(expression) {
    const concepts = [];
    let match;
    
    while ((match = CONCEPT_REGEX.exec(expression)) !== null) {
        // Extract the concept name, removing any additional properties
        const conceptName = match[1].split('.')[0];
        concepts.push(conceptName);
    }
    
    return concepts;
}

/**
 * Parses a configuration object to find all conceptExpression fields
 * and extracts the concepts from them
 * @param {Object} config - The configuration object
 * @returns {Object} - Object containing all found concept expressions and their concepts
 */
function parseConfigForConceptExpressions(config) {
    const result = {
        conceptExpressions: [],
        distinctConcepts: new Set()
    };
    
    // Helper function to recursively search for concept expressions
    function searchObject(obj, path = '') {
        if (!obj || typeof obj !== 'object') return;
        
        // Check if this is a conceptExpression field
        if (obj.ui && obj.ui.type === 'conceptExpression') {
            result.conceptExpressions.push({
                path,
                field: obj
            });
        }
        
        // Check if this is a CONCEPT_NAME field with a concept expression
        if (obj.CONCEPT_NAME && typeof obj.CONCEPT_NAME === 'string') {
            const conceptExpression = obj.CONCEPT_NAME;
            if (CONCEPT_EXPRESSION_REGEX.test(conceptExpression)) {
                // Reset the regex lastIndex
                CONCEPT_EXPRESSION_REGEX.lastIndex = 0;
                CONCEPT_REGEX.lastIndex = 0;
                
                // Extract concepts
                const concepts = extractConcepts(conceptExpression);
                concepts.forEach(concept => result.distinctConcepts.add(concept));
                
                result.conceptExpressions.push({
                    path: path + '.CONCEPT_NAME',
                    expression: conceptExpression,
                    concepts
                });
            }
        }
        
        // Check if this is a DISPLAY field with @concept syntax
        if (obj.DISPLAY && typeof obj.DISPLAY === 'string') {
            const display = obj.DISPLAY;
            if (AT_CONCEPT_REGEX.test(display)) {
                // Reset the regex lastIndex
                AT_CONCEPT_REGEX.lastIndex = 0;
                
                let match;
                while ((match = AT_CONCEPT_REGEX.exec(display)) !== null) {
                    const conceptWithProperty = match[1];
                    const conceptName = conceptWithProperty.split('.')[0];
                    result.distinctConcepts.add(conceptName);
                }
            }
        }
        
        // Check if this is a FLAG_ON_CONCEPT field
        if (obj.FLAG_ON_CONCEPT && typeof obj.FLAG_ON_CONCEPT === 'string') {
            const flagConcept = obj.FLAG_ON_CONCEPT;
            if (CONCEPT_EXPRESSION_REGEX.test(flagConcept)) {
                // Reset the regex lastIndex
                CONCEPT_EXPRESSION_REGEX.lastIndex = 0;
                CONCEPT_REGEX.lastIndex = 0;
                
                // Extract concepts
                const concepts = extractConcepts(flagConcept);
                concepts.forEach(concept => result.distinctConcepts.add(concept));
                
                result.conceptExpressions.push({
                    path: path + '.FLAG_ON_CONCEPT',
                    expression: flagConcept,
                    concepts
                });
            }
        }
        
        // Recursively search nested objects and arrays
        for (const key in obj) {
            const newPath = path ? `${path}.${key}` : key;
            
            if (Array.isArray(obj[key])) {
                obj[key].forEach((item, index) => {
                    searchObject(item, `${newPath}[${index}]`);
                });
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                searchObject(obj[key], newPath);
            }
        }
    }
    
    searchObject(config);
    
    // Convert Set to Array for the final result
    result.distinctConcepts = Array.from(result.distinctConcepts);
    
    return result;
}

/**
 * Creates a concept instantiation object with default values
 * @param {string[]} concepts - Array of concept names
 * @returns {Object} - Object with concept names as keys and default values
 */
function createConceptInstantiation(concepts) {
    const instantiation = {};
    
    concepts.forEach(concept => {
        instantiation[concept] = {
            value: null,
            isActive: false
        };
    });
    
    return instantiation;
}

/**
 * Evaluates a concept expression with the given concept values
 * @param {string} expression - The concept expression to evaluate
 * @param {Object} conceptValues - Object containing concept values
 * @returns {boolean} - Result of the evaluation
 */
function evaluateConceptExpression(expression, conceptValues) {
    // Handle simple true/false expressions directly
    if (expression === '[%true%]') return true;
    if (expression === '[%false%]') return false;
    
    // Remove the [% and %] wrapper
    let expr = expression.replace(/^\[\%/, '').replace(/\%\]$/, '');
    
    // Check if the expression is just a simple true/false string
    if (expr === 'true') return true;
    if (expr === 'false') return false;
    
    // Replace concept references with their values
    expr = expr.replace(CONCEPT_REGEX, (match, conceptName) => {
        const parts = conceptName.split('.');
        const concept = parts[0];
        
        if (!conceptValues[concept]) {
            // If concept doesn't exist, return string 'false' for the expression evaluation
            return 'false';
        }
        
        if (parts.length > 1 && parts[1] === 'value') {
            return JSON.stringify(conceptValues[concept].value);
        }
        
        if (parts.length > 1 && parts[1] === 'COUNT') {
            // Handle COUNT property - for simplicity, return 1 if concept is active
            return conceptValues[concept].isActive ? '1' : '0';
        }
        
        // Return string 'true' or 'false' for the expression evaluation
        return conceptValues[concept].isActive ? 'true' : 'false';
    });
    
    // Replace logical operators - handle NOT with or without spaces
    expr = expr.replace(/\bAND\b/g, '&&');
    expr = expr.replace(/\bOR\b/g, '||');
    expr = expr.replace(/\bNOT\b/g, '!');
    
    // Handle equality operators - replace single equals with double equals for comparison
    // But be careful not to replace equals that are already part of ==, ===, !=, !==
    expr = expr.replace(/([^=!><])=([^=])/g, '$1==$2');
    
    try {
        // Use Function constructor to evaluate the expression
        // Note: This is generally not recommended for security reasons in production
        // but is used here for demonstration purposes
        return new Function('return ' + expr)();
    } catch (error) {
        console.error('Error evaluating concept expression:', error, 'Expression:', expr);
        // Log more details to help with debugging
        console.log('Original expression:', expression);
        console.log('Processed expression:', expr);
        console.log('Concept values:', conceptValues);
        return false;
    }
}

// Export the functions for use in other modules
export {
    extractConcepts,
    parseConfigForConceptExpressions,
    createConceptInstantiation,
    evaluateConceptExpression
}; 