// Initialize the application
$(document).ready(function() {
    // Load configuration
    $.getJSON('config/config.json', function(config) {
        initializeAdvisor(config);
    }).fail(function() {
        console.error("Failed to load configuration");
    });

    function initializeAdvisor(config) {
        const rconfig = config.RCONFIG;
        const tabs = rconfig.TABS;
        
        // Create patient header
        createPatientHeader();
        
        // Create tab container
        const tabsContainer = $('<div class="uhspa-tabs-container"></div>').appendTo('body');
        
        // Create content wrapper
        const contentWrapper = $('<div class="content-wrapper"></div>').appendTo('body');
        
        // Create tabs
        tabs.forEach((tab, index) => {
            const tabButton = $(`<div class="uhspa-tab-button" data-tab-key="${tab.TAB_KEY}">${tab.TAB_NAME}</div>`);
            if (tab.TAB_KEY === "PHOSPHATE") { // Default to Phosphate tab
                tabButton.addClass('active');
            }
            tabButton.appendTo(tabsContainer);
        });
        
        // Create tab content
        const activeTab = tabs.find(tab => tab.TAB_KEY === "PHOSPHATE");
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
        
        // Create right column (order container)
        const orderContainer = $('<div class="uhspa-order-container"></div>').appendTo(container);
        
        // Render left column sections
        renderOrderedBySection(infoContainer);
        renderCriteriaSection(tab, infoContainer);
        renderLabsSection(tab, infoContainer);
        renderResourcesSection(tab, infoContainer);
        
        // Render right column sections
        renderOrderSections(tab, orderContainer);
        
        // Add buttons
        renderButtons(tab, orderContainer);
    }
    
    function renderOrderedBySection(container) {
        const section = $('<div class="info-section"></div>').appendTo(container);
        $('<div class="info-header">Ordered By</div>').appendTo(section);
        $('<div>Pessa PharmD, Kurt</div>').appendTo(section);
    }
    
    function renderCriteriaSection(tab, container) {
        const section = $('<div class="info-section"></div>').appendTo(container);
        $('<div class="info-header">Criteria</div>').appendTo(section);
        
        // Add criteria items from config
        if (tab.CRITERIA) {
            tab.CRITERIA.forEach(criterion => {
                const criterionRow = $('<div class="criterion"></div>').appendTo(section);
                $('<span class="check-icon">✓</span>').appendTo(criterionRow);
                
                const labelSpan = $('<span class="criterion-label"></span>').text(criterion.LABEL);
                labelSpan.appendTo(criterionRow);
                
                if (criterion.DISPLAY) {
                    // Extract the value from the DISPLAY field
                    // In a real app, this would be populated from actual patient data
                    let displayValue = criterion.DISPLAY;
                    
                    // For demo purposes, use the values from the screenshot
                    if (criterion.LABEL.includes("Dosing Weight")) {
                        displayValue = "70 kg";
                    } else if (criterion.LABEL.includes("Est Creat Clear")) {
                        displayValue = "138.61 mL/min";
                    } else if (criterion.LABEL.includes("Serum Creatinine")) {
                        displayValue = "0.500 mg/dL";
                    }
                    
                    $('<span class="criterion-value"></span>').text(displayValue).appendTo(criterionRow);
                }
            });
        }
    }
    
    function renderLabsSection(tab, container) {
        // Phosphorus Labs section
        const phosphorusLabsSection = $('<div class="info-section"></div>').appendTo(container);
        $('<div class="info-header">Phosphorus Labs</div>').appendTo(phosphorusLabsSection);
        $('<div>No Results Found</div>').appendTo(phosphorusLabsSection);
        
        // Urine Output section
        const urineOutputSection = $('<div class="info-section"></div>').appendTo(container);
        $('<div class="info-header">Urine Output</div>').appendTo(urineOutputSection);
        $('<div>No Results Found</div>').appendTo(urineOutputSection);
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
            // Find the first visible order section based on the screenshot
            // In a real app, this would be determined by evaluating CONCEPT_NAME
            const visibleSection = tab.ORDER_SECTIONS.find(section => 
                section.SECTION_NAME.includes("Replace Therapy Requires a Phosphorus Lab"));
            
            if (visibleSection) {
                const orderSection = $('<div class="order-section"></div>').appendTo(container);
                $(`<div class="order-section-header">${visibleSection.SECTION_NAME}</div>`).appendTo(orderSection);
                
                const ordersList = $('<div class="orders-list"></div>').appendTo(orderSection);
                
                visibleSection.ORDERS.forEach(order => {
                    const orderItem = $('<div class="order-item"></div>').appendTo(ordersList);
                    
                    const checkbox = $(`<input type="checkbox" id="order-${order.MNEMONIC.replace(/\s+/g, '-')}" class="order-checkbox">`);
                    checkbox.appendTo(orderItem);
                    
                    const label = $(`<label for="order-${order.MNEMONIC.replace(/\s+/g, '-')}">${order.MNEMONIC}</label>`);
                    label.appendTo(orderItem);
                    
                    if (order.ORDER_SENTENCE) {
                        $(`<div class="order-details">${order.ORDER_SENTENCE}</div>`).appendTo(orderItem);
                    }
                    
                    if (order.COMMENT) {
                        $(`<div class="order-comment">${order.COMMENT}</div>`).appendTo(orderItem);
                    }
                });
            }
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
});

// Initialize the electrolyte advisor
function initializeAdvisor() {
    try {
        // Create a mock CCL response based on the configuration
        var cclResponse = createCCLResponse(window.currentConfig);
        console.log("CCL Response:", cclResponse);
        
        // Set the configuration for the advisor
        var advisor = new uhspa.tabbed_advisor({
            target: "#advisor-container",
            config_key: "ELECTROLYTE_ADVISOR"
        });
        
        // Set the configuration object
        advisor.config.object = window.currentConfig;
        
        // Add the CCL response to the configuration
        if (typeof cclResponse === 'object') {
            window.currentConfig.RCONFIG.JSON_RETURN = JSON.stringify(cclResponse);
        } else {
            window.currentConfig.RCONFIG.JSON_RETURN = cclResponse;
        }
        
        // Directly set the tab data for rendering (as a backup)
        if (cclResponse && cclResponse.RREC && cclResponse.RREC.TAB) {
            advisor.tabData = cclResponse.RREC.TAB;
        }
        
        // Render the advisor
        advisor.makeItSo();
    } catch (error) {
        console.error("Error initializing advisor:", error);
        $("#advisor-container").html("<div class='error'>Error initializing advisor: " + error.message + "</div>");
    }
}

// Create a mock CCL response based on the configuration
function createCCLResponse(config) {
    console.log("Creating CCL response with config:", config);
    
    // Check if config has the expected structure
    if (!config || !config.RCONFIG || !config.RCONFIG.TABS) {
        console.error("Invalid configuration structure:", config);
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
    
    console.log("Created CCL response:", response);
    return response;
} 