-- ============================================
-- GARUDA ELECTRICALS & HARDWARES
-- Database Schema for Supabase (PostgreSQL)
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE (Admin users)
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX idx_users_email ON users(email);

-- ============================================
-- CATEGORIES TABLE
-- ============================================
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on slug for faster lookups
CREATE INDEX idx_categories_slug ON categories(slug);

-- ============================================
-- PRODUCTS TABLE
-- ============================================
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    brand VARCHAR(255),
    description TEXT,
    short_description VARCHAR(500),
    image_url TEXT,
    price DECIMAL(10, 2),
    unit VARCHAR(50) DEFAULT 'piece',
    stock_quantity INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_featured ON products(is_featured);

-- ============================================
-- CUSTOMERS TABLE
-- ============================================
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    gst_number VARCHAR(20),
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on phone for faster lookups
CREATE INDEX idx_customers_phone ON customers(phone);

-- ============================================
-- INVOICES TABLE
-- ============================================
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,
    subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(12, 2) DEFAULT 0,
    discount_amount DECIMAL(12, 2) DEFAULT 0,
    total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    status VARCHAR(50) DEFAULT 'draft',
    payment_status VARCHAR(50) DEFAULT 'pending',
    notes TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_invoices_customer ON invoices(customer_id);
CREATE INDEX idx_invoices_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_date ON invoices(invoice_date);
CREATE INDEX idx_invoices_status ON invoices(status);

-- ============================================
-- INVOICE ITEMS TABLE
-- ============================================
CREATE TABLE invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    description TEXT,
    quantity DECIMAL(10, 2) NOT NULL DEFAULT 1,
    unit VARCHAR(50) DEFAULT 'piece',
    unit_price DECIMAL(10, 2) NOT NULL,
    tax_rate DECIMAL(5, 2) DEFAULT 0,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    discount_rate DECIMAL(5, 2) DEFAULT 0,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on invoice_id
CREATE INDEX idx_invoice_items_invoice ON invoice_items(invoice_id);

-- ============================================
-- OFFERS TABLE
-- ============================================
CREATE TABLE offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    discount_percentage DECIMAL(5, 2),
    offer_code VARCHAR(50),
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on active offers
CREATE INDEX idx_offers_active ON offers(is_active, start_date, end_date);

-- ============================================
-- CONTACT MESSAGES TABLE (for contact form)
-- ============================================
CREATE TABLE contact_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    subject VARCHAR(255),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger for users table
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for categories table
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for products table
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for customers table
CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for invoices table
CREATE TRIGGER update_invoices_updated_at
    BEFORE UPDATE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for offers table
CREATE TRIGGER update_offers_updated_at
    BEFORE UPDATE ON offers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SEED DATA
-- ============================================

-- Insert default admin user (password: admin123)
-- Password hash generated with bcrypt
INSERT INTO users (email, password_hash, full_name, role) VALUES 
('Garudaelectrical@gmail.com', '$2b$12$YBJ6p15cm1YMU.OJrDYHi.UTRViSC.8vQQmBIZbX7nWMQpdZnDlu6', 'Admin User', 'admin');

-- Insert categories
INSERT INTO categories (name, slug, description, icon, display_order) VALUES 
('Wires & Cables', 'wires-cables', 'High-quality electrical wires and cables for residential and commercial use', 'cable', 1),
('Switches & Sockets', 'switches-sockets', 'Premium switches, sockets, and modular accessories', 'toggle-left', 2),
('Lights & Fans', 'lights-fans', 'LED lights, ceiling fans, and lighting fixtures', 'lightbulb', 3),
('Pipes & Fittings', 'pipes-fittings', 'PVC pipes, fittings, and plumbing accessories', 'cylinder', 4),
('Tools', 'tools', 'Electrical and hardware tools for professionals', 'wrench', 5),
('Motors & Pumps', 'motors-pumps', 'Electric motors, water pumps, and submersibles', 'settings', 6);

-- Insert sample products
INSERT INTO products (category_id, name, slug, brand, short_description, description, price, unit, stock_quantity, is_featured) VALUES 
((SELECT id FROM categories WHERE slug = 'wires-cables'), 'Finolex FR Cable 1.5 sq mm', 'finolex-fr-cable-1.5mm', 'Finolex', 'Fire retardant electrical wire 1.5 sq mm', 'High-quality Finolex fire retardant PVC insulated copper cable. Suitable for domestic and industrial wiring. 90 meters per coil.', 2450.00, 'coil', 50, true),
((SELECT id FROM categories WHERE slug = 'wires-cables'), 'Havells Lifeline Cable 2.5 sq mm', 'havells-lifeline-2.5mm', 'Havells', 'Premium copper wire 2.5 sq mm', 'Havells Lifeline Plus S3 HRFR cables with enhanced fire safety. 90 meters per coil.', 4200.00, 'coil', 35, true),
((SELECT id FROM categories WHERE slug = 'switches-sockets'), 'Anchor Roma Plus Switch', 'anchor-roma-switch', 'Anchor', 'Modular switch 10A', 'Premium modular switch with sleek design. 10A rating. Available in white color.', 45.00, 'piece', 200, true),
((SELECT id FROM categories WHERE slug = 'switches-sockets'), 'Legrand Mylinc 6A Socket', 'legrand-mylinc-socket', 'Legrand', '6A 2 pin socket', 'Legrand Mylinc 2 module 6A socket. Durable polycarbonate construction.', 85.00, 'piece', 150, false),
((SELECT id FROM categories WHERE slug = 'lights-fans'), 'Crompton Aura Prime Fan', 'crompton-aura-fan', 'Crompton', '48 inch ceiling fan', 'High-speed ceiling fan with 48 inch sweep. Energy efficient with 5-star rating.', 2850.00, 'piece', 25, true),
((SELECT id FROM categories WHERE slug = 'lights-fans'), 'Philips LED Bulb 12W', 'philips-led-12w', 'Philips', '12W LED bulb cool white', 'Philips Ace Saver LED bulb 12W. 6500K cool daylight. B22 base.', 120.00, 'piece', 100, true),
((SELECT id FROM categories WHERE slug = 'pipes-fittings'), 'Supreme UPVC Pipe 1 inch', 'supreme-upvc-1inch', 'Supreme', 'UPVC pipe 1 inch 6kg', 'Supreme UPVC pressure pipe. 1 inch diameter. 6 kg/sq cm pressure rating.', 280.00, 'piece', 80, false),
((SELECT id FROM categories WHERE slug = 'pipes-fittings'), 'Astral CPVC Pipe 3/4 inch', 'astral-cpvc-3-4inch', 'Astral', 'CPVC hot water pipe', 'Astral CPVC Pro pipe for hot and cold water supply. SDR 11.', 450.00, 'piece', 60, true),
((SELECT id FROM categories WHERE slug = 'tools'), 'Stanley Combination Plier', 'stanley-combo-plier', 'Stanley', '8 inch combination plier', 'Stanley FatMax 8 inch combination plier with ergonomic grip.', 650.00, 'piece', 40, false),
((SELECT id FROM categories WHERE slug = 'tools'), 'Taparia Screwdriver Set', 'taparia-screwdriver-set', 'Taparia', '6 piece screwdriver set', 'Professional grade screwdriver set with 6 pieces. Includes flat and Phillips head.', 380.00, 'set', 30, true),
((SELECT id FROM categories WHERE slug = 'motors-pumps'), 'Crompton Mini Crest Pump', 'crompton-mini-crest', 'Crompton', '0.5 HP water pump', 'Self-priming monoblock pump. 0.5 HP motor. Suitable for domestic use.', 4500.00, 'piece', 15, true),
((SELECT id FROM categories WHERE slug = 'motors-pumps'), 'CRI Submersible Pump', 'cri-submersible', 'CRI', '1 HP submersible pump', 'CRI 1 HP 4 inch borewell submersible pump. High efficiency motor.', 12500.00, 'piece', 10, false);

-- Insert sample offers
INSERT INTO offers (title, description, discount_percentage, offer_code, start_date, end_date, is_active, display_order) VALUES 
('Grand Summer Sale', 'Get up to 20% off on all ceiling fans and coolers. Beat the heat with great savings!', 20.00, 'SUMMER20', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', true, 1),
('Festive Season Offer', 'Special discounts on lighting products. Make your home bright this festive season!', 15.00, 'FESTIVE15', CURRENT_DATE, CURRENT_DATE + INTERVAL '45 days', true, 2),
('Contractor Special', 'Bulk purchase discounts for contractors and builders. Contact us for special pricing.', NULL, NULL, CURRENT_DATE, CURRENT_DATE + INTERVAL '60 days', true, 3);

-- Insert sample customers
INSERT INTO customers (name, phone, email, address, city, state, pincode) VALUES 
('Raj Kumar', '9876543210', 'rajkumar@email.com', '123, Main Street, Near Bus Stand', 'Karur', 'Tamil Nadu', '639001'),
('Priya Electricals', '9876543211', 'priya.electricals@email.com', '45, Industrial Area, Phase 2', 'Karur', 'Tamil Nadu', '639002'),
('Mohammed Ismail', '9876543212', 'ismail@email.com', '78, Gandhi Road, Near Railway Station', 'Trichy', 'Tamil Nadu', '620001');

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Public read access for categories, products, and offers
CREATE POLICY "Public can view active categories" ON categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view active products" ON products
    FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view active offers" ON offers
    FOR SELECT USING (is_active = true AND (start_date IS NULL OR start_date <= CURRENT_DATE) AND (end_date IS NULL OR end_date >= CURRENT_DATE));

-- Public can insert contact messages
CREATE POLICY "Public can insert contact messages" ON contact_messages
    FOR INSERT WITH CHECK (true);

-- Admin full access (using service role key bypasses RLS)
-- These policies are for authenticated admin users

CREATE POLICY "Admin full access to users" ON users
    FOR ALL USING (true);

CREATE POLICY "Admin full access to categories" ON categories
    FOR ALL USING (true);

CREATE POLICY "Admin full access to products" ON products
    FOR ALL USING (true);

CREATE POLICY "Admin full access to customers" ON customers
    FOR ALL USING (true);

CREATE POLICY "Admin full access to invoices" ON invoices
    FOR ALL USING (true);

CREATE POLICY "Admin full access to invoice_items" ON invoice_items
    FOR ALL USING (true);

CREATE POLICY "Admin full access to offers" ON offers
    FOR ALL USING (true);

CREATE POLICY "Admin full access to contact_messages" ON contact_messages
    FOR ALL USING (true);
