import { CONSTANTS } from '../config.js';
import { sanitizeText } from '../../utils/validators.js';
import {
	createElement,
	addStylesheet,
	updateClassList,
} from '../../utils/domUtils.js';

/**
 * Sistema de notificaciones para toda la aplicación
 * Maneja la creación, visualización y eliminación de notificaciones
 */
export class NotificationSystem {
	/**
	 * Constructor que inicializa el sistema de notificaciones
	 * @param {Object} options - Opciones de configuración
	 */
	constructor(options = {}) {
		this.activeNotification = null;
		this.position = options.position || 'top-right';
		this.duration = options.duration || CONSTANTS.UI.NOTIFICATION_DURATION || 3000;
		this.container = null;

		// Inicializar estilos
		this.initStyles();

		// Crear contenedor para notificaciones
		this.createContainer();

		// Hacer el sistema accesible globalmente para componentes sin acceso directo
		window.notificationSystem = this;
	}

	/**
	 * Inicializa los estilos CSS para las notificaciones
	 */
	initStyles() {
		// Usar addStylesheet de domUtils para añadir estilos
		if (document.getElementById('notification-styles')) {
			return;
		}

		const styleContent = `
            .notification-container {
                position: fixed;
                z-index: 1000;
                display: flex;
                flex-direction: column;
                gap: 10px;
                max-width: 100%;
                pointer-events: none;
            }
            
            .notification-container.top-right {
                top: 20px;
                right: 20px;
                align-items: flex-end;
            }
            
            .notification-container.top-left {
                top: 20px;
                left: 20px;
                align-items: flex-start;
            }
            
            .notification-container.bottom-right {
                bottom: 20px;
                right: 20px;
                align-items: flex-end;
            }
            
            .notification-container.bottom-left {
                bottom: 20px;
                left: 20px;
                align-items: flex-start;
            }
            
            .notification {
                position: relative;
                padding: 12px 20px;
                border-radius: 8px;
                color: white;
                font-weight: 500;
                display: flex;
                align-items: center;
                gap: 10px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                transform: translateX(0);
                opacity: 0;
                transition: all 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);
                max-width: 350px;
                pointer-events: auto;
                cursor: pointer;
            }
            
            .notification.fade-in {
                opacity: 1;
            }
            
            .notification.fade-out {
                opacity: 0;
                transform: translateX(100%);
            }
            
            .notification i {
                font-size: 18px;
            }
            
            .notification.success {
                background-color: #2ecc71;
            }
            
            .notification.error {
                background-color: #e74c3c;
            }
            
            .notification.warning {
                background-color: #f39c12;
            }
            
            .notification.info {
                background-color: #3498db;
            }
            
            .notification .close-btn {
                position: absolute;
                top: 5px;
                right: 5px;
                background: transparent;
                border: none;
                color: rgba(255,255,255,0.6);
                font-size: 12px;
                cursor: pointer;
                padding: 5px;
                line-height: 1;
            }
            
            .notification .close-btn:hover {
                color: white;
            }
            
            .notification .content {
                flex-grow: 1;
                word-break: break-word;
				margin-right: 10px;
            }
            
            @media (max-width: 600px) {
                .notification {
                    max-width: 90vw;
                }
            }
        `;

		addStylesheet('notification-styles', styleContent);
	}

	/**
	 * Crea el contenedor para las notificaciones
	 */
	createContainer() {
		// Verificar si el contenedor ya existe
		let container = document.querySelector('.notification-container');
		if (!container) {
			// Usar createElement de domUtils
			container = createElement('div', {
				className: `notification-container ${this.position}`,
			});
			document.body.appendChild(container);
		}
		this.container = container;
	}

	/**
	 * Muestra una notificación
	 * @param {string} message - Mensaje a mostrar
	 * @param {string} type - Tipo de notificación ('success', 'error', 'warning', 'info')
	 * @param {Object} options - Opciones adicionales
	 * @returns {HTMLElement} Elemento de notificación creado
	 */
	show(message, type = 'info', options = {}) {
		// Si hay una validación fallida, procesar el mensaje adecuadamente
		if (type === 'error' && typeof message === 'object' && message.errors) {
			message = this.formatValidationErrors(message.errors);
		} else {
			// Sanitizar texto para prevenir XSS
			message = typeof message === 'string' ? sanitizeText(message) : String(message);
		}

		// Seleccionar icono apropiado
		let iconContent = '';
		switch (type) {
			case 'success':
				iconContent = '<i class="fas fa-check-circle"></i>';
				break;
			case 'error':
				iconContent = '<i class="fas fa-exclamation-circle"></i>';
				break;
			case 'warning':
				iconContent = '<i class="fas fa-exclamation-triangle"></i>';
				break;
			case 'info':
				iconContent = '<i class="fas fa-info-circle"></i>';
				break;
		}

		// Crear icono usando createElement
		const icon = createElement('div', {
			className: 'notification-icon',
			innerHTML: iconContent,
		});

		// Crear contenido
		const content = createElement('div', {
			className: 'content',
			innerHTML: message,
		});

		// Crear botón de cierre
		const closeBtn =
			options.dismissible !== false
				? createElement('button', {
						className: 'close-btn',
						innerHTML: '<i class="fas fa-times"></i>',
						onclick: (e) => {
							e.stopPropagation();
							this.hide(notification);
						},
				  })
				: null;

		// Crear notificación usando createElement
		const notification = createElement('div', {
			className: `notification ${type}`,
			onclick: () => this.hide(notification),
		});

		// Agregar elementos a la notificación
		notification.appendChild(icon);
		notification.appendChild(content);
		if (closeBtn) notification.appendChild(closeBtn);

		// Agregar al contenedor
		this.container.appendChild(notification);

		// Animar entrada
		setTimeout(() => {
			updateClassList(notification, {
				'fade-in': true,
			});
		}, 10);

		// Configurar auto-cierre si no es error o si se especifica
		const duration = options.duration || this.duration;
		if (type !== 'error' || options.autoClose !== false) {
			setTimeout(() => {
				if (notification.parentNode) {
					this.hide(notification);
				}
			}, duration);
		}

		return notification;
	}

	/**
	 * Formatea los errores de validación para mostrarlos en una notificación
	 * @param {Object} errors - Objeto con errores de validación
	 * @returns {string} Mensaje HTML formateado
	 */
	formatValidationErrors(errors) {
		if (typeof errors === 'string') return sanitizeText(errors);

		if (Object.keys(errors).length === 1) {
			return sanitizeText(Object.values(errors)[0]);
		}

		const errorItems = Object.entries(errors)
			.map(([field, message]) => `<li>${sanitizeText(message)}</li>`)
			.join('');

		return `<strong>Por favor corrige los siguientes errores:</strong><ul>${errorItems}</ul>`;
	}

	/**
	 * Oculta una notificación específica
	 * @param {HTMLElement} notification - Elemento a ocultar
	 */
	hide(notification = this.activeNotification) {
		if (!notification) return;

		// Usar updateClassList de domUtils
		updateClassList(notification, {
			'fade-out': true,
			'fade-in': false,
		});

		setTimeout(() => {
			if (notification.parentNode) {
				notification.parentNode.removeChild(notification);
			}
			if (this.activeNotification === notification) {
				this.activeNotification = null;
			}
		}, 300);
	}

	/**
	 * Elimina todas las notificaciones activas
	 */
	clearAll() {
		const notifications = this.container.querySelectorAll('.notification');
		notifications.forEach((notification) => {
			this.hide(notification);
		});
	}

	/**
	 * Muestra una notificación de éxito
	 * @param {string} message - Mensaje a mostrar
	 * @param {Object} options - Opciones adicionales
	 * @returns {HTMLElement} Elemento de notificación
	 */
	success(message, options = {}) {
		return this.show(message, 'success', options);
	}

	/**
	 * Muestra una notificación de error
	 * @param {string|Object} message - Mensaje o objeto de error a mostrar
	 * @param {Object} options - Opciones adicionales
	 * @returns {HTMLElement} Elemento de notificación
	 */
	error(message, options = {}) {
		return this.show(message, 'error', options);
	}

	/**
	 * Muestra una notificación de advertencia
	 * @param {string} message - Mensaje a mostrar
	 * @param {Object} options - Opciones adicionales
	 * @returns {HTMLElement} Elemento de notificación
	 */
	warning(message, options = {}) {
		return this.show(message, 'warning', options);
	}

	/**
	 * Muestra una notificación de información
	 * @param {string} message - Mensaje a mostrar
	 * @param {Object} options - Opciones adicionales
	 * @returns {HTMLElement} Elemento de notificación
	 */
	info(message, options = {}) {
		return this.show(message, 'info', options);
	}

	/**
	 * Reemplaza la función de notificación en index.js
	 * Método estático para migrar código antiguo
	 * @param {string} message - Mensaje a mostrar
	 * @param {string} type - Tipo de notificación
	 */
	static showNotification(message, type) {
		if (window.notificationSystem) {
			window.notificationSystem.show(message, type);
		} else {
			// Crear instancia temporal si no existe
			const tempSystem = new NotificationSystem();
			tempSystem.show(message, type);
		}
	}
}
