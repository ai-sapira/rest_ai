import { createClient } from '@supabase/supabase-js'

// Configuration - en producción estas vendrían de variables de entorno
const supabaseUrl = 'https://qewemfuebsvalmdearan.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFld2VtZnVlYnN2YWxtZGVhcmFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4ODA5NTcsImV4cCI6MjA3MjQ1Njk1N30.to6iEz0rQWPHL339FEpER0ygsgfh3Yjb8KiUjnU_N7Y'

// Create Supabase client with enhanced session persistence
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Ensure session persists across tab/window refreshes
    storage: localStorage,
    // More aggressive session refresh
    tokenRefreshMargin: 60, // Refresh token 60 seconds before expiry
  },
  // Enable real-time features
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// Project ID for MCP operations
export const SUPABASE_PROJECT_ID = 'qewemfuebsvalmdearan'

