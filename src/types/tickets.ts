import type { Database } from './supabase';

export type Ticket = Database["public"]["Tables"]["tickets"]["Row"] & {
    customer: Database["public"]["Tables"]["users"]["Row"];
    assigned_to: Database["public"]["Tables"]["users"]["Row"] | null;
    notes: Database["public"]["Tables"]["notes"]["Row"][];
    team: Database["public"]["Tables"]["teams"]["Row"] | null;
}; 