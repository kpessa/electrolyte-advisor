// Initialize the editor functionality
$(document).ready(function() {
    // Global variables
    let editor;
    let editorDefaultConfig = null;
    
    // Initialize CodeMirror editor
    function initializeEditor() {
        // Add custom CSS for enhanced highlighting
        const customCSS = `
            /* Custom markers for content inside strings */
            .cm-json-key { color: #f07178; font-weight: bold; }
            .cm-json-value { color: #c3e88d; }
            .cm-json-string-value { color: #c3e88d; }
            .cm-json-number-value { color: #f78c6c; }
            .cm-json-boolean-value { color: #89ddff; }
            .cm-json-null-value { color: #c792ea; }
            
            /* Operators and keywords in strings */
            .cm-highlight-operator { color: #89ddff !important; font-weight: bold !important; }
            .cm-highlight-keyword { color: #c792ea !important; font-weight: bold !important; }
            .cm-highlight-number { color: #f78c6c !important; }
            .cm-highlight-bracket { color: #ffcb6b !important; font-weight: bold !important; }
            
            /* HTML in strings */
            .cm-html-tag { color: #f07178 !important; }
            .cm-html-attribute { color: #ffcb6b !important; }
            .cm-html-string { color: #c3e88d !important; }
            .cm-html-content { color: #eeffff !important; }
            
            /* Mini-editor specific styles */
            .mini-editor-container {
                border: 1px solid #464b5d;
                border-radius: 4px;
                overflow: hidden;
                background: #0f111a;
                box-shadow: 0 4px 8px rgba(0,0,0,0.3);
                margin: 10px 0;
            }
            
            .mini-editor-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 12px;
                background: #1a1c25;
                color: #eeffff;
                font-size: 14px;
                border-bottom: 1px solid #464b5d;
            }
            
            .mini-editor-actions button {
                margin-left: 8px;
                padding: 4px 10px;
                background: #464b5d;
                color: #eeffff;
                border: none;
                border-radius: 3px;
                cursor: pointer;
                font-size: 12px;
                transition: background-color 0.2s;
            }
            
            .mini-editor-actions button:hover {
                background: #5a5f73;
            }
            
            .mini-editor-save {
                background: #c3e88d !important;
                color: #0f111a !important;
            }
            
            .mini-editor-save:hover {
                background: #a5d672 !important;
            }
            
            .mini-editor-cancel {
                background: #f07178 !important;
                color: #0f111a !important;
            }
            
            .mini-editor-cancel:hover {
                background: #e25f67 !important;
            }
            
            .mini-editor-content .CodeMirror {
                height: 200px;
                font-size: 12px;
            }
        `;
        
        // Add the custom CSS to the document
        $('<style>').text(customCSS).appendTo('head');
        
        // Initialize CodeMirror with standard JSON mode
        editor = CodeMirror.fromTextArea(document.getElementById("config-editor"), {
            mode: { name: "javascript", json: true },
            theme: "material-ocean",
            lineNumbers: true,
            matchBrackets: true,
            autoCloseBrackets: true,
            foldGutter: true,
            gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
            indentUnit: 2,
            tabSize: 2,
            lineWrapping: true,
            extraKeys: {
                "Ctrl-Space": "autocomplete",
                "Ctrl-Q": function(cm) {
                    cm.foldCode(cm.getCursor());
                },
                "Ctrl-S": function(cm) {
                    // Prevent the browser's save dialog
                    event.preventDefault();
                    // Save and apply the configuration
                    saveConfig();
                    return false;
                }
            }
        });
        
        // Set editor size to fill container
        editor.setSize("100%", "100%");
        
        // Load the configuration directly
        loadConfigDirectly();
    }
    
    // Load the configuration file directly
    function loadConfigDirectly() {
        $.getJSON('config/config.json', function(config) {
            editorDefaultConfig = config;
            
            // Set the editor content
            try {
                const configString = JSON.stringify(config, null, 2);
                editor.setValue(configString);
                
                // Apply custom highlighting after the editor content is set
                setTimeout(() => applyCustomHighlighting(editor), 100);
            } catch (e) {
                console.error("Error setting editor value:", e);
                editor.setValue("{}");
            }
        }).fail(function(jqxhr, textStatus, error) {
            console.error("Failed to load configuration:", textStatus, error);
            editor.setValue("{}");
        });
    }
    
    // Apply custom highlighting to string content
    function applyCustomHighlighting(editorInstance) {
        try {
            // Clear any existing marks
            editorInstance.getAllMarks().forEach(mark => mark.clear());
            
            // Get the document content
            const content = editorInstance.getValue();
            
            // Parse the JSON to understand the structure
            let jsonObj;
            try {
                jsonObj = JSON.parse(content);
            } catch (e) {
                // If JSON is invalid, just return without highlighting
                return;
            }
            
            // Process the document line by line
            const lines = content.split('\n');
            lines.forEach((line, lineIndex) => {
                // Check if this line contains a key
                const keyMatch = line.match(/^\s*"([^"]+)"\s*:/);
                if (keyMatch) {
                    const keyStart = line.indexOf('"');
                    const keyEnd = line.indexOf('"', keyStart + 1);
                    
                    // Highlight the key
                    editorInstance.markText(
                        {line: lineIndex, ch: keyStart},
                        {line: lineIndex, ch: keyEnd + 1},
                        {className: "cm-json-key"}
                    );
                    
                    // Check if there's a value on this line
                    const valueStart = line.indexOf(':', keyEnd) + 1;
                    if (valueStart > 0) {
                        // Skip whitespace
                        let actualValueStart = valueStart;
                        while (actualValueStart < line.length && /\s/.test(line[actualValueStart])) {
                            actualValueStart++;
                        }
                        
                        // If there's a value, highlight it based on type
                        if (actualValueStart < line.length) {
                            const restOfLine = line.substring(actualValueStart).trim();
                            
                            // Check for string values
                            if (restOfLine.startsWith('"')) {
                                const stringEnd = findStringEnd(line, actualValueStart);
                                if (stringEnd > actualValueStart) {
                                    // Extract the string content without quotes
                                    const stringContent = line.substring(actualValueStart + 1, stringEnd - 1);
                                    
                                    // Highlight the entire string
                                    editorInstance.markText(
                                        {line: lineIndex, ch: actualValueStart},
                                        {line: lineIndex, ch: stringEnd},
                                        {className: "cm-json-string-value"}
                                    );
                                    
                                    // Check for HTML content
                                    if (stringContent.includes('<') && stringContent.includes('>')) {
                                        highlightHtmlInString(stringContent, actualValueStart + 1, lineIndex, editorInstance);
                                    }
                                    
                                    // Check for operators
                                    highlightInString(stringContent, /([<>]=?|==|!=|<=|>=|=)/g, "highlight-operator", actualValueStart + 1, lineIndex, editorInstance);
                                    
                                    // Check for keywords
                                    highlightInString(stringContent, /\b(AND|OR)\b/g, "highlight-keyword", actualValueStart + 1, lineIndex, editorInstance);
                                    
                                    // Check for numbers
                                    highlightInString(stringContent, /\b(\d+)\b/g, "highlight-number", actualValueStart + 1, lineIndex, editorInstance);
                                    
                                    // Check for brackets
                                    highlightInString(stringContent, /(\{|\})/g, "highlight-bracket", actualValueStart + 1, lineIndex, editorInstance);
                                }
                            }
                            // Check for number values
                            else if (/^-?\d+(\.\d+)?/.test(restOfLine)) {
                                const match = restOfLine.match(/^-?\d+(\.\d+)?/);
                                if (match) {
                                    editorInstance.markText(
                                        {line: lineIndex, ch: actualValueStart},
                                        {line: lineIndex, ch: actualValueStart + match[0].length},
                                        {className: "cm-json-number-value"}
                                    );
                                }
                            }
                            // Check for boolean values
                            else if (restOfLine.startsWith('true') || restOfLine.startsWith('false')) {
                                const boolLength = restOfLine.startsWith('true') ? 4 : 5;
                                editorInstance.markText(
                                    {line: lineIndex, ch: actualValueStart},
                                    {line: lineIndex, ch: actualValueStart + boolLength},
                                    {className: "cm-json-boolean-value"}
                                );
                            }
                            // Check for null values
                            else if (restOfLine.startsWith('null')) {
                                editorInstance.markText(
                                    {line: lineIndex, ch: actualValueStart},
                                    {line: lineIndex, ch: actualValueStart + 4},
                                    {className: "cm-json-null-value"}
                                );
                            }
                        }
                    }
                }
                
                // Also check for string values that might not be directly after a key
                const stringRegex = /"([^"\\]*(\\.[^"\\]*)*)"/g;
                let match;
                while ((match = stringRegex.exec(line)) !== null) {
                    // Skip if this is a key (keys are followed by a colon)
                    const afterString = line.substring(match.index + match[0].length).trim();
                    if (afterString.startsWith(':')) {
                        continue;
                    }
                    
                    const stringContent = match[1];
                    const startPos = match.index + 1; // +1 to skip the opening quote
                    
                    // Check for HTML content
                    if (stringContent.includes('<') && stringContent.includes('>')) {
                        highlightHtmlInString(stringContent, startPos, lineIndex, editorInstance);
                    }
                    
                    // Check for operators
                    highlightInString(stringContent, /([<>]=?|==|!=|<=|>=|=)/g, "highlight-operator", startPos, lineIndex, editorInstance);
                    
                    // Check for keywords
                    highlightInString(stringContent, /\b(AND|OR)\b/g, "highlight-keyword", startPos, lineIndex, editorInstance);
                    
                    // Check for numbers
                    highlightInString(stringContent, /\b(\d+)\b/g, "highlight-number", startPos, lineIndex, editorInstance);
                    
                    // Check for brackets
                    highlightInString(stringContent, /(\{|\})/g, "highlight-bracket", startPos, lineIndex, editorInstance);
                }
            });
        } catch (e) {
            console.error("Error in custom highlighting:", e);
        }
    }
    
    // Helper function to find the end of a string
    function findStringEnd(line, startPos) {
        let inEscape = false;
        for (let i = startPos + 1; i < line.length; i++) {
            if (inEscape) {
                inEscape = false;
            } else if (line[i] === '\\') {
                inEscape = true;
            } else if (line[i] === '"') {
                return i + 1;
            }
        }
        return line.length;
    }
    
    // Helper function to highlight patterns within strings
    function highlightInString(text, pattern, className, startOffset, lineIndex, editorInstance) {
        let match;
        pattern.lastIndex = 0; // Reset regex
        
        while ((match = pattern.exec(text)) !== null) {
            const start = { line: lineIndex, ch: startOffset + match.index };
            const end = { line: lineIndex, ch: startOffset + match.index + match[0].length };
            
            editorInstance.markText(start, end, { className: "cm-" + className });
        }
    }
    
    // Helper function to highlight HTML in strings
    function highlightHtmlInString(text, startOffset, lineIndex, editorInstance) {
        // Highlight HTML tags
        const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)[^>]*>/g;
        let match;
        
        while ((match = tagRegex.exec(text)) !== null) {
            const tagStart = { line: lineIndex, ch: startOffset + match.index };
            const tagEnd = { line: lineIndex, ch: startOffset + match.index + match[0].length };
            
            editorInstance.markText(tagStart, tagEnd, { className: "cm-html-tag" });
            
            // Highlight attributes within the tag
            const tagContent = match[0];
            const attrRegex = /([a-zA-Z][a-zA-Z0-9-]*)=["']([^"']*)["']/g;
            let attrMatch;
            
            while ((attrMatch = attrRegex.exec(tagContent)) !== null) {
                // Highlight attribute name
                const attrNameStart = { line: lineIndex, ch: startOffset + match.index + attrMatch.index };
                const attrNameEnd = { line: lineIndex, ch: startOffset + match.index + attrMatch.index + attrMatch[1].length };
                
                editorInstance.markText(attrNameStart, attrNameEnd, { className: "cm-html-attribute" });
                
                // Highlight attribute value
                const valueStart = { line: lineIndex, ch: startOffset + match.index + attrMatch.index + attrMatch[1].length + 2 }; // +2 for = and quote
                const valueEnd = { line: lineIndex, ch: startOffset + match.index + attrMatch.index + attrMatch[0].length - 1 }; // -1 for closing quote
                
                editorInstance.markText(valueStart, valueEnd, { className: "cm-html-string" });
            }
        }
        
        // Highlight content between tags
        const contentRegex = />([^<]+)</g;
        while ((match = contentRegex.exec(text)) !== null) {
            const contentStart = { line: lineIndex, ch: startOffset + match.index + 1 }; // +1 for >
            const contentEnd = { line: lineIndex, ch: startOffset + match.index + 1 + match[1].length };
            
            editorInstance.markText(contentStart, contentEnd, { className: "cm-html-content" });
        }
    }
    
    // Toggle between editor and advisor views
    function toggleEditor() {
        const editorContainer = $('.editor-container');
        const appContainer = $('.app-container');
        
        if (editorContainer.hasClass('active')) {
            editorContainer.removeClass('active');
            appContainer.removeClass('inactive');
        } else {
            editorContainer.addClass('active');
            appContainer.addClass('inactive');
            
            // Make sure the editor content is up to date
            if (window.currentConfig) {
                try {
                    const configString = JSON.stringify(window.currentConfig, null, 2);
                    editor.setValue(configString);
                    
                    // Apply custom highlighting after the editor content is set
                    setTimeout(() => applyCustomHighlighting(editor), 100);
                } catch (e) {
                    console.error("Error using window.currentConfig:", e);
                    
                    // Fall back to our local copy
                    if (editorDefaultConfig) {
                        editor.setValue(JSON.stringify(editorDefaultConfig, null, 2));
                        setTimeout(() => applyCustomHighlighting(editor), 100);
                    } else {
                        editor.setValue("{}");
                    }
                }
            } else if (editorDefaultConfig) {
                editor.setValue(JSON.stringify(editorDefaultConfig, null, 2));
                setTimeout(() => applyCustomHighlighting(editor), 100);
            } else {
                editor.setValue("{}");
            }
        }
    }
    
    // Save the edited configuration and apply it
    function saveConfig() {
        try {
            // Get the editor content
            const editorContent = editor.getValue();
            
            // Parse the JSON to validate it
            const newConfig = JSON.parse(editorContent);
            
            // Update the current configuration
            window.currentConfig = newConfig;
            
            // Also update our local copy
            editorDefaultConfig = JSON.parse(JSON.stringify(newConfig));
            
            // Reinitialize the advisor with the new configuration
            if (typeof window.initializeAdvisor === 'function') {
                window.initializeAdvisor(newConfig);
                
                // Switch back to the advisor view
                toggleEditor();
                
                // Show success message
                alert("Configuration updated successfully!");
            } else {
                console.error("initializeAdvisor function not found");
                alert("Error: initializeAdvisor function not found");
            }
        } catch (e) {
            // Show error message
            console.error("Error in saveConfig:", e);
            alert("Error parsing JSON: " + e.message);
        }
    }
    
    // Reset to the default configuration
    function resetConfig() {
        if (confirm("Are you sure you want to reset to the default configuration?")) {
            if (window.defaultConfig) {
                // Reset the editor content
                try {
                    const configString = JSON.stringify(window.defaultConfig, null, 2);
                    editor.setValue(configString);
                    setTimeout(() => applyCustomHighlighting(editor), 100);
                    
                    // Reset the current configuration
                    window.currentConfig = JSON.parse(JSON.stringify(window.defaultConfig));
                    
                    // Reinitialize the advisor
                    if (typeof window.initializeAdvisor === 'function') {
                        window.initializeAdvisor(window.currentConfig);
                        
                        // Show success message
                        alert("Configuration reset to default!");
                    } else {
                        console.error("initializeAdvisor function not found");
                        alert("Error: initializeAdvisor function not found");
                    }
                } catch (e) {
                    console.error("Error resetting editor value:", e);
                }
            } else {
                console.error("Default configuration not available");
                alert("Error: Default configuration not available");
            }
        }
    }
    
    // Initialize the editor
    initializeEditor();
    
    // Set up event handlers
    $('#toggle-editor-btn').click(function() {
        toggleEditor();
    });
    
    $('#close-editor-btn').click(function() {
        toggleEditor();
    });
    
    $('#save-config-btn').click(function() {
        saveConfig();
    });
    
    $('#reset-config-btn').click(function() {
        resetConfig();
    });
    
    // Add change handler to reapply highlighting when content changes
    editor.on("change", function() {
        // Use setTimeout to avoid applying during the change operation
        clearTimeout(editor.highlightTimeout);
        editor.highlightTimeout = setTimeout(() => applyCustomHighlighting(editor), 500);
    });
    
    // Add global keyboard shortcut for Ctrl+S when in editor mode
    $(document).keydown(function(e) {
        // Check if the editor is active
        if ($('.editor-container').hasClass('active')) {
            // Check for Ctrl+S (keyCode 83)
            if (e.ctrlKey && e.keyCode === 83) {
                // Prevent the browser's save dialog
                e.preventDefault();
                // Save and apply the configuration
                saveConfig();
                return false;
            }
        }
    });
    
    // Export functions for use in mini-editor
    window.jsonEditorHelpers = {
        applyCustomHighlighting,
        findStringEnd,
        highlightInString,
        highlightHtmlInString
    };
}); 