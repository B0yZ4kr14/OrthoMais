import { supabase } from '@/integrations/supabase/client';
import { Campaign, CampaignProps, CampaignType, CampaignStatus, CampaignMetrics, TargetSegment } from '../../domain/entities/Campaign';
import { ICampaignRepository, CampaignFilters } from '../../domain/repositories/ICampaignRepository';
import { MessageTemplate } from '../../domain/valueObjects/MessageTemplate';

export class SupabaseCampaignRepository implements ICampaignRepository {
  private readonly tableName = 'marketing_campaigns';

  async findById(id: string): Promise<Campaign | null> {
    const { data, error } = await (supabase as any)
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return this.toDomain(data);
  }

  async findByClinic(clinicId: string, filters?: CampaignFilters): Promise<Campaign[]> {
    let query = (supabase as any)
      .from(this.tableName)
      .select('*')
      .eq('clinic_id', clinicId);

    if (filters?.type) {
      query = query.eq('type', filters.type);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.createdBy) {
      query = query.eq('created_by', filters.createdBy);
    }

    if (filters?.period) {
      query = query
        .gte('created_at', filters.period.startDate.toISOString())
        .lte('created_at', filters.period.endDate.toISOString());
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map(row => this.toDomain(row));
  }

  async save(campaign: Campaign): Promise<void> {
    const data = this.toDatabase(campaign);
    const { error } = await (supabase as any).from(this.tableName).insert(data);
    
    if (error) {
      throw new Error(`Erro ao salvar campanha: ${error.message}`);
    }
  }

  async update(campaign: Campaign): Promise<void> {
    const data = this.toDatabase(campaign);
    const { error } = await (supabase as any)
      .from(this.tableName)
      .update(data)
      .eq('id', campaign.id);

    if (error) {
      throw new Error(`Erro ao atualizar campanha: ${error.message}`);
    }
  }

  async delete(id: string): Promise<void> {
    const { error } = await (supabase as any)
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao deletar campanha: ${error.message}`);
    }
  }

  async getActiveCampaigns(clinicId: string): Promise<Campaign[]> {
    const { data, error } = await (supabase as any)
      .from(this.tableName)
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('status', 'ATIVA')
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map(row => this.toDomain(row));
  }

  async getScheduledCampaigns(clinicId: string): Promise<Campaign[]> {
    const { data, error } = await (supabase as any)
      .from(this.tableName)
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('status', 'ATIVA')
      .not('scheduled_date', 'is', null)
      .gte('scheduled_date', new Date().toISOString())
      .order('scheduled_date', { ascending: true });

    if (error || !data) return [];
    return data.map(row => this.toDomain(row));
  }

  private toDomain(row: any): Campaign {
    const messageTemplate = new MessageTemplate(row.message_template || '');

    const metrics: CampaignMetrics | undefined = row.total_sent !== null ? {
      totalSent: row.total_sent || 0,
      totalDelivered: row.total_delivered || 0,
      totalOpened: row.total_opened || 0,
      totalClicked: row.total_clicked || 0,
      totalConverted: row.total_converted || 0,
      totalErrors: row.total_errors || 0,
    } : undefined;

    const targetSegment: TargetSegment | undefined = row.target_segment ? 
      (typeof row.target_segment === 'string' ? JSON.parse(row.target_segment) : row.target_segment) : 
      undefined;

    const props: CampaignProps = {
      id: row.id,
      clinicId: row.clinic_id,
      name: row.name,
      description: row.description,
      type: row.type as CampaignType,
      status: row.status as CampaignStatus,
      messageTemplate,
      targetSegment,
      scheduledDate: row.scheduled_date ? new Date(row.scheduled_date) : undefined,
      startDate: row.start_date ? new Date(row.start_date) : undefined,
      endDate: row.end_date ? new Date(row.end_date) : undefined,
      metrics,
      createdBy: row.created_by,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };

    return new Campaign(props);
  }

  private toDatabase(campaign: Campaign): any {
    return {
      id: campaign.id,
      clinic_id: campaign.clinicId,
      name: campaign.name,
      description: campaign.description,
      type: campaign.type,
      status: campaign.status,
      message_template: campaign.messageTemplate.getTemplate(),
      target_segment: campaign.targetSegment ? JSON.stringify(campaign.targetSegment) : null,
      scheduled_date: campaign.scheduledDate?.toISOString(),
      start_date: campaign.startDate?.toISOString(),
      end_date: campaign.endDate?.toISOString(),
      total_sent: campaign.metrics?.totalSent,
      total_delivered: campaign.metrics?.totalDelivered,
      total_opened: campaign.metrics?.totalOpened,
      total_clicked: campaign.metrics?.totalClicked,
      total_converted: campaign.metrics?.totalConverted,
      total_errors: campaign.metrics?.totalErrors,
      created_by: campaign.createdBy,
      created_at: campaign.createdAt.toISOString(),
      updated_at: campaign.updatedAt.toISOString(),
    };
  }
}
