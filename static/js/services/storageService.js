import { CONSTANTS } from '../config.js';
import {
	validateColor,
	validateGitHubUsername,
	validateRepoName,
	validateProjectName,
	validateDescription,
} from '../../utils/validators.js';

/**
 * Servicio para gestionar el almacenamiento persistente de datos
 * Maneja guardado y carga de preferencias del usuario
 */
export class StorageService {
	/**
	 * Inicializa el servicio con una clave de almacenamiento
	 * @param {string} storageKey - Clave para guardar datos en localStorage
	 */
	constructor(storageKey = CONSTANTS.STORAGE_KEY) {
		this.storageKey = storageKey;
		this.isStorageAvailable = this.checkStorageAvailability();
	}

	/**
	 * Comprueba si localStorage está disponible en el navegador
	 * @returns {boolean} True si localStorage está disponible
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
	 * Guarda preferencias del usuario
	 * @param {Object} data - Datos a guardar
	 * @returns {boolean} True si se guardó correctamente
	 */
	save(data) {
		if (!this.isStorageAvailable || !data) return false;

		try {
			// Validar datos antes de guardar
			const cleanData = this.validateAndSanitizeData(data);

			// Guardar datos validados
			localStorage.setItem(this.storageKey, JSON.stringify(cleanData));
			return true;
		} catch (error) {
			console.error('Error saving data:', error);
			return false;
		}
	}

	/**
	 * Carga preferencias del usuario
	 * @returns {Object|null} Datos guardados o null si no hay datos
	 */
	load() {
		if (!this.isStorageAvailable) return null;

		try {
			const storedData = localStorage.getItem(this.storageKey);
			if (!storedData) return null;

			const parsedData = JSON.parse(storedData);

			// Validar datos cargados
			return this.validateAndSanitizeData(parsedData);
		} catch (error) {
			console.error('Error loading data:', error);
			this.clear(); // Borrar datos corruptos
			return null;
		}
	}

	/**
	 * Elimina datos guardados
	 * @returns {boolean} True si se eliminaron correctamente
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
	 * Guarda un valor específico
	 * @param {string} key - Clave del valor
	 * @param {any} value - Valor a guardar
	 * @returns {boolean} True si se guardó correctamente
	 */
	saveItem(key, value) {
		if (!this.isStorageAvailable || !key) return false;

		try {
			const currentData = this.load() || {};
			currentData[key] = value;
			return this.save(currentData);
		} catch (error) {
			console.error(`Error saving ${key}:`, error);
			return false;
		}
	}

	/**
	 * Carga un valor específico
	 * @param {string} key - Clave del valor a cargar
	 * @param {any} defaultValue - Valor por defecto si no existe
	 * @returns {any} Valor guardado o defaultValue
	 */
	loadItem(key, defaultValue = null) {
		if (!this.isStorageAvailable || !key) return defaultValue;

		try {
			const data = this.load();
			return data && data[key] !== undefined ? data[key] : defaultValue;
		} catch (error) {
			console.error(`Error loading ${key}:`, error);
			return defaultValue;
		}
	}

	/**
	 * Valida y sanitiza los datos antes de guardar/después de cargar
	 * @param {Object} data - Datos a validar
	 * @returns {Object} Datos validados y sanitizados
	 */
	validateAndSanitizeData(data) {
		const cleanData = {};

		// Procesar colores
		if (data.colors) {
			cleanData.colors = {};

			// Validar cada color
			const colorKeys = ['projectColor', 'borderColor', 'bgColor'];
			colorKeys.forEach((key) => {
				if (data.colors[key]) {
					const validation = validateColor(data.colors[key]);
					if (validation.isValid) {
						cleanData.colors[key] = data.colors[key];
					} else {
						// Usar color por defecto si es inválido
						cleanData.colors[key] =
							CONSTANTS.UI.DEFAULT_COLORS[key.toUpperCase().replace('COLOR', '')];
					}
				}
			});
		}

		// Procesar datos de la tarjeta
		if (data.card) {
			cleanData.card = {};

			// Validar username
			if (data.card.username) {
				const validation = validateGitHubUsername(data.card.username);
				if (validation.isValid) {
					cleanData.card.username = data.card.username;
				}
			}

			// Validar nombre de repositorio
			if (data.card.repoName !== undefined) {
				const validation = validateRepoName(data.card.repoName);
				if (validation.isValid) {
					cleanData.card.repoName = data.card.repoName;
				}
			}

			// Validar nombre de proyecto
			if (data.card.projectName !== undefined) {
				const validation = validateProjectName(data.card.projectName);
				if (validation.isValid) {
					cleanData.card.projectName = data.card.projectName;
				}
			}

			// Validar descripción
			if (data.card.projectDescription !== undefined) {
				const validation = validateDescription(data.card.projectDescription);
				if (validation.isValid) {
					cleanData.card.projectDescription = data.card.projectDescription;
				}
			}
		}

		// Copiar otras propiedades que no requieren validación especial
		Object.entries(data).forEach(([key, value]) => {
			if (key !== 'colors' && key !== 'card') {
				cleanData[key] = value;
			}
		});

		return cleanData;
	}

	/**
	 * Migra datos de versiones anteriores de la aplicación
	 * @returns {boolean} True si se migró correctamente o no era necesario
	 */
	migrateFromOldVersions() {
		if (!this.isStorageAvailable) return false;

		try {
			// Intentar migrar desde versiones anteriores si existen
			const oldKey = 'github-card-preferences'; // Ejemplo de clave antigua

			if (localStorage.getItem(oldKey)) {
				const oldData = JSON.parse(localStorage.getItem(oldKey));
				this.save(this.convertOldDataFormat(oldData));
				localStorage.removeItem(oldKey);
				return true;
			}

			return true; // No era necesario migrar
		} catch (error) {
			console.error('Error migrating data:', error);
			return false;
		}
	}

	/**
	 * Convierte el formato de datos antiguos al nuevo formato
	 * @param {Object} oldData - Datos en formato antiguo
	 * @returns {Object} Datos en nuevo formato
	 * @private
	 */
	convertOldDataFormat(oldData) {
		// Implementar según el formato antiguo específico
		// Este es un ejemplo genérico:
		const newData = {
			colors: {},
			card: {},
		};

		if (oldData) {
			// Mapeo de colores
			if (oldData.projectColor) newData.colors.projectColor = oldData.projectColor;
			if (oldData.borderColor) newData.colors.borderColor = oldData.borderColor;
			if (oldData.bgColor) newData.colors.bgColor = oldData.bgColor;

			// Mapeo de datos de tarjeta
			if (oldData.username) newData.card.username = oldData.username;
			if (oldData.repoName) newData.card.repoName = oldData.repoName;
			if (oldData.projectName) newData.card.projectName = oldData.projectName;
			if (oldData.description) newData.card.projectDescription = oldData.description;
		}

		return newData;
	}
}
