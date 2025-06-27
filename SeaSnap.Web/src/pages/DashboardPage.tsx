import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Progress, Avatar, Typography, List, Button, Spin } from 'antd';
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
import { dashboardService, DashboardStats } from '../services/dashboardService'; // Import dashboardService and DashboardStats
import { ImageMetadata } from '../types'; // Assuming ImageMetadata is correctly defined in types.ts

const { Title, Text } = Typography;

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const data = await dashboardService.getDashboardStats();
        setDashboardStats(data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        // Optionally show a toast error
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const storageUsagePercent = dashboardStats ? (dashboardStats.storageUsedBytes / dashboardStats.storageLimitBytes) * 100 : 0;

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[500px]">
        <Spin size="large" tip="Loading dashboard data..." />
      </div>
    );
  }

  if (!dashboardStats) {
    return (
      <div className="flex justify-center items-center h-full min-h-[500px] text-gray-500">
        <Text>Failed to load dashboard data. Please try again.</Text>
      </div>
    );
  }

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

      {/* Statistics Grid */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            icon={<FileImageOutlined className="text-xl" />}
            title="Total Images"
            value={dashboardStats.totalImages.toLocaleString()}
            color="#1890ff"
            trend={12} // Hardcoded trend as backend doesn't provide it
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            icon={<UploadOutlined className="text-xl" />}
            title="Uploads This Month"
            value={dashboardStats.uploadsThisMonth}
            color="#52c41a"
            trend={8} // Hardcoded trend
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            icon={<DownloadOutlined className="text-xl" />}
            title="Downloads This Month"
            value={dashboardStats.downloadsThisMonth}
            color="#fa8c16"
            trend={15} // Hardcoded trend
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            icon={<TeamOutlined className="text-xl" />}
            title="Active Users"
            value={dashboardStats.activeUsers}
            color="#722ed1"
            trend={5} // Hardcoded trend
          />
        </Col>
      </Row>

      {/* Storage and Recent Activity */}
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
                    {formatBytes(dashboardStats.storageUsedBytes)} / {formatBytes(dashboardStats.storageLimitBytes)}
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
                      {formatBytes(dashboardStats.storageUsedBytes)}
                    </div>
                    <Text type="secondary">Used</Text>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-500">
                      {formatBytes(dashboardStats.storageLimitBytes - dashboardStats.storageUsedBytes)}
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
                dataSource={dashboardStats.recentUploads}
                renderItem={(item: ImageMetadata, index) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    key={item.id} // Add key for list items
                  >
                    <List.Item>
                      <List.Item.Meta
                        avatar={
                          // Use a placeholder for user avatar based on username initial or a generic icon
                          <Avatar size="small">
                            {item.uploadedBy?.userName?.charAt(0) || <UserOutlined />}
                          </Avatar>
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
                            {new Date(item.uploadedAt).toLocaleDateString()} by {item.uploadedBy?.userName || 'Unknown User'}
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
