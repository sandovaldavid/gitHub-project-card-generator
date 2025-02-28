import { CONSTANTS } from '../config.js';
import { validateGitHubUsername, isValidURL } from '../../utils/validators.js';

/**
 * Servicio para interactuar con la API de GitHub
 * Maneja solicitudes, caché y validaciones
 */
export class GithubService {
	/**
	 * Constructor que inicializa el servicio
	 */
	constructor() {
		this.baseUrl = CONSTANTS.GITHUB_API.BASE_URL;
		this.cache = new Map();
		this.defaultAvatar = CONSTANTS.GITHUB_API.DEFAULT_AVATAR;

		// Estado para controlar solicitudes en curso
		this.pendingRequests = new Map();
	}

	/**
	 * Obtiene información de un usuario de GitHub
	 * @param {string} username - Nombre de usuario de GitHub
	 * @returns {Promise<Object>} - Datos del usuario
	 * @throws {Error} Si el usuario no existe o hay un error de conexión
	 */
	async getUser(username) {
		// Validar username usando la función específica
		const validation = validateGitHubUsername(username);
		if (!validation.isValid) {
			throw new Error(validation.message);
		}

		// Verificar si ya tenemos los datos en cache
		const cacheKey = `user_${username}`;
		if (this.cache.has(cacheKey)) {
			return this.cache.get(cacheKey);
		}

		// Evitar solicitudes duplicadas simultáneas
		if (this.pendingRequests.has(cacheKey)) {
			return this.pendingRequests.get(cacheKey);
		}

		// Crear nueva solicitud
		const request = this.fetchUserData(username, cacheKey);
		this.pendingRequests.set(cacheKey, request);

		try {
			const result = await request;
			return result;
		} finally {
			this.pendingRequests.delete(cacheKey);
		}
	}

	/**
	 * Realiza la solicitud HTTP para obtener datos del usuario
	 * @param {string} username - Nombre de usuario de GitHub
	 * @param {string} cacheKey - Clave para almacenar en caché
	 * @returns {Promise<Object>} - Datos del usuario
	 * @private
	 */
	async fetchUserData(username, cacheKey) {
		try {
			const response = await fetch(`${this.baseUrl}/users/${username}`);

			if (!response.ok) {
				if (response.status === 404) {
					throw new Error('GitHub user not found');
				} else if (response.status === 403) {
					throw new Error('GitHub API rate limit exceeded. Please try again later.');
				} else {
					throw new Error(`GitHub API error: ${response.statusText}`);
				}
			}

			const userData = await response.json();

			// Guardar en cache
			this.cache.set(cacheKey, userData);

			return userData;
		} catch (error) {
			if (error.message.includes('API')) {
				throw error;
			} else {
				throw new Error('Failed to fetch GitHub profile. Check your internet connection.');
			}
		}
	}

	/**
	 * Obtiene los repositorios de un usuario
	 * @param {string} username - Nombre de usuario de GitHub
	 * @returns {Promise<Array>} - Lista de repositorios
	 */
	async getUserRepositories(username) {
		// Validar username
		const validation = validateGitHubUsername(username);
		if (!validation.isValid) {
			throw new Error(validation.message);
		}

		// Verificar caché
		const cacheKey = `repos_${username}`;
		if (this.cache.has(cacheKey)) {
			return this.cache.get(cacheKey);
		}

		try {
			const response = await fetch(
				`${this.baseUrl}/users/${username}/repos?sort=updated&per_page=100`
			);

			if (!response.ok) {
				if (response.status === 404) {
					throw new Error('GitHub user not found');
				} else {
					throw new Error(`GitHub API error: ${response.statusText}`);
				}
			}

			const reposData = await response.json();

			// Guardar en cache
			this.cache.set(cacheKey, reposData);

			return reposData;
		} catch (error) {
			throw new Error(`Failed to fetch repositories: ${error.message}`);
		}
	}

	/**
	 * Obtiene información de un repositorio específico
	 * @param {string} username - Propietario del repositorio
	 * @param {string} repoName - Nombre del repositorio
	 * @returns {Promise<Object>} - Datos del repositorio
	 */
	async getRepository(username, repoName) {
		// Validación
		const userValidation = validateGitHubUsername(username);
		if (!userValidation.isValid) {
			throw new Error(userValidation.message);
		}

		if (!repoName || repoName.trim() === '') {
			throw new Error('Repository name is required');
		}

		const cacheKey = `repo_${username}_${repoName}`;
		if (this.cache.has(cacheKey)) {
			return this.cache.get(cacheKey);
		}

		try {
			const response = await fetch(`${this.baseUrl}/repos/${username}/${repoName}`);

			if (!response.ok) {
				if (response.status === 404) {
					throw new Error('Repository not found');
				} else {
					throw new Error(`GitHub API error: ${response.statusText}`);
				}
			}

			const repoData = await response.json();

			// Guardar en cache
			this.cache.set(cacheKey, repoData);

			return repoData;
		} catch (error) {
			throw new Error(`Failed to fetch repository: ${error.message}`);
		}
	}

	/**
	 * Aplica los datos del perfil a la UI
	 * @param {Object} userData - Datos del usuario
	 * @param {Object} elements - Referencias a elementos DOM
	 */
	applyUserDataToUI(userData, elements) {
		if (!userData || !elements) return;

		if (elements.profilePic) {
			// Usar avatar_url o fallback a avatar predeterminado
			const avatarUrl = userData.avatar_url || this.defaultAvatar;
			elements.profilePic.src = avatarUrl;

			// Validar URL para seguridad adicional
			if (!isValidURL(avatarUrl)) {
				elements.profilePic.src = this.defaultAvatar;
				console.warn('Invalid avatar URL detected');
			}
		}

		if (elements.username) {
			elements.username.textContent = userData.login || 'username';
		}

		// Se pueden añadir más campos según los datos disponibles
		if (elements.name && userData.name) {
			elements.name.textContent = userData.name;
		}

		if (elements.bio && userData.bio) {
			elements.bio.textContent = userData.bio;
		}
	}

	/**
	 * Limpia la caché para un usuario específico o toda la caché
	 * @param {string} [username] - Usuario para el que limpiar la caché (opcional)
	 */
	clearCache(username) {
		if (username) {
			// Limpiar entradas específicas para este usuario
			const userCacheKeys = [`user_${username}`, `repos_${username}`];
			userCacheKeys.forEach((key) => this.cache.delete(key));

			// Limpiar repositorios individuales
			for (const key of this.cache.keys()) {
				if (key.startsWith(`repo_${username}_`)) {
					this.cache.delete(key);
				}
			}
		} else {
			// Limpiar toda la caché
			this.cache.clear();
		}
	}

	/**
	 * Determina si un usuario existe en GitHub
	 * @param {string} username - Nombre de usuario a verificar
	 * @returns {Promise<boolean>} - True si el usuario existe
	 */
	async userExists(username) {
		try {
			await this.getUser(username);
			return true;
		} catch (error) {
			return false;
		}
	}

	/**
	 * Obtiene los lenguajes utilizados en un repositorio
	 * @param {string} username - Propietario del repositorio
	 * @param {string} repoName - Nombre del repositorio
	 * @returns {Promise<Object>} - Mapa de lenguajes y bytes de código
	 */
	async getRepositoryLanguages(username, repoName) {
		const cacheKey = `langs_${username}_${repoName}`;

		if (this.cache.has(cacheKey)) {
			return this.cache.get(cacheKey);
		}

		try {
			const response = await fetch(`${this.baseUrl}/repos/${username}/${repoName}/languages`);

			if (!response.ok) {
				throw new Error(`Failed to fetch repository languages: ${response.statusText}`);
			}

			const languagesData = await response.json();
			this.cache.set(cacheKey, languagesData);
			return languagesData;
		} catch (error) {
			throw new Error(`Error fetching repository languages: ${error.message}`);
		}
	}
}
