import { useState, useEffect, useCallback } from 'react';
import { CampaignSend } from '../../domain/entities/CampaignSend';
import { SupabaseCampaignRepository } from '../../infrastructure/repositories/SupabaseCampaignRepository';
import { SupabaseCampaignSendRepository } from '../../infrastructure/repositories/SupabaseCampaignSendRepository';
import { SendCampaignMessageUseCase } from '../../application/use-cases/SendCampaignMessageUseCase';
import { ListCampaignSendsUseCase } from '../../application/use-cases/ListCampaignSendsUseCase';
import { CampaignSendFilters } from '../../domain/repositories/ICampaignSendRepository';

const campaignRepository = new SupabaseCampaignRepository();
const sendRepository = new SupabaseCampaignSendRepository();
const sendMessageUseCase = new SendCampaignMessageUseCase(campaignRepository, sendRepository);
const listSendsUseCase = new ListCampaignSendsUseCase(sendRepository);

export function useCampaignSends(campaignId: string, filters?: CampaignSendFilters) {
  const [sends, setSends] = useState<CampaignSend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadSends = useCallback(async () => {
    if (!campaignId) return;

    try {
      setLoading(true);
      setError(null);
      const result = await listSendsUseCase.execute({ campaignId, filters });
      setSends(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao carregar envios'));
    } finally {
      setLoading(false);
    }
  }, [campaignId, filters]);

  useEffect(() => {
    loadSends();
  }, [loadSends]);

  const sendMessage = useCallback(
    async (data: {
      patientId: string;
      recipientName: string;
      recipientContact: string;
      variables: Record<string, string>;
      scheduledFor?: Date;
    }) => {
      const send = await sendMessageUseCase.execute({
        campaignId,
        ...data,
      });

      await loadSends();
      return send;
    },
    [campaignId, loadSends]
  );

  // Analytics
  const totalSends = sends.length;
  const scheduledSends = sends.filter(s => s.isScheduled()).length;
  const sentSends = sends.filter(s => s.isSent()).length;
  const deliveredSends = sends.filter(s => s.isDelivered()).length;
  const openedSends = sends.filter(s => s.isOpened()).length;
  const clickedSends = sends.filter(s => s.isClicked()).length;
  const convertedSends = sends.filter(s => s.isConverted()).length;
  const errorSends = sends.filter(s => s.hasError()).length;

  return {
    sends,
    loading,
    error,
    sendMessage,
    loadSends,
    // Analytics
    totalSends,
    scheduledSends,
    sentSends,
    deliveredSends,
    openedSends,
    clickedSends,
    convertedSends,
    errorSends,
  };
}
