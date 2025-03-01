// Create a minimal version of the UHSPA framework
var uhspa = uhspa || {};

// Error handling
uhspa.error = function(err) {
    console.error("UHSPA Error:", err);
};

// Logging
uhspa.log = function(msg) {
    console.log("UHSPA Log:", msg);
};

// Helper to get component context
uhspa.me = function(a, thisObj) {
    return thisObj || a;
};

// UI helper functions
uhspa.common = {
    loadCCLwithBlob: function(cclProgram, params, callback, format, blob) {
        console.log("CCL call:", cclProgram, params, blob);
        // In a real environment, this would make a call to the Cerner CCL
        // For our demo, we'll simulate a response
        setTimeout(function() {
            if (callback) callback({success: true});
        }, 500);
    },
    fmtDate: function(date, format) {
        if (!date) return "";
        
        var d = new Date(date);
        var month = '' + (d.getMonth() + 1);
        var day = '' + d.getDate();
        var year = d.getFullYear();
        
        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;
        
        return [month, day, year].join('/');
    },
    createLogParams: function(encounterId, component, detail, action, status, comment) {
        return [
            "MINE",
            encounterId,
            component,
            detail,
            action,
            status,
            comment
        ];
    }
};

// Add ISO8601 date parsing to Date prototype
Date.prototype.setISO8601 = function(dString) {
    var regexp = /(\d\d\d\d)(-)?(\d\d)(-)?(\d\d)(T)?(\d\d)(:)?(\d\d)(:)?(\d\d)(\.\d+)?(Z|([+-])(\d\d)(:)?(\d\d))/;
    
    if (dString.indexOf("/Date(") === 0) {
        // Handle Microsoft JSON date format
        var timestamp = parseInt(dString.substring(6, dString.length - 2));
        this.setTime(timestamp);
        return this;
    }
    
    var d = dString.match(regexp);
    if (d) {
        var date = new Date(Date.UTC(
            parseInt(d[1], 10),
            parseInt(d[3], 10) - 1,
            parseInt(d[5], 10),
            parseInt(d[7], 10),
            parseInt(d[9], 10),
            parseInt(d[11], 10),
            parseFloat(d[12]) || 0
        ));
        
        if (d[13] !== 'Z') {
            var offset = (d[15] * 60) + parseInt(d[17], 10);
            offset *= ((d[14] === '-') ? -1 : 1);
            date.setTime(date.getTime() - offset * 60 * 1000);
        }
        
        this.setTime(date.getTime());
    }
    return this;
};

// Base component class
function UHSPA_COMPONENT() {
    this.config = { object: {} };
    this.ui = {
        div: function(options) {
            var div = $("<div></div>");
            if (options.target) $(options.target).append(div);
            if (options.addClass) div.addClass(options.addClass);
            if (options.content) div.html(options.content);
            if (options.id) div.attr('id', options.id);
            return div;
        },
        button: function(options) {
            var btn = $("<button></button>").text(options.text || "");
            if (options.target) $(options.target).append(btn);
            if (options.addClass) btn.addClass(options.addClass);
            if (options.click) btn.click(options.click);
            if (options.id) btn.attr('id', options.id);
            return btn;
        },
        icon: function(options) {
            var icon = $("<span></span>");
            if (options.target) $(options.target).append(icon);
            if (options.addClass) icon.addClass(options.addClass);
            return icon;
        },
        checkbox: function(options) {
            var container = $("<div></div>");
            if (options.addClass) container.addClass(options.addClass);
            
            var checkbox = $("<input type='checkbox'>");
            if (options.id) checkbox.attr('id', options.id);
            if (options.name) checkbox.attr('name', options.name);
            if (options.checked) checkbox.prop('checked', true);
            if (options.change) checkbox.change(options.change);
            
            container.append(checkbox);
            
            if (options.label) {
                var label = $("<label></label>").text(options.label);
                if (options.id) label.attr('for', options.id);
                container.append(label);
            }
            
            if (options.target) $(options.target).append(container);
            
            return container;
        },
        radio: function(options) {
            var container = $("<div></div>");
            if (options.addClass) container.addClass(options.addClass);
            
            var radio = $("<input type='radio'>");
            if (options.id) radio.attr('id', options.id);
            if (options.name) radio.attr('name', options.name);
            if (options.value) radio.attr('value', options.value);
            if (options.checked) radio.prop('checked', true);
            if (options.change) radio.change(options.change);
            
            container.append(radio);
            
            if (options.label) {
                var label = $("<label></label>").text(options.label);
                if (options.id) label.attr('for', options.id);
                container.append(label);
            }
            
            if (options.target) $(options.target).append(container);
            
            return container;
        }
    };
    
    this.set_component = function(component) {
        this.component = component;
    };
    
    this.getOption = function(key) {
        return (this.settings && this.settings[key]) || "";
    };
    
    this.getTarget = function() {
        return this.settings.target || "#advisor-container";
    };
    
    this.getProperty = function(key) {
        // Mock properties for demo
        var properties = {
            personId: "12345",
            encounterId: "67890"
        };
        return properties[key] || "";
    };
    
    this.loadCCL = function(program, params, callback, dataType) {
        uhspa.common.loadCCLwithBlob(program, params, callback, dataType);
    };
    
    this.evaluateEmbedded = function(text) {
        // Simple implementation to handle embedded HTML
        return text || "";
    };
    
    // Add a method to render criteria
    this.renderCriteria = function(criteria, target) {
        var self = this;
        
        // Check if criteria exists
        if (!criteria || !Array.isArray(criteria)) {
            console.log("No criteria to render or criteria is not an array");
            return;
        }
        
        // Create the criteria container
        var criteriaContainer = self.ui.div({
            target: target,
            addClass: 'criteria-container'
        });
        
        // Create the criteria header
        self.ui.div({
            target: criteriaContainer,
            addClass: 'criteria-header',
            content: 'Criteria'
        });
        
        // Create the criteria list
        var criteriaList = self.ui.div({
            target: criteriaContainer,
            addClass: 'criteria-list'
        });
        
        // Add each criterion
        $.each(criteria, function(index, criterion) {
            var criterionDiv = self.ui.div({
                target: criteriaList,
                addClass: 'criterion'
            });
            
            var label = self.ui.div({
                target: criterionDiv,
                addClass: 'criterion-label',
                content: criterion.LABEL
            });
            
            var value = self.ui.div({
                target: criterionDiv,
                addClass: 'criterion-value',
                content: criterion.DISPLAY
            });
        });
    };
    
    // Add a method to render lab results
    this.renderLabResults = function(labs, target) {
        var self = this;
        
        // Check if labs exists
        if (!labs || !Array.isArray(labs)) {
            console.log("No lab results to render or labs is not an array");
            return;
        }
        
        labs.forEach(function(lab) {
            var labDiv = self.ui.div({
                target: target,
                addClass: 'lab-result'
            });
            
            var label = self.ui.div({
                target: labDiv,
                addClass: 'lab-label',
                content: lab.LABEL
            });
            
            var value = self.ui.div({
                target: labDiv,
                addClass: 'lab-value',
                content: lab.VALUE + (lab.UNITS ? ' ' + lab.UNITS : '')
            });
            
            if (lab.AGE_IN_MINS) {
                var age = self.ui.div({
                    target: labDiv,
                    addClass: 'lab-age',
                    content: lab.AGE_IN_MINS
                });
            }
        });
    };
    
    // Add a method to render order sections
    this.renderOrderSections = function(sections, target) {
        var self = this;
        
        // Check if sections exists
        if (!sections || !Array.isArray(sections)) {
            console.log("No order sections to render or sections is not an array");
            return;
        }
        
        sections.forEach(function(section) {
            var sectionDiv = self.ui.div({
                target: target,
                addClass: 'order-section'
            });
            
            var header = self.ui.div({
                target: sectionDiv,
                addClass: 'section-header',
                content: section.SECTION_NAME
            });
            
            if (section.ORDERS && Array.isArray(section.ORDERS)) {
                section.ORDERS.forEach(function(order) {
                    var orderDiv = self.ui.div({
                        target: sectionDiv,
                        addClass: 'order-item'
                    });
                    
                    var radio = self.ui.radio({
                        target: orderDiv,
                        name: 'order_' + section.SECTION_NAME.replace(/\s+/g, '_'),
                        id: 'order_' + order.SYNONYM_ID
                    });
                    
                    var orderContent = self.ui.div({
                        target: orderDiv,
                        addClass: 'order-content'
                    });
                    
                    var sentence = self.ui.div({
                        target: orderContent,
                        addClass: 'order-sentence',
                        content: order.ORDER_SENTENCE
                    });
                    
                    if (order.OS_COMMENT) {
                        var comment = self.ui.div({
                            target: orderContent,
                            addClass: 'order-comment',
                            content: order.OS_COMMENT
                        });
                    }
                });
            }
        });
    };
} 