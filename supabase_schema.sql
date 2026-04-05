-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create inventory table
CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID UNIQUE REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0,
  hide_if_out_of_stock BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create product_images table
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  is_main BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create site_content table
CREATE TABLE site_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- Public Select Policies
CREATE POLICY "Public products are viewable by everyone" ON products FOR SELECT USING (status = 'active');
CREATE POLICY "Inventory is viewable by everyone" ON inventory FOR SELECT USING (true);
CREATE POLICY "Product images are viewable by everyone" ON product_images FOR SELECT USING (true);
CREATE POLICY "Site content is viewable by everyone" ON site_content FOR SELECT USING (true);

-- Admin All Policies (Using auth.jwt() ->> 'role' = 'service_role' or a custom claim/metadata check)
-- For simplicity in a prototype, we can use a metadata check if we don't use custom claims.
-- Here we assume 'admin' role is set in user metadata.
CREATE POLICY "Admins can do everything on products" ON products FOR ALL USING (
  auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
);
CREATE POLICY "Admins can do everything on inventory" ON inventory FOR ALL USING (
  auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
);
CREATE POLICY "Admins can do everything on product_images" ON product_images FOR ALL USING (
  auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
);
CREATE POLICY "Admins can do everything on site_content" ON site_content FOR ALL USING (
  auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_site_content_updated_at BEFORE UPDATE ON site_content FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Function to handle new product inventory creation
CREATE OR REPLACE FUNCTION handle_new_product_inventory()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO inventory (product_id, quantity)
    VALUES (NEW.id, 0);
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER on_product_created
  AFTER INSERT ON products
  FOR EACH ROW EXECUTE PROCEDURE handle_new_product_inventory();
