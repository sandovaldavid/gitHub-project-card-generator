import { CONSTANTS } from '../config.js';

/**
 * Servicio responsable de la exportación de tarjetas a imágenes PNG
 * Maneja todo el proceso de exportación, desde la preparación hasta la descarga
 */
export class ExportService {
	/**
	 * Exporta una tarjeta a imagen PNG
	 * @param {string} cardId - ID del elemento de la tarjeta a exportar
	 * @returns {Promise<void>}
	 * @throws {Error} Si no se encuentra el elemento o hay un error en la exportación
	 */
	async exportToPNG(cardId) {
		const card = document.getElementById(cardId);
		if (!card) {
			throw new Error('Card element not found');
		}

		// Crear contenedor temporal para exportación
		const cardWrapper = this.createExportWrapper();

		// Clonar la tarjeta para manipularla sin afectar la original
		const cardClone = this.prepareCardForExport(card);

		// Agregar a la página temporalmente
		cardWrapper.appendChild(cardClone);
		document.body.appendChild(cardWrapper);

		try {
			// Esperar para asegurar que todo esté renderizado
			await new Promise((resolve) => setTimeout(resolve, CONSTANTS.UI.ANIMATION_DELAY));

			// Capturar la imagen con html2canvas
			const canvas = await html2canvas(cardWrapper, {
				scale: 1,
				backgroundColor: null,
				logging: false,
				useCORS: true,
				allowTaint: true,
				width: CONSTANTS.CARD_EXPORT.WIDTH,
				height: CONSTANTS.CARD_EXPORT.HEIGHT,
				onclone: (clonedDoc) => {
					const clonedWrapper = clonedDoc.querySelector('[style*="fixed"]');
					if (clonedWrapper) {
						const borderColor = getComputedStyle(document.documentElement)
							.getPropertyValue('--border-color')
							.trim();
						clonedWrapper.style.borderBottom = `3rem solid ${borderColor}`;
					}

					// Limpiar cualquier estilo temporal adicional si es necesario
					this.cleanupClonedDocument(clonedDoc);
				},
			});

			// Descargar la imagen
			this.downloadImage(canvas);

			return canvas; // Return canvas for potential additional processing
		} finally {
			// Limpiar el DOM
			if (cardWrapper.parentNode) {
				document.body.removeChild(cardWrapper);
			}

			// Eliminar estilos temporales
			this.removeTemporaryStyles();
		}
	}

	/**
	 * Crea un contenedor para la exportación de la tarjeta
	 * @returns {HTMLElement} Contenedor para exportación
	 */
	createExportWrapper() {
		const wrapper = document.createElement('div');

		// Configurar el contenedor para la exportación
		Object.assign(wrapper.style, {
			position: 'fixed',
			top: '-9999px',
			left: '-9999px',
			width: `${CONSTANTS.CARD_EXPORT.WIDTH}px`,
			height: `${CONSTANTS.CARD_EXPORT.HEIGHT}px`,
			overflow: 'hidden',
			zIndex: '-1',
			boxSizing: 'border-box',
		});

		// Configurar color de fondo y borde
		const bgColor = getComputedStyle(document.documentElement)
			.getPropertyValue('--bg-color')
			.trim();
		const borderColor = getComputedStyle(document.documentElement)
			.getPropertyValue('--border-color')
			.trim();

		wrapper.style.backgroundColor = bgColor;
		wrapper.style.borderBottom = `3rem solid ${borderColor}`;

		return wrapper;
	}

	/**
	 * Prepara una copia de la tarjeta para exportación
	 * @param {HTMLElement} originalCard - Elemento de tarjeta original
	 * @returns {HTMLElement} Clon preparado para exportación
	 */
	prepareCardForExport(originalCard) {
		// Clonar la tarjeta
		const clone = originalCard.cloneNode(true);

		// Configuraciones básicas
		Object.assign(clone.style, {
			width: '100%',
			height: '100%',
			maxWidth: 'none',
			margin: '0',
			padding: '40pt 40pt 0 40pt',
			boxShadow: 'none',
			position: 'relative',
		});

		// Copiar estilos computados importantes
		this.copyComputedStyles(originalCard, clone);

		// Escalar elementos internos
		this.scaleCardElements(clone);

		return clone;
	}

	/**
	 * Copia los estilos computados de un elemento a otro
	 * @param {HTMLElement} source - Elemento fuente
	 * @param {HTMLElement} target - Elemento destino
	 */
	copyComputedStyles(source, target) {
		const styles = window.getComputedStyle(source);

		// Copiar fondo
		target.style.backgroundColor = styles.backgroundColor;

		if (styles.backgroundImage !== 'none') {
			target.style.backgroundImage = styles.backgroundImage;
			target.style.backgroundSize = 'cover';
			target.style.backgroundPosition = 'center';
			target.style.backgroundRepeat = 'no-repeat';

			// Si tiene clase para oscurecer el fondo
			if (source.classList.contains('has-bg-image')) {
				target.classList.add('has-bg-image');
				this.addDarkOverlayStyle();
			}
		}
	}

	/**
	 * Añade un estilo temporal para el overlay oscuro en imágenes de fondo
	 */
	addDarkOverlayStyle() {
		if (document.getElementById('temp-export-styles')) return;

		const style = document.createElement('style');
		style.id = 'temp-export-styles';
		style.textContent = `
            .has-bg-image::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: rgba(0, 0, 0, 0.6);
                z-index: 1;
                pointer-events: none;
            }
        `;
		document.head.appendChild(style);
	}

	/**
	 * Escala los elementos de la tarjeta para la exportación
	 * @param {HTMLElement} card - Elemento de tarjeta clonado
	 */
	scaleCardElements(card) {
		const scaleFactor = CONSTANTS.CARD_EXPORT.SCALE_FACTOR || 1.5;

		// Header
		const header = card.querySelector('.card-header');
		if (header) {
			Object.assign(header.style, {
				zIndex: '2',
				padding: '30px',
				height: '120px',
				minHeight: '120px',
			});
		}

		// Body
		const body = card.querySelector('.card-body');
		if (body) {
			Object.assign(body.style, {
				zIndex: '2',
				padding: '30px',
			});
		}

		// Footer
		const footer = card.querySelector('.card-footer');
		if (footer) {
			Object.assign(footer.style, {
				zIndex: '2',
				paddingLeft: '30px',
				paddingBottom: '120px',
				minHeight: '180px',
			});
		}

		// Textos - escala diferentes elementos de texto
		const textElements = {
			repoName: { selector: '#displayRepoName', fontSize: '2.5rem' },
			username: { selector: '#displayUsername', fontSize: '2rem' },
			projectName: { selector: '#displayProjectName', fontSize: '4rem' },
			description: {
				selector: '#displayDescription',
				fontSize: '2rem',
				lineHeight: '1.6',
			},
		};

		for (const [key, config] of Object.entries(textElements)) {
			const element = card.querySelector(config.selector);
			if (element) {
				element.style.fontSize = config.fontSize;
				if (config.lineHeight) {
					element.style.lineHeight = config.lineHeight;
				}
			}
		}

		// Imágenes - escala diferentes elementos de imagen
		const images = {
			githubLogo: {
				selector: '.github-logo',
				width: '60px',
				height: '60px',
				marginRight: '20px',
			},
			profilePic: {
				selector: '.profile-pic',
				width: '80px',
				height: '80px',
			},
			projectLogo: {
				selector: '.project-logo',
				width: 'auto',
				height: '6rem',
				borderRadius: '10px',
			},
		};

		for (const [key, config] of Object.entries(images)) {
			const image = card.querySelector(config.selector);
			if (image) {
				if (config.width !== 'auto') {
					image.style.width = config.width;
				} else {
					image.style.width = 'auto';
				}

				image.style.height = config.height;

				if (config.marginRight) {
					image.style.marginRight = config.marginRight;
				}

				if (config.borderRadius) {
					image.style.borderRadius = config.borderRadius;
				}
			}
		}

		// Logo container
		const logoContainer = card.querySelector('.logo-container');
		if (logoContainer) {
			Object.assign(logoContainer.style, {
				position: 'absolute',
				bottom: '30px',
				right: '40px',
				maxHeight: '8rem',
				zIndex: '2',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
			});
		}
	}

	/**
	 * Limpia estilos en el documento clonado
	 * @param {Document} clonedDoc - Documento clonado
	 */
	cleanupClonedDocument(clonedDoc) {
		// Implementar limpieza adicional si es necesario
	}

	/**
	 * Elimina estilos temporales añadidos durante la exportación
	 */
	removeTemporaryStyles() {
		const tempStyles = document.getElementById('temp-export-styles');
		if (tempStyles) {
			tempStyles.parentNode.removeChild(tempStyles);
		}
	}

	/**
	 * Descarga una imagen desde un canvas
	 * @param {HTMLCanvasElement} canvas - Canvas con la imagen renderizada
	 */
	downloadImage(canvas) {
		try {
			const link = document.createElement('a');
			link.download = 'github-project-card.png';
			link.href = canvas.toDataURL('image/png');
			link.style.display = 'none';
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		} catch (error) {
			console.error('Error downloading image:', error);
			throw new Error('Failed to download image. ' + error.message);
		}
	}

	/**
	 * Valida y ajusta las dimensiones de exportación
	 * @param {Object} dimensions - Dimensiones a validar {width, height}
	 * @returns {Object} Dimensiones validadas
	 */
	validateExportDimensions(dimensions = {}) {
		const defaultWidth = CONSTANTS.CARD_EXPORT.WIDTH;
		const defaultHeight = CONSTANTS.CARD_EXPORT.HEIGHT;

		let { width, height } = dimensions;

		// Validar ancho
		if (!width || isNaN(width) || width < 100) {
			width = defaultWidth;
		}

		// Validar alto
		if (!height || isNaN(height) || height < 100) {
			height = defaultHeight;
		}

		// Mantener relación de aspecto 2:1 si se especifica solo una dimensión
		if (dimensions.width && !dimensions.height) {
			height = width / 2;
		} else if (!dimensions.width && dimensions.height) {
			width = height * 2;
		}

		return { width, height };
	}
}
