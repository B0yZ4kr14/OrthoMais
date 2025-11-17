import { Router } from 'express';
import { PepController } from './PepController';

export function createPepRouter(): Router {
  const router = Router();
  const controller = new PepController();

  router.post('/prontuarios', (req, res) => controller.createProntuario(req, res));
  router.get('/prontuarios/patient/:patientId', (req, res) => controller.listProntuariosByPatient(req, res));
  router.post('/prontuarios/:id/assinar', (req, res) => controller.assinarDigitalmente(req, res));

  return router;
}
