-- Migration: Add role update trigger
-- Description: Adds a trigger to sync role updates to JWT metadata
-- Backup ID: 20250124_121609_backup.sql

-- Up Migration

-- Create or replace the trigger function
CREATE OR REPLACE FUNCTION public.handle_role_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF OLD.role IS DISTINCT FROM NEW.role THEN
        -- Update the JWT claims in auth.users
        UPDATE auth.users
        SET raw_app_meta_data = 
            COALESCE(raw_app_meta_data::jsonb, '{}'::jsonb) || 
            jsonb_build_object('role', NEW.role)
        WHERE id = NEW.id;
        
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