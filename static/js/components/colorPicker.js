import { CONSTANTS } from '../config.js';
import { validateColor } from '../../utils/validators.js';
import {
	applyStyles,
	setCSSVariables,
	createElement,
	updateClassList,
} from '../../utils/domUtils.js';

/**
 * Clase responsable de gestionar los selectores de color de la aplicación
 * Maneja la interacción con los inputs de color, validación y aplicación de estilos
 */
export class ColorPickerManager {
	/**
	 * Constructor de la clase que inicializa las referencias y estado
	 */
	constructor() {
		this.elements = this.cacheElements();
		this.defaultColors = CONSTANTS.UI.DEFAULT_COLORS;
		this.state = {
			projectColor: this.defaultColors.PROJECT || '#ffffff',
			borderColor: this.defaultColors.BORDER || '#00a0ff',
			bgColor: this.defaultColors.BACKGROUND || '#0d1117',
		};

		this.init();
	}

	/**
	 * Inicializa el componente, configura listeners y valores iniciales
	 */
	init() {
		this.setupColorInputListeners();
		this.initializeColorValues();
	}

	/**
	 * Guarda referencias a los elementos del DOM
	 * @returns {Object} Referencias a los elementos del DOM
	 */
	cacheElements() {
		return {
			projectColor: {
				input: document.getElementById('projectColor'),
				display: document.querySelector('.color-value'),
			},
			borderColor: {
				input: document.getElementById('borderColor'),
				display: document.getElementById('borderColor').nextElementSibling,
			},
			bgColor: {
				input: document.getElementById('bgColor'),
				display: document.getElementById('bgColor').nextElementSibling,
			},
		};
	}

	/**
	 * Configura los event listeners para los inputs de color
	 */
	setupColorInputListeners() {
		Object.entries(this.elements).forEach(([colorType, elements]) => {
			elements.input.addEventListener('input', () => {
				this.handleColorChange(colorType, elements.input.value);
			});
		});
	}

	/**
	 * Maneja el cambio de valor de un input de color
	 * @param {string} colorType - Tipo de color (projectColor, borderColor, bgColor)
	 * @param {string} colorValue - Valor hexadecimal del color
	 */
	handleColorChange(colorType, colorValue) {
		// Validar el color
		const validation = validateColor(colorValue);
		if (!validation.isValid) {
			if (window.notificationSystem) {
				window.notificationSystem.show(validation.message, 'error');
			} else {
				console.error(`Invalid color: ${validation.message}`);
			}
			return;
		}

		// Actualizar estado
		this.state[colorType] = colorValue;

		// Actualizar display
		this.updateColorDisplay(colorType);

		// Actualizar estilos CSS
		this.applyColorStyles();

		// Disparar evento de cambio
		this.dispatchChangeEvent(colorType, colorValue);
	}

	/**
	 * Actualiza el texto que muestra el valor hexadecimal
	 * @param {string} colorType - Tipo de color a actualizar
	 */
	updateColorDisplay(colorType) {
		const elements = this.elements[colorType];
		if (elements && elements.display) {
			elements.display.textContent = this.state[colorType];
		}
	}

	/**
	 * Aplica los colores a los estilos CSS
	 * Usa las funciones de domUtils para manipulación del DOM
	 */
	applyColorStyles() {
		// Aplicar color del proyecto al texto usando domUtils
		const displayProjectName = document.getElementById('displayProjectName');
		if (displayProjectName) {
			applyStyles(displayProjectName, {
				color: this.state.projectColor,
			});
		}

		// Actualizar variables CSS para colores globales usando domUtils
		setCSSVariables({
			'--border-color': this.state.borderColor,
			'--bg-color': this.state.bgColor,
		});

		// Actualizar el borde del contenedor de la tarjeta usando domUtils
		const cardContainer = document.getElementById('cardContainer');
		if (cardContainer) {
			applyStyles(cardContainer, {
				borderBottomColor: this.state.borderColor,
			});
		}

		// Actualizar otros elementos que pueden depender de estos colores
		this.updateDependentElements();
	}

	/**
	 * Actualiza elementos adicionales que dependen de los colores
	 * Esta funcionalidad estaba en index.js y ahora se integra aquí
	 */
	updateDependentElements() {
		// Actualizar colores de fondo para tarjetas de proyectos
		const projectCards = document.querySelectorAll('.project-card');
		projectCards.forEach((card) => {
			updateClassList(card, {
				'color-accent': true,
			});

			// Aplicar un borde sutil con el color de acento
			applyStyles(card, {
				borderLeft: `3px solid ${this.state.borderColor}`,
			});
		});

		// Actualizar botones con el color de acento
		const accentButtons = document.querySelectorAll('.btn-accent');
		accentButtons.forEach((btn) => {
			applyStyles(btn, {
				backgroundColor: this.state.borderColor,
				borderColor: this.state.borderColor,
			});
		});
	}

	/**
	 * Inicializa los valores de color
	 */
	initializeColorValues() {
		Object.keys(this.elements).forEach((colorType) => {
			// Establecer valores iniciales en inputs
			const inputElement = this.elements[colorType].input;
			if (inputElement) {
				inputElement.value = this.state[colorType];
			}

			// Actualizar displays
			this.updateColorDisplay(colorType);
		});

		// Aplicar estilos iniciales
		this.applyColorStyles();
	}

	/**
	 * Dispara un evento personalizado cuando cambia un color
	 * @param {string} colorType - Tipo de color que cambió
	 * @param {string} value - Nuevo valor del color
	 */
	dispatchChangeEvent(colorType, value) {
		const event = new CustomEvent('colorchange', {
			detail: {
				type: colorType,
				value: value,
				previousValue: this.state[colorType] || null,
			},
			bubbles: true,
		});

		this.elements[colorType].input.dispatchEvent(event);
	}

	/**
	 * Obtiene todos los colores actuales
	 * @returns {Object} Estado actual de los colores
	 */
	getColors() {
		return { ...this.state };
	}

	/**
	 * Establece múltiples colores a la vez
	 * @param {Object} colors - Objeto con los colores a establecer
	 */
	setColors(colors) {
		if (!colors) return;

		// Actualizar estado y elementos para cada color proporcionado
		Object.entries(colors).forEach(([colorType, value]) => {
			if (this.elements[colorType] && validateColor(value).isValid) {
				this.state[colorType] = value;
				this.elements[colorType].input.value = value;
				this.updateColorDisplay(colorType);
			}
		});

		// Aplicar todos los cambios de una vez
		this.applyColorStyles();
	}

	/**
	 * Valida un color específico
	 * @param {string} color - Valor hexadecimal del color a validar
	 * @returns {boolean} True si el color es válido
	 */
	validateColorValue(color) {
		return validateColor(color).isValid;
	}

	/**
	 * Resetea los colores a sus valores por defecto
	 */
	resetToDefaults() {
		this.setColors({
			projectColor: this.defaultColors.PROJECT,
			borderColor: this.defaultColors.BORDER,
			bgColor: this.defaultColors.BACKGROUND,
		});
	}

	/**
	 * Crea un panel de selección de color avanzado
	 * @param {string} colorType - Tipo de color para el que crear el selector
	 * @param {HTMLElement} container - Contenedor donde insertar el selector
	 */
	createAdvancedColorPicker(colorType, container) {
		if (!this.elements[colorType] || !container) return;

		// Limpiar contenedor si es necesario
		while (container.firstChild) {
			container.removeChild(container.firstChild);
		}

		// Crear estructura del color picker avanzado usando domUtils
		const pickerContainer = createElement('div', {
			className: 'advanced-color-picker',
		});

		// Crear paleta de colores predefinidos
		const presetColors = CONSTANTS.UI.PRESET_COLORS || [
			'#FF5252',
			'#FF4081',
			'#E040FB',
			'#7C4DFF',
			'#536DFE',
			'#448AFF',
			'#40C4FF',
			'#18FFFF',
			'#64FFDA',
			'#69F0AE',
			'#B2FF59',
			'#EEFF41',
			'#FFFF00',
			'#FFD740',
			'#FFAB40',
			'#FF6E40',
		];

		const colorPalette = createElement('div', {
			className: 'color-palette',
		});

		presetColors.forEach((color) => {
			const colorSwatch = createElement('div', {
				className: 'color-swatch',
				style: {
					backgroundColor: color,
				},
				dataset: {
					color: color,
				},
				onClick: () => this.handleColorChange(colorType, color),
			});

			colorPalette.appendChild(colorSwatch);
		});

		// Crear campo de entrada para valor hexadecimal
		const hexInput = createElement(
			'div',
			{
				className: 'hex-input-container',
			},
			[
				createElement('span', {
					textContent: '#',
				}),
				createElement('input', {
					type: 'text',
					className: 'hex-input',
					value: this.state[colorType].replace('#', ''),
					maxLength: 6,
					onInput: (e) => {
						const hexValue = `#${e.target.value}`;
						const validation = validateColor(hexValue);
						if (validation.isValid) {
							this.handleColorChange(colorType, hexValue);
						}
					},
				}),
			]
		);

		pickerContainer.appendChild(colorPalette);
		pickerContainer.appendChild(hexInput);
		container.appendChild(pickerContainer);
	}

	/**
	 * Guarda los colores actuales en localStorage
	 * Método que antes estaba en index.js y ahora forma parte de este componente
	 */
	saveColorSettings() {
		try {
			localStorage.setItem('gitcardx-colors', JSON.stringify(this.state));
		} catch (error) {
			console.warn('Failed to save color settings to localStorage:', error);
		}
	}

	/**
	 * Carga colores guardados desde localStorage
	 * Método que antes estaba en index.js y ahora forma parte de este componente
	 */
	loadColorSettings() {
		try {
			const savedColors = localStorage.getItem('gitcardx-colors');
			if (savedColors) {
				const colors = JSON.parse(savedColors);
				this.setColors(colors);
				return true;
			}
		} catch (error) {
			console.warn('Failed to load color settings from localStorage:', error);
		}
		return false;
	}
}
