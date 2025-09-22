import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "@/components/organisms/Sidebar";
import Header from "@/components/organisms/Header";

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  
  const getPageTitle = () => {
    const path = location.pathname;
switch (path) {
      case "/":
        return "Dashboard";
case "/contacts":
        return "Contacts";
      case "/companies":
        return "Companies";
      case "/deals":
        return "Deals";
      case "/activities":
        return "Activities";
      case "/reports":
        return "Reports";
      default:
        return "Dashboard";
    }
  };

  return (
    <div className="h-screen flex bg-background">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      
      <div className="flex flex-col flex-1 lg:pl-64">
        <Header 
          onMenuClick={() => setSidebarOpen(true)}
          title={getPageTitle()}
        />
        
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;