-- Database update to add 'busco_servicio' type for services
-- Execute this in your Supabase SQL editor

-- Update the anuncios table constraint to include the new service type
ALTER TABLE anuncios DROP CONSTRAINT IF EXISTS anuncios_tipo_check;
ALTER TABLE anuncios ADD CONSTRAINT anuncios_tipo_check 
CHECK (tipo IN ('vendo', 'compro', 'alquilo', 'busco_alquiler', 'oferta', 'busco_servicio'));

-- Update the view to handle the new service type
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

-- Update existing triggers and functions if needed
-- (They should continue working with the new enum value)

-- Add index for better performance on the new tipo value
CREATE INDEX IF NOT EXISTS idx_anuncios_tipo_busco_servicio ON anuncios(tipo) WHERE tipo = 'busco_servicio';

COMMENT ON CONSTRAINT anuncios_tipo_check ON anuncios IS 'Updated to include busco_servicio type for searching services';
