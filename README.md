# Spelling Bee Oral Trainer (PWA)

Una aplicación web progresiva (PWA) interactiva diseñada para practicar el **deletreo oral en inglés**, basada en las reglas del **6th Spelling Bee Contest 2026**.

La aplicación permite practicar el deletreo letra por letra mediante **reconocimiento de voz**, escuchar la palabra objetivo, utilizar un cronómetro de competencia y recibir retroalimentación inmediata sobre el resultado.

---

## Demo

🚀 [Probar Spelling Bee Oral Trainer](https://clariveljn.github.io/spelling-bee-app/)

Puedes probar la aplicación directamente desde el navegador, sin necesidad de instalar dependencias.

> 🎤 La aplicación requiere permisos de micrófono para utilizar el reconocimiento de voz.

### PWA

La aplicación puede instalarse en dispositivos compatibles y utilizarse como una aplicación web progresiva.

---

## Objetivo del proyecto

Crear una herramienta de práctica sencilla y accesible que permita a los participantes prepararse para una competencia de spelling bee mediante ejercicios que simulan diferentes condiciones de las rondas del concurso.

---

## Características principales

* **Reconocimiento oral (`SpeechRecognition`):** permite deletrear la palabra mediante la voz y comparar las letras reconocidas con la respuesta esperada.
* **Síntesis de voz (`SpeechSynthesis`):** reproduce la palabra objetivo en inglés americano (`en-US`) para facilitar la práctica auditiva.
* **3 modos de práctica adaptados a las rondas:**

  * **Ronda 1:** la palabra permanece visible durante toda la práctica.
  * **Ronda 2 — Flashcard:** la palabra se muestra durante 2,5 segundos y luego se oculta.
  * **Ronda 3 — A ciegas:** la palabra permanece completamente oculta y la práctica se basa en la comprensión auditiva.
* **Cronómetro de competencia:** temporizador de 45 segundos por palabra con alertas visuales cuando el tiempo está por finalizar.
* **Refuerzo y repetición:** las palabras falladas o cuyo tiempo expira se vuelven a incorporar automáticamente al final de la cola.
* **Métricas de rendimiento:** resumen final con la tasa de aciertos obtenidos en la primera aparición de cada palabra.
* **PWA instalable:** puede instalarse como aplicación desde dispositivos compatibles.
* **Diseño responsive:** adaptado para su uso en computadores, tablets y dispositivos móviles.

---

## Tecnologías utilizadas

* **Framework:** [React](https://react.dev/)
* **Build Tool:** [Vite](https://vitejs.dev/)
* **Estilos:** [Tailwind CSS v4](https://tailwindcss.com/)
* **PWA & Service Worker:** [`vite-plugin-pwa`](https://vite-pwa-org.netlify.app/)
* **APIs nativas del navegador:** Web Speech API (`SpeechRecognition` y `SpeechSynthesis`)
* **Despliegue:** GitHub Pages mediante `gh-pages`

---

## Instalación y desarrollo local

### 1. Clonar el repositorio

```bash
git clone https://github.com/Clariveljn/spelling-bee-app.git
cd spelling-bee-app
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Ejecutar el servidor de desarrollo

```bash
npm run dev
```

### 4. Compilar para producción

```bash
npm run build
```

---

## Despliegue en GitHub Pages

Para publicar los últimos cambios en la rama `gh-pages`:

```bash
npm run deploy
```

---

## Instalación en dispositivos móviles

1. Abre la aplicación mediante HTTPS desde un navegador compatible.
2. Concede los permisos de micrófono cuando sean solicitados.
3. En Android, abre el menú del navegador y selecciona **"Instalar aplicación"** o **"Agregar a la pantalla de inicio"**.
4. En iOS, utiliza el menú **Compartir** de Safari y selecciona **"Agregar a pantalla de inicio"**.

> **Nota:** El reconocimiento de voz mediante `SpeechRecognition` depende de la compatibilidad del navegador con la Web Speech API. La experiencia puede variar según el dispositivo y navegador utilizado.


