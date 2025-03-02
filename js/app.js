// Initialize the application
$(document).ready(function() {
    // Import the concept integration module
    import('./concept-integration.js')
        .then(module => {
            const conceptIntegration = module.default;
            
            // Initialize the concept manager
            conceptIntegration.initialize().then(() => {
                // Add the settings icon to the app container
                conceptIntegration.addSettingsIcon('app-container');
                
                // Make the openConceptManager function available globally for testing
                window.openConceptManager = () => {
                    conceptIntegration.openConceptManager().catch(error => {
                        console.error('Failed to open concept manager:', error);
                        showError('Failed to open concept manager. Please check the console for details.');
                    });
                };
                
                // Add event listener for debug mode changes
                document.addEventListener('debugModeChanged', function(event) {
                    console.log('Debug mode changed:', event.detail.debugMode);
                    // Refresh the advisor to show debug information
                    if (window.initializeAdvisor) {
                        window.initializeAdvisor();
                    }
                });
            }).catch(error => {
                console.error('Error initializing concept integration:', error);
                showError('Failed to initialize concept integration. Please check the console for details.');
            });
        })
        .catch(error => {
            console.error('Error importing concept integration:', error);
            showError('Failed to import concept integration. Please check the console for details.');
        });
    
    // Load configuration
    $.getJSON('config/config.json', function(config) {
        // Store the default configuration globally
        window.defaultConfig = JSON.parse(JSON.stringify(config));
        window.currentConfig = config;
        
        initializeAdvisor(config);
        
        // Position the Edit Configuration button on the left side
        $('#toggle-editor-btn').css({
            'left': '20px',
            'right': 'auto'  // Remove the right positioning
        });
    }).fail(function() {
        $('body').append('<div class="error-message">Failed to load configuration.</div>');
    });

    // Make initializeAdvisor globally accessible
    window.initializeAdvisor = initializeAdvisor;

    // Helper function to show error messages
    function showError(message) {
        const errorElement = $('<div class="error-message"></div>').text(message);
        $('body').append(errorElement);
        
        // Remove the error message after 5 seconds
        setTimeout(() => {
            errorElement.remove();
        }, 5000);
    }

    function initializeAdvisor(config) {
        // If no config is provided, use the current config
        if (!config) {
            config = window.currentConfig;
        }
        
        try {
            // Create a mock CCL response based on the configuration
            var cclResponse = createCCLResponse(config);
            
            // Set the configuration for the advisor
            $("#advisor-container").empty();
            
            // Add the CCL response to the configuration
            if (typeof cclResponse === 'object') {
                config.RCONFIG.JSON_RETURN = JSON.stringify(cclResponse);
            } else {
                config.RCONFIG.JSON_RETURN = cclResponse;
            }
            
            // Render the advisor using the existing rendering functions
            renderAdvisor(config, cclResponse);
            
        } catch (error) {
            console.error("Error initializing advisor:", error);
            $("#advisor-container").html("<div class='error'>Error initializing advisor: " + error.message + "</div>");
        }
    }
    
    function createPatientHeader() {
        const header = $(`
            <div class="patient-header">
                <div class="patient-info">
                    <div class="patient-name">TEST, PATIENT</div>
                    <div class="patient-details">
                        <div>DOB: 02/19/1984 (41 Years)</div>
                        <div>Sex: Female</div>
                    </div>
                </div>
                <div class="visit-info">
                    <div>Visit Type: -</div>
                    <div>Location: -</div>
                    <div>Attending: -</div>
                </div>
                <div class="medical-record">
                    <div>EMR: 26903044</div>
                    <div>FIN: ATK500000000036 48888582</div>
                </div>
            </div>
        `).appendTo('#advisor-container');
    }
    
    function renderTabContent(tab, container) {
        // Create left column (info container)
        const infoContainer = $('<div class="uhspa-info-container"></div>').appendTo(container);
        
        // Add resizer to the info container
        const resizer = $('<div class="panel-resizer"></div>').appendTo(infoContainer);
        
        // Create right column (order container)
        const orderContainer = $('<div class="uhspa-order-container"></div>').appendTo(container);
        
        // Ordered By section
        const orderedBySection = $('<div class="info-section"></div>').appendTo(infoContainer);
        $('<div class="info-header">Ordered By</div>').appendTo(orderedBySection);
        $('<div>Pessa PharmD, Kurt</div>').appendTo(orderedBySection);
        
        // Criteria section
        const criteriaSection = $('<div class="info-section criteria-section-container"></div>').appendTo(infoContainer);
        const criteriaHeader = $('<div class="info-header">Criteria</div>').appendTo(criteriaSection);
        
        // Add edit button to criteria header - now positioned back on the right
        const editButton = $('<button class="edit-criteria-button">Edit</button>');
        editButton.css({
            'float': 'right',
            'margin-left': '10px',
            'margin-top': '-2px',
            'font-size': '11px',
            'padding': '2px 8px',
            'background-color': '#89ddff',
            'color': '#0f111a',
            'border': 'none',
            'border-radius': '3px',
            'cursor': 'pointer'
        });
        
        editButton.on('click', function() {
            const activeTabButton = $('.uhspa-tab-button.active');
            const activeTabKey = activeTabButton.data('tab-key');
            openCriteriaMiniEditor(activeTabKey);
        });
        
        // Append the button to the header (instead of prepending)
        criteriaHeader.append(editButton);
        
        // Create a container for criteria items
        const criteriaItemsContainer = $('<div class="criteria-items-container"></div>').appendTo(criteriaSection);
        
        // Add criteria items from the tab configuration
        if (tab.CRITERIA && tab.CRITERIA.length > 0) {
            tab.CRITERIA.forEach((criterion, index) => {
                // In a real app, we would evaluate CONCEPT_NAME to determine if criteria is met
                // For this demo, we'll show all criteria as satisfied
                let displayValue = criterion.DISPLAY || '';
                
                // Replace concept placeholders with values
                displayValue = displayValue
                    .replace('@concept{WEIGHTDOSING.value}', '70')
                    .replace('@concept{EACRITERIACREATININECLEARANCE.value}', '138.61')
                    .replace('@concept{EACRITERIASERUMCREATININE.value}', '0.500');
                    
                addCriterionItem(
                    criteriaItemsContainer, 
                    criterion.LABEL, 
                    displayValue,
                    criterion.TOOLTIP || "Double-click to edit criteria"
                );
            });
        }
        
        // Add double-click handler to the entire criteria section
        criteriaSection.on('dblclick', function(e) {
            const activeTabButton = $('.uhspa-tab-button.active');
            const activeTabKey = activeTabButton.data('tab-key');
            openCriteriaMiniEditor(activeTabKey);
        });
        
        // Phosphorus Labs section (or equivalent for the tab)
        const labsSection = $('<div class="info-section"></div>').appendTo(infoContainer);
        $(`<div class="info-header">${tab.TAB_NAME} Labs</div>`).appendTo(labsSection);
        $('<div>No Results Found</div>').appendTo(labsSection);
        
        // Urine Output section
        const urineOutputSection = $('<div class="info-section"></div>').appendTo(infoContainer);
        $('<div class="info-header">Urine Output</div>').appendTo(urineOutputSection);
        $('<div>No Results Found</div>').appendTo(urineOutputSection);
        
        // Additional Resources section
        renderResourcesSection(tab, infoContainer);
        
        // Render order sections
        renderOrderSections(tab, orderContainer);
        
        // Add buttons
        renderButtons(tab, orderContainer);
        
        // Initialize the resizer functionality
        initResizer(resizer, infoContainer, orderContainer);
    }
    
    function initResizer(resizer, leftPanel, rightPanel) {
        let isResizing = false;
        let startX, startLeftWidth, startRightWidth;
        
        // Prevent click events from propagating
        resizer.on('click', function(e) {
            e.stopPropagation();
            e.preventDefault();
        });
        
        resizer.on('mousedown', function(e) {
            isResizing = true;
            startX = e.clientX;
            
            // Get starting widths
            startLeftWidth = leftPanel.width();
            startRightWidth = rightPanel.width();
            
            // Add active class
            resizer.addClass('active');
            
            // Prevent text selection during resize
            $('body').css('user-select', 'none');
            
            // Prevent event from propagating
            e.stopPropagation();
            e.preventDefault();
        });
        
        $(document).on('mousemove', function(e) {
            if (!isResizing) return;
            
            // Calculate how far the mouse has moved
            const dx = e.clientX - startX;
            
            // Calculate new widths as percentages
            const containerWidth = leftPanel.parent().width();
            const newLeftWidth = ((startLeftWidth + dx) / containerWidth * 100);
            const newRightWidth = 100 - newLeftWidth; // Calculate right width based on left
            
            // Apply new widths if they're within reasonable bounds (10% to 90%)
            if (newLeftWidth > 10 && newLeftWidth < 90) {
                leftPanel.css('width', newLeftWidth + '%');
                rightPanel.css('width', newRightWidth + '%');
            }
            
            // Prevent default behavior
            e.preventDefault();
        });
        
        $(document).on('mouseup', function(e) {
            if (isResizing) {
                isResizing = false;
                resizer.removeClass('active');
                $('body').css('user-select', '');
                
                // Prevent any click events that might be triggered
                e.stopPropagation();
            }
        });
    }
    
    function addCriterionItem(container, label, value, tooltip) {
        const criterionItem = $('<div class="criterion"></div>').appendTo(container);
        
        // Only add the title attribute if a tooltip is provided and it's not empty
        if (tooltip && tooltip.trim() !== '' && tooltip !== "Double-click to edit criteria") {
            criterionItem.attr('title', tooltip);
        }
        
        $(`<span class="criterion-check">✓</span>`).appendTo(criterionItem);
        $(`<span class="criterion-label">${label}</span>`).appendTo(criterionItem);
        
        if (value) {
            $(`<span class="criterion-value">${value}</span>`).appendTo(criterionItem);
        }
        
        // Add hover effect to indicate interactivity
        criterionItem.css({
            'transition': 'background-color 0.2s',
            'border-radius': '3px',
            'padding': '2px 4px'
        });
        
        criterionItem.on('mouseenter', function() {
            $(this).css('background-color', 'rgba(137, 221, 255, 0.1)');
        });
        
        criterionItem.on('mouseleave', function() {
            $(this).css('background-color', 'transparent');
        });
    }
    
    function renderResourcesSection(tab, container) {
        if (tab.RESOURCE_URLS && tab.RESOURCE_URLS.length > 0) {
            const resourcesSection = $('<div class="info-section"></div>').appendTo(container);
            $('<div class="info-header">Additional Resource(s)</div>').appendTo(resourcesSection);
            
            const resourcesList = $('<div class="resources-list"></div>').appendTo(resourcesSection);
            
            tab.RESOURCE_URLS.forEach(resource => {
                $(`<div class="resource-link"><a href="${resource.URL}" class="uhspa-link">${resource.LABEL}</a></div>`).appendTo(resourcesList);
            });
        }
    }
    
    // Helper function to evaluate concept expressions
    function evaluateConceptExpression(expression) {
        // If there's no expression, return true (always visible)
        if (!expression) return true;
        
        // Check if the concept integration is available
        if (window.conceptIntegration) {
            // Use the concept integration to evaluate the expression
            return window.conceptIntegration.evaluateConceptExpression(expression);
        }
        
        // Fallback for when concept integration is not available
        // Check if it's a simple expression like [%true%] or [%false%]
        if (expression === '[%true%]') return true;
        if (expression === '[%false%]') return false;
        
        // For all other expressions, return false by default
        // This simulates all concepts being inactive on initial load
        return false;
    }

    function renderOrderSections(tab, container) {
        // Create a container for the "Show All Sections" button
        const showAllButtonContainer = $('<div class="show-all-button-container"></div>').appendTo(container);
        
        // Add debug mode toggle button if debug mode is enabled
        if (window.conceptIntegration && window.conceptIntegration.isDebugModeEnabled()) {
            const debugToggleContainer = $('<div class="debug-toggle-container"></div>').appendTo(container);
            const showAllButton = $('<button class="debug-toggle-button active">Show Matching Sections</button>').appendTo(debugToggleContainer);
            const showAllSectionsButton = $('<button class="debug-toggle-button">Show All Sections</button>').appendTo(debugToggleContainer);
            
            showAllButton.on('click', function() {
                if (!$(this).hasClass('active')) {
                    $(this).addClass('active');
                    showAllSectionsButton.removeClass('active');
                    
                    // Hide sections that don't match their concept expression
                    $('.order-section-wrapper').each(function() {
                        const conceptResult = $(this).data('concept-result');
                        if (conceptResult === false) {
                            $(this).addClass('completely-hidden');
                        }
                    });
                    
                    // Update the count of hidden sections
                    updateHiddenSectionCount(showAllButtonContainer);
                }
            });
            
            showAllSectionsButton.on('click', function() {
                if (!$(this).hasClass('active')) {
                    $(this).addClass('active');
                    showAllButton.removeClass('active');
                    
                    // Show all sections
                    $('.order-section-wrapper').removeClass('completely-hidden');
                    
                    // Hide the "Show All Sections" button since all sections are now visible
                    showAllButtonContainer.empty();
                }
            });
        }
        
        // Check if there are any order sections
        if (!tab.ORDER_SECTIONS || tab.ORDER_SECTIONS.length === 0) {
            $('<div class="no-orders-message">No order sections defined for this tab.</div>').appendTo(container);
            return;
        }
        
        // Create a wrapper for all order sections
        const orderSectionsWrapper = $('<div class="order-sections-wrapper"></div>').appendTo(container);
        
        // Track hidden sections count
        let hiddenSections = 0;
        
        // Render each order section
        tab.ORDER_SECTIONS.forEach((section, index) => {
            // Create a wrapper for the order section
            const sectionWrapper = $('<div class="order-section-wrapper"></div>').appendTo(orderSectionsWrapper);
            
            // Evaluate the concept expression if it exists
            let conceptResult = evaluateConceptExpression(section.CONCEPT_NAME);
            
            // Store the concept result as data attribute
            sectionWrapper.data('concept-result', conceptResult);
            
            // If debug mode is enabled, show the concept expression and result
            if (window.conceptIntegration && window.conceptIntegration.isDebugModeEnabled()) {
                const debugInfo = $('<div class="debug-info"></div>');
                
                if (section.CONCEPT_NAME) {
                    const expression = $('<span class="debug-expression"></span>').text(section.CONCEPT_NAME);
                    const result = $('<span class="debug-result"></span>')
                        .text(conceptResult ? 'TRUE' : 'FALSE')
                        .addClass(conceptResult ? 'true' : 'false');
                    
                    debugInfo.append('Concept Expression: ').append(expression).append(' → ').append(result);
                } else {
                    debugInfo.append('No Concept Expression → ').append(
                        $('<span class="debug-result true">ALWAYS VISIBLE</span>')
                    );
                }
                
                sectionWrapper.append(debugInfo);
            }
            
            // Hide the section if the concept expression evaluates to false and we're not in debug mode
            // or if we're in debug mode but not showing all sections
            if (!conceptResult) {
                if (!window.conceptIntegration || !window.conceptIntegration.isDebugModeEnabled()) {
                    sectionWrapper.addClass('completely-hidden');
                    hiddenSections++;
                } else {
                    // In debug mode, check if we should show all sections
                    const showAllActive = $('.debug-toggle-button:contains("Show All Sections")').hasClass('active');
                    if (!showAllActive) {
                        sectionWrapper.addClass('completely-hidden');
                        hiddenSections++;
                    }
                }
            }
            
            // Create the order section
            const orderSection = $('<div class="order-section"></div>').appendTo(sectionWrapper);
            
            // Create the section header
            const sectionHeader = $('<div class="order-section-header"></div>').appendTo(orderSection);
            
            // Add section name
            $(`<div class="section-name">${section.SECTION_NAME}</div>`).appendTo(sectionHeader);
            
            // Add edit button
            const editButton = $('<button class="section-edit-button">Edit</button>');
            editButton.css({
                'margin-left': '10px',
                'font-size': '11px',
                'padding': '2px 8px',
                'background-color': '#89ddff',
                'color': '#0f111a',
                'border': 'none',
                'border-radius': '3px',
                'cursor': 'pointer'
            });
            
            editButton.on('click', function(e) {
                e.stopPropagation();
                openMiniEditor(tab.TAB_KEY, index);
            });
            
            sectionHeader.append(editButton);
            
            // Add visibility toggle button
            const toggleButton = $('<button class="section-visibility-toggle">▼</button>');
            toggleButton.on('click', function() {
                toggleSectionVisibility(orderSection, showAllButtonContainer);
            });
            sectionHeader.append(toggleButton);
            
            // Create orders list
            const ordersList = $('<div class="orders-list"></div>').appendTo(orderSection);
            
            // Add orders if they exist
            if (section.ORDERS && section.ORDERS.length > 0) {
                section.ORDERS.forEach(order => {
                    const orderItem = $('<div class="order-item"></div>').appendTo(ordersList);
                    
                    // Create radio button or checkbox based on SINGLE_SELECT
                    const inputType = section.SINGLE_SELECT ? 'radio' : 'checkbox';
                    const inputName = section.SINGLE_SELECT ? `order-group-${index}` : `order-${index}-${Math.random().toString(36).substring(2, 11)}`;
                    
                    const orderInput = $(`<input type="${inputType}" name="${inputName}" class="order-input">`).appendTo(orderItem);
                    
                    // Create order content
                    const orderContent = $('<div class="order-content"></div>').appendTo(orderItem);
                    
                    // Add order mnemonic
                    $(`<div>${order.MNEMONIC}</div>`).appendTo(orderContent);
                    
                    // Add order sentence if it exists
                    if (order.ORDER_SENTENCE) {
                        $(`<div class="order-details">${order.ORDER_SENTENCE}</div>`).appendTo(orderContent);
                    }
                    
                    // Add comment if it exists
                    if (order.COMMENT) {
                        $(`<div class="order-comment">${order.COMMENT}</div>`).appendTo(orderContent);
                    }
                    
                    // Make the entire order item clickable
                    orderItem.on('click', function(e) {
                        // Don't trigger if clicking on the input directly
                        if (e.target !== orderInput[0]) {
                            orderInput.prop('checked', !orderInput.prop('checked'));
                        }
                    });
                });
            } else {
                $('<div class="no-orders-message">No orders defined for this section.</div>').appendTo(ordersList);
            }
        });
        
        // Update the count of hidden sections
        if (hiddenSections > 0) {
            updateHiddenSectionCount(showAllButtonContainer);
        }
    }
    
    // Helper function to toggle section visibility
    function toggleSectionVisibility(section, showAllButtonContainer) {
        // Find the parent wrapper
        const sectionWrapper = section.closest('.order-section-wrapper');
        
        // Toggle the completely-hidden class on the wrapper
        sectionWrapper.toggleClass('completely-hidden');
        
        // Update the count of hidden sections
        updateHiddenSectionCount(showAllButtonContainer);
    }
    
    // Helper function to update hidden section count and show/hide the button
    function updateHiddenSectionCount(showAllButtonContainer) {
        // Count hidden sections
        const hiddenSections = $('.order-section-wrapper.completely-hidden').length;
        
        // If there are hidden sections, show the button
        if (hiddenSections > 0) {
            showAllButtonContainer.empty();
            
            // Only show the button if we're not in debug mode or if we're in debug mode with "Show Matching Sections" active
            if (!window.conceptIntegration || !window.conceptIntegration.isDebugModeEnabled() || 
                $('.debug-toggle-button:contains("Show Matching Sections")').hasClass('active')) {
                
                const showAllButton = $('<button class="show-all-sections-btn"></button>')
                    .text(`Show All Hidden Sections (${hiddenSections})`)
                    .appendTo(showAllButtonContainer);
                
                showAllButton.on('click', function() {
                    // Show all hidden sections
                    $('.order-section-wrapper.completely-hidden').removeClass('completely-hidden');
                    
                    // Hide the button
                    showAllButtonContainer.empty();
                });
            }
        } else {
            // No hidden sections, hide the button
            showAllButtonContainer.empty();
        }
    }
    
    function renderButtons(tab, container) {
        const buttonContainer = $('<div class="button-container"></div>').appendTo(container);
        
        // Get button labels from config or use defaults
        const dismissLabel = tab.SUBMIT_BUTTON?.DISMISS_LABEL || "No Orders Necessary";
        const signLabel = tab.SUBMIT_BUTTON?.SIGN_LABEL || "Sign Orders";
        const cancelLabel = tab.CANCEL_BUTTON?.CANCEL_LABEL || "Cancel";
        
        $(`<button class="cancel-button">${cancelLabel}</button>`).appendTo(buttonContainer);
        $(`<button class="submit-button">${dismissLabel}</button>`).appendTo(buttonContainer);
        
        // Add input change handler to update button text
        $(document).on('change', '.order-input', function() {
            // Check if any checkbox or radio button is checked
            const anyChecked = $('.order-input:checked').length > 0;
            if (anyChecked) {
                $('.submit-button').text(signLabel);
            } else {
                $('.submit-button').text(dismissLabel);
            }
        });
    }

    // Helper function to render the advisor
    function renderAdvisor(config, cclResponse) {
        // Clear the advisor container
        $("#advisor-container").empty();
        
        // Create patient header
        createPatientHeader();
        
        // Create tabs container
        const tabsContainer = $('<div class="uhspa-tabs-container"></div>').appendTo('#advisor-container');
        
        // Create tab content container
        const tabContentContainer = $('<div class="uhspa-tab-content-container"></div>').appendTo('#advisor-container');
        
        // Check if we have tabs
        if (!cclResponse.tabs || cclResponse.tabs.length === 0) {
            tabContentContainer.html('<div class="error-message">No tabs defined in the configuration.</div>');
            return;
        }
        
        // Create tabs
        cclResponse.tabs.forEach((tab, index) => {
            // Create tab button
            const tabButton = $(`<button class="uhspa-tab-button" data-tab-key="${tab.TAB_KEY}">${tab.TAB_NAME}</button>`);
            tabButton.appendTo(tabsContainer);
            
            // Create tab content
            const tabContent = $(`<div class="uhspa-tab-content" id="tab-content-${tab.TAB_KEY}"></div>`);
            tabContent.appendTo(tabContentContainer);
            
            // Hide all tabs except the first one
            if (index !== 0) {
                tabContent.hide();
            } else {
                tabButton.addClass('active');
            }
            
            // Add click handler to tab button
            tabButton.on('click', function() {
                // Remove active class from all tab buttons
                $('.uhspa-tab-button').removeClass('active');
                
                // Add active class to clicked tab button
                $(this).addClass('active');
                
                // Hide all tab content
                $('.uhspa-tab-content').hide();
                
                // Show the corresponding tab content
                $(`#tab-content-${tab.TAB_KEY}`).show();
            });
            
            // Render tab content
            renderTab(tab, tabContent);
        });
    }

    // Add this new function to handle the mini-editor
    function openMiniEditor(tabKey, sectionIndex) {
        // Find the tab and section in the configuration
        const tab = window.currentConfig.RCONFIG.TABS.find(tab => tab.TAB_KEY === tabKey);
        if (!tab || !tab.ORDER_SECTIONS || !tab.ORDER_SECTIONS[sectionIndex]) {
            return;
        }
        
        const section = tab.ORDER_SECTIONS[sectionIndex];
        
        // Close any existing mini-editors
        $('.mini-editor-container').remove();
        
        // Create mini-editor container
        const miniEditorContainer = $(`
            <div class="mini-editor-container">
                <div class="mini-editor-header">
                    <span>Editing: ${section.SECTION_NAME}</span>
                    <div class="mini-editor-actions">
                        <button class="mini-editor-save">Save</button>
                        <button class="mini-editor-cancel">Cancel</button>
                    </div>
                </div>
                <div class="mini-editor-content">
                    <textarea class="mini-editor-textarea"></textarea>
                </div>
            </div>
        `);
        
        // Find the specific order section being edited and append the mini-editor after it
        const orderSectionWrapper = $(`.order-section-wrapper:eq(${sectionIndex})`);
        miniEditorContainer.insertAfter(orderSectionWrapper);
        
        // Set the content of the textarea
        const sectionJson = JSON.stringify(section, null, 2);
        miniEditorContainer.find('.mini-editor-textarea').val(sectionJson);
        
        // Initialize CodeMirror on the textarea
        const miniEditor = CodeMirror.fromTextArea(miniEditorContainer.find('.mini-editor-textarea')[0], {
            mode: { name: "javascript", json: true },
            theme: "material-ocean",
            lineNumbers: true,
            matchBrackets: true,
            autoCloseBrackets: true,
            foldGutter: true,
            gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
            indentUnit: 2,
            tabSize: 2,
            lineWrapping: true
        });
        
        // Calculate the appropriate height based on content
        const contentLines = sectionJson.split('\n').length;
        const lineHeight = 20; // Approximate height of each line in pixels
        const paddingHeight = 10; // Additional padding
        const minHeight = 100; // Minimum height
        const maxHeight = 400; // Maximum height
        
        // Calculate height based on content (line count * line height + padding)
        let autoHeight = (contentLines * lineHeight) + paddingHeight;
        
        // Ensure height is within min/max bounds
        autoHeight = Math.max(minHeight, Math.min(autoHeight, maxHeight));
        
        // Set editor size with auto-calculated height
        miniEditor.setSize("100%", autoHeight + "px");
        
        // Apply custom highlighting if available
        if (window.jsonEditorHelpers && window.jsonEditorHelpers.applyCustomHighlighting) {
            setTimeout(() => window.jsonEditorHelpers.applyCustomHighlighting(miniEditor), 100);
            
            // Add change handler to reapply highlighting when content changes
            miniEditor.on("change", function() {
                clearTimeout(miniEditor.highlightTimeout);
                miniEditor.highlightTimeout = setTimeout(() => window.jsonEditorHelpers.applyCustomHighlighting(miniEditor), 500);
                
                // Update height when content changes
                const currentLines = miniEditor.getValue().split('\n').length;
                let newHeight = (currentLines * lineHeight) + paddingHeight;
                newHeight = Math.max(minHeight, Math.min(newHeight, maxHeight));
                miniEditor.setSize("100%", newHeight + "px");
            });
        }
        
        // Handle save button click
        miniEditorContainer.find('.mini-editor-save').click(function() {
            try {
                // Get the edited content
                const editedContent = miniEditor.getValue();
                
                if (!editedContent || editedContent.trim() === '') {
                    throw new Error("Empty content cannot be saved");
                }
                
                // Parse the JSON to validate it
                let editedSection;
                try {
                    editedSection = JSON.parse(editedContent);
                } catch (parseError) {
                    alert("Error parsing JSON: " + parseError.message);
                    return;
                }
                
                // Update the section in the configuration
                tab.ORDER_SECTIONS[sectionIndex] = editedSection;
                
                // Reinitialize the advisor with the updated configuration
                initializeAdvisor(window.currentConfig);
                
                // Notify the full-screen editor of the configuration change
                if (window.CodeMirror && document.getElementById("config-editor")) {
                    // Create a custom event to notify the editor.js that the config has changed
                    const configChangeEvent = new CustomEvent('configChanged', {
                        detail: { config: window.currentConfig }
                    });
                    document.dispatchEvent(configChangeEvent);
                }
                
                // Close the mini-editor - use multiple methods to ensure it's removed properly
                try {
                    const container = document.querySelector('.mini-editor-container');
                    if (container) {
                        container.remove();
                    } else {
                        $('.mini-editor-container').remove();
                    }
                } catch (removeError) {
                    // As a fallback, try to hide it
                    $('.mini-editor-container').hide();
                }
            } catch (e) {
                // Show error message
                alert("Error saving section: " + e.message);
            }
        });
        
        // Handle cancel button click
        miniEditorContainer.find('.mini-editor-cancel').click(function() {
            miniEditorContainer.remove();
        });
    }

    // Add this function to handle double-clicking on criteria sections
    function renderCriteriaSections(tab, container) {
        console.log("renderCriteriaSections called for tab:", tab.TAB_KEY);
        
        if (tab.CRITERIA_SECTIONS && tab.CRITERIA_SECTIONS.length > 0) {
            console.log(`Found ${tab.CRITERIA_SECTIONS.length} criteria sections to render`);
            
            tab.CRITERIA_SECTIONS.forEach((section, sectionIndex) => {
                console.log(`Rendering criteria section ${sectionIndex}: ${section.SECTION_NAME}`);
                
                // Create the criteria section container
                const criteriaSection = $('<div class="criteria-section" data-section-index="' + sectionIndex + '"></div>').appendTo(container);
                $(`<div class="criteria-section-header">${section.SECTION_NAME}</div>`).appendTo(criteriaSection);
                
                if (section.CRITERIA && section.CRITERIA.length > 0) {
                    console.log(`Section has ${section.CRITERIA.length} criteria items`);
                    const criteriaList = $('<div class="criteria-list"></div>').appendTo(criteriaSection);
                    
                    section.CRITERIA.forEach(criteria => {
                        const criteriaItem = $('<div class="criteria-item"></div>').appendTo(criteriaList);
                        
                        if (criteria.CRITERIA_TEXT) {
                            $(`<div class="criteria-text">${criteria.CRITERIA_TEXT}</div>`).appendTo(criteriaItem);
                        }
                        
                        if (criteria.COMMENT) {
                            $(`<div class="criteria-comment">${criteria.COMMENT}</div>`).appendTo(criteriaItem);
                        }
                    });
                } else {
                    console.log("No criteria items found in this section");
                    $('<div class="no-criteria">No criteria available</div>').appendTo(criteriaSection);
                }
                
                // Add double-click handler to open mini-editor
                console.log(`Adding double-click handler to criteria section ${sectionIndex}`);
                criteriaSection.on('dblclick', function(e) {
                    console.log(`Double-click detected on criteria section ${sectionIndex}`);
                    openCriteriaMiniEditor(tab.TAB_KEY, sectionIndex);
                });
                
                // Also add a click handler for debugging
                criteriaSection.on('click', function(e) {
                    console.log(`Single click detected on criteria section ${sectionIndex}`);
                });
            });
        } else {
            console.log("No criteria sections found for this tab");
        }
    }

    // Function to open mini-editor for criteria sections
    function openCriteriaMiniEditor(tabKey) {
        // Find the tab in the configuration
        const tab = window.currentConfig.RCONFIG.TABS.find(tab => tab.TAB_KEY === tabKey);
        if (!tab) {
            return;
        }
        
        // Get the criteria data to edit
        let criteriaData = [];
        
        // Try to find criteria in the tab configuration
        if (tab.CRITERIA && Array.isArray(tab.CRITERIA)) {
            // Deep copy to avoid reference issues
            criteriaData = JSON.parse(JSON.stringify(tab.CRITERIA));
        } else {
            // Create a default structure based on the model schema
            criteriaData = [
                {
                    "LABEL": "Patient not on dialysis",
                    "CONCEPT_NAME": "{EACRITERIANOTONDIALYSIS}",
                    "DISPLAY": "",
                    "VALUE": "",
                    "TOOLTIP": "Patient is not on dialysis"
                },
                {
                    "LABEL": "Dosing Weight > 50 kg",
                    "CONCEPT_NAME": "{EACRITERIAWEIGHTGT50KG}",
                    "DISPLAY": "",
                    "VALUE": "",
                    "TOOLTIP": "Patient's dosing weight is greater than 50 kg"
                }
            ];
        }
        
        // Close any existing mini-editors
        $('.mini-editor-container').remove();
        
        // Create mini-editor container with inline event handlers for better reliability
        const miniEditorContainer = $(`
            <div class="mini-editor-container">
                <div class="mini-editor-header">
                    <span>Editing Criteria for ${tab.TAB_NAME || tab.TAB_KEY}</span>
                    <div class="mini-editor-actions">
                        <button class="mini-editor-save" id="criteria-save-btn">Save</button>
                        <button class="mini-editor-cancel" id="criteria-cancel-btn" onclick="document.querySelector('.mini-editor-container').remove();">Cancel</button>
                    </div>
                </div>
                <div class="mini-editor-content">
                    <textarea id="criteria-editor-textarea" class="mini-editor-textarea"></textarea>
                </div>
            </div>
        `);
        
        // Find the criteria section and append the mini-editor after it
        const criteriaSection = $('.info-header:contains("Criteria")').parent();
        
        if (criteriaSection.length === 0) {
            return;
        }
        
        miniEditorContainer.insertAfter(criteriaSection);
        
        // Set the content of the textarea
        const criteriaJson = JSON.stringify(criteriaData, null, 2);
        $('#criteria-editor-textarea').val(criteriaJson);
        
        // Make sure the DOM is updated before initializing CodeMirror
        setTimeout(() => {
            // Initialize CodeMirror on the textarea
            const textarea = document.getElementById('criteria-editor-textarea');
            if (!textarea) {
                return;
            }
            
            const miniEditor = CodeMirror.fromTextArea(textarea, {
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
                viewportMargin: Infinity // Ensures the editor renders all content
            });
            
            // Force a refresh to ensure content is displayed
            miniEditor.refresh();
            
            // Set a fixed height for the editor
            miniEditor.setSize("100%", "300px");
            
            // Handle save button click using direct DOM method for better reliability
            document.getElementById('criteria-save-btn').addEventListener('click', function() {
                try {
                    // Get the edited content
                    const editedContent = miniEditor.getValue();
                    
                    if (!editedContent || editedContent.trim() === '') {
                        throw new Error("Empty content cannot be saved");
                    }
                    
                    // Parse the JSON to validate it
                    let editedCriteria;
                    try {
                        editedCriteria = JSON.parse(editedContent);
                        if (!Array.isArray(editedCriteria)) {
                            throw new Error("Criteria must be an array");
                        }
                    } catch (parseError) {
                        alert("Error parsing JSON: " + parseError.message);
                        return;
                    }
                    
                    // Update the criteria in the configuration
                    tab.CRITERIA = editedCriteria;
                    
                    // Reinitialize the advisor with the updated configuration
                    initializeAdvisor(window.currentConfig);
                    
                    // Update the full-screen editor if it's available
                    if (window.CodeMirror && document.getElementById("config-editor")) {
                        // Create a custom event to notify the editor.js that the config has changed
                        const configChangeEvent = new CustomEvent('configChanged', {
                            detail: { config: window.currentConfig }
                        });
                        document.dispatchEvent(configChangeEvent);
                    }
                    
                    // Close the mini-editor - use multiple methods to ensure it's removed properly
                    try {
                        const container = document.querySelector('.mini-editor-container');
                        if (container) {
                            container.remove();
                        } else {
                            $('.mini-editor-container').remove();
                        }
                    } catch (removeError) {
                        // As a fallback, try to hide it
                        $('.mini-editor-container').hide();
                    }
                } catch (e) {
                    // Show error message
                    alert("Error saving criteria: " + e.message);
                }
            });
        }, 100); // Short delay to ensure DOM is updated
    }

    function renderTab(tab, tabContainer) {
        // Create content wrapper
        const contentWrapper = $('<div class="content-wrapper"></div>').appendTo(tabContainer);
        
        // Render tab content
        renderTabContent(tab, contentWrapper);
    }
});

// Create a mock CCL response based on the configuration
function createCCLResponse(config) {
    // Create a mock CCL response based on the configuration
    const cclResponse = {
        tabs: []
    };
    
    // Process each tab in the configuration
    if (config.RCONFIG && config.RCONFIG.TABS) {
        config.RCONFIG.TABS.forEach(tab => {
            const tabData = {
                TAB_NAME: tab.TAB_NAME || 'Unnamed Tab',
                TAB_KEY: tab.TAB_KEY || `tab_${Math.random().toString(36).substring(2, 11)}`,
                FLAG_ON_CONCEPT: tab.FLAG_ON_CONCEPT || '',
                CONCEPT_FOR_DISMISS: tab.CONCEPT_FOR_DISMISS || '',
                MNEMONICS: tab.MNEMONICS || [],
                CONCEPTS: tab.CONCEPTS || [],
                CRITERIA: tab.CRITERIA || [],
                GRAPHED_RESULTS: tab.GRAPHED_RESULTS || [],
                ORDER_SECTIONS: [],
                RESOURCE_URLS: tab.RESOURCE_URLS || [],
                SUBMIT_BUTTON: tab.SUBMIT_BUTTON || { DISMISS_LABEL: 'Dismiss', SIGN_LABEL: 'Sign' },
                CANCEL_BUTTON: tab.CANCEL_BUTTON || { CANCEL_LABEL: 'Cancel' }
            };
            
            // Process order sections
            if (tab.ORDER_SECTIONS) {
                tab.ORDER_SECTIONS.forEach(section => {
                    const sectionData = {
                        SECTION_NAME: section.SECTION_NAME || 'Unnamed Section',
                        CONCEPT_NAME: section.CONCEPT_NAME || '',
                        SINGLE_SELECT: section.SINGLE_SELECT || 0,
                        SHOW_INACTIVE_DUPLICATES: section.SHOW_INACTIVE_DUPLICATES || 0,
                        ORDERS: []
                    };
                    
                    // Process orders
                    if (section.ORDERS) {
                        section.ORDERS.forEach(order => {
                            sectionData.ORDERS.push({
                                MNEMONIC: order.MNEMONIC || 'Unnamed Order',
                                ORDER_SENTENCE: order.ORDER_SENTENCE || '',
                                ASC_SHORT_DESCRIPTION: order.ASC_SHORT_DESCRIPTION || '',
                                COMMENT: order.COMMENT || ''
                            });
                        });
                    }
                    
                    tabData.ORDER_SECTIONS.push(sectionData);
                });
            }
            
            cclResponse.tabs.push(tabData);
        });
    }
    
    return cclResponse;
} 