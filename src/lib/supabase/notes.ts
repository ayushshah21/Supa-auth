import type { Database } from '../../types/supabase';
import { supabase } from './client';

export const getNotes = async (ticketId: string) => {
    const { data, error } = await supabase
        .from('notes')
        .select('*, author:users!author_id(*)')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: false });
    return { data, error };
};

export const createNote = async (note: Database['public']['Tables']['notes']['Insert']) => {
    const { data, error } = await supabase
        .from('notes')
        .insert(note)
        .select()
        .single();
    return { data, error };
}; 