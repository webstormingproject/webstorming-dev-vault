// Exemple si WebStorming OS est reconstruit avec Vite pour GitHub Pages.
// Important : le dépôt est publié dans /webstorming-dev-vault/.
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/webstorming-dev-vault/',
  build: {
    sourcemap: true
  }
});
