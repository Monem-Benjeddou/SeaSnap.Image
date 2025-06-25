import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography } from 'antd';
import { UserOutlined, LockOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuthStore } from '../stores/authStore';
import { authService } from '../services/authService';
import axios, { AxiosError } from 'axios';
import { ErrorResponse } from '../types/auth';
const { Title, Text } = Typography;

export const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleLogin = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      const response = await authService.login(values.email, values.password);
      const userData = await authService.getCurrentUser();
      localStorage.setItem('user', JSON.stringify(userData));
      login(response.accessToken);
      toast.success('Login successful!');
    } catch (error) {
      console.error('Login error:', error);
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ErrorResponse>;
        toast.error(
          axiosError.response?.data?.detail || 'Login failed. Please check your credentials.'
        );
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card
          className="shadow-xl border-0"
          styles={{
            body: { padding: '2rem' },
          }}
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserOutlined className="text-2xl text-white" />
              </div>
            </motion.div>
            <Title level={2} className="mb-2">
              Welcome Back
            </Title>
            <Text type="secondary">
              Sign in to your SeaSnap account
            </Text>
          </div>

          <Form onFinish={handleLogin} layout="vertical" size="large">
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Please enter your email' }
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Enter your email"
                autoComplete="email"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true, message: 'Please enter your password' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Enter your password"
                autoComplete="current-password"
                iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="w-full bg-blue-500 hover:bg-blue-600"
              >
                Sign In
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </motion.div>
    </div>
  );
};