import React from 'react';
import { Row, Col, Card, Statistic, Progress, Avatar, Typography, List, Button } from 'antd';
import {
  FileImageOutlined,
  UploadOutlined,
  DownloadOutlined,
  TeamOutlined,
  RiseOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { formatBytes } from '../utils/format';

const { Title, Text } = Typography;

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();

  const stats = {
    totalImages: 1247,
    storageUsed: 15.6 * 1024 * 1024 * 1024,
    storageLimit: 50 * 1024 * 1024 * 1024,
    uploadsThisMonth: 156,
    downloadsThisMonth: 847,
    activeUsers: 12,
  };

  const recentUploads = [
    {
      id: '1',
      filename: 'product-hero-banner.jpg',
      uploadedAt: '2 minutes ago',
      size: 2.4 * 1024 * 1024,
      user: 'John Doe',
    },
    {
      id: '2',
      filename: 'team-photo-2024.png',
      uploadedAt: '15 minutes ago',
      size: 5.1 * 1024 * 1024,
      user: 'Jane Smith',
    },
    {
      id: '3',
      filename: 'logo-variations.svg',
      uploadedAt: '1 hour ago',
      size: 0.8 * 1024 * 1024,
      user: 'Mike Johnson',
    },
  ];

  const storageUsagePercent = (stats.storageUsed / stats.storageLimit) * 100;

  const StatCard = ({ icon, title, value, color, trend }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="h-full">
        <div className="flex items-center justify-between">
          <div>
            <Text type="secondary" className="text-sm">
              {title}
            </Text>
            <div className="text-2xl font-bold mt-1" style={{ color }}>
              {value}
            </div>
            {trend && (
              <div className="flex items-center mt-2 text-sm text-green-500">
                <RiseOutlined className="mr-1" />
                {trend}% from last month
              </div>
            )}
          </div>
          <div
            className="p-3 rounded-full"
            style={{ backgroundColor: color + '20', color }}
          >
            {icon}
          </div>
        </div>
      </Card>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white text-gray-800 p-6 rounded-lg shadow-md"
      >
        <div className="flex items-center justify-between">
          <div>
            <Title level={2} className="text-gray-800 mb-2">
              Welcome back, {user?.userName}!
            </Title>
            <Text className="text-gray-600 text-lg">
              Here's what's happening with your images today.
            </Text>
          </div>
          <Avatar
            size={80}
            className="border-4 border-gray-200"
          >
            {user?.userName?.charAt(0)}
          </Avatar>
        </div>
      </motion.div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            icon={<FileImageOutlined className="text-xl" />}
            title="Total Images"
            value={stats.totalImages.toLocaleString()}
            color="#1890ff"
            trend={12}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            icon={<UploadOutlined className="text-xl" />}
            title="Uploads This Month"
            value={stats.uploadsThisMonth}
            color="#52c41a"
            trend={8}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            icon={<DownloadOutlined className="text-xl" />}
            title="Downloads This Month"
            value={stats.downloadsThisMonth}
            color="#fa8c16"
            trend={15}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            icon={<TeamOutlined className="text-xl" />}
            title="Active Users"
            value={stats.activeUsers}
            color="#722ed1"
            trend={5}
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card title="Storage Usage" className="h-full">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Text>Used Storage</Text>
                  <Text strong>
                    {formatBytes(stats.storageUsed)} / {formatBytes(stats.storageLimit)}
                  </Text>
                </div>
                <Progress
                  percent={storageUsagePercent}
                  strokeColor={{
                    '0%': '#52c41a',
                    '70%': '#fa8c16',
                    '90%': '#ff4d4f',
                  }}
                  className="mb-4"
                />
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-blue-500">
                      {formatBytes(stats.storageUsed)}
                    </div>
                    <Text type="secondary">Used</Text>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-500">
                      {formatBytes(stats.storageLimit - stats.storageUsed)}
                    </div>
                    <Text type="secondary">Available</Text>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </Col>

        <Col xs={24} lg={12}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card title="Recent Uploads" className="h-full">
              <List
                dataSource={recentUploads}
                renderItem={(item, index) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <List.Item>
                      <List.Item.Meta
                        avatar={
                          <Avatar
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${item.user}`}
                            size="small"
                          />
                        }
                        title={
                          <div className="flex items-center justify-between">
                            <Text ellipsis className="max-w-[200px]">
                              {item.filename}
                            </Text>
                            <Text type="secondary" className="text-xs">
                              {formatBytes(item.size)}
                            </Text>
                          </div>
                        }
                        description={
                          <div className="flex items-center text-xs text-gray-500">
                            <ClockCircleOutlined className="mr-1" />
                            {item.uploadedAt} by {item.user}
                          </div>
                        }
                      />
                    </List.Item>
                  </motion.div>
                )}
              />
              <div className="text-center mt-4">
                <Button type="link">View All Uploads</Button>
              </div>
            </Card>
          </motion.div>
        </Col>
      </Row>
    </div>
  );
};