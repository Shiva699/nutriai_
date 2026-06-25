import { build } from 'vite';
import react from '@vitejs/plugin-react-swc';

await build({
  configFile: false,
  root: process.cwd(),
  plugins: [react()],
});
