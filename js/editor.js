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
        
        // Make the editor instance accessible globally
        window.fullScreenEditor = editor;
        
        // Listen for config changes from mini-editors
        document.addEventListener('configChanged', function(event) {
            if (event.detail && event.detail.config) {
                // Update the editor's content with the new config
                editorDefaultConfig = JSON.parse(JSON.stringify(event.detail.config));
                
                // Only update the editor content if it's currently visible
                if ($('.editor-container').hasClass('active')) {
                    try {
                        const configString = JSON.stringify(event.detail.config, null, 2);
                        editor.setValue(configString);
                        
                        // Apply custom highlighting after the editor content is set
                        setTimeout(() => applyCustomHighlighting(editor), 100);
                    } catch (e) {
                        console.error("Error updating editor content:", e);
                    }
                }
            }
        });
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
            });
        } catch (e) {
            console.error("Error applying custom highlighting:", e);
        }
    }
    
    // Helper function to find the end of a string
    function findStringEnd(line, startPos) {
        let pos = startPos;
        let inEscape = false;
        
        while (pos < line.length) {
            const char = line[pos];
            if (char === '\\') {
                inEscape = !inEscape;
            } else {
                if (char === '"' && !inEscape) {
                    return pos + 1;
                }
                inEscape = false;
            }
            pos++;
        }
        
        return startPos; // If no end found, return the start position
    }
    
    // Helper function to highlight patterns in strings
    function highlightInString(text, pattern, className, startOffset, lineIndex, editorInstance) {
        let match;
        while ((match = pattern.exec(text)) !== null) {
            editorInstance.markText(
                {line: lineIndex, ch: startOffset + match.index},
                {line: lineIndex, ch: startOffset + match.index + match[0].length},
                {className: `cm-${className}`}
            );
        }
    }
    
    // Helper function to highlight HTML in strings
    function highlightHtmlInString(text, startOffset, lineIndex, editorInstance) {
        // Highlight HTML tags
        const tagPattern = /<\/?[a-zA-Z][^>]*>/g;
        let match;
        
        while ((match = tagPattern.exec(text)) !== null) {
            const tagText = match[0];
            const tagStart = match.index;
            const tagEnd = tagStart + tagText.length;
            
            // Highlight the entire tag
            editorInstance.markText(
                {line: lineIndex, ch: startOffset + tagStart},
                {line: lineIndex, ch: startOffset + tagEnd},
                {className: "cm-html-tag"}
            );
            
            // Highlight attributes within the tag
            const attrPattern = /([a-zA-Z-]+)=["']([^"']*)["']/g;
            let attrMatch;
            
            while ((attrMatch = attrPattern.exec(tagText)) !== null) {
                // Attribute name
                editorInstance.markText(
                    {line: lineIndex, ch: startOffset + tagStart + attrMatch.index},
                    {line: lineIndex, ch: startOffset + tagStart + attrMatch.index + attrMatch[1].length},
                    {className: "cm-html-attribute"}
                );
                
                // Attribute value
                const valueStart = attrMatch.index + attrMatch[1].length + 2; // +2 for = and quote
                editorInstance.markText(
                    {line: lineIndex, ch: startOffset + tagStart + valueStart},
                    {line: lineIndex, ch: startOffset + tagStart + valueStart + attrMatch[2].length},
                    {className: "cm-html-string"}
                );
            }
        }
    }
    
    // Toggle editor visibility
    function toggleEditor() {
        const editorContainer = $('.editor-container');
        const appContainer = $('.app-container');
        const toggleButton = $('#toggle-editor-btn');
        const navbar = $('.navbar');
        
        if (editorContainer.hasClass('active')) {
            // Hide editor
            editorContainer.removeClass('active');
            appContainer.removeClass('inactive');
            toggleButton.text('Edit Configuration');
            
            // Update navbar button if it exists
            $('#navbar-edit-config-btn').html('📝 Edit Config');
            
            // Show navbar
            navbar.show();
            
            // If there are any changes, ask if the user wants to save
            const currentConfig = editor.getValue();
            const defaultConfig = JSON.stringify(editorDefaultConfig, null, 2);
            
            if (currentConfig !== defaultConfig) {
                if (confirm('You have unsaved changes. Do you want to save them before closing?')) {
                    saveConfig();
                }
            }
        } else {
            // Show editor
            editorContainer.addClass('active');
            appContainer.addClass('inactive');
            toggleButton.text('Close Editor');
            
            // Update navbar button if it exists
            $('#navbar-edit-config-btn').html('📝 Close Editor');
            
            // Hide navbar
            navbar.hide();
            
            // Load the latest configuration from window.currentConfig
            if (window.currentConfig) {
                try {
                    const configString = JSON.stringify(window.currentConfig, null, 2);
                    editor.setValue(configString);
                    
                    // Update editorDefaultConfig to match window.currentConfig
                    editorDefaultConfig = JSON.parse(JSON.stringify(window.currentConfig));
                    
                    // Apply custom highlighting after the editor content is set
                    setTimeout(() => applyCustomHighlighting(editor), 100);
                } catch (e) {
                    console.error("Error loading current configuration:", e);
                    alert('Failed to load configuration. Please check the console for details.');
                }
            }
            
            // Refresh the editor to ensure proper rendering
            setTimeout(() => {
                editor.refresh();
            }, 300); // Wait for the transition to complete
        }
    }
    
    // Expose toggleEditor globally
    window.toggleEditor = toggleEditor;
    
    // Save and apply the configuration
    function saveConfig() {
        try {
            // Get the editor content
            const configString = editor.getValue();
            
            // Parse the JSON to validate it
            const config = JSON.parse(configString);
            
            // Here you would typically send the config to the server
            // For this example, we'll just update the default config
            editorDefaultConfig = config;
            
            // Update the window.currentConfig to ensure changes are reflected in the app
            window.currentConfig = JSON.parse(JSON.stringify(config));
            
            // Apply the configuration to the application by reinitializing the advisor
            if (window.initializeAdvisor) {
                window.initializeAdvisor(window.currentConfig);
            }
            
            // Apply the configuration to the application
            // This would typically trigger a reload or update of the application
            alert('Configuration saved and applied successfully!');
            
            // Reinitialize the concept manager without opening it
            if (window.conceptIntegration) {
                window.conceptIntegration.initialize().catch(error => {
                    console.error('Failed to reinitialize concept manager:', error);
                });
            }
            
            // Hide the editor
            toggleEditor();
        } catch (e) {
            alert(`Error saving configuration: ${e.message}`);
        }
    }
    
    // Reset the configuration to default
    function resetConfig() {
        if (confirm('Are you sure you want to reset the configuration to default? All changes will be lost.')) {
            // Reset the editor content to the default configuration
            try {
                const configString = JSON.stringify(editorDefaultConfig, null, 2);
                editor.setValue(configString);
                
                // Apply custom highlighting after the editor content is set
                setTimeout(() => applyCustomHighlighting(editor), 100);
                
                alert('Configuration reset to default.');
            } catch (e) {
                alert(`Error resetting configuration: ${e.message}`);
            }
        }
    }
    
    // Initialize the editor
    initializeEditor();
    
    // Set up event handlers
    $('#toggle-editor-btn').on('click', toggleEditor);
    $('#save-config-btn').on('click', saveConfig);
    $('#reset-config-btn').on('click', resetConfig);
    $('#close-editor-btn').on('click', toggleEditor);
    
    // Make sure the editor container is not active initially
    $('.editor-container').removeClass('active');
    $('.app-container').removeClass('inactive');
}); 