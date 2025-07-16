-- Clear existing categories
DELETE FROM categories;

-- Insert comprehensive B2B categories for Kenya marketplace
INSERT INTO categories (id, name, slug, created_at) VALUES
-- Electronics & Technology
('cat_electronics', 'Electronics & Technology', 'electronics', NOW()),
('cat_computers', 'Computers & IT Equipment', 'computers-it', NOW()),
('cat_mobile', 'Mobile Phones & Accessories', 'mobile-phones', NOW()),
('cat_appliances', 'Home Appliances', 'home-appliances', NOW()),

-- Fashion & Textiles
('cat_fashion', 'Fashion & Apparel', 'fashion-apparel', NOW()),
('cat_textiles', 'Textiles & Fabrics', 'textiles-fabrics', NOW()),
('cat_footwear', 'Footwear & Leather Goods', 'footwear-leather', NOW()),
('cat_jewelry', 'Jewelry & Accessories', 'jewelry-accessories', NOW()),

-- Agriculture & Food
('cat_agriculture', 'Agriculture & Farming', 'agriculture-farming', NOW()),
('cat_food', 'Food & Beverages', 'food-beverages', NOW()),
('cat_livestock', 'Livestock & Animal Feed', 'livestock-feed', NOW()),
('cat_seeds', 'Seeds & Fertilizers', 'seeds-fertilizers', NOW()),

-- Construction & Building
('cat_construction', 'Construction Materials', 'construction-materials', NOW()),
('cat_tools', 'Tools & Hardware', 'tools-hardware', NOW()),
('cat_plumbing', 'Plumbing & Electrical', 'plumbing-electrical', NOW()),
('cat_machinery', 'Heavy Machinery & Equipment', 'heavy-machinery', NOW()),

-- Automotive & Transport
('cat_automotive', 'Automotive Parts & Accessories', 'automotive-parts', NOW()),
('cat_vehicles', 'Vehicles & Transport', 'vehicles-transport', NOW()),
('cat_tires', 'Tires & Wheels', 'tires-wheels', NOW()),

-- Health & Beauty
('cat_health', 'Health & Medical Supplies', 'health-medical', NOW()),
('cat_beauty', 'Beauty & Personal Care', 'beauty-personal-care', NOW()),
('cat_pharmaceuticals', 'Pharmaceuticals', 'pharmaceuticals', NOW()),

-- Home & Office
('cat_furniture', 'Furniture & Decor', 'furniture-decor', NOW()),
('cat_office', 'Office Supplies & Equipment', 'office-supplies', NOW()),
('cat_kitchen', 'Kitchen & Dining', 'kitchen-dining', NOW()),

-- Industrial & Manufacturing
('cat_industrial', 'Industrial Equipment', 'industrial-equipment', NOW()),
('cat_chemicals', 'Chemicals & Raw Materials', 'chemicals-materials', NOW()),
('cat_packaging', 'Packaging & Printing', 'packaging-printing', NOW()),

-- Sports & Recreation
('cat_sports', 'Sports & Recreation', 'sports-recreation', NOW()),
('cat_outdoor', 'Outdoor & Camping', 'outdoor-camping', NOW()),

-- Education & Books
('cat_education', 'Education & Training', 'education-training', NOW()),
('cat_books', 'Books & Stationery', 'books-stationery', NOW()),

-- Energy & Environment
('cat_solar', 'Solar & Renewable Energy', 'solar-renewable', NOW()),
('cat_generators', 'Generators & Power Equipment', 'generators-power', NOW()),

-- Security & Safety
('cat_security', 'Security & Safety Equipment', 'security-safety', NOW()),

-- Arts & Crafts (keeping traditional crafts)
('cat_crafts', 'Arts & Traditional Crafts', 'arts-crafts', NOW());
