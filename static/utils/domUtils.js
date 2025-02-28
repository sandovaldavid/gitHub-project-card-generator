/**
 * Utilidades para manipulación del DOM
 * Proporciona funciones helper para operaciones comunes del DOM
 */

/**
 * Crea un elemento con atributos y contenido opcional
 * @param {string} tagName - Tipo de elemento a crear
 * @param {Object} attributes - Atributos a asignar al elemento
 * @param {string|Node|Array} content - Contenido para agregar al elemento
 * @returns {HTMLElement} El elemento creado
 */
export function createElement(tagName, attributes = {}, content = null) {
	const element = document.createElement(tagName);

	// Aplicar atributos
	Object.entries(attributes).forEach(([key, value]) => {
		if (key === 'className') {
			element.className = value;
		} else if (key === 'style' && typeof value === 'object') {
			Object.assign(element.style, value);
		} else if (key.startsWith('on') && typeof value === 'function') {
			const eventName = key.substring(2).toLowerCase();
			element.addEventListener(eventName, value);
		} else if (key === 'dataset' && typeof value === 'object') {
			Object.entries(value).forEach(([dataKey, dataValue]) => {
				element.dataset[dataKey] = dataValue;
			});
		} else if (key === 'innerHTML') {
			// Manejar innerHTML como un caso especial
			element.innerHTML = value;
		} else {
			element.setAttribute(key, value);
		}
	});

	// Agregar contenido
	if (content) {
		appendContent(element, content);
	}

	return element;
}

/**
 * Agrega contenido a un elemento
 * @param {HTMLElement} element - Elemento al que agregar contenido
 * @param {string|Node|Array} content - Contenido a agregar
 */
export function appendContent(element, content) {
	if (typeof content === 'string') {
		element.innerHTML = content;
	} else if (content instanceof Node) {
		element.appendChild(content);
	} else if (Array.isArray(content)) {
		content.forEach((item) => appendContent(element, item));
	}
}

/**
 * Elimina todos los hijos de un elemento
 * @param {HTMLElement} element - Elemento a limpiar
 */
export function clearElement(element) {
	while (element.firstChild) {
		element.removeChild(element.firstChild);
	}
}

/**
 * Aplica estilos a un elemento
 * @param {HTMLElement} element - Elemento a estilizar
 * @param {Object} styles - Estilos a aplicar
 */
export function applyStyles(element, styles) {
	Object.assign(element.style, styles);
}

/**
 * Copia estilos computados entre elementos
 * @param {HTMLElement} source - Elemento fuente
 * @param {HTMLElement} target - Elemento destino
 * @param {Array} properties - Propiedades específicas a copiar (opcional)
 */
export function copyComputedStyles(source, target, properties = null) {
	const computedStyle = window.getComputedStyle(source);

	if (properties) {
		properties.forEach((prop) => {
			target.style[prop] = computedStyle.getPropertyValue(prop);
		});
	} else {
		// Copiar todas las propiedades no computadas
		Array.from(computedStyle).forEach((key) => {
			target.style[key] = computedStyle.getPropertyValue(key);
		});
	}
}

/**
 * Añade o elimina clases en un elemento
 * @param {HTMLElement} element - Elemento a modificar
 * @param {Object} classMap - Objeto con clases y valores booleanos
 */
export function updateClassList(element, classMap) {
	Object.entries(classMap).forEach(([className, shouldAdd]) => {
		if (shouldAdd) {
			element.classList.add(className);
		} else {
			element.classList.remove(className);
		}
	});
}

/**
 * Obtiene las variables CSS del documento o un elemento
 * @param {string} variableName - Nombre de la variable CSS
 * @param {HTMLElement} element - Elemento para obtener la variable (opcional)
 * @returns {string} Valor de la variable CSS
 */
export function getCSSVariable(variableName, element = document.documentElement) {
	const styles = getComputedStyle(element);
	return styles.getPropertyValue(variableName).trim();
}

/**
 * Establece variables CSS en el documento o un elemento
 * @param {Object} variables - Objeto con nombres y valores de variables
 * @param {HTMLElement} element - Elemento para establecer las variables (opcional)
 */
export function setCSSVariables(variables, element = document.documentElement) {
	Object.entries(variables).forEach(([name, value]) => {
		element.style.setProperty(name, value);
	});
}

/**
 * Crea y añade una regla de estilo a la página
 * @param {string} id - ID para el elemento style
 * @param {string} css - Contenido CSS
 * @returns {HTMLStyleElement} Elemento style creado
 */
export function addStylesheet(id, css) {
	// Verificar si el estilo ya existe
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
 * Añade múltiples event listeners a un elemento
 * @param {HTMLElement} element - Elemento al que añadir eventos
 * @param {Object} events - Objeto con tipo de eventos y callbacks
 * @param {Object} options - Opciones para addEventListener
 */
export function addEventListeners(element, events, options = {}) {
	Object.entries(events).forEach(([event, callback]) => {
		element.addEventListener(event, callback, options);
	});
}

/**
 * Elimina múltiples event listeners de un elemento
 * @param {HTMLElement} element - Elemento del que eliminar eventos
 * @param {Object} events - Objeto con tipo de eventos y callbacks
 * @param {Object} options - Opciones para removeEventListener
 */
export function removeEventListeners(element, events, options = {}) {
	Object.entries(events).forEach(([event, callback]) => {
		element.removeEventListener(event, callback, options);
	});
}

/**
 * Establece atributos en un elemento
 * @param {HTMLElement} element - Elemento a modificar
 * @param {Object} attrs - Atributos a establecer
 */
export function setAttributes(element, attrs) {
	Object.entries(attrs).forEach(([key, value]) => {
		if (value === null || value === false) {
			element.removeAttribute(key);
		} else if (value === true) {
			element.setAttribute(key, '');
		} else {
			element.setAttribute(key, value);
		}
	});
}
