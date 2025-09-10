# Hostelería Hub Connect

Una plataforma integral para la industria de la hostelería que conecta proveedores, servicios y comunidades del sector.

## Características principales

- 🏪 **Marketplace de productos y servicios** para hostelería
- 👥 **Comunidades especializadas** por categorías
- 💬 **Sistema de mensajería** integrado
- 📊 **Gestión de transacciones** y pagos
- 🎓 **Sección educativa** con cursos y recursos
- 📱 **Interfaz responsive** y moderna

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/4b7a55d6-1139-40d3-9475-f514f1efc903) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## 🚀 Despliegue

### Netlify (Recomendado)

1. Ve a [Netlify.com](https://netlify.com) y haz login
2. Haz clic en "Add new site" → "Import an existing project"
3. Conecta con GitHub y selecciona el repositorio `rest_ai`
4. Netlify detectará automáticamente la configuración del `netlify.toml`
5. Los ajustes serán:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: `18`

### Variables de entorno

Si necesitas configurar variables de entorno (como claves de Supabase):
- Ve a Site settings → Environment variables en Netlify
- Agrega las variables necesarias

## 🔗 Enlaces

- **Repositorio**: https://github.com/SegurNeo/rest_ai
- **Despliegue**: [Configurar en Netlify](https://netlify.com)
