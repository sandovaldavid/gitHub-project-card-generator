import { CONSTANTS } from '../config.js';
import {
	validateColor,
	validateGitHubUsername,
	validateRepoName,
	validateProjectName,
	validateDescription,
} from '../../utils/validators.js';

/**
 * Service for managing persistent data storage
 * Handles saving and loading of user preferences
 */
export class StorageService {
	/**
	 * Initializes the service with a storage key
	 * @param {string} storageKey - Key to store data in localStorage
	 */
	constructor(storageKey = CONSTANTS.STORAGE_KEY) {
		this.storageKey = storageKey;
		this.isStorageAvailable = this.checkStorageAvailability();
	}

	/**
	 * Checks if localStorage is available in the browser
	 * @returns {boolean} True if localStorage is available
	 */
	checkStorageAvailability() {
		try {
			const testKey = '__storage_test__';
			localStorage.setItem(testKey, testKey);
			localStorage.removeItem(testKey);
			return true;
		} catch (e) {
			console.warn('localStorage is not available:', e);
			return false;
		}
	}

	/**
	 * Saves user preferences
	 * @param {Object} data - Data to save
	 * @returns {boolean} True if saved successfully
	 */
	save(data) {
		if (!this.isStorageAvailable || !data) return false;

		try {
			// Validate data before saving
			const cleanData = this.validateAndSanitizeData(data);

			// Save validated data
			localStorage.setItem(this.storageKey, JSON.stringify(cleanData));
			return true;
		} catch (error) {
			console.error('Error saving data:', error);
			return false;
		}
	}

	/**
	 * Loads user preferences
	 * @returns {Object|null} Saved data or null if no data
	 */
	load() {
		if (!this.isStorageAvailable) return null;

		try {
			const storedData = localStorage.getItem(this.storageKey);
			if (!storedData) return null;

			// Parse and validate stored data
			const parsedData = JSON.parse(storedData);
			return this.validateAndSanitizeData(parsedData);
		} catch (error) {
			console.error('Error loading data:', error);
			return null;
		}
	}

	/**
	 * Removes saved data
	 * @returns {boolean} True if deleted successfully
	 */
	clear() {
		if (!this.isStorageAvailable) return false;

		try {
			localStorage.removeItem(this.storageKey);
			return true;
		} catch (error) {
			console.error('Error clearing data:', error);
			return false;
		}
	}

	/**
	 * Saves a specific value
	 * @param {string} key - Key of the value
	 * @param {any} value - Value to save
	 * @returns {boolean} True if saved successfully
	 */
	saveItem(key, value) {
		if (!this.isStorageAvailable || !key) return false;

		try {
			// Load existing data first
			const currentData = this.load() || {};

			// Update with new value
			currentData[key] = value;

			// Save updated data
			return this.save(currentData);
		} catch (error) {
			console.error('Error saving item:', error);
			return false;
		}
	}

	/**
	 * Loads a specific value
	 * @param {string} key - Key of the value to load
	 * @param {any} defaultValue - Default value if none exists
	 * @returns {any} Saved value or defaultValue
	 */
	loadItem(key, defaultValue = null) {
		if (!this.isStorageAvailable || !key) return defaultValue;

		try {
			const data = this.load();
			return data && key in data ? data[key] : defaultValue;
		} catch (error) {
			console.error('Error loading item:', error);
			return defaultValue;
		}
	}

	/**
	 * Validates and sanitizes data before saving/after loading
	 * @param {Object} data - Data to validate
	 * @returns {Object} Validated and sanitized data
	 */
	validateAndSanitizeData(data) {
		const cleanData = {};

		// Process colors
		if (data.colors) {
			cleanData.colors = {};
			Object.entries(data.colors).forEach(([colorKey, colorValue]) => {
				// Only save valid colors
				if (typeof colorValue === 'string' && colorValue.startsWith('#')) {
					cleanData.colors[colorKey] = colorValue;
				}
			});
		}

		// Process card data
		if (data.card) {
			cleanData.card = {};
			const cardFields = ['username', 'repoName', 'projectName', 'projectDescription'];

			cardFields.forEach((field) => {
				if (typeof data.card[field] === 'string') {
					cleanData.card[field] = data.card[field];
				}
			});
		}

		// Copy other properties that don't require special validation
		Object.entries(data).forEach(([key, value]) => {
			if (!['colors', 'card'].includes(key)) {
				cleanData[key] = value;
			}
		});

		return cleanData;
	}

	/**
	 * Migrates data from older application versions
	 * @returns {boolean} True if migrated successfully or not needed
	 */
	migrateFromOldVersions() {
		if (!this.isStorageAvailable) return false;

		try {
			// Check for old data format
			const oldStorageKey = 'github-card-generator-settings';
			const oldData = localStorage.getItem(oldStorageKey);

			if (!oldData) return true; // No old data to migrate

			// Parse old data
			const parsedOldData = JSON.parse(oldData);

			// Convert to new format
			const newData = this.convertOldDataFormat(parsedOldData);

			// Save in new format
			const saveResult = this.save(newData);

			// Delete old data if migration succeeded
			if (saveResult) {
				localStorage.removeItem(oldStorageKey);
			}

			return saveResult;
		} catch (error) {
			console.error('Error migrating old data:', error);
			return false;
		}
	}

	/**
	 * Converts old data format to new format
	 * @param {Object} oldData - Data in old format
	 * @returns {Object} Data in new format
	 * @private
	 */
	convertOldDataFormat(oldData) {
		// This is a generic example:
		const newData = {
			colors: {},
			card: {},
		};

		if (oldData) {
			// Handle specific old format fields
			if (oldData.projectColor) {
				newData.colors.projectColor = oldData.projectColor;
			}

			if (oldData.accentColor) {
				newData.colors.borderColor = oldData.accentColor;
			}

			if (oldData.bgColor) {
				newData.colors.bgColor = oldData.bgColor;
			}

			// Map old card data
			['username', 'repoName', 'projectName', 'projectDescription'].forEach((field) => {
				if (oldData[field]) {
					newData.card[field] = oldData[field];
				}
			});

			// Copy any other fields
			Object.entries(oldData).forEach(([key, value]) => {
				if (
					![
						'projectColor',
						'accentColor',
						'bgColor',
						'username',
						'repoName',
						'projectName',
						'projectDescription',
					].includes(key)
				) {
					newData[key] = value;
				}
			});
		}

		return newData;
	}
}
