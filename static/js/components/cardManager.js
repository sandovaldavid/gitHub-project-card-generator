import {
	validateRepoName,
	validateProjectName,
	validateDescription,
	validateGitHubUsername,
} from '../../utils/validators.js';
import { applyStyles } from '../../utils/domUtils.js';
import { CONSTANTS } from '../config.js';
import { ICardState, ICardRenderer, ICardValidator, ICardManager } from './cardInterfaces.js';

/**
 * Class responsible for managing the card state
 * Implements the Single Responsibility Principle (SRP) and Interface Segregation (ISP)
 */
class CardState extends ICardState {
	/**
	 * Constructor for the state class
	 * @param {Object} initialState - Initial card state
	 */
	constructor(initialState = {}) {
		super();
		this.state = {
			username: '',
			repoName: '',
			projectName: 'Project Name',
			projectDescription: '',
			profileLoaded: false,
			...initialState,
		};

		this.subscribers = [];
	}

	/**
	 * Updates the state
	 * @param {Object} newState - New partial state
	 */
	update(newState) {
		if (!newState) return;

		const oldState = { ...this.state };
		this.state = { ...this.state, ...newState };

		// Notify all subscribers
		this.notifySubscribers(oldState, this.state);

		return this.state;
	}

	/**
	 * Gets a specific property from the state
	 * @param {string} property - Property name
	 * @returns {any} Property value
	 */
	getProperty(property) {
		return this.state[property];
	}

	/**
	 * Sets a specific property in the state
	 * @param {string} property - Property name
	 * @param {any} value - Property value
	 * @returns {boolean} True if the update was successful
	 */
	setProperty(property, value) {
		if (property === undefined) return false;

		const oldState = { ...this.state };
		this.state[property] = value;
		this.notifySubscribers(oldState, this.state);
		return true;
	}

	/**
	 * Gets all state properties
	 * @returns {Object} Complete state
	 */
	getAllProperties() {
		return { ...this.state };
	}

	/**
	 * Gets the current state
	 * @returns {Object} Current state
	 */
	getState() {
		return { ...this.state };
	}

	/**
	 * Subscribes a function to state changes
	 * @param {Function} callback - Function to call when state changes
	 */
	subscribe(callback) {
		if (typeof callback !== 'function') return;
		this.subscribers.push(callback);

		// Return function to unsubscribe
		return () => {
			this.subscribers = this.subscribers.filter((cb) => cb !== callback);
		};
	}

	/**
	 * Notifies all subscribers about state changes
	 * @param {Object} oldState - Previous state
	 * @param {Object} newState - New state
	 */
	notifySubscribers(oldState, newState) {
		this.subscribers.forEach((callback) => {
			callback(newState, oldState);
		});
	}

	/**
	 * Resets the state to initial values
	 */
	reset() {
		const oldState = { ...this.state };
		this.state = {
			username: '',
			repoName: '',
			projectName: 'Project Name',
			projectDescription: '',
			profileLoaded: false,
		};
		this.notifySubscribers(oldState, this.state);
	}
}

/**
 * Class responsible for validating card data
 * Implements the Single Responsibility Principle (SRP) and Interface Segregation (ISP)
 */
class CardValidator extends ICardValidator {
	/**
	 * Validates the card data
	 * @param {Object} data - Data to validate
	 * @returns {Object} Validation result {isValid, errors}
	 */
	validate(data) {
		const errors = {};
		let isValid = true;

		if (data.repoName !== undefined) {
			const validation = this.validateProperty('repoName', data.repoName);
			if (!validation.isValid) {
				errors.repoName = validation.message;
				isValid = false;
			}
		}

		if (data.projectName !== undefined) {
			const validation = this.validateProperty('projectName', data.projectName);
			if (!validation.isValid) {
				errors.projectName = validation.message;
				isValid = false;
			}
		}

		if (data.projectDescription !== undefined) {
			const validation = this.validateProperty('projectDescription', data.projectDescription);
			if (!validation.isValid) {
				errors.projectDescription = validation.message;
				isValid = false;
			}
		}

		if (data.username !== undefined) {
			const validation = this.validateProperty('username', data.username);
			if (!validation.isValid) {
				errors.username = validation.message;
				isValid = false;
			}
		}

		return { isValid, errors };
	}

	/**
	 * Validates a specific property
	 * @param {string} property - Property name
	 * @param {any} value - Value to validate
	 * @returns {Object} Validation result {isValid, message}
	 */
	validateProperty(property, value) {
		switch (property) {
			case 'repoName':
				return validateRepoName(value);
			case 'projectName':
				return validateProjectName(value);
			case 'projectDescription':
				return validateDescription(value);
			case 'username':
				return validateGitHubUsername(value);
			default:
				return { isValid: true, message: '' };
		}
	}
}

/**
 * Class responsible for rendering card interface changes
 * Implements the Single Responsibility Principle (SRP) and Interface Segregation (ISP)
 */
class CardRenderer extends ICardRenderer {
	/**
	 * Constructor for the renderer
	 * @param {Object} elements - References to card DOM elements
	 */
	constructor(elements) {
		super();
		this.elements = elements;
	}

	/**
	 * Renders the initial card state
	 */
	renderInitial() {
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

		if (this.elements.profilePic) {
			this.elements.profilePic.src = CONSTANTS.GITHUB_API.DEFAULT_AVATAR;
		}
	}

	/**
	 * Renders the card with provided data
	 * @param {Object} cardData - Card data
	 * @param {HTMLElement} container - Optional container
	 * @returns {HTMLElement} Card element
	 */
	render(cardData, container = null) {
		if (!cardData) return null;

		this.updateUsername(cardData.username);
		this.updateRepositoryName(cardData.repoName);
		this.updateProjectName(cardData.projectName);
		this.updateDescription(cardData.projectDescription);
		this.adjustCardScale();

		return this.elements.card;
	}

	/**
	 * Updates specific parts of the card
	 * @param {Object} updates - Data to update
	 * @returns {HTMLElement} Card element
	 */
	updateCard(updates) {
		if (!updates) return null;

		if (updates.username !== undefined) {
			this.updateUsername(updates.username);
		}

		if (updates.repoName !== undefined) {
			this.updateRepositoryName(updates.repoName);
		}

		if (updates.projectName !== undefined) {
			this.updateProjectName(updates.projectName);
		}

		if (updates.projectDescription !== undefined) {
			this.updateDescription(updates.projectDescription);
		}

		if (updates.avatar_url !== undefined) {
			this.updateAvatar(updates.avatar_url);
		}

		this.adjustCardScale();

		return this.elements.card;
	}

	/**
	 * Updates the username on the card
	 * @param {string} username - Username to display
	 */
	updateUsername(username) {
		if (this.elements.displayUsername) {
			this.elements.displayUsername.textContent = username || 'username';
		}
	}

	/**
	 * Updates the repository name on the card
	 * @param {string} repoName - Repository name to display
	 */
	updateRepositoryName(repoName) {
		if (this.elements.displayRepoName) {
			this.elements.displayRepoName.textContent = repoName
				? `/${repoName}`
				: '/repository-name';
		}
	}

	/**
	 * Updates the project name on the card
	 * @param {string} projectName - Project name to display
	 */
	updateProjectName(projectName) {
		if (this.elements.displayProjectName) {
			this.elements.displayProjectName.textContent = projectName || 'Project Name';
		}
	}

	/**
	 * Updates the project description on the card
	 * @param {string} description - Description to display
	 */
	updateDescription(description) {
		if (this.elements.displayDescription) {
			// Update content
			this.elements.displayDescription.textContent = description || '';

			// Adjust visibility based on whether there is a description
			applyStyles(this.elements.displayDescription, {
				display: description ? 'block' : 'none',
			});
		}
	}

	/**
	 * Updates the user avatar
	 * @param {string} avatarUrl - Avatar URL
	 */
	updateAvatar(avatarUrl) {
		if (this.elements.profilePic) {
			this.elements.profilePic.src = avatarUrl || CONSTANTS.GITHUB_API.DEFAULT_AVATAR;
		}
	}

	/**
	 * Adjusts the card scale for optimal viewing
	 */
	adjustCardScale() {
		const card = this.elements.card;
		const container = this.elements.cardContainer;

		if (!card || !container) return;

		// Ensure the card fills its container naturally
		applyStyles(card, {
			width: '100%',
			height: '100%',
		});

		// Ensure username is visible
		if (this.elements.displayUsername) {
			applyStyles(this.elements.displayUsername, {
				display: 'block',
			});
		}
	}
}

/**
 * Main class that manages the GitHub card
 * Implements the Facade pattern to coordinate various responsibilities
 * and implements the ICardManager interface
 */
export class CardManager extends ICardManager {
	/**
	 * Constructor that initializes the card manager
	 * @param {ICardValidator} validator - Card validator
	 * @param {ICardState} stateManager - State manager
	 * @param {ICardRenderer} renderer - Card renderer
	 */
	constructor(validator = null, stateManager = null, renderer = null) {
		super();
		this.elements = this.cacheElements();

		// Dependency injection (DIP)
		this.validator = validator || new CardValidator();
		this.stateManager = stateManager || new CardState();
		this.renderer = renderer || new CardRenderer(this.elements);

		// Unique ID for the current card
		this.currentCardId = `card-${Date.now()}`;

		// Initialization
		this.init();
	}

	/**
	 * Initializes the component
	 */
	init() {
		this.renderer.renderInitial();
		this.renderer.adjustCardScale();

		// Add listener to resize the card when window size changes
		window.addEventListener('resize', () => {
			this.renderer.adjustCardScale();
		});

		// Subscribe to state changes
		this.stateManager.subscribe((newState) => {
			this.renderer.updateCard(newState);
		});
	}

	/**
	 * Gets references to DOM elements
	 * @returns {Object} References to DOM elements
	 */
	cacheElements() {
		return {
			// Card display elements
			card: document.getElementById('githubCard'),
			cardContainer: document.getElementById('cardContainer'),
			displayUsername: document.getElementById('displayUsername'),
			profilePic: document.getElementById('profilePic'),
			displayRepoName: document.getElementById('displayRepoName'),
			displayProjectName: document.getElementById('displayProjectName'),
			displayDescription: document.getElementById('displayDescription'),

			// Data input elements
			usernameInput: document.getElementById('username'),
			repoNameInput: document.getElementById('repoName'),
			projectNameInput: document.getElementById('projectName'),
			projectDescriptionInput: document.getElementById('projectDescription'),
		};
	}

	/**
	 * Creates a new card with the provided data
	 * @param {Object} cardData - Initial card data
	 * @returns {string} ID of the created card
	 */
	createCard(cardData) {
		// Validate input data
		const validation = this.validator.validate(cardData);
		if (!validation.isValid) {
			const error = new Error('Invalid card data');
			error.errors = validation.errors;
			throw error;
		}

		// Generate a new unique ID
		this.currentCardId = `card-${Date.now()}`;

		// Update state
		this.stateManager.update(cardData);

		// Return the ID
		return this.currentCardId;
	}

	/**
	 * Updates an existing card
	 * @param {string} cardId - Card ID
	 * @param {Object} updates - Data to update
	 * @returns {boolean} True if the update was successful
	 */
	updateCard(cardId, updates) {
		// Verify it's the current card
		if (cardId !== this.currentCardId) {
			throw new Error(`Card with ID ${cardId} not found`);
		}

		// Validate update data only if not empty
		// Filter properties for validation (ignore empty strings)
		const dataToValidate = {};
		Object.entries(updates).forEach(([key, value]) => {
			// Only validate values that aren't empty strings
			if (value !== '' || typeof value !== 'string') {
				dataToValidate[key] = value;
			}
		});

		// Validate only if there's data to validate
		if (Object.keys(dataToValidate).length > 0) {
			const validation = this.validator.validate(dataToValidate);
			if (!validation.isValid) {
				const error = new Error('Invalid card data for update');
				error.errors = validation.errors;
				throw error;
			}
		}

		// Update state with all data, even empty ones
		this.stateManager.update(updates);

		return true;
	}

	/**
	 * Gets a card by its ID
	 * @param {string} cardId - Card ID
	 * @returns {Object} Card data
	 */
	getCard(cardId) {
		// Verify it's the current card
		if (cardId !== this.currentCardId) {
			throw new Error(`Card with ID ${cardId} not found`);
		}

		return this.stateManager.getAllProperties();
	}

	/**
	 * Renders a card in a container
	 * @param {string} cardId - Card ID
	 * @param {HTMLElement} container - Container for rendering
	 * @returns {HTMLElement} Rendered card element
	 */
	renderCard(cardId, container) {
		// Verify it's the current card
		if (cardId !== this.currentCardId) {
			throw new Error(`Card with ID ${cardId} not found`);
		}

		const cardData = this.stateManager.getAllProperties();
		return this.renderer.render(cardData, container);
	}

	/**
	 * Updates the card with the provided information
	 * @param {Object} data - Data to update the card
	 * @returns {boolean} True if the update was successful
	 * @throws {Error} If there are validation errors
	 */
	update(data = {}) {
		// Preserve avatar URL if it exists in the current state
		const currentState = this.stateManager.getAllProperties();
		if (currentState.avatar_url && !data.avatar_url) {
			data.avatar_url = currentState.avatar_url;
		}

		return this.updateCard(this.currentCardId, data);
	}

	/**
	 * Sets GitHub user data
	 * @param {Object} userData - GitHub user data
	 */
	setUserData(userData) {
		if (!userData) return;

		// Update avatar
		if (userData.avatar_url) {
			this.renderer.updateAvatar(userData.avatar_url);
		}

		// Update state with user data
		this.stateManager.update({
			username: userData.login,
			avatar_url: userData.avatar_url, // Save avatar URL in state
			profileLoaded: true,
		});

		// Also update the input field if it exists
		if (this.elements.usernameInput) {
			this.elements.usernameInput.value = userData.login;
		}
	}

	/**
	 * Applies saved settings to the card
	 * @param {Object} settings - Saved settings
	 */
	applySettings(settings) {
		if (!settings) return;

		try {
			// Update values in inputs
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

			// Update card state
			this.update(settings);
		} catch (error) {
			console.error('Error applying card settings:', error);

			// If there's a notification system, use it
			if (window.notificationSystem) {
				window.notificationSystem.show('Error applying saved settings', 'error');
			}
		}
	}

	/**
	 * Gets the current card data
	 * @returns {Object} Current card state
	 */
	getCardData() {
		return this.stateManager.getAllProperties();
	}

	/**
	 * Clears the card to its initial state
	 */
	reset() {
		// Reset inputs
		if (this.elements.usernameInput) this.elements.usernameInput.value = '';
		if (this.elements.repoNameInput) this.elements.repoNameInput.value = '';
		if (this.elements.projectNameInput) this.elements.projectNameInput.value = '';
		if (this.elements.projectDescriptionInput) this.elements.projectDescriptionInput.value = '';

		// Reset profile image and state
		this.renderer.updateAvatar(CONSTANTS.GITHUB_API.DEFAULT_AVATAR);
		this.stateManager.reset();
	}

	/**
	 * Prepares the card for export
	 * @returns {HTMLElement} Card element
	 */
	prepareForExport() {
		/* Just return the card element, export logic
		is handled in the ExportService */
		return this.elements.card;
	}
}
