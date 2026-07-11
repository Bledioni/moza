import { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import '../../styles/components/Sidebar.css';

export default function StaffLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div>
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <div className="layout">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="layout__content">{children}</main>
      </div>
    </div>
  );
}