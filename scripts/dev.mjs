import { createServer } from 'vite';
import react from '@vitejs/plugin-react-swc';

const host = process.env.HOST || '127.0.0.1';
const port = Number(process.env.PORT || 4173);

const server = await createServer({
  configFile: false,
  root: process.cwd(),
  plugins: [react()],
  server: {
    host,
    port,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});

await server.listen();
server.printUrls();
