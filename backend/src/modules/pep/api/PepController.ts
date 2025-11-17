import { Request, Response } from 'express';
import { z } from 'zod';
import { logger } from '@/infrastructure/logger';

const createProntuarioSchema = z.object({
  patientId: z.string().uuid(),
  dentistaId: z.string().uuid(),
  dataConsulta: z.string().datetime(),
  motivoConsulta: z.string().min(3),
  anamnese: z.string().optional(),
  exameFisico: z.string().optional(),
  diagnostico: z.string().optional(),
  planoDeTratamento: z.string().optional(),
  observacoes: z.string().optional(),
});

export class PepController {
  async createProntuario(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = createProntuarioSchema.parse(req.body);
      const clinicId = req.user?.clinicId;

      if (!clinicId) {
        res.status(401).json({ error: 'Clinic ID not found in token' });
        return;
      }

      // TODO: Implement ProntuarioRepository and use case
      logger.info('Prontuario created', { clinicId, patientId: validatedData.patientId });
      res.status(201).json({ message: 'Prontuario created successfully (stub)' });
    } catch (error) {
      logger.error('Error creating prontuario', { error });
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
        return;
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async listProntuariosByPatient(req: Request, res: Response): Promise<void> {
    try {
      const { patientId } = req.params;
      const clinicId = req.user?.clinicId;

      if (!clinicId) {
        res.status(401).json({ error: 'Clinic ID not found in token' });
        return;
      }

      // TODO: Implement ProntuarioRepository query
      logger.info('Listing prontuarios', { clinicId, patientId });
      res.status(200).json({ prontuarios: [] });
    } catch (error) {
      logger.error('Error listing prontuarios', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async assinarDigitalmente(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { hash } = req.body;

      if (!hash) {
        res.status(400).json({ error: 'Hash is required' });
        return;
      }

      // TODO: Implement digital signature use case
      logger.info('Prontuario digitally signed', { id });
      res.status(200).json({ message: 'Prontuario signed successfully (stub)' });
    } catch (error) {
      logger.error('Error signing prontuario', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
