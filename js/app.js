// Initialize the application
$(document).ready(function() {
    // Load configuration
    $.getJSON('config/config.json', function(config) {
        // Store the default configuration globally
        window.defaultConfig = JSON.parse(JSON.stringify(config));
        window.currentConfig = config;
        
        initializeAdvisor(config);
    }).fail(function() {
        $('body').append('<div class="error-message">Failed to load configuration.</div>');
    });

    // Make initializeAdvisor globally accessible
    window.initializeAdvisor = initializeAdvisor;

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
        `).appendTo('body');
    }
    
    function renderTabContent(tab, container) {
        // Create left column (info container)
        const infoContainer = $('<div class="uhspa-info-container"></div>').appendTo(container);
        
        // Ordered By section
        const orderedBySection = $('<div class="info-section"></div>').appendTo(infoContainer);
        $('<div class="info-header">Ordered By</div>').appendTo(orderedBySection);
        $('<div>Pessa PharmD, Kurt</div>').appendTo(orderedBySection);
        
        // Criteria section
        const criteriaSection = $('<div class="info-section"></div>').appendTo(infoContainer);
        $('<div class="info-header">Criteria</div>').appendTo(criteriaSection);
        
        // Add criteria items from the tab configuration
        if (tab.CRITERIA && tab.CRITERIA.length > 0) {
            tab.CRITERIA.forEach(criterion => {
                // In a real app, we would evaluate CONCEPT_NAME to determine if criteria is met
                // For this demo, we'll show all criteria as satisfied
                addCriterionItem(criteriaSection, criterion.LABEL, criterion.DISPLAY.replace('@concept{WEIGHTDOSING.value}', '70')
                    .replace('@concept{EACRITERIACREATININECLEARANCE.value}', '138.61')
                    .replace('@concept{EACRITERIASERUMCREATININE.value}', '0.500'));
            });
        }
        
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
        
        // Create right column (order container)
        const orderContainer = $('<div class="uhspa-order-container"></div>').appendTo(container);
        
        // Render order sections
        renderOrderSections(tab, orderContainer);
        
        // Add buttons
        renderButtons(tab, orderContainer);
    }
    
    function addCriterionItem(container, label, value) {
        const criterion = $('<div class="criterion"></div>').appendTo(container);
        $('<span class="check-icon">✓</span>').appendTo(criterion);
        $('<span class="criterion-label">' + label + '</span>').appendTo(criterion);
        if (value && value.trim() !== '') {
            $('<span class="criterion-value">' + value + '</span>').appendTo(criterion);
        }
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
    
    function renderOrderSections(tab, container) {
        if (tab.ORDER_SECTIONS && tab.ORDER_SECTIONS.length > 0) {
            tab.ORDER_SECTIONS.forEach((section, sectionIndex) => {
                // In a real app, we would evaluate CONCEPT_NAME to determine if section should be shown
                // For this demo, we'll show all sections
                
                const orderSection = $('<div class="order-section" data-section-index="' + sectionIndex + '"></div>').appendTo(container);
                $(`<div class="order-section-header">${section.SECTION_NAME}</div>`).appendTo(orderSection);
                
                if (section.ORDERS && section.ORDERS.length > 0) {
                    const ordersList = $('<div class="orders-list"></div>').appendTo(orderSection);
                    
                    section.ORDERS.forEach(order => {
                        const orderItem = $('<div class="order-item"></div>').appendTo(ordersList);
                        
                        const checkboxId = `order-${order.MNEMONIC.replace(/\s+/g, '-')}-${Math.random().toString(36).substring(2, 8)}`;
                        const checkbox = $(`<input type="checkbox" id="${checkboxId}" class="order-checkbox">`);
                        checkbox.appendTo(orderItem);
                        
                        const label = $(`<label for="${checkboxId}">${order.MNEMONIC}</label>`);
                        label.appendTo(orderItem);
                        
                        if (order.ORDER_SENTENCE) {
                            $(`<div class="order-details">${order.ORDER_SENTENCE}</div>`).appendTo(orderItem);
                        }
                        
                        if (order.COMMENT) {
                            $(`<div class="order-comment">${order.COMMENT}</div>`).appendTo(orderItem);
                        }
                    });
                } else {
                    $('<div class="no-orders">No orders available</div>').appendTo(orderSection);
                }
                
                // Add double-click handler to open mini-editor
                orderSection.dblclick(function(e) {
                    // Don't trigger if clicking on a checkbox or label
                    if ($(e.target).is('input') || $(e.target).is('label')) {
                        return;
                    }
                    
                    const sectionIndex = $(this).data('section-index');
                    const activeTabButton = $('.uhspa-tab-button.active');
                    const activeTabKey = activeTabButton.data('tab-key');
                    
                    // Open mini-editor for this section
                    openMiniEditor(activeTabKey, sectionIndex);
                });
            });
        } else {
            $('<div class="no-orders-message">No order sections available for this tab.</div>').appendTo(container);
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
        
        // Add checkbox change handler to update button text
        $(document).on('change', '.order-checkbox', function() {
            const anyChecked = $('.order-checkbox:checked').length > 0;
            if (anyChecked) {
                $('.submit-button').text(signLabel);
            } else {
                $('.submit-button').text(dismissLabel);
            }
        });
    }

    // Helper function to render the advisor
    function renderAdvisor(config, cclResponse) {
        // Create patient header
        createPatientHeader();
        
        // Get tabs from config
        const rconfig = config.RCONFIG;
        const tabs = rconfig.TABS;
        
        // Create tab container
        const tabsContainer = $('<div class="uhspa-tabs-container"></div>').appendTo('#advisor-container');
        
        // Create content wrapper
        const contentWrapper = $('<div class="content-wrapper"></div>').appendTo('#advisor-container');
        
        // Create tabs
        tabs.forEach((tab, index) => {
            const tabButton = $(`<div class="uhspa-tab-button" data-tab-key="${tab.TAB_KEY}">${tab.TAB_NAME}</div>`);
            // Default to first tab or Phosphate tab if it exists
            if (index === 0 || tab.TAB_KEY === "PHOSPHATE") {
                tabButton.addClass('active');
            }
            tabButton.appendTo(tabsContainer);
        });
        
        // Create tab content for the active tab
        const activeTabButton = $('.uhspa-tab-button.active');
        const activeTabKey = activeTabButton.data('tab-key');
        const activeTab = tabs.find(tab => tab.TAB_KEY === activeTabKey) || tabs[0];
        
        renderTabContent(activeTab, contentWrapper);
        
        // Add tab click handlers
        $('.uhspa-tab-button').click(function() {
            $('.uhspa-tab-button').removeClass('active');
            $(this).addClass('active');
            
            const tabKey = $(this).data('tab-key');
            const selectedTab = tabs.find(tab => tab.TAB_KEY === tabKey);
            
            // Clear and render new content
            contentWrapper.empty();
            renderTabContent(selectedTab, contentWrapper);
        });
    }

    // Add this new function to handle the mini-editor
    function openMiniEditor(tabKey, sectionIndex) {
        // Find the tab and section in the configuration
        const tab = window.currentConfig.RCONFIG.TABS.find(tab => tab.TAB_KEY === tabKey);
        if (!tab || !tab.ORDER_SECTIONS || !tab.ORDER_SECTIONS[sectionIndex]) {
            console.error("Section not found in configuration");
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
        
        // Append to the order section
        const orderSection = $(`.order-section[data-section-index="${sectionIndex}"]`);
        miniEditorContainer.insertAfter(orderSection);
        
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
                
                // Parse the JSON to validate it
                const editedSection = JSON.parse(editedContent);
                
                // Update the section in the configuration
                tab.ORDER_SECTIONS[sectionIndex] = editedSection;
                
                // Reinitialize the advisor with the updated configuration
                initializeAdvisor(window.currentConfig);
                
                // Close the mini-editor
                miniEditorContainer.remove();
            } catch (e) {
                // Show error message
                console.error("Error saving section:", e);
                alert("Error parsing JSON: " + e.message);
            }
        });
        
        // Handle cancel button click
        miniEditorContainer.find('.mini-editor-cancel').click(function() {
            miniEditorContainer.remove();
        });
    }
});

// Create a mock CCL response based on the configuration
function createCCLResponse(config) {
    // Check if config has the expected structure
    if (!config || !config.RCONFIG || !config.RCONFIG.TABS) {
        return {
            RREC: {
                STATUS_DATA: {
                    STATUS: "E",
                    MESSAGE: "Invalid configuration structure"
                },
                TAB: []
            }
        };
    }
    
    var tabs = config.RCONFIG.TABS;
    var response = {
        RREC: {
            STATUS_DATA: {
                STATUS: "S"
            },
            TAB: []
        }
    };
    
    // Create tabs based on configuration
    tabs.forEach(function(tab, index) {
        var tabObj = {
            ID: "tab-" + index,
            DISPLAY: tab.TAB_NAME || "Tab " + (index + 1),
            STATUS: index === 0 ? "alert" : "normal",
            ORDER_PROVIDER_NAME: "Moore, Charles R",
            CRITERIA: [],
            SYNONYM: [],
            GRAPH: [],
            LAB_RESULTS: [],
            ORDER_SECTION: []
        };
        
        // Add criteria with proper status
        if (tab.CRITERIA && Array.isArray(tab.CRITERIA)) {
            tab.CRITERIA.forEach(function(criteria) {
                tabObj.CRITERIA.push({
                    LABEL: criteria.LABEL || "Unknown Criterion",
                    DISPLAY: criteria.DISPLAY || "Yes",
                    TOOLTIP: criteria.TOOLTIP || "",
                    STATUS: "pass",
                    CONCEPT_NAME: criteria.CONCEPT_NAME || ""
                });
            });
        }
        
        // Add default criteria if none exist
        if (tabObj.CRITERIA.length === 0) {
            tabObj.CRITERIA.push({
                LABEL: "Patient not on dialysis",
                DISPLAY: "No",
                TOOLTIP: "No active dialysis order",
                STATUS: "pass"
            });
            
            tabObj.CRITERIA.push({
                LABEL: "Dosing Weight > 50 kg",
                DISPLAY: "62 kg",
                TOOLTIP: "Dosing weight",
                STATUS: "pass"
            });
            
            tabObj.CRITERIA.push({
                LABEL: "Creatinine Clearance",
                DISPLAY: "43.06",
                TOOLTIP: "Calculated creatinine clearance",
                STATUS: "pass"
            });
            
            tabObj.CRITERIA.push({
                LABEL: "Serum Creatinine",
                DISPLAY: "1.00",
                TOOLTIP: "Serum creatinine level",
                STATUS: "pass"
            });
        }
        
        // Add lab results based on tab name
        if (tab.TAB_NAME === "Magnesium") {
            tabObj.LAB_RESULTS = [
                {
                    LABEL: "Mg Lvl",
                    VALUE: "2.0",
                    UNITS: "mg/dL",
                    NORMAL_LOW: "1.8",
                    NORMAL_HIGH: "2.4",
                    COLLECTION_DT_TM: new Date().toISOString(),
                    AGE_IN_MINS: "52 mins"
                },
                {
                    LABEL: "Creatinine",
                    VALUE: "1.00",
                    UNITS: "mg/dL",
                    COLLECTION_DT_TM: new Date().toISOString(),
                    AGE_IN_MINS: "52 mins"
                }
            ];
        } else if (tab.TAB_NAME === "Potassium") {
            tabObj.LAB_RESULTS = [
                {
                    LABEL: "Potassium",
                    VALUE: "3.1",
                    UNITS: "mEq/L",
                    NORMAL_LOW: "3.5",
                    NORMAL_HIGH: "5.0",
                    COLLECTION_DT_TM: new Date().toISOString(),
                    AGE_IN_MINS: "52 mins"
                },
                {
                    LABEL: "Creatinine",
                    VALUE: "1.00",
                    UNITS: "mg/dL",
                    COLLECTION_DT_TM: new Date().toISOString(),
                    AGE_IN_MINS: "52 mins"
                }
            ];
        } else if (tab.TAB_NAME === "Phosphate") {
            tabObj.LAB_RESULTS = [
                {
                    LABEL: "Phosphate",
                    VALUE: "2.5",
                    UNITS: "mg/dL",
                    NORMAL_LOW: "2.7",
                    NORMAL_HIGH: "4.5",
                    COLLECTION_DT_TM: new Date().toISOString(),
                    AGE_IN_MINS: "52 mins"
                }
            ];
        }
        
        // Add default order sections if none exist
        if (tab.TAB_NAME === "Potassium") {
            tabObj.ORDER_SECTION.push({
                SECTION_NAME: "Potassium Level 3.1 - 3.5 mEq/L: 3.1",
                ORDERS: [
                    {
                        MNEMONIC: "potassium chloride 10 mEq/50 mL intravenous solution",
                        ORDER_SENTENCE: "10 mEq, Soln-IV, IV Piggyback, q1H Interval, Duration: 4 Doses",
                        OS_COMMENT: "For Potassium Level 3.1 - 3.5 mEq/L; Total Dose = 40 mEq.",
                        SYNONYM_ID: 12345,
                        ORDER_SENTENCE_ID: 67890
                    }
                ]
            });
        } else if (tab.TAB_NAME === "Magnesium") {
            tabObj.ORDER_SECTION.push({
                SECTION_NAME: "Magnesium Level Blood, Stat collect, Once",
                ORDERS: [
                    {
                        MNEMONIC: "Magnesium Oxide - Oral",
                        ORDER_SENTENCE: "400 mg, Tablet, Oral, Once",
                        OS_COMMENT: "For Magnesium Level 1.5 - 1.7 mg/dL",
                        SYNONYM_ID: 23456,
                        ORDER_SENTENCE_ID: 78901
                    }
                ]
            });
        }
        
        // Add order sections from configuration
        if (tab.ORDER_SECTIONS && Array.isArray(tab.ORDER_SECTIONS)) {
            tab.ORDER_SECTIONS.forEach(function(section) {
                if (section.CONCEPT_NAME !== "[%false%]") {
                    var orderSection = {
                        SECTION_NAME: section.SECTION_NAME || "Orders",
                        ORDERS: []
                    };
                    
                    if (section.ORDERS && Array.isArray(section.ORDERS)) {
                        section.ORDERS.forEach(function(order) {
                            orderSection.ORDERS.push({
                                MNEMONIC: order.MNEMONIC || "",
                                ORDER_SENTENCE: order.ORDER_SENTENCE || "Default order sentence",
                                OS_COMMENT: order.COMMENT || "",
                                SYNONYM_ID: Math.floor(Math.random() * 10000),
                                ORDER_SENTENCE_ID: Math.floor(Math.random() * 10000)
                            });
                        });
                    }
                    
                    // Only add if it has orders
                    if (orderSection.ORDERS.length > 0) {
                        tabObj.ORDER_SECTION.push(orderSection);
                    }
                }
            });
        }
        
        // Add submit button
        tabObj.SUBMIT_BUTTON = tab.SUBMIT_BUTTON || "No Orders Necessary";
        
        // Add to response
        response.RREC.TAB.push(tabObj);
    });
    
    return response;
} 