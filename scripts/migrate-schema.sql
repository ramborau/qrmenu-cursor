-- Add showImages column to categories table
ALTER TABLE categories ADD COLUMN IF NOT EXISTS show_images BOOLEAN DEFAULT true;

-- Add darkTheme column to restaurants table
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS dark_theme BOOLEAN DEFAULT false;

-- Update existing categories to have showImages = true by default
UPDATE categories SET show_images = true WHERE show_images IS NULL;

-- Update existing restaurants to have darkTheme = false by default
UPDATE restaurants SET dark_theme = false WHERE dark_theme IS NULL;

