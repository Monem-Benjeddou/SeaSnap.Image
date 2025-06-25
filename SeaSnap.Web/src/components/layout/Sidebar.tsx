import React from 'react';
import { Layout, Menu, Avatar, Dropdown, Button, Typography } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  PictureOutlined,
  UploadOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../../stores/authStore';
import { hasPermission, getRoleColor } from '../../utils/permissions';
import { motion } from 'framer-motion';

const { Sider } = Layout;
const { Text } = Typography;

export const Sidebar = ({ collapsed, onCollapse }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      onClick: () => navigate('/dashboard'),
    },
    {
      key: 'images',
      icon: <PictureOutlined />,
      label: 'Images',
      onClick: () => navigate('/images'),
    },
    {
      key: 'upload',
      icon: <UploadOutlined />,
      label: 'Upload',
      onClick: () => navigate('/upload'),
      hidden: !hasPermission(user?.roles, ['Admin', 'moderator']),
    },
    {
      key: 'users',
      icon: <UserOutlined />,
      label: 'Users',
      onClick: () => navigate('/users'),
      hidden: !hasPermission(user?.roles, ['Admin']),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => navigate('/settings'),
    },
  ].filter(item => !item.hidden);

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: logout,
    },
  ];

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      width={220}
      collapsedWidth={80}
      trigger={null} // Hide default trigger
      className="bg-white border-r border-gray-200 shadow-md"
    >
      <div className="flex items-center justify-center h-16 border-b border-gray-200">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="text-lg font-bold text-gray-800"
        >
          {collapsed ? 'IF' : 'ImageFlow'}
        </motion.div>
      </div>

      <Menu
        mode="inline"
        selectedKeys={[location.pathname.split('/')[1] || 'dashboard']}
        style={{ height: 'calc(100% - 168px)', borderRight: 0 }} // Adjusted height
        items={menuItems}
        className="flex-1"
      />

      <div className="p-4 border-t border-gray-200 flex flex-col items-center"> {/* Added flex-col and items-center */}
        <Dropdown menu={{ items: userMenuItems }} placement="topRight" trigger={['click']}>
          <div className="flex items-center cursor-pointer justify-center w-full"> {/* Added w-full */}
            <Avatar icon={<UserOutlined />} className="bg-blue-500" />
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="ml-2 overflow-hidden flex-1" // Added flex-1
              >
                <Text strong className="block text-sm text-gray-800 truncate">
                  {user?.userName || 'Guest'}
                </Text>
                <Text
                  className="block text-xs truncate"
                  style={{ color: getRoleColor(user?.roles?.[0] || 'user') }}
                >
                  {user?.roles?.[0] || 'user'}
                </Text>
              </motion.div>
            )}
          </div>
        </Dropdown>
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => onCollapse(!collapsed)}
          className="mt-4 w-full text-gray-600 hover:text-blue-500" // Adjusted width and color
        />
      </div>
    </Sider>
  );
};