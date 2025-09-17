import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ChakraProvider } from "@chakra-ui/react";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { CommunitiesProvider } from "@/context/CommunitiesContext";
import Index from "./pages/Index";
import Platform from "./pages/Platform";
import NotFound from "./pages/NotFound";

// Configure QueryClient with optimal settings for Supabase
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes by default
      staleTime: 5 * 60 * 1000,
      // Keep data in cache for 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry failed requests up to 2 times
      retry: 2,
      // Don't refetch on window focus in development
      refetchOnWindowFocus: false,
      // Enable error boundaries
      throwOnError: false,
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
    },
  },
});

// Component that handles root redirect after auth is ready
function RootRedirect() {
  const { loading, user } = useAuth();
  
  console.log('🔍 RootRedirect: loading:', loading, 'user:', !!user, user?.id);
  
  // Wait for auth to finish loading completely before redirecting
  if (loading) {
    console.log('🔍 RootRedirect: Auth still loading, showing loading screen');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-6 animate-pulse">
            <img 
              src="/Guia_Repsol.svg" 
              alt="Guía Repsol" 
              className="h-12 w-auto"
            />
            <span className="font-medium text-2xl text-orange-600 italic">community</span>
          </div>
          <p className="text-gray-600">Inicializando autenticación...</p>
        </div>
      </div>
    );
  }
  
  // Once auth is ready, redirect to community (main page)
  console.log('🔍 RootRedirect: Auth ready, redirecting to community with user:', !!user);
  return <Navigate to="/platform/comunidad" replace />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CommunitiesProvider>
        <ChakraProvider>
          <ThemeProvider defaultTheme="light" storageKey="lovable-ui-theme">
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<RootRedirect />} />
                  <Route path="/platform/*" element={<Platform />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
              {/* React Query DevTools - only in development */}
              {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
            </TooltipProvider>
          </ThemeProvider>
        </ChakraProvider>
      </CommunitiesProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
