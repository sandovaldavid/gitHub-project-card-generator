import { CONSTANTS } from '../config.js';
import { validateGitHubUsername } from '../../utils/validators.js';
import { isValidURL } from '../../utils/validators.js';
import { IHttpClient, FetchHttpClient } from './httpService.js';

/**
 * GitHub Cache Class
 * Implements Single Responsibility Principle (S)
 */
class GithubCache {
	/**
	 * Constructor
	 * @param {number} ttl - Time to live in milliseconds (1 hour default)
	 */
	constructor(ttl = 3600000) {
		this.cache = new Map();
		this.ttl = ttl;
	}

	/**
	 * Stores a value in cache
	 * @param {string} key - Key to store
	 * @param {any} value - Value to store
	 */
	set(key, value) {
		if (!key) return;

		this.cache.set(key, {
			value,
			timestamp: Date.now(),
		});
	}

	/**
	 * Gets a value from cache
	 * @param {string} key - Key to lookup
	 * @returns {any|null} Stored value or null
	 */
	get(key) {
		if (!key || !this.cache.has(key)) return null;

		const cachedItem = this.cache.get(key);
		const now = Date.now();

		// Check if expired
		if (now - cachedItem.timestamp > this.ttl) {
			this.cache.delete(key);
			return null;
		}

		return cachedItem.value;
	}

	/**
	 * Clears the entire cache
	 */
	clear() {
		this.cache.clear();
	}

	/**
	 * Removes a specific item from cache
	 * @param {string} key - Key to delete
	 * @returns {boolean} True if item was deleted
	 */
	delete(key) {
		if (this.cache.has(key)) {
			this.cache.delete(key);
			return true;
		}
		return false;
	}
}

/**
 * GitHub Service
 * Implements Dependency Inversion Principle (D) by accepting dependencies
 */
export class GithubService {
	/**
	 * Constructor
	 * @param {Object} options - Configuration options
	 * @param {IHttpClient} httpClient - HTTP client to use
	 */
	constructor(options = {}, httpClient = null) {
		this.options = {
			apiUrl: CONSTANTS.GITHUB_API.BASE_URL,
			defaultAvatarUrl: CONSTANTS.GITHUB_API.DEFAULT_AVATAR,
			cacheTTL: 3600000, // 1 hour
			...options,
		};

		// Initialize dependencies
		this.httpClient = httpClient || new FetchHttpClient();
		this.cache = new GithubCache(this.options.cacheTTL);

		// Request state
		this.lastRequestError = null;
		this.isLoading = false;
	}

	/**
	 * Retrieves GitHub user data
	 * @param {string} username - GitHub username
	 * @returns {Promise<Object>} User data
	 * @throws {Error} If request fails
	 */
	async getUserData(username) {
		try {
			this.isLoading = true;
			this.lastRequestError = null;

			// Validate username
			const validation = validateGitHubUsername(username);
			if (!validation.isValid) {
				throw new Error(validation.message);
			}

			// Check cache first
			const cacheKey = `user:${username}`;
			const cachedData = this.cache.get(cacheKey);

			if (cachedData) {
				return cachedData;
			}

			// If not in cache, fetch data
			const userData = await this.fetchUserData(username);

			// Store in cache
			this.cache.set(cacheKey, userData);

			return userData;
		} catch (error) {
			this.lastRequestError = error.message;
			throw error;
		} finally {
			this.isLoading = false;
		}
	}

	/**
	 * Makes API request to get user data
	 * @param {string} username - Username
	 * @returns {Promise<Object>} User data
	 * @private
	 */
	async fetchUserData(username) {
		const url = `${this.options.apiUrl}/users/${encodeURIComponent(username)}`;

		try {
			const data = await this.httpClient.get(url);
			return this.processUserData(data);
		} catch (error) {
			if (error.message.includes('404')) {
				throw new Error(`User '${username}' not found on GitHub`);
			}
			throw error;
		}
	}

	/**
	 * Processes raw user data
	 * @param {Object} userData - Raw user data
	 * @returns {Object} Processed data
	 * @private
	 */
	processUserData(userData) {
		if (!userData) {
			return null;
		}

		// Extract only needed fields
		return {
			login: userData.login,
			name: userData.name,
			avatar_url: userData.avatar_url,
			html_url: userData.html_url,
			public_repos: userData.public_repos,
			followers: userData.followers,
			bio: userData.bio,
		};
	}

	/**
	 * Gets repository information
	 * @param {string} username - Username
	 * @param {string} repoName - Repository name
	 * @returns {Promise<Object>} Repository data
	 */
	async getRepositoryData(username, repoName) {
		if (!username || !repoName) {
			throw new Error('Username and repository name are required');
		}

		try {
			this.isLoading = true;
			this.lastRequestError = null;

			// Check cache first
			const cacheKey = `repo:${username}/${repoName}`;
			const cachedData = this.cache.get(cacheKey);

			if (cachedData) {
				return cachedData;
			}

			const url = `${this.options.apiUrl}/repos/${encodeURIComponent(
				username
			)}/${encodeURIComponent(repoName)}`;
			const data = await this.httpClient.get(url);

			const repoData = this.processRepoData(data);

			// Store in cache
			this.cache.set(cacheKey, repoData);

			return repoData;
		} catch (error) {
			this.lastRequestError = error.message;
			if (error.message.includes('404')) {
				throw new Error(`Repository '${repoName}' not found for user '${username}'`);
			}
			throw error;
		} finally {
			this.isLoading = false;
		}
	}

	/**
	 * Processes raw repository data
	 * @param {Object} repoData - Raw repository data
	 * @returns {Object} Processed data
	 * @private
	 */
	processRepoData(repoData) {
		if (!repoData) {
			return null;
		}

		return {
			name: repoData.name,
			full_name: repoData.full_name,
			description: repoData.description,
			html_url: repoData.html_url,
			stargazers_count: repoData.stargazers_count,
			forks_count: repoData.forks_count,
			language: repoData.language,
			updated_at: repoData.updated_at,
		};
	}

	/**
	 * Validates an avatar URL
	 * @param {string} url - URL to validate
	 * @returns {Promise<boolean>} True if URL is valid
	 */
	async validateAvatarUrl(url) {
		if (!url || !isValidURL(url)) {
			return false;
		}

		try {
			const response = await fetch(url, { method: 'HEAD' });
			return response.ok && response.headers.get('content-type').startsWith('image/');
		} catch (error) {
			console.warn('Failed to validate avatar URL:', error);
			return false;
		}
	}

	/**
	 * Gets a valid avatar URL
	 * @param {string} url - URL to validate
	 * @returns {Promise<string>} Valid URL or default avatar
	 */
	async getValidAvatarUrl(url) {
		const isValid = await this.validateAvatarUrl(url);
		return isValid ? url : this.options.defaultAvatarUrl;
	}

	/**
	 * Gets a GitHub user's profile image
	 * @param {string} username - GitHub username
	 * @returns {Promise<string>} Profile image URL
	 * @throws {Error} If image fetch fails
	 */
	async getProfileImage(username) {
		try {
			this.isLoading = true;
			this.lastRequestError = null;

			// Check cache first
			const cacheKey = `avatar:${username}`;
			const cachedData = this.cache.get(cacheKey);

			if (cachedData) {
				return cachedData;
			}

			// Get user data to extract avatar URL
			const userData = await this.getUserData(username);
			if (!userData) {
				throw new Error(`User '${username}' not found`);
			}

			// Validate and get avatar URL
			const avatarUrl = await this.getValidAvatarUrl(userData.avatar_url);

			// Cache the avatar URL
			this.cache.set(cacheKey, avatarUrl);

			return avatarUrl;
		} catch (error) {
			this.lastRequestError = error.message;
			// Return default avatar on error
			return this.options.defaultAvatarUrl;
		} finally {
			this.isLoading = false;
		}
	}

	/**
	 * Clears the service cache
	 */
	clearCache() {
		this.cache.clear();
	}

	/**
	 * Gets the last error state
	 * @returns {string|null} Error message or null
	 */
	getLastError() {
		return this.lastRequestError;
	}

	/**
	 * Checks if service is loading data
	 * @returns {boolean} True if loading is in progress
	 */
	getIsLoading() {
		return this.isLoading;
	}
}
