import React, { useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { supabase } from './utils/supabaseClient';
import { initializeSessionTracking, cleanupSessionTracking } from './utils/activityService';
import Home from './components/Home';
import Gear from './components/Gear';
import Benefits from './components/Benefits';
import Services from './components/Services';
import Recommendations from './components/Recommendations';
import Login from './components/Login';
import Register from './components/Register';
import MyAccount from './components/MyAccount';
import Workshops from './components/Workshops';
import Tutorials from './components/Tutorials';
import AdminDashboard from './components/AdminDashboard';
import ShoppingCart from './components/ShoppingCart';

const App: React.FC = () => {
  // Initialize session tracking when user is authenticated
  useEffect(() => {
    const checkAuthAndInitTracking = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        initializeSessionTracking();
      }
    };

    checkAuthAndInitTracking();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        initializeSessionTracking();
      } else if (event === 'SIGNED_OUT') {
        cleanupSessionTracking();
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
      cleanupSessionTracking();
    };
  }, []);

  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/account" element={<MyAccount />} />
          <Route path="/gear" element={<Gear />} />
          <Route path="/benefits" element={<Benefits />} />
          <Route path="/services" element={<Services />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/workshops" element={<Workshops />} />
          <Route path="/tutorials" element={<Tutorials />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/cart" element={<ShoppingCart />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;