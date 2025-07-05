-- Insert categories
INSERT INTO categories (id, name, slug, created_at) VALUES
('cat_1', 'Jewelry', 'jewelry', NOW()),
('cat_2', 'Textiles', 'textiles', NOW()),
('cat_3', 'Wood Carvings', 'wood-carvings', NOW()),
('cat_4', 'Traditional Items', 'traditional-items', NOW()),
('cat_5', 'Home Decor', 'home-decor', NOW()),
('cat_6', 'Accessories', 'accessories', NOW());

-- Note: Users will be created automatically via Clerk webhooks
-- Products will be created by artisans through the dashboard
-- This script just sets up the basic categories needed for the marketplace
