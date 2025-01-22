-- Create a test table to verify backup/restore
CREATE TABLE public.backup_test (
    id serial primary key,
    test_data text,
    created_at timestamptz default now()
); 