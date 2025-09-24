
import React from 'react'; // Ensure React is imported
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom"; // Import Navigate and Outlet
import { AppProvider } from "@/context/AppContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider, useAuth } from "@/context/AuthContext"; // Import useAuth
import Index from "./pages/Index";
import Sources from "./pages/Sources";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import LandingPage from "./pages/Landing";
import Pricing from "./pages/Pricing";
import ProfilePage from "./pages/Profile"; // Import the ProfilePage
import NotFound from "./pages/NotFound";
import Analytics from "./pages/Analytics";
import Network from "./pages/Network";
import Security from "./pages/Security";
import DashboardPricingPage from "./pages/DashboardPricing";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    // Optional: Show a loading spinner while checking auth state
    return <div>Loading...</div>; 
  }

  return user ? <Outlet /> : <Navigate to="/" replace />; // Redirect to landing if not logged in
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <AuthProvider>
        <AppProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/pricing" element={<Pricing />} /> {/* Moved Pricing to public routes */}

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/dashboard" element={<Index />} />
                  <Route path="/sources" element={<Sources />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/network" element={<Network />} />
                  <Route path="/security" element={<Security />} />
                  <Route path="/dashboard-pricing" element={<DashboardPricingPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                </Route>

                {/* Catch-all Not Found Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
