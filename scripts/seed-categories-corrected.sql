-- Seed initial categories for Enkaji Trade Kenya
INSERT INTO categories (id, name, slug, "createdAt", "updatedAt") VALUES
  ('cat_electronics', 'Electronics & Technology', 'electronics-technology', NOW(), NOW()),
  ('cat_fashion', 'Fashion & Apparel', 'fashion-apparel', NOW(), NOW()),
  ('cat_home', 'Home & Garden', 'home-garden', NOW(), NOW()),
  ('cat_agriculture', 'Agriculture & Farming', 'agriculture-farming', NOW(), NOW()),
  ('cat_construction', 'Construction & Building', 'construction-building', NOW(), NOW()),
  ('cat_automotive', 'Automotive & Transport', 'automotive-transport', NOW(), NOW()),
  ('cat_health', 'Health & Beauty', 'health-beauty', NOW(), NOW()),
  ('cat_sports', 'Sports & Recreation', 'sports-recreation', NOW(), NOW()),
  ('cat_books', 'Books & Education', 'books-education', NOW(), NOW()),
  ('cat_crafts', 'Arts & Crafts', 'arts-crafts', NOW(), NOW()),
  ('cat_food', 'Food & Beverages', 'food-beverages', NOW(), NOW()),
  ('cat_business', 'Business & Industrial', 'business-industrial', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;
