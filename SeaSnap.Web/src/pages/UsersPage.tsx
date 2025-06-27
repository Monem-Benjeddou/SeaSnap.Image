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
import { authService } from '../services/authService';
import { CompanyUser, InviteUserRequest, UpdateUserRoleRequest } from '../types/auth';

import { getRoleColor, getRoleLabel } from '../utils/permissions';
import { formatDate } from '../utils/format';

const { Title, Text } = Typography;
const { Option } = Select;

interface User {
  id: string;
  userName: string;
  fullName: string;
  email: string;
  roles: string[];
  createdAt: string;
  companyId: string;
}

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const fetchedUsers: CompanyUser[] = await authService.getCompanyUsers();
      setUsers(fetchedUsers as User[]);
    } catch (error) {
      console.error('Failed to load users:', error);
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
      fullName: user.fullName, 
      email: user.email,
      role: user.roles[0], 
    });
    setModalVisible(true);
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await authService.deleteUser(userId); // Call deleteUser from authService
      toast.success('User deleted successfully');
      setUsers(users.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast.error('Failed to delete user');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      console.log(values);

      if (editingUser) {
        const updateRequest: UpdateUserRoleRequest = {
          userId: editingUser.id,
          newRole: values.role,
        };
        await authService.updateUserRole(updateRequest);
        toast.success('User role updated successfully');
        fetchUsers();
      } else {
        const inviteRequest: InviteUserRequest = {
          email: values.email,
          fullName: values.fullName,
          role: values.role,
          password: values.password, // Include password
        };
        await authService.inviteUser(inviteRequest); 
        toast.success('User invited successfully');
        fetchUsers();
      }

      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Failed to save user:', error);
      toast.error('Failed to save user');
    }
  };

  const columns = [
    {
      title: 'User',
      dataIndex: 'fullName', 
      key: 'fullName',
      render: (fullName: string, record: User) => (
        <div className="flex items-center space-x-3">
          <Avatar src={record.userName} size="large"> 
            {fullName.charAt(0)}
          </Avatar>
          <div>
            <div className="font-medium">{fullName}</div>
            <Text type="secondary" className="text-sm">
              {record.email}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'roles',
      key: 'roles',
      render: (roles: string[]) => (
        // Assuming a user has at least one role and we display the first one
        roles.length > 0 ? (
          <Tag color={getRoleColor(roles[0])}>
            {getRoleLabel(roles[0])}
          </Tag>
        ) : (
          <Tag>No Role</Tag>
        )
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => formatDate(date),
    },
    // The backend's User model doesn't have a 'LastLogin' property by default from IdentityUser
    // If you add it to your backend User model, you can uncomment this:
    /*
    {
      title: 'Last Login',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      render: (date: string) => date ? formatDate(date) : 'Never',
    },
    */
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
            description={`Are you sure you want to delete ${record.fullName || record.userName}?`}
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
            Manage users and their permissions within your company.
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

      <Modal
        title={editingUser ? 'Edit User Role' : 'Invite New User'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        okText={editingUser ? 'Update Role' : 'Invite'}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="fullName"
            label="Full Name"
            rules={[{ required: true, message: 'Please enter user\'s full name' }]}
          >
            <Input placeholder="Enter user's full name" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter a valid email' },
            ]}
            
          >
            <Input placeholder="Enter email address" disabled={!!editingUser} />
          </Form.Item>

          {!editingUser && ( // Only show password field for new user creation
            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true, message: 'Please enter a password' }, { min: 6, message: 'Password must be at least 6 characters' }]}
            >
              <Input.Password placeholder="Enter password" />
            </Form.Item>
          )}

          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Please select a role' }]}
          >
            <Select placeholder="Select user role">
              <Option value="Editor">
                <Tag color={getRoleColor('Editor')}>Editor</Tag>
              </Option>
              <Option value="Viewer">
                <Tag color={getRoleColor('Viewer')}>Viewer</Tag>
              </Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
