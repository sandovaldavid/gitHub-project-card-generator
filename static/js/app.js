// Module and service imports
import { Application } from './core/Application.js';
import { EventManager } from './core/EventManager.js';
import { SettingsManager } from './core/SettingsManager.js';
import { ColorPickerManager } from './components/colorPicker.js';
import { FileUploader } from './components/fileUploader.js';
import { GithubService } from './services/githubService.js';
import { ExportService } from './services/exportService.js';
import { StorageService } from './services/storageService.js';
import { NotificationSystem } from './components/notification.js';
import { CardManager } from './components/cardManager.js';
import { CONSTANTS } from './config.js';

/**
 * Application initialization
 * This script acts as the main entry point, orchestrating the different components
 * Implementing SOLID principles for better separation of responsibilities
 */
document.addEventListener('DOMContentLoaded', () => {
	// Create the main application instance
	const app = new Application();

	// Initialize services
	const storageService = new StorageService();
	const githubService = new GithubService();
	const exportService = new ExportService();

	// Initialize core services
	const eventManager = new EventManager();
	const settingsManager = new SettingsManager(storageService);

	// Register services in the application
	app.registerService('storage', storageService);
	app.registerService('github', githubService);
	app.registerService('export', exportService);
	app.registerService('events', eventManager);
	app.registerService('settings', settingsManager);

	// Initialize notification system (global)
	const notificationSystem = new NotificationSystem({
		position: CONSTANTS.NOTIFICATION.POSITION,
		duration: CONSTANTS.NOTIFICATION.DURATION,
	});
	app.registerService('notifications', notificationSystem);

	// Initialize UI components
	const colorPicker = new ColorPickerManager();
	const fileUploader = new FileUploader();
	const cardManager = new CardManager();

	// Register components in the application
	app.registerComponent('colorPicker', colorPicker);
	app.registerComponent('fileUploader', fileUploader);
	app.registerComponent('cardManager', cardManager);

	// Initialize the application
	app.initialize(() => {
		// Load and apply saved settings
		loadSavedSettings(app);

		// Configure event handlers after initialization
		setupEventListeners(app);
	});
});

/**
 * Sets up the application's event listeners
 * @param {Application} app - Application instance
 */
function setupEventListeners(app) {
	const eventManager = app.getService('events');
	const cardManager = app.getComponent('cardManager');
	const githubService = app.getService('github');
	const exportService = app.getService('export');
	const settingsManager = app.getService('settings');
	const notificationSystem = app.getService('notifications');
	const colorPicker = app.getComponent('colorPicker');
	const fileUploader = app.getComponent('fileUploader');
	const storageService = app.getService('storage');

	// Button to load GitHub profile
	eventManager.setupDOMEvent('#loadProfile', 'click', async (event) => {
		const usernameInput = document.getElementById('username');
		if (!usernameInput || !usernameInput.value.trim()) {
			notificationSystem.error('Please enter a GitHub username');
			return;
		}

		const loadProfileBtn = event.target;
		loadProfileBtn.disabled = true;
		try {
			const userData = await githubService.getUserData(usernameInput.value.trim());
			cardManager.setUserData(userData);

			// Save to settings and localStorage
			const cardData = {
				username: userData.login,
				avatar_url: userData.avatar_url,
			};

			// Save to settingsManager
			settingsManager.saveSettings('card', cardData);

			// Save directly to localStorage to ensure persistence
			const existingCardData = storageService.loadItem('card') || {};
			storageService.saveItem('card', {
				...existingCardData,
				...cardData,
			});

			notificationSystem.success('GitHub profile loaded successfully');
		} catch (error) {
			notificationSystem.error(error.message);
		} finally {
			loadProfileBtn.disabled = false;
		}
	});

	// Button to update the card
	eventManager.setupDOMEvent('#updateCard', 'click', () => {
		// Get current card data to preserve avatar URL
		const currentCardData = cardManager.getCardData();
		const avatar_url = currentCardData.avatar_url;

		// Collect data from the form fields
		const data = {
			username: document.getElementById('username')?.value || '',
			repoName: document.getElementById('repoName')?.value || '',
			projectName: document.getElementById('projectName')?.value || '',
			projectDescription: document.getElementById('projectDescription')?.value || '',
			// Preserve avatar URL if it exists
			avatar_url: avatar_url,
		};

		try {
			cardManager.update(data);

			// Save to settings, including avatar URL
			settingsManager.saveSettings('card', data);

			// Save directly to localStorage to ensure persistence
			storageService.saveItem('card', data);

			notificationSystem.success('Card updated successfully');
		} catch (error) {
			if (error.errors) {
				const errorMessages = Object.values(error.errors).join('. ');
				notificationSystem.error(errorMessages);
			} else {
				notificationSystem.error('Error updating card');
			}
			console.error('Update error:', error);
		}
	});

	// Real-time repository name updates
	eventManager.setupDOMEvent('#repoName', 'input', (event) => {
		const repoName = event.target.value || '';
		try {
			cardManager.update({ repoName });
			// We don't save to settings every time there's a change to avoid overloading storage
		} catch (error) {
			// We don't show errors in real-time to avoid bothering the user
			console.debug('Real-time update validation error:', error);
		}
	});

	// Button to download card
	eventManager.setupDOMEvent('#downloadCard', 'click', async (event) => {
		try {
			event.target.disabled = true;
			notificationSystem.info('Preparing your card for download...');

			// Get the card element
			const cardElement = document.getElementById('cardWrapper');
			if (!cardElement) {
				throw new Error('Card element not found');
			}

			// Execute download through the export service
			const filename = CONSTANTS.CARD_EXPORT.DEFAULT_FILENAME;
			const success = await exportService.downloadCard(cardElement, filename, 'png');

			if (!success) {
				throw new Error(exportService.getLastError() || 'Failed to download card');
			}

			notificationSystem.success('Card downloaded successfully');
		} catch (error) {
			notificationSystem.error(`Error exporting card: ${error.message}`);
			console.error('Export error:', error);
		} finally {
			event.target.disabled = false;
		}
	});

	// Reset button in header
	eventManager.setupDOMEvent('#resetForm', 'click', () => {
		if (confirm('Are you sure you want to reset all fields?')) {
			// Reset all components
			cardManager.reset();
			colorPicker.resetToDefaults();
			fileUploader.reset();

			// Clear settings
			settingsManager.clearSettings();

			notificationSystem.info('All settings have been reset');
		}
	});

	// Help button
	eventManager.setupDOMEvent('#helpButton', 'click', () => {
		showHelpModal();
	});

	// Subscribe to settings change events
	eventManager.on('settings:updated', ({ category, settings }) => {
		// Apply changes based on updated settings
		if (category === 'card') {
			cardManager.applySettings(settings);
		} else if (category === 'appearance') {
			colorPicker.setColors(settings);
		}
	});

	// Subscribe to file changes (logo and background)
	document.addEventListener('filechange', (e) => {
		const { type, dataUrl, file } = e.detail;

		if (type === 'projectlogo') {
			// Save project logo
			storageService.saveItem('projectLogo', {
				dataUrl,
				name: file ? file.name : 'logo-image',
			});
		} else if (type === 'backgroundimage') {
			// Save background image
			storageService.saveItem('backgroundImage', {
				dataUrl,
				name: file ? file.name : 'background-image',
			});
		} else if (type === 'backgroundopacity') {
			// Save background opacity
			storageService.saveItem('backgroundOpacity', e.detail.value);
		} else if (type === 'projectlogoremoved') {
			// Remove saved logo
			storageService.saveItem('projectLogo', null);
		} else if (type === 'backgroundimageremoved') {
			// Remove background image
			storageService.saveItem('backgroundImage', null);
		}
	});

	// Subscribe to color change events
	document.addEventListener('colorpicker', (e) => {
		if (e.detail.type === 'colorchange') {
			const { property, value } = e.detail;

			// Map CSS properties to configuration names
			const propertyMap = {
				'--border-color': 'borderColor',
				'--project-text-color': 'projectColor',
				'--bg-color': 'bgColor',
			};

			if (propertyMap[property]) {
				const settingName = propertyMap[property];

				// Load current colors from storageService
				const colors = storageService.loadItem('colors') || {};

				// Update the specific color
				colors[settingName] = value;

				// Save all updated colors
				storageService.saveItem('colors', colors);

				// Also update in settingsManager to keep synchronized
				settingsManager.saveSettings('appearance', colors);
			}
		}
	});
}

/**
 * Loads all saved settings and applies them
 * @param {Application} app - Application instance
 */
function loadSavedSettings(app) {
	try {
		const storageService = app.getService('storage');
		const cardManager = app.getComponent('cardManager');
		const colorPicker = app.getComponent('colorPicker');
		const fileUploader = app.getComponent('fileUploader');
		const settingsManager = app.getService('settings');

		// 1. Load and apply colors
		const colorSettings = storageService.loadItem('colors');
		if (colorSettings) {
			// Apply directly from localStorage as an object
			colorPicker.setColors(colorSettings);

			// Also update in SettingsManager to keep synchronized
			settingsManager.saveSettings('appearance', colorSettings);
			console.log('Colors loaded successfully', colorSettings);
		}

		// 2. Load card settings
		const cardSettings = storageService.loadItem('card');
		if (cardSettings && Object.keys(cardSettings).length > 0) {
			// Apply to cardManager
			cardManager.applySettings(cardSettings);

			// Load profile data if it has avatar_url
			if (cardSettings.avatar_url) {
				cardManager.renderer.updateAvatar(cardSettings.avatar_url);
			}

			// Update in settingsManager
			settingsManager.saveSettings('card', cardSettings);
			console.log('Card settings loaded successfully', cardSettings);
		}

		// 3. Load project logo
		const projectLogo = storageService.loadItem('projectLogo');
		if (projectLogo && projectLogo.dataUrl) {
			fileUploader.applyImage(projectLogo, 'logo');
		}

		// 4. Load background image
		const backgroundImage = storageService.loadItem('backgroundImage');
		if (backgroundImage && backgroundImage.dataUrl) {
			fileUploader.applyImage(backgroundImage, 'background');

			// Load background opacity if it exists
			const opacity = storageService.loadItem('backgroundOpacity');
			if (opacity !== null) {
				// Apply opacity
				const bgOpacitySlider = document.querySelector('#bgOpacity');
				const bgOpacityValue = document.querySelector('#bgOpacityValue');

				if (bgOpacitySlider && bgOpacityValue) {
					bgOpacitySlider.value = opacity;
					bgOpacityValue.textContent = opacity;

					// Trigger an event to update opacity visually
					document.documentElement.style.setProperty('--bg-overlay-opacity', opacity);
				}
			}
		}

		console.log('Settings loaded successfully');
	} catch (error) {
		console.error('Error loading settings:', error);

		// Silently fail, we don't want to block the application
		const notificationSystem = app.getService('notifications');
		if (notificationSystem) {
			notificationSystem.warning('Some settings could not be loaded.');
		}
	}
}

/**
 * Shows a help modal
 */
function showHelpModal() {
	// Create help modal
	const modal = document.createElement('div');
	modal.className = 'help-modal';

	modal.innerHTML = `
        <div class="help-modal-content">
            <span class="help-modal-close">&times;</span>
            <h2>${CONSTANTS.HELP_MODAL.TITLE}</h2>
            <div class="help-modal-body">
                <h3>${CONSTANTS.HELP_MODAL.SUBTITLE}</h3>
                <ol>
                    <li><strong>${CONSTANTS.HELP_MODAL.STEPS[0].title}</strong> ${CONSTANTS.HELP_MODAL.STEPS[0].content}</li>
                    <li><strong>${CONSTANTS.HELP_MODAL.STEPS[1].title}</strong> ${CONSTANTS.HELP_MODAL.STEPS[1].content}</li>
                    <li><strong>${CONSTANTS.HELP_MODAL.STEPS[2].title}</strong> ${CONSTANTS.HELP_MODAL.STEPS[2].content}</li>
                    <li><strong>${CONSTANTS.HELP_MODAL.STEPS[3].title}</strong> ${CONSTANTS.HELP_MODAL.STEPS[3].content}</li>
                </ol>
                <p>${CONSTANTS.HELP_MODAL.FOOTER}</p>
            </div>
        </div>
    `;

	// Close modal when clicking X
	const closeButton = modal.querySelector('.help-modal-close');
	closeButton.addEventListener('click', () => {
		document.body.removeChild(modal);
	});

	// Close modal when clicking outside the content
	modal.addEventListener('click', (e) => {
		if (e.target === modal) {
			document.body.removeChild(modal);
		}
	});

	// Add modal to the page
	document.body.appendChild(modal);
}
