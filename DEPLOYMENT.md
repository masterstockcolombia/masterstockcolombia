# Guía de Despliegue - MasterStock Colombia

Esta guía te ayudará a desplegar la página web de MasterStock Colombia en diferentes plataformas.

## 🚀 Opciones de Despliegue

### 1. GitHub Pages (Recomendado)

GitHub Pages es una opción gratuita y fácil para hospedar sitios web estáticos.

#### Pasos para desplegar:

1. **Sube el código a GitHub:**
   ```bash
   # Si aún no tienes un repositorio remoto
   git remote add origin https://github.com/tu-usuario/masterstock-colombia.git
   git branch -M main
   git push -u origin main
   ```

2. **Configura GitHub Pages:**
   - Ve a tu repositorio en GitHub
   - Haz clic en "Settings" (Configuración)
   - Desplázate hasta "Pages" en el menú lateral
   - En "Source", selecciona "GitHub Actions"

3. **Crea el archivo de workflow:**
   Crea el archivo `.github/workflows/deploy.yml`:
   ```yaml
   name: Deploy to GitHub Pages

   on:
     push:
       branches: [ main ]
     pull_request:
       branches: [ main ]

   jobs:
     build-and-deploy:
       runs-on: ubuntu-latest
       steps:
       - name: Checkout
         uses: actions/checkout@v4

       - name: Setup Node.js
         uses: actions/setup-node@v4
         with:
           node-version: '18'
           cache: 'npm'

       - name: Install dependencies
         run: npm ci

       - name: Build
         run: npm run build

       - name: Setup Pages
         uses: actions/configure-pages@v4

       - name: Upload artifact
         uses: actions/upload-pages-artifact@v3
         with:
           path: './dist'

       - name: Deploy to GitHub Pages
         id: deployment
         uses: actions/deploy-pages@v4
   ```

4. **Configura permisos:**
   - En Settings > Actions > General
   - En "Workflow permissions", selecciona "Read and write permissions"
   - Marca "Allow GitHub Actions to create and approve pull requests"

5. **Tu sitio estará disponible en:**
   `https://tu-usuario.github.io/masterstock-colombia/`

### 2. Netlify

Netlify ofrece despliegue continuo y es muy fácil de configurar.

#### Pasos para desplegar:

1. **Conecta tu repositorio:**
   - Ve a [netlify.com](https://netlify.com)
   - Haz clic en "New site from Git"
   - Conecta tu cuenta de GitHub
   - Selecciona el repositorio `masterstock-colombia`

2. **Configura el build:**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: `18`

3. **Despliega:**
   - Haz clic en "Deploy site"
   - Tu sitio estará disponible en una URL como `https://amazing-name-123456.netlify.app`

### 3. Vercel

Vercel es otra excelente opción para despliegue de aplicaciones React.

#### Pasos para desplegar:

1. **Conecta tu repositorio:**
   - Ve a [vercel.com](https://vercel.com)
   - Haz clic en "New Project"
   - Importa tu repositorio de GitHub

2. **Configura el proyecto:**
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Despliega:**
   - Haz clic en "Deploy"
   - Tu sitio estará disponible en una URL como `https://masterstock-colombia.vercel.app`

## 🔧 Configuración Adicional

### Variables de Entorno

Si necesitas configurar variables de entorno (como URLs de API), crea un archivo `.env`:

```env
VITE_API_URL=https://api.masterstockcolombia.com
VITE_CONTACT_EMAIL=negocios@masterstockcolombia.com
```

### Dominio Personalizado

#### Para GitHub Pages:
1. Agrega un archivo `CNAME` en la carpeta `public/` con tu dominio:
   ```
   www.masterstockcolombia.com
   ```

#### Para Netlify/Vercel:
1. Ve a la configuración del sitio
2. Agrega tu dominio personalizado
3. Configura los registros DNS según las instrucciones

### Optimizaciones de SEO

El sitio ya incluye:
- Meta tags optimizados
- Estructura semántica HTML5
- Títulos descriptivos
- Alt text en imágenes

Para mejorar aún más el SEO:
1. Agrega un `sitemap.xml`
2. Configura Google Analytics
3. Agrega Schema.org markup

## 📊 Monitoreo y Analytics

### Google Analytics

1. Crea una cuenta en [Google Analytics](https://analytics.google.com)
2. Obtén tu ID de medición (GA4)
3. Agrega el código de seguimiento al `index.html`

### Google Search Console

1. Ve a [Google Search Console](https://search.google.com/search-console)
2. Agrega tu sitio web
3. Verifica la propiedad
4. Envía tu sitemap

## 🛠️ Mantenimiento

### Actualizaciones

Para actualizar el sitio:
1. Haz cambios en el código
2. Haz commit y push a GitHub
3. El despliegue se actualizará automáticamente

### Backup

- El código está respaldado en GitHub
- Los archivos de build se generan automáticamente
- Considera hacer backups de la configuración de DNS

## 📞 Soporte

Si tienes problemas con el despliegue:
1. Revisa los logs de build en la plataforma
2. Verifica que todas las dependencias estén instaladas
3. Asegúrate de que el comando de build funcione localmente

---

¡Tu sitio web de MasterStock Colombia estará en línea y listo para recibir visitantes!
