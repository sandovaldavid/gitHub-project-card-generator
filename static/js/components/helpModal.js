/**
 * Help Modal Component
 * Displays a modal with help information from config
 */
class HelpModal {
	constructor() {
		this.modal = document.getElementById('helpModal');
		this.modalContent = this.modal.querySelector('.modal-content');
		this.initialized = false;
		this.eventBound = false;
	}

	/**
	 * Initialize the help modal
	 */
	init() {
		if (this.initialized) return;

		// Create the modal content based on HELP_MODAL config
		this.buildModalContent();

		// Bind events if not already bound
		if (!this.eventBound) {
			this.bindEvents();
		}

		this.initialized = true;
	}

	/**
	 * Builds the modal content from config
	 */
	buildModalContent() {
		const { TITLE, SUBTITLE, STEPS, FOOTER } = CONFIG.HELP_MODAL;

		// Create content structure
		const content = document.createElement('div');

		// Add close button
		const closeBtn = document.createElement('span');
		closeBtn.className = 'help-modal-close';
		closeBtn.innerHTML = '&times;';
		closeBtn.addEventListener('click', () => this.hide());
		content.appendChild(closeBtn);

		// Add title
		const title = document.createElement('h2');
		title.className = 'help-modal-title';
		title.textContent = TITLE;
		content.appendChild(title);

		// Add subtitle
		const subtitle = document.createElement('p');
		subtitle.className = 'help-modal-subtitle';
		subtitle.textContent = SUBTITLE;
		content.appendChild(subtitle);

		// Add steps
		const stepsContainer = document.createElement('div');
		stepsContainer.className = 'help-modal-steps';

		STEPS.forEach((step, index) => {
			const stepElement = document.createElement('div');
			stepElement.className = 'help-step';

			const stepTitle = document.createElement('div');
			stepTitle.className = 'help-step-title';
			stepTitle.textContent = `${index + 1}. ${step.title}`;

			const stepContent = document.createElement('div');
			stepContent.className = 'help-step-content';
			stepContent.textContent = step.content;

			stepElement.appendChild(stepTitle);
			stepElement.appendChild(stepContent);
			stepsContainer.appendChild(stepElement);
		});

		content.appendChild(stepsContainer);

		// Add footer
		if (FOOTER) {
			const footer = document.createElement('div');
			footer.className = 'help-modal-footer';
			footer.textContent = FOOTER;
			content.appendChild(footer);
		}

		// Replace existing content
		this.modalContent.innerHTML = '';
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
			}
		});

		// Close with ESC key
		document.addEventListener('keydown', (e) => {
			if (e.key === 'Escape' && this.isVisible()) {
				this.hide();
			}
		});

		this.eventBound = true;
	}

	/**
	 * Show the help modal
	 */
	show() {
		if (!this.initialized) {
			this.init();
		}

		this.modal.classList.add('show');
		document.body.style.overflow = 'hidden'; // Prevent scrolling
	}

	/**
	 * Hide the help modal
	 */
	hide() {
		this.modal.classList.remove('show');
		document.body.style.overflow = ''; // Re-enable scrolling
	}

	/**
	 * Check if the modal is visible
	 */
	isVisible() {
		return this.modal.classList.contains('show');
	}

	/**
	 * Toggle the visibility of the modal
	 */
	toggle() {
		if (this.isVisible()) {
			this.hide();
		} else {
			this.show();
		}
	}
}

// Export the component
export default HelpModal;
