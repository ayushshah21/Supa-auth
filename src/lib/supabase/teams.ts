import type { Database } from '../../types/supabase';
import { supabase } from './client';

export const getTeams = async () => {
    const { data, error } = await supabase
        .from('teams')
        .select('*, members:team_members(*)');
    return { data, error };
};

export const getTeamsForWorker = async (workerId: string) => {
    console.log('[teams/getTeamsForWorker] Fetching teams for worker:', workerId);
    
    try {
        // First get the team IDs for this worker
        const { data: teamMemberships, error: membershipError } = await supabase
            .from('team_members')
            .select('team_id')
            .eq('user_id', workerId);

        if (membershipError) {
            console.error('[teams/getTeamsForWorker] Error fetching team memberships:', membershipError);
            return { data: null, error: membershipError };
        }

        const teamIds = teamMemberships.map(tm => tm.team_id);

        // If worker isn't part of any teams, return empty array
        if (teamIds.length === 0) {
            return { data: [], error: null };
        }

        // Then fetch the full team details for those teams
        const { data, error } = await supabase
            .from('teams')
            .select('*, members:team_members(*)')
            .in('id', teamIds);

        if (error) {
            console.error('[teams/getTeamsForWorker] Error fetching teams:', error);
            return { data: null, error };
        }

        console.log('[teams/getTeamsForWorker] Successfully fetched teams:', {
            teamCount: data?.length ?? 0
        });
        return { data, error: null };
    } catch (err) {
        console.error('[teams/getTeamsForWorker] Unexpected error:', err);
        return { data: null, error: err instanceof Error ? err : new Error('Unknown error') };
    }
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

export const removeTeamMember = async (teamId: string, userId: string) => {
    const { data, error } = await supabase
        .from('team_members')
        .delete()
        .match({ team_id: teamId, user_id: userId })
        .select()
        .single();
    return { data, error };
};

export const isWorkerInTeam = async (workerId: string, teamId: string): Promise<{ isMember: boolean; error: Error | null }> => {
    try {
        console.log('[teams/isWorkerInTeam] Checking if worker is in team:', { workerId, teamId });
        
        const { data, error } = await supabase
            .from('team_members')
            .select('id')
            .eq('team_id', teamId)
            .eq('user_id', workerId)
            .maybeSingle();

        if (error) throw error;
        
        return { isMember: !!data, error: null };
    } catch (err) {
        console.error('[teams/isWorkerInTeam] Error checking team membership:', err);
        return { isMember: false, error: err instanceof Error ? err : new Error('Unknown error') };
    }
}; 