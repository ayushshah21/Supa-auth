import type { Database } from '../../types/supabase';
import { supabase } from './client';

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