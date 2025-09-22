import React, { useState } from "react";
import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const Sidebar = ({ isOpen, onClose }) => {
const navigation = [
{ name: "Dashboard", href: "/", icon: "LayoutDashboard" },
    { name: "Contacts", href: "/contacts", icon: "Users" },
    { name: "Deals", href: "/deals", icon: "Target" },
    { name: "Activities", href: "/activities", icon: "Clock" },
    { name: "Reports", href: "/reports", icon: "BarChart3" }
  ];

  // Desktop Sidebar
  const DesktopSidebar = () => (
    <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-surface border-r border-slate-200">
      <div className="flex flex-col flex-1 min-h-0">
        <div className="flex items-center h-16 px-6 bg-gradient-to-r from-primary to-blue-700">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center mr-3">
              <ApperIcon name="Compass" size={20} className="text-white" />
            </div>
            <span className="text-lg font-bold text-white">Compass CRM</span>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-primary to-blue-700 text-white shadow-lg"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                }`
              }
            >
              <ApperIcon
                name={item.icon}
                size={20}
                className="mr-3 flex-shrink-0"
              />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );

  // Mobile Sidebar
  const MobileSidebar = () => (
    <>
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative flex flex-col w-64 bg-surface shadow-xl"
          >
            <div className="flex items-center justify-between h-16 px-6 bg-gradient-to-r from-primary to-blue-700">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center mr-3">
                  <ApperIcon name="Compass" size={20} className="text-white" />
                </div>
                <span className="text-lg font-bold text-white">Compass CRM</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white hover:bg-opacity-20 p-1"
              >
                <ApperIcon name="X" size={20} />
              </Button>
            </div>
            
            <nav className="flex-1 px-4 py-6 space-y-2">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-primary to-blue-700 text-white shadow-lg"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                    }`
                  }
                >
                  <ApperIcon
                    name={item.icon}
                    size={20}
                    className="mr-3 flex-shrink-0"
                  />
                  {item.name}
                </NavLink>
              ))}
            </nav>
          </motion.div>
        </div>
      )}
    </>
  );

  return (
    <>
      <DesktopSidebar />
      <MobileSidebar />
    </>
  );
};

export default Sidebar;