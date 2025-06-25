import React, { useState } from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { motion } from 'framer-motion';

const { Content } = Layout;

export const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  const getPageTitle = () => {
    const path = window.location.pathname;
    switch (path) {
      case '/dashboard':
        return 'Dashboard';
      case '/images':
        return 'Image Gallery';
      case '/upload':
        return 'Upload Images';
      case '/users':
        return 'User Management';
      case '/settings':
        return 'Settings';
      default:
        return 'ImageFlow';
    }
  };

  return (
    <Layout className="min-h-screen">
      <Sidebar collapsed={collapsed} onCollapse={setCollapsed} />
      <Layout className="flex flex-col">
        <Header title={getPageTitle()} />
        <Content className="bg-gray-100 flex-1 overflow-hidden">
          <motion.div
            className="p-6 h-full page-container overflow-y-auto"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </Content>
      </Layout>
    </Layout>
  );
};