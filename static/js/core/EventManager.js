/**
 * Implements an event system following the Observer pattern
 * Allows decoupling components through event-based communication
 */
export class EventManager {
	constructor() {
		this.events = new Map();
		this.domEventListeners = new Map();
	}

	/**
	 * Subscribes a listener to a specific event
	 * @param {string} eventName - Name of the event
	 * @param {Function} listener - Function to execute when the event occurs
	 * @returns {Function} Function to cancel the subscription
	 */
	on(eventName, listener) {
		if (!this.events.has(eventName)) {
			this.events.set(eventName, []);
		}

		const listeners = this.events.get(eventName);
		listeners.push(listener);

		// Return function to cancel subscription
		return () => this.off(eventName, listener);
	}

	/**
	 * Cancels a listener's subscription to an event
	 * @param {string} eventName - Name of the event
	 * @param {Function} listenerToRemove - Listener to remove
	 */
	off(eventName, listenerToRemove) {
		if (!this.events.has(eventName)) {
			return;
		}

		const listeners = this.events.get(eventName);
		const filteredListeners = listeners.filter((listener) => listener !== listenerToRemove);

		if (filteredListeners.length === 0) {
			this.events.delete(eventName);
		} else {
			this.events.set(eventName, filteredListeners);
		}
	}

	/**
	 * Subscribes a listener that will execute only once
	 * @param {string} eventName - Name of the event
	 * @param {Function} listener - Function to execute once
	 */
	once(eventName, listener) {
		const onceWrapper = (...args) => {
			listener(...args);
			this.off(eventName, onceWrapper);
		};

		return this.on(eventName, onceWrapper);
	}

	/**
	 * Emits an event with optional data
	 * @param {string} eventName - Name of the event
	 * @param {*} data - Data to pass to the listeners
	 */
	emit(eventName, data) {
		if (!this.events.has(eventName)) {
			return;
		}

		const listeners = this.events.get(eventName);
		listeners.forEach((listener) => {
			try {
				listener(data);
			} catch (error) {
				console.error(`Error in event listener ${eventName}:`, error);
			}
		});
	}

	/**
	 * Sets up an event listener for a DOM element
	 * @param {string} selector - CSS selector for the element
	 * @param {string} eventType - Type of event (click, input, etc)
	 * @param {Function} handler - Event handler function
	 * @returns {Function} Function to remove the event listener
	 */
	setupDOMEvent(selector, eventType, handler) {
		const element = typeof selector === 'string' ? document.querySelector(selector) : selector;

		if (!element) {
			console.warn(`Element not found for selector: ${selector}`);
			return () => {};
		}

		element.addEventListener(eventType, handler);

		// Store reference for later cleanup
		const key = `${selector}:${eventType}`;
		if (!this.domEventListeners.has(key)) {
			this.domEventListeners.set(key, []);
		}

		const handlers = this.domEventListeners.get(key);
		handlers.push({ element, handler });

		// Return function to remove the listener
		return () => {
			element.removeEventListener(eventType, handler);
			const handlers = this.domEventListeners.get(key);
			const index = handlers.findIndex((h) => h.handler === handler);
			if (index !== -1) {
				handlers.splice(index, 1);
			}
		};
	}

	/**
	 * Removes all listeners for a specific event or all events
	 * @param {string} [eventName] - Name of the event (optional)
	 */
	clear(eventName) {
		if (eventName) {
			this.events.delete(eventName);
		} else {
			this.events.clear();
		}
	}

	/**
	 * Removes all DOM event listeners
	 */
	clearDOMEvents() {
		for (const [key, handlers] of this.domEventListeners.entries()) {
			handlers.forEach(({ element, handler }) => {
				const [, eventType] = key.split(':');
				element.removeEventListener(eventType, handler);
			});
		}
		this.domEventListeners.clear();
	}

	/**
	 * Lists all registered events
	 * @returns {Array} List of event names
	 */
	listEvents() {
		return Array.from(this.events.keys());
	}

	/**
	 * Gets the number of listeners for a specific event
	 * @param {string} eventName - Name of the event
	 * @returns {number} Number of listeners
	 */
	listenerCount(eventName) {
		if (!this.events.has(eventName)) {
			return 0;
		}
		return this.events.get(eventName).length;
	}
}
