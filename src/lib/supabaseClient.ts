import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);

// Auth helper functions
export const getCurrentUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
};

export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
};

// User role management
export const getUserRole = async (userId: string) => {
    const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();
    
    if (error) throw error;
    return data?.role;
};

// User management
export const getUsers = async () => {
    const { data, error } = await supabase
        .from('users')
        .select('*');
    return { data, error };
};

export const updateUser = async (id: string, updates: Database['public']['Tables']['users']['Update']) => {
    const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
    return { data, error };
};

// Ticket management
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

// Notes management
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

// Team management
export const getTeams = async () => {
    const { data, error } = await supabase
        .from('teams')
        .select('*, members:team_members(*)');
    return { data, error };
};

export const createTeam = async (team: Database['public']['Tables']['teams']['Insert']) => {
    const { data, error } = await supabase
        .from('teams')
        .insert(team)
        .select()
        .single();
    return { data, error };
};

export const addTeamMember = async (member: Database['public']['Tables']['team_members']['Insert']) => {
    const { data, error } = await supabase
        .from('team_members')
        .insert(member)
        .select()
        .single();
    return { data, error };
};

// Tags management
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

// Attachments
export const getAttachments = async (ticketId: string) => {
    const { data, error } = await supabase
        .from('attachments')
        .select('*')
        .eq('ticket_id', ticketId);
    return { data, error };
};

export const createAttachment = async (attachment: Database['public']['Tables']['attachments']['Insert']) => {
    const { data, error } = await supabase
        .from('attachments')
        .insert(attachment)
        .select()
        .single();
    return { data, error };
};

// Custom fields
export const getCustomFields = async (ticketId: string) => {
    const { data, error } = await supabase
        .from('custom_fields')
        .select('*')
        .eq('ticket_id', ticketId);
    return { data, error };
};

export const setCustomField = async (field: Database['public']['Tables']['custom_fields']['Insert']) => {
    const { data, error } = await supabase
        .from('custom_fields')
        .insert(field)
        .select()
        .single();
    return { data, error };
};

// Ratings
export const getTicketRating = async (ticketId: string) => {
    const { data, error } = await supabase
        .from('ratings')
        .select('*')
        .eq('ticket_id', ticketId)
        .single();
    return { data, error };
};

export const createRating = async (rating: Database['public']['Tables']['ratings']['Insert']) => {
    const { data, error } = await supabase
        .from('ratings')
        .insert(rating)
        .select()
        .single();
    return { data, error };
}; 