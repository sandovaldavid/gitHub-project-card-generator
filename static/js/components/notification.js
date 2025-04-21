import { CONSTANTS } from '../config.js';
import { sanitizeText } from '../../utils/validators.js';
import { createElement, addStylesheet, updateClassList } from '../../utils/domUtils.js';

/**
 * Enhanced Notification System
 * Provides visual feedback to users about actions and errors
 */
export class NotificationSystem {
	/**
	 * Create a new notification system
	 * @param {Object} options - Configuration options
	 */
	constructor(options = {}) {
		this.options = {
			position: options.position || CONSTANTS.NOTIFICATION.POSITION,
			duration: options.duration || CONSTANTS.NOTIFICATION.DURATION,
			maxNotifications: options.maxNotifications || CONSTANTS.NOTIFICATION.MAX_NOTIFICATIONS,
			container: null,
			animations: true,
			...options,
		};

		this.notifications = [];
		this.initialize();
	}

	/**
	 * Initialize the notification system
	 */
	initialize() {
		// Create the notification container if it doesn't exist
		const existingContainer = document.querySelector('.notification-container');

		if (existingContainer) {
			this.options.container = existingContainer;
		} else {
			this.options.container = document.createElement('div');
			this.options.container.className = `notification-container ${this.options.position}`;
			document.body.appendChild(this.options.container);
		}
	}

	/**
	 * Display a notification
	 * @param {string} message - Message to display
	 * @param {string} type - Notification type: success, error, warning, info
	 * @param {Object} options - Additional options like duration, actions, etc.
	 * @returns {string} ID of the created notification
	 */
	show(message, type = 'info', options = {}) {
		// Validate type
		const validTypes = ['success', 'error', 'warning', 'info'];
		if (!validTypes.includes(type)) {
			type = 'info';
		}

		// Combine options
		const notificationOptions = {
			...this.options,
			...options,
		};

		// Create notification element
		const notification = document.createElement('div');
		const id = `notification-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
		notification.id = id;
		notification.className = `notification ${type}`;

		// Determine icon based on type
		const icons = {
			success: '<i class="fas fa-check-circle"></i>',
			error: '<i class="fas fa-exclamation-circle"></i>',
			warning: '<i class="fas fa-exclamation-triangle"></i>',
			info: '<i class="fas fa-info-circle"></i>',
		};

		// Build content
		const content = `
			${icons[type]}
			<div class="notification-content">
				<div class="notification-message">${sanitizeText(message)}</div>
			</div>
			<button class="notification-close" aria-label="Close notification">
				<i class="fas fa-times"></i>
			</button>
		`;

		notification.innerHTML = content;

		// Display the notification
		this.options.container.appendChild(notification);

		// Add to active notifications list
		this.notifications.push({
			id,
			element: notification,
			timeout: null,
		});

		// Limit the number of notifications
		this.enforceMaxNotifications();

		// Add interactive behavior
		this.setupNotificationBehavior(id, notificationOptions.duration);

		// Show with animation
		setTimeout(() => {
			notification.classList.add('show');
		}, 10);

		return id;
	}

	/**
	 * Configure interactive behavior for a notification
	 * @param {string} id - Notification ID
	 * @param {number} duration - Duration in milliseconds
	 */
	setupNotificationBehavior(id, duration) {
		const notification = this.getNotificationById(id);
		if (!notification) return;

		// Configure close button
		const closeBtn = notification.element.querySelector('.notification-close');
		if (closeBtn) {
			closeBtn.addEventListener('click', () => this.close(id));
		}

		// Configure timeout
		if (duration > 0) {
			notification.timeout = setTimeout(() => {
				this.close(id);
			}, duration);
		}

		// Pause timeout on mouse hover
		notification.element.addEventListener('mouseenter', () => {
			if (notification.timeout) {
				clearTimeout(notification.timeout);
				notification.timeout = null;
			}
		});

		// Resume timeout on mouse leave
		notification.element.addEventListener('mouseleave', () => {
			if (duration > 0 && !notification.timeout) {
				notification.timeout = setTimeout(() => {
					this.close(id);
				}, duration);
			}
		});
	}

	/**
	 * Close a specific notification
	 * @param {string} id - ID of notification to close
	 */
	close(id) {
		const notification = this.getNotificationById(id);
		if (!notification) return;

		// Clear timeout if exists
		if (notification.timeout) {
			clearTimeout(notification.timeout);
		}

		// Animate exit
		notification.element.classList.remove('show');

		// Remove after animation
		setTimeout(() => {
			if (notification.element.parentNode) {
				notification.element.parentNode.removeChild(notification.element);
			}
			// Remove from list
			this.notifications = this.notifications.filter((n) => n.id !== id);
		}, 300);
	}

	/**
	 * Close all notifications
	 */
	closeAll() {
		this.notifications.forEach((notification) => {
			this.close(notification.id);
		});
	}

	/**
	 * Get a notification object by its ID
	 * @param {string} id - Notification ID
	 * @returns {Object|null} Notification object or null
	 */
	getNotificationById(id) {
		return this.notifications.find((notification) => notification.id === id) || null;
	}

	/**
	 * Enforce maximum number of notifications
	 */
	enforceMaxNotifications() {
		if (this.notifications.length > this.options.maxNotifications) {
			// Close the oldest ones
			const toRemove = this.notifications.slice(
				0,
				this.notifications.length - this.options.maxNotifications
			);
			toRemove.forEach((notification) => {
				this.close(notification.id);
			});
		}
	}

	/**
	 * Convenience methods for specific notification types
	 */
	success(message, options = {}) {
		return this.show(message, 'success', options);
	}

	error(message, options = {}) {
		return this.show(message, 'error', options);
	}

	warning(message, options = {}) {
		return this.show(message, 'warning', options);
	}

	info(message, options = {}) {
		return this.show(message, 'info', options);
	}
}
