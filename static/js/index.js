document.addEventListener('DOMContentLoaded', function () {
	// Elements
	const usernameInput = document.getElementById('username');
	const loadProfileBtn = document.getElementById('loadProfile');
	const repoNameInput = document.getElementById('repoName');
	const projectNameInput = document.getElementById('projectName');
	const projectDescriptionInput =
		document.getElementById('projectDescription');
	const projectColorInput = document.getElementById('projectColor');
	const borderColorInput = document.getElementById('borderColor');
	const projectLogoInput = document.getElementById('projectLogo');
	const bgColorInput = document.getElementById('bgColor');
	const bgImageInput = document.getElementById('bgImage');
	const removeBgImageBtn = document.getElementById('removeBgImage');
	const generateCardBtn = document.getElementById('generateCard');
	const downloadCardBtn = document.getElementById('downloadCard');

	// Display elements
	const displayUsername = document.getElementById('displayUsername');
	const profilePic = document.getElementById('profilePic');
	const displayRepoName = document.getElementById('displayRepoName');
	const displayProjectName = document.getElementById('displayProjectName');
	const displayDescription = document.getElementById('displayDescription');
	const logoContainer = document.getElementById('logoContainer');
	const githubCard = document.getElementById('githubCard');

	// Manejador para la imagen de fondo
	bgImageInput.addEventListener('change', function (e) {
		if (e.target.files && e.target.files[0]) {
			const reader = new FileReader();

			reader.onload = function (event) {
				githubCard.style.backgroundImage = `url(${event.target.result})`;
				githubCard.style.backgroundSize = 'cover';
				githubCard.style.backgroundPosition = 'center';

				// Al subir una imagen, aplicamos un ligero oscurecimiento para mejorar legibilidad
				githubCard.classList.add('has-bg-image');
			};

			reader.readAsDataURL(e.target.files[0]);
		}
	});

	// Botón para eliminar la imagen de fondo
	removeBgImageBtn.addEventListener('click', function () {
		githubCard.style.backgroundImage = 'none';
		githubCard.classList.remove('has-bg-image');
		bgImageInput.value = ''; // Resetear el input file
	});

	// Load GitHub profile
	loadProfileBtn.addEventListener('click', function () {
		const username = usernameInput.value.trim();
		if (username) {
			fetch(`https://api.github.com/users/${username}`)
				.then((response) => {
					if (!response.ok) {
						throw new Error('User not found');
					}
					return response.json();
				})
				.then((data) => {
					profilePic.src = data.avatar_url;
					displayUsername.textContent = username;
				})
				.catch((error) => {
					alert('Error loading GitHub profile: ' + error.message);
				});
		} else {
			alert('Please enter a GitHub username');
		}
	});

	// Update card based on inputs
	generateCardBtn.addEventListener('click', updateCard);

	// Initial card update
	updateCard();

	function updateCard() {
		// Update repository name
		const repoName = repoNameInput.value.trim();
		displayRepoName.textContent = repoName
			? '/' + repoName
			: '/repository-name';

		// Update project name and color
		const projectName = projectNameInput.value.trim();
		displayProjectName.textContent = projectName || 'Project Name';
		displayProjectName.style.color = projectColorInput.value;

		// Update project description (optional)
		const description = projectDescriptionInput.value.trim();
		displayDescription.textContent = description;

		// Adjust card layout based on whether there's a description
		// En lugar de ocultar el elemento, ocultamos solo el texto
		if (description) {
			displayDescription.style.display = 'block';
		} else {
			displayDescription.style.display = 'none';
		}

		// Update border color
		document.documentElement.style.setProperty(
			'--border-color',
			borderColorInput.value
		);

		// Update background color
		document.documentElement.style.setProperty(
			'--bg-color',
			bgColorInput.value
		);

		// Update username if entered but profile not loaded
		if (
			usernameInput.value.trim() &&
			displayUsername.textContent === 'username'
		) {
			displayUsername.textContent = usernameInput.value.trim();
		}

		if (!githubCard.classList.contains('has-bg-image')) {
			document.documentElement.style.setProperty(
				'--bg-color',
				bgColorInput.value
			);
		}
	}

	// Handle project logo upload
	projectLogoInput.addEventListener('change', function (e) {
		if (e.target.files && e.target.files[0]) {
			const reader = new FileReader();

			reader.onload = function (event) {
				logoContainer.innerHTML = '';
				const img = document.createElement('img');
				img.src = event.target.result;
				img.alt = 'Project Logo';
				img.className = 'project-logo';
				logoContainer.appendChild(img);
			};

			reader.readAsDataURL(e.target.files[0]);
		}
	});

	// Download card as PNG
	downloadCardBtn.addEventListener('click', function () {
		const card = document.getElementById('githubCard');

		html2canvas(card, {
			scale: 2,
			backgroundColor: null,
			logging: false,
		}).then((canvas) => {
			const link = document.createElement('a');
			link.download = 'github-project-card.png';
			link.href = canvas.toDataURL('image/png');
			link.click();
		});
	});
});
