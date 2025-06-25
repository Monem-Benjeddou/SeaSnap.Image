import React, { useState } from 'react';
import { Card, Button, Typography, Tag, Dropdown, Modal } from 'antd';
import {
  DownloadOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { Image } from '../../types';
import { useAuthStore } from '../../stores/authStore';
import { hasPermission } from '../../utils/permissions';
import { formatBytes } from '../../utils/format';

const { Text, Paragraph } = Typography;
const { Meta } = Card;

interface ImageCardProps {
  image: Image;
  onDelete?: (imageId: string) => void;
  onEdit?: (image: Image) => void;
  onPreview?: (image: Image) => void;
}

export const ImageCard: React.FC<ImageCardProps> = ({
  image,
  onDelete,
  onEdit,
  onPreview,
}) => {
  const { user } = useAuthStore();
  const [isHovered, setIsHovered] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);

  const canEdit = hasPermission(user?.role || 'viewer', 'EDIT_IMAGES');
  const canDelete = hasPermission(user?.role || 'viewer', 'DELETE_IMAGES');

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = image.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = () => {
    Modal.confirm({
      title: 'Delete Image',
      content: `Are you sure you want to delete "${image.filename}"?`,
      okText: 'Delete',
      okType: 'danger',
      onOk: () => onDelete?.(image.id),
    });
  };

  const menuItems = [
    {
      key: 'preview',
      icon: <EyeOutlined />,
      label: 'Preview',
      onClick: () => {
        setPreviewVisible(true);
        onPreview?.(image);
      },
    },
    {
      key: 'download',
      icon: <DownloadOutlined />,
      label: 'Download',
      onClick: handleDownload,
    },
    ...(canEdit ? [{
      key: 'edit',
      icon: <EditOutlined />,
      label: 'Edit',
      onClick: () => onEdit?.(image),
    }] : []),
    ...(canDelete ? [{
      key: 'delete',
      icon: <DeleteOutlined />,
      label: 'Delete',
      onClick: handleDelete,
      danger: true,
    }] : []),
  ];

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Card
          hoverable
          className="h-full overflow-hidden group"
          cover={
            <div className="relative overflow-hidden h-48">
              <motion.img
                alt={image.filename}
                src={image.thumbnailUrl}
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              />
              
              {/* Overlay with actions */}
              <motion.div
                className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center space-x-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  type="primary"
                  icon={<EyeOutlined />}
                  size="small"
                  onClick={() => setPreviewVisible(true)}
                >
                  Preview
                </Button>
                <Button
                  icon={<DownloadOutlined />}
                  size="small"
                  onClick={handleDownload}
                >
                  Download
                </Button>
                <Dropdown
                  menu={{ items: menuItems }}
                  placement="bottomRight"
                >
                  <Button icon={<MoreOutlined />} size="small" />
                </Dropdown>
              </motion.div>
            </div>
          }
        >
          <Meta
            title={
              <Text ellipsis className="text-sm font-medium">
                {image.filename}
              </Text>
            }
            description={
              <div className="space-y-2">
                {image.description && (
                  <Paragraph ellipsis={{ rows: 2 }} className="text-xs text-gray-500 m-0">
                    {image.description}
                  </Paragraph>
                )}
                
                <div className="flex flex-wrap gap-1">
                  {image.tags?.map(tag => (
                    <Tag key={tag} size="small">
                      {tag}
                    </Tag>
                  ))}
                </div>
                
                <div className="flex justify-between items-center text-xs text-gray-400">
                  <span>{formatBytes(image.size)}</span>
                  <span>{new Date(image.uploadedAt).toLocaleDateString()}</span>
                </div>
              </div>
            }
          />
        </Card>
      </motion.div>

      {/* Preview Modal */}
      <Modal
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={null}
        width="80%"
        className="max-w-4xl"
        centered
      >
        <div className="text-center">
          <img
            src={image.url}
            alt={image.filename}
            className="max-w-full max-h-[70vh] object-contain mx-auto"
          />
          <div className="mt-4 text-left">
            <Text strong>{image.filename}</Text>
            <div className="text-sm text-gray-500 mt-2">
              <p>Size: {formatBytes(image.size)}</p>
              <p>Type: {image.mimeType}</p>
              <p>Uploaded: {new Date(image.uploadedAt).toLocaleString()}</p>
              <p>By: {image.uploadedBy.name}</p>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};