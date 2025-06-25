import React from 'react';
import { Layout, Breadcrumb, Typography } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const { Header: AntHeader } = Layout;
const { Title } = Typography;

interface HeaderProps {
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  const location = useLocation();

  const getBreadcrumbItems = () => {
    const pathnames = location.pathname.split('/').filter(x => x);

    const items = [
      {
        href: '/dashboard',
        title: <HomeOutlined />,
      },
    ];

    pathnames.forEach((name, index) => {
      const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
      const isLast = index === pathnames.length - 1;

      items.push({
        href: isLast ? undefined : routeTo,
        title: name.charAt(0).toUpperCase() + name.slice(1),
      });
    });

    return items;
  };

  return (
    <AntHeader className="bg-white border-b border-gray-200 my-3 px-6 h-16 flex items-center">
      <motion.div
        className="flex-1"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Breadcrumb items={getBreadcrumbItems()} className="mb-2" />
        <Title level={4} className="m-0 text-gray-800">
          {title}
        </Title>
      </motion.div>
    </AntHeader>
  );
};