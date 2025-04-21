/**
 * DOM Utilities for manipulating elements and handling UI operations
 */

/**
 * Creates a new DOM element with optional attributes and children
 * @param {string} tagName - The HTML tag name
 * @param {Object} attributes - Element attributes to set
 * @param {Array|Node|string} children - Child elements or text content
 * @returns {HTMLElement} Created element
 */
export function createElement(tagName, attributes = {}, children = null) {
	const element = document.createElement(tagName);

	// Set attributes
	Object.entries(attributes).forEach(([key, value]) => {
		if (key === 'className') {
			element.className = value;
		} else if (key === 'style' && typeof value === 'object') {
			Object.assign(element.style, value);
		} else {
			element.setAttribute(key, value);
		}
	});

	// Add children
	if (children) {
		if (Array.isArray(children)) {
			children.forEach((child) => {
				if (child) {
					element.appendChild(
						typeof child === 'string' ? document.createTextNode(child) : child
					);
				}
			});
		} else if (children instanceof Node) {
			element.appendChild(children);
		} else {
			element.textContent = children;
		}
	}

	return element;
}

/**
 * Removes all children from an element
 * @param {HTMLElement} element - Element to clear
 */
export function clearElement(element) {
	if (!element) return;
	while (element.firstChild) {
		element.removeChild(element.firstChild);
	}
}

/**
 * Applies CSS styles to an element
 * @param {HTMLElement} element - Element to style
 * @param {Object} styles - Styles to apply
 */
export function applyStyles(element, styles) {
	if (!element || !styles) return;
	Object.entries(styles).forEach(([property, value]) => {
		element.style[property] = value;
	});
}

/**
 * Copies computed styles between elements
 * @param {HTMLElement} source - Source element
 * @param {HTMLElement} target - Target element
 * @param {Array} properties - Specific properties to copy (optional)
 */
export function copyComputedStyles(source, target, properties = null) {
	const computedStyle = window.getComputedStyle(source);

	if (properties) {
		properties.forEach((prop) => {
			target.style[prop] = computedStyle.getPropertyValue(prop);
		});
	} else {
		// Copy all non-computed properties
		Array.from(computedStyle).forEach((key) => {
			target.style[key] = computedStyle.getPropertyValue(key);
		});
	}
}

/**
 * Adds or removes classes on an element
 * @param {HTMLElement} element - Element to modify
 * @param {Object} classMap - Object with class names and boolean values
 */
export function updateClassList(element, classMap) {
	if (!element) return;

	Object.entries(classMap).forEach(([className, shouldAdd]) => {
		if (shouldAdd) {
			element.classList.add(className);
		} else {
			element.classList.remove(className);
		}
	});
}

/**
 * Gets CSS variables from the document or an element
 * @param {string} variableName - CSS variable name
 * @param {HTMLElement} element - Element to get the variable from (optional)
 * @returns {string} CSS variable value
 */
export function getCSSVariable(variableName, element = document.documentElement) {
	const styles = getComputedStyle(element);
	return styles.getPropertyValue(variableName).trim();
}

/**
 * Sets CSS variables on the document or an element
 * @param {Object} variables - Object with variable names and values
 * @param {HTMLElement} element - Element to set variables on (optional)
 */
export function setCSSVariables(variables, element = document.documentElement) {
	Object.entries(variables).forEach(([name, value]) => {
		element.style.setProperty(name, value);
	});
}

/**
 * Creates and adds a stylesheet to the page
 * @param {string} id - ID for the style element
 * @param {string} css - CSS content
 * @returns {HTMLStyleElement} Created style element
 */
export function addStylesheet(id, css) {
	// Check if the style already exists
	let styleElem = document.getElementById(id);

	if (!styleElem) {
		styleElem = document.createElement('style');
		styleElem.id = id;
		document.head.appendChild(styleElem);
	}

	styleElem.textContent = css;
	return styleElem;
}

/**
 * Adds multiple event listeners to an element
 * @param {HTMLElement} element - Element to add events to
 * @param {Object} events - Object with event types and callbacks
 * @returns {Function} Function to remove all event listeners
 */
export function addEventListeners(element, events) {
	if (!element || !events) return () => {};

	const boundEvents = [];

	Object.entries(events).forEach(([eventType, callback]) => {
		element.addEventListener(eventType, callback);
		boundEvents.push({ eventType, callback });
	});

	// Return a function to remove all event listeners
	return () => {
		boundEvents.forEach(({ eventType, callback }) => {
			element.removeEventListener(eventType, callback);
		});
	};
}

/**
 * Creates and displays a tooltip
 * @param {HTMLElement} element - Element to attach tooltip to
 * @param {string} text - Tooltip text
 * @param {Object} options - Tooltip options (position, duration, etc.)
 */
export function createTooltip(element, text, options = {}) {
	const defaults = {
		position: 'top',
		duration: 2000,
		className: '',
	};

	const settings = { ...defaults, ...options };

	const tooltip = createElement(
		'div',
		{
			className: `tooltip tooltip-${settings.position} ${settings.className}`,
			style: {
				position: 'absolute',
				zIndex: 1000,
				opacity: 0,
				transition: 'opacity 0.3s',
			},
		},
		text
	);

	document.body.appendChild(tooltip);

	// Position the tooltip
	const elementRect = element.getBoundingClientRect();
	const tooltipRect = tooltip.getBoundingClientRect();

	let top, left;

	switch (settings.position) {
		case 'top':
			top = elementRect.top - tooltipRect.height - 8;
			left = elementRect.left + elementRect.width / 2 - tooltipRect.width / 2;
			break;
		case 'bottom':
			top = elementRect.bottom + 8;
			left = elementRect.left + elementRect.width / 2 - tooltipRect.width / 2;
			break;
		case 'left':
			top = elementRect.top + elementRect.height / 2 - tooltipRect.height / 2;
			left = elementRect.left - tooltipRect.width - 8;
			break;
		case 'right':
			top = elementRect.top + elementRect.height / 2 - tooltipRect.height / 2;
			left = elementRect.right + 8;
			break;
	}

	// Adjust for window bounds
	const windowWidth = window.innerWidth;
	const windowHeight = window.innerHeight;

	if (left < 0) left = 0;
	if (top < 0) top = 0;
	if (left + tooltipRect.width > windowWidth) left = windowWidth - tooltipRect.width;
	if (top + tooltipRect.height > windowHeight) top = windowHeight - tooltipRect.height;

	// Apply position
	tooltip.style.top = `${top + window.scrollY}px`;
	tooltip.style.left = `${left + window.scrollX}px`;

	// Show tooltip
	setTimeout(() => {
		tooltip.style.opacity = 1;
	}, 10);

	// Remove tooltip after duration
	setTimeout(() => {
		tooltip.style.opacity = 0;
		setTimeout(() => {
			if (tooltip.parentNode) {
				tooltip.parentNode.removeChild(tooltip);
			}
		}, 300);
	}, settings.duration);
}

/**
 * Converts a DOM element to a data URL image
 * @param {HTMLElement} element - Element to convert
 * @param {Object} options - Configuration options
 * @returns {Promise<string>} Data URL
 */
export async function elementToDataURL(element, options = {}) {
	const defaults = {
		width: null,
		height: null,
		backgroundColor: null,
		format: 'png',
		quality: 0.95,
	};

	const settings = { ...defaults, ...options };

	// Use html2canvas or similar library if available
	// For simple implementation, we'll use canvas
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');

	// Set dimensions
	const rect = element.getBoundingClientRect();
	canvas.width = settings.width || rect.width;
	canvas.height = settings.height || rect.height;

	// Apply background color if specified
	if (settings.backgroundColor) {
		ctx.fillStyle = settings.backgroundColor;
		ctx.fillRect(0, 0, canvas.width, canvas.height);
	}

	// This is a simple implementation - for complex elements use a dedicated library
	const data = new XMLSerializer().serializeToString(element);
	const DOMURL = window.URL || window.webkitURL || window;
	const img = new Image();
	const svgBlob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });
	const url = DOMURL.createObjectURL(svgBlob);

	return new Promise((resolve, reject) => {
		img.onload = function () {
			ctx.drawImage(img, 0, 0);
			DOMURL.revokeObjectURL(url);

			try {
				const dataUrl = canvas.toDataURL(`image/${settings.format}`, settings.quality);
				resolve(dataUrl);
			} catch (e) {
				reject(e);
			}
		};

		img.onerror = reject;
		img.src = url;
	});
}
