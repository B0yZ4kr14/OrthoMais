/**
 * Hook para operações Crypto com Supabase
 * Gerencia exchanges, wallets offline e transações
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface CryptoWallet {
  id: string;
  clinic_id: string;
  wallet_address: string;
  coin_type: string;
  wallet_name: string;
  balance: number;
  balance_brl: number;
  is_active: boolean;
}

export interface CryptoExchange {
  id: string;
  clinic_id: string;
  exchange_name: string;
  is_active: boolean;
  supported_coins: string[];
  auto_convert_to_brl: boolean;
}

export interface OfflineWallet {
  id: string;
  clinic_id: string;
  wallet_name: string;
  hardware_type: string;
  derivation_path: string;
  last_used_index: number;
  is_active: boolean;
  is_verified: boolean;
  supported_coins: string[];
}

export function useCryptoSupabase() {
  const { clinicId } = useAuth();
  const [wallets, setWallets] = useState<CryptoWallet[]>([]);
  const [exchanges, setExchanges] = useState<CryptoExchange[]>([]);
  const [offlineWallets, setOfflineWallets] = useState<OfflineWallet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (clinicId) {
      loadCryptoData();
    }
  }, [clinicId]);

  const loadCryptoData = async () => {
    try {
      setLoading(true);

      // Load wallets
      const { data: walletsData } = await (supabase as any)
        .from('crypto_wallets')
        .select('*')
        .eq('clinic_id', clinicId)
        .eq('is_active', true);

      // Load exchanges
      const { data: exchangesData } = await (supabase as any)
        .from('crypto_exchange_config')
        .select('*')
        .eq('clinic_id', clinicId)
        .eq('is_active', true);

      // Load offline wallets
      const { data: offlineData } = await (supabase as any)
        .from('crypto_offline_wallets')
        .select('*')
        .eq('clinic_id', clinicId)
        .eq('is_active', true);

      setWallets(walletsData || []);
      setExchanges(exchangesData || []);
      setOfflineWallets(offlineData || []);
    } catch (error) {
      console.error('Error loading crypto data:', error);
      toast.error('Erro ao carregar dados crypto');
    } finally {
      setLoading(false);
    }
  };

  const createExchange = async (exchangeData: Partial<CryptoExchange>) => {
    try {
      const { error } = await (supabase as any)
        .from('crypto_exchange_config')
        .insert({ ...exchangeData, clinic_id: clinicId });

      if (error) throw error;

      toast.success('Exchange configurada com sucesso!');
      await loadCryptoData();
    } catch (error: any) {
      console.error('Error creating exchange:', error);
      toast.error('Erro ao configurar exchange');
      throw error;
    }
  };

  const createWallet = async (walletData: Partial<CryptoWallet>) => {
    try {
      const { error } = await (supabase as any)
        .from('crypto_wallets')
        .insert({ ...walletData, clinic_id: clinicId });

      if (error) throw error;

      toast.success('Wallet criada com sucesso!');
      await loadCryptoData();
    } catch (error: any) {
      console.error('Error creating wallet:', error);
      toast.error('Erro ao criar wallet');
      throw error;
    }
  };

  const createOfflineWallet = async (walletData: {
    wallet_name: string;
    hardware_type: string;
    xpub: string;
    derivation_path: string;
    supported_coins: string[];
  }) => {
    try {
      // Call edge function to encrypt xPub
      const { data, error } = await supabase.functions.invoke('manage-offline-wallet', {
        body: {
          action: 'create',
          clinic_id: clinicId,
          ...walletData,
        },
      });

      if (error) throw error;

      toast.success('Wallet offline configurada com sucesso!');
      await loadCryptoData();
      return data;
    } catch (error: any) {
      console.error('Error creating offline wallet:', error);
      toast.error('Erro ao configurar wallet offline');
      throw error;
    }
  };

  const generatePaymentAddress = async (offlineWalletId: string, amount: number) => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-payment-address', {
        body: {
          offline_wallet_id: offlineWalletId,
          amount,
        },
      });

      if (error) throw error;

      return data;
    } catch (error: any) {
      console.error('Error generating payment address:', error);
      toast.error('Erro ao gerar endereço de pagamento');
      throw error;
    }
  };

  return {
    wallets,
    exchanges,
    offlineWallets,
    loading,
    createExchange,
    createWallet,
    createOfflineWallet,
    generatePaymentAddress,
    reloadData: loadCryptoData,
  };
}
