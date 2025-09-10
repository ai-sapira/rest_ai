-- Database Schema Updates for Providers and Rental Functionality
-- Execute these commands in your Supabase SQL editor

-- 1. Create providers table
CREATE TABLE IF NOT EXISTS providers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  cif TEXT,
  description TEXT,
  website TEXT,
  phone TEXT,
  email TEXT,
  address JSONB,
  logo_url TEXT,
  verified BOOLEAN DEFAULT FALSE,
  verification_date TIMESTAMPTZ,
  rating DECIMAL(2,1) DEFAULT 0.0,
  total_sales INTEGER DEFAULT 0,
  total_rentals INTEGER DEFAULT 0,
  specialties TEXT[],
  service_areas TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 2. Add RLS policies for providers table
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;

-- Users can read all verified providers
CREATE POLICY "Users can view verified providers" ON providers
  FOR SELECT USING (verified = true);

-- Users can read their own provider profile
CREATE POLICY "Users can view own provider profile" ON providers
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own provider profile
CREATE POLICY "Users can create own provider profile" ON providers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own provider profile
CREATE POLICY "Users can update own provider profile" ON providers
  FOR UPDATE USING (auth.uid() = user_id);

-- 3. Update anuncios table to support new features
ALTER TABLE anuncios 
ADD COLUMN IF NOT EXISTS actor_type TEXT DEFAULT 'user' CHECK (actor_type IN ('user', 'provider')),
ADD COLUMN IF NOT EXISTS provider_id UUID REFERENCES providers(id),
ADD COLUMN IF NOT EXISTS precio_alquiler_dia DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS precio_alquiler_semana DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS precio_alquiler_mes DECIMAL(10,2);

-- Update tipo enum to include new values
-- Note: In Supabase, you might need to drop and recreate the constraint
ALTER TABLE anuncios DROP CONSTRAINT IF EXISTS anuncios_tipo_check;
ALTER TABLE anuncios ADD CONSTRAINT anuncios_tipo_check 
CHECK (tipo IN ('vendo', 'compro', 'alquilo', 'busco_alquiler', 'oferta'));

-- 4. Create function to update provider stats
CREATE OR REPLACE FUNCTION update_provider_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update total_sales when a sale is completed
  IF NEW.tipo = 'vendo' AND NEW.estado = 'finalizado' AND OLD.estado != 'finalizado' THEN
    UPDATE providers 
    SET total_sales = total_sales + 1
    WHERE id = NEW.provider_id;
  END IF;
  
  -- Update total_rentals when a rental is completed
  IF NEW.tipo = 'alquilo' AND NEW.estado = 'finalizado' AND OLD.estado != 'finalizado' THEN
    UPDATE providers 
    SET total_rentals = total_rentals + 1
    WHERE id = NEW.provider_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Create trigger for provider stats
DROP TRIGGER IF EXISTS update_provider_stats_trigger ON anuncios;
CREATE TRIGGER update_provider_stats_trigger
  AFTER UPDATE ON anuncios
  FOR EACH ROW
  EXECUTE FUNCTION update_provider_stats();

-- 6. Create function to get provider info for anuncios
CREATE OR REPLACE FUNCTION get_anuncio_with_provider_info(anuncio_id UUID)
RETURNS TABLE (
  anuncio_data JSONB,
  provider_info JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    to_jsonb(a.*) as anuncio_data,
    CASE 
      WHEN a.actor_type = 'provider' AND p.id IS NOT NULL THEN
        jsonb_build_object(
          'name', p.name,
          'cif', p.cif,
          'verified', p.verified,
          'rating', p.rating,
          'total_sales', p.total_sales,
          'total_rentals', p.total_rentals
        )
      ELSE NULL
    END as provider_info
  FROM anuncios a
  LEFT JOIN providers p ON a.provider_id = p.id
  WHERE a.id = anuncio_id;
END;
$$ LANGUAGE plpgsql;

-- 7. Create view for anuncios with provider info
CREATE OR REPLACE VIEW anuncios_with_provider AS
SELECT 
  a.*,
  CASE 
    WHEN a.actor_type = 'provider' AND p.id IS NOT NULL THEN
      jsonb_build_object(
        'name', p.name,
        'cif', p.cif,
        'verified', p.verified,
        'rating', p.rating,
        'total_sales', p.total_sales,
        'total_rentals', p.total_rentals
      )
    ELSE NULL
  END as provider_info
FROM anuncios a
LEFT JOIN providers p ON a.provider_id = p.id;

-- 8. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_anuncios_actor_type ON anuncios(actor_type);
CREATE INDEX IF NOT EXISTS idx_anuncios_provider_id ON anuncios(provider_id);
CREATE INDEX IF NOT EXISTS idx_anuncios_tipo ON anuncios(tipo);
CREATE INDEX IF NOT EXISTS idx_providers_verified ON providers(verified);
CREATE INDEX IF NOT EXISTS idx_providers_rating ON providers(rating DESC);

-- 9. Create function to increment provider views/contacts
CREATE OR REPLACE FUNCTION increment_provider_metric(
  provider_uuid UUID,
  metric_type TEXT
)
RETURNS void AS $$
BEGIN
  IF metric_type = 'contacts' THEN
    UPDATE providers 
    SET total_sales = total_sales + 1 
    WHERE id = provider_uuid;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 10. Sample data for testing (optional)
INSERT INTO providers (
  user_id, 
  name, 
  description, 
  verified, 
  rating,
  specialties,
  service_areas
) VALUES 
-- Note: Replace with actual user UUIDs from your auth.users table
-- (
--   'your-user-uuid-here',
--   'Equipamientos Hostelería S.L.',
--   'Especialistas en maquinaria de cocina profesional',
--   true,
--   4.8,
--   ARRAY['Maquinaria de cocina', 'Equipamiento de bar'],
--   ARRAY['Madrid', 'Castilla-La Mancha']
-- )
ON CONFLICT (user_id) DO NOTHING;

-- 11. Update existing anuncios to include actor_type and provider_id
-- This would need to be customized based on your existing data
-- UPDATE anuncios SET actor_type = 'user' WHERE actor_type IS NULL;

COMMENT ON TABLE providers IS 'Provider profiles for businesses selling equipment and services';
COMMENT ON TABLE anuncios IS 'Advertisements for equipment, services, and rentals - updated to support providers and rentals';
COMMENT ON VIEW anuncios_with_provider IS 'View that joins anuncios with provider information for easy querying';
