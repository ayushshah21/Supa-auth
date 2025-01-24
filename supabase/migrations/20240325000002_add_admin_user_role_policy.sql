-- Migration: Add admin user role update policy
-- Description: Adds a policy allowing admins to update user roles
-- Backup ID: 20250124_114831_backup.sql

-- Up Migration

-- First, ensure the trigger function exists
CREATE OR REPLACE FUNCTION public.handle_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update auth.users set JWT claim data
  UPDATE auth.users
  SET raw_app_meta_data = 
    COALESCE(raw_app_meta_data::jsonb, '{}'::jsonb) || 
    jsonb_build_object('role', NEW.role)
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$;

-- Create the trigger if it doesn't exist
DROP TRIGGER IF EXISTS on_user_role_change ON public.users;
CREATE TRIGGER on_user_role_change
  AFTER UPDATE OF role ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_role();

-- Add the policy for admin role updates
CREATE POLICY "Admins can update user roles" ON public.users
FOR UPDATE
TO authenticated
USING ((auth.jwt() ->> 'role')::text = 'ADMIN')
WITH CHECK ((auth.jwt() ->> 'role')::text = 'ADMIN');

-- Down Migration
DROP TRIGGER IF EXISTS on_user_role_change ON public.users;
DROP POLICY IF EXISTS "Admins can update user roles" ON public.users; 