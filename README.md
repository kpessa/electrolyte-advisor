# Electrolyte Advisor Concept Manager

This project provides a concept manager for the Electrolyte Advisor application. It allows you to parse, extract, and manage concepts from the configuration file.

## Features

- **Concept Extraction**: Automatically extracts concepts from the configuration file
- **Concept Management**: Provides a UI to manage and instantiate concepts
- **Expression Testing**: Test concept expressions with your instantiated concepts
- **Modal Interface**: Access the concept manager through a settings icon in the main application

## Getting Started

1. Open the application in your browser
2. Click the settings icon in the top right corner to open the concept manager
3. Use the concept manager to view, manage, and test concepts

## Concept Manager

The concept manager provides the following functionality:

- **View Concepts**: See all concepts extracted from the configuration
- **Instantiate Concepts**: Set values and active states for concepts
- **Test Expressions**: Evaluate concept expressions with your instantiated concepts

## Concept Expressions

Concept expressions are used in the configuration file to define conditions. They have the following format:

```
[%{CONCEPT1} AND {CONCEPT2}%]
```

Where:
- `CONCEPT1` and `CONCEPT2` are concept names
- `AND` is a logical operator (can also use `OR`)
- The expression is wrapped in `[%` and `%]`

## Concept Values

Concepts can also have values, which are referenced using the following format:

```
@concept{CONCEPT_NAME.value}
```

Where:
- `CONCEPT_NAME` is the name of the concept
- `.value` accesses the value property of the concept

## Development

### Project Structure

- `js/concept-parser.js`: Utility for parsing concept expressions
- `js/concept-manager.js`: Class for managing concepts
- `js/concept-modal.js`: Modal interface for the concept manager
- `js/app.js`: Main application file
- `css/concept-manager.css`: Styles for the concept manager
- `css/concept-modal.css`: Styles for the modal interface

### Adding New Features

To add new features to the concept manager:

1. Modify the appropriate JavaScript file
2. Update the CSS if needed
3. Test your changes in the browser

## License

This project is proprietary and confidential. 