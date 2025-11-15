import { supabase } from '@/integrations/supabase/client';
import { CampaignSend, CampaignSendProps, CampaignSendStatus } from '../../domain/entities/CampaignSend';
import { ICampaignSendRepository, CampaignSendFilters } from '../../domain/repositories/ICampaignSendRepository';

export class SupabaseCampaignSendRepository implements ICampaignSendRepository {
  private readonly tableName = 'campaign_sends';

  async findById(id: string): Promise<CampaignSend | null> {
    const { data, error } = await (supabase as any)
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return this.toDomain(data);
  }

  async findByCampaign(campaignId: string, filters?: CampaignSendFilters): Promise<CampaignSend[]> {
    let query = (supabase as any)
      .from(this.tableName)
      .select('*')
      .eq('campaign_id', campaignId);

    if (filters?.patientId) {
      query = query.eq('patient_id', filters.patientId);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.hasError !== undefined) {
      if (filters.hasError) {
        query = query.eq('status', 'ERRO');
      } else {
        query = query.neq('status', 'ERRO');
      }
    }

    const { data, error } = await query.order('scheduled_for', { ascending: true });

    if (error || !data) return [];
    return data.map(row => this.toDomain(row));
  }

  async findByPatient(patientId: string): Promise<CampaignSend[]> {
    const { data, error } = await (supabase as any)
      .from(this.tableName)
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map(row => this.toDomain(row));
  }

  async save(send: CampaignSend): Promise<void> {
    const data = this.toDatabase(send);
    const { error } = await (supabase as any).from(this.tableName).insert(data);
    
    if (error) {
      throw new Error(`Erro ao salvar envio: ${error.message}`);
    }
  }

  async update(send: CampaignSend): Promise<void> {
    const data = this.toDatabase(send);
    const { error } = await (supabase as any)
      .from(this.tableName)
      .update(data)
      .eq('id', send.id);

    if (error) {
      throw new Error(`Erro ao atualizar envio: ${error.message}`);
    }
  }

  async delete(id: string): Promise<void> {
    const { error } = await (supabase as any)
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao deletar envio: ${error.message}`);
    }
  }

  async getScheduledSends(campaignId: string): Promise<CampaignSend[]> {
    const { data, error } = await (supabase as any)
      .from(this.tableName)
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('status', 'AGENDADO')
      .lte('scheduled_for', new Date().toISOString())
      .order('scheduled_for', { ascending: true });

    if (error || !data) return [];
    return data.map(row => this.toDomain(row));
  }

  async getErrorSends(campaignId: string): Promise<CampaignSend[]> {
    const { data, error } = await (supabase as any)
      .from(this.tableName)
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('status', 'ERRO')
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map(row => this.toDomain(row));
  }

  private toDomain(row: any): CampaignSend {
    // Map database status to domain status
    const statusMap: Record<string, CampaignSendStatus> = {
      'PENDENTE': 'AGENDADO',
      'AGENDADO': 'AGENDADO',
      'ENVIADO': 'ENVIADO',
      'ENTREGUE': 'ENTREGUE',
      'ABERTO': 'ABERTO',
      'CLICADO': 'CLICADO',
      'CONVERTIDO': 'CONVERTIDO',
      'ERRO': 'ERRO',
    };

    const props: CampaignSendProps = {
      id: row.id,
      campaignId: row.campaign_id,
      patientId: row.patient_id,
      recipientName: row.recipient_name,
      recipientContact: row.recipient_contact,
      messageContent: row.message_content,
      status: statusMap[row.status] || 'AGENDADO',
      scheduledFor: new Date(row.scheduled_for),
      sentAt: row.sent_at ? new Date(row.sent_at) : undefined,
      deliveredAt: row.delivered_at ? new Date(row.delivered_at) : undefined,
      openedAt: row.opened_at ? new Date(row.opened_at) : undefined,
      clickedAt: row.clicked_at ? new Date(row.clicked_at) : undefined,
      convertedAt: row.converted_at ? new Date(row.converted_at) : undefined,
      errorMessage: row.error_message,
      errorCode: row.error_code,
      retryCount: row.retry_count || 0,
      metadata: row.metadata ? (typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata) : undefined,
      createdAt: new Date(row.created_at),
    };

    return new CampaignSend(props);
  }

  private toDatabase(send: CampaignSend): any {
    // Map domain status to database status
    const statusMap: Record<CampaignSendStatus, string> = {
      'AGENDADO': 'PENDENTE',
      'ENVIADO': 'ENVIADO',
      'ENTREGUE': 'ENTREGUE',
      'ABERTO': 'ABERTO',
      'CLICADO': 'CLICADO',
      'CONVERTIDO': 'CONVERTIDO',
      'ERRO': 'ERRO',
    };

    return {
      id: send.id,
      campaign_id: send.campaignId,
      patient_id: send.patientId,
      recipient_name: send.recipientName,
      recipient_contact: send.recipientContact,
      message_content: send.messageContent,
      status: statusMap[send.status],
      scheduled_for: send.scheduledFor.toISOString(),
      sent_at: send.sentAt?.toISOString(),
      delivered_at: send.deliveredAt?.toISOString(),
      opened_at: send.openedAt?.toISOString(),
      clicked_at: send.clickedAt?.toISOString(),
      converted_at: send.convertedAt?.toISOString(),
      error_message: send.errorMessage,
      error_code: send.errorCode,
      retry_count: send.retryCount,
      metadata: send.metadata ? JSON.stringify(send.metadata) : null,
      created_at: send.createdAt.toISOString(),
    };
  }
}
