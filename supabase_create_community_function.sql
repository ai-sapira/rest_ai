-- SQL Script para crear función RPC en Supabase
-- Ejecutar en el SQL Editor de Supabase Dashboard

-- Función para crear comunidades con permisos adecuados
CREATE OR REPLACE FUNCTION create_community(
  p_name TEXT,
  p_description TEXT,
  p_slug TEXT,
  p_hashtag TEXT,
  p_is_public BOOLEAN DEFAULT true,
  p_avatar_url TEXT DEFAULT NULL,
  p_creator_id UUID DEFAULT auth.uid()
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER -- Ejecuta con permisos de superusuario
AS $$
DECLARE
  new_community communities%ROWTYPE;
  result JSON;
BEGIN
  -- Verificar que el usuario esté autenticado
  IF p_creator_id IS NULL THEN
    RAISE EXCEPTION 'Usuario no autenticado';
  END IF;

  -- Insertar la nueva comunidad
  INSERT INTO communities (
    name,
    description,
    slug,
    hashtag,
    is_public,
    avatar_url,
    member_count
  ) VALUES (
    p_name,
    p_description,
    p_slug,
    p_hashtag,
    p_is_public,
    p_avatar_url,
    1
  ) RETURNING * INTO new_community;

  -- Agregar al creador como miembro admin
  INSERT INTO community_members (
    community_id,
    user_id,
    role
  ) VALUES (
    new_community.id,
    p_creator_id,
    'admin'
  );

  -- Retornar la comunidad creada como JSON
  SELECT row_to_json(new_community) INTO result;
  
  RETURN result;
END;
$$;

-- Dar permisos de ejecución a usuarios autenticados
GRANT EXECUTE ON FUNCTION create_community TO authenticated;

-- Opcional: Si quieres que los usuarios anónimos también puedan crear comunidades
-- GRANT EXECUTE ON FUNCTION create_community TO anon;

