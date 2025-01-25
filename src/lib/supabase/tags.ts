import type { Database } from '../../types/supabase';
import { supabase } from './client';

export const getTags = async () => {
    const { data, error } = await supabase
        .from('tags')
        .select('*');
    return { data, error };
};

export const createTag = async (tag: Database['public']['Tables']['tags']['Insert']) => {
    const { data, error } = await supabase
        .from('tags')
        .insert(tag)
        .select()
        .single();
    return { data, error };
};

export const deleteTag = async (tagId: string) => {
    console.log('[tags/deleteTag] Deleting tag:', tagId);
    try {
        const { error } = await supabase
            .from('tags')
            .delete()
            .eq('id', tagId);

        if (error) {
            console.error('[tags/deleteTag] Error:', error);
            return { error };
        }

        console.log('[tags/deleteTag] Successfully deleted tag');
        return { error: null };
    } catch (err) {
        console.error('[tags/deleteTag] Unexpected error:', err);
        return { error: err instanceof Error ? err : new Error('Unknown error') };
    }
};

export const addTagToTicket = async (ticketId: string, tagId: string) => {
    const { data, error } = await supabase
        .from('ticket_tags')
        .insert({ ticket_id: ticketId, tag_id: tagId })
        .select()
        .single();
    return { data, error };
};

/**
 * Get all tags for a given ticket
 */
export async function getTicketTags(ticketId: string) {
    console.log('[tags/getTicketTags] Fetching tags for ticket:', ticketId);
    
    try {
        const { data, error } = await supabase
            .from('ticket_tags')
            .select(`
                tag_id,
                tag:tags!inner(*)
            `)
            .eq('ticket_id', ticketId);

        if (error) {
            console.error('[tags/getTicketTags] Error:', error);
            return { data: null, error };
        }

        console.log('[tags/getTicketTags] Successfully fetched tags:', {
            count: data?.length ?? 0
        });
        return { data, error: null };
    } catch (err) {
        console.error('[tags/getTicketTags] Unexpected error:', err);
        return { data: null, error: err instanceof Error ? err : new Error('Unknown error') };
    }
} 