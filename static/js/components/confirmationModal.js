/**
 * Confirmation Modal Component
 * Displays a modal with confirmation options
 */
export class ConfirmationModal {
	/**
	 * Creates a new confirmation modal
	 */
	constructor() {
		this.modal = null;
		this.modalContent = null;
		this.initialized = false;
		this.eventBound = false;
		this.onConfirm = null;
		this.onCancel = null;
	}

	/**
	 * Initialize the confirmation modal
	 */
	init() {
		if (this.initialized) return;

		// Create modal container if it doesn't exist
		if (!this.modal) {
			this.createModalElement();
		}

		// Add to document if not already added
		if (!document.body.contains(this.modal)) {
			document.body.appendChild(this.modal);
		}

		// Bind events if not already bound
		if (!this.eventBound) {
			this.bindEvents();
		}

		this.initialized = true;
	}

	/**
	 * Creates the modal element
	 */
	createModalElement() {
		// Create modal container
		this.modal = document.createElement('div');
		this.modal.id = 'confirmationModal';
		this.modal.className = 'modal';

		// Create modal content wrapper
		const modalWrapper = document.createElement('div');
		modalWrapper.className = 'modal-wrapper';

		// Create modal content
		this.modalContent = document.createElement('div');
		this.modalContent.className = 'modal-content';

		modalWrapper.appendChild(this.modalContent);
		this.modal.appendChild(modalWrapper);
	}

	/**
	 * Builds the modal content
	 * @param {Object} options - Configuration options
	 */
	buildModalContent(options = {}) {
		const {
			title = 'Confirm Action',
			message = 'Are you sure you want to proceed?',
			confirmText = 'Confirm',
			cancelText = 'Cancel',
			icon = 'exclamation-triangle',
			confirmButtonClass = 'btn-danger',
		} = options;

		// Clear existing content
		this.modalContent.innerHTML = '';

		// Create content structure
		const content = document.createElement('div');
		content.className = 'confirmation-modal-content';

		// Add close button
		const closeBtn = document.createElement('button');
		closeBtn.className = 'modal-close';
		closeBtn.setAttribute('aria-label', 'Close confirmation modal');
		closeBtn.innerHTML = '<i class="fas fa-times"></i>';
		closeBtn.addEventListener('click', () => this.hide());
		content.appendChild(closeBtn);

		// Add modal header
		const header = document.createElement('div');
		header.className = 'modal-header';

		// Add icon
		const iconContainer = document.createElement('div');
		iconContainer.className = 'modal-icon';
		const iconElement = document.createElement('i');
		iconElement.className = `fas fa-${icon}`;
		iconContainer.appendChild(iconElement);
		header.appendChild(iconContainer);

		// Add title
		const titleElement = document.createElement('h3');
		titleElement.className = 'modal-title';
		titleElement.textContent = title;
		header.appendChild(titleElement);

		content.appendChild(header);

		// Add message
		const messageElement = document.createElement('p');
		messageElement.className = 'modal-message';
		messageElement.textContent = message;
		content.appendChild(messageElement);

		// Add action buttons
		const actions = document.createElement('div');
		actions.className = 'modal-actions';

		// Cancel button
		const cancelButton = document.createElement('button');
		cancelButton.className = 'btn btn-secondary';
		cancelButton.textContent = cancelText;
		cancelButton.addEventListener('click', () => {
			this.hide();
			if (typeof this.onCancel === 'function') {
				this.onCancel();
			}
		});
		actions.appendChild(cancelButton);

		// Confirm button
		const confirmButton = document.createElement('button');
		confirmButton.className = `btn ${confirmButtonClass}`;
		confirmButton.textContent = confirmText;
		confirmButton.addEventListener('click', () => {
			this.hide();
			if (typeof this.onConfirm === 'function') {
				this.onConfirm();
			}
		});
		actions.appendChild(confirmButton);

		content.appendChild(actions);

		// Add content to modal
		this.modalContent.appendChild(content);
	}

	/**
	 * Bind event listeners
	 */
	bindEvents() {
		// Close when clicking outside the modal content
		this.modal.addEventListener('click', (e) => {
			if (e.target === this.modal) {
				this.hide();
				if (typeof this.onCancel === 'function') {
					this.onCancel();
				}
			}
		});

		// Close with ESC key
		document.addEventListener('keydown', (e) => {
			if (e.key === 'Escape' && this.isVisible()) {
				this.hide();
				if (typeof this.onCancel === 'function') {
					this.onCancel();
				}
			}
		});

		this.eventBound = true;
	}

	/**
	 * Show the confirmation modal with options
	 * @param {Object} options - Configuration options
	 * @param {Function} onConfirm - Callback for confirmation
	 * @param {Function} onCancel - Callback for cancellation
	 */
	show(options = {}, onConfirm = null, onCancel = null) {
		if (!this.initialized) {
			this.init();
		}

		// Set callbacks
		this.onConfirm = onConfirm;
		this.onCancel = onCancel;

		// Build content with options
		this.buildModalContent(options);

		// Add the show class to trigger animations
		this.modal.classList.add('show');

		// Prevent scrolling on the body
		document.body.style.overflow = 'hidden';

		// Add a small delay for the content animation
		setTimeout(() => {
			const modalContent = this.modal.querySelector('.confirmation-modal-content');
			if (modalContent) {
				modalContent.style.opacity = '1';
				modalContent.style.transform = 'translateY(0)';
			}
		}, 50);
	}

	/**
	 * Hide the confirmation modal
	 */
	hide() {
		const modalContent = this.modal.querySelector('.confirmation-modal-content');

		// Animate the content out first
		if (modalContent) {
			modalContent.style.opacity = '0';
			modalContent.style.transform = 'translateY(20px)';
		}

		// Then, after a small delay, hide the modal
		setTimeout(() => {
			this.modal.classList.remove('show');
			document.body.style.overflow = '';
		}, 300);
	}

	/**
	 * Check if the modal is visible
	 * @returns {boolean} True if the modal is visible
	 */
	isVisible() {
		return this.modal && this.modal.classList.contains('show');
	}
}
