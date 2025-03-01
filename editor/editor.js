$(document).ready(function() {
    // Wait for the default config to be loaded
    var checkInterval = setInterval(function() {
        if (window.defaultConfig) {
            clearInterval(checkInterval);
            initializeEditor();
        }
    }, 100);
    
    function initializeEditor() {
        // Populate the editor with the default configuration
        $("#json-editor").val(JSON.stringify(window.defaultConfig, null, 2));
        
        // Update button click handler
        $("#update-btn").click(function() {
            try {
                // Parse the JSON from the editor
                var newConfig = JSON.parse($("#json-editor").val());
                
                // Update the current configuration
                window.currentConfig = newConfig;
                
                // Reinitialize the advisor
                $("#advisor-container").empty();
                initializeAdvisor();
                
                // Show success message
                alert("Configuration updated successfully!");
            } catch (e) {
                // Show error message
                alert("Error parsing JSON: " + e.message);
            }
        });
        
        // Reset button click handler
        $("#reset-btn").click(function() {
            // Reset to default configuration
            $("#json-editor").val(JSON.stringify(window.defaultConfig, null, 2));
            window.currentConfig = JSON.parse(JSON.stringify(window.defaultConfig));
            
            // Reinitialize the advisor
            $("#advisor-container").empty();
            initializeAdvisor();
            
            // Show success message
            alert("Configuration reset to default!");
        });
    }
}); 