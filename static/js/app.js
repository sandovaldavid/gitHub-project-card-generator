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
import { ConfirmationModal } from './components/confirmationModal.js';
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

	// Create confirmation modal instance
	const confirmationModal = new ConfirmationModal();

	// Handle update card button state
	const updateCardButton = document.getElementById('updateCard');
	const formInputs = document.querySelectorAll(
		'#username, #repoName, #projectName, #projectDescription'
	);

	// Monitor form changes to enable/disable "Apply Changes" button
	let formState = {};

	// Initialize form state with current values
	formInputs.forEach((input) => {
		formState[input.id] = input.value;
	});

	// Detect changes in form inputs
	formInputs.forEach((input) => {
		input.addEventListener('input', () => {
			const hasChanges = Array.from(formInputs).some((input) => {
				return input.value !== formState[input.id];
			});

			// Enable/disable the update button based on changes
			if (updateCardButton) {
				updateCardButton.disabled = !hasChanges;
			}
		});
	});

	// Button to load GitHub profile
	eventManager.setupDOMEvent('#loadProfile', 'click', async (event) => {
		const usernameInput = document.getElementById('username');
		if (!usernameInput || !usernameInput.value.trim()) {
			notificationSystem.error('Please enter a GitHub username');
			return;
		}

		const loadProfileBtn = event.target.closest('button');

		// Add loading state to button
		loadProfileBtn.disabled = true;
		loadProfileBtn.classList.add('loading');
		loadProfileBtn.innerHTML = '<i class="fas fa-circle-notch"></i> Loading...';

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

			// Update form state after successful load
			formState['username'] = userData.login;
			updateCardButton.disabled = true;
		} catch (error) {
			notificationSystem.error(error.message);
		} finally {
			// Remove loading state
			loadProfileBtn.disabled = false;
			loadProfileBtn.classList.remove('loading');
			loadProfileBtn.innerHTML = '<i class="fas fa-download"></i> Load';
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

			// Update form state and disable button after applying changes
			formInputs.forEach((input) => {
				formState[input.id] = input.value;
			});
			updateCardButton.disabled = true;
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

	// Button to download card
	eventManager.setupDOMEvent('#downloadCard', 'click', async (event) => {
		const downloadBtn = event.target.closest('button');

		try {
			downloadBtn.disabled = true;
			downloadBtn.classList.add('loading');
			downloadBtn.innerHTML = '<i class="fas fa-circle-notch"></i> Generating...';

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

			// Show success state on button
			downloadBtn.classList.remove('loading');
			downloadBtn.classList.add('success');
			downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download as PNG';

			// Reset button state after a delay
			setTimeout(() => {
				downloadBtn.classList.remove('success');
			}, 3000);
		} catch (error) {
			notificationSystem.error(`Error exporting card: ${error.message}`);
			console.error('Export error:', error);
		} finally {
			// Reset button state if there was an error
			if (downloadBtn.classList.contains('loading')) {
				downloadBtn.classList.remove('loading');
				downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download as PNG';
			}
			downloadBtn.disabled = false;
		}
	});

	// Reset colors button
	eventManager.setupDOMEvent('#resetColors', 'click', () => {
		// Reset to default colors
		colorPicker.resetToDefaults();

		// Clear color settings
		storageService.saveItem('colors', null);

		// Notify user
		notificationSystem.info('Colors have been reset to defaults');
	});

	// Reset button in header
	eventManager.setupDOMEvent('#resetForm', 'click', () => {
		confirmationModal.show(
			{
				title: 'Reset All Settings',
				message: 'Are you sure you want to reset all fields? This action cannot be undone.',
				confirmText: 'Reset',
				cancelText: 'Cancel',
				icon: 'sync-alt',
				confirmButtonClass: 'btn-danger',
			},
			() => {
				// Reset all components
				cardManager.reset();
				colorPicker.resetToDefaults();
				fileUploader.reset();

				// Clear settings
				settingsManager.clearSettings();

				// Update form state after reset
				formInputs.forEach((input) => {
					formState[input.id] = input.value;
				});
				updateCardButton.disabled = true;

				notificationSystem.info('All settings have been reset');
			}
		);
	});

	// Reset button in settings panel
	eventManager.setupDOMEvent('#resetButton', 'click', () => {
		confirmationModal.show(
			{
				title: 'Reset All Settings',
				message: 'Are you sure you want to reset all fields? This action cannot be undone.',
				confirmText: 'Reset',
				cancelText: 'Cancel',
				icon: 'sync-alt',
				confirmButtonClass: 'btn-danger',
			},
			() => {
				// Reset all components
				cardManager.reset();
				colorPicker.resetToDefaults();
				fileUploader.reset();

				// Clear settings
				settingsManager.clearSettings();

				// Update form state after reset
				formInputs.forEach((input) => {
					formState[input.id] = input.value;
				});
				updateCardButton.disabled = true;

				notificationSystem.info('All settings have been reset');
			}
		);
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

			// Update form state after applying settings
			formInputs.forEach((input) => {
				if (settings[input.id]) {
					formState[input.id] = settings[input.id];
				}
			});
			updateCardButton.disabled = true;
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
            <button class="help-modal-close" aria-label="Close help modal">
                <i class="fas fa-times"></i>
            </button>
            
            <div class="help-modal-header">
                <div class="help-modal-icon">
                    <i class="fas fa-question-circle"></i>
                </div>
                <h2 class="help-modal-title">${CONSTANTS.HELP_MODAL.TITLE}</h2>
            </div>
            
            <p class="help-modal-subtitle">${CONSTANTS.HELP_MODAL.SUBTITLE}</p>
            
            <div class="help-modal-steps">
                ${CONSTANTS.HELP_MODAL.STEPS.map((step, index) => {
					// Map step titles to specific icons
					const iconMap = {
						'Enter GitHub Username': 'fa-user',
						'Enter Repository Details': 'fa-code-branch',
						'Customize Your Card': 'fa-palette',
						'Preview and Download': 'fa-download',
					};
					const iconClass = iconMap[step.title] || 'fa-check-circle';

					return `
                    <div class="help-step">
                        <div class="help-step-number">${index + 1}</div>
                        <div class="help-step-content">
                            <div class="help-step-title">
                                <i class="fas ${iconClass}"></i> ${step.title}
                            </div>
                            <div class="help-step-description">${step.content}</div>
                        </div>
                    </div>
                    `;
				}).join('')}
            </div>
            
            <div class="help-modal-footer">
                <i class="fas fa-info-circle"></i>
                <div class="help-modal-footer-text">${CONSTANTS.HELP_MODAL.FOOTER}</div>
            </div>
        </div>
    `;

	// Función para cerrar el modal completamente
	const closeModalCompletely = () => {
		document.body.removeChild(modal);
		// Restaurar el scroll del body
		document.body.style.overflow = '';
		// Asegurarse de eliminar el event listener de ESC
		document.removeEventListener('keydown', handleEscapeKey);
	};

	// Función para iniciar animación de cierre
	const startCloseAnimation = () => {
		// Animate the content out first
		const modalContent = modal.querySelector('.help-modal-content');
		modalContent.style.opacity = '0';
		modalContent.style.transform = 'translateY(20px)';

		// Then, after a small delay, remove the modal completely
		setTimeout(closeModalCompletely, 300);
	};

	// Close modal when clicking X
	const closeButton = modal.querySelector('.help-modal-close');
	closeButton.addEventListener('click', startCloseAnimation);

	// Close modal when clicking outside the content
	modal.addEventListener('click', (e) => {
		if (e.target === modal) {
			startCloseAnimation();
		}
	});

	// Close with ESC key
	const handleEscapeKey = (e) => {
		if (e.key === 'Escape') {
			startCloseAnimation();
		}
	};

	document.addEventListener('keydown', handleEscapeKey);

	// Prevent scrolling on the body
	document.body.style.overflow = 'hidden';

	// Add modal to the page
	document.body.appendChild(modal);

	// Add a small delay before animating in the content
	setTimeout(() => {
		modal.classList.add('show');
	}, 10);
}
