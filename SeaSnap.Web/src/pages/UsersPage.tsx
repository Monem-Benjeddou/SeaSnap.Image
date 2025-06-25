import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Avatar,
  Tag,
  Space,
  Popconfirm,
  Typography,
  Card,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { User, UserRole } from '../types';
import { userService } from '../services/userService';
import { getRoleColor, getRoleLabel } from '../utils/permissions';
import { formatDate } from '../utils/format';

const { Title, Text } = Typography;
const { Option } = Select;

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userService.getUsers();
      if (response.success) {
        setUsers(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = () => {
    setEditingUser(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue({
      name: user.name,
      email: user.email,
      role: user.role,
    });
    setModalVisible(true);
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await userService.deleteUser(userId);
      if (response.success) {
        toast.success('User deleted successfully');
        setUsers(users.filter(user => user.id !== userId));
      }
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingUser) {
        // Update user
        const response = await userService.updateUser(editingUser.id, values);
        if (response.success) {
          toast.success('User updated successfully');
          setUsers(users.map(user => 
            user.id === editingUser.id ? response.data : user
          ));
        }
      } else {
        // Create user
        const response = await userService.createUser(values);
        if (response.success) {
          toast.success('User created successfully');
          setUsers([...users, response.data]);
        }
      }
      
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      toast.error('Failed to save user');
    }
  };

  const columns = [
    {
      title: 'User',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: User) => (
        <div className="flex items-center space-x-3">
          <Avatar src={record.avatar} size="large">
            {name.charAt(0)}
          </Avatar>
          <div>
            <div className="font-medium">{name}</div>
            <Text type="secondary" className="text-sm">
              {record.email}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: UserRole) => (
        <Tag color={getRoleColor(role)}>
          {getRoleLabel(role)}
        </Tag>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => formatDate(date),
    },
    {
      title: 'Last Login',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      render: (date: string) => date ? formatDate(date) : 'Never',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: User) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEditUser(record)}
          />
          <Popconfirm
            title="Delete User"
            description="Are you sure you want to delete this user?"
            onConfirm={() => handleDeleteUser(record.id)}
            okText="Delete"
            okType="danger"
          >
            <Button
              type="text"
              icon={<DeleteOutlined />}
              danger
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <Title level={2}>User Management</Title>
          <Text type="secondary">
            Manage users and their permissions
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreateUser}
        >
          Add User
        </Button>
      </motion.div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <Table
            columns={columns}
            dataSource={users}
            loading={loading}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} users`,
            }}
          />
        </Card>
      </motion.div>

      {/* User Modal */}
      <Modal
        title={editingUser ? 'Edit User' : 'Create User'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        okText={editingUser ? 'Update' : 'Create'}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter user name' }]}
          >
            <Input placeholder="Enter user name" />
          </Form.Item>
          
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter a valid email' },
            ]}
          >
            <Input placeholder="Enter email address" />
          </Form.Item>
          
          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Please select a role' }]}
          >
            <Select placeholder="Select user role">
              <Option value="admin">
                <Tag color={getRoleColor('admin')}>Administrator</Tag>
              </Option>
              <Option value="editor">
                <Tag color={getRoleColor('editor')}>Editor</Tag>
              </Option>
              <Option value="viewer">
                <Tag color={getRoleColor('viewer')}>Viewer</Tag>
              </Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};