-- Drop existing type check constraint
ALTER TABLE interactions
DROP CONSTRAINT IF EXISTS interactions_type_check;

-- Add new type check constraint including RATING
ALTER TABLE interactions
ADD CONSTRAINT interactions_type_check
CHECK (type IN (
  'NOTE',
  'STATUS_CHANGE',
  'ASSIGNMENT',
  'CREATION',
  'FEEDBACK',
  'RATING'
)); 