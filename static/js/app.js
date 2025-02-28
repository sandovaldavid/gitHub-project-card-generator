import { CardManager } from './components/cardManager.js';
import { ColorPickerManager } from './components/colorPicker.js';
import { FileUploader } from './components/fileUploader.js';
import { NotificationSystem } from './components/notification.js';
import { GithubService } from './services/githubService.js';
import { ExportService } from './services/exportService.js';
import { StorageService } from './services/storageService.js';

class GitCardXApp {
	constructor() {
		this.components = {};
		this.services = {};
		this.state = {
			profileLoaded: false,
			hasProjectLogo: false,
			hasBackgroundImage: false,
		};
	}

	init() {
		this.initServices();
		this.initComponents();
		this.loadSavedPreferences();
		this.setupEventListeners();
	}

	initServices() {
		this.services.github = new GithubService();
		this.services.exporter = new ExportService();
		this.services.storage = new StorageService('gitcardx-settings');
		this.services.notifications = new NotificationSystem();
	}

	initComponents() {
		this.components.cardManager = new CardManager();
		this.components.colorPicker = new ColorPickerManager();
		this.components.fileUploader = new FileUploader({
			projectLogoSelector: '#projectLogo',
			projectLogoFileNameSelector: '#projectLogoFileName',
			bgImageSelector: '#bgImage',
			bgImageFileNameSelector: '#bgImageFileName',
			removeBgImageSelector: '#removeBgImage',
			logoContainerSelector: '#logoContainer',
			cardSelector: '#githubCard',
		});
	}

	loadSavedPreferences() {
		const savedSettings = this.services.storage.load();
		if (savedSettings) {
			// Aplicar configuraciones guardadas
			this.components.colorPicker.setColors(savedSettings.colors);
			this.components.cardManager.applySettings(savedSettings.card);

			// Restaurar imágenes guardadas si existen
			if (savedSettings.images) {
				if (savedSettings.images.logo) {
					this.components.fileUploader.applyImage(savedSettings.images.logo, 'logo');
				}
				if (savedSettings.images.background) {
					this.components.fileUploader.applyImage(
						savedSettings.images.background,
						'background'
					);
				}
			}
		}
	}

	setupEventListeners() {
		// Botón de carga de perfil
		document
			.getElementById('loadProfile')
			.addEventListener('click', () => this.loadGithubProfile());

		// Botón de generación de tarjeta
		document.getElementById('generateCard').addEventListener('click', () => this.updateCard());

		// Botón de descarga
		document
			.getElementById('downloadCard')
			.addEventListener('click', () => this.downloadCard());

		// Botón de reset/limpiar formulario
		const resetBtn = document.getElementById('resetForm');
		if (resetBtn) {
			resetBtn.addEventListener('click', () => this.resetApplication());
		}

		// Eventos de cambio en inputs
		this.setupInputListeners();
	}

	setupInputListeners() {
		// Listeners para inputs de texto con actualización en tiempo real
		const textInputs = ['repoName', 'projectName', 'projectDescription'];

		textInputs.forEach((inputId) => {
			const input = document.getElementById(inputId);
			if (input) {
				input.addEventListener('input', () => this.handleInputChange(inputId, input.value));
			}
		});

		// Escuchar eventos de cambio de color
		document.addEventListener('colorchange', (e) => {
			this.handleColorChange(e.detail.type, e.detail.value);
			// Guardar colores automáticamente
			this.saveSettings();
		});

		// Escuchar eventos de carga de archivos
		document.addEventListener('filechange', (e) => {
			this.handleFileChange(e.detail);
			// Guardar estado de archivos automáticamente
			this.saveSettings();
		});
	}

	handleInputChange(inputId, value) {
		// Actualización en tiempo real para algunos elementos
		switch (inputId) {
			case 'projectName':
				this.components.cardManager.updateProjectName(value);
				break;
			case 'repoName':
				this.components.cardManager.updateRepositoryName(value);
				break;
			case 'projectDescription':
				this.components.cardManager.updateDescription(value);
				break;
		}
	}

	handleColorChange(type, value) {
		// Ya manejado por ColorPickerManager, pero podríamos añadir lógica adicional aquí
		this.state.colorSettings = this.components.colorPicker.getColors();
	}

	handleFileChange(detail) {
		if (detail.type === 'projectlogo') {
			this.state.hasProjectLogo = true;
		} else if (detail.type === 'backgroundimage') {
			this.state.hasBackgroundImage = true;
		} else if (detail.type === 'projectlogoremoved') {
			this.state.hasProjectLogo = false;
		} else if (detail.type === 'backgroundimageremoved') {
			this.state.hasBackgroundImage = false;
		}
	}

	loadGithubProfile() {
		const username = document.getElementById('username').value.trim();

		if (!username) {
			this.services.notifications.show('Please enter a GitHub username', 'warning');
			return;
		}

		const button = document.getElementById('loadProfile');
		button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
		button.disabled = true;

		this.services.github
			.getUser(username)
			.then((userData) => {
				this.components.cardManager.setUserData(userData);
				this.state.profileLoaded = true;
				this.services.notifications.show('Profile loaded successfully', 'success');
			})
			.catch((error) => {
				this.services.notifications.show(`Error: ${error.message}`, 'error');
			})
			.finally(() => {
				button.innerHTML = '<i class="fas fa-download"></i> Load';
				button.disabled = false;
			});
	}

	updateCard() {
		const button = document.getElementById('generateCard');
		const oldText = button.innerHTML;
		button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
		button.disabled = true;

		try {
			// Recolectar datos de los inputs
			const formData = this.collectFormData();

			// Actualizar la tarjeta
			this.components.cardManager.update(formData);

			// Guardar preferencias
			this.saveSettings();

			this.services.notifications.show('Card updated successfully', 'success');
		} catch (error) {
			this.services.notifications.show(`Error: ${error.message}`, 'error');
			console.error(error);
		} finally {
			button.innerHTML = oldText;
			button.disabled = false;
		}
	}

	downloadCard() {
		const button = document.getElementById('downloadCard');
		const oldText = button.innerHTML;

		button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
		button.disabled = true;

		try {
			this.services.exporter
				.exportToPNG('githubCard')
				.then(() => {
					this.services.notifications.show('Card downloaded successfully', 'success');
				})
				.catch((error) => {
					this.services.notifications.show('Error downloading card', 'error');
					console.error(error);
				})
				.finally(() => {
					button.innerHTML = oldText;
					button.disabled = false;
				});
		} catch (error) {
			button.innerHTML = oldText;
			button.disabled = false;
			this.services.notifications.show('Error preparing download', 'error');
			console.error(error);
		}
	}

	collectFormData() {
		// Recoger todos los valores de los inputs
		return {
			username: document.getElementById('username').value.trim(),
			repoName: document.getElementById('repoName').value.trim(),
			projectName: document.getElementById('projectName').value.trim(),
			projectDescription: document.getElementById('projectDescription').value.trim(),
		};
	}

	saveSettings() {
		// Guardar todas las preferencias en un solo objeto
		const cardData = this.collectFormData();
		const colorData = this.components.colorPicker.getColors();

		// Obtener información de imágenes
		const imageData = {};
		if (this.state.hasProjectLogo) {
			imageData.logo = {
				dataUrl: this.components.fileUploader.getProjectLogoUrl(),
				name: 'project-logo',
			};
		}

		if (this.state.hasBackgroundImage) {
			imageData.background = {
				dataUrl: this.components.fileUploader.getBackgroundImageUrl(),
				name: 'background-image',
			};
		}

		this.services.storage.save({
			colors: colorData,
			card: cardData,
			images: Object.keys(imageData).length > 0 ? imageData : null,
		});
	}

	resetApplication() {
		// Limpiar formulario y restablecer estado
		const confirmReset = confirm('¿Estás seguro de que quieres restablecer todos los cambios?');
		if (confirmReset) {
			// Restablecer componentes
			this.components.cardManager.reset();
			this.components.colorPicker.resetToDefaults();
			this.components.fileUploader.reset();

			// Restablecer estado
			this.state = {
				profileLoaded: false,
				hasProjectLogo: false,
				hasBackgroundImage: false,
			};

			// Limpiar almacenamiento
			this.services.storage.clear();

			this.services.notifications.show('Application reset successfully', 'success');
		}
	}
}

// Inicialización al cargar el documento
document.addEventListener('DOMContentLoaded', () => {
	const app = new GitCardXApp();
	app.init();
});
