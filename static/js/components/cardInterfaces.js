/**
 * Interface for card state management
 * Implements the Interface Segregation Principle (ISP)
 */
export class ICardState {
	/**
	 * Gets a card property
	 * @param {string} property - Property name
	 * @returns {any} Property value
	 */
	getProperty(property) {
		throw new Error('Method must be implemented by subclasses');
	}

	/**
	 * Sets a card property
	 * @param {string} property - Property name
	 * @param {any} value - Property value
	 * @returns {boolean} Success status
	 */
	setProperty(property, value) {
		throw new Error('Method must be implemented by subclasses');
	}

	/**
	 * Gets all card properties
	 * @returns {Object} All properties
	 */
	getAllProperties() {
		throw new Error('Method must be implemented by subclasses');
	}
}

/**
 * Interface for card rendering
 * Implements the Interface Segregation Principle (ISP)
 */
export class ICardRenderer {
	/**
	 * Renders the card
	 * @param {Object} cardData - Card data to render
	 * @param {HTMLElement} container - Container element
	 * @returns {HTMLElement} Rendered element
	 */
	render(cardData, container) {
		throw new Error('Method must be implemented by subclasses');
	}

	/**
	 * Updates specific parts of the card
	 * @param {Object} updates - Properties to update
	 * @returns {HTMLElement} Updated element
	 */
	updateCard(updates) {
		throw new Error('Method must be implemented by subclasses');
	}
}

/**
 * Interface for card validation
 * Implements the Interface Segregation Principle (ISP)
 */
export class ICardValidator {
	/**
	 * Validates card data
	 * @param {Object} cardData - Card data to validate
	 * @returns {Object} Validation result with isValid flag and errors
	 */
	validate(cardData) {
		throw new Error('Method must be implemented by subclasses');
	}

	/**
	 * Validates a specific property
	 * @param {string} property - Property name
	 * @param {any} value - Property value
	 * @returns {Object} Validation result with isValid flag and error message
	 */
	validateProperty(property, value) {
		throw new Error('Method must be implemented by subclasses');
	}
}

/**
 * Interface for card manager
 * Implements the Interface Segregation Principle (ISP)
 */
export class ICardManager {
	/**
	 * Creates a new card
	 * @param {Object} cardData - Initial card data
	 * @returns {string} Card ID
	 */
	createCard(cardData) {
		throw new Error('Method must be implemented by subclasses');
	}

	/**
	 * Updates a card
	 * @param {string} cardId - Card ID
	 * @param {Object} updates - Properties to update
	 * @returns {boolean} Success status
	 */
	updateCard(cardId, updates) {
		throw new Error('Method must be implemented by subclasses');
	}

	/**
	 * Gets a card by ID
	 * @param {string} cardId - Card ID
	 * @returns {Object} Card data
	 */
	getCard(cardId) {
		throw new Error('Method must be implemented by subclasses');
	}

	/**
	 * Renders a card
	 * @param {string} cardId - Card ID
	 * @param {HTMLElement} container - Container element
	 * @returns {HTMLElement} Rendered element
	 */
	renderCard(cardId, container) {
		throw new Error('Method must be implemented by subclasses');
	}
}
