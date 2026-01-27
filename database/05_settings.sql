-- Create settings table for storing site configuration
CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster key lookups
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);

-- Insert default settings
INSERT INTO settings (key, value) VALUES
    ('business_name', 'Garuda Electricals & Hardwares'),
    ('business_email', 'Garudaelectrical@gmail.com'),
    ('business_phone', '919489114403'),
    ('business_whatsapp', '919489114403'),
    ('business_gst', '33BLPPS4603G1Z0'),
    ('business_address', 'No 51/1, Near Trichy Main Road, Gandhigramam'),
    ('business_city', 'Karur'),
    ('business_pincode', '639004'),
    ('google_maps_url', 'https://www.google.com/maps/place/GARUDA+ELECTRICALS/@10.9473066,78.1016167,17z'),
    ('google_maps_embed', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.8596112528863!2d78.10419157480366!3d10.947301389221685!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3baa2fe6bfffffe9%3A0x758cc7763a40c83c!2sGARUDA%20ELECTRICALS!5e0!3m2!1sen!2sin!4v1706359200000!5m2!1sen!2sin'),
    ('working_hours', '9:00 AM - 8:00 PM'),
    ('working_days', 'Monday - Saturday'),
    ('facebook_url', ''),
    ('instagram_url', ''),
    ('twitter_url', ''),
    ('youtube_url', '')
ON CONFLICT (key) DO NOTHING;

-- Enable RLS (Row Level Security) - uncomment if using Supabase RLS
-- ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow reading settings (public)
-- CREATE POLICY "Allow public read access to settings" ON settings
--     FOR SELECT USING (true);

-- Create policy to allow authenticated users to update settings
-- CREATE POLICY "Allow authenticated users to update settings" ON settings
--     FOR UPDATE USING (auth.role() = 'authenticated');

-- Create policy to allow authenticated users to insert settings
-- CREATE POLICY "Allow authenticated users to insert settings" ON settings
--     FOR INSERT WITH CHECK (auth.role() = 'authenticated');
