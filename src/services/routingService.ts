import { supabase } from '../lib/supabase/client';
import { getTicketTags } from '../lib/supabase/tags';
import { createAssignmentInteraction } from '../lib/supabase/interactions/mutations';

/**
 * Find the best team for a ticket based on its tags and team specialties
 */
export async function findBestTeamForTicket(ticketId: string): Promise<{ teamId: string | null; error: Error | null }> {
    console.log('[routingService/findBestTeamForTicket] Finding best team for ticket:', ticketId);
    
    try {
        // 1. Get the ticket's tags
        const { data: ticketTagsData, error: ticketTagsError } = await getTicketTags(ticketId);
        if (ticketTagsError) throw ticketTagsError;

        if (!ticketTagsData || ticketTagsData.length === 0) {
            console.log('[routingService/findBestTeamForTicket] No tags found for ticket');
            return { teamId: null, error: null };
        }

        // Extract tag IDs safely
        const tagIds = ticketTagsData.reduce<string[]>((acc, row) => {
            if (row && row.tag_id) {
                acc.push(row.tag_id);
            }
            return acc;
        }, []);

        if (tagIds.length === 0) {
            console.log('[routingService/findBestTeamForTicket] No valid tag IDs found');
            return { teamId: null, error: null };
        }

        // 2. Find teams that match any of these tags (through team_specialties)
        const { data: candidateTeams, error: candidateError } = await supabase
            .from('team_specialties')
            .select('team_id')
            .in('tag_id', tagIds);

        if (candidateError) throw candidateError;

        if (!candidateTeams || candidateTeams.length === 0) {
            console.log('[routingService/findBestTeamForTicket] No matching teams found');
            return { teamId: null, error: null };
        }

        // 3. Get unique team IDs and their current workload
        const uniqueTeamIds = Array.from(new Set(candidateTeams.map(c => c.team_id)));
        const teamLoads: Array<{ team_id: string; openCount: number }> = [];

        for (const teamId of uniqueTeamIds) {
            const { count, error: countError } = await supabase
                .from('tickets')
                .select('*', { head: true, count: 'exact' })
                .eq('team_id', teamId)
                .in('status', ['OPEN', 'IN_PROGRESS']);

            if (countError) throw countError;
            teamLoads.push({ team_id: teamId, openCount: count ?? 0 });
        }

        // 4. Sort by workload (ascending)
        teamLoads.sort((a, b) => a.openCount - b.openCount);

        // 5. Return team with lowest workload
        const chosenTeam = teamLoads[0]?.team_id || null;

        console.log('[routingService/findBestTeamForTicket] Selected team:', chosenTeam);
        return { teamId: chosenTeam, error: null };
    } catch (err) {
        console.error('[routingService/findBestTeamForTicket] Error:', err);
        return { teamId: null, error: err instanceof Error ? err : new Error('Unknown error') };
    }
}

/**
 * Auto-assign a ticket to the best matching team
 */
export async function autoAssignTicketToTeam(ticketId: string): Promise<{ error: Error | null }> {
    console.log('[routingService/autoAssignTicketToTeam] Auto-assigning ticket:', ticketId);
    
    try {
        // 1. Get current ticket details (for interaction logging)
        const { data: currentTicket, error: ticketError } = await supabase
            .from('tickets')
            .select('team_id')
            .eq('id', ticketId)
            .single();

        if (ticketError) throw ticketError;

        // 2. Find best team
        const { teamId, error: findError } = await findBestTeamForTicket(ticketId);
        if (findError) throw findError;

        // If no team found or same team, do nothing
        if (!teamId || teamId === currentTicket?.team_id) {
            return { error: null };
        }

        // 3. Update the ticket
        const { error: updateError } = await supabase
            .from('tickets')
            .update({ team_id: teamId })
            .eq('id', ticketId);

        if (updateError) throw updateError;

        // 4. Log the team assignment interaction
        await createAssignmentInteraction(
            ticketId,
            'SYSTEM', // or some system user ID
            currentTicket?.team_id,
            teamId
        );

        console.log('[routingService/autoAssignTicketToTeam] Successfully assigned ticket to team:', teamId);
        return { error: null };
    } catch (err) {
        console.error('[routingService/autoAssignTicketToTeam] Error:', err);
        return { error: err instanceof Error ? err : new Error('Unknown error') };
    }
} 