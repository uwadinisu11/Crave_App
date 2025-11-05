-- Sample Data for Crave Mobile Accessories
-- Run this in your Supabase SQL Editor to populate the database with sample products

-- Insert Categories
INSERT INTO categories (name, description, image_url) VALUES
('Phone Cases', 'Protective and stylish cases for all phone models', 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg'),
('Chargers & Cables', 'Fast charging solutions and durable cables', 'https://images.pexels.com/photos/4318994/pexels-photo-4318994.jpeg'),
('Headphones', 'Premium audio accessories', 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg'),
('Screen Protectors', 'Tempered glass and film protectors', 'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg'),
('Phone Holders', 'Car mounts and desk stands', 'https://images.pexels.com/photos/1092671/pexels-photo-1092671.jpeg'),
('Power Banks', 'Portable charging solutions', 'https://images.pexels.com/photos/4320478/pexels-photo-4320478.jpeg'),
('Pop Sockets', 'Grips and stands for phones', 'https://images.pexels.com/photos/1851415/pexels-photo-1851415.jpeg'),
('Wireless Chargers', 'Qi-enabled wireless charging pads', 'https://images.pexels.com/photos/4320480/pexels-photo-4320480.jpeg')
ON CONFLICT DO NOTHING;

-- Note: After running the above, get the category IDs by running:
-- SELECT id, name FROM categories ORDER BY name;

-- Then use those IDs to insert products below. Replace the <category_id_here> placeholders.

-- Sample Products for Phone Cases Category
INSERT INTO products (name, description, price, stock_quantity, category_id, images, specifications, is_featured, is_active)
SELECT
  'Premium Leather Phone Case',
  'Handcrafted genuine leather case with card slots. Perfect protection with a professional look.',
  29.99,
  50,
  id,
  '["https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg", "https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg"]'::jsonb,
  '{"material": "Genuine Leather", "color": "Brown", "compatibility": "iPhone 14/15", "card_slots": "2"}'::jsonb,
  true,
  true
FROM categories WHERE name = 'Phone Cases'
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, stock_quantity, category_id, images, specifications, is_featured, is_active)
SELECT
  'Silicone Shockproof Case',
  'Soft silicone case with enhanced corner protection. Available in multiple colors.',
  14.99,
  100,
  id,
  '["https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg"]'::jsonb,
  '{"material": "Silicone", "colors": "Black, Blue, Red", "protection": "Shockproof"}'::jsonb,
  true,
  true
FROM categories WHERE name = 'Phone Cases'
ON CONFLICT DO NOTHING;

-- Sample Products for Chargers Category
INSERT INTO products (name, description, price, stock_quantity, category_id, images, specifications, is_featured, is_active)
SELECT
  'Fast Charge USB-C Cable 6ft',
  'Braided USB-C cable with 100W power delivery. Durable and tangle-free.',
  19.99,
  100,
  id,
  '["https://images.pexels.com/photos/4318994/pexels-photo-4318994.jpeg"]'::jsonb,
  '{"length": "6 feet", "power": "100W", "connector": "USB-C to USB-C", "material": "Braided Nylon"}'::jsonb,
  true,
  true
FROM categories WHERE name = 'Chargers & Cables'
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, stock_quantity, category_id, images, specifications, is_featured, is_active)
SELECT
  '65W Dual Port Wall Charger',
  'Fast charge two devices simultaneously with GaN technology.',
  34.99,
  75,
  id,
  '["https://images.pexels.com/photos/4320478/pexels-photo-4320478.jpeg"]'::jsonb,
  '{"power": "65W", "ports": "2x USB-C", "technology": "GaN", "foldable": "Yes"}'::jsonb,
  false,
  true
FROM categories WHERE name = 'Chargers & Cables'
ON CONFLICT DO NOTHING;

-- Sample Products for Headphones Category
INSERT INTO products (name, description, price, stock_quantity, category_id, images, specifications, is_featured, is_active)
SELECT
  'Wireless Noise Cancelling Headphones',
  'Premium over-ear headphones with active noise cancellation and 30-hour battery life.',
  149.99,
  25,
  id,
  '["https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg"]'::jsonb,
  '{"type": "Over-ear", "battery": "30 hours", "noise_cancelling": "Active ANC", "connectivity": "Bluetooth 5.0"}'::jsonb,
  true,
  true
FROM categories WHERE name = 'Headphones'
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, stock_quantity, category_id, images, specifications, is_featured, is_active)
SELECT
  'True Wireless Earbuds',
  'Compact wireless earbuds with IPX4 water resistance and charging case.',
  59.99,
  60,
  id,
  '["https://images.pexels.com/photos/8000616/pexels-photo-8000616.jpeg"]'::jsonb,
  '{"type": "In-ear", "battery": "24 hours with case", "water_resistance": "IPX4", "connectivity": "Bluetooth 5.0"}'::jsonb,
  true,
  true
FROM categories WHERE name = 'Headphones'
ON CONFLICT DO NOTHING;

-- Sample Products for Screen Protectors Category
INSERT INTO products (name, description, price, stock_quantity, category_id, images, specifications, is_featured, is_active)
SELECT
  'Tempered Glass Screen Protector',
  '9H hardness tempered glass with oleophobic coating. Easy bubble-free installation.',
  9.99,
  200,
  id,
  '["https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg"]'::jsonb,
  '{"hardness": "9H", "thickness": "0.33mm", "compatibility": "Universal", "features": "Anti-fingerprint"}'::jsonb,
  false,
  true
FROM categories WHERE name = 'Screen Protectors'
ON CONFLICT DO NOTHING;

-- Sample Products for Power Banks Category
INSERT INTO products (name, description, price, stock_quantity, category_id, images, specifications, is_featured, is_active)
SELECT
  '20000mAh Power Bank',
  'High-capacity portable charger with dual USB ports and LED display.',
  39.99,
  45,
  id,
  '["https://images.pexels.com/photos/4320478/pexels-photo-4320478.jpeg"]'::jsonb,
  '{"capacity": "20000mAh", "ports": "2x USB-A, 1x USB-C", "display": "LED", "fast_charge": "Yes"}'::jsonb,
  false,
  true
FROM categories WHERE name = 'Power Banks'
ON CONFLICT DO NOTHING;

-- Sample Products for Wireless Chargers Category
INSERT INTO products (name, description, price, stock_quantity, category_id, images, specifications, is_featured, is_active)
SELECT
  '15W Wireless Charging Pad',
  'Qi-certified wireless charger with non-slip surface and LED indicator.',
  24.99,
  80,
  id,
  '["https://images.pexels.com/photos/4320480/pexels-photo-4320480.jpeg"]'::jsonb,
  '{"power": "15W", "standard": "Qi-certified", "features": "LED indicator, Non-slip", "compatibility": "All Qi devices"}'::jsonb,
  false,
  true
FROM categories WHERE name = 'Wireless Chargers'
ON CONFLICT DO NOTHING;

-- Sample Products for Phone Holders Category
INSERT INTO products (name, description, price, stock_quantity, category_id, images, specifications, is_featured, is_active)
SELECT
  'Magnetic Car Mount',
  'Strong magnetic phone holder for car dashboard or windshield.',
  16.99,
  90,
  id,
  '["https://images.pexels.com/photos/1092671/pexels-photo-1092671.jpeg"]'::jsonb,
  '{"type": "Magnetic", "mounting": "Dashboard/Windshield", "rotation": "360°", "compatibility": "Universal"}'::jsonb,
  false,
  true
FROM categories WHERE name = 'Phone Holders'
ON CONFLICT DO NOTHING;

-- Sample Products for Pop Sockets Category
INSERT INTO products (name, description, price, stock_quantity, category_id, images, specifications, is_featured, is_active)
SELECT
  'PopSocket Grip & Stand',
  'Collapsible grip and stand for your phone. Multiple designs available.',
  12.99,
  150,
  id,
  '["https://images.pexels.com/photos/1851415/pexels-photo-1851415.jpeg"]'::jsonb,
  '{"type": "Grip & Stand", "collapsible": "Yes", "reusable": "Yes", "designs": "Multiple available"}'::jsonb,
  false,
  true
FROM categories WHERE name = 'Pop Sockets'
ON CONFLICT DO NOTHING;

-- Verify the data
SELECT
  p.name as product_name,
  p.price,
  p.stock_quantity,
  c.name as category_name,
  p.is_featured
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
ORDER BY c.name, p.name;
