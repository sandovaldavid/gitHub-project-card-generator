import { validateImageFile } from '../../utils/validators.js';
import {
	createElement,
	clearElement,
	applyStyles,
	updateClassList,
	setCSSVariables,
} from '../../utils/domUtils.js';

/**
 * Class responsible for managing the background image of the card
 * Implements the Single Responsibility Principle (SRP)
 */
class BackgroundImageManager {
	/**
	 * Constructor for the background image manager
	 * @param {Object} options - Configuration options
	 * @param {HTMLElement} options.cardElement - Card element
	 * @param {HTMLInputElement} options.inputElement - Input element for the image
	 * @param {HTMLElement} options.fileNameElement - Element to display file name
	 * @param {HTMLElement} options.removeButtonElement - Button to remove the image
	 * @param {HTMLInputElement} options.opacitySlider - Slider to control opacity
	 * @param {HTMLElement} options.opacityValueElement - Element to display opacity value
	 */
	constructor(options) {
		this.card = options.cardElement;
		this.input = options.inputElement;
		this.fileName = options.fileNameElement;
		this.removeBtn = options.removeButtonElement;
		this.opacitySlider = options.opacitySlider;
		this.opacityValue = options.opacityValueElement;
		this.opacityGroup = document.getElementById('bgOpacityGroup');

		this.opacity = 0.6;
		this.imageUrl = null;
		this.hasImage = false;

		this.initEvents();
		this.setupOpacityControl();
	}

	/**
	 * Initializes the events for the manager
	 */
	initEvents() {
		if (this.input) {
			this.input.addEventListener('change', this.handleImageChange.bind(this));
		}

		if (this.removeBtn) {
			this.removeBtn.addEventListener('click', this.removeImage.bind(this));
		}
	}

	/**
	 * Handles image change event
	 * @param {Event} e - Change event
	 */
	handleImageChange(e) {
		if (!e.target.files || !e.target.files[0]) return;

		const file = e.target.files[0];

		// Verify if it's an image
		if (!file.type.match('image.*')) {
			this.dispatchEvent('error', {
				message: 'File must be an image',
			});
			return;
		}

		const reader = new FileReader();

		reader.onload = (event) => {
			this.imageUrl = event.target.result;
			this.hasImage = true;

			// Update UI
			this.updateImage(event.target.result);
			this.updateFileName(file.name);
			this.updateOpacityControlVisibility();

			// Notify change
			this.dispatchEvent('backgroundimage', {
				file,
				dataUrl: event.target.result,
			});
		};

		reader.onerror = (error) => {
			console.error('Error reading file:', error);
			this.dispatchEvent('error', {
				message: 'Error reading file',
			});
		};

		reader.readAsDataURL(file);
	}

	/**
	 * Updates the background image
	 * @param {string} dataUrl - Data URL of the image
	 */
	updateImage(dataUrl) {
		if (!this.card) return;

		// Apply background image to the card container
		this.card.style.backgroundImage = `url(${dataUrl})`;
		this.card.style.backgroundSize = 'cover';
		this.card.style.backgroundPosition = 'center';
		this.card.classList.add('has-bg-image');

		// Apply current opacity
		this.applyOverlayOpacity(this.opacity);
	}

	/**
	 * Updates the displayed file name
	 * @param {string} fileName - File name
	 */
	updateFileName(fileName) {
		if (this.fileName) {
			this.fileName.textContent = fileName;
		}
	}

	/**
	 * Removes the background image
	 */
	removeImage() {
		if (this.card) {
			this.card.style.backgroundImage = 'none';
			this.card.classList.remove('has-bg-image');
		}

		if (this.input) {
			this.input.value = '';
		}

		if (this.fileName) {
			this.fileName.textContent = 'No file chosen';
		}

		this.hasImage = false;
		this.imageUrl = null;
		this.updateOpacityControlVisibility();

		// Notify change
		this.dispatchEvent('backgroundimageremoved', {});
	}

	/**
	 * Sets up the opacity control
	 */
	setupOpacityControl() {
		if (!this.opacitySlider || !this.opacityValue) return;

		// Initialize with current value
		this.opacitySlider.value = this.opacity;
		this.opacityValue.textContent = this.opacity;

		// Change event
		this.opacitySlider.addEventListener('input', (e) => {
			const value = parseFloat(e.target.value);
			this.opacityValue.textContent = value;

			// Update opacity
			this.opacity = value;
			this.applyOverlayOpacity(value);

			// Dispatch custom event
			this.dispatchEvent('backgroundopacity', {
				value: value,
			});
		});

		// Update initial visibility
		this.updateOpacityControlVisibility();
	}

	/**
	 * Applies the background overlay opacity
	 * @param {number} opacity - Opacity value between 0 and 1
	 */
	applyOverlayOpacity(opacity) {
		// Update global CSS variable
		document.documentElement.style.setProperty('--bg-overlay-opacity', opacity);

		// If card has a background image, apply directly
		if (this.card && this.card.classList.contains('has-bg-image')) {
			// Create or update a dynamic style for the opacity
			let overlayStyle = document.getElementById('bg-overlay-style');
			if (!overlayStyle) {
				overlayStyle = document.createElement('style');
				overlayStyle.id = 'bg-overlay-style';
				document.head.appendChild(overlayStyle);
			}

			overlayStyle.textContent = `
				.has-bg-image::before {
					content: '';
					position: absolute;
					top: 0;
					left: 0;
					right: 0;
					bottom: 0;
					background-color: rgba(0, 0, 0, ${opacity});
					z-index: 1;
					pointer-events: none;
				}
				
				/* Ensure elements inside the card are above the overlay */
				.has-bg-image .card-content {
					position: relative;
					z-index: 2;
				}
			`;
		}
	}

	/**
	 * Updates opacity control visibility
	 */
	updateOpacityControlVisibility() {
		if (!this.opacityGroup) return;
		this.opacityGroup.style.display = this.hasImage ? 'block' : 'none';
	}

	/**
	 * Dispatches a background-related event
	 * @param {string} type - Event type
	 * @param {Object} detail - Event details
	 */
	dispatchEvent(type, detail = {}) {
		const event = new CustomEvent('filechange', {
			bubbles: true,
			detail: {
				type,
				...detail,
			},
		});
		document.dispatchEvent(event);
	}

	/**
	 * Gets the current image URL
	 * @returns {string|null} Image URL or null
	 */
	getImageUrl() {
		return this.imageUrl;
	}

	/**
	 * Applies an image from a data URL
	 * @param {Object} imageData - Image data
	 */
	applyImage(imageData) {
		if (!imageData || !imageData.dataUrl) return;

		this.imageUrl = imageData.dataUrl;
		this.hasImage = true;
		this.updateImage(imageData.dataUrl);
		this.updateFileName(imageData.name || 'background-image');
		this.updateOpacityControlVisibility();
	}

	/**
	 * Resets the manager state
	 */
	reset() {
		this.removeImage();
		this.opacity = 0.6;

		if (this.opacitySlider && this.opacityValue) {
			this.opacitySlider.value = this.opacity;
			this.opacityValue.textContent = this.opacity;
			this.applyOverlayOpacity(this.opacity);
		}
	}
}

/**
 * Class responsible for managing the project logo
 * Implements the Single Responsibility Principle (SRP)
 */
class ProjectLogoManager {
	/**
	 * Constructor for the logo manager
	 * @param {Object} options - Configuration options
	 * @param {HTMLInputElement} options.inputElement - Input element for logo
	 * @param {HTMLElement} options.fileNameElement - Element to display file name
	 * @param {HTMLElement} options.removeButtonElement - Button to remove the image
	 */
	constructor(options) {
		this.input = options.inputElement;
		this.fileName = options.fileNameElement;
		this.removeBtn = options.removeButtonElement;

		this.logoUrl = null;
		this.hasLogo = false;

		this.initEvents();
	}

	/**
	 * Initializes the events for the manager
	 */
	initEvents() {
		if (this.input) {
			this.input.addEventListener('change', this.handleLogoChange.bind(this));
		}

		if (this.removeBtn) {
			this.removeBtn.addEventListener('click', this.removeLogo.bind(this));
		}
	}

	/**
	 * Handles logo change event
	 * @param {Event} e - Change event
	 */
	handleLogoChange(e) {
		if (!e.target.files || !e.target.files[0]) return;

		const file = e.target.files[0];

		// Verify if it's an image
		if (!file.type.match('image.*')) {
			this.dispatchEvent('error', {
				message: 'File must be an image',
			});
			return;
		}

		const reader = new FileReader();

		reader.onload = (event) => {
			this.logoUrl = event.target.result;
			this.hasLogo = true;

			// Update UI
			this.updateLogo(event.target.result);
			this.updateFileName(file.name);

			// Notify change
			this.dispatchEvent('projectlogo', {
				file,
				dataUrl: event.target.result,
			});
		};

		reader.onerror = (error) => {
			console.error('Error reading file:', error);
			this.dispatchEvent('error', {
				message: 'Error reading file',
			});
		};

		reader.readAsDataURL(file);
	}

	/**
	 * Updates the project logo
	 * @param {string} dataUrl - Data URL of the image
	 */
	updateLogo(dataUrl) {
		// Get logo container
		const container = document.querySelector('.content-project-logo');

		if (!container) {
			console.error('Logo container not found (.content-project-logo)');
			return;
		}

		// Clear container first
		container.innerHTML = '';

		if (dataUrl) {
			// Create a new image element and configure it
			const logoImg = document.createElement('img');
			logoImg.src = dataUrl;
			logoImg.alt = 'Project Logo';
			logoImg.className = 'project-logo';
			logoImg.id = 'displayProjectLogo';

			// Add image to container
			container.appendChild(logoImg);

			// Show container
			container.style.display = 'block';
		} else {
			// If no image, just hide container
			container.style.display = 'none';
		}
	}

	/**
	 * Updates the displayed file name
	 * @param {string} fileName - File name
	 */
	updateFileName(fileName) {
		if (this.fileName) {
			this.fileName.textContent = fileName;
		}
	}

	/**
	 * Removes the project logo
	 */
	removeLogo() {
		if (this.input) {
			this.input.value = '';
		}

		if (this.fileName) {
			this.fileName.textContent = 'No file chosen';
		}

		this.logoUrl = null;
		this.hasLogo = false;

		// Hide the logo in UI
		this.updateLogo(null);

		// Notify change
		this.dispatchEvent('projectlogoremoved', {});
	}

	/**
	 * Dispatches a logo-related event
	 * @param {string} type - Event type
	 * @param {Object} detail - Event details
	 */
	dispatchEvent(type, detail = {}) {
		const event = new CustomEvent('filechange', {
			bubbles: true,
			detail: {
				type,
				...detail,
			},
		});
		document.dispatchEvent(event);
	}

	/**
	 * Gets the current logo URL
	 * @returns {string|null} Logo URL or null
	 */
	getLogoUrl() {
		return this.logoUrl;
	}

	/**
	 * Applies a logo from a data URL
	 * @param {Object} logoData - Logo data
	 */
	applyLogo(logoData) {
		if (!logoData || !logoData.dataUrl) return;

		this.logoUrl = logoData.dataUrl;
		this.hasLogo = true;
		this.updateLogo(logoData.dataUrl);
		this.updateFileName(logoData.name || 'logo-image');
	}

	/**
	 * Resets the manager state
	 */
	reset() {
		if (this.input) {
			this.input.value = '';
		}

		if (this.fileName) {
			this.fileName.textContent = 'No file chosen';
		}

		this.logoUrl = null;
		this.hasLogo = false;

		// Hide the logo element when resetting
		this.updateLogo(null);
	}
}

/**
 * Class responsible for managing file uploads for the application
 * Coordinates specialized managers for logo and background
 * Implements the Dependency Inversion Principle (DIP)
 */
export class FileUploader {
	/**
	 * Constructor
	 * @param {Object} options - Configuration options
	 */
	constructor(options = {}) {
		this.options = {
			projectLogoSelector: '#projectLogo',
			projectLogoFileNameSelector: '#projectLogoFileName',
			removeProjectLogoSelector: '#removeProjectLogo',
			bgImageSelector: '#bgImage',
			bgImageFileNameSelector: '#bgImageFileName',
			removeBgImageSelector: '#removeBgImage',
			logoContainerSelector: '.card-icon',
			cardSelector: '.card-wrapper',
			bgOpacitySliderSelector: '#bgOpacity',
			bgOpacityValueSelector: '#bgOpacityValue',
			...options,
		};

		this.state = {
			hasProjectLogo: false,
			hasBackgroundImage: false,
			backgroundOpacity: 0.6,
			projectLogoUrl: null,
			backgroundImageUrl: null,
		};

		this.init();
	}

	/**
	 * Initializes the components
	 */
	init() {
		// Get DOM elements
		this.cacheElements();

		// Initialize specialized managers
		this.initializeManagers();

		// Subscribe to manager events
		this.setupEventListeners();
	}

	/**
	 * Gets and stores references to DOM elements
	 */
	cacheElements() {
		this.projectLogoInput = document.querySelector(this.options.projectLogoSelector);
		this.projectLogoFileName = document.querySelector(this.options.projectLogoFileNameSelector);
		this.removeProjectLogoBtn = document.querySelector(this.options.removeProjectLogoSelector);
		this.bgImageInput = document.querySelector(this.options.bgImageSelector);
		this.bgImageFileName = document.querySelector(this.options.bgImageFileNameSelector);
		this.removeBgImageBtn = document.querySelector(this.options.removeBgImageSelector);
		this.logoContainer = document.querySelector(this.options.logoContainerSelector);
		this.card = document.querySelector(this.options.cardSelector);
		this.bgOpacitySlider = document.querySelector(this.options.bgOpacitySliderSelector);
		this.bgOpacityValue = document.querySelector(this.options.bgOpacityValueSelector);
	}

	/**
	 * Initializes specialized managers
	 */
	initializeManagers() {
		// Logo manager
		this.logoManager = new ProjectLogoManager({
			inputElement: this.projectLogoInput,
			fileNameElement: this.projectLogoFileName,
			removeButtonElement: this.removeProjectLogoBtn,
		});

		// Background image manager
		this.backgroundManager = new BackgroundImageManager({
			cardElement: this.card,
			inputElement: this.bgImageInput,
			fileNameElement: this.bgImageFileName,
			removeButtonElement: this.removeBgImageBtn,
			opacitySlider: this.bgOpacitySlider,
			opacityValueElement: this.bgOpacityValue,
		});
	}

	/**
	 * Sets up event listeners
	 */
	setupEventListeners() {
		// Subscribe to events to update state
		document.addEventListener('filechange', (e) => {
			const { type, dataUrl } = e.detail;

			if (type === 'projectlogo') {
				this.state.projectLogoUrl = dataUrl;
				this.state.hasProjectLogo = true;
			} else if (type === 'projectlogoremoved') {
				this.state.projectLogoUrl = null;
				this.state.hasProjectLogo = false;
			} else if (type === 'backgroundimage') {
				this.state.backgroundImageUrl = dataUrl;
				this.state.hasBackgroundImage = true;
			} else if (type === 'backgroundimageremoved') {
				this.state.backgroundImageUrl = null;
				this.state.hasBackgroundImage = false;
			} else if (type === 'backgroundopacity') {
				this.state.backgroundOpacity = e.detail.value;
			}
		});
	}

	/**
	 * Applies an image from stored data URL
	 * @param {Object} imageData - Image data
	 * @param {string} type - Image type (logo or background)
	 */
	applyImage(imageData, type) {
		if (!imageData || !imageData.dataUrl) return;

		if (type === 'logo') {
			this.logoManager.applyLogo(imageData);
			this.state.projectLogoUrl = imageData.dataUrl;
			this.state.hasProjectLogo = true;
		} else if (type === 'background') {
			this.backgroundManager.applyImage(imageData);
			this.state.backgroundImageUrl = imageData.dataUrl;
			this.state.hasBackgroundImage = true;
		}
	}

	/**
	 * Gets the project logo URL
	 * @returns {string|null} URL of the image or null
	 */
	getProjectLogoUrl() {
		return this.logoManager.getLogoUrl();
	}

	/**
	 * Gets the background image URL
	 * @returns {string|null} URL of the image or null
	 */
	getBackgroundImageUrl() {
		return this.backgroundManager.getImageUrl();
	}

	/**
	 * Resets all values to defaults
	 */
	reset() {
		// Reset managers
		this.logoManager.reset();
		this.backgroundManager.reset();

		// Reset state
		this.state = {
			hasProjectLogo: false,
			hasBackgroundImage: false,
			backgroundOpacity: 0.6,
			projectLogoUrl: null,
			backgroundImageUrl: null,
		};
	}
}
