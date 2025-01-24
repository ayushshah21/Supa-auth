-- NOTE: Before applying this migration:
-- 1. Run the backup script: ./backup-db.sh
-- 2. Verify the backup has been created successfully
-- 3. Note the backup ID for reference
-- Backup created: 20250124_125514_backup.sql

-- Description: This migration fixes role update functionality by:
-- 1. Ensuring RLS is enabled
-- 2. Creating the update policy with correct type casting
-- 3. Creating the role update trigger

-- Up Migration

-- Enable RLS on users table if not already enabled
ALTER TABLE public.users FORCE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS update_user_roles ON public.users;

-- Create policy for admins to update user roles
CREATE POLICY update_user_roles ON public.users
    FOR UPDATE
    TO authenticated
    USING (
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'ADMIN'::"UserRole"
    )
    WITH CHECK (
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'ADMIN'::"UserRole"
    );

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_role_update ON public.users;

-- Create trigger for role updates
CREATE TRIGGER on_role_update
    AFTER UPDATE OF role
    ON public.users
    FOR EACH ROW
    WHEN (OLD.role IS DISTINCT FROM NEW.role)
    EXECUTE FUNCTION handle_user_role();

-- Down Migration
DROP TRIGGER IF EXISTS on_role_update ON public.users;
DROP POLICY IF EXISTS update_user_roles ON public.users;

-- Note: To restore from backup if needed:
-- 1. Use backup ID: 20250124_125514_backup.sql 