/**
 * MÓDULO CONFIGURAÇÕES - Router
 */

import { Router } from 'express';
import { IDatabaseConnection } from '@/infrastructure/database/IDatabaseConnection';
import { ModulosController } from './ModulosController';

export function createConfiguracoesRouter(db: IDatabaseConnection): Router {
  const router = Router();

  // Injeção de dependências
  const modulosController = new ModulosController(db);

  // Rotas de gestão de módulos
  router.get('/modulos', modulosController.getMyModules);
  router.post('/modulos/:moduleKey/toggle', modulosController.toggleModuleState);
  router.get('/modulos/stats', modulosController.getModuleStats);

  return router;
}
