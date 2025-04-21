import { CONSTANTS } from '../config.js';

/**
 * Application.js
 * Main application class following SOLID principles
 * Implements a dependency container for services and components
 */
export class Application {
	constructor() {
		this.services = new Map();
		this.components = new Map();
		this.initialized = false;
	}

	/**
	 * Registers a service in the application
	 * @param {string} name - Service name
	 * @param {Object} service - Service instance
	 */
	registerService(name, service) {
		if (this.services.has(name)) {
			console.warn(`Service ${name} already registered. Overwriting...`);
		}
		this.services.set(name, service);
		return this;
	}

	/**
	 * Registers a component in the application
	 * @param {string} name - Component name
	 * @param {Object} component - Component instance
	 */
	registerComponent(name, component) {
		if (this.components.has(name)) {
			console.warn(`Component ${name} already registered. Overwriting...`);
		}
		this.components.set(name, component);
		return this;
	}

	/**
	 * Gets a registered service
	 * @param {string} name - Service name
	 * @returns {Object} Service instance
	 */
	getService(name) {
		if (!this.services.has(name)) {
			throw new Error(`Service ${name} not found`);
		}
		return this.services.get(name);
	}

	/**
	 * Gets a registered component
	 * @param {string} name - Component name
	 * @returns {Object} Component instance
	 */
	getComponent(name) {
		if (!this.components.has(name)) {
			throw new Error(`Component ${name} not found`);
		}
		return this.components.get(name);
	}

	/**
	 * Initializes the application and loads configurations
	 * @param {Function} callback - Function to execute after initialization
	 */
	initialize(callback) {
		if (this.initialized) {
			console.warn('Application already initialized');
			return;
		}

		try {
			// Verify essential services
			const requiredServices = CONSTANTS.APPLICATION.REQUIRED_SERVICES;
			for (const service of requiredServices) {
				if (!this.services.has(service)) {
					throw new Error(`Required service '${service}' is not registered`);
				}
			}

			// Initialize settings
			this._initializeSettings();

			// Mark as initialized
			this.initialized = true;

			// Execute callback if it exists
			if (typeof callback === 'function') {
				callback(this);
			}

			console.log('Application initialized successfully');
		} catch (error) {
			console.error('Error initializing application:', error);
			throw error;
		}
	}

	/**
	 * Initializes application settings
	 * @private
	 */
	_initializeSettings() {
		if (!this.services.has('settings')) {
			return;
		}

		const settingsManager = this.services.get('settings');

		// Load all saved settings
		const savedSettings = settingsManager.loadAllSettings();

		// Notify components about loaded settings
		if (this.services.has('events')) {
			const eventManager = this.services.get('events');

			// Emit events for each settings category
			Object.entries(savedSettings).forEach(([category, settings]) => {
				eventManager.emit('settings:updated', { category, settings });
			});
		}
	}
}
