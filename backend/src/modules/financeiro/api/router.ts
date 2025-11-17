import { Router } from 'express';
import { FinanceiroController } from './FinanceiroController';

export function createFinanceiroRouter(): Router {
  const router = Router();
  const controller = new FinanceiroController();

  router.post('/transactions', (req, res) => controller.createTransaction(req, res));
  router.get('/transactions', (req, res) => controller.listTransactions(req, res));
  router.patch('/transactions/:id/pay', (req, res) => controller.markTransactionAsPaid(req, res));
  router.get('/cash-flow', (req, res) => controller.getCashFlow(req, res));

  return router;
}
