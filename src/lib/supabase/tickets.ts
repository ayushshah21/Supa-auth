import type { Database } from '../../types/supabase';
import { supabase } from './client';

export const getTickets = async (options?: { 
    customer_id?: string;
    assigned_to_id?: string;
    status?: Database['public']['Tables']['tickets']['Row']['status'];
}) => {
    let query = supabase.from('tickets').select(`
        *,
        customer:users!customer_id(*),
        assigned_to:users!assigned_to_id(*),
        notes(*),
        tags!ticket_tags(*)
    `);

    if (options?.customer_id) {
        query = query.eq('customer_id', options.customer_id);
    }
    if (options?.assigned_to_id) {
        query = query.eq('assigned_to_id', options.assigned_to_id);
    }
    if (options?.status) {
        query = query.eq('status', options.status);
    }

    const { data, error } = await query;
    return { data, error };
};

export const createTicket = async (ticket: Database['public']['Tables']['tickets']['Insert']) => {
    const { data, error } = await supabase
        .from('tickets')
        .insert(ticket)
        .select()
        .single();
    return { data, error };
};

export const updateTicket = async (id: string, updates: Database['public']['Tables']['tickets']['Update']) => {
    const { data, error } = await supabase
        .from('tickets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
    return { data, error };
}; 