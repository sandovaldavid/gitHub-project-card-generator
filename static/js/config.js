/**
 * Global configuration for the application
 * Defines constants and default values
 */
export const CONSTANTS = {
	// Storage key for saved preferences
	STORAGE_KEY: 'github-card-generator-data',

	// GitHub API configuration
	GITHUB_API: {
		BASE_URL: 'https://api.github.com',
		DEFAULT_AVATAR: 'https://avatars.githubusercontent.com/u/0',
		RATE_LIMIT: 60, // Requests per hour for unauthenticated users
	},

	// Default UI colors
	UI: {
		DEFAULT_COLORS: {
			PROJECT: '#ffffff',
			BORDER: '#3b82f6',
			BACKGROUND: '#10192a',
		},
		ANIMATION_DURATION: 300, // ms
	},

	// Card export settings
	CARD_EXPORT: {
		WIDTH: 1280,
		HEIGHT: 640,
		DEFAULT_FORMAT: 'png',
		DEFAULT_FILENAME: 'github-card',
		QUALITY: 0.95,
		ESCALE: 1,
	},

	// Notification system settings
	NOTIFICATION: {
		POSITION: 'top-right',
		DURATION: 5000,
		MAX_NOTIFICATIONS: 3,
	},

	// Settings categories
	SETTINGS: {
		CATEGORIES: {
			APPEARANCE: 'appearance',
			CARD: 'card',
			PREFERENCES: 'preferences',
		},
		KEYS: {
			// User input
			USERNAME: 'username',
			REPO_NAME: 'repoName',
			PROJECT_NAME: 'projectName',
			PROJECT_DESCRIPTION: 'projectDescription',

			// Colors
			BACKGROUND_COLOR: 'bgColor',
			TEXT_COLOR: 'projectColor',
			BORDER_COLOR: 'borderColor',

			// Preferences
			AUTO_SAVE: 'autoSave',
		},
	},

	// Application required services
	APPLICATION: {
		REQUIRED_SERVICES: ['storage', 'github', 'export', 'events', 'settings', 'notifications'],
	},

	// Help modal content
	HELP_MODAL: {
		TITLE: 'How to Use the GitHub Card Generator',
		SUBTITLE:
			'Create custom social media cards for your GitHub repositories in a few simple steps.',
		STEPS: [
			{
				title: 'Enter GitHub Username',
				content:
					'Type your GitHub username and click "Load Profile" to fetch your profile information.',
			},
			{
				title: 'Enter Repository Details',
				content:
					'Enter the repository name, project name, and an optional description for your card.',
			},
			{
				title: 'Customize Your Card',
				content:
					'Choose colors, upload a logo, or add a background image to personalize your card.',
			},
			{
				title: 'Preview and Download',
				content:
					'Click "Update Card" to preview changes, then "Download" to save your card as a PNG image.',
			},
		],
		FOOTER: 'Your preferences are automatically saved locally for your next visit.',
	},
};
