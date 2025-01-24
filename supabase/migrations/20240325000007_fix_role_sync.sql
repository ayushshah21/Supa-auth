-- Migration: Fix role sync function
-- Description: Makes the role sync function accessible via RPC and improves trigger
-- Backup ID: 20250124_122239_backup.sql

-- Up Migration

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.sync_user_role_to_jwt();

-- Create the function with proper RPC access
CREATE OR REPLACE FUNCTION public.sync_user_role_to_jwt()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Sync roles from public.users to auth.users JWT metadata
    UPDATE auth.users au
    SET raw_app_meta_data = 
        COALESCE(au.raw_app_meta_data, '{}'::jsonb) || 
        jsonb_build_object('role', u.role)
    FROM public.users u
    WHERE au.id = u.id;

    -- Log the sync
    RAISE LOG 'Role sync completed for all users';
END;
$$;

-- Grant RPC access to authenticated users
GRANT EXECUTE ON FUNCTION public.sync_user_role_to_jwt() TO authenticated;

-- Improve the role update trigger to handle null values
CREATE OR REPLACE FUNCTION public.handle_role_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF (OLD.role IS NULL AND NEW.role IS NOT NULL) OR 
       (OLD.role IS NOT NULL AND NEW.role IS NULL) OR 
       (OLD.role IS NOT NULL AND NEW.role IS NOT NULL AND OLD.role <> NEW.role) THEN
        
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

-- Down Migration
REVOKE EXECUTE ON FUNCTION public.sync_user_role_to_jwt() FROM authenticated;
DROP FUNCTION IF EXISTS public.sync_user_role_to_jwt();
DROP FUNCTION IF EXISTS public.handle_role_update(); 