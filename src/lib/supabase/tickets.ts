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
        tags!ticket_tags(*),
        team:teams!tickets_team_id_fkey(*)
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

export const getTicketsForWorker = async (workerId: string) => {
    console.log('[tickets/getTicketsForWorker] Fetching tickets for worker:', workerId);
    
    try {
        // First, get the team IDs for this worker
        const { data: teamMemberships, error: teamError } = await supabase
            .from('team_members')
            .select('team_id')
            .eq('user_id', workerId);

        if (teamError) {
            console.error('[tickets/getTicketsForWorker] Error fetching team memberships:', teamError);
            return { data: null, error: teamError };
        }

        const teamIds = teamMemberships?.map(tm => tm.team_id) || [];

        // Build the query based on whether there are team IDs
        let query = supabase
            .from('tickets')
            .select(`
                *,
                customer:users!customer_id(*),
                assigned_to:users!assigned_to_id(*),
                notes(*),
                tags!ticket_tags(*),
                team:teams!tickets_team_id_fkey(*)
            `);

        // If there are team IDs, include them in the OR condition
        if (teamIds.length > 0) {
            query = query.or(`assigned_to_id.eq.${workerId},team_id.in.(${teamIds.join(',')})`);
        } else {
            // If no team IDs, just look for directly assigned tickets
            query = query.eq('assigned_to_id', workerId);
        }

        // Add ordering
        query = query.order('created_at', { ascending: false });

        const { data, error } = await query;

        if (error) {
            console.error('[tickets/getTicketsForWorker] Error fetching tickets:', {
                error,
                errorMessage: error.message,
                errorDetails: error.details,
                errorHint: error.hint,
                errorCode: error.code
            });
            return { data: null, error };
        }

        console.log('[tickets/getTicketsForWorker] Successfully fetched tickets:', {
            ticketCount: data?.length ?? 0
        });
        return { data, error: null };
    } catch (err) {
        console.error('[tickets/getTicketsForWorker] Unexpected error:', err);
        return { data: null, error: err instanceof Error ? err : new Error('Unknown error') };
    }
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

export const updateTicket = async (
  id: string,
  updates: Partial<{
    title: string;
    description: string;
    status: Database['public']['Tables']['tickets']['Row']['status'];
    priority: Database['public']['Tables']['tickets']['Row']['priority'];
    assigned_to_id: string | null;
    resolved_at: string | null;
    updated_at: string;
  }>
) => {
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