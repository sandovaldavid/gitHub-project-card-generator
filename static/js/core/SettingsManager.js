import { CONSTANTS } from '../config.js';

/**
 * SettingsManager class - Responsible for managing application settings
 * Follows Single Responsibility Principle by only handling settings loading/saving
 */
export class SettingsManager {
	/**
	 * Creates a new SettingsManager instance
	 * @param {StorageService} storageService - Storage service for persisting settings
	 */
	constructor(storageService) {
		this.storageService = storageService;
		this.settings = {
			[CONSTANTS.SETTINGS.CATEGORIES.APPEARANCE]: {},
			[CONSTANTS.SETTINGS.CATEGORIES.CARD]: {},
			[CONSTANTS.SETTINGS.CATEGORIES.PREFERENCES]: {},
		};
	}

	/**
	 * Initializes the SettingsManager with application reference
	 * @param {Application} app - Application instance
	 */
	initialize(app) {
		this.app = app;
		this.loadSettings();
	}

	/**
	 * Loads all settings from storage
	 */
	loadSettings() {
		try {
			// Load appearance settings
			const backgroundColor = this.storageService.loadItem(
				CONSTANTS.SETTINGS.KEYS.BACKGROUND_COLOR
			);
			const textColor = this.storageService.loadItem(CONSTANTS.SETTINGS.KEYS.TEXT_COLOR);

			if (backgroundColor || textColor) {
				this.settings[CONSTANTS.SETTINGS.CATEGORIES.APPEARANCE] = {
					backgroundColor,
					textColor,
				};
			}

			// Load card settings
			const username = this.storageService.loadItem(CONSTANTS.SETTINGS.KEYS.USERNAME);
			const repoName = this.storageService.loadItem(CONSTANTS.SETTINGS.KEYS.REPO_NAME);
			const projectName = this.storageService.loadItem(CONSTANTS.SETTINGS.KEYS.PROJECT_NAME);
			const projectDescription = this.storageService.loadItem(
				CONSTANTS.SETTINGS.KEYS.PROJECT_DESCRIPTION
			);

			if (username || repoName || projectName || projectDescription) {
				this.settings[CONSTANTS.SETTINGS.CATEGORIES.CARD] = {
					username,
					repoName,
					projectName,
					projectDescription,
				};
			}

			// Load user preferences
			const autoSave = this.storageService.loadItem(CONSTANTS.SETTINGS.KEYS.AUTO_SAVE);
			if (autoSave !== null) {
				this.settings[CONSTANTS.SETTINGS.CATEGORIES.PREFERENCES].autoSave =
					autoSave === 'true';
			}
		} catch (error) {
			console.error('Failed to load settings:', error);
		}
	}

	/**
	 * Saves settings to storage
	 * @param {string} category - Settings category ('appearance', 'card', 'preferences')
	 * @param {Object} settings - Settings to save
	 */
	saveSettings(category, settings) {
		if (!settings || typeof settings !== 'object') return;

		try {
			// Update in-memory settings
			this.settings[category] = {
				...this.settings[category],
				...settings,
			};

			// Save to storage
			Object.entries(settings).forEach(([key, value]) => {
				this.storageService.saveItem(key, value);
			});

			// Emit event that settings were updated
			if (this.app) {
				const eventManager = this.app.getService('events');
				if (eventManager) {
					eventManager.emit('settings:updated', {
						category,
						settings: this.settings[category],
					});
				}
			}
		} catch (error) {
			console.error('Failed to save settings:', error);
		}
	}

	/**
	 * Gets settings by category
	 * @param {string} category - Settings category ('appearance', 'card', 'preferences')
	 * @returns {Object} Settings for the specified category
	 */
	getSettings(category) {
		return { ...this.settings[category] };
	}

	/**
	 * Gets all settings
	 * @returns {Object} All settings
	 */
	getAllSettings() {
		return { ...this.settings };
	}

	/**
	 * Loads all settings and returns them
	 * @returns {Object} All loaded settings
	 */
	loadAllSettings() {
		this.loadSettings();
		return this.getAllSettings();
	}

	/**
	 * Clears all settings
	 */
	clearSettings() {
		// Clear in-memory settings
		this.settings = {
			[CONSTANTS.SETTINGS.CATEGORIES.APPEARANCE]: {},
			[CONSTANTS.SETTINGS.CATEGORIES.CARD]: {},
			[CONSTANTS.SETTINGS.CATEGORIES.PREFERENCES]: {},
		};

		// Clear storage
		this.storageService.clear();

		// Emit event
		if (this.app) {
			const eventManager = this.app.getService('events');
			if (eventManager) {
				eventManager.emit('settings:cleared');
			}
		}
	}
}
