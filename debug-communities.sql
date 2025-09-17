-- Debug script para verificar comunidades del usuario
-- Ejecuta esto en el SQL Editor de Supabase para verificar los datos

-- 1. Ver todos los usuarios (para obtener el ID correcto)
SELECT id, email, user_metadata FROM auth.users LIMIT 5;

-- 2. Ver todas las membresías de comunidades
SELECT * FROM community_members LIMIT 10;

-- 3. Ver todas las comunidades disponibles
SELECT id, name, slug, member_count FROM communities LIMIT 10;

-- 4. Para un usuario específico (reemplaza 'USER_ID_AQUI' con el ID real):
-- SELECT cm.*, c.name as community_name 
-- FROM community_members cm 
-- JOIN communities c ON cm.community_id = c.id 
-- WHERE cm.user_id = 'USER_ID_AQUI';

-- 5. Verificar si hay datos de prueba básicos
SELECT 
  (SELECT COUNT(*) FROM communities) as total_communities,
  (SELECT COUNT(*) FROM community_members) as total_memberships,
  (SELECT COUNT(*) FROM auth.users) as total_users;
