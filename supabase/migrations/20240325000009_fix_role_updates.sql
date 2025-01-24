-- NOTE: Before applying this migration:
-- 1. Run the backup script: ./backup-db.sh
-- 2. Verify the backup has been created successfully
-- 3. Note the backup ID for reference
-- Backup created: 20250124_124837_backup.sql

-- Description: This migration adds proper role update functionality by:
-- 1. Adding an UPDATE policy for admins
-- 2. Creating a trigger for role updates that uses existing handle_user_role function

-- Up Migration

-- Add policy for admins to update user roles
CREATE POLICY update_user_roles ON public.users
    FOR UPDATE
    TO authenticated
    USING (
        auth.jwt()->'app_metadata'->>'role' = 'ADMIN'
    )
    WITH CHECK (
        auth.jwt()->'app_metadata'->>'role' = 'ADMIN'
    );

-- Create trigger for role updates if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'on_role_update' 
        AND tgrelid = 'public.users'::regclass
    ) THEN
        CREATE TRIGGER on_role_update
            AFTER UPDATE OF role
            ON public.users
            FOR EACH ROW
            WHEN (OLD.role IS DISTINCT FROM NEW.role)
            EXECUTE FUNCTION handle_user_role();
    END IF;
END
$$;

-- Down Migration
DROP TRIGGER IF EXISTS on_role_update ON public.users;
DROP POLICY IF EXISTS update_user_roles ON public.users;

-- Note: To restore from backup if needed:
-- 1. Use backup ID: 20250124_124837_backup.sql 