# Crave Mobile Accessories - Setup Guide

## Environment Setup

Your Supabase database is already configured. The environment variables are in `.env`:

```
EXPO_PUBLIC_SUPABASE_URL=https://nthblzqbpyvsiagpznum.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Database Structure

The following tables are already created in your Supabase database:

- **categories**: Product categories (Cases, Chargers, Headphones, etc.)
- **products**: Product catalog with images, prices, stock
- **user_profiles**: Customer profiles and addresses
- **cart_items**: Shopping cart items
- **orders**: Customer orders
- **order_items**: Items in each order

## Adding Sample Data

You can add sample data through the Supabase Dashboard SQL Editor:

### 1. Add Categories

```sql
INSERT INTO categories (name, description, image_url) VALUES
('Phone Cases', 'Protective cases for all phone models', 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg'),
('Chargers', 'Fast charging cables and adapters', 'https://images.pexels.com/photos/4318994/pexels-photo-4318994.jpeg'),
('Headphones', 'Wireless and wired headphones', 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg'),
('Screen Protectors', 'Tempered glass and film protectors', 'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg');
```

### 2. Add Sample Products

```sql
-- Get category IDs first
SELECT id, name FROM categories;

-- Replace <category_id> with actual IDs from above query
INSERT INTO products (name, description, price, stock_quantity, category_id, images, specifications, is_featured, is_active) VALUES
(
  'Premium Leather Phone Case',
  'Handcrafted genuine leather case with card slots',
  29.99,
  50,
  '<phone_cases_category_id>',
  '["https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg"]',
  '{"material": "Genuine Leather", "color": "Brown", "compatibility": "iPhone 14/15"}',
  true,
  true
),
(
  'Fast Charge USB-C Cable',
  '6ft braided USB-C cable with 100W power delivery',
  19.99,
  100,
  '<chargers_category_id>',
  '["https://images.pexels.com/photos/4318994/pexels-photo-4318994.jpeg"]',
  '{"length": "6 feet", "power": "100W", "connector": "USB-C to USB-C"}',
  true,
  true
),
(
  'Wireless Noise Cancelling Headphones',
  'Premium over-ear headphones with active noise cancellation',
  149.99,
  25,
  '<headphones_category_id>',
  '["https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg"]',
  '{"type": "Over-ear", "battery": "30 hours", "noise_cancelling": "Active ANC"}',
  true,
  true
);
```

## Admin Panel (Web-based)

For managing products, you have two options:

### Option 1: Use Supabase Dashboard (Recommended)

1. Go to https://supabase.com/dashboard
2. Select your project
3. Click on "Table Editor" in the sidebar
4. You can directly manage:
   - Categories
   - Products (add/edit/delete)
   - View orders and customers
   - Update order statuses

### Option 2: Build Custom Admin Panel (Future)

A separate web-based admin panel can be created using:
- React/Next.js for the frontend
- Same Supabase backend
- Admin-only authentication with RLS policies

To create admin-only access, you would:

1. Add an `is_admin` field to `user_profiles`
2. Create admin-specific RLS policies:

```sql
-- Allow admins to manage products
CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );
```

## Image Management with Cloudinary

When you're ready to integrate Cloudinary:

1. Sign up at https://cloudinary.com
2. Get your Cloud Name, API Key, and API Secret
3. Create a Supabase Edge Function for uploading images
4. Store the Cloudinary URL in the `images` field of products

Example Edge Function pattern:
```typescript
// Will upload to Cloudinary and return the URL
const imageUrl = await uploadToCloudinary(imageFile);
// Store URL in database
await supabase.from('products').insert({ images: [imageUrl], ... });
```

## Payment Integration with Flutterwave

The checkout flow is prepared for Flutterwave integration:

1. Sign up at https://flutterwave.com
2. Get your Public and Secret keys
3. Add to your `.env`:
```
EXPO_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=your_public_key
```

4. Integrate Flutterwave in the checkout screen:
```typescript
// Use Flutterwave React Native SDK
import { FlutterwaveButton } from 'flutterwave-react-native';
```

## Running the App

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Scan the QR code with Expo Go app on your phone

## Managing Orders

Order statuses can be updated via Supabase Dashboard:

- `pending`: Order placed, awaiting processing
- `processing`: Order is being prepared
- `shipped`: Order has been shipped
- `delivered`: Order delivered to customer
- `cancelled`: Order cancelled

Payment statuses:
- `pending`: Awaiting payment
- `completed`: Payment successful
- `failed`: Payment failed

## Testing the App

1. Create a test account using the Register screen
2. Browse products and add items to cart
3. Complete checkout process
4. View orders in Profile tab

## Support

For issues or questions:
- Check Supabase logs in the Dashboard
- Review table data in Table Editor
- Check authentication logs in Auth section
