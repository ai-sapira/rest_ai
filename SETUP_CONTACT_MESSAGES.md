# Sistema de Mensajes de Contacto Directo

Este documento explica cómo configurar el sistema de mensajes de contacto directo entre usuarios a través de anuncios.

## ✅ Implementación Completada

### Funcionalidades Implementadas:

1. **Botón de Contactar** - Los botones "Contactar" en:
   - Tarjetas de anuncios (`AnuncioCard.tsx`)
   - Página de detalle del anuncio (`AnuncioDetail.tsx`)
   
2. **Sistema de Mensajes Extendido** - Hook `useMessages` actualizado para manejar:
   - Mensajes de transacciones (existente)
   - Mensajes de ofertas (existente)
   - **Mensajes de contacto directo (NUEVO)**

3. **Pantalla de Mensajes Actualizada** - La pantalla `/platform/mensajes` ahora muestra:
   - Conversaciones de transacciones
   - Conversaciones de ofertas
   - **Conversaciones de contacto directo**

## 🔧 Configuración Requerida

### Paso 1: Crear la tabla en Supabase

Ejecuta el siguiente script SQL en tu panel de Supabase (SQL Editor):

```sql
-- El contenido está en database_contact_messages.sql
```

### Paso 2: Verificar las Políticas RLS

La tabla `contact_messages` incluye políticas de Row Level Security (RLS) que permiten:
- Ver mensajes solo si eres el emisor o receptor
- Enviar mensajes (como emisor)
- Actualizar mensajes (para marcar como leídos)

## 🚀 Cómo Funciona

### Flujo de Usuario:

1. **Usuario ve un anuncio** → Hace clic en "Contactar"
2. **Navegación automática** → Se abre la pantalla de mensajes
3. **Chat directo** → Puede enviar mensajes al propietario del anuncio
4. **Tiempo real** → Los mensajes se actualizan automáticamente

### Estructura de Datos:

```typescript
interface ContactMessage {
  id: string
  anuncio_id: string        // ID del anuncio sobre el que se contacta
  sender_id: string         // Usuario que envía el mensaje
  receiver_id: string       // Usuario que recibe el mensaje
  message: string          // Contenido del mensaje
  message_type: 'text' | 'image' | 'system'
  attachment_url?: string  // URL de archivos adjuntos
  is_read: boolean        // Estado de lectura
  created_at: string      // Fecha de creación
  updated_at: string      // Fecha de actualización
}
```

## 📝 Archivos Modificados

- `src/components/AnuncioCard.tsx` - Botón contactar funcionará
- `src/pages/AnuncioDetail.tsx` - Botón contactar vendedor
- `src/hooks/useMessages.ts` - Extendido para contact_messages
- `src/pages/Mensajes.tsx` - Soporte para conversaciones de contacto
- `database_contact_messages.sql` - Script de creación de tabla

## ⚡ Características

- ✅ **Tiempo Real** - Los mensajes se actualizan automáticamente
- ✅ **Seguridad** - RLS implementado para privacidad
- ✅ **Navegación Intuitiva** - Flujo directo desde anuncio a chat
- ✅ **Interfaz Unificada** - Misma pantalla para todos los tipos de conversación
- ✅ **Responsive** - Funciona en móvil y escritorio

## 🎯 Estado Actual

**COMPLETADO** ✅
- Implementación del botón contactar
- Extensión del hook useMessages
- Actualización de la pantalla Mensajes
- Corrección de errores de linting

**PENDIENTE** ⏳
- Crear tabla `contact_messages` en Supabase (ejecutar SQL)
- Pruebas del flujo completo

## 🧪 Pruebas

Para probar el sistema:

1. Asegúrate de que la tabla `contact_messages` esté creada
2. Inicia sesión con un usuario
3. Ve a un anuncio de otro usuario
4. Haz clic en "Contactar" o "Contactar vendedor"
5. Envía un mensaje
6. Verifica que aparece en tiempo real

¡El sistema está listo para usar una vez que se ejecute el script SQL!
