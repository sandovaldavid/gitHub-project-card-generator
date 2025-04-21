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
		content.className = 'help-modal-content';

		// Add modal header
		const header = document.createElement('div');
		header.className = 'help-modal-header';

		// Add modal icon
		const iconContainer = document.createElement('div');
		iconContainer.className = 'help-modal-icon';
		const icon = document.createElement('i');
		icon.className = 'fas fa-question-circle';
		iconContainer.appendChild(icon);
		header.appendChild(iconContainer);

		// Add title
		const title = document.createElement('h2');
		title.className = 'help-modal-title';
		title.textContent = TITLE;
		header.appendChild(title);

		// Add close button
		const closeBtn = document.createElement('button');
		closeBtn.className = 'help-modal-close';
		closeBtn.setAttribute('aria-label', 'Close help modal');
		closeBtn.innerHTML = '<i class="fas fa-times"></i>';
		closeBtn.addEventListener('click', () => this.hide());
		content.appendChild(closeBtn);

		content.appendChild(header);

		// Add subtitle
		if (SUBTITLE) {
			const subtitle = document.createElement('p');
			subtitle.className = 'help-modal-subtitle';
			subtitle.textContent = SUBTITLE;
			content.appendChild(subtitle);
		}

		// Create steps section
		const stepsContainer = document.createElement('div');
		stepsContainer.className = 'help-modal-steps';

		// Map of step icons based on titles for better visual representation
		const stepIcons = {
			'Enter GitHub Username': 'fa-user',
			'Enter Repository Details': 'fa-code-branch',
			'Customize Your Card': 'fa-palette',
			'Preview and Download': 'fa-download',
		};

		// Add each step with enhanced styling
		STEPS.forEach((step, index) => {
			const stepElement = document.createElement('div');
			stepElement.className = 'help-step';

			// Add step number
			const stepNumber = document.createElement('div');
			stepNumber.className = 'help-step-number';
			stepNumber.textContent = (index + 1).toString();
			stepElement.appendChild(stepNumber);

			// Add step content container
			const stepContent = document.createElement('div');
			stepContent.className = 'help-step-content';

			// Add step title with icon
			const stepTitle = document.createElement('div');
			stepTitle.className = 'help-step-title';

			// Get icon based on title or use default
			const iconName = stepIcons[step.title] || 'fa-check-circle';
			stepTitle.innerHTML = `<i class="fas ${iconName}"></i> ${step.title}`;

			stepContent.appendChild(stepTitle);

			// Add step description
			const stepDescription = document.createElement('div');
			stepDescription.className = 'help-step-description';
			stepDescription.textContent = step.content;
			stepContent.appendChild(stepDescription);

			stepElement.appendChild(stepContent);
			stepsContainer.appendChild(stepElement);
		});

		content.appendChild(stepsContainer);

		// Add footer
		if (FOOTER) {
			const footer = document.createElement('div');
			footer.className = 'help-modal-footer';

			const footerIcon = document.createElement('i');
			footerIcon.className = 'fas fa-info-circle';
			footer.appendChild(footerIcon);

			const footerText = document.createElement('div');
			footerText.className = 'help-modal-footer-text';
			footerText.textContent = FOOTER;
			footer.appendChild(footerText);

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

		// Add the show class to trigger animations
		this.modal.classList.add('show');

		// Prevent scrolling on the body
		document.body.style.overflow = 'hidden';

		// Add a small delay for the content animation
		setTimeout(() => {
			const modalContent = this.modal.querySelector('.help-modal-content');
			if (modalContent) {
				modalContent.style.opacity = '1';
				modalContent.style.transform = 'translateY(0)';
			}
		}, 50);
	}

	/**
	 * Hide the help modal
	 */
	hide() {
		const modalContent = this.modal.querySelector('.help-modal-content');

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
