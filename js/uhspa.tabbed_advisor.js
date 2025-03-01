/**
 @file Tabbed Advisor
 @author John Doerr
 @version 001
 @namespace uhspa
 @class
 @description
********************************************************************************
 History
********************************************************************************
 Ver  By   Date        Ticket   Description
 ---  ---  ----------  -------  ------------
 001  JAD  08/03/2018  CD-1206  Genesis. Split from electrolyte advisor to create a generic tabbed advisor
 002  JAD  08/10/2018  CD-1375  Added links to external resource documentation to the model.
 003  JAD  08/16/2018  CD-1773  Added ability to configure the dismiss/sign button.
 004  msd  04/23/2019  CRR-184  get protocol document via url, add event code for documentation
 005  JAD  04/26/2022  CD-5151  Added a comment to address the use of discernObject library post-MPages 8 upgrade.
 006  mgp  12/18/2023  CD-6876  Added a cancel button that does not trigger concept removal
 007  msd  06/04/2024  CD-6677  updates for edge
 008  kpb  12/13/2024  CD-8227  updated to dismiss the concept and close when selecting "No Orders Necessary"
 009  kpb  12/17/2024  CD-8236  Updated to show order information for multiple duplicate orders
 End History
*******************************************************************************/
uhspa.tabbed_advisor = function UHSPA_TABBED_ADVISOR(settings) {
  settings = settings || {};
  this.loadCCLwithBlob = uhspa.common.loadCCLwithBlob;
  this.settings = settings;
  this.preLoadingDisplay = "Loading...";
  this.set_component(this);

  var configKey;

  /** MakeItSo
    @param {object[]} a - component.config.object
  */
  this.makeItSo = function makeItSo(a) {
    try {
      a = a || {};
      var component = uhspa.me(a, this);
      console.log("Making it so...");

      configKey = component.getOption('config_key');

      var target = component.getTarget();
      $(target).empty(); //Clears out the target so there are no residual artifacts
      component.data = component.config.object;

      var cclReply = JSON.parse(component.config.object.RCONFIG.JSON_RETURN);

      if (cclReply && cclReply.RREC.STATUS_DATA.STATUS) {
        component.cclReply = cclReply;
        switch (cclReply.RREC.STATUS_DATA.STATUS) {
          case "F":
            //CCL is indicating there was an issue. Display the status message.
            component.ui.div({
              target: target,
              addClass: 'uhspa-info-box',
              content: cclReply.RREC.STATUS_DATA.SUBEVENTSTATUS[0].TARGETOBJECTVALUE
            });
            break;
          default:
            component.here = cclReply;
            
            // IMPORTANT: Create the container structure first
            console.log("Creating container structure");
            
            // Create the main container first
            var mainContainer = component.ui.div({
              target: target,
              addClass: 'uhspa-tabbed-advisor-container',
              id: 'uhspa-tabbed-advisor-container'
            });
            
            // Create the tabs container
            var tabsContainer = component.ui.div({
              target: mainContainer,
              addClass: 'uhspa-tabs-container',
              id: 'uhspa-tabs-container'
            });
            
            // Create the tab content container
            var contentContainer = component.ui.div({
              target: mainContainer,
              addClass: 'uhspa-content-container',
              id: 'uhspa-content-container'
            });
            
            console.log("Container structure created");
            console.log("Content container exists:", $('#uhspa-content-container').length > 0 ? "Yes" : "No");
            
            // Create tab elements first
            if (cclReply.RREC.TAB) {
              console.log("Tab data set from CCL response:", cclReply.RREC.TAB);
              
              // First create all tab content divs
              $.each(cclReply.RREC.TAB, function (idx, tabObj) {
                // Make sure we have the tab ID
                var tabId = tabObj.ID || ('tab-' + idx);
                tabObj.ID = tabId; // Ensure ID is set
                
                console.log("Creating tab content div with ID:", tabId);
                
                // Create tab content div
                var tabContent = component.ui.div({
                  target: contentContainer,
                  addClass: 'uhspa-tab-content' + (idx === 0 ? ' active' : ''),
                  id: tabId
                });
                
                console.log("Tab content div created:", $('#' + tabId).length > 0 ? "Yes" : "No");
              });
              
              // Now create tab buttons with click handlers
              $.each(cclReply.RREC.TAB, function (idx, tabObj) {
                var tabId = tabObj.ID;
                
                // Create tab button
                var tabButton = component.ui.div({
                  target: tabsContainer,
                  addClass: 'uhspa-tab-button' + (idx === 0 ? ' active' : ''),
                  id: 'tab-button-' + idx,
                  content: tabObj.DISPLAY
                });
                
                // Add click handler to tab button
                tabButton.click(function() {
                  console.log("Tab button clicked:", tabId);
                  
                  // Remove active class from all buttons and contents
                  $('.uhspa-tab-button').removeClass('active');
                  $('.uhspa-tab-content').removeClass('active');
                  
                  // Add active class to this button and corresponding content
                  $(this).addClass('active');
                  $('#' + tabId).addClass('active');
                  
                  // Clear the tab content
                  $('#' + tabId).empty();
                  
                  // Render the tab content
                  component.renderTab(idx, tabObj, cclReply.RREC, $('#' + tabId));
                });
              });
              
              // Render the first tab initially
              if (cclReply.RREC.TAB.length > 0) {
                var firstTab = cclReply.RREC.TAB[0];
                var firstTabId = firstTab.ID;
                
                console.log("Rendering first tab:", firstTabId);
                console.log("First tab element exists:", $('#' + firstTabId).length > 0 ? "Yes" : "No");
                
                // Make sure the tab element exists before rendering
                if ($('#' + firstTabId).length > 0) {
                  component.renderTab(0, firstTab, cclReply.RREC, $('#' + firstTabId));
                } else {
                  console.error("First tab element not found:", firstTabId);
                }
              }
            }
            break;
        }
      }
    }
    catch (err) {
      uhspa.error(err);
    }
  };

  /** Render the advisor
    @param {object} a - Data object with target details
    @param {string} a.target - Target for the UI elements.
    @author John Doerr
  */
  this.renderTabbedAdvisor = function renderTabbedAdvisor(a) {
    try {
      a = a || {};
      var component = uhspa.me(a, this);
      
      // Clear the target first
      $(a.target).empty();
      
      // Create the main container
      var tabbedAdvisorRV = component.ui.div({
        target: a.target,
        addClass: "uhspa-tabbed-advisor ushpa-tabbed-advisor-container"
      });

      // Create the tabs container with jQuery UI structure
      var tabContainer = component.ui.div({
        target: tabbedAdvisorRV,
        addClass: "ushpa-tabbed-advisor-tabs uhspa-tabs"
      });

      // Initialize with the ul for jQuery UI tabs
      tabContainer.attr('id', 'ushpa-tabbed-advisor-tabs').html('<ul></ul>');

      var tabId = '';
      var selectedTab = -1;
      var cclReply = JSON.parse(component.config.object.RCONFIG.JSON_RETURN);

      if (cclReply && cclReply.RREC.STATUS_DATA.STATUS) {
        component.cclReply = cclReply;
        switch (cclReply.RREC.STATUS_DATA.STATUS) {
          case "F":
            //CCL is indicating there was an issue. Display the status message.
            tabContainer.append("<div>" + cclReply.RREC.STATUS_DATA.SUBEVENTSTATUS[0].TARGETOBJECTVALUE + "</div>");
            break;
          default:
            component.here = cclReply;
            if (cclReply.RREC.TAB) {
              // First, create all tab headers and empty content divs
              $.each(cclReply.RREC.TAB, function (idx, tabObj) {
                tabId = tabObj.ID || ('tab-' + idx);
                if (selectedTab == -1 && tabObj.STATUS == 'alert') {
                  selectedTab = idx;
                }
                
                // Create the tab header
                var tabIcon = tabObj.STATUS == 'alert' ? '<span class="uhspa-tabbed-advisor-flag-icon"></span>' : '';
                $(tabContainer).find('ul').append(
                  '<li><a href="#' + tabId + '"><div class="ui-tabs-label" title="' + 
                  tabObj.DISPLAY + '">' + tabObj.DISPLAY + '</div>' + tabIcon + '</a></li>'
                );
                
                // Create the empty tab content div
                $(tabContainer).append('<div id="' + tabId + '"></div>');
              });
              
              // Initialize jQuery UI tabs
              $(tabContainer).tabs({
                active: selectedTab >= 0 ? selectedTab : 0,
                activate: function (e, ui) {
                  console.log("Tab activate event triggered");
                  console.log("Previous panel:", ui.oldPanel.attr('id'));
                  console.log("New panel:", ui.newPanel.attr('id'));
                  
                  // Get the newly activated tab
                  var tabId = ui.newPanel.attr('id');
                  var tabIndex = -1;
                  
                  // Find the tab data by ID
                  var tabData = null;
                  $.each(cclReply.RREC.TAB, function(i, tab) {
                    if (tab.ID === tabId || 'tab-' + i === tabId) {
                      tabData = tab;
                      tabIndex = i;
                      return false; // Break the loop
                    }
                  });
                  
                  console.log("Found tab data:", tabData ? "Yes" : "No", "Index:", tabIndex);
                  
                  // Clear and re-render the tab content
                  if (tabData) {
                    ui.newPanel.empty();
                    component.renderTab(tabIndex, tabData, cclReply.RREC, ui.newPanel);
                  }
                }
              });
              
              // Add icon to alert tabs
              var tabIcon2 = component.ui.icon({
                source: 'SVG',
                value: 'Flag',
                addClass: 'uhspa-vector-xxsmall',
                target: tabContainer.find('.uhspa-tabbed-advisor-flag-icon')
              });
              
              // Render initial tab content
              $.each(cclReply.RREC.TAB, function (idx, tabObj) {
                tabId = tabObj.ID || ('tab-' + idx);
                var tabPanel = $('#' + tabId);
                
                // Only render the selected tab initially
                if (idx === selectedTab || (selectedTab === -1 && idx === 0)) {
                  component.renderTab(idx, tabObj, cclReply.RREC, tabPanel);
                }
              });
            }
            break;
        }
      }
    }
    catch (err) {
      uhspa.error(err);
    }
  };

  /** Render each tab of the advisor
    @param {number} idx - Index/tab number
    @param {object} objTab - Data object with the tab config
    @param {object} cclreplyObj - Data object with specific data for the tab
    @param target - Target for the UI elements.
    @author John Doerr
  */
  this.renderTab = function renderTab(idx, objTab, cclreplyObj, target) {
    try {
      console.log("renderTab called with idx:", idx);
      
      // Add defensive checks for all parameters
      if (!idx && !objTab) {
        console.error("renderTab called with no tab data");
        return;
      }
      
      // Check if idx is actually the tab object (parameter mismatch)
      if (idx && typeof idx === 'object') {
        console.log("Parameter mismatch detected - idx contains the tab object");
        // Fix the parameter order
        target = cclreplyObj;
        cclreplyObj = objTab;
        objTab = idx;
        idx = 0; // Default to 0 if we can't extract from ID
        
        if (objTab && objTab.ID) {
          // Try to extract numeric index from ID
          var idMatch = objTab.ID.match(/tab-(\d+)/);
          if (idMatch) {
            idx = parseInt(idMatch[1], 10);
          }
        }
      }
      
      // Ensure objTab is defined
      if (!objTab) {
        console.error("Tab object is undefined");
        return;
      }
      
      console.log("Processing tab:", objTab.DISPLAY || "Unknown Tab");
      
      // Get the target element
      var targetElement;
      if (target) {
        targetElement = $(target);
      } else if (objTab.ID) {
        targetElement = $('#' + objTab.ID);
      } else {
        // If no ID, create a generic ID
        objTab.ID = 'tab-' + idx;
        targetElement = $('#' + objTab.ID);
      }
      
      if (!targetElement || targetElement.length === 0) {
        console.error("Target element not found for tab:", objTab.ID || "unknown");
        
        // Try to find the content container
        var contentContainer = $('#uhspa-content-container');
        if (contentContainer.length > 0) {
          // Create the tab content div
          console.log("Creating missing tab content div with ID:", objTab.ID);
          contentContainer.append('<div id="' + objTab.ID + '" class="uhspa-tab-content"></div>');
          targetElement = $('#' + objTab.ID);
        } else {
          console.error("Content container not found, cannot create tab content div");
          return;
        }
      }
      
      console.log("Target element found:", targetElement.attr('id'));
      
      // Clear the target element
      targetElement.empty();
      
      // Create the tab content
      var tabContent = $('<div class="tab-content"></div>');
      
      // Add the tab header
      tabContent.append('<h2>' + (objTab.DISPLAY || "Tab") + '</h2>');
      
      // Add criteria section
      if (objTab.CRITERIA && objTab.CRITERIA.length > 0) {
        var criteriaSection = $('<div class="criteria-section"></div>');
        criteriaSection.append('<h3>Criteria</h3>');
        
        $.each(objTab.CRITERIA, function(i, criterion) {
          var display = criterion.NAME || criterion.DISPLAY || "";
          var value = criterion.VALUE || "No value";
          var pass = criterion.VALID_IND === true;
          
          criteriaSection.append(
            '<div class="criterion">' +
            '<span class="' + (pass ? 'pass-icon' : 'fail-icon') + '">X</span>' +
            '<span class="criterion-label">' + display + ':</span>' +
            '<span class="criterion-value">' + value + '</span>' +
            '</div>'
          );
        });
        
        tabContent.append(criteriaSection);
      }
      
      // Add lab results section
      if (objTab.LAB_RESULTS && objTab.LAB_RESULTS.length > 0) {
        var labsSection = $('<div class="labs-section"></div>');
        labsSection.append('<h3>Lab Results</h3>');
        
        $.each(objTab.LAB_RESULTS, function(i, lab) {
          labsSection.append(
            '<div class="lab-result">' +
            '<div class="lab-name">Lab ' + (i+1) + '</div>' +
            '<div class="lab-value">' + (lab.VALUE || "") + ' ' + (lab.UNITS || "") + '</div>' +
            '</div>'
          );
        });
        
        tabContent.append(labsSection);
      }
      
      // Add orders section
      if (objTab.ORDER_SECTION && Array.isArray(objTab.ORDER_SECTION)) {
        var ordersSection = $('<div class="orders-section"></div>');
        ordersSection.append('<h3>Orders</h3>');
        
        $.each(objTab.ORDER_SECTION, function(i, section) {
          if (section.ORDERS && Array.isArray(section.ORDERS)) {
            $.each(section.ORDERS, function(j, order) {
              ordersSection.append(
                '<div class="order-item">' +
                '<input type="checkbox" id="order-' + i + '-' + j + '">' +
                '<label for="order-' + i + '-' + j + '">' + 
                (order.ORDER_SENTENCE || order.SENTENCE || order.MNEMONIC || "Order") + 
                '</label>' +
                (order.COMMENT ? '<div class="order-comment">' + order.COMMENT + '</div>' : '') +
                '</div>'
              );
            });
          }
        });
        
        tabContent.append(ordersSection);
      }
      
      // Add the tab content to the target element
      targetElement.append(tabContent);
      console.log("Content rendered for tab:", objTab.DISPLAY || "Unknown Tab");
      
    } catch (error) {
      console.error("Error rendering tab:", error);
      console.error(error.stack);
    }
  };

  /** Render the "info" column on the left side
    @param target - Target for the UI elements.
    @param {object} objTab - Data object with the tab config
    @param {object} cclreplyObj - Data object with specific data for the tab
    @author John Doerr
  */
  this.renderInfoColumn = function renderInfoColumn(target, objTab, cclreplyObj) {
    try {
      var component = uhspa.me(this);
      target.html('');
      var orderByName = objTab.ORDER_PROVIDER_NAME;

      /* Draw the order by section */
      var orderByContainer = component.ui.div({
        target: target,
        addClass: 'uhspa-info-box'
      });

      var orderByHeader = component.ui.div({
        target: orderByContainer,
        addClass: 'uhspa-header',
        content: 'Ordered By'
      });

      var orderByProv = component.ui.div({
        target: orderByContainer,
        addClass: 'ushpa-tabbed-advisor-normal-text',
        content: orderByName
      });

      /* Draw the critria section */
      var criteriaContainer = component.ui.div({
        target: target,
        addClass: 'uhspa-info-box'
      });

      var criteriaHeader = component.ui.div({
        target: criteriaContainer,
        addClass: 'uhspa-header',
        content: 'Criteria'
      });

      var criteria = component.ui.div({
        target: criteriaContainer,
        addClass: 'ushpa-tabbed-advisor-normal-text'
      });


      component.renderCriteriaList(criteria, objTab.CRITERIA);
      component.renderGraphedResults(target, objTab.GRAPH, 1);

      if (objTab.RESOURCE_URLS && objTab.RESOURCE_URLS.length > 0) {
        component.renderResourceLink(target, objTab.RESOURCE_URLS);
      }
    }
    catch (err) {
      uhspa.error(err);
    }
  };

  /** Render the criteria listing in the column on the left side
    @param target - Target for the UI elements.
    @param {object} criteriaObj - Data object with the criteria data
    @author John Doerr
  */
  this.renderCriteriaList = function renderCriteriaList(target, criteriaObj) {
    try {
      var component = this;
      var sHTML = [];

      var criteriaRowContainer = component.ui.div({
        target: target,
        addClass: 'ushpa-tabbed-advisor-criteria-box'
      });

      $.each(criteriaObj, function (idx, obj) {
        var criteriaRow = component.ui.div({
          target: criteriaRowContainer,
          addClass: 'ushpa-tabbed-advisor-criteria-row'
        });

        var criteriaIcon = component.ui.div({
          target: criteriaRow,
          addClass: 'ushpa-tabbed-advisor-info-icon uhspa-icon'
        });

        if (obj.VALID_IND) {
          criteriaIcon.addClass('uhspa-icon-satisfied');
        }
        else {
          criteriaIcon.addClass('uhspa-icon-warning');
        }

        var criteriaText = component.ui.div({
          target: criteriaRow,
          addClass: 'ushpa-tabbed-advisor-normal-text',
          content: obj.NAME
        });

        criteriaText.addClass('ushpa-tabbed-advisor-criteria-text');

        var criteriaValue = component.ui.div({
          target: criteriaRow,
          addClass: 'ushpa-tabbed-advisor-normal-text',
          content: obj.VALUE
        });
        criteriaValue.addClass('ushpa-tabbed-advisor-criteria-result');

        if (obj.TOOLTIP && obj.TOOLTIP.length > 0) {
          /* Generates the tooltip on hover of a criteria row */
          criteriaIcon.uhstooltip({
            tooltipClass: 'uhspa-tabbed-advisor-tooltip',
            content: obj.TOOLTIP,
            items: 'div',
            show: null,
            position: {
              my: "left top",
              at: "left bottom",
              collision: "flipfit flip",
              of: criteriaRow
            },
            open: function (event, ui) {
              ui.tooltip.css("max-width", "1000px");
              if (typeof (event.originalEvent) === 'undefined') {
                return false;
              }
            },
            close: function (event, ui) {
              ui.tooltip.hover(function () {
                $(this).stop(true).fadeTo(400, 1);
              },
              function () {
                $(this).fadeOut('400', function () {
                  $(this).remove();
                });
              });
            }
          });

          criteriaValue.uhstooltip({
            tooltipClass: 'uhspa-tabbed-advisor-tooltip',
            content: obj.TOOLTIP,
            items: 'div',
            show: null,
            position: {
              my: "left top",
              at: "left bottom",
              collision: "flipfit flip",
              of: criteriaRow
            },
            open: function (event, ui) {
              ui.tooltip.css("max-width", "1000px");
              if (typeof (event.originalEvent) === 'undefined') {
                return false;
              }
            },
            close: function (event, ui) {
              ui.tooltip.hover(function () {
                $(this).stop(true).fadeTo(400, 1);
              },
              function () {
                $(this).fadeOut('400', function () {
                  $(this).remove();
                });
              });
            }
          });
        }
      });

      var criteriaWarning = component.ui.div({
        target: criteriaRowContainer,
        addClass: 'ushpa-tabbed-advisor-tiny-text',
        content: 'For reference only.  Use clinical judgement.'
      });
    }
    catch (err) {
      uhspa.error(err);
    }
  };

  /** Render the graphed results in the column on the left side
    @param target - Target for the UI elements.
    @param {object} resultObj - Data object with the results
    @param {number} bChartedOnly - ?
    @author Eric Smith
  */
  this.renderGraphedResults = function renderGraphedResults(target, graphObj, bChartedOnly) {
    try {
      var component = this;
      var sHTML = [];
      var subTarget;
      var totalResults = 0;
      var graphedTabResultsLabel = 'Graphed Results';
      var maxResults = 3; //Displaying more than 3 causes all sorts of alignment issues.

      $.each(graphObj, function (idx, resultObj) {
        component.log(resultObj);
        /* Draw the tab-specific graphed results section */
        var graphedTabResultsContainer = component.ui.div({
          target: target,
          addClass: 'uhspa-info-box'
        });

        if (resultObj.LABEL && resultObj.LABEL.length > 0) {
          graphedTabResultsLabel = resultObj.LABEL;
        }

        var graphedTabResultsHeader = component.ui.div({
          target: graphedTabResultsContainer,
          addClass: 'uhspa-header',
          content: graphedTabResultsLabel
        });

        var graphedTabResults = component.ui.div({
          target: graphedTabResultsContainer,
          addClass: 'ushpa-tabbed-advisor-normal-text'
        });

        $.each(resultObj.RESULTS, function (idx2, obj) {
          sHTML = [];
          if (obj.DTA && (obj.DTA.length == 1 || bChartedOnly == 0)) {
            subTarget = $("<div>" + obj.DISPLAY + "</div>").appendTo(graphedTabResults);
          }
          if (obj.DTA && obj.DTA.length == 1) {
            var sparkVals = [];
            sHTML.push("<div style='clear: both; overflow: hidden;'>");
            sHTML.push("<div class='uhspa-tabbed-advisor-spark-container' style='margin-top:.5em; cursor: pointer;'>&nbsp;</div>");
            totalResults = totalResults + obj.DTA[0].RESULT.length;
            $.each(obj.DTA, function (idx, objDTA) {
              $.each(objDTA.RESULT, function (idx, objResult) {
                if (idx < maxResults) {
                  sHTML.push("<div class='uhspa-tabbed-advisor-tight uhspa-event-cell ", objResult.NORMALCY_MEAN, "'>");
                  sHTML.push("<div>");
                  if (objResult.NORMALCY_CD > 0) {
                    sHTML.push("<span class='uhspa-icon'>&nbsp;</span>");
                  }
                  sHTML.push("<span class='uhspa-link uhspa-ce-result' data-eventid='", objResult.EVENT_ID, "'>", objResult.RESULT_VAL, "</span>");
                  sHTML.push("</div>");
                  sHTML.push("<div class='uhspa-uom'>", objResult.WITHIN, "</div>");
                  sHTML.push("</div>");
                }
                sparkVals.unshift(parseFloat(objResult.RESULT_VAL));
              });
            });

            sHTML.push("</div>");
            subTarget.append(sHTML.join(""));
            subTarget.find('.uhspa-tabbed-advisor-spark-container').sparkline(sparkVals, {
              width: '5em'
            }).click(function () {
              var params = '^MINE^';
              var lookbackLabel = obj.DISPLAY;
              var graphLabel = 'Last ' + resultObj.MAX_RESULT_COUNT + ' ' + obj.DISPLAY + ' results';

              params = params + "," + component.getProperty('personId') + ".0";
              params = params + "," + component.getProperty('encounterId') + ".0";
              params = params + "," + obj.DTA[0].EVENT_CD + ".0";
              params = params + "," + '^' + component.getProperty('staticLocation') + '/UnifiedContent/discrete-graphing^';
              params = params + "," + "0.0"; //Group
              params = params + "," + component.getProperty('userId') + ".0";
              params = params + "," + "0.0"; //Position
              params = params + "," + "0.0"; //PPR
              params = params + "," + resultObj.RESULTS_VIEW.LOOKBACK_UNITS; //Lookback units
              params = params + "," + resultObj.RESULTS_VIEW.LOOKBACK_UNIT_TYPE; //Lookback unit type
              params = params + "," + resultObj.MAX_RESULT_COUNT; //Max results
              if (resultObj.RESULTS_VIEW.LOOKACK_LABEL && resultObj.RESULTS_VIEW.LOOKACK_LABEL.length > 0) {
                lookbackLabel = resultObj.RESULTS_VIEW.LOOKACK_LABEL;
              }
              params = params + "," + "^" + lookbackLabel + "^"; //Lookback text

              if (resultObj.RESULTS_VIEW.LABEL && resultObj.RESULTS_VIEW.LABEL.length > 0) {
                graphLabel = resultObj.RESULTS_VIEW.LABEL;
              }
              params = params + "," + "^" + graphLabel + "^"; //Graph Title

              params = params + "," + "^^"; //Evt1 Label
              params = params + "," + "^^"; //Evt2 Label
              component.log(params);
              if (uhspa.Vulcan === undefined) {
                CCLLINK('mp_retrieve_graph_results', params, 0);
              }
              else {
                uhspa.Vulcan.FrameworkLink.launchCCLReport({
                  reportName: "mp_retrieve_graph_results",
                  reportParam: params
                });
              }
            });
          }
        });
        if (totalResults == 0) {
          subTarget = $("<div style='font-size:.9em; color: #666666'>No Results Found</div>").appendTo(graphedTabResults);
        }

        /*
          Post MPages 8, anything that expects a return needs to have additional logic to handle the difference in what is returned
          from the old way versus the Vulcan way. This will continue to work post-MPages 8 upgrade because the code is not
          expecting a return of any sort. It opens the results viewer based on the provided IDs. If the call fails, the window
          doesn't open.
        */
        graphedTabResults.find('.uhspa-ce-result').click(function (e) {
          if (uhspa.Vulcan === undefined) {
            var objPVViewerMPage = window.external.DiscernObjectFactory("PVVIEWERMPAGE");
            objPVViewerMPage.CreateEventViewer(component.getProperty("personId"));
            objPVViewerMPage.AppendEvent($(this).data('eventid'));
            objPVViewerMPage.LaunchEventViewer();
          }
          else {
            uhspa.Vulcan.Viewers.launchResultViewer({
              personId: component.getProperty("personId"),
              eventIds: [$(this).data('eventid')]
            });
          }
        });
      });
    }
    catch (err) {
      uhspa.error(err);
    }
  };

  /** Render the resource links in the column on the left side
    @param target - Target for the UI elements.
    @param {object} resourceURLs - Data object with resouce link config
    @author John Doerr
  */
  this.renderResourceLink = function renderResourceLink(target, resourceURLs) {
    try {
      var component = uhspa.me(this);
      var resourceContainer = component.ui.div({
        target: target,
        addClass: 'uhspa-info-box'
      });

      var resourceHeader = component.ui.div({
        target: resourceContainer,
        addClass: 'uhspa-header',
        content: 'Additional Resource(s)'
      });

      //Old school hard coded HTML hyperlink because the ui.link doesn't allow the new window functionality
      $.each(resourceURLs, function (idx, resourceURLs) {
        var alink = $('<a href="' + resourceURLs.URL + '" target="_blank" class="uhspa-link">' + resourceURLs.LABEL + '</a><br>').appendTo(resourceContainer);
      });
      /*
      var resourceLink = component.ui.link({
        target: resourceContainer,
        content: resourceURL,
        href: resourceURL
      });
*/
    }
    catch (err) {
      uhspa.error(err);
    }
  };

  /** Render the main column on the right side
    @param target - Target for the UI elements.
    @param {object} objTab - Data object with the tab config
    @author John Doerr
  */
  this.renderMainColumn = function renderMainColumn(target, objTab) {
    try {
      var component = uhspa.me(this);
      target.html('');

      if (objTab.STATUS_TEXT && objTab.STATUS_TEXT.length > 0) {
        component.renderFailureList(target, objTab.STATUS_TEXT);
      }

      var orderList = component.ui.div({
        target: target,
        addClass: 'uhspa-info-box'
      });
      component.renderOrderList(orderList, objTab);
      component.renderLastReview(target, objTab.LAST_REVIEWED_DT_TM);
    }
    catch (err) {
      uhspa.error(err);
    }
  };

  /** Render the list of failed criteria so the user is aware.
    @param target - Where the div containing the list gets attached
    @param {string} statusText - Text to be displayed
    @author John Doerr
  */
  this.renderFailureList = function renderFailureList(target, statusText) {
    try {
      var component = this;
      var failureContainer = component.ui.div({
        target: target,
        addClass: 'uhspa-info-box'
      });

      var failureList = component.ui.div({
        target: failureContainer,
        addClass: 'uhspa-tabbed-advisor-criteria-failure-text',
        content: statusText
      });
    }
    catch (err) {
      uhspa.error(err);
    }
  };

  /** Evaluate dynamic text and return the result
    @param {string} sourceString - The string of text to be evaluated
    @author Mike Dougherty
  */
  this.evaluateEmbedded = function evaluateEmbedded(sourceString) {
    var component = this;
    /* initialize the return value (rv) with the input string */
    var rv = sourceString;
    /* literal [f( prefix, then capture any character that is not nothing lazy expand zero or more times, then literal )] suffix */
    var reF = /\[f\(([^]*?)\)\]/g; // ex:  [f( code )]
    /* if the regex matches anything in the sourceString */
    if (reF.test(sourceString)) {
      /* overwrite return value (rv) with the matches replaced with the evaluation of the captured code */
      rv = sourceString.replace(reF, function (fullmatch, code) {
        /* make a function body from the literal text containing try..catch and either
          the raw code (if it contains an explicit return) or
          literal return and wrap the code (as an expression) inside parentheses
          */
        var fnBody = 'try{ '
                    + ((/return/i).test(code) ? code : 'return (' + code + ')')
                    + ' } catch(err){ '
                    + ' throw err '
                    + ' } '
                    ;
        /* create a new function that accepts component parameter and has fnBody as its body */
        var fn = new Function('component', fnBody);
        try {
          /* assign replace_result variable with the return from applying the component object
          to the function as both the "this" object AND as the first parameter
          */
          var replace_result = fn.apply(component, [component]);
        }
        catch (err) {
          /* put something in the log because the function failed */
          component.log('Error in evaluateEmbedded: ' + err.description);
          /* show the failed code face-up with prefix and suffix as indicator that bad happened */
          replace_result = "***\n" + code + "\n***";
        }
        return replace_result;
      });
    }
    /* now that the return value (rv) has either no replacements to make, or all replacements were made,
    exit the evaluateEmbedded function by returning the return value (rv)
    */
    return rv;
  };

  /** create protocol note
    @param {object} a
    @param {string} a.protocolurl - source url to get document content
    @param {number} a.protocoleventcd - event code to put document content
    @param {string} a.event_title_text - event title text
    ex: createProtocolNote({protocolurl: '', protocoleventcd: 0, event_title_text: '' }).then( function(p){  } )
  */
  this.createProtocolNote = function (a) {
    try {
      a = a || {};
      var component = uhspa.me(a, this);
      /* get a jquery deferred object (promise) */
      var dfd = $.Deferred();
      /* if protocolurl is not undefiend (it's required) */
      if (a.protocolurl !== undefined) {
        /* either the protocolurl ended in .pdf and is implicitly also available as .rtf,
          or the protocolurl is assumed to already be rtf even without checking an extension
          */
        var protocolrtf = a.protocolurl.replace(/\.pdf$/, '.rtf');
        try {
          /* make sure jquery's ajax support allows cross domain requests */
          $.support.cors = true;
          /* jquery ajax get returns a promise, then... */
          $.get(protocolrtf).then(
            /* handle the return object from the .get() */
            function (documentContent) {
              /* send documentContent to add event code as a document wth the event_title_text and protocoleventcd passed */
              component.loadCCLwithBlob(
                "UHS_MPG_ADD_EVENT_CODE",
                [
                  "MINE",
                  component.getProperty('personId'),
                  component.getProperty('encounterId'),
                  component.getProperty('userId'),
                  a.protocoleventcd,
                  "DOC",
                  "",
                  "NOW"
                ],
                function (d) {
                  /* resolve the promise with the return from add event code */
                  dfd.resolve(d);
                },
                "JSON",
                JSON.stringify({
                  "inputFormat": "RTF",
                  "storeFormat": "RTF",
                  "event_title_text": a.event_title_text,
                  "content": documentContent,
                  "chart_as": "DOC"
                })
              );
            }
          );
        }
        catch (err) {
          uhspa.error(err);
        }
      }
      return dfd.promise();
    }
    catch (err) {
      uhspa.error(err);
    }
  };

  /** Render a list of orders that made it through the flexing gauntlet and can be placed by the user.
    @param target - Where the div containing the list gets attached
    @param {object} objTab - Data object with the tab config
    @author John Doerr
  */
  this.renderOrderList = function renderOrderList(target, objTab) {
    try {
      var component = this;
      var sHTML = [];
      var alertMsg = 'No orders qualify.';
      var orderObj = objTab.GROUP; //Data object with the stored orders

      if (orderObj.length == 0) {
        var orderContainer = component.ui.div({
          target: target,
          addClass: 'uhspa-info-box'
        });

        var orderHeader = component.ui.div({
          target: orderContainer,
          addClass: 'uhspa-header',
          content: alertMsg
        });
      }
      else {
        var groupsSeen = {};
        var currentGroup = '';
        var currentTarget = {};
        $.each(orderObj, function (grpidx, grp) {
          var orderContainer = component.ui.div({
            target: target,
            addClass: 'uhspa-info-box'
          });

          if (grp.ORDERS.length > 0) {
            if (currentGroup != grp.GROUP_NAME) {
              currentGroup = grp.GROUP_NAME;
            }

            var orderHeader = component.ui.div({
              target: orderContainer,
              addClass: 'uhspa-header',
              content: currentGroup
            });

            $.each(grp.ORDERS, function (idx, obj) {
              var orderDetailContainer = component.ui.div({
                target: orderContainer,
                addClass: 'ushpa-tabbed-advisor-normal-text uhspa-bold'
              });

              if (grp.SINGLE_SELECT) {
                switch (grp.SINGLE_SELECT) {
                  case 0:
                    var checkedVal = obj.SYNONYM_ID + "|" + obj.ORDER_SENTENCE_ID;
                    var orderCheckbox = component.ui.checkbox({
                      target: orderDetailContainer,
                      checked_value: checkedVal,
                      addClass: 'ushpa-tabbed-advisor-normal-text',
                      click: function (e) {
                        comp.setButtonStatus();
                      }
                    });
                    break;
                  case 1:
                    //Helpful note: Radio buttons must share the same name in order to be single select.
                    orderDetailContainer.append("<input type='radio' name='orderRadio' value='" + obj.SYNONYM_ID + "|" + obj.ORDER_SENTENCE_ID + "' />");
                    break;
                  default:
                    break;
                }
              }
              else { //Default to checkbox if nothing was configured.
                var checkedVal = obj.SYNONYM_ID + "|" + obj.ORDER_SENTENCE_ID;
                var orderCheckbox = component.ui.checkbox({
                  target: orderDetailContainer,
                  checked_value: checkedVal,
                  addClass: 'ushpa-tabbed-advisor-normal-text',
                  click: function (e) {
                    comp.setButtonStatus();
                  }
                });
              }

              var orderMnemonic = component.ui.div({
                target: orderDetailContainer,
                addClass: 'ushpa-tabbed-advisor-normal-text uhspa-tabbed-advisor-order-mne',
                content: obj.MNEMONIC
              });

              //The CCL checks for existing orders on the patient. If there is some, warn the user.
              if (obj.DUPLICATE_IND && obj.DUPLICATE_IND > 0) {
                var warningTooltip = 'Existing order(s) found:';

                var duplicateWarning = component.ui.span({
                  target: orderDetailContainer,
                  addClass: 'uhspa-tabbed-advisor-dup-warning uhspa-icon uhspa-icon-warning'
                });

                if (obj.DUPLICATE_ORDER_MNE && obj.DUPLICATE_ORDER_MNE.length > 0) {
                  // get all duplicate orders with mnemonic
                  var duplicatesWithInfo = [];
                  $.each(obj.DUPLICATE_DETAILS, function (idx, duplicate) {
                    if (duplicate.DUPLICATE_MNE && duplicate.DUPLICATE_MNE.length > 0) {
                      duplicatesWithInfo.push(duplicate);
                    }
                  });
                  // add each duplicate to tooltip str
                  $.each(duplicatesWithInfo, function (idx, duplicateToDisplay) {
                    warningTooltip = warningTooltip + '<br>' + ' - ' +
                      '<b>' + duplicateToDisplay.DUPLICATE_MNE + '</b> ' + duplicateToDisplay.DUPLICATE_CLIN_DISP;
                  });
                  warningTooltip = warningTooltip + '</ul></span>';
                  /* Generates the tooltip on hover of an order with an existing duplicate on the order profile */
                  orderDetailContainer.uhstooltip({
                    tooltipClass: 'uhspa-tabbed-advisor-tooltip',
                    content: warningTooltip,
                    items: 'div',
                    show: null,
                    position: {
                      my: "left top",
                      at: "left bottom",
                      collision: "flipfit flip",
                      of: orderContainer
                    },
                    open: function (event, ui) {
                      ui.tooltip.css("max-width", "1000px");
                      if (typeof (event.originalEvent) === 'undefined') {
                        return false;
                      }
                    },
                    close: function (event, ui) {
                      ui.tooltip.hover(function () {
                        $(this).stop(true).fadeTo(400, 1);
                      },
                      function () {
                        $(this).fadeOut('400', function () {
                          $(this).remove();
                        });
                      });
                    }
                  });
                }
                else { //If the order name wasn't provided by the CCL, use default wording for the duplicate warning.
                  orderDetailContainer.uhstooltip({
                    tooltipClass: 'uhspa-tabbed-advisor-tooltip',
                    content: 'Duplicate order exists. Please check patient chart.',
                    items: 'div',
                    show: null,
                    open: function (event, ui) {
                      ui.tooltip.css("max-width", "1000px");
                      if (typeof (event.originalEvent) === 'undefined') {
                        return false;
                      }
                    },
                    close: function (event, ui) {
                      ui.tooltip.hover(function () {
                        $(this).stop(true).fadeTo(400, 1);
                      },
                      function () {
                        $(this).fadeOut('400', function () {
                          $(this).remove();
                        });
                      });
                    }
                  });
                }
              }

              var orderSentence = component.ui.div({
                target: orderDetailContainer,
                addClass: 'ushpa-tabbed-advisor-order-detail-text',
                content: obj.ORDER_SENTENCE
              });

              var orderComment = component.ui.div({
                target: orderDetailContainer,
                addClass: 'ushpa-tabbed-advisor-order-comment uhspa-uom',
                content: component.evaluateEmbedded(obj.OS_COMMENT) //Call the dynamic text evaluator and display the result
              });
            });
          }
        });
      }
      target.find('input').click(function (e) {
        component.setButtonStatus(objTab);
      });
    }
    catch (err) {
      uhspa.error(err);
    }
  };

  /** Display date of last review for this tab
    @param target - Where the div containing the list gets attached
    @param {date} lastReviewed - Value sent back from CCL with the date of last review for this tab
    @author John Doerr
  */
  this.renderLastReview = function renderLastReview(target, lastReviewed) {
    try {
      var component = this;
      if (lastReviewed != '/Date(0000-00-00T00:00:00.000+00:00)/') { //Dont' display if the field is 'empty'
        //This? This is how you parse, format and display dates from Cerner.
        var convertedLastReviewed = new Date();
        convertedLastReviewed.setISO8601(lastReviewed);
        var dateFmt = 'Last reviewed on: ' + uhspa.common.fmtDate(convertedLastReviewed, 'read');

        var lastReviewedContainer = component.ui.div({
          target: target,
          addClass: 'uhspa-tabbed-advisor-last-reviewed',
          content: dateFmt
        });

        //Change the formatting if the tab hasn't been reviewed in more than 24 hours.
        if ((Date.now() - convertedLastReviewed) > 24 * 60 * 60 * 1000) {
          lastReviewedContainer.addClass('uhspa-tabbed-advisor-last-reviewed-over-24h');
        }
      }
    }
    catch (err) {
      uhspa.error(err);
    }
  };

  /** Render the button for the specific tab
    @param {number} idx - Index/tab number
    @param target - Where the button gets attached
    @param {object} objTab - Data object with the tab config
    @author John Doerr
  */
  this.renderActionButton = function renderActionButton(idx, target, objTab) {
    try {
      var component = this;

      if (objTab.SUBMIT_BUTTON.DISMISS_LABEL && objTab.SUBMIT_BUTTON.DISMISS_LABEL.length > 0) {
        var initialLabel = objTab.SUBMIT_BUTTON.DISMISS_LABEL;
      }
      else {
        var initialLabel = 'Dismiss';
      }

      actionBtn = component.ui.button({
        target: target,
        text: initialLabel,
        addClass: 'uhspa-tabbed-advisor-submit-button',
        click: function () {
          return component.signOrders(idx, target, objTab);
        }
      });
    }
    catch (err) {
      uhspa.error(err);
    }
  };

  /** Change the text of the submit button depending on how many orders were selected
    @param {object} objTab - Data object with the tab config
    @author John Doerr
  */
  this.setButtonStatus = function setButtonStatus(objTab) {
    try {
      var curTab = $('.ui-tabs-panel:visible');
      var btn = curTab.find('.uhspa-tabbed-advisor-submit-button');

      if (objTab.SUBMIT_BUTTON.DISMISS_LABEL && objTab.SUBMIT_BUTTON.DISMISS_LABEL.length > 0) {
        var dismissLabel = objTab.SUBMIT_BUTTON.DISMISS_LABEL;
      }
      else {
        var dismissLabel = 'Dismiss';
      }

      if (objTab.SUBMIT_BUTTON.SIGN_LABEL && objTab.SUBMIT_BUTTON.SIGN_LABEL.length > 0) {
        var signLabel = objTab.SUBMIT_BUTTON.SIGN_LABEL;
      }
      else {
        var signLabel = 'Sign';
      }

      if (curTab.find('input:checked').length == 0) {
        btn.html(dismissLabel);
      }
      else {
        btn.html(signLabel);
      }
    }
    catch (err) {
      uhspa.error(err);
    }
  };

  /** Calls mPage event to sign selected orders and add a row to the event log. If no orders are available, still log.
    @param {number} idx - Index of the order being placed
    @param target - Tab containing the order that's being placed
    @param {object} objTab - Data object with the tab config
    @author Eric Smith
  */
  this.signOrders = function signOrders(idx, target, objTab) {
    try {
      var component = this;
      var newOrders = target.find('input:checked');
      var ordersParam;
      var orderOrigination = 0;
      var nomenId = 0;
      var signTimeInteractionFlag = 1;
      var enablePowerPlans = 0;
      var tabDisplay = "{2|127}";
      var defaultDisplay = 32;
      var silentSign = 1;
      var eventDetail = target.attr('id');

      var conceptKey = objTab.CONCEPT_FOR_DISMISS; //Used by dismissWindow
      if (newOrders.length == 0) {
        component.loadCCL("UHS_MPG_ADD_EVENT_LOG", uhspa.common.createLogParams(component.getProperty("encounterId"), "TABBEDADVISOR", eventDetail, "Dismiss/No Orders Necessary", 0, ""), function (data) {
          return;
        }, "TEXT");
        component.dismissWindow(idx, conceptKey);
      }
      else {
        component.loadCCL("UHS_MPG_ADD_EVENT_LOG", uhspa.common.createLogParams(component.getProperty("encounterId"), "TABBEDADVISOR", eventDetail, "Orders Placed", 0, ""), function (data) {
          return;
        }, "TEXT");
        ordersParam = component.getProperty('personId') + "|" + component.getProperty('encounterId') + "|";
        $(newOrders).each(function (idx, ord) {
          ordVals = $(ord).val();
          synonymId = ordVals.split("|")[0];
          orderSentenceId = ordVals.split("|")[1];
          ordersParam = ordersParam + "{ORDER|" + synonymId + "|" + orderOrigination + "|" + orderSentenceId + "|" + nomenId + "|" + signTimeInteractionFlag + "}";
        });
        ordersParam = ordersParam + "|" + enablePowerPlans + "|" + tabDisplay + "|" + defaultDisplay + "|" + silentSign;
        var prom = MPAGES_EVENT("ORDERS", ordersParam);
        if (prom === undefined) {
          component.dismissWindow(idx, conceptKey);
        }
        else {
          prom.then(function () {
            component.dismissWindow(idx, conceptKey);
          });
        }
      }
    }
    catch (err) {
      uhspa.error(err);
    }
  };

  /** Render the cancel button for the specific tab
    @param target - Where the button gets attached
    @param {object} objTab - Data object with the tab config
    @param {string} conceptKey - Name key for the concept to be removed on order
    @author Mia Podgorski
  */
  this.renderCancelButton = function renderCancelButton(target, objTab) {
    try {
      var component = this;

      if (objTab.CANCEL_BUTTON.CANCEL_LABEL && objTab.CANCEL_BUTTON.CANCEL_LABEL.length > 0) {
        var initialLabel = objTab.CANCEL_BUTTON.CANCEL_LABEL;
      }
      else {
        var initialLabel = 'Cancel';
      }
      component.ui.button({
        target: target,
        text: initialLabel,
        addClass: 'uhspa-tabbed-advisor-cancel-button',
        click: function () {
          //window.open('', '_self').close();
          window.external.PCSendMessage(2101, {});
        }
      });
    }
    catch (err) {
      uhspa.error(err);
    }
  };


  /** Move to the next flagged tab if one exists, otherwise close the window
    @param {number} idx - Current tab index
    @param {string} conceptKey - Name key for the concept to be removed on order
    @author Eric Smith
  */
  this.dismissWindow = function dismissWindow(idx, conceptKey) {
    try {
      var component = this;

      $('.uhspa-tabs ul li').eq(idx).find('.uhspa-tabbed-advisor-flag-icon').remove();
      component.clearConcept(conceptKey);

      if ($('.uhspa-tabs ul li').find('.uhspa-tabbed-advisor-flag-icon').length > 0) {
        $('.uhspa-tabs ul li').find('.uhspa-tabbed-advisor-flag-icon').eq(0).parent().click();
      }
      else {
        if (window.external !== undefined) {
          /* send close window request to the environment using the embedded browser instance */
          window.external.PCSendMessage(2101, {});
        }
        else {
          /* http://blogs.msdn.com/b/rextang/archive/2008/10/17/9002876.aspx */
          var win = window.open("", "_top", "", "true");
          win.opener = true;
          win.close();
        }
      }
    }
    catch (err) {
      uhspa.error(err);
    }
  };

  /** Clear the concept
    @param {string} conceptKey - Name key of the concept to be removed
    @author Eric Smith
  */
  this.clearConcept = function clearConcept(conceptKey) {
    try {
      var component = this;
      //      /*
      component.loadCCLwithBlob(
        "UHS_MPG_DEL_CONCEPT_PERSON"
        , ["MINE"]
        , function (d) {}
        , "JSON"
        , {
          "RREC": {
            "person_id": component.getProperty('personId'),
            "encntr_id": component.getProperty('encounterId'),
            "concept_name_key": conceptKey,
            "action_object": component.name
          }
        }
      );
      //*/
      /*
      if (conceptKey.length > 0) {
        component.request({
          cclfile: 'UHS_MPG_DEL_CONCEPT_PERSON',
          //callback: function(){alert('completed CCL')},
          //send: //Already sends MINE automatically
          blob: {
            'RREC': {
              'person_id': component.getProperty('personId'),
              'encntr_id': component.getProperty('encounterId'),
              'concept_name_key': conceptKey,
              'action_object': component.name
            }
          }
        });
      }
*/
    }
    catch (err) {
      uhspa.error(err);
    }
  };

  // Add this method to process the CCL response
  this.processCCLResponse = function() {
    try {
      var jsonReturn = this.config.object.RCONFIG.JSON_RETURN;
      
      // If it's a string, parse it
      if (typeof jsonReturn === 'string') {
        jsonReturn = JSON.parse(jsonReturn);
      }
      
      console.log("Processing CCL response:", jsonReturn);
      
      // Set the tab data
      if (jsonReturn && jsonReturn.RREC && jsonReturn.RREC.TAB) {
        this.tabData = jsonReturn.RREC.TAB;
        console.log("Tab data set:", this.tabData);
      } else {
        console.error("Invalid CCL response structure:", jsonReturn);
      }
    } catch (error) {
      console.error("Error processing CCL response:", error);
    }
  };

  // Modify the makeItSo method to call processCCLResponse
  this.makeItSo = function() {
    try {
      console.log("Making it so...");
      var self = this;
      
      // Process the CCL response if it exists
      if (this.config && this.config.object && this.config.object.RCONFIG && this.config.object.RCONFIG.JSON_RETURN) {
        var jsonReturn = this.config.object.RCONFIG.JSON_RETURN;
        
        // If it's a string, parse it
        if (typeof jsonReturn === 'string') {
          try {
            jsonReturn = JSON.parse(jsonReturn);
          } catch (e) {
            console.error("Error parsing JSON_RETURN:", e);
          }
        }
        
        // Set the tab data if it exists in the response
        if (jsonReturn && jsonReturn.RREC && jsonReturn.RREC.TAB) {
          this.tabData = jsonReturn.RREC.TAB;
          console.log("Tab data set from CCL response:", this.tabData);
        }
      }
      
      // If we still don't have tab data, check if it was directly set
      if (!this.tabData || this.tabData.length === 0) {
        console.warn("No tab data found in CCL response");
        return;
      }
      
      // Get the target element
      var target = $(this.getTarget());
      
      // Clear the target
      target.empty();
      
      // Create the tab container
      var tabContainer = this.ui.div({
        target: target,
        addClass: 'tab-container'
      });
      
      // Create the tab content container
      this.ui.div({
        target: target,
        addClass: 'tab-content'
      });
      
      // Render the tabs
      $.each(this.tabData, function(index, tab) {
        var tabElement = self.ui.div({
          target: tabContainer,
          addClass: 'tab' + (index === 0 ? ' active' : ''),
          content: tab.DISPLAY
        });
        
        // Add click handler
        tabElement.click(function() {
          // Remove active class from all tabs
          tabContainer.find('.tab').removeClass('active');
          // Add active class to clicked tab
          $(this).addClass('active');
          // Render the tab content
          self.renderTab(self.tabData[index]);
        });
      });
      
      // Render the first tab by default
      if (this.tabData.length > 0) {
        this.renderTab(this.tabData[0]);
      }
    } catch (error) {
      console.error("Error in makeItSo:", error);
      UHSPA.logError(error);
    }
  };

  // Modify the renderTabbedAdvisor method to use the tabData
  this.renderTabbedAdvisor = function() {
    var self = this;
    var target = $(this.getTarget());
    
    // Clear the target
    target.empty();
    
    // Check if we have tab data
    if (!this.tabData || !Array.isArray(this.tabData) || this.tabData.length === 0) {
        console.error("No tab data available for rendering");
        target.html("<div class='error'>No tab data available for rendering</div>");
        return;
    }
    
    // Create tab container
    var tabContainer = this.ui.div({
        target: target,
        addClass: 'tab-container'
    });
    
    // Create tabs
    this.tabData.forEach(function(tab, index) {
        var tabElement = self.ui.div({
            target: tabContainer,
            addClass: 'tab' + (index === 0 ? ' active' : ''),
            content: tab.DISPLAY
        });
        
        // Add click handler
        tabElement.click(function() {
            // Remove active class from all tabs
            tabContainer.find('.tab').removeClass('active');
            // Add active class to clicked tab
            $(this).addClass('active');
            // Render the tab content
            self.renderTab(self.tabData[index]);
        });
    });
    
    // Render the first tab by default
    if (this.tabData.length > 0) {
        this.renderTab(this.tabData[0]);
    }
  };

  // Add this helper function to process concept placeholders
  this.processConceptPlaceholders = function(text, cclreplyObj) {
    if (!text || typeof text !== 'string' || !text.includes('@concept{')) {
      return text;
    }
    
    return text.replace(/@concept\{([^}]+)\.value\}/g, function(match, conceptName) {
      // Look up the concept value in the cclreplyObj if available
      if (cclreplyObj && cclreplyObj.CONCEPTS) {
        var concept = cclreplyObj.CONCEPTS.find(function(c) {
          return c.NAME === conceptName;
        });
        return concept ? concept.VALUE : conceptName;
      }
      return conceptName;
    });
  };
};
uhspa.tabbed_advisor.prototype = new UHSPA_COMPONENT();
uhspa.tabbed_advisor.prototype.name = "uhspa.tabbed_advisor";