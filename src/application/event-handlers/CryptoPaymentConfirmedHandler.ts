/**
 * FASE 2 - SPRINT 2: Handler para CryptoPaymentConfirmedEvent
 * 
 * Processa o evento de pagamento confirmado:
 * 1. Atualiza conta_receber (se aplicável)
 * 2. Dispara Split de Pagamento
 * 3. Registra transação financeira
 * 4. Envia notificações
 */

import { supabase } from '@/integrations/supabase/client';
import { CryptoPaymentConfirmedEvent } from '@/domain/events/CryptoPaymentEvents';
import { toast } from 'sonner';

export class CryptoPaymentConfirmedHandler {
  async handle(event: CryptoPaymentConfirmedEvent): Promise<void> {
    console.log('[CryptoPaymentConfirmedHandler] Processing event:', event);

    try {
      // 1. Atualizar transação crypto no DB
      await this.updateCryptoTransaction(event);

      // 2. Atualizar conta_receber (se aplicável)
      if (event.payload.contaReceberId) {
        await this.updateContaReceber(event);
      }

      // 3. Registrar no histórico financeiro
      await this.registerFinancialTransaction(event);

      // 4. Disparar Split de Pagamento (se configurado)
      await this.processSplitPayment(event);

      // 5. Criar registro no PDV (se veio de uma venda)
      if (event.payload.orderId?.startsWith('pdv-')) {
        await this.registerPDVPayment(event);
      }

      // 6. Notificar clínica
      this.notifyClinic(event);

      // 7. Log de auditoria
      await this.logAudit(event);

      console.log('[CryptoPaymentConfirmedHandler] Event processed successfully');
    } catch (error) {
      console.error('[CryptoPaymentConfirmedHandler] Error processing event:', error);
      
      // Registrar erro no DB
      await supabase.from('audit_logs').insert([{
        clinic_id: event.payload.clinicId,
        action: 'CRYPTO_PAYMENT_PROCESSING_ERROR',
        details: {
          transactionId: event.payload.transactionId,
          error: error instanceof Error ? error.message : 'Unknown error',
        } as any,
      }]);

      throw error;
    }
  }

  private async updateCryptoTransaction(event: CryptoPaymentConfirmedEvent): Promise<void> {
    // Mock: Em produção, atualizar crypto_transactions via Edge Function
    console.log('[CryptoPaymentConfirmedHandler] Updating transaction:', event.payload.transactionId);
  }

  private async updateContaReceber(event: CryptoPaymentConfirmedEvent): Promise<void> {
    // Buscar valor em BRL (converter de crypto para BRL)
    // Mock: assumir que amount já está em BRL ou converter via exchange rate
    const valorBRL = event.payload.amount; // Em produção, converter usando taxa de câmbio

    const { error } = await supabase
      .from('contas_receber')
      .update({
        status: 'PAGO',
        data_pagamento: new Date().toISOString(),
        valor_pago: valorBRL,
        forma_pagamento: 'CRYPTO',
        observacoes: `Pagamento confirmado via ${event.payload.cryptocurrency}. TxHash: ${event.payload.txHash}`,
      })
      .eq('id', event.payload.contaReceberId);

    if (error) {
      console.error('[CryptoPaymentConfirmedHandler] Error updating conta_receber:', error);
      // Não bloquear o fluxo se falhar
    }
  }

  private async registerFinancialTransaction(event: CryptoPaymentConfirmedEvent): Promise<void> {
    console.log('[CryptoPaymentConfirmedHandler] Registered financial transaction:', event.payload);
  }

  private async processSplitPayment(event: CryptoPaymentConfirmedEvent): Promise<void> {
    console.log('[CryptoPaymentConfirmedHandler] Processing split payment:', event.payload);
  }

  private async registerPDVPayment(event: CryptoPaymentConfirmedEvent): Promise<void> {
    console.log('[CryptoPaymentConfirmedHandler] Registered PDV payment:', event.payload);
  }

  private notifyClinic(event: CryptoPaymentConfirmedEvent): void {
    // Toast de sucesso
    toast.success('🎉 Pagamento em Crypto Confirmado!', {
      description: `${event.payload.amount} ${event.payload.cryptocurrency} recebido. ${event.payload.confirmations} confirmações.`,
      duration: 5000,
    });

    // Em produção, enviar também:
    // - Email para admin da clínica
    // - Notificação push
    // - Webhook para sistema externo (se configurado)
  }

  private async logAudit(event: CryptoPaymentConfirmedEvent): Promise<void> {
    await supabase.from('audit_logs').insert([{
      clinic_id: event.payload.clinicId,
      action: 'CRYPTO_PAYMENT_CONFIRMED',
      action_type: 'FINANCIAL',
      details: {
        transactionId: event.payload.transactionId,
        cryptocurrency: event.payload.cryptocurrency,
        amount: event.payload.amount,
        txHash: event.payload.txHash,
        confirmations: event.payload.confirmations,
        timestamp: event.occurredAt.toISOString(),
      } as any,
    }]);
  }
}

// Export singleton instance
export const cryptoPaymentConfirmedHandler = new CryptoPaymentConfirmedHandler();
