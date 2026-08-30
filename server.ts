import 'dotenv/config';
import express from 'express';
import path from 'path';
import apiRouter from './server/routes';

const isProd = process.env.NODE_ENV === 'production';
const port = Number(process.env.PORT) || 3000;

async function createServer() {
  const app = express();
  app.use(express.json());
  app.use('/api', apiRouter);

  if (!isProd) {
    // Em desenvolvimento, o Vite roda em modo middleware dentro do próprio
    // Express, servindo o frontend e a API na mesma porta (sem CORS).
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
  });
}

createServer();
