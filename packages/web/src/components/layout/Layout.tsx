// ===========================================
// PureSkin Store — Layout Component
// ===========================================

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-dark-950">
      <Sidebar />
      <MobileNav isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      
      <main className="lg:ml-64 min-h-screen">
        <Outlet context={{ onMenuToggle: () => setMobileMenuOpen(true) }} />
      </main>
    </div>
  );
}
