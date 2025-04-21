import { CONSTANTS } from '../config.js';

/**
 * Class responsible for preparing elements for export
 * Implements the Single Responsibility Principle by separating export preparation
 */
class ExportPreparationService {
	/**
	 * Creates a temporary container for export
	 * @returns {HTMLElement} Container configured for export
	 */
	createExportContainer() {
		const container = document.createElement('div');

		// Configure container with appropriate styles for export
		Object.assign(container.style, {
			position: 'fixed',
			top: '-9999px',
			left: '-9999px',
			width: `${CONSTANTS.CARD_EXPORT.WIDTH}px`,
			height: `${CONSTANTS.CARD_EXPORT.HEIGHT}px`,
			padding: '0',
			margin: '0',
			overflow: 'hidden',
			background: 'var(--bg-color)',
			zIndex: '-9999',
		});

		return container;
	}

	/**
	 * Prepares a copy of the card for export
	 * @param {HTMLElement} originalElement - Original element to clone
	 * @returns {HTMLElement} Cloned and prepared element for export
	 */
	prepareElementForExport(originalElement) {
		if (!originalElement) {
			throw new Error('No element provided for export preparation');
		}

		// Create a deep clone of the element
		const clonedElement = originalElement.cloneNode(true);
		const elementId = originalElement.id || 'export-element';

		// Get computed styles from the original element
		const computedStyle = window.getComputedStyle(originalElement);

		// Set fixed dimensions for export
		Object.assign(clonedElement.style, {
			width: `${CONSTANTS.CARD_EXPORT.WIDTH}px`,
			height: `${CONSTANTS.CARD_EXPORT.HEIGHT}px`,
			position: 'relative',
			transform: 'none',
			transition: 'none',
			opacity: '1',
			backgroundColor: computedStyle.backgroundColor,
			color: computedStyle.color,
			borderColor: computedStyle.borderColor,
			borderWidth: computedStyle.borderWidth,
			borderStyle: computedStyle.borderStyle,
			boxShadow: computedStyle.boxShadow,
			borderRadius: computedStyle.borderRadius,
		});

		// Inject specific CSS styles to override media queries
		this.injectDesktopStyles(clonedElement);

		// Configure internal elements (scaling, positions, etc.)
		this.configureInternalElements(clonedElement, elementId, originalElement);

		return clonedElement;
	}

	/**
	 * Injects desktop styles directly into the element to override any media query
	 * @param {HTMLElement} element - Element to apply the styles to
	 */
	injectDesktopStyles(element) {
		// Create a style element that overrides all media queries
		const styleElement = document.createElement('style');
		styleElement.textContent = `
			/* Forced desktop styles - override media queries */
			#displayProjectName, .project-name {
				font-size: 4rem !important;
				font-weight: bold !important;
				line-height: 1.2 !important;
			}
			
			#displayUsername, .username {
				font-size: 2rem !important;
				font-weight: bold !important;
			}
			
			#displayRepoName, .repo-name {
				font-size: 2rem !important;
				font-weight: bold !important;
			}
			
			#displayDescription, .description {
				font-size: 2rem !important;
				line-height: 1.5 !important;
				max-width: 90% !important;
				margin: auto !important;
				text-align: justify !important;
			}
			
			#profilePic, .avatar {
				width: 100px !important;
				height: 100px !important;
				border-radius: 50% !important;
				margin-right: 20px !important;
			}
			
			.github-logo {
				width: 60px !important;
				height: 60px !important;
				border-radius: 50% !important;
				background: white !important;
				margin-left: 0.75rem !important;
			}
			
			.project-logo, #displayProjectLogo {
				height: 100px !important;
				width: auto !important;
			}
			
			.card-icon {
				width: 48px !important;
				height: 48px !important;
			}
			
			.card-content {
				width: 100% !important;
				height: 100% !important;
				display: flex !important;
				flex-direction: column !important;
				justify-content: space-between !important;
				padding: 40pt 40pt 0 40pt !important;
			}
			
			 /* Fix header alignment and its elements */
			.header {
				display: flex !important;
				flex-direction: row !important;
				align-items: center !important;
				margin-bottom: 30px !important;
				height: 80px !important;
				min-height: 80px !important;
				position: relative !important;
			}
			
			.info {
				flex: 1 !important;
				display: flex !important;
				flex-direction: row !important;
				justify-content: space-between !important;
				align-items: center !important;
			}
			
			.content-reponame {
				display: flex !important;
				flex-direction: row !important;
				align-items: center !important;
				justify-content: flex-start !important;
			}
			
			.card-footer {
				display: flex !important;
				justify-content: space-between !important;
				position: relative !important;

			}
		`;

		// Add the style to the cloned element to ensure the styles
		// take precedence over any media query
		element.appendChild(styleElement);

		// Force application of inline styles to critical elements
		this.forceDesktopStylesInline(element);
	}

	/**
	 * Applies desktop styles directly as inline styles
	 * to ensure maximum priority
	 * @param {HTMLElement} element - Root element
	 */
	forceDesktopStylesInline(element) {
		// Define selectors and their corresponding styles
		const inlineStyles = {
			'#displayProjectName, .project-name': {
				fontSize: '4rem',
				fontWeight: 'bold',
				lineHeight: '1.2',
			},
			'#displayUsername, .username': {
				fontSize: '2rem',
				fontWeight: 'bold',
			},
			'#displayRepoName, .repo-name': {
				fontSize: '2rem',
				fontWeight: 'bold',
			},
			'#displayDescription, .description': {
				fontSize: '2rem',
				lineHeight: '1.5',
				maxWidth: '90%',
				margin: 'auto',
				textAlign: 'justify',
			},
			'#profilePic, .avatar': {
				width: '100px',
				height: '100px',
				borderRadius: '50%',
				marginRight: '20px',
			},
			'.github-logo': {
				width: '60px',
				height: '60px',
				borderRadius: '50%',
				background: 'white',
				marginLeft: '0.75rem',
			},
			'.header': {
				display: 'flex',
				flexDirection: 'row',
				alignItems: 'center',
				marginBottom: '30px',
			},
			'.info': {
				flex: '1',
				display: 'flex',
				flexDirection: 'row',
				justifyContent: 'space-between',
				alignItems: 'center',
			},
			'.content-reponame': {
				display: 'flex',
				flexDirection: 'row',
				alignItems: 'center',
				justifyContent: 'flex-start',
			},
		};

		// Apply inline styles directly
		Object.entries(inlineStyles).forEach(([selector, styles]) => {
			// Split multiple selectors
			const selectors = selector.split(',').map((s) => s.trim());

			selectors.forEach((singleSelector) => {
				const elements = element.querySelectorAll(singleSelector);
				elements.forEach((el) => {
					Object.assign(el.style, styles);
					// Add !important effectively
					for (const property in styles) {
						el.style.setProperty(property, styles[property], 'important');
					}
				});
			});
		});

		// Ensure that HTML structure is not being modified by media queries
		// Specifically check the order of elements in the header
		const header = element.querySelector('.header');
		if (header) {
			const avatar = header.querySelector('.avatar, #profilePic');
			const info = header.querySelector('.info');

			// Ensure that the avatar is before the info
			if (avatar && info && avatar.nextElementSibling !== info) {
				header.innerHTML = '';
				header.appendChild(avatar);
				header.appendChild(info);
			}

			// Ensure correct structure within .info
			if (info) {
				const username = info.querySelector('.username, #displayUsername');
				const contentReponame = info.querySelector('.content-reponame');

				// Verify and correct the order if necessary
				if (username && contentReponame) {
					if (username.parentElement !== info || contentReponame.parentElement !== info) {
						info.innerHTML = '';
						info.appendChild(username);
						info.appendChild(contentReponame);
					}
				}
			}
		}
	}

	/**
	 * Configures the internal elements of the card for export
	 * @param {HTMLElement} clonedElement - Cloned element
	 * @param {string} elementId - ID of the original element
	 * @param {HTMLElement} originalElement - Original element reference
	 */
	configureInternalElements(clonedElement, elementId, originalElement) {
		// Remove any unnecessary elements for export
		const elementsToRemove = clonedElement.querySelectorAll('.export-exclude');
		elementsToRemove.forEach((el) => el.remove());

		// Ensure all elements have the correct size and position
		const cardContent = clonedElement.querySelector('.card-content');
		if (cardContent) {
			Object.assign(cardContent.style, {
				position: 'relative',
				width: '100%',
				height: '100%',
			});
		}

		// Ensure text elements are visible with proper styling
		const textElements = clonedElement.querySelectorAll('h1, h2, h3, p, span, div');
		textElements.forEach((el) => {
			// If original element exists, find the corresponding original for style copying
			if (originalElement) {
				// Try to find the same element in the original by ID, class or tag position
				let originalEl = null;
				if (el.id) {
					originalEl = originalElement.querySelector(`#${el.id}`);
				} else if (el.className) {
					// Try to find by class and similar position
					const similarElements = originalElement.querySelectorAll(
						`.${el.className.split(' ')[0]}`
					);
					const index = Array.from(
						clonedElement.querySelectorAll(`.${el.className.split(' ')[0]}`)
					).indexOf(el);
					if (index >= 0 && index < similarElements.length) {
						originalEl = similarElements[index];
					}
				}

				// Copy styles if original element found
				if (originalEl) {
					const computedStyle = window.getComputedStyle(originalEl);
					// Apply critical text styles
					Object.assign(el.style, {
						color: computedStyle.color,
						fontSize: computedStyle.fontSize,
						fontFamily: computedStyle.fontFamily,
						fontWeight: computedStyle.fontWeight,
						textAlign: computedStyle.textAlign,
						lineHeight: computedStyle.lineHeight,
					});
				}
			}

			// Fallback: Prevent invisible text by ensuring color is set
			if (el.style.color === 'transparent' || !el.style.color) {
				el.style.color = 'var(--project-text-color, #333333)';
			}
		});

		// Fix background images if they exist
		if (clonedElement.classList.contains('has-bg-image') && originalElement) {
			// Copy background image from original
			const computedStyle = window.getComputedStyle(originalElement);

			if (computedStyle.backgroundImage && computedStyle.backgroundImage !== 'none') {
				clonedElement.style.backgroundImage = computedStyle.backgroundImage;
				clonedElement.style.backgroundSize = computedStyle.backgroundSize || 'cover';
				clonedElement.style.backgroundPosition =
					computedStyle.backgroundPosition || 'center';

				// Ensure overlay for readability if present in original
				if (originalElement.querySelector('::before')) {
					const beforeStyle = window.getComputedStyle(originalElement, '::before');
					// Create an overlay div if needed
					if (
						beforeStyle.backgroundColor &&
						beforeStyle.backgroundColor !== 'rgba(0, 0, 0, 0)'
					) {
						const overlay = document.createElement('div');
						overlay.style.position = 'absolute';
						overlay.style.top = '0';
						overlay.style.left = '0';
						overlay.style.width = '100%';
						overlay.style.height = '100%';
						overlay.style.backgroundColor = beforeStyle.backgroundColor;
						overlay.style.opacity =
							beforeStyle.opacity || 'var(--bg-overlay-opacity, 0.6)';
						overlay.style.zIndex = '1';

						// Insert overlay as first child
						clonedElement.insertBefore(overlay, clonedElement.firstChild);

						// Ensure content is above overlay
						const contentElements = clonedElement.querySelectorAll(
							'.card-content, .content-project-logo, .content-username'
						);
						contentElements.forEach((el) => {
							el.style.position = 'relative';
							el.style.zIndex = '2';
						});
					}
				}
			}
		}

		// Fix profile picture if present
		const profilePic = clonedElement.querySelector('#profilePic');
		if (profilePic && originalElement) {
			const originalProfilePic = originalElement.querySelector('#profilePic');
			if (originalProfilePic && originalProfilePic.src) {
				profilePic.src = originalProfilePic.src;
				profilePic.style.maxWidth = '100%';
				profilePic.style.display = 'block';
			}
		}
	}

	/**
	 * Ensures all images are loaded before export
	 * @param {HTMLElement} element - Element containing images
	 * @returns {Promise<void>} Promise that resolves when all images are loaded
	 */
	async ensureImagesLoaded(element) {
		if (!element) return;

		const images = element.querySelectorAll('img');
		if (images.length === 0) return;

		const imagePromises = Array.from(images).map((img) => {
			return new Promise((resolve) => {
				if (img.complete) {
					resolve();
				} else {
					img.onload = () => resolve();
					img.onerror = () => resolve(); // Resolve anyway to prevent blocking
				}
			});
		});

		await Promise.all(imagePromises);
	}
}

/**
 * Base interface for exporters
 * Implements the Interface Segregation Principle (I)
 */
class Exporter {
	/**
	 * Exports data in a specific format
	 * @param {HTMLElement} element - Element to export
	 * @param {Object} options - Export options
	 * @returns {Promise<any>} Export result
	 */
	async export(element, options) {
		throw new Error('Export method must be implemented by subclasses');
	}
}

/**
 * Class for creating HTML screenshots
 * Implements the Single Responsibility Principle (S)
 */
class HtmlCapture {
	/**
	 * Captures an HTML element
	 * @param {HTMLElement} element - Element to capture
	 * @param {Object} options - Capture options
	 * @returns {Promise<HTMLCanvasElement>} Canvas with the capture
	 */
	async captureElement(element, options = {}) {
		if (!element) {
			throw new Error('No element provided for capture');
		}

		// Create a canvas for capturing
		const canvas = document.createElement('canvas');
		const context = canvas.getContext('2d');

		// Set dimensions
		canvas.width = options.width || CONSTANTS.CARD_EXPORT.WIDTH;
		canvas.height = options.height || CONSTANTS.CARD_EXPORT.HEIGHT;

		// Fill background with the same color as the element or specified color
		const backgroundColor =
			options.backgroundColor ||
			window.getComputedStyle(element).backgroundColor ||
			'var(--bg-color)';

		context.fillStyle = backgroundColor;
		context.fillRect(0, 0, canvas.width, canvas.height);

		try {
			// Try using html2canvas if available
			if (typeof html2canvas === 'function') {
				const htmlCanvas = await html2canvas(element, {
					backgroundColor: backgroundColor,
					scale: 2,
					logging: false,
					useCORS: true,
					allowTaint: true,
					width: canvas.width,
					height: canvas.height,
				});

				// Copy the html2canvas result to our canvas
				context.drawImage(htmlCanvas, 0, 0, canvas.width, canvas.height);
				return canvas;
			}

			// Fallback to native approach
			// 1. Create data URL from HTML
			const tempDiv = document.createElement('div');
			tempDiv.appendChild(element.cloneNode(true));

			// Apply all computed styles
			const elementStyles = window.getComputedStyle(element);
			const cssText = Array.from(elementStyles).reduce((css, property) => {
				return `${css}${property}:${elementStyles.getPropertyValue(property)};`;
			}, '');

			// Create an image from HTML
			const data = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}">
				<foreignObject width="100%" height="100%">
					<div xmlns="http://www.w3.org/1999/xhtml">
						<style>
							.card-export-container {
								width: ${canvas.width}px;
								height: ${canvas.height}px;
								${cssText}
							}
						</style>
						<div class="card-export-container">${tempDiv.innerHTML}</div>
					</div>
				</foreignObject>
			</svg>`;

			const blob = new Blob([data], { type: 'image/svg+xml' });
			const url = URL.createObjectURL(blob);

			// Load image and draw to canvas
			const image = new Image();
			await new Promise((resolve, reject) => {
				image.onload = resolve;
				image.onerror = reject;
				image.src = url;
			});

			context.drawImage(image, 0, 0, canvas.width, canvas.height);
			URL.revokeObjectURL(url);

			return canvas;
		} catch (error) {
			console.warn('HTML capture failed:', error);

			// Create a basic representation of the card
			context.fillStyle = backgroundColor;
			context.fillRect(0, 0, canvas.width, canvas.height);

			// Try to get some content from the element
			const projectName = element.querySelector('#displayProjectName');
			const username = element.querySelector('#displayUsername');
			const repoName = element.querySelector('#displayRepoName');

			context.fillStyle = window.getComputedStyle(element).color || '#ffffff';
			context.font = 'bold 24px Arial';
			context.fillText(projectName?.textContent || 'GitHub Project', 40, 80);

			context.font = '16px Arial';
			if (username?.textContent) {
				context.fillText(`${username.textContent}${repoName?.textContent || ''}`, 40, 120);
			}

			return canvas;
		}
	}
}

/**
 * PNG Exporter
 * Implements the Liskov Substitution Principle (L)
 */
class PngExporter extends Exporter {
	/**
	 * Constructor
	 * @param {HtmlCapture} capturer - HTML capturer
	 */
	constructor(capturer) {
		super();
		this.capturer = capturer || new HtmlCapture();
	}

	/**
	 * Exports element as PNG
	 * @param {HTMLElement} element - Element to export
	 * @param {Object} options - Export options
	 * @returns {Promise<string>} Data URL of the image
	 */
	async export(element, options = {}) {
		try {
			const canvas = await this.capturer.captureElement(element, options);
			const dataUrl = canvas.toDataURL('image/png');

			if (options.download && options.filename) {
				this.downloadImage(dataUrl, options.filename + '.png');
			}

			return dataUrl;
		} catch (error) {
			console.error('PNG export failed:', error);
			throw error;
		}
	}

	/**
	 * Downloads an image from a data URL
	 * @param {string} dataUrl - Data URL of the image
	 * @param {string} filename - Filename for download
	 * @private
	 */
	downloadImage(dataUrl, filename) {
		const link = document.createElement('a');
		link.href = dataUrl;
		link.download = filename;
		link.style.display = 'none';
		document.body.appendChild(link);
		link.click();
		setTimeout(() => {
			document.body.removeChild(link);
			window.URL.revokeObjectURL(dataUrl);
		}, 100);
	}
}

/**
 * JPEG Exporter
 * Implements the Liskov Substitution Principle (L)
 */
class JpegExporter extends Exporter {
	/**
	 * Constructor
	 * @param {HtmlCapture} capturer - HTML capturer
	 */
	constructor(capturer) {
		super();
		this.capturer = capturer || new HtmlCapture();
	}

	/**
	 * Exports element as JPEG
	 * @param {HTMLElement} element - Element to export
	 * @param {Object} options - Export options
	 * @returns {Promise<string>} Data URL of the image
	 */
	async export(element, options = {}) {
		try {
			const canvas = await this.capturer.captureElement(element, {
				...options,
				backgroundColor: options.backgroundColor || '#ffffff', // JPEG needs background
			});

			const quality = options.quality || 0.9;
			const dataUrl = canvas.toDataURL('image/jpeg', quality);

			if (options.download && options.filename) {
				this.downloadImage(dataUrl, options.filename + '.jpg');
			}

			return dataUrl;
		} catch (error) {
			console.error('JPEG export failed:', error);
			throw error;
		}
	}

	/**
	 * Downloads an image from a data URL
	 * @param {string} dataUrl - Data URL of the image
	 * @param {string} filename - Filename for download
	 * @private
	 */
	downloadImage(dataUrl, filename) {
		const link = document.createElement('a');
		link.href = dataUrl;
		link.download = filename;
		link.style.display = 'none';
		document.body.appendChild(link);
		link.click();
		setTimeout(() => {
			document.body.removeChild(link);
			window.URL.revokeObjectURL(dataUrl);
		}, 100);
	}
}

/**
 * Exporter factory
 * Implements Factory pattern and Open/Closed Principle (O)
 */
class ExporterFactory {
	/**
	 * Creates an exporter based on format
	 * @param {string} format - Export format ('png', 'jpeg')
	 * @returns {Exporter} Exporter for the format
	 */
	static createExporter(format) {
		const capturer = new HtmlCapture();

		switch (format.toLowerCase()) {
			case 'jpeg':
			case 'jpg':
				return new JpegExporter(capturer);
			case 'png':
			default:
				return new PngExporter(capturer);
		}
	}
}

/**
 * Main export service
 * Implements the Dependency Inversion Principle (D)
 */
export class ExportService {
	/**
	 * Constructor
	 * @param {Object} options - Configuration options
	 */
	constructor(options = {}) {
		this.options = options;
		this.preparationService = new ExportPreparationService();
		this.isExporting = false;
		this.lastError = null;
	}

	/**
	 * Exports an element in the specified format
	 * @param {HTMLElement} element - Element to export
	 * @param {string} format - Format (png, jpeg)
	 * @param {Object} options - Additional options
	 * @returns {Promise<string>} Data URL of the image
	 */
	async exportElement(element, format = null, options = {}) {
		if (this.isExporting) {
			throw new Error('Export already in progress');
		}

		try {
			this.isExporting = true;
			this.lastError = null;

			// Determine export format
			const exportFormat = format || 'png';

			// Create container and prepare element
			const container = this.preparationService.createExportContainer();
			document.body.appendChild(container);

			// Clone and prepare element for export
			const preparedElement = this.preparationService.prepareElementForExport(element);
			container.appendChild(preparedElement);

			// Ensure all images are loaded
			await this.preparationService.ensureImagesLoaded(preparedElement);

			// Get appropriate exporter
			const exporter = ExporterFactory.createExporter(exportFormat);

			// Export the element
			const result = await exporter.export(preparedElement, options);

			// Clean up
			document.body.removeChild(container);

			return result;
		} catch (error) {
			this.lastError = error.message || 'Export failed';
			console.error('Export error:', error);
			throw error;
		} finally {
			this.isExporting = false;
		}
	}

	/**
	 * Exports as PNG
	 * @param {HTMLElement} element - Element to export
	 * @param {Object} options - Export options
	 * @returns {Promise<string>} Data URL
	 */
	async exportAsPng(element, options = {}) {
		return this.exportElement(element, 'png', options);
	}

	/**
	 * Exports as JPEG
	 * @param {HTMLElement} element - Element to export
	 * @param {Object} options - Export options
	 * @returns {Promise<string>} Data URL
	 */
	async exportAsJpeg(element, options = {}) {
		return this.exportElement(element, 'jpeg', options);
	}

	/**
	 * Downloads the card as an image
	 * @param {HTMLElement} element - Element to export as card
	 * @param {string} filename - Download filename (optional)
	 * @param {string} format - Image format ('png' or 'jpeg')
	 * @param {Object} options - Additional export options
	 * @returns {Promise<boolean>} True if download was successful
	 */
	async downloadCard(element, filename = 'github-card', format = 'png', options = {}) {
		try {
			// Check if html2canvas is available
			if (typeof html2canvas !== 'function') {
				throw new Error(
					'html2canvas library is not available. Please reload the page and try again.'
				);
			}

			// Validate element
			if (!element) {
				throw new Error('Card element not found');
			}

			// Combine options with default values from configuration
			const exportOptions = {
				scale: CONSTANTS.CARD_EXPORT.SCALE || 2,
				quality: CONSTANTS.CARD_EXPORT.QUALITY || 0.95,
				...options,
				download: true,
				filename,
			};

			// Small wait to ensure that the UI is updated
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Export in the requested format
			await this.exportElement(element, format, exportOptions);

			return true;
		} catch (error) {
			this.lastError = error.message || 'Download failed';
			console.error('Download error:', error);
			return false;
		}
	}

	/**
	 * Gets the last error
	 * @returns {string|null} Error message or null
	 */
	getLastError() {
		return this.lastError;
	}

	/**
	 * Checks if export is in progress
	 * @returns {boolean} True if export is in progress
	 */
	getIsExporting() {
		return this.isExporting;
	}
}
