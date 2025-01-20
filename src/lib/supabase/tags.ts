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

export const addTagToTicket = async (ticketId: string, tagId: string) => {
    const { data, error } = await supabase
        .from('ticket_tags')
        .insert({ ticket_id: ticketId, tag_id: tagId })
        .select()
        .single();
    return { data, error };
}; 