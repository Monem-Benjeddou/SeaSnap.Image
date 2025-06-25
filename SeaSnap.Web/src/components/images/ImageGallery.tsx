import React, { useState } from 'react';
import {
  Table,
  ConfigProvider,
  Pagination,
  Spin,
  Empty,
  Input,
  Select,
  Button,
  Image as AntImage,
  Tag,
  Avatar,
  Typography,
  Space,
  Dropdown,
  Modal,
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  DownloadOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../stores/authStore';
import { hasPermission } from '../../utils/permissions';
import { formatBytes } from '../../utils/format';
import { ImageService, imageService } from '../../services/imageService';

const { Search } = Input;
const { Option } = Select;
const { Text } = Typography;

export const ImageGallery = ({
  images,
  loading = false,
  total = 0,
  page = 1,
  pageSize = 20,
  onPageChange,
  onDelete,
  onEdit,
  onPreview,
}) => {
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [previewImage, setPreviewImage] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);

  const canEdit = hasPermission(user?.roles, ['admin']);
  const canDelete = hasPermission(user?.roles, ['admin']);

  const filteredImages = React.useMemo(() => {
    let filtered = images;

    if (searchTerm) {
      filtered = filtered.filter(image =>
        image.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
        image.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        image.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(image => image.mimeType.startsWith(filterType));
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
        case 'date-asc':
          return new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
        case 'name-asc':
          return a.filename.localeCompare(b.filename);
        case 'name-desc':
          return b.filename.localeCompare(a.filename);
        case 'size-desc':
          return b.size - a.size;
        case 'size-asc':
          return a.size - b.size;
        default:
          return 0;
      }
    });

    return filtered;
  }, [images, searchTerm, filterType, sortBy]);

  const handleDownload = async (image) => {
    try {
      const { url: presignedUrl } = await imageService.getPresignedUrl(image.filename);

      const response = await fetch(presignedUrl);
      if (!response.ok) throw new Error('Failed to fetch file');

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = image.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
      Modal.error({
        title: 'Download Error',
        content: 'Unable to download the image. Please try again later.',
      });
    }
  };

  const renderEmpty = () => (
    <div className="flex justify-center items-center h-48">
      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No images found" />
    </div>
  );

  const handleDelete = (image) => {
    Modal.confirm({
      title: 'Delete Image',
      content: `Are you sure you want to delete "${image.filename}"?`,
      okText: 'Delete',
      okType: 'danger',
      onOk: () => onDelete?.(image.id),
    });
  };

  const handlePreview = (image) => {
    setPreviewImage(image);
    setPreviewVisible(true);
    onPreview?.(image);
  };

  const getMenuItems = (image) => [
    {
      key: 'preview',
      icon: <EyeOutlined />,
      label: 'Preview',
      onClick: () => handlePreview(image),
    },
    {
      key: 'download',
      icon: <DownloadOutlined />,
      label: 'Download',
      onClick: () => handleDownload(image),
    },
    ...(canEdit
      ? [
        {
          key: 'edit',
          icon: <EditOutlined />,
          label: 'Edit',
          onClick: () => onEdit?.(image),
        },
      ]
      : []),
    ...(canDelete
      ? [
        {
          key: 'delete',
          icon: <DeleteOutlined />,
          label: 'Delete',
          onClick: () => handleDelete(image),
          danger: true,
        },
      ]
      : []),
  ];

  const columns = [
    {
      title: 'Preview',
      dataIndex: 'thumbnailUrl',
      key: 'preview',
      width: 120,
      render: (thumbnailUrl, record) => (
        <div className="flex justify-center items-center cursor-pointer overflow-hidden" onClick={() => handlePreview(record)}>
          <AntImage
            src={thumbnailUrl}
            alt={record.filename}
            width={60}
            height={60}
            className="rounded-lg object-cover"
            preview={false}
            fallback="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60'><rect width='100%' height='100%' fill='#f0f0f0'/><text x='50%' y='50%' text-anchor='middle' dy='.3em' fill='#ccc' font-size='10'>No Image</text></svg>"
          />
        </div>
      ),
    },
    {
      title: 'Filename',
      dataIndex: 'filename',
      key: 'filename',
      width: 340,
      render: (filename, record) => (
        <div>
          <Text strong className="text-sm text-gray-800">{filename}</Text>
          {record.description && (
            <div className="text-xs text-gray-500 mt-1">{record.description}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
      width: 100,
      render: (size) => <Text className="text-sm text-gray-800">{formatBytes(size)}</Text>,
    },
    {
      title: 'Type',
      dataIndex: 'mimeType',
      key: 'mimeType',
      width: 80,
      render: (mimeType) => (
        <Tag color="blue" className="text-xs">
          {mimeType ? mimeType.split('/')[1]?.toUpperCase() : ''}
        </Tag>
      ),
    },
    {
      title: 'Tags',
      dataIndex: 'tags',
      key: 'tags',
      width: 80,
      render: (tags) => (
        <div className="flex flex-wrap gap-1">
          {Array.isArray(tags) && tags.slice(0, 2).map(tag => (
            <Tag key={tag} size="small">{tag}</Tag>
          ))}
          {Array.isArray(tags) && tags.length > 2 && (
            <Tag size="small" color="default">+{tags.length - 2}</Tag>
          )}
        </div>
      )
    },
    {
      title: 'Uploaded By',
      dataIndex: 'uploadedBy',
      key: 'uploadedBy',
      width: 150,
      render: (uploadedBy) => (
        <div className="flex items-center space-x-2">
          <Avatar size="small">{uploadedBy.userName ? uploadedBy.userName.charAt(0) : "unkown"}</Avatar>
          <Text className="text-sm text-gray-800">{uploadedBy.userName ? uploadedBy.userName : "unkown"}</Text>
        </div>
      ),
    },
    {
      title: 'Upload Date',
      dataIndex: 'uploadedAt',
      key: 'uploadedAt',
      width: 120,
      render: (uploadedAt) => (
        <Text className="text-sm text-gray-800">{new Date(uploadedAt).toLocaleDateString()}</Text>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button type="text" size="small" icon={<EyeOutlined />} onClick={() => handlePreview(record)} />
          <Button type="text" size="small" icon={<DownloadOutlined />} onClick={() => handleDownload(record)} />
          <Dropdown
            menu={{ items: getMenuItems(record) }}
            placement="bottomRight"
            trigger={['click']}
          >
            <Button type="text" size="small" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ];

  if (loading && images.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <motion.div
        className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Search
            placeholder="Search images..."
            allowClear
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
          <Select value={filterType} onChange={setFilterType} className="w-full">
            <Option value="all">All Types</Option>
            <Option value="image">PNG</Option>
            <Option value="video">JPEG</Option>
          </Select>
          <Select value={sortBy} onChange={setSortBy} className="w-full">
            <Option value="date-desc">Newest First</Option>
            <Option value="date-asc">Oldest First</Option>
            <Option value="name-asc">Name A-Z</Option>
            <Option value="name-desc">Name Z-A</Option>
            <Option value="size-desc">Largest First</Option>
            <Option value="size-asc">Smallest First</Option>
          </Select>
        </div>
      </motion.div>

      {total > pageSize && (
        <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4">
          <Text className="text-sm text-gray-600">
            Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, total)} of {total} images
          </Text>
          <Pagination
            current={page}
            total={total}
            pageSize={pageSize}
            onChange={(newPage, newPageSize) => {
              if (onPageChange) onPageChange(newPage, newPageSize);
            }}
            showSizeChanger
            showQuickJumper
            pageSizeOptions={['3', '10', '20', '50']}
            size="small"
          />
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex-1 min-h-0"
      >
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <ConfigProvider renderEmpty={renderEmpty}>
            <Table
              columns={columns}
              dataSource={filteredImages}
              loading={loading}
              rowKey="id"
              pagination={false}
              className="custom-table h-full"
            />
          </ConfigProvider>
        </div>
      </motion.div>

      <Modal
        open={previewVisible}
        onCancel={() => {
          setPreviewVisible(false);
          setPreviewImage(null);
        }}
        footer={null}
        width="80%"
        className="max-w-4xl"
        centered
      >
        {previewImage && (
          <div className="text-center">
            <img
              src={previewImage.url}
              alt={previewImage.filename}
              className="max-w-full max-h-[70vh] object-contain mx-auto"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src =
                  "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'><rect width='100%' height='100%' fill='#f9f9f9'/><text x='50%' y='50%' text-anchor='middle' dy='.3em' fill='#bbb' font-size='20'>Image not found</text></svg>";
              }}
            />
            <div className="mt-4 text-left">
              <Text strong className="text-gray-800">{previewImage.filename}</Text>
              <div className="text-sm text-gray-500 mt-2 space-y-1">
                <p>Size: {formatBytes(previewImage.size)}</p>
                <p>Type: {previewImage.mimeType}</p>
                <p>Uploaded: {new Date(previewImage.uploadedAt).toLocaleString()}</p>
                <p>By: {previewImage.uploadedBy.userName}</p>
                {previewImage.description && <p>Description: {previewImage.description}</p>}
                {previewImage.tags && previewImage.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {previewImage.tags.map(tag => (
                      <Tag key={tag} size="small">{tag}</Tag>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};