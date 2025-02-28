import {
	validateRepoName,
	validateProjectName,
	validateDescription,
	validateGitHubUsername,
} from '../../utils/validators.js';
import {
	applyStyles,
} from '../../utils/domUtils.js';
import { CONSTANTS } from '../config.js';

/**
 * Clase responsable de gestionar la tarjeta principal de GitHub
 * Maneja la actualización, validación y manipulación del contenido de la tarjeta
 */
export class CardManager {
	/**
	 * Constructor que inicializa el administrador de tarjetas
	 */
	constructor() {
		this.elements = this.cacheElements();
		this.state = {
			username: '',
			repoName: '',
			projectName: 'Project Name',
			projectDescription: '',
			profileLoaded: false,
		};

		// Inicialización
		this.init();
	}

	/**
	 * Inicializa el componente
	 */
	init() {
		this.renderInitialState();
		this.adjustCardScale();

		// Agregar listener para redimensionar la tarjeta al cambiar el tamaño de la ventana
		window.addEventListener('resize', () => this.adjustCardScale());
	}

	/**
	 * Obtiene referencias a los elementos del DOM
	 * @returns {Object} Referencias a los elementos del DOM
	 */
	cacheElements() {
		return {
			// Elementos de visualización de la tarjeta
			card: document.getElementById('githubCard'),
			cardContainer: document.getElementById('cardContainer'),
			displayUsername: document.getElementById('displayUsername'),
			profilePic: document.getElementById('profilePic'),
			displayRepoName: document.getElementById('displayRepoName'),
			displayProjectName: document.getElementById('displayProjectName'),
			displayDescription: document.getElementById('displayDescription'),

			// Elementos de entrada de datos
			usernameInput: document.getElementById('username'),
			repoNameInput: document.getElementById('repoName'),
			projectNameInput: document.getElementById('projectName'),
			projectDescriptionInput: document.getElementById('projectDescription'),
		};
	}

	/**
	 * Renderiza el estado inicial de la tarjeta
	 */
	renderInitialState() {
		if (this.elements.displayUsername) {
			this.elements.displayUsername.textContent = 'username';
		}

		if (this.elements.displayRepoName) {
			this.elements.displayRepoName.textContent = '/repository-name';
		}

		if (this.elements.displayProjectName) {
			this.elements.displayProjectName.textContent = 'Project Name';
		}

		if (this.elements.displayDescription) {
			this.elements.displayDescription.textContent = '';
			this.elements.displayDescription.style.display = 'none';
		}
	}

	/**
	 * Actualiza la tarjeta con la información proporcionada
	 * @param {Object} data - Datos para actualizar la tarjeta
	 */
	update(data = {}) {
		// Validar datos de entrada
		this.validateCardData(data);

		// Actualizar el estado interno
		Object.assign(this.state, data);

		// Actualizar el repositorio
		this.updateRepositoryName(data.repoName);

		// Actualizar el nombre del proyecto
		this.updateProjectName(data.projectName);

		// Actualizar la descripción
		this.updateDescription(data.projectDescription);

		// Actualizar el nombre de usuario si se proporciona y el perfil no está cargado
		if (data.username && !this.state.profileLoaded) {
			this.updateUsername(data.username);
		}

		// Asegurarse de que la tarjeta tenga las dimensiones correctas
		this.adjustCardScale();

		return true;
	}

	/**
	 * Valida los datos de la tarjeta
	 * @param {Object} data - Datos a validar
	 * @throws {Error} Si algún dato es inválido
	 */
	validateCardData(data) {
		const errors = {};

		if (data.repoName !== undefined) {
			const repoValidation = validateRepoName(data.repoName);
			if (!repoValidation.isValid) {
				errors.repoName = repoValidation.message;
			}
		}

		if (data.projectName !== undefined) {
			const projectNameValidation = validateProjectName(data.projectName);
			if (!projectNameValidation.isValid) {
				errors.projectName = projectNameValidation.message;
			}
		}

		if (data.projectDescription !== undefined) {
			const descValidation = validateDescription(data.projectDescription);
			if (!descValidation.isValid) {
				errors.projectDescription = descValidation.message;
			}
		}

		if (data.username !== undefined) {
			const usernameValidation = validateGitHubUsername(data.username);
			if (!usernameValidation.isValid) {
				errors.username = usernameValidation.message;
			}
		}

		// Si hay errores, lanzar excepción
		if (Object.keys(errors).length > 0) {
			const error = new Error('Invalid card data');
			error.errors = errors;
			throw error;
		}
	}

	/**
	 * Actualiza el nombre del repositorio en la tarjeta
	 * @param {string} repoName - Nombre del repositorio
	 */
	updateRepositoryName(repoName) {
		if (this.elements.displayRepoName) {
			this.elements.displayRepoName.textContent = repoName
				? `/${repoName}`
				: '/repository-name';
		}
	}

	/**
	 * Actualiza el nombre del proyecto en la tarjeta
	 * @param {string} projectName - Nombre del proyecto
	 */
	updateProjectName(projectName) {
		if (this.elements.displayProjectName) {
			this.elements.displayProjectName.textContent = projectName || 'Project Name';
		}
	}

	/**
	 * Actualiza la descripción del proyecto en la tarjeta
	 * @param {string} description - Descripción del proyecto
	 */
	updateDescription(description) {
		if (this.elements.displayDescription) {
			// Actualizar contenido
			this.elements.displayDescription.textContent = description || '';

			// Ajustar visibilidad según si hay descripción o no
			applyStyles(this.elements.displayDescription, {
				display: description ? 'block' : 'none',
			});
		}
	}

	/**
	 * Actualiza el nombre de usuario en la tarjeta
	 * @param {string} username - Nombre de usuario
	 */
	updateUsername(username) {
		if (this.elements.displayUsername) {
			this.elements.displayUsername.textContent = username || 'username';
		}
	}

	/**
	 * Ajusta la escala de la tarjeta para que se vea bien en la pantalla
	 */
	adjustCardScale() {
		const card = this.elements.card;
		const container = this.elements.cardContainer;

		if (!card || !container) return;

		// Asegurarse de que la tarjeta llene su contenedor naturalmente
		applyStyles(card, {
			width: '100%',
			height: '100%',
		});

		// Asegurarse de que el nombre de usuario sea visible
		if (this.elements.displayUsername) {
			applyStyles(this.elements.displayUsername, {
				display: 'block',
			});
		}
	}

	/**
	 * Establece los datos de usuario de GitHub
	 * @param {Object} userData - Datos del usuario de GitHub
	 */
	setUserData(userData) {
		if (!userData) return;

		// Establecer imagen de perfil
		if (userData.avatar_url && this.elements.profilePic) {
			this.elements.profilePic.src = userData.avatar_url;
		}

		// Establecer nombre de usuario
		if (userData.login && this.elements.displayUsername) {
			this.elements.displayUsername.textContent = userData.login;

			// Actualizar también el campo de entrada
			if (this.elements.usernameInput) {
				this.elements.usernameInput.value = userData.login;
			}
		}

		// Marcar que el perfil ha sido cargado
		this.state.profileLoaded = true;
		this.state.username = userData.login || '';
	}

	/**
	 * Aplica configuraciones guardadas a la tarjeta
	 * @param {Object} settings - Configuraciones guardadas
	 */
	applySettings(settings) {
		if (!settings) return;

		try {
			// Actualizar valores en los inputs
			if (settings.username && this.elements.usernameInput) {
				this.elements.usernameInput.value = settings.username;
			}

			if (settings.repoName && this.elements.repoNameInput) {
				this.elements.repoNameInput.value = settings.repoName;
			}

			if (settings.projectName && this.elements.projectNameInput) {
				this.elements.projectNameInput.value = settings.projectName;
			}

			if (settings.projectDescription && this.elements.projectDescriptionInput) {
				this.elements.projectDescriptionInput.value = settings.projectDescription;
			}

			// Actualizar la tarjeta con estos valores
			this.update(settings);
		} catch (error) {
			console.error('Error applying card settings:', error);

			// Si hay un sistema de notificaciones, usarlo
			if (window.notificationSystem) {
				window.notificationSystem.show('Error applying saved settings', 'error');
			}
		}
	}

	/**
	 * Obtiene los datos actuales de la tarjeta
	 * @returns {Object} Estado actual de la tarjeta
	 */
	getCardData() {
		return { ...this.state };
	}

	/**
	 * Limpia la tarjeta a su estado inicial
	 */
	reset() {
		// Resetear estado
		this.state = {
			username: '',
			repoName: '',
			projectName: 'Project Name',
			projectDescription: '',
			profileLoaded: false,
		};

		// Resetear inputs
		if (this.elements.usernameInput) this.elements.usernameInput.value = '';
		if (this.elements.repoNameInput) this.elements.repoNameInput.value = '';
		if (this.elements.projectNameInput) this.elements.projectNameInput.value = '';
		if (this.elements.projectDescriptionInput) this.elements.projectDescriptionInput.value = '';

		// Resetear visualización
		this.renderInitialState();

		// Resetear imagen de perfil
		if (this.elements.profilePic) {
			this.elements.profilePic.src = CONSTANTS.GITHUB_API.DEFAULT_AVATAR;
		}
	}

	/**
	 * Prepara la tarjeta para exportación
	 * @returns {HTMLElement} Clon de la tarjeta preparado para exportación
	 */
	prepareForExport() {
		// Esta funcionalidad se delegó al servicio ExportService
		return this.elements.card;
	}
}
