# 🌍 MathWorld – Videojuego Educativo de Matemáticas

> Aprende matemáticas explorando mundos mágicos llenos de diversión y desafíos.

![MathWorld Banner](assets/images/banner.png)

---

## 📋 Descripción

**MathWorld** es un videojuego educativo web diseñado para fortalecer habilidades matemáticas básicas en niños con **discalculia** entre los **7 y 10 años**. Utiliza actividades lúdicas, multisensoriales e interactivas para crear un entorno de aprendizaje positivo y motivador.

### 🎯 Objetivos Educativos
- ✅ Reconocimiento numérico
- ✅ Conteo secuencial
- ✅ Asociación número-cantidad
- ✅ Operaciones básicas (suma y resta)
- ✅ Resolución de problemas simples

---

## 🚀 Demo en Vivo

**[▶ Jugar ahora en GitHub Pages](https://tu-usuario.github.io/MathWorld)**

---

## 🌟 Características Principales

| Característica | Descripción |
|---|---|
| 🎮 5 Mundos | Bosque, Montaña, Isla, Laboratorio, Ciudad |
| 🧩 25 Minijuegos | 5 juegos únicos por mundo |
| 👥 6 Personajes | Numi, Luna, Max, Pixel, Tina, Rayo |
| 🏆 Sistema de Logros | Puntos, XP, estrellas, medallas |
| 📱 Responsive | PC, tablet y celular |
| 💾 Guardado Auto | localStorage sin necesidad de cuenta |
| ♿ Accesible | Botones grandes, instrucciones narradas |
| 🎵 Audio | Música sintética y efectos de sonido |

---

## 🗂️ Estructura del Proyecto

```
MathWorld/
│
├── assets/
│   ├── audio/          # Archivos de audio (opcional)
│   ├── fonts/          # Fuentes locales (opcional)
│   ├── icons/          # Íconos del juego
│   ├── images/         # Imágenes y sprites
│   ├── videos/         # Videos introductorios (opcional)
│   └── models3d/       # Modelos 3D adicionales (opcional)
│
├── css/
│   ├── style.css       # Estilos principales
│   ├── animations.css  # Keyframes y animaciones
│   └── responsive.css  # Media queries responsive
│
├── js/
│   ├── main.js         # Controlador principal
│   ├── audio.js        # Gestión de audio (Web Audio API)
│   ├── characters.js   # Personajes y frases motivacionales
│   ├── levels.js       # Motor de minijuegos (25 juegos)
│   ├── progress.js     # Sistema de puntos, XP y recompensas
│   ├── worlds.js       # Definición y renderizado de mundos
│   └── storage.js      # Guardado en localStorage
│
├── worlds/             # Recursos específicos por mundo
│   ├── world1/         # Bosque de los Números
│   ├── world2/         # Montaña de las Secuencias
│   ├── world3/         # Isla de las Cantidades
│   ├── world4/         # Laboratorio de Operaciones
│   └── world5/         # Ciudad de los Retos
│
├── index.html          # Punto de entrada principal
├── README.md           # Este archivo
└── package.json        # Metadatos del proyecto
```

---

## 🛠️ Tecnologías Utilizadas

| Tecnología | Uso |
|---|---|
| HTML5 + CSS3 | Estructura y estilos |
| JavaScript Vanilla | Lógica del juego |
| [Three.js r128](https://threejs.org/) | Esferas 3D flotantes en el menú |
| [GSAP 3.12](https://greensock.com/gsap/) | Animaciones fluidas |
| [Howler.js 2.2](https://howlerjs.com/) | (Integrado como fallback) |
| Web Audio API | Música y efectos sintéticos |
| [Particles.js 2.0](https://vincentgarreau.com/particles.js/) | Partículas en el menú |
| Canvas API | Minijuegos interactivos |

---

## 📦 Instalación y Ejecución Local

### Opción 1: Directamente en el navegador
```bash
# Simplemente abre index.html en cualquier navegador moderno
open index.html
```

### Opción 2: Con servidor local (recomendado)
```bash
# Con Node.js
npx serve .

# O con Python
python -m http.server 8080

# Luego abre: http://localhost:8080
```

### Opción 3: Con npm
```bash
npm install
npm start
```

---

## 🌐 Despliegue en GitHub Pages

1. **Sube el proyecto a GitHub:**
```bash
git init
git add .
git commit -m "🚀 Initial commit: MathWorld v1.0.0"
git remote add origin https://github.com/TU-USUARIO/MathWorld.git
git push -u origin main
```

2. **Activa GitHub Pages:**
   - Ve a tu repositorio → **Settings** → **Pages**
   - En *Source*, selecciona **main branch** / **root**
   - Guarda y espera ~2 minutos

3. **Tu juego estará en:**
   ```
   https://TU-USUARIO.github.io/MathWorld
   ```

---

## 🎮 Cómo Jugar

1. **Pantalla Inicial** → Ingresa tu nombre y apellido
2. **Elige tu edad** → 7, 8, 9 o 10 años (ajusta la dificultad)
3. **Elige tu personaje** → Uno de 6 compañeros únicos
4. **Explora el mapa** → 5 mundos temáticos
5. **Juega minijuegos** → 5 juegos por mundo = 25 en total
6. **Gana recompensas** → Estrellas, puntos y medallas
7. **Desbloquea mundos** → Completa 3 niveles para avanzar

---

## 🌍 Los 5 Mundos

### 🌲 Mundo 1: Bosque de los Números
- Atrapa el Número Correcto
- Revienta Globos Numerados
- Arrastra Números a Cajas
- Encuentra Números Escondidos
- Escucha y Selecciona

### 🏔️ Mundo 2: Montaña de las Secuencias
- Completa la Secuencia
- Cadena de Conteo
- Organiza Números (menor a mayor)
- Camino Numérico
- Carrera Contra el Reloj

### 🏝️ Mundo 3: Isla de las Cantidades
- ¿Cuántos Hay?
- Alimenta al Animal
- Cuenta los Elementos
- Empareja las Tarjetas
- Rompecabezas de Cantidades

### 🔬 Mundo 4: Laboratorio de Operaciones
- Abre la Puerta (operaciones)
- Máquina Matemática
- Suma Arrastrando Objetos
- Resta Visual
- Batalla Matemática Amigable

### 🏙️ Mundo 5: Ciudad de los Retos
- La Tiendita (compras)
- Problema del Día
- Ayuda al Amigo
- Elige la Respuesta Correcta
- Gran Reto Final

---

## 👥 Los 6 Personajes

| Personaje | Emoji | Especialidad |
|---|---|---|
| **Numi** | 🤖 | Robot experto en números |
| **Luna** | ✨ | Exploradora espacial |
| **Max**  | 🦁 | León motivador |
| **Pixel**| 👾 | Experto en patrones |
| **Tina** | 🐢 | Enseña paso a paso |
| **Rayo** | ⚡ | Retos de velocidad |

---

## ♿ Accesibilidad

- Botones grandes (mínimo 48×48px en móvil)
- Síntesis de voz para instrucciones (`Web Speech API`)
- Fuentes legibles y tamaño mínimo 14px
- Colores con buen contraste
- Animaciones reducibles (`prefers-reduced-motion`)
- Sin castigos frustrantes (vidas, no "Game Over" agresivo)
- Retroalimentación visual Y sonora inmediata

---

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama: `git checkout -b feature/nueva-funcionalidad`
3. Commit: `git commit -m '✨ Agrega nueva funcionalidad'`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Abre un Pull Request

---

## 📄 Licencia

MIT License — Libre para uso educativo y personal.

---

## 💛 Créditos

Desarrollado con ❤️ para apoyar el aprendizaje de niños con discalculia.

**Fuentes:** Google Fonts (Fredoka, Baloo 2, Poppins)  
**Íconos:** Emojis Unicode estándar  
**Librerías:** Three.js, GSAP, Particles.js (CDN)

---

*"Cada niño aprende a su propio ritmo. MathWorld respeta ese ritmo." 🌟*
