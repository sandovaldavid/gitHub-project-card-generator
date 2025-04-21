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

		if (this.inputElement) {
			this.inputElement.value = defaultColor;
			this.setupEventListeners();
		}
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
