-- Migration: Add role update policy
-- Description: Adds policy for admin role updates and trigger for role sync
-- Backup ID: 20250124_122603_backup.sql

-- Up Migration

-- Create policy for admins to update user roles
CREATE POLICY "Admins can update user roles"
    ON public.users
    FOR UPDATE
    TO authenticated
    USING (
        -- Use both JWT and function check for safety
        auth.get_user_role(auth.uid()) = 'ADMIN'
    )
    WITH CHECK (
        -- Use both JWT and function check for safety
        auth.get_user_role(auth.uid()) = 'ADMIN'
    );

-- Create trigger to sync role updates
CREATE OR REPLACE FUNCTION public.handle_role_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF (OLD.role IS DISTINCT FROM NEW.role) THEN
        -- Call existing function to update JWT metadata
        PERFORM public.update_user_role_metadata();
        
        -- Log the change
        RAISE LOG 'User role updated - ID: %, Old Role: %, New Role: %', 
                  NEW.id, OLD.role, NEW.role;
    END IF;
    RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS on_role_update ON public.users;
CREATE TRIGGER on_role_update
    AFTER UPDATE OF role ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_role_update();

-- Down Migration
DROP TRIGGER IF EXISTS on_role_update ON public.users;
DROP FUNCTION IF EXISTS public.handle_role_update();
DROP POLICY IF EXISTS "Admins can update user roles" ON public.users; 