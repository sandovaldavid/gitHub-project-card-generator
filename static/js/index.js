document.addEventListener('DOMContentLoaded', function () {
	// Elements
	const usernameInput = document.getElementById('username');
	const loadProfileBtn = document.getElementById('loadProfile');
	const repoNameInput = document.getElementById('repoName');
	const projectNameInput = document.getElementById('projectName');
	const projectDescriptionInput =
		document.getElementById('projectDescription');
	const projectColorInput = document.getElementById('projectColor');
	const projectColorValue = document.querySelector('.color-value');
	const borderColorInput = document.getElementById('borderColor');
	const borderColorValue = borderColorInput.nextElementSibling;
	const bgColorInput = document.getElementById('bgColor');
	const bgColorValue = bgColorInput.nextElementSibling;
	const projectLogoInput = document.getElementById('projectLogo');
	const projectLogoFileName = document.getElementById('projectLogoFileName');
	const bgImageInput = document.getElementById('bgImage');
	const bgImageFileName = document.getElementById('bgImageFileName');
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

	// Actualizar valores de color
	function updateColorValue(input, display) {
		display.textContent = input.value;
	}

	projectColorInput.addEventListener('input', () => {
		updateColorValue(projectColorInput, projectColorValue);
	});

	borderColorInput.addEventListener('input', () => {
		updateColorValue(borderColorInput, borderColorValue);
	});

	bgColorInput.addEventListener('input', () => {
		updateColorValue(bgColorInput, bgColorValue);
	});

	// Mostrar nombre de archivo seleccionado
	projectLogoInput.addEventListener('change', function () {
		projectLogoFileName.textContent = this.files[0]
			? this.files[0].name
			: 'No file chosen';
	});

	bgImageInput.addEventListener('change', function () {
		bgImageFileName.textContent = this.files[0]
			? this.files[0].name
			: 'No file chosen';
	});

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
		bgImageFileName.textContent = 'No file chosen';
	});

	// Load GitHub profile
	loadProfileBtn.addEventListener('click', function () {
		const username = usernameInput.value.trim();
		if (username) {
			// Mostrar indicador de carga
			loadProfileBtn.innerHTML =
				'<i class="fas fa-spinner fa-spin"></i> Loading...';
			loadProfileBtn.disabled = true;

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

					// Restablecer botón
					loadProfileBtn.innerHTML =
						'<i class="fas fa-download"></i> Load';
					loadProfileBtn.disabled = false;

					// Mostrar notificación de éxito
					showNotification('Profile loaded successfully', 'success');
				})
				.catch((error) => {
					// Restablecer botón
					loadProfileBtn.innerHTML =
						'<i class="fas fa-download"></i> Load';
					loadProfileBtn.disabled = false;

					// Mostrar notificación de error
					showNotification('Error: ' + error.message, 'error');
				});
		} else {
			showNotification('Please enter a GitHub username', 'warning');
		}
	});

	// Inicializar valores de color
	updateColorValue(projectColorInput, projectColorValue);
	updateColorValue(borderColorInput, borderColorValue);
	updateColorValue(bgColorInput, bgColorValue);

	// Update card based on inputs
	generateCardBtn.addEventListener('click', function () {
		const oldText = generateCardBtn.innerHTML;
		generateCardBtn.innerHTML =
			'<i class="fas fa-spinner fa-spin"></i> Updating...';
		generateCardBtn.disabled = true;

		setTimeout(() => {
			updateCard();
			generateCardBtn.innerHTML = oldText;
			generateCardBtn.disabled = false;
			showNotification('Card updated successfully', 'success');
		}, 500);
	});

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

		// Let the card fill its container naturally
		githubCard.style.width = '100%';
		githubCard.style.height = '100%';

		// Verificar si hay elemento de usuario y asegurarse de que sea visible
		if (displayUsername) {
			displayUsername.style.display = 'block';
		}

		const cardContainer = document.getElementById('cardContainer');
		cardContainer.style.borderBottomColor = borderColorInput.value;
	}

	window.addEventListener('resize', function () {
		adjustCardScale();
	});

	function adjustCardScale() {
		const cardContainer = document.getElementById('cardContainer');
		const card = document.getElementById('githubCard');
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

	// Reemplaza el evento de descarga actual con esta versión mejorada
	downloadCardBtn.addEventListener('click', function () {
		const card = document.getElementById('githubCard');
		const cardContainer = document.getElementById('cardContainer');
		const cardWrapper = document.createElement('div');

		// Cambiar texto del botón
		const oldText = downloadCardBtn.innerHTML;
		downloadCardBtn.innerHTML =
			'<i class="fas fa-spinner fa-spin"></i> Generating...';
		downloadCardBtn.disabled = true;

		// Clonar la tarjeta para manipularla sin afectar la original
		const cardClone = card.cloneNode(true);

		// Estilos para el contenedor temporal
		cardWrapper.style.position = 'fixed';
		cardWrapper.style.top = '-9999px';
		cardWrapper.style.left = '-9999px';
		cardWrapper.style.width = '1280px';
		cardWrapper.style.height = '640px';
		cardWrapper.style.overflow = 'hidden';
		cardWrapper.style.zIndex = '-1';
		cardWrapper.style.boxSizing = 'border-box';
		cardWrapper.style.borderBottom = `3rem solid ${getComputedStyle(
			document.documentElement
		)
			.getPropertyValue('--border-color')
			.trim()}`;
		cardWrapper.style.backgroundColor = 'var(--bg-color)';

		cardClone.style.width = '100%';
		cardClone.style.height = 'calc(100% - 2rem)';
		cardClone.style.maxWidth = 'none';
		cardClone.style.margin = '0';
		cardClone.style.padding = '0';
		cardClone.style.boxShadow = 'none';
		cardClone.style.position = 'relative';

		// Obtener todos los estilos computados originales para aplicarlos al clon
		const originalStyles = window.getComputedStyle(card);

		// Configurar el clon con dimensiones exactas pero manteniendo estilos originales
		cardClone.style.width = '100%';
		cardClone.style.height = '100%';
		cardClone.style.maxWidth = 'none';
		cardClone.style.margin = '0';
		cardClone.style.padding = '40pt 40pt 0 40pt';
		cardClone.style.boxShadow = 'none';
		cardClone.style.position = 'relative';
		cardClone.style.backgroundColor = originalStyles.backgroundColor;
		cardClone.style.backgroundImage = originalStyles.backgroundImage;
		cardClone.style.backgroundSize = originalStyles.backgroundSize;
		cardClone.style.backgroundPosition = originalStyles.backgroundPosition;

		const scaleFactor = 1.5;

		const originalHeader = card.querySelector('.card-header');
		const cloneHeader = cardClone.querySelector('.card-header');
		const headerStyles = window.getComputedStyle(originalHeader);
		cloneHeader.style.padding = `${
			parseInt(headerStyles.paddingTop) * scaleFactor
		}px ${parseInt(headerStyles.paddingRight) * scaleFactor}px`;
		cloneHeader.style.height = `${
			parseInt(headerStyles.height) * scaleFactor
		}px`;

		const originalFooter = card.querySelector('.card-footer');
		const cloneFooter = cardClone.querySelector('.card-footer');
		const footerStyles = window.getComputedStyle(originalFooter);
		cloneFooter.style.paddingLeft = `${
			parseInt(footerStyles.paddingLeft) * scaleFactor
		}px`;
		cloneFooter.style.paddingBottom = `${
			parseInt(footerStyles.paddingBottom) * scaleFactor
		}px`;
		cloneFooter.style.minHeight = `${
			parseInt(footerStyles.minHeight) * scaleFactor
		}px`;

		const borderWidth = parseInt(
			getComputedStyle(document.documentElement)
				.getPropertyValue('--border-color')
				.trim()
		);

		const originalBody = card.querySelector('.card-body');
		const cloneBody = cardClone.querySelector('.card-body');
		const bodyStyles = window.getComputedStyle(originalBody);
		cloneBody.style.padding = `${
			parseInt(bodyStyles.padding) * scaleFactor
		}px`;

		const elements = {
			repoName: { original: '#displayRepoName', fontSize: 2.5 },
			username: { original: '#displayUsername', fontSize: 2.0 },
			projectName: { original: '#displayProjectName', fontSize: 4.0 },
			description: {
				original: '#displayDescription',
				fontSize: 2.0,
				lineHeight: 1.6,
			},
		};

		for (const [key, config] of Object.entries(elements)) {
			const originalElement = card.querySelector(config.original);
			const cloneElement = cardClone.querySelector(config.original);

			if (originalElement && cloneElement) {
				const originalStyles = window.getComputedStyle(originalElement);
				cloneElement.style.fontSize = `${config.fontSize}rem`;

				if (config.lineHeight) {
					cloneElement.style.lineHeight = `${config.lineHeight}`;
				}

				// Mantener otros estilos como color, etc.
				cloneElement.style.color = originalStyles.color;
				cloneElement.style.fontWeight = originalStyles.fontWeight;
			}
		}

		const images = {
			githubLogo: {
				selector: '.github-logo',
				width: 60,
				height: 60,
				marginRight: 20,
			},
			profilePic: { selector: '.profile-pic', width: 80, height: 80 },
			projectLogo: {
				selector: '.project-logo',
				width: 120,
				height: 120,
				borderRadius: 10,
			},
		};

		for (const [key, config] of Object.entries(images)) {
			const cloneImage = cardClone.querySelector(config.selector);
			if (cloneImage) {
				cloneImage.style.width = `${config.width}px`;
				cloneImage.style.height = `${config.height}px`;

				if (config.marginRight) {
					cloneImage.style.marginRight = `${config.marginRight}px`;
				}

				if (config.borderRadius) {
					cloneImage.style.borderRadius = `${config.borderRadius}px`;
				}
			}
		}

		const cloneLogoContainer = cardClone.querySelector('.logo-container');
		if (cloneLogoContainer) {
			cloneLogoContainer.style.position = 'absolute';
			cloneLogoContainer.style.bottom = '30px';
			cloneLogoContainer.style.right = '40px';
		}

		// Agregar el clon al contenedor y el contenedor al body
		cardWrapper.appendChild(cardClone);
		document.body.appendChild(cardWrapper);

		// Capturar la imagen después de un pequeño retraso
		setTimeout(() => {
			html2canvas(cardWrapper, {
				scale: 1,
				backgroundColor: null,
				logging: false,
				useCORS: true,
				allowTaint: true,
				width: 1280,
				height: 640,
			})
				.then((canvas) => {
					// Descargar la imagen
					const link = document.createElement('a');
					link.download = 'github-project-card.png';
					link.href = canvas.toDataURL('image/png');
					link.click();

					// Limpiar: eliminar el clon
					document.body.removeChild(cardWrapper);

					// Restaurar texto del botón
					downloadCardBtn.innerHTML = oldText;
					downloadCardBtn.disabled = false;
					showNotification('Card downloaded successfully', 'success');
				})
				.catch((error) => {
					// Limpiar en caso de error
					if (document.body.contains(cardWrapper)) {
						document.body.removeChild(cardWrapper);
					}

					downloadCardBtn.innerHTML = oldText;
					downloadCardBtn.disabled = false;
					showNotification(
						'Error generating image: ' + error.message,
						'error'
					);
				});
		}, 300); // Tiempo de espera aumentado para asegurar la renderización completa
	});

	// Función para mostrar notificaciones
	function showNotification(message, type) {
		// Eliminar notificaciones anteriores
		const oldNotification = document.querySelector('.notification');
		if (oldNotification) {
			oldNotification.remove();
		}

		const notification = document.createElement('div');
		notification.className = `notification ${type}`;

		let icon = '';
		switch (type) {
			case 'success':
				icon = '<i class="fas fa-check-circle"></i>';
				break;
			case 'error':
				icon = '<i class="fas fa-exclamation-circle"></i>';
				break;
			case 'warning':
				icon = '<i class="fas fa-exclamation-triangle"></i>';
				break;
		}

		notification.innerHTML = `${icon} ${message}`;
		document.body.appendChild(notification);

		// Aparecer con animación
		setTimeout(() => {
			notification.classList.add('show');
		}, 10);

		// Desaparecer después de 3 segundos
		setTimeout(() => {
			notification.classList.remove('show');
			setTimeout(() => {
				notification.remove();
			}, 300);
		}, 3000);
	}

	// Añadir CSS para notificaciones
	const style = document.createElement('style');
	style.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 6px;
            color: white;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transform: translateY(-20px);
            opacity: 0;
            transition: all 0.3s ease;
            z-index: 1000;
        }
        
        .notification.show {
            transform: translateY(0);
            opacity: 1;
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
    `;
	document.head.appendChild(style);
	adjustCardScale();
});
