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
    console.log('[tickets/createTicket] Starting ticket creation with raw input:', ticket);
    
    // Only send fields that exist in the database
    const { 
        title,
        description,
        priority,
        customer_id,
        status,
        assigned_to_id,
        resolved_at
    } = ticket;

    const ticketData = {
        title,
        description,
        priority,
        customer_id,
        status,
        assigned_to_id,
        resolved_at
    };

    console.log('[tickets/createTicket] Cleaned ticket data to send:', ticketData);
    console.log('[tickets/createTicket] Ticket field names:', Object.keys(ticketData));
    
    try {
        const { data, error } = await supabase
            .from('tickets')
            .insert(ticketData)
            .select('*')
            .single();
        
        if (error) {
            console.error('[tickets/createTicket] Error creating ticket:', {
                error,
                errorMessage: error.message,
                errorDetails: error.details,
                errorHint: error.hint,
                errorCode: error.code
            });
            return { data: null, error };
        }

        console.log('[tickets/createTicket] Successfully created ticket:', data);
        return { data, error: null };
    } catch (err) {
        console.error('[tickets/createTicket] Unexpected error:', err);
        return { data: null, error: err instanceof Error ? err : new Error('Unknown error') };
    }
};

export const updateTicket = async (id: string, updates: Database['public']['Tables']['tickets']['Update']) => {
    console.log('[tickets/updateTicket] Starting ticket update:', {
        ticketId: id,
        updates,
        updateFields: Object.keys(updates)
    });

    try {
        const { data, error } = await supabase
            .from('tickets')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('[tickets/updateTicket] Error updating ticket:', {
                error,
                errorMessage: error.message,
                errorDetails: error.details,
                errorHint: error.hint,
                errorCode: error.code
            });
            return { data: null, error };
        }

        console.log('[tickets/updateTicket] Successfully updated ticket:', data);
        return { data, error: null };
    } catch (err) {
        console.error('[tickets/updateTicket] Unexpected error:', err);
        return { data: null, error: err instanceof Error ? err : new Error('Unknown error') };
    }
};

export const updateTickets = async (ids: string[], updates: Database['public']['Tables']['tickets']['Update']) => {
    const { data, error } = await supabase
        .from('tickets')
        .update(updates)
        .in('id', ids)
        .select();
    return { data, error };
}; 