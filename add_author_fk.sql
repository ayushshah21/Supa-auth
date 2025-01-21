-- Add the missing foreign key constraint for author_id
ALTER TABLE interactions
ADD CONSTRAINT interactions_author_id_fkey 
FOREIGN KEY (author_id) 
REFERENCES users(id) ON DELETE SET NULL; 