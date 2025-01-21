export type UserRole = 'CUSTOMER' | 'WORKER' | 'ADMIN';
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type Skill = 'TECHNICAL' | 'BILLING' | 'GENERAL' | 'SALES';

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          email: string;
          name: string | null;
          role: UserRole;
          skills: Skill[];
          preferences: Json | null;
          avatar_url: string | null;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      teams: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          name: string;
          description: string | null;
          schedule: Json | null;
        };
        Insert: Omit<Database['public']['Tables']['teams']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['teams']['Insert']>;
      };
      team_members: {
        Row: {
          id: string;
          created_at: string;
          team_id: string;
          user_id: string;
          role: string;
          joined_at: string;
        };
        Insert: Omit<Database['public']['Tables']['team_members']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['team_members']['Insert']>;
      };
      tickets: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          title: string;
          description: string;
          status: TicketStatus;
          priority: TicketPriority;
          metadata: Json | null;
          customer_id: string;
          assigned_to_id: string | null;
        };
        Insert: Omit<Database['public']['Tables']['tickets']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['tickets']['Insert']>;
      };
      notes: {
        Row: {
          id: string;
          created_at: string;
          content: string;
          internal: boolean;
          metadata: Json | null;
          ticket_id: string;
          author_id: string;
        };
        Insert: Omit<Database['public']['Tables']['notes']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['notes']['Insert']>;
      };
      tags: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          color: string | null;
        };
        Insert: Omit<Database['public']['Tables']['tags']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['tags']['Insert']>;
      };
      ticket_tags: {
        Row: {
          ticket_id: string;
          tag_id: string;
        };
        Insert: Database['public']['Tables']['ticket_tags']['Row'];
        Update: Partial<Database['public']['Tables']['ticket_tags']['Row']>;
      };
      custom_fields: {
        Row: {
          id: string;
          ticket_id: string;
          key: string;
          value: string;
          data_type: string;
        };
        Insert: Omit<Database['public']['Tables']['custom_fields']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['custom_fields']['Insert']>;
      };
      attachments: {
        Row: {
          id: string;
          created_at: string;
          name: string;
          url: string;
          size: number;
          type: string;
          ticket_id: string;
        };
        Insert: Omit<Database['public']['Tables']['attachments']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['attachments']['Insert']>;
      };
      ratings: {
        Row: {
          id: string;
          created_at: string;
          score: number;
          feedback: string | null;
          ticket_id: string;
          user_id: string;
        };
        Insert: Omit<Database['public']['Tables']['ratings']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['ratings']['Insert']>;
      };
    };
  };
} 