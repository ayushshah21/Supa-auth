create type "public"."Skill" as enum ('TECHNICAL', 'BILLING', 'GENERAL', 'SALES');

create type "public"."TicketPriority" as enum ('LOW', 'MEDIUM', 'HIGH');

create type "public"."TicketStatus" as enum ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

create type "public"."UserRole" as enum ('CUSTOMER', 'WORKER', 'ADMIN');

drop trigger if exists "update_templates_updated_at" on "public"."templates";

drop trigger if exists "update_ticket_resolved_at" on "public"."tickets";

drop policy "Customers can insert feedback" on "public"."feedback";

drop policy "Admins can delete templates" on "public"."templates";

drop policy "Everyone can view active templates" on "public"."templates";

drop policy "Workers and admins can create templates" on "public"."templates";

drop policy "Workers and admins can update templates" on "public"."templates";

drop policy "Customers can create tickets" on "public"."tickets";

drop policy "Customers can view their own tickets" on "public"."tickets";

drop policy "Workers and admins can view all tickets" on "public"."tickets";

drop policy "Service role can view all users" on "public"."users";

drop policy "Users can update their own data" on "public"."users";

drop policy "Customers can insert feedback for their tickets" on "public"."feedback";

drop policy "Workers and customers can view feedback" on "public"."feedback";

drop policy "Customers can create feedback and rating interactions" on "public"."interactions";

drop policy "Users can view interactions for their tickets" on "public"."interactions";

drop policy "Workers and admins can create interactions" on "public"."interactions";

drop policy "Workers and admins can update tickets" on "public"."tickets";

drop policy "Workers and admins can view all users" on "public"."users";

revoke delete on table "public"."backup_test" from "anon";

revoke insert on table "public"."backup_test" from "anon";

revoke references on table "public"."backup_test" from "anon";

revoke select on table "public"."backup_test" from "anon";

revoke trigger on table "public"."backup_test" from "anon";

revoke truncate on table "public"."backup_test" from "anon";

revoke update on table "public"."backup_test" from "anon";

revoke delete on table "public"."backup_test" from "authenticated";

revoke insert on table "public"."backup_test" from "authenticated";

revoke references on table "public"."backup_test" from "authenticated";

revoke select on table "public"."backup_test" from "authenticated";

revoke trigger on table "public"."backup_test" from "authenticated";

revoke truncate on table "public"."backup_test" from "authenticated";

revoke update on table "public"."backup_test" from "authenticated";

revoke delete on table "public"."backup_test" from "service_role";

revoke insert on table "public"."backup_test" from "service_role";

revoke references on table "public"."backup_test" from "service_role";

revoke select on table "public"."backup_test" from "service_role";

revoke trigger on table "public"."backup_test" from "service_role";

revoke truncate on table "public"."backup_test" from "service_role";

revoke update on table "public"."backup_test" from "service_role";

revoke delete on table "public"."templates" from "anon";

revoke insert on table "public"."templates" from "anon";

revoke references on table "public"."templates" from "anon";

revoke select on table "public"."templates" from "anon";

revoke trigger on table "public"."templates" from "anon";

revoke truncate on table "public"."templates" from "anon";

revoke update on table "public"."templates" from "anon";

revoke delete on table "public"."templates" from "authenticated";

revoke insert on table "public"."templates" from "authenticated";

revoke references on table "public"."templates" from "authenticated";

revoke select on table "public"."templates" from "authenticated";

revoke trigger on table "public"."templates" from "authenticated";

revoke truncate on table "public"."templates" from "authenticated";

revoke update on table "public"."templates" from "authenticated";

revoke delete on table "public"."templates" from "service_role";

revoke insert on table "public"."templates" from "service_role";

revoke references on table "public"."templates" from "service_role";

revoke select on table "public"."templates" from "service_role";

revoke trigger on table "public"."templates" from "service_role";

revoke truncate on table "public"."templates" from "service_role";

revoke update on table "public"."templates" from "service_role";

alter table "public"."feedback" drop constraint "feedback_rating_check";

alter table "public"."interactions" drop constraint "interactions_type_check";

alter table "public"."templates" drop constraint "templates_created_by_fkey";

alter table "public"."interactions" drop constraint "interactions_author_id_fkey";

alter table "public"."notes" drop constraint "notes_author_id_fkey";

drop function if exists "public"."get_tickets_by_priority"();

drop function if exists "public"."get_tickets_over_time"(days_back integer);

drop function if exists "public"."handle_auth_user_creation"();

alter table "public"."backup_test" drop constraint "backup_test_pkey";

alter table "public"."templates" drop constraint "templates_pkey";

alter table "public"."tickets" drop constraint "tickets_pkey";

drop index if exists "public"."backup_test_pkey";

drop index if exists "public"."templates_pkey";

drop index if exists "public"."tickets_pkey";

drop table "public"."backup_test";

drop table "public"."templates";

create table "public"."_TagToTicket" (
    "A" uuid not null,
    "B" uuid not null
);


create table "public"."attachments" (
    "id" uuid not null default uuid_generate_v4(),
    "created_at" timestamp with time zone default CURRENT_TIMESTAMP,
    "name" text not null,
    "url" text not null,
    "size" integer not null,
    "type" text not null,
    "ticket_id" uuid
);


alter table "public"."attachments" enable row level security;

create table "public"."custom_fields" (
    "id" uuid not null default uuid_generate_v4(),
    "ticket_id" uuid,
    "key" text not null,
    "value" text not null,
    "data_type" text not null
);


alter table "public"."custom_fields" enable row level security;

create table "public"."ratings" (
    "id" uuid not null default uuid_generate_v4(),
    "created_at" timestamp with time zone not null default CURRENT_TIMESTAMP,
    "score" integer not null,
    "feedback" text,
    "ticket_id" uuid not null,
    "user_id" uuid not null
);


alter table "public"."ratings" enable row level security;

create table "public"."schema_migrations" (
    "version" text not null,
    "statements" text[],
    "created_at" timestamp with time zone not null default now()
);


create table "public"."tags" (
    "id" uuid not null default uuid_generate_v4(),
    "name" text not null,
    "description" text,
    "color" text
);


alter table "public"."tags" enable row level security;

create table "public"."team_members" (
    "id" uuid not null default uuid_generate_v4(),
    "created_at" timestamp with time zone default CURRENT_TIMESTAMP,
    "team_id" uuid,
    "user_id" uuid,
    "role" text not null,
    "joined_at" timestamp with time zone default CURRENT_TIMESTAMP
);


alter table "public"."team_members" enable row level security;

create table "public"."teams" (
    "id" uuid not null default uuid_generate_v4(),
    "created_at" timestamp with time zone default CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone default CURRENT_TIMESTAMP,
    "name" text not null,
    "description" text,
    "schedule" jsonb
);


alter table "public"."teams" enable row level security;

create table "public"."ticket_tags" (
    "ticket_id" uuid not null,
    "tag_id" uuid not null
);


alter table "public"."feedback" drop column "content";

alter table "public"."feedback" drop column "rating";

alter table "public"."feedback" add column "feedback" text;

alter table "public"."feedback" add column "score" integer;

alter table "public"."feedback" alter column "ticket_id" set not null;

alter table "public"."feedback" alter column "user_id" set not null;

alter table "public"."interactions" add column "metadata" jsonb;

alter table "public"."interactions" alter column "author_id" set not null;

alter table "public"."interactions" alter column "ticket_id" set not null;

alter table "public"."notes" add column "metadata" jsonb;

alter table "public"."notes" alter column "author_id" set not null;

alter table "public"."notes" alter column "created_at" set not null;

alter table "public"."notes" alter column "internal" set default true;

alter table "public"."notes" alter column "internal" set not null;

alter table "public"."notes" alter column "ticket_id" set not null;

alter table "public"."users" add column "name" text;

alter table "public"."users" add column "preferences" jsonb default '{}'::jsonb;

alter table "public"."users" add column "skills" text[] default '{}'::text[];

alter table "public"."users" alter column "created_at" set not null;

alter table "public"."users" alter column "email" set not null;

alter table "public"."users" alter column "role" set default 'CUSTOMER'::"UserRole";

alter table "public"."users" alter column "role" set not null;

alter table "public"."users" alter column "role" set data type "UserRole" using "role"::text::"UserRole";

alter table "public"."users" alter column "updated_at" set not null;

drop sequence if exists "public"."backup_test_id_seq";

CREATE UNIQUE INDEX "_TagToTicket_AB_pkey" ON public."_TagToTicket" USING btree ("A", "B");

CREATE INDEX "_TagToTicket_B_index" ON public."_TagToTicket" USING btree ("B");

CREATE UNIQUE INDEX attachments_pkey ON public.attachments USING btree (id);

CREATE UNIQUE INDEX custom_fields_pkey ON public.custom_fields USING btree (id);

CREATE INDEX idx_interactions_ticket_id ON public.interactions USING btree (ticket_id);

CREATE INDEX idx_notes_author_id ON public.notes USING btree (author_id);

CREATE INDEX idx_notes_ticket_id ON public.notes USING btree (ticket_id);

CREATE INDEX idx_ratings_ticket_id ON public.ratings USING btree (ticket_id);

CREATE INDEX idx_ticket_tags_tag_id ON public.ticket_tags USING btree (tag_id);

CREATE INDEX idx_ticket_tags_ticket_id ON public.ticket_tags USING btree (ticket_id);

CREATE UNIQUE INDEX ratings_pkey ON public.ratings USING btree (id);

CREATE UNIQUE INDEX schema_migrations_pkey ON public.schema_migrations USING btree (version);

CREATE UNIQUE INDEX tags_name_key ON public.tags USING btree (name);

CREATE UNIQUE INDEX tags_pkey ON public.tags USING btree (id);

CREATE UNIQUE INDEX team_members_pkey ON public.team_members USING btree (id);

CREATE UNIQUE INDEX teams_pkey ON public.teams USING btree (id);

CREATE UNIQUE INDEX ticket_tags_pkey ON public.ticket_tags USING btree (ticket_id, tag_id);

CREATE UNIQUE INDEX tickets_new_pkey ON public.tickets USING btree (id);

alter table "public"."_TagToTicket" add constraint "_TagToTicket_AB_pkey" PRIMARY KEY using index "_TagToTicket_AB_pkey";

alter table "public"."attachments" add constraint "attachments_pkey" PRIMARY KEY using index "attachments_pkey";

alter table "public"."custom_fields" add constraint "custom_fields_pkey" PRIMARY KEY using index "custom_fields_pkey";

alter table "public"."ratings" add constraint "ratings_pkey" PRIMARY KEY using index "ratings_pkey";

alter table "public"."schema_migrations" add constraint "schema_migrations_pkey" PRIMARY KEY using index "schema_migrations_pkey";

alter table "public"."tags" add constraint "tags_pkey" PRIMARY KEY using index "tags_pkey";

alter table "public"."team_members" add constraint "team_members_pkey" PRIMARY KEY using index "team_members_pkey";

alter table "public"."teams" add constraint "teams_pkey" PRIMARY KEY using index "teams_pkey";

alter table "public"."ticket_tags" add constraint "ticket_tags_pkey" PRIMARY KEY using index "ticket_tags_pkey";

alter table "public"."tickets" add constraint "tickets_new_pkey" PRIMARY KEY using index "tickets_new_pkey";

alter table "public"."attachments" add constraint "attachments_ticket_id_fkey" FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE not valid;

alter table "public"."attachments" validate constraint "attachments_ticket_id_fkey";

alter table "public"."custom_fields" add constraint "custom_fields_ticket_id_fkey" FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE not valid;

alter table "public"."custom_fields" validate constraint "custom_fields_ticket_id_fkey";

alter table "public"."tags" add constraint "tags_name_key" UNIQUE using index "tags_name_key";

alter table "public"."team_members" add constraint "team_members_team_id_fkey" FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE not valid;

alter table "public"."team_members" validate constraint "team_members_team_id_fkey";

alter table "public"."team_members" add constraint "team_members_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."team_members" validate constraint "team_members_user_id_fkey";

alter table "public"."ticket_tags" add constraint "ticket_tags_tag_id_fkey" FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE not valid;

alter table "public"."ticket_tags" validate constraint "ticket_tags_tag_id_fkey";

alter table "public"."ticket_tags" add constraint "ticket_tags_ticket_id_fkey" FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE not valid;

alter table "public"."ticket_tags" validate constraint "ticket_tags_ticket_id_fkey";

alter table "public"."users" add constraint "users_role_check" CHECK ((role = ANY (ARRAY['CUSTOMER'::"UserRole", 'WORKER'::"UserRole", 'ADMIN'::"UserRole"]))) not valid;

alter table "public"."users" validate constraint "users_role_check";

alter table "public"."interactions" add constraint "interactions_author_id_fkey" FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE not valid;

alter table "public"."interactions" validate constraint "interactions_author_id_fkey";

alter table "public"."notes" add constraint "notes_author_id_fkey" FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE not valid;

alter table "public"."notes" validate constraint "notes_author_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
 RETURNS user_role
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN (
        SELECT role 
        FROM public.users 
        WHERE id = user_id
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_worker_stats(_worker_id uuid)
 RETURNS TABLE(open_tickets bigint, resolved_last_7_days bigint, avg_resolution_hours double precision, total_tickets bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    RETURN QUERY
    WITH stats AS (
        SELECT 
            COUNT(*) FILTER (WHERE status != 'RESOLVED') as open_count,
            COUNT(*) FILTER (WHERE resolved_at >= NOW() - INTERVAL '7 days') as recent_resolved,
            CAST(
                COALESCE(
                    AVG(
                        EXTRACT(EPOCH FROM (resolved_at - created_at))/3600
                    ) FILTER (WHERE resolved_at IS NOT NULL),
                    0
                ) AS FLOAT
            ) as avg_hours,
            COUNT(*) as total_count
        FROM tickets
        WHERE assigned_to_id = _worker_id
    )
    SELECT 
        open_count,
        recent_resolved,
        avg_hours,
        total_count
    FROM stats;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_user_role()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Update auth.users set JWT claim data
  UPDATE auth.users
  SET raw_app_meta_data = 
    COALESCE(raw_app_meta_data::jsonb, '{}'::jsonb) || 
    jsonb_build_object('role', NEW.role)
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_user_role_change()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- Add any role change handling logic here
    -- For example, you might want to log role changes or perform other actions
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_user_role_metadata()
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    current_role text;
BEGIN
    -- Get the current user's role from the users table
    SELECT role INTO current_role
    FROM users
    WHERE id = auth.uid();

    -- Update the user's app_metadata in auth.users
    UPDATE auth.users
    SET raw_app_meta_data = 
        COALESCE(raw_app_meta_data, '{}'::jsonb) || 
        jsonb_build_object('role', current_role)
    WHERE id = auth.uid();

    RETURN json_build_object(
        'success', true,
        'role', current_role
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_users_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_ticket_resolved_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- When status changes to RESOLVED, set resolved_at
    IF NEW.status = 'RESOLVED' AND (OLD.status != 'RESOLVED' OR OLD.status IS NULL) THEN
        NEW.resolved_at = NOW();
    -- When status changes from RESOLVED to something else, clear resolved_at
    ELSIF NEW.status != 'RESOLVED' AND OLD.status = 'RESOLVED' THEN
        NEW.resolved_at = NULL;
    END IF;
    RETURN NEW;
END;
$function$
;

grant delete on table "public"."_TagToTicket" to "anon";

grant insert on table "public"."_TagToTicket" to "anon";

grant references on table "public"."_TagToTicket" to "anon";

grant select on table "public"."_TagToTicket" to "anon";

grant trigger on table "public"."_TagToTicket" to "anon";

grant truncate on table "public"."_TagToTicket" to "anon";

grant update on table "public"."_TagToTicket" to "anon";

grant delete on table "public"."_TagToTicket" to "authenticated";

grant insert on table "public"."_TagToTicket" to "authenticated";

grant references on table "public"."_TagToTicket" to "authenticated";

grant select on table "public"."_TagToTicket" to "authenticated";

grant trigger on table "public"."_TagToTicket" to "authenticated";

grant truncate on table "public"."_TagToTicket" to "authenticated";

grant update on table "public"."_TagToTicket" to "authenticated";

grant delete on table "public"."_TagToTicket" to "service_role";

grant insert on table "public"."_TagToTicket" to "service_role";

grant references on table "public"."_TagToTicket" to "service_role";

grant select on table "public"."_TagToTicket" to "service_role";

grant trigger on table "public"."_TagToTicket" to "service_role";

grant truncate on table "public"."_TagToTicket" to "service_role";

grant update on table "public"."_TagToTicket" to "service_role";

grant delete on table "public"."attachments" to "anon";

grant insert on table "public"."attachments" to "anon";

grant references on table "public"."attachments" to "anon";

grant select on table "public"."attachments" to "anon";

grant trigger on table "public"."attachments" to "anon";

grant truncate on table "public"."attachments" to "anon";

grant update on table "public"."attachments" to "anon";

grant delete on table "public"."attachments" to "authenticated";

grant insert on table "public"."attachments" to "authenticated";

grant references on table "public"."attachments" to "authenticated";

grant select on table "public"."attachments" to "authenticated";

grant trigger on table "public"."attachments" to "authenticated";

grant truncate on table "public"."attachments" to "authenticated";

grant update on table "public"."attachments" to "authenticated";

grant delete on table "public"."attachments" to "service_role";

grant insert on table "public"."attachments" to "service_role";

grant references on table "public"."attachments" to "service_role";

grant select on table "public"."attachments" to "service_role";

grant trigger on table "public"."attachments" to "service_role";

grant truncate on table "public"."attachments" to "service_role";

grant update on table "public"."attachments" to "service_role";

grant delete on table "public"."custom_fields" to "anon";

grant insert on table "public"."custom_fields" to "anon";

grant references on table "public"."custom_fields" to "anon";

grant select on table "public"."custom_fields" to "anon";

grant trigger on table "public"."custom_fields" to "anon";

grant truncate on table "public"."custom_fields" to "anon";

grant update on table "public"."custom_fields" to "anon";

grant delete on table "public"."custom_fields" to "authenticated";

grant insert on table "public"."custom_fields" to "authenticated";

grant references on table "public"."custom_fields" to "authenticated";

grant select on table "public"."custom_fields" to "authenticated";

grant trigger on table "public"."custom_fields" to "authenticated";

grant truncate on table "public"."custom_fields" to "authenticated";

grant update on table "public"."custom_fields" to "authenticated";

grant delete on table "public"."custom_fields" to "service_role";

grant insert on table "public"."custom_fields" to "service_role";

grant references on table "public"."custom_fields" to "service_role";

grant select on table "public"."custom_fields" to "service_role";

grant trigger on table "public"."custom_fields" to "service_role";

grant truncate on table "public"."custom_fields" to "service_role";

grant update on table "public"."custom_fields" to "service_role";

grant delete on table "public"."ratings" to "anon";

grant insert on table "public"."ratings" to "anon";

grant references on table "public"."ratings" to "anon";

grant select on table "public"."ratings" to "anon";

grant trigger on table "public"."ratings" to "anon";

grant truncate on table "public"."ratings" to "anon";

grant update on table "public"."ratings" to "anon";

grant delete on table "public"."ratings" to "authenticated";

grant insert on table "public"."ratings" to "authenticated";

grant references on table "public"."ratings" to "authenticated";

grant select on table "public"."ratings" to "authenticated";

grant trigger on table "public"."ratings" to "authenticated";

grant truncate on table "public"."ratings" to "authenticated";

grant update on table "public"."ratings" to "authenticated";

grant delete on table "public"."ratings" to "service_role";

grant insert on table "public"."ratings" to "service_role";

grant references on table "public"."ratings" to "service_role";

grant select on table "public"."ratings" to "service_role";

grant trigger on table "public"."ratings" to "service_role";

grant truncate on table "public"."ratings" to "service_role";

grant update on table "public"."ratings" to "service_role";

grant delete on table "public"."schema_migrations" to "anon";

grant insert on table "public"."schema_migrations" to "anon";

grant references on table "public"."schema_migrations" to "anon";

grant select on table "public"."schema_migrations" to "anon";

grant trigger on table "public"."schema_migrations" to "anon";

grant truncate on table "public"."schema_migrations" to "anon";

grant update on table "public"."schema_migrations" to "anon";

grant delete on table "public"."schema_migrations" to "authenticated";

grant insert on table "public"."schema_migrations" to "authenticated";

grant references on table "public"."schema_migrations" to "authenticated";

grant select on table "public"."schema_migrations" to "authenticated";

grant trigger on table "public"."schema_migrations" to "authenticated";

grant truncate on table "public"."schema_migrations" to "authenticated";

grant update on table "public"."schema_migrations" to "authenticated";

grant delete on table "public"."schema_migrations" to "service_role";

grant insert on table "public"."schema_migrations" to "service_role";

grant references on table "public"."schema_migrations" to "service_role";

grant select on table "public"."schema_migrations" to "service_role";

grant trigger on table "public"."schema_migrations" to "service_role";

grant truncate on table "public"."schema_migrations" to "service_role";

grant update on table "public"."schema_migrations" to "service_role";

grant delete on table "public"."tags" to "anon";

grant insert on table "public"."tags" to "anon";

grant references on table "public"."tags" to "anon";

grant select on table "public"."tags" to "anon";

grant trigger on table "public"."tags" to "anon";

grant truncate on table "public"."tags" to "anon";

grant update on table "public"."tags" to "anon";

grant delete on table "public"."tags" to "authenticated";

grant insert on table "public"."tags" to "authenticated";

grant references on table "public"."tags" to "authenticated";

grant select on table "public"."tags" to "authenticated";

grant trigger on table "public"."tags" to "authenticated";

grant truncate on table "public"."tags" to "authenticated";

grant update on table "public"."tags" to "authenticated";

grant delete on table "public"."tags" to "service_role";

grant insert on table "public"."tags" to "service_role";

grant references on table "public"."tags" to "service_role";

grant select on table "public"."tags" to "service_role";

grant trigger on table "public"."tags" to "service_role";

grant truncate on table "public"."tags" to "service_role";

grant update on table "public"."tags" to "service_role";

grant delete on table "public"."team_members" to "anon";

grant insert on table "public"."team_members" to "anon";

grant references on table "public"."team_members" to "anon";

grant select on table "public"."team_members" to "anon";

grant trigger on table "public"."team_members" to "anon";

grant truncate on table "public"."team_members" to "anon";

grant update on table "public"."team_members" to "anon";

grant delete on table "public"."team_members" to "authenticated";

grant insert on table "public"."team_members" to "authenticated";

grant references on table "public"."team_members" to "authenticated";

grant select on table "public"."team_members" to "authenticated";

grant trigger on table "public"."team_members" to "authenticated";

grant truncate on table "public"."team_members" to "authenticated";

grant update on table "public"."team_members" to "authenticated";

grant delete on table "public"."team_members" to "service_role";

grant insert on table "public"."team_members" to "service_role";

grant references on table "public"."team_members" to "service_role";

grant select on table "public"."team_members" to "service_role";

grant trigger on table "public"."team_members" to "service_role";

grant truncate on table "public"."team_members" to "service_role";

grant update on table "public"."team_members" to "service_role";

grant delete on table "public"."teams" to "anon";

grant insert on table "public"."teams" to "anon";

grant references on table "public"."teams" to "anon";

grant select on table "public"."teams" to "anon";

grant trigger on table "public"."teams" to "anon";

grant truncate on table "public"."teams" to "anon";

grant update on table "public"."teams" to "anon";

grant delete on table "public"."teams" to "authenticated";

grant insert on table "public"."teams" to "authenticated";

grant references on table "public"."teams" to "authenticated";

grant select on table "public"."teams" to "authenticated";

grant trigger on table "public"."teams" to "authenticated";

grant truncate on table "public"."teams" to "authenticated";

grant update on table "public"."teams" to "authenticated";

grant delete on table "public"."teams" to "service_role";

grant insert on table "public"."teams" to "service_role";

grant references on table "public"."teams" to "service_role";

grant select on table "public"."teams" to "service_role";

grant trigger on table "public"."teams" to "service_role";

grant truncate on table "public"."teams" to "service_role";

grant update on table "public"."teams" to "service_role";

grant delete on table "public"."ticket_tags" to "anon";

grant insert on table "public"."ticket_tags" to "anon";

grant references on table "public"."ticket_tags" to "anon";

grant select on table "public"."ticket_tags" to "anon";

grant trigger on table "public"."ticket_tags" to "anon";

grant truncate on table "public"."ticket_tags" to "anon";

grant update on table "public"."ticket_tags" to "anon";

grant delete on table "public"."ticket_tags" to "authenticated";

grant insert on table "public"."ticket_tags" to "authenticated";

grant references on table "public"."ticket_tags" to "authenticated";

grant select on table "public"."ticket_tags" to "authenticated";

grant trigger on table "public"."ticket_tags" to "authenticated";

grant truncate on table "public"."ticket_tags" to "authenticated";

grant update on table "public"."ticket_tags" to "authenticated";

grant delete on table "public"."ticket_tags" to "service_role";

grant insert on table "public"."ticket_tags" to "service_role";

grant references on table "public"."ticket_tags" to "service_role";

grant select on table "public"."ticket_tags" to "service_role";

grant trigger on table "public"."ticket_tags" to "service_role";

grant truncate on table "public"."ticket_tags" to "service_role";

grant update on table "public"."ticket_tags" to "service_role";

create policy "Customers can create non-internal notes on their tickets"
on "public"."notes"
as permissive
for insert
to authenticated
with check (((NOT internal) AND (EXISTS ( SELECT 1
   FROM tickets
  WHERE ((tickets.id = notes.ticket_id) AND (tickets.customer_id = auth.uid()))))));


create policy "Customers can view non-internal notes on their tickets"
on "public"."notes"
as permissive
for select
to authenticated
using ((EXISTS ( SELECT 1
   FROM tickets
  WHERE ((tickets.id = notes.ticket_id) AND (tickets.customer_id = auth.uid()) AND (NOT notes.internal)))));


create policy "Workers and admins can create notes"
on "public"."notes"
as permissive
for insert
to authenticated
with check ((EXISTS ( SELECT 1
   FROM users u
  WHERE ((u.id = auth.uid()) AND (u.role = ANY (ARRAY['WORKER'::"UserRole", 'ADMIN'::"UserRole"]))))));


create policy "Workers and admins can view all notes"
on "public"."notes"
as permissive
for select
to authenticated
using ((EXISTS ( SELECT 1
   FROM users u
  WHERE ((u.id = auth.uid()) AND (u.role = ANY (ARRAY['WORKER'::"UserRole", 'ADMIN'::"UserRole"]))))));


create policy "Everyone can view tags"
on "public"."tags"
as permissive
for select
to authenticated
using (true);


create policy "Workers and admins can manage tags"
on "public"."tags"
as permissive
for all
to authenticated
using ((EXISTS ( SELECT 1
   FROM users u
  WHERE ((u.id = auth.uid()) AND (u.role = ANY (ARRAY['WORKER'::"UserRole", 'ADMIN'::"UserRole"]))))));


create policy "Customers can insert tickets"
on "public"."tickets"
as permissive
for insert
to authenticated
with check (((customer_id = auth.uid()) AND (EXISTS ( SELECT 1
   FROM users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'CUSTOMER'::"UserRole"))))));


create policy "Customers can select own tickets"
on "public"."tickets"
as permissive
for select
to authenticated
using ((customer_id = auth.uid()));


create policy "Workers and admins can select all tickets"
on "public"."tickets"
as permissive
for select
to authenticated
using ((EXISTS ( SELECT 1
   FROM users u
  WHERE ((u.id = auth.uid()) AND (u.role = ANY (ARRAY['WORKER'::"UserRole", 'ADMIN'::"UserRole"]))))));


create policy "Insert user row"
on "public"."users"
as permissive
for insert
to authenticated
with check (true);


create policy "Select own user row"
on "public"."users"
as permissive
for select
to authenticated
using ((id = auth.uid()));


create policy "Update own user row"
on "public"."users"
as permissive
for update
to authenticated
using ((id = auth.uid()))
with check ((id = auth.uid()));


create policy "Workers and admins can view all workers and admins"
on "public"."users"
as permissive
for select
to authenticated
using (((role = ANY (ARRAY['WORKER'::"UserRole", 'ADMIN'::"UserRole"])) AND ((auth.jwt() ->> 'role'::text) = ANY (ARRAY['WORKER'::text, 'ADMIN'::text]))));


create policy "Customers can insert feedback for their tickets"
on "public"."feedback"
as permissive
for insert
to authenticated
with check ((EXISTS ( SELECT 1
   FROM tickets t
  WHERE ((t.id = feedback.ticket_id) AND (t.customer_id = auth.uid())))));


create policy "Workers and customers can view feedback"
on "public"."feedback"
as permissive
for select
to authenticated
using (((EXISTS ( SELECT 1
   FROM users u
  WHERE ((u.id = auth.uid()) AND (u.role = ANY (ARRAY['WORKER'::"UserRole", 'ADMIN'::"UserRole"]))))) OR (EXISTS ( SELECT 1
   FROM tickets t
  WHERE ((t.id = feedback.ticket_id) AND (t.customer_id = auth.uid()))))));


create policy "Customers can create feedback and rating interactions"
on "public"."interactions"
as permissive
for insert
to authenticated
with check (((type = ANY (ARRAY['FEEDBACK'::text, 'RATING'::text])) AND (EXISTS ( SELECT 1
   FROM tickets t
  WHERE ((t.id = interactions.ticket_id) AND (t.customer_id = auth.uid()))))));


create policy "Users can view interactions for their tickets"
on "public"."interactions"
as permissive
for select
to authenticated
using (((EXISTS ( SELECT 1
   FROM users u
  WHERE ((u.id = auth.uid()) AND (u.role = ANY (ARRAY['WORKER'::"UserRole", 'ADMIN'::"UserRole"]))))) OR (EXISTS ( SELECT 1
   FROM tickets t
  WHERE ((t.id = interactions.ticket_id) AND (t.customer_id = auth.uid()))))));


create policy "Workers and admins can create interactions"
on "public"."interactions"
as permissive
for insert
to authenticated
with check ((EXISTS ( SELECT 1
   FROM users u
  WHERE ((u.id = auth.uid()) AND (u.role = ANY (ARRAY['WORKER'::"UserRole", 'ADMIN'::"UserRole"]))))));


create policy "Workers and admins can update tickets"
on "public"."tickets"
as permissive
for update
to authenticated
using ((EXISTS ( SELECT 1
   FROM users u
  WHERE ((u.id = auth.uid()) AND (u.role = ANY (ARRAY['WORKER'::"UserRole", 'ADMIN'::"UserRole"]))))))
with check ((EXISTS ( SELECT 1
   FROM users u
  WHERE ((u.id = auth.uid()) AND (u.role = ANY (ARRAY['WORKER'::"UserRole", 'ADMIN'::"UserRole"]))))));


create policy "Workers and admins can view all users"
on "public"."users"
as permissive
for select
to public
using ((auth.get_user_role(auth.uid()) = ANY (ARRAY['WORKER'::user_role, 'ADMIN'::user_role])));


CREATE TRIGGER trg_update_users_timestamp BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_users_updated_at();

CREATE TRIGGER update_ticket_resolved_at BEFORE INSERT OR UPDATE ON public.tickets FOR EACH ROW EXECUTE FUNCTION update_ticket_resolved_at();


