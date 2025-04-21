# GitHub Project Card Generator: GitCardX

<div align="center">

![Version](https://img.shields.io/badge/version-2.0.1-blue.svg?cacheSeconds=2592000)
![Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![HTML](https://img.shields.io/badge/HTML-5-orange.svg)
![CSS](https://img.shields.io/badge/CSS-3-blue.svg)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6-yellow.svg)
![Responsive](https://img.shields.io/badge/Responsive-Yes-green.svg)

</div>

<div align="center">
  <h1>GitCardX</h1>
    <img src="assets/logo/github-card-generator.webp" alt="GitHub Card Generator Logo" width="100">
</div>

Una herramienta web para generar atractivas tarjetas de presentación para tus proyectos de GitHub.
Personaliza, previsualiza y descarga tarjetas en formato PNG con facilidad.

## ✨ Demo

<p align="center">
  <img src="./assets/mockup/desktop.png" alt="Ejemplo de tarjeta generada" width="640">
</p>

## 🚀 Características

-   **Personalización completa** de colores, texto e imágenes
-   **Carga automática** de información de perfil de GitHub
-   **Vista previa en tiempo real** mientras editas
-   **Descarga en formato PNG** de alta calidad (1280x640px)
-   **Diseño responsivo** funcional en dispositivos móviles y de escritorio
-   **Interfaz intuitiva** y fácil de usar

## 💻 Tecnologías utilizadas

-   HTML5
-   CSS3
-   JavaScript (ES6+)
-   [html2canvas](https://html2canvas.hertzen.com/) - Para convertir el HTML a imagen
-   [Font Awesome](https://fontawesome.com/) - Para los iconos de interfaz
-   [Google Fonts](https://fonts.google.com/) - Fuentes web Roboto

## 📋 Prerrequisitos

-   Navegador web moderno (Chrome, Firefox, Edge, Safari)
-   Conexión a internet para cargar perfiles de GitHub

## 🔧 Instalación y configuración local

1. Clona el repositorio:

```bash
git clone https://github.com/sandovaldavid/github-project-card-generator.git
```

2. Navega al directorio del proyecto:

```bash
cd github-project-card-generator
```

3. Abre el archivo index.html en tu navegador o usa un servidor local:

```bash
# Si tienes Python instalado
python -m http.server 8000

# Si tienes Node.js instalado
npx serve
```

## 📘 Cómo usar

1. **Información de GitHub**

    - Introduce tu nombre de usuario de GitHub y haz clic en "Load" para cargar automáticamente tu
      imagen de perfil.

2. **Información del proyecto**

    - Añade el nombre del repositorio, nombre del proyecto y una descripción.

3. **Personalización**

    - Selecciona colores para el nombre del proyecto, borde inferior y fondo.
    - Sube el logo de tu proyecto (opcional).
    - Añade una imagen de fondo personalizada (opcional).

4. **Previsualización**

    - Verifica cómo se ve tu tarjeta en la sección de vista previa.
    - Haz clic en "Update Card" para aplicar los cambios.

5. **Descarga**
    - Haz clic en "Download as PNG" para guardar tu tarjeta como imagen.

## 🎨 Personalización

La tarjeta tiene dimensiones de 1280x640px, con un área visible de relación 2:1. Las opciones de
personalización incluyen:

-   **Colores**: Fondo, borde inferior y texto del nombre del proyecto
-   **Imágenes**: Logo del proyecto y fondo personalizado
-   **Texto**: Nombre de usuario, nombre del repositorio, nombre del proyecto y descripción

## 🌐 Despliegue

Este proyecto puede desplegarse en cualquier servicio de alojamiento web estático:

### GitHub Pages

1. Haz fork de este repositorio
2. Activa GitHub Pages desde la configuración del repositorio
3. Selecciona la rama `main` como fuente

### Netlify

1. Regístrate en [Netlify](https://www.netlify.com/)
2. Arrastra y suelta la carpeta del proyecto o conecta con tu repositorio de GitHub
3. ¡Listo! Netlify generará una URL para tu aplicación

### Vercel

```bash
# Instala Vercel CLI
npm i -g vercel

# Despliega
vercel
```

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Para contribuir:

1. Haz un fork del proyecto
2. Crea una rama para tu función (`git checkout -b feature/amazing-feature`)
3. Haz commit de tus cambios (`git commit -m 'Add some amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## 📜 Licencia

Este proyecto está licenciado bajo la Licencia MIT - consulta el archivo LICENSE para más detalles.

## ✍️ Autor

**David Sandoval**

-   GitHub: [@sandovaldavid](https://github.com/sandovaldavid)
-   LinkedIn: [@devsandoval](https://linkedin.com/in/devsandoval)
-   Email: [contact@devsandoval.me](mailto:contact@devsandoval.me)

## 📌 Notas adicionales

-   La aplicación utiliza la API pública de GitHub para cargar información del perfil
-   Las imágenes se procesan localmente sin subirse a ningún servidor
-   Asegúrate de tener una conexión a internet estable al cargar perfiles de GitHub

---

<div align="center">
  <p>
    ¿Te gusta este proyecto? ¡Dale una ⭐️!
  </p>
  <p>
    © 2025 GitHub Project Card Generator
  </p>
</div>
