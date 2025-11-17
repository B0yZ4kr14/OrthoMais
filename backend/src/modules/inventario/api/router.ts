/**
 * MÓDULO INVENTÁRIO - Router
 */

import { Router } from 'express';
import { IDatabaseConnection } from '@/infrastructure/database/IDatabaseConnection';
import { ProdutoRepositoryPostgres } from '../infrastructure/repositories/ProdutoRepositoryPostgres';
import { InventarioController } from './InventarioController';

export function createInventarioRouter(db: IDatabaseConnection): Router {
  const router = Router();

  // Injeção de dependências
  const produtoRepository = new ProdutoRepositoryPostgres(db);
  const controller = new InventarioController(produtoRepository);

  // Rotas
  router.post('/produtos', controller.cadastrarProduto);
  router.get('/produtos', controller.listarProdutos);
  router.get('/produtos/:id', controller.obterProduto);

  return router;
}
