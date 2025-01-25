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

/**
 * Get all specialties (tags) for a given team
 */
export async function getTeamSpecialties(teamId: string) {
    console.log('[teams/getTeamSpecialties] Fetching specialties for team:', teamId);
    
    try {
        const { data, error } = await supabase
            .from('team_specialties')
            .select(`
                tag_id,
                created_at,
                tags!inner(id, name, description, color)
            `)
            .eq('team_id', teamId);

        if (error) {
            console.error('[teams/getTeamSpecialties] Error:', error);
            return { data: null, error };
        }

        console.log('[teams/getTeamSpecialties] Successfully fetched specialties:', {
            count: data?.length ?? 0
        });
        return { data, error: null };
    } catch (err) {
        console.error('[teams/getTeamSpecialties] Unexpected error:', err);
        return { data: null, error: err instanceof Error ? err : new Error('Unknown error') };
    }
}

/**
 * Update the entire set of specialties for a team
 */
export async function updateTeamSpecialties(teamId: string, tagIds: string[]) {
    console.log('[teams/updateTeamSpecialties] Updating specialties for team:', { teamId, tagCount: tagIds.length });
    
    try {
        // Remove existing records
        const { error: deleteError } = await supabase
            .from('team_specialties')
            .delete()
            .eq('team_id', teamId);

        if (deleteError) {
            console.error('[teams/updateTeamSpecialties] Delete error:', deleteError);
            return { error: deleteError };
        }

        // If no new tags, we're done
        if (tagIds.length === 0) {
            return { error: null };
        }

        // Insert new specialties
        const rows = tagIds.map(tagId => ({ team_id: teamId, tag_id: tagId }));
        const { error: insertError } = await supabase
            .from('team_specialties')
            .insert(rows);

        if (insertError) {
            console.error('[teams/updateTeamSpecialties] Insert error:', insertError);
            return { error: insertError };
        }

        console.log('[teams/updateTeamSpecialties] Successfully updated specialties');
        return { error: null };
    } catch (err) {
        console.error('[teams/updateTeamSpecialties] Unexpected error:', err);
        return { error: err instanceof Error ? err : new Error('Unknown error') };
    }
}

/**
 * Remove a single specialty from a team
 */
export async function removeTeamSpecialty(teamId: string, tagId: string) {
    console.log('[teams/removeTeamSpecialty] Removing specialty:', { teamId, tagId });
    
    try {
        const { error } = await supabase
            .from('team_specialties')
            .delete()
            .match({ team_id: teamId, tag_id: tagId });

        if (error) {
            console.error('[teams/removeTeamSpecialty] Error:', error);
            return { error };
        }

        console.log('[teams/removeTeamSpecialty] Successfully removed specialty');
        return { error: null };
    } catch (err) {
        console.error('[teams/removeTeamSpecialty] Unexpected error:', err);
        return { error: err instanceof Error ? err : new Error('Unknown error') };
    }
} 