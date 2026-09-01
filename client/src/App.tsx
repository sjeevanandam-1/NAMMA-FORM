import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { LanguageProvider } from './context/LanguageContext.js';
import { NotificationProvider } from './context/NotificationContext.js';
import { Navbar } from './components/layout/Navbar.js';
import { MobileNav } from './components/layout/MobileNav.js';
import { Footer } from './components/layout/Footer.js';

// Public & Auth Pages
import { Home } from './pages/Home.js';
import { Login } from './pages/auth/Login.js';
import { ForgotPassword } from './pages/auth/ForgotPassword.js';
import { ResetPassword } from './pages/auth/ResetPassword.js';
import { RegisterFarmer } from './pages/auth/RegisterFarmer.js';
import { RegisterBuyer } from './pages/auth/RegisterBuyer.js';

// Core Pages
import { BuyerMarketplace } from './pages/buyer/BuyerMarketplace.js';
import { ListingDetail } from './pages/buyer/ListingDetail.js';
import { BuyerDashboard } from './pages/buyer/BuyerDashboard.js';
import { BuyerOrders } from './pages/buyer/BuyerOrders.js';
import { FarmerDashboard } from './pages/farmer/FarmerDashboard.js';
import { FarmManagement } from './pages/farmer/FarmManagement.js';
import { CropListings } from './pages/farmer/CropListings.js';
import { AIIntelligence } from './pages/farmer/AIIntelligence.js';
import { CropDoctor } from './pages/farmer/CropDoctor.js';
import { AgriAssistant } from './pages/farmer/AgriAssistant.js';
import { FarmerOrders } from './pages/farmer/FarmerOrders.js';
import { FarmerQueries } from './pages/farmer/FarmerQueries.js';

// All 22 Agricultural Features Pages
import { GovernmentSchemes } from './pages/farmer/GovernmentSchemes.js';
import { GovernmentMSP } from './pages/farmer/GovernmentMSP.js';
import { PriceAnalysis } from './pages/farmer/PriceAnalysis.js';
import { StorageFinder } from './pages/farmer/StorageFinder.js';
import { TollFreeSupport } from './pages/farmer/TollFreeSupport.js';
import { WeatherPage } from './pages/farmer/WeatherPage.js';
import { SmartIrrigation } from './pages/farmer/SmartIrrigation.js';
import { CropCalendarPage } from './pages/farmer/CropCalendarPage.js';
import { EquipmentRental } from './pages/farmer/EquipmentRental.js';
import { MarketComparisonPage } from './pages/farmer/MarketComparisonPage.js';
import { SmartTransport } from './pages/farmer/SmartTransport.js';
import { FinanceLoans } from './pages/farmer/FinanceLoans.js';
import { CropInsurance } from './pages/farmer/CropInsurance.js';
import { FarmerPassportPage } from './pages/farmer/FarmerPassportPage.js';
import { CommunityConnect } from './pages/farmer/CommunityConnect.js';
import { ProfitCalculatorPage } from './pages/farmer/ProfitCalculatorPage.js';
import { AgriWasteMarket } from './pages/farmer/AgriWasteMarket.js';
import { NotificationCenter } from './pages/farmer/NotificationCenter.js';
import { DirectExpertAccess } from './pages/farmer/DirectExpertAccess.js';

// Admin & Government
import { GovernmentDashboard } from './pages/government/GovernmentDashboard.js';
import { AdminDashboard } from './pages/admin/AdminDashboard.js';
import { SharedChat } from './pages/SharedChat.js';
import { NotFound } from './pages/NotFound.js';
import { Role } from './types/index.js';

// Protected Route Component guarding roles
const ProtectedRoute: React.FC<{
  allowedRoles: Role[];
  children: React.ReactNode;
}> = ({ allowedRoles, children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-xs text-slate-400">
        Authenticating session...
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    if (user.role === 'FARMER') return <Navigate to="/farmer/dashboard" replace />;
    if (user.role === 'BUYER') return <Navigate to="/buyer/dashboard" replace />;
    if (user.role === 'GOVERNMENT_OFFICIAL') return <Navigate to="/government/dashboard" replace />;
    if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Global Navbar */}
      <Navbar />

      {/* Main Content Router */}
      <main className="flex-1 pb-16 md:pb-0">
        <Routes>
          {/* Public & Auth Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/register/farmer" element={<RegisterFarmer />} />
          <Route path="/register/buyer" element={<RegisterBuyer />} />
          <Route path="/marketplace" element={<BuyerMarketplace />} />
          <Route path="/marketplace/:id" element={<ListingDetail />} />

          {/* Farmer Protected Core Routes */}
          <Route
            path="/farmer/dashboard"
            element={
              <ProtectedRoute allowedRoles={['FARMER', 'ADMIN']}>
                <FarmerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/farms"
            element={
              <ProtectedRoute allowedRoles={['FARMER', 'ADMIN']}>
                <FarmManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/listings"
            element={
              <ProtectedRoute allowedRoles={['FARMER', 'ADMIN']}>
                <CropListings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/ai-intelligence"
            element={
              <ProtectedRoute allowedRoles={['FARMER', 'ADMIN']}>
                <AIIntelligence />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/crop-doctor"
            element={
              <ProtectedRoute allowedRoles={['FARMER', 'ADMIN']}>
                <CropDoctor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/assistant"
            element={
              <ProtectedRoute allowedRoles={['FARMER', 'ADMIN']}>
                <AgriAssistant />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/orders"
            element={
              <ProtectedRoute allowedRoles={['FARMER', 'ADMIN']}>
                <FarmerOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/queries"
            element={
              <ProtectedRoute allowedRoles={['FARMER', 'ADMIN']}>
                <FarmerQueries />
              </ProtectedRoute>
            }
          />

          {/* 22 Agricultural Feature Routes */}
          <Route
            path="/farmer/schemes"
            element={
              <ProtectedRoute allowedRoles={['FARMER', 'ADMIN', 'GOVERNMENT_OFFICIAL']}>
                <GovernmentSchemes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/msp"
            element={
              <ProtectedRoute allowedRoles={['FARMER', 'ADMIN', 'GOVERNMENT_OFFICIAL']}>
                <GovernmentMSP />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/price-analysis"
            element={
              <ProtectedRoute allowedRoles={['FARMER', 'BUYER', 'ADMIN']}>
                <PriceAnalysis />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/storage"
            element={
              <ProtectedRoute allowedRoles={['FARMER', 'ADMIN', 'GOVERNMENT_OFFICIAL']}>
                <StorageFinder />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/support"
            element={
              <ProtectedRoute allowedRoles={['FARMER', 'BUYER', 'ADMIN']}>
                <TollFreeSupport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/weather"
            element={
              <ProtectedRoute allowedRoles={['FARMER', 'BUYER', 'ADMIN']}>
                <WeatherPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/irrigation"
            element={
              <ProtectedRoute allowedRoles={['FARMER', 'ADMIN']}>
                <SmartIrrigation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/calendar"
            element={
              <ProtectedRoute allowedRoles={['FARMER', 'ADMIN']}>
                <CropCalendarPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/equipment"
            element={
              <ProtectedRoute allowedRoles={['FARMER', 'ADMIN']}>
                <EquipmentRental />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/market-comparison"
            element={
              <ProtectedRoute allowedRoles={['FARMER', 'ADMIN']}>
                <MarketComparisonPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/transport"
            element={
              <ProtectedRoute allowedRoles={['FARMER', 'BUYER', 'ADMIN']}>
                <SmartTransport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/finance"
            element={
              <ProtectedRoute allowedRoles={['FARMER', 'ADMIN']}>
                <FinanceLoans />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/insurance"
            element={
              <ProtectedRoute allowedRoles={['FARMER', 'ADMIN']}>
                <CropInsurance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/passport"
            element={
              <ProtectedRoute allowedRoles={['FARMER', 'ADMIN', 'GOVERNMENT_OFFICIAL']}>
                <FarmerPassportPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/community"
            element={
              <ProtectedRoute allowedRoles={['FARMER', 'BUYER', 'ADMIN']}>
                <CommunityConnect />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/profit-calculator"
            element={
              <ProtectedRoute allowedRoles={['FARMER', 'ADMIN']}>
                <ProfitCalculatorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/waste-market"
            element={
              <ProtectedRoute allowedRoles={['FARMER', 'BUYER', 'ADMIN']}>
                <AgriWasteMarket />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/notifications"
            element={
              <ProtectedRoute allowedRoles={['FARMER', 'BUYER', 'ADMIN', 'GOVERNMENT_OFFICIAL']}>
                <NotificationCenter />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/experts"
            element={
              <ProtectedRoute allowedRoles={['FARMER', 'ADMIN']}>
                <DirectExpertAccess />
              </ProtectedRoute>
            }
          />

          {/* Buyer Protected Routes */}
          <Route
            path="/buyer/dashboard"
            element={
              <ProtectedRoute allowedRoles={['BUYER', 'ADMIN']}>
                <BuyerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/buyer/orders"
            element={
              <ProtectedRoute allowedRoles={['BUYER', 'ADMIN']}>
                <BuyerOrders />
              </ProtectedRoute>
            }
          />

          {/* Government Official Protected Route */}
          <Route
            path="/government/dashboard"
            element={
              <ProtectedRoute allowedRoles={['GOVERNMENT_OFFICIAL', 'ADMIN']}>
                <GovernmentDashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin Protected Route */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Shared Authenticated Real-time Chat */}
          <Route
            path="/chat"
            element={
              <ProtectedRoute allowedRoles={['FARMER', 'BUYER', 'ADMIN']}>
                <SharedChat />
              </ProtectedRoute>
            }
          />

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* Global Footer */}
      <Footer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <LanguageProvider>
          <NotificationProvider>
            <AppRoutes />
          </NotificationProvider>
        </LanguageProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
