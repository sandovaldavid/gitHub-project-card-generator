/**
 * Constants and functions for validating form data
 */
const CONFIG = {
	USERNAME: {
		MAX_LENGTH: 39,
		PATTERN: /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/,
	},
	REPO_NAME: {
		MAX_LENGTH: 100,
		PATTERN: /^[a-zA-Z0-9._-]+$/,
	},
	PROJECT_NAME: {
		MAX_LENGTH: 50,
	},
	DESCRIPTION: {
		MAX_LENGTH: 280,
	},
	IMAGE: {
		MAX_SIZE_MB: 5,
		ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
	},
	COLOR: {
		PATTERN: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
	},
};

/**
 * GitHub username validation
 * @param {string} username - GitHub username to validate
 * @returns {Object} Result of validation { isValid, message }
 */
export function validateGitHubUsername(username) {
	if (!username || username.trim() === '') {
		return {
			isValid: false,
			message: 'Please enter a GitHub username',
		};
	}

	if (username.length > CONFIG.USERNAME.MAX_LENGTH) {
		return {
			isValid: false,
			message: `Username must be less than ${CONFIG.USERNAME.MAX_LENGTH} characters`,
		};
	}

	if (!CONFIG.USERNAME.PATTERN.test(username)) {
		return {
			isValid: false,
			message:
				'Username can only contain alphanumeric characters and hyphens (not at the beginning)',
		};
	}

	return {
		isValid: true,
		message: '',
	};
}

/**
 * Repository name validation
 * @param {string} repoName - Repository name to validate
 * @returns {Object} Result of validation { isValid, message }
 */
export function validateRepoName(repoName) {
	if (!repoName || repoName.trim() === '') {
		return {
			isValid: false,
			message: 'Please enter a repository name',
		};
	}

	if (repoName.length > CONFIG.REPO_NAME.MAX_LENGTH) {
		return {
			isValid: false,
			message: `Repository name must be less than ${CONFIG.REPO_NAME.MAX_LENGTH} characters`,
		};
	}

	if (!CONFIG.REPO_NAME.PATTERN.test(repoName)) {
		return {
			isValid: false,
			message:
				'Repository name can only contain alphanumeric characters, periods, underscores, and hyphens',
		};
	}

	return {
		isValid: true,
		message: '',
	};
}

/**
 * Project name validation
 * @param {string} projectName - Project name to validate
 * @returns {Object} Result of validation { isValid, message }
 */
export function validateProjectName(projectName) {
	if (!projectName || projectName.trim() === '') {
		return {
			isValid: false,
			message: 'Please enter a project name',
		};
	}

	if (projectName.length > CONFIG.PROJECT_NAME.MAX_LENGTH) {
		return {
			isValid: false,
			message: `Project name must be less than ${CONFIG.PROJECT_NAME.MAX_LENGTH} characters`,
		};
	}

	return {
		isValid: true,
		message: '',
	};
}

/**
 * Project description validation
 * @param {string} description - Project description to validate
 * @returns {Object} Result of validation { isValid, message }
 */
export function validateDescription(description) {
	if (!description) {
		// Description is optional, so empty is valid
		return {
			isValid: true,
			message: '',
		};
	}

	if (description.length > CONFIG.DESCRIPTION.MAX_LENGTH) {
		return {
			isValid: false,
			message: `Description must be less than ${CONFIG.DESCRIPTION.MAX_LENGTH} characters`,
		};
	}

	return {
		isValid: true,
		message: '',
	};
}

/**
 * Color hexadecimal validation
 * @param {string} color - Hexadecimal color to validate
 * @returns {Object} Result of validation { isValid, message }
 */
export function validateColor(color) {
	if (!color) {
		return {
			isValid: false,
			message: 'Please provide a color',
		};
	}

	if (!CONFIG.COLOR.PATTERN.test(color)) {
		return {
			isValid: false,
			message: 'Invalid color format, must be a valid hex color (e.g., #FF0000)',
		};
	}

	return {
		isValid: true,
		message: '',
	};
}

/**
 * Image file validation
 * @param {File} file - Image file to validate
 * @returns {Object} Result of validation { isValid, message }
 */
export function validateImageFile(file) {
	if (!file) {
		return {
			isValid: false,
			message: 'Please select a file',
		};
	}

	if (!CONFIG.IMAGE.ALLOWED_TYPES.includes(file.type)) {
		return {
			isValid: false,
			message: 'File must be a valid image (JPEG, PNG, GIF, WEBP, or SVG)',
		};
	}

	const fileSizeInMB = file.size / (1024 * 1024);
	if (fileSizeInMB > CONFIG.IMAGE.MAX_SIZE_MB) {
		return {
			isValid: false,
			message: `File size must be less than ${CONFIG.IMAGE.MAX_SIZE_MB}MB`,
		};
	}

	return {
		isValid: true,
		message: '',
	};
}

/**
 * Validate a form
 * @param {Object} formData - Form data to validate
 * @returns {Object} Result of validation { isValid, errors }
 */
export function validateForm(formData) {
	const errors = {};
	let isValid = true;

	// validate username
	if (formData.username) {
		const usernameResult = validateGitHubUsername(formData.username);
		if (!usernameResult.isValid) {
			errors.username = usernameResult.message;
			isValid = false;
		}
	}

	// validate repository name
	if (formData.repoName !== undefined) {
		const repoResult = validateRepoName(formData.repoName);
		if (!repoResult.isValid) {
			errors.repoName = repoResult.message;
			isValid = false;
		}
	}

	// validate project name
	if (formData.projectName !== undefined) {
		const projectResult = validateProjectName(formData.projectName);
		if (!projectResult.isValid) {
			errors.projectName = projectResult.message;
			isValid = false;
		}
	}

	// validate description
	if (formData.description !== undefined) {
		const descResult = validateDescription(formData.description);
		if (!descResult.isValid) {
			errors.description = descResult.message;
			isValid = false;
		}
	}

	// validate colors
	const colorFields = ['projectColor', 'borderColor', 'bgColor'];
	colorFields.forEach((field) => {
		if (formData[field]) {
			const colorResult = validateColor(formData[field]);
			if (!colorResult.isValid) {
				errors[field] = colorResult.message;
				isValid = false;
			}
		}
	});

	// validate files
	if (formData.projectLogo instanceof File) {
		const logoResult = validateImageFile(formData.projectLogo);
		if (!logoResult.isValid) {
			errors.projectLogo = logoResult.message;
			isValid = false;
		}
	}

	if (formData.bgImage instanceof File) {
		const bgImageResult = validateImageFile(formData.bgImage);
		if (!bgImageResult.isValid) {
			errors.bgImage = bgImageResult.message;
			isValid = false;
		}
	}

	return { isValid, errors };
}

/**
 * Sanitize text to prevent XSS attacks
 * @param {string} text - Text to sanitize
 * @returns {string} Sanitized text
 */
export function sanitizeText(text) {
	if (!text) return '';

	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
}

/**
 * Validate a URL
 * @param {string} url - URL to validate
 * @returns {boolean} True if the URL is valid, false otherwise
 */
export function isValidURL(url) {
	try {
		new URL(url);
		return true;
	} catch (e) {
		return false;
	}
}
