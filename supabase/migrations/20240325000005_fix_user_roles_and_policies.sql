-- Migration: Fix user roles and policies
-- Description: Adds role synchronization and fixes admin update policies
-- Backup ID: 20250124_121609_backup.sql

-- Up Migration

-- First, create a function to sync roles (safer than direct updates)
CREATE OR REPLACE FUNCTION public.sync_user_role_to_jwt()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Sync roles from public.users to auth.users JWT metadata
    UPDATE auth.users au
    SET raw_app_meta_data = 
        COALESCE(au.raw_app_meta_data, '{}'::jsonb) || 
        jsonb_build_object('role', u.role)
    FROM public.users u
    WHERE au.id = u.id;
END;
$$;

-- Drop potentially conflicting policies
DROP POLICY IF EXISTS "Update own user row" ON public.users;
DROP POLICY IF EXISTS "Admins can update user roles" ON public.users;

-- Create a combined update policy
CREATE POLICY "User update policy"
    ON public.users
    FOR UPDATE
    TO authenticated
    USING (
        -- Allow users to update their own data OR admins to update any user
        auth.uid() = id 
        OR (auth.get_user_role(auth.uid()) = 'ADMIN'::user_role)
    )
    WITH CHECK (
        -- Same conditions for the check
        auth.uid() = id 
        OR (auth.get_user_role(auth.uid()) = 'ADMIN'::user_role)
    );

-- Ensure we have a proper select policy for admins
CREATE POLICY "Admins can view users"
    ON public.users
    FOR SELECT
    TO authenticated
    USING (auth.get_user_role(auth.uid()) = 'ADMIN'::user_role);

-- Run the sync function to update existing roles
SELECT public.sync_user_role_to_jwt();

-- Down Migration
DROP POLICY IF EXISTS "User update policy" ON public.users;
DROP POLICY IF EXISTS "Admins can view users" ON public.users;
DROP FUNCTION IF EXISTS public.sync_user_role_to_jwt(); 