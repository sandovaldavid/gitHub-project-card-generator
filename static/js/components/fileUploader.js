import { validateImageFile } from '../../utils/validators.js';
import {
	createElement,
	clearElement,
	applyStyles,
	updateClassList,
} from '../../utils/domUtils.js';

/**
 * Clase responsable de gestionar la carga de archivos para la aplicación
 * Maneja la carga del logo del proyecto y la imagen de fondo
 */
export class FileUploader {
	/**
	 * Constructor de la clase que inicializa las referencias y estado
	 * @param {Object} options - Opciones de configuración (selectores de elementos)
	 */
	constructor(options = {}) {
		this.selectors = {
			projectLogo: options.projectLogoSelector || '#projectLogo',
			projectLogoFileName: options.projectLogoFileNameSelector || '#projectLogoFileName',
			bgImage: options.bgImageSelector || '#bgImage',
			bgImageFileName: options.bgImageFileNameSelector || '#bgImageFileName',
			removeBgImage: options.removeBgImageSelector || '#removeBgImage',
			logoContainer: options.logoContainerSelector || '#logoContainer',
			card: options.cardSelector || '#githubCard',
		};

		this.elements = this.cacheElements();
		this.state = {
			hasProjectLogo: false,
			hasBackgroundImage: false,
			projectLogo: null, // Para almacenar datos de logo
			backgroundImage: null, // Para almacenar datos de imagen de fondo
		};

		this.init();
	}

	/**
	 * Inicializa el componente, configura listeners
	 */
	init() {
		this.setupEventListeners();
	}

	/**
	 * Guarda referencias a los elementos del DOM
	 * @returns {Object} Referencias a los elementos del DOM
	 */
	cacheElements() {
		return {
			projectLogo: {
				input: document.querySelector(this.selectors.projectLogo),
				fileName: document.querySelector(this.selectors.projectLogoFileName),
			},
			bgImage: {
				input: document.querySelector(this.selectors.bgImage),
				fileName: document.querySelector(this.selectors.bgImageFileName),
				removeBtn: document.querySelector(this.selectors.removeBgImage),
			},
			logoContainer: document.querySelector(this.selectors.logoContainer),
			card: document.querySelector(this.selectors.card),
		};
	}

	/**
	 * Configura los event listeners para los inputs de archivo
	 */
	setupEventListeners() {
		// Project Logo Upload
		const projectLogoInput = this.elements.projectLogo.input;
		if (projectLogoInput) {
			projectLogoInput.addEventListener('change', (e) => this.handleProjectLogoUpload(e));
		}

		// Background Image Upload
		const bgImageInput = this.elements.bgImage.input;
		if (bgImageInput) {
			bgImageInput.addEventListener('change', (e) => this.handleBackgroundImageUpload(e));
		}

		// Remove Background Button
		const removeBgBtn = this.elements.bgImage.removeBtn;
		if (removeBgBtn) {
			removeBgBtn.addEventListener('click', () => this.removeBackgroundImage());
		}

		// Evento de arrastrar y soltar para el logo
		const logoContainer = this.elements.logoContainer;
		if (logoContainer) {
			this.setupDragAndDrop(logoContainer, 'logo');
		}

		// Evento de arrastrar y soltar para la imagen de fondo
		const card = this.elements.card;
		if (card) {
			this.setupDragAndDrop(card, 'background');
		}
	}

	/**
	 * Configura eventos de arrastrar y soltar para cargar imágenes
	 * @param {HTMLElement} dropZone - Elemento que servirá como zona para soltar
	 * @param {string} type - Tipo de imagen ('logo' o 'background')
	 */
	setupDragAndDrop(dropZone, type) {
		['dragenter', 'dragover', 'dragleave', 'drop'].forEach((eventName) => {
			dropZone.addEventListener(
				eventName,
				(e) => {
					e.preventDefault();
					e.stopPropagation();
				},
				false
			);
		});

		['dragenter', 'dragover'].forEach((eventName) => {
			dropZone.addEventListener(
				eventName,
				() => {
					updateClassList(dropZone, {
						'drop-zone-active': true,
					});
				},
				false
			);
		});

		['dragleave', 'drop'].forEach((eventName) => {
			dropZone.addEventListener(
				eventName,
				() => {
					updateClassList(dropZone, {
						'drop-zone-active': false,
					});
				},
				false
			);
		});

		dropZone.addEventListener(
			'drop',
			(e) => {
				const dt = e.dataTransfer;
				if (dt.files && dt.files.length) {
					if (type === 'logo') {
						this.processDroppedFile(dt.files[0], 'logo');
					} else if (type === 'background') {
						this.processDroppedFile(dt.files[0], 'background');
					}
				}
			},
			false
		);
	}

	/**
	 * Procesa un archivo soltado mediante drag & drop
	 * @param {File} file - Archivo a procesar
	 * @param {string} type - Tipo de archivo ('logo' o 'background')
	 */
	processDroppedFile(file, type) {
		const validationResult = validateImageFile(file);
		if (!validationResult.isValid) {
			this.showNotification(validationResult.message, 'error');
			return;
		}

		if (type === 'logo') {
			// Actualizar el input de archivo para mantener consistencia
			const input = this.elements.projectLogo.input;
			if (input) {
				// Crear un DataTransfer para simular una selección de archivo
				const dataTransfer = new DataTransfer();
				dataTransfer.items.add(file);
				input.files = dataTransfer.files;

				// Disparar el evento de cambio
				const event = new Event('change', { bubbles: true });
				input.dispatchEvent(event);
			}
		} else if (type === 'background') {
			// Similar para imagen de fondo
			const input = this.elements.bgImage.input;
			if (input) {
				const dataTransfer = new DataTransfer();
				dataTransfer.items.add(file);
				input.files = dataTransfer.files;

				const event = new Event('change', { bubbles: true });
				input.dispatchEvent(event);
			}
		}
	}

	/**
	 * Maneja la carga del logo del proyecto
	 * @param {Event} event - Evento de cambio del input file
	 * @returns {Promise} Promesa que se resuelve cuando se carga la imagen
	 */
	handleProjectLogoUpload(event) {
		return new Promise((resolve, reject) => {
			const file = event.target.files && event.target.files[0];
			if (!file) {
				return resolve(null);
			}

			// Validar archivo
			const validationResult = validateImageFile(file);
			if (!validationResult.isValid) {
				this.showNotification(validationResult.message, 'error');
				return reject(new Error(validationResult.message));
			}

			const reader = new FileReader();

			reader.onload = (e) => {
				try {
					// Guardar datos en estado
					this.state.projectLogo = {
						file: file,
						dataUrl: e.target.result,
						name: file.name,
					};

					// Limpiar contenedor usando clearElement de domUtils
					const logoContainer = this.elements.logoContainer;
					if (logoContainer) {
						clearElement(logoContainer);

						// Crear imagen con createElement de domUtils
						const img = createElement('img', {
							src: e.target.result,
							alt: 'Project Logo',
							className: 'project-logo',
						});

						logoContainer.appendChild(img);

						// Actualizar nombre del archivo y estado
						const fileName = this.elements.projectLogo.fileName;
						if (fileName) {
							fileName.textContent = file.name;
						}

						this.state.hasProjectLogo = true;

						// Disparar evento personalizado
						this.dispatchFileEvent('projectlogo', {
							file: file,
							dataUrl: e.target.result,
						});

						resolve({
							file: file,
							dataUrl: e.target.result,
						});
					}
				} catch (error) {
					reject(error);
				}
			};

			reader.onerror = (error) => {
				reject(error);
			};

			reader.readAsDataURL(file);
		});
	}

	/**
	 * Maneja la carga de la imagen de fondo
	 * @param {Event} event - Evento de cambio del input file
	 * @returns {Promise} Promesa que se resuelve cuando se carga la imagen
	 */
	handleBackgroundImageUpload(event) {
		return new Promise((resolve, reject) => {
			const file = event.target.files && event.target.files[0];
			if (!file) {
				return resolve(null);
			}

			// Validar archivo
			const validationResult = validateImageFile(file);
			if (!validationResult.isValid) {
				this.showNotification(validationResult.message, 'error');
				return reject(new Error(validationResult.message));
			}

			const reader = new FileReader();

			reader.onload = (e) => {
				try {
					// Guardar datos en estado
					this.state.backgroundImage = {
						file: file,
						dataUrl: e.target.result,
						name: file.name,
					};

					// Actualizar estilo de la tarjeta usando applyStyles de domUtils
					const card = this.elements.card;
					if (card) {
						applyStyles(card, {
							backgroundImage: `url(${e.target.result})`,
							backgroundSize: 'cover',
							backgroundPosition: 'center',
						});

						// Añadir clase para oscurecer el fondo
						updateClassList(card, {
							'has-bg-image': true,
						});
					}

					// Actualizar nombre del archivo y estado
					const fileName = this.elements.bgImage.fileName;
					if (fileName) {
						fileName.textContent = file.name;
					}

					this.state.hasBackgroundImage = true;

					// Disparar evento personalizado
					this.dispatchFileEvent('backgroundimage', {
						file: file,
						dataUrl: e.target.result,
					});

					resolve({
						file: file,
						dataUrl: e.target.result,
					});
				} catch (error) {
					reject(error);
				}
			};

			reader.onerror = (error) => {
				reject(error);
			};

			reader.readAsDataURL(file);
		});
	}

	/**
	 * Elimina la imagen de fondo
	 */
	removeBackgroundImage() {
		const card = this.elements.card;
		if (card) {
			// Usar applyStyles de domUtils
			applyStyles(card, {
				backgroundImage: 'none',
			});

			// Usar updateClassList de domUtils
			updateClassList(card, {
				'has-bg-image': false,
			});
		}

		// Resetear input y nombre
		const bgImageInput = this.elements.bgImage.input;
		const bgImageFileName = this.elements.bgImage.fileName;

		if (bgImageInput) {
			bgImageInput.value = '';
		}

		if (bgImageFileName) {
			bgImageFileName.textContent = 'No file chosen';
		}

		// Limpiar datos en estado
		this.state.backgroundImage = null;
		this.state.hasBackgroundImage = false;

		// Disparar evento personalizado
		this.dispatchFileEvent('backgroundimageremoved');
	}

	/**
	 * Elimina el logo del proyecto
	 */
	removeProjectLogo() {
		const logoContainer = this.elements.logoContainer;
		if (logoContainer) {
			// Usar clearElement de domUtils
			clearElement(logoContainer);
		}

		// Resetear input y nombre
		const projectLogoInput = this.elements.projectLogo.input;
		const projectLogoFileName = this.elements.projectLogo.fileName;

		if (projectLogoInput) {
			projectLogoInput.value = '';
		}

		if (projectLogoFileName) {
			projectLogoFileName.textContent = 'No file chosen';
		}

		// Limpiar datos en estado
		this.state.projectLogo = null;
		this.state.hasProjectLogo = false;

		// Disparar evento personalizado
		this.dispatchFileEvent('projectlogoremoved');
	}

	/**
	 * Aplica una imagen previamente cargada o desde URL
	 * @param {Object} options - Opciones para la imagen
	 * @param {string} type - Tipo de imagen ('logo' o 'background')
	 * @returns {Promise} Promesa que se resuelve cuando se aplica la imagen
	 */
	applyImage(options = {}, type = 'logo') {
		return new Promise((resolve, reject) => {
			const { url, dataUrl, file } = options;

			if (!url && !dataUrl && !file) {
				reject(new Error('No source provided for image'));
				return;
			}

			const imageSource = dataUrl || url;

			if (imageSource) {
				if (type === 'logo') {
					const logoContainer = this.elements.logoContainer;
					if (logoContainer) {
						clearElement(logoContainer);

						const img = createElement('img', {
							src: imageSource,
							alt: 'Project Logo',
							className: 'project-logo',
						});

						logoContainer.appendChild(img);

						const fileName = this.elements.projectLogo.fileName;
						if (fileName) {
							fileName.textContent = options.name || 'Image applied';
						}

						this.state.hasProjectLogo = true;
						this.state.projectLogo = {
							dataUrl: imageSource,
							name: options.name || 'Applied image',
						};

						resolve({ success: true, type: 'logo' });
					}
				} else if (type === 'background') {
					const card = this.elements.card;
					if (card) {
						applyStyles(card, {
							backgroundImage: `url(${imageSource})`,
							backgroundSize: 'cover',
							backgroundPosition: 'center',
						});

						updateClassList(card, {
							'has-bg-image': true,
						});

						const fileName = this.elements.bgImage.fileName;
						if (fileName) {
							fileName.textContent = options.name || 'Image applied';
						}

						this.state.hasBackgroundImage = true;
						this.state.backgroundImage = {
							dataUrl: imageSource,
							name: options.name || 'Applied image',
						};

						resolve({ success: true, type: 'background' });
					}
				}
			} else if (file) {
				// Si se provee un archivo, simular la carga
				const input =
					type === 'logo' ? this.elements.projectLogo.input : this.elements.bgImage.input;

				if (input) {
					const dataTransfer = new DataTransfer();
					dataTransfer.items.add(file);
					input.files = dataTransfer.files;

					const event = new Event('change', { bubbles: true });
					input.dispatchEvent(event);
					resolve({ success: true, type });
				} else {
					reject(new Error(`Input for ${type} not found`));
				}
			}
		});
	}

	/**
	 * Dispara un evento personalizado cuando se carga/elimina un archivo
	 * @param {string} eventType - Tipo de evento ('projectlogo', 'backgroundimage', etc)
	 * @param {Object} data - Datos asociados al evento
	 */
	dispatchFileEvent(eventType, data = {}) {
		const event = new CustomEvent('filechange', {
			detail: {
				type: eventType,
				...data,
			},
			bubbles: true,
		});

		// Determinar el elemento desde el cual disparar el evento
		let sourceElement;
		switch (eventType) {
			case 'projectlogo':
			case 'projectlogoremoved':
				sourceElement = this.elements.projectLogo.input;
				break;
			case 'backgroundimage':
			case 'backgroundimageremoved':
				sourceElement = this.elements.bgImage.input;
				break;
			default:
				sourceElement = document;
		}

		if (sourceElement) {
			sourceElement.dispatchEvent(event);
		}
	}

	/**
	 * Muestra una notificación (si se implementa un sistema de notificaciones)
	 * @param {string} message - Mensaje a mostrar
	 * @param {string} type - Tipo de notificación ('success', 'error', 'warning')
	 */
	showNotification(message, type) {
		// Si existe un sistema de notificaciones global, usarlo
		if (window.notificationSystem) {
			window.notificationSystem.show(message, type);
			return;
		}

		// Fallback simple: alerta en consola
		console[type === 'error' ? 'error' : type === 'warning' ? 'warn' : 'log'](message);
	}

	/**
	 * Obtiene el estado actual de los archivos
	 * @returns {Object} Estado de los archivos
	 */
	getState() {
		return { ...this.state };
	}

	/**
	 * Comprueba si se ha cargado el logo del proyecto
	 * @returns {boolean} True si hay logo del proyecto
	 */
	hasProjectLogo() {
		return this.state.hasProjectLogo;
	}

	/**
	 * Comprueba si se ha cargado una imagen de fondo
	 * @returns {boolean} True si hay imagen de fondo
	 */
	hasBackgroundImage() {
		return this.state.hasBackgroundImage;
	}

	/**
	 * Obtiene la URL del logo actual
	 * @returns {string|null} URL de datos del logo o null
	 */
	getProjectLogoUrl() {
		return this.state.projectLogo?.dataUrl || null;
	}

	/**
	 * Obtiene la URL de la imagen de fondo actual
	 * @returns {string|null} URL de datos de la imagen de fondo o null
	 */
	getBackgroundImageUrl() {
		return this.state.backgroundImage?.dataUrl || null;
	}

	/**
	 * Restablece todos los archivos a su estado inicial
	 */
	reset() {
		// Reset project logo usando clearElement de domUtils
		const logoContainer = this.elements.logoContainer;
		if (logoContainer) {
			clearElement(logoContainer);
		}

		if (this.elements.projectLogo.input) {
			this.elements.projectLogo.input.value = '';
		}

		if (this.elements.projectLogo.fileName) {
			this.elements.projectLogo.fileName.textContent = 'No file chosen';
		}

		// Reset background image
		this.removeBackgroundImage();

		// Limpiar estado
		this.state.projectLogo = null;
		this.state.backgroundImage = null;
		this.state.hasProjectLogo = false;
		this.state.hasBackgroundImage = false;
	}
}
