-- Update categories for global marketplace
DELETE FROM categories;

INSERT INTO categories (id, name, slug, "createdAt") VALUES
  ('cat_electronics', 'Electronics', 'electronics', NOW()),
  ('cat_fashion', 'Fashion & Apparel', 'fashion', NOW()),
  ('cat_home_garden', 'Home & Garden', 'home-garden', NOW()),
  ('cat_tools', 'Tools & Hardware', 'tools', NOW()),
  ('cat_automotive', 'Automotive', 'automotive', NOW()),
  ('cat_sports', 'Sports & Recreation', 'sports', NOW()),
  ('cat_health', 'Health & Beauty', 'health-beauty', NOW()),
  ('cat_books', 'Books & Media', 'books-media', NOW()),
  ('cat_computers', 'Computers & IT', 'computers', NOW()),
  ('cat_watches', 'Watches & Jewelry', 'watches', NOW()),
  ('cat_photography', 'Photography', 'photography', NOW()),
  ('cat_audio', 'Audio & Video', 'audio', NOW()),
  ('cat_toys', 'Toys & Games', 'toys', NOW()),
  ('cat_office', 'Office Supplies', 'office', NOW()),
  ('cat_industrial', 'Industrial Equipment', 'industrial', NOW()),
  ('cat_food', 'Food & Beverages', 'food', NOW()),
  ('cat_pet', 'Pet Supplies', 'pet', NOW()),
  ('cat_baby', 'Baby & Kids', 'baby', NOW()),
  ('cat_travel', 'Travel & Luggage', 'travel', NOW()),
  ('cat_crafts', 'Arts & Crafts', 'crafts', NOW());
