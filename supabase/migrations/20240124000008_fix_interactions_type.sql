-- Drop the existing type check constraint
ALTER TABLE interactions
DROP CONSTRAINT IF EXISTS interactions_type_check;

-- Add the new constraint with FEEDBACK type
ALTER TABLE interactions
ADD CONSTRAINT interactions_type_check
CHECK (type IN ('NOTE', 'STATUS_CHANGE', 'ASSIGNMENT', 'CREATION', 'FEEDBACK')); 