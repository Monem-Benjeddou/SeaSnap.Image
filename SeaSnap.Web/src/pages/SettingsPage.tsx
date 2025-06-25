import React from 'react';
import { Card, Form, Input, Switch, Button, Select, Divider, Typography, Space } from 'antd';
import { SaveOutlined, ReloadOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useThemeStore } from '../stores/themeStore';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export const SettingsPage: React.FC = () => {
  const [form] = Form.useForm();

  const handleSave = async (values: any) => {
    try {
      // Mock save settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  const handleReset = () => {
    form.resetFields();
    toast('Settings reset to default values');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Title level={2}>Settings</Title>
        <Text type="secondary">
          Configure your application preferences
        </Text>
      </motion.div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        initialValues={{
          siteName: 'ImageFlow',
          siteDescription: 'Professional image management platform',
          maxFileSize: 10,
          allowedFormats: ['jpg', 'png', 'gif', 'webp'],
          enableNotifications: true,
          autoOptimize: true
        }}
      >
        {/* General Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card title="General Settings">
            <Form.Item
              name="siteName"
              label="Site Name"
              rules={[{ required: true, message: 'Please enter site name' }]}
            >
              <Input placeholder="Enter site name" />
            </Form.Item>

            <Form.Item
              name="siteDescription"
              label="Site Description"
            >
              <TextArea
                rows={3}
                placeholder="Enter site description"
              />
            </Form.Item>

          </Card>
        </motion.div>

        {/* Upload Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card title="Upload Settings">
            <Form.Item
              name="maxFileSize"
              label="Maximum File Size (MB)"
              rules={[{ required: true, message: 'Please enter max file size' }]}
            >
              <Input type="number" min={1} max={100} />
            </Form.Item>

            <Form.Item
              name="allowedFormats"
              label="Allowed File Formats"
              rules={[{ required: true, message: 'Please select allowed formats' }]}
            >
              <Select
                mode="multiple"
                placeholder="Select allowed formats"
              >
                <Option value="jpg">JPG</Option>
                <Option value="png">PNG</Option>
                <Option value="gif">GIF</Option>
                <Option value="webp">WebP</Option>
                <Option value="svg">SVG</Option>
                <Option value="mp4">MP4</Option>
                <Option value="webm">WebM</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="autoOptimize"
              label="Auto-optimize Images"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Card>
        </motion.div>

        {/* Notification Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card title="Notification Settings">
            <Form.Item
              name="enableNotifications"
              label="Enable Notifications"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item
              name="emailNotifications"
              label="Email Notifications"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item
              name="notificationEmail"
              label="Notification Email"
            >
              <Input type="email" placeholder="Enter notification email" />
            </Form.Item>
          </Card>
        </motion.div>

        {/* Storage Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card title="Storage Settings">
            <Form.Item
              name="storageProvider"
              label="Storage Provider"
            >
              <Select defaultValue="seaweedfs">
                <Option value="seaweedfs">SeaweedFS</Option>
                <Option value="s3">Amazon S3</Option>
                <Option value="local">Local Storage</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="cdnUrl"
              label="CDN URL (Optional)"
            >
              <Input placeholder="https://cdn.example.com" />
            </Form.Item>

            <Form.Item
              name="enableCaching"
              label="Enable Caching"
              valuePropName="checked"
            >
              <Switch defaultChecked />
            </Form.Item>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <div className="flex justify-end">
              <Space>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={handleReset}
                >
                  Reset to Defaults
                </Button>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  htmlType="submit"
                >
                  Save Settings
                </Button>
              </Space>
            </div>
          </Card>
        </motion.div>
      </Form>
    </div>
  );
};