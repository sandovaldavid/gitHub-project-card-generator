import { CONSTANTS } from '../config.js';
import { validateColor } from '../../utils/validators.js';
import { setCSSVariables } from '../../utils/domUtils.js';

/**
 * Interface for color picker components
 * Implements the Interface Segregation Principle (I)
 */
class ColorPickerComponent {
	/**
	 * Initialize the component
	 * @param {string} colorProperty - CSS variable to modify
	 * @param {string} inputSelector - Selector for the color input
	 * @param {string} defaultColor - Default color
	 */
	constructor(colorProperty, inputSelector, defaultColor) {
		this.colorProperty = colorProperty;
		this.inputSelector = inputSelector;
		this.defaultColor = defaultColor;
		this.inputElement = document.querySelector(inputSelector);

		this.colorValueElement = this.inputElement
			? this.inputElement.closest('.color-input-group')?.querySelector('.color-value')
			: null;

		if (this.inputElement) {
			this.inputElement.value = defaultColor;

			// Set format to hex to ensure color picker opens with hexadecimal format
			if (this.inputElement.type === 'color') {
				// Force hexadecimal format for the color picker
				this.inputElement.addEventListener('input', (e) => {
					// Convert any value to hex if it's not already
					const hexValue = this.ensureHexFormat(e.target.value);
					if (hexValue !== e.target.value) {
						e.target.value = hexValue;
					}
				});
			}

			this.setupEventListeners();

			// If we found the color-value element, convert it to an input field
			if (this.colorValueElement) {
				this.convertToInputField(this.colorValueElement, defaultColor);
			}
		}
	}

	/**
	 * Converts the color-value span to an input field
	 * @param {HTMLElement} element - The color-value span element
	 * @param {string} defaultColor - Default color value
	 */
	convertToInputField(element, defaultColor) {
		// Store the original text value
		const originalValue = element.textContent || defaultColor;

		// Create a new input element
		const inputField = document.createElement('input');
		inputField.type = 'text';
		inputField.value = originalValue;
		inputField.className = 'color-value-input';
		inputField.style.fontFamily = 'monospace';
		inputField.style.width = '80px';
		inputField.style.padding = '0.3rem';
		inputField.style.border = '1px solid #d1d5db';
		inputField.style.borderRadius = '4px';
		inputField.style.fontSize = '0.9rem';

		// Replace the span with the input
		element.parentNode.replaceChild(inputField, element);

		// Update the reference
		this.colorValueElement = inputField;

		// Add event listeners
		this.colorValueElement.addEventListener('input', this.handleValueInput.bind(this));
		this.colorValueElement.addEventListener('change', this.handleValueChange.bind(this));
	}

	/**
	 * Handle input in the color value field
	 * @param {Event} event - Input event
	 */
	handleValueInput(event) {
		// Update as user types if it's a valid hex
		const value = event.target.value;
		if (value.startsWith('#') && (value.length === 4 || value.length === 7)) {
			const validation = validateColor(value);
			if (validation.isValid) {
				this.inputElement.value = value;
				setCSSVariables({
					[this.colorProperty]: value,
				});
			}
		}
	}

	/**
	 * Handle change in the color value field
	 * @param {Event} event - Change event
	 */
	handleValueChange(event) {
		const value = event.target.value;

		// Try to format it as a hex color if it's not already
		let hexColor = value;
		if (!hexColor.startsWith('#')) {
			hexColor = '#' + value;
		}

		// Validate the color
		const validation = validateColor(hexColor);

		if (validation.isValid) {
			// Update the color picker with the valid hex value
			this.inputElement.value = hexColor;
			this.updateColor(hexColor);
		} else {
			// If invalid, reset to the current color from the picker
			event.target.value = this.inputElement.value;
		}
	}

	/**
	 * Ensures that a color value is in hexadecimal format
	 * @param {string} color - Color value to convert
	 * @returns {string} Color in hexadecimal format
	 */
	ensureHexFormat(color) {
		// If it's already a hex color with # prefix, return it
		if (/^#[0-9A-Fa-f]{6}$/i.test(color)) {
			return color;
		}

		// If it's a hex color without # prefix, add it
		if (/^[0-9A-Fa-f]{6}$/i.test(color)) {
			return `#${color}`;
		}

		// If it's an RGB format like rgb(r,g,b)
		const rgbMatch = color.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
		if (rgbMatch) {
			const r = parseInt(rgbMatch[1], 10);
			const g = parseInt(rgbMatch[2], 10);
			const b = parseInt(rgbMatch[3], 10);
			return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
		}

		// If conversion failed, return the original or a default
		return color;
	}

	/**
	 * Set up event listeners
	 */
	setupEventListeners() {
		this.inputElement.addEventListener('input', this.handleColorChange.bind(this));
		this.inputElement.addEventListener('change', this.handleColorValidation.bind(this));
	}

	/**
	 * Handle color change event
	 * @param {Event} event - Input event
	 */
	handleColorChange(event) {
		const color = event.target.value;
		this.updateColor(color);
	}

	/**
	 * Update color in the application
	 * @param {string} color - Hex color value
	 */
	updateColor(color) {
		setCSSVariables({
			[this.colorProperty]: color,
		});

		// Update the color value input if it exists
		if (this.colorValueElement) {
			this.colorValueElement.value = color;
		}

		// Notify about the change
		this.dispatchEvent('colorchange', {
			property: this.colorProperty,
			value: color,
		});
	}

	/**
	 * Validate the selected color
	 * @param {Event} event - Change event
	 */
	handleColorValidation(event) {
		const color = event.target.value;
		const validation = validateColor(color);

		if (!validation.isValid) {
			console.warn(`Invalid color: ${color}`);
			this.resetToDefault();
		}
	}

	/**
	 * Reset to default color
	 */
	resetToDefault() {
		if (this.inputElement) {
			this.inputElement.value = this.defaultColor;
			this.updateColor(this.defaultColor);
		}
	}

	/**
	 * Set a specific color
	 * @param {string} color - Hex color value
	 */
	setColor(color) {
		const validation = validateColor(color);

		if (validation.isValid && this.inputElement) {
			this.inputElement.value = color;
			this.updateColor(color);
		} else {
			this.resetToDefault();
		}
	}

	/**
	 * Get current color
	 * @returns {string} Current color value
	 */
	getColor() {
		return this.inputElement ? this.inputElement.value : this.defaultColor;
	}

	/**
	 * Dispatch a color picker event
	 * @param {string} type - Event type
	 * @param {Object} detail - Event details
	 */
	dispatchEvent(type, detail) {
		const event = new CustomEvent('colorpicker', {
			bubbles: true,
			detail: {
				type,
				...detail,
			},
		});

		document.dispatchEvent(event);
	}
}

/**
 * Main color picker manager
 * Implements the Single Responsibility Principle (S) by coordinating multiple color pickers
 */
export class ColorPickerManager {
	/**
	 * Constructor
	 */
	constructor() {
		this.colorPickers = new Map();
		this.defaultColors = CONSTANTS.UI.DEFAULT_COLORS;

		this.initialize();
	}

	/**
	 * Initialize color pickers
	 */
	initialize() {
		// Create separate instances for each color with correct CSS variables
		this.registerColorPicker('--border-color', '#borderColor', this.defaultColors.BORDER);

		this.registerColorPicker(
			'--project-text-color',
			'#projectColor',
			this.defaultColors.PROJECT
		);

		this.registerColorPicker('--bg-color', '#bgColor', this.defaultColors.BACKGROUND);

		// Subscribe to color events
		this.setupGlobalListeners();
	}

	/**
	 * Register a new color picker
	 * @param {string} property - CSS variable
	 * @param {string} selector - Input selector
	 * @param {string} defaultColor - Default color
	 */
	registerColorPicker(property, selector, defaultColor) {
		const picker = new ColorPickerComponent(property, selector, defaultColor);
		this.colorPickers.set(property, picker);
	}

	/**
	 * Set up global event listeners
	 */
	setupGlobalListeners() {
		document.addEventListener('colorpicker', (event) => {
			if (event.detail.type === 'colorchange') {
				this.handleGlobalColorChange(event.detail.property, event.detail.value);
			}
		});
	}

	/**
	 * Handle global color changes
	 * @param {string} property - CSS property that changed
	 * @param {string} value - New color value
	 */
	handleGlobalColorChange(property, value) {
		// You can add specific reactions to color changes here
		// For example, updating a theme based on a primary color
	}

	/**
	 * Set all colors at once
	 * @param {Object} colors - Object with color properties
	 */
	setColors(colors) {
		if (!colors) return;

		// Map property names to CSS variables
		const propertyMap = {
			projectColor: '--project-text-color',
			borderColor: '--border-color',
			bgColor: '--bg-color',
		};

		Object.entries(colors).forEach(([key, value]) => {
			const cssProperty = propertyMap[key];

			if (cssProperty && this.colorPickers.has(cssProperty)) {
				this.colorPickers.get(cssProperty).setColor(value);
			}
		});
	}

	/**
	 * Get all current colors
	 * @returns {Object} Object with all colors
	 */
	getColors() {
		const colors = {};

		// Map CSS variables to property names
		const propertyReverseMap = {
			'--border-color': 'borderColor',
			'--project-text-color': 'projectColor',
			'--bg-color': 'bgColor',
		};

		this.colorPickers.forEach((picker, property) => {
			const propName = propertyReverseMap[property];
			if (propName) {
				colors[propName] = picker.getColor();
			}
		});

		return colors;
	}

	/**
	 * Reset all colors to defaults
	 */
	resetToDefaults() {
		this.colorPickers.forEach((picker) => {
			picker.resetToDefault();
		});
	}
}
