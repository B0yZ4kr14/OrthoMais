import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Notification {
  id: string;
  tipo: string;
  titulo: string;
  mensagem: string;
  link_acao: string | null;
  lida: boolean;
  lida_em: string | null;
  created_at: string;
}

export const useNotifications = () => {
  const { user, selectedClinic } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    if (!user || !selectedClinic) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('clinic_id', selectedClinic.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.lida).length || 0);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ lida: true, lida_em: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) throw error;

      await loadNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user || !selectedClinic) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ lida: true, lida_em: new Date().toISOString() })
        .eq('clinic_id', selectedClinic.id)
        .eq('lida', false);

      if (error) throw error;

      await loadNotifications();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  useEffect(() => {
    loadNotifications();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `clinic_id=eq.${selectedClinic?.id}`
        },
        () => {
          loadNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, selectedClinic]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refresh: loadNotifications
  };
};
