/**
 * Interface for HTTP clients
 * Implements the Interface Segregation Principle (ISP)
 */
export class IHttpClient {
	/**
	 * Performs a GET request
	 * @param {string} url - URL to request
	 * @param {Object} options - Additional options
	 * @returns {Promise<Object>} - JSON response
	 */
	async get(url, options = {}) {
		throw new Error('Method must be implemented by subclasses');
	}

	/**
	 * Performs a POST request
	 * @param {string} url - URL to request
	 * @param {Object} data - Data to send
	 * @param {Object} options - Additional options
	 * @returns {Promise<Object>} - JSON response
	 */
	async post(url, data = {}, options = {}) {
		throw new Error('Method must be implemented by subclasses');
	}
}

/**
 * Fetch-based implementation of HTTP client
 * Implements the Interface Segregation Principle (ISP)
 */
export class FetchHttpClient extends IHttpClient {
	/**
	 * Performs a GET request
	 * @param {string} url - URL to request
	 * @param {Object} options - Additional options
	 * @returns {Promise<Object>} - JSON response
	 */
	async get(url, options = {}) {
		try {
			const response = await fetch(url, {
				method: 'GET',
				headers: {
					Accept: 'application/json',
					...options.headers,
				},
				...options,
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			return await response.json();
		} catch (error) {
			console.error('Error in HTTP GET:', error);
			throw error;
		}
	}

	/**
	 * Performs a POST request
	 * @param {string} url - URL to request
	 * @param {Object} data - Data to send
	 * @param {Object} options - Additional options
	 * @returns {Promise<Object>} - JSON response
	 */
	async post(url, data = {}, options = {}) {
		try {
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Accept: 'application/json',
					...options.headers,
				},
				body: JSON.stringify(data),
				...options,
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			return await response.json();
		} catch (error) {
			console.error('Error in HTTP POST:', error);
			throw error;
		}
	}
}
