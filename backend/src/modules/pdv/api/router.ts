import { Router } from 'express';
import { PdvController } from './PdvController';

export function createPdvRouter(): Router {
  const router = Router();
  const controller = new PdvController();

  router.post('/vendas', (req, res) => controller.createVenda(req, res));
  router.get('/vendas', (req, res) => controller.listVendas(req, res));

  return router;
}
