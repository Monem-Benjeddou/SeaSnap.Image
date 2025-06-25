import React, { useState, useEffect } from 'react';
import { Button, Space } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { ImageGallery } from '../components/images/ImageGallery';
import { useAuthStore } from '../stores/authStore';
import { hasPermission } from '../utils/permissions';
import { imageService } from '../services/imageService';
import { Image } from '../types';
import {ImageItem} from '../types/ImageItem'
export const ImagesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const canUpload = hasPermission(user?.roles, ['Admin']);

  const fetchImages = async (currentPage = 1, currentPageSize = 20) => {
    setLoading(true);
    try {
      const response = await imageService.getAll(currentPage, currentPageSize);
      if (response != null) {
        setImages(response.items);
        setTotal(response.totalItems);
        setPage(currentPage);
      }
    } catch (error) {
      toast.error('Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handlePageChange = (newPage: number, newPageSize: number) => {
    setPageSize(newPageSize); 
    console.log("pageSize", pageSize);
    fetchImages(newPage, newPageSize);
  };

  const handleDelete = async (imageId: string) => {
    try {
       await imageService.deleteImage(imageId);
        toast.success('Image deleted successfully');
        setImages(images.filter(img => img.id !== imageId));
        setTotal(total - 1);
    } catch (error) {
      toast.error('Failed to delete image');
    }
  };

  const handleEdit = (image: Image) => {
    // Navigate to edit page or open edit modal
    console.log('Edit image:', image);
    toast('Edit functionality coming soon!');
  };

  const handlePreview = (image: Image) => {
    // This is handled by the ImageCard component
    console.log('Preview image:', image);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-6 flex-shrink-0"
      >
        <div>
          <h1 className="text-2xl font-bold mb-2">Image Gallery</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage and organize your images
          </p>
        </div>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => fetchImages(page)}
            loading={loading}
          >
            Refresh
          </Button>
          {canUpload && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/upload')}
            >
              Upload Images
            </Button>
          )}
        </Space>
      </motion.div>

      <div className="flex-1">
        <ImageGallery
          images={images}
          loading={loading}
          total={total}
          page={page}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onDelete={handleDelete}
          onEdit={handleEdit}
          onPreview={handlePreview}
        />
      </div>
    </div>
  );
};