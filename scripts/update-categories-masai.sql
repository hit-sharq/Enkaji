-- Update categories for Masai marketplace
DELETE FROM categories;

INSERT INTO categories (id, name, slug) VALUES
('cat_jewelry', 'Jewelry & Accessories', 'jewelry-accessories'),
('cat_clothing', 'Traditional Clothing', 'traditional-clothing'),
('cat_home', 'Home Decor', 'home-decor'),
('cat_art', 'Art & Sculptures', 'art-sculptures'),
('cat_bags', 'Bags & Leather Goods', 'bags-leather-goods'),
('cat_tools', 'Traditional Tools', 'traditional-tools'),
('cat_ceremonial', 'Ceremonial Items', 'ceremonial-items'),
('cat_textiles', 'Textiles & Fabrics', 'textiles-fabrics');
