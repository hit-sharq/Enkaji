-- Seed initial categories for Enkaji Trade Kenya
INSERT INTO categories (id, name, slug, "createdAt") VALUES
  ('cat_electronics', 'Electronics & Technology', 'electronics-technology', NOW()),
  ('cat_fashion', 'Fashion & Apparel', 'fashion-apparel', NOW()),
  ('cat_home', 'Home & Garden', 'home-garden', NOW()),
  ('cat_agriculture', 'Agriculture & Farming', 'agriculture-farming', NOW()),
  ('cat_construction', 'Construction & Building', 'construction-building', NOW()),
  ('cat_automotive', 'Automotive & Transport', 'automotive-transport', NOW()),
  ('cat_health', 'Health & Beauty', 'health-beauty', NOW()),
  ('cat_sports', 'Sports & Recreation', 'sports-recreation', NOW()),
  ('cat_books', 'Books & Education', 'books-education', NOW()),
  ('cat_crafts', 'Arts & Crafts', 'arts-crafts', NOW()),
  ('cat_food', 'Food & Beverages', 'food-beverages', NOW()),
  ('cat_business', 'Business & Industrial', 'business-industrial', NOW())
ON CONFLICT (slug) DO NOTHING;
