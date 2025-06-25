import React, { useState } from 'react';
import {AxiosProgressEvent} from 'axios';
import { Upload, Button, Card, Progress, List, Tag, Input, Form, Space, Typography } from 'antd';
import {
  InboxOutlined,
  DeleteOutlined,
  FileImageOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { imageService } from '../services/imageService';
import { UploadProgress } from '../types'; // Ensure this type includes 'progress' and 'error'

const { Dragger } = Upload;
const { TextArea } = Input;
const { Text, Title } = Typography;

export const UploadPage: React.FC = () => {
  const [uploadQueue, setUploadQueue] = useState<UploadProgress[]>([]);
  const [form] = Form.useForm();

  const handleFileSelect = (info: { fileList: File[] }) => {
    const newFileList = info.fileList;
    console.log('[File Select] Current fileList:', newFileList);
  
    const seen = new Set(
      uploadQueue.map(item => `${item.filename}_${item.file.size}_${item.file.type}_${item.file.lastModified}`)
    );
  
    const newFilesToAdd = newFileList
      .filter((file: any) => {
        const key = `${file.name}_${file.size}_${file.type}_${file.lastModified}`;
        return !seen.has(key);
      })
      .map((file: any) => ({
        id: file.uid || `${file.name}_${file.lastModified}`,
        filename: file.name,
        status: 'pending' as const,
        progress: 0,
        file,
      }));
  
    if (newFilesToAdd.length > 0) {
      console.log('[Queue] Adding new files to upload queue:', newFilesToAdd.map(f => f.filename));
      setUploadQueue(prev => [...prev, ...newFilesToAdd]);
    } else {
      console.log('[Queue] No new files detected or all selected files are already in queue.');
    }
  };
  

  const uploadFile = async (file: File, id: string) => {
    console.log(`[Upload] Starting upload for ${file.name} (ID: ${id})`);

    console.log('[Upload Trigger]', { id, file });

    setUploadQueue(prev =>
      prev.map(item =>
        item.id === id ? { ...item, status: 'uploading', progress: 0 } : item
      )
    );

    try {
      const onUploadProgress = (event: AxiosProgressEvent) => {
        const totalBytes = event.total ?? 1; 
        const percent = (event.loaded / totalBytes) * 100;
        
        setUploadQueue(prev =>
          prev.map(item =>
            item.id === id ? { ...item, progress: percent } : item
          )
        );
      };

      await imageService.uploadImage(
        file,
        form.getFieldValue('description'),
        form.getFieldValue('tags')?.split(',').map((tag: string) => tag.trim()).filter(Boolean),
        onUploadProgress 
      );

      setUploadQueue(prev =>
        prev.map(item =>
          item.id === id ? { ...item, status: 'completed', progress: 100 } : item
        )
      );
      toast.success(`Successfully uploaded ${file.name}!`);

      // Automatically remove completed uploads after 3 seconds
      setTimeout(() => {
        setUploadQueue(prev => prev.filter(item => item.id !== id));
      }, 3000);

    } catch (error: any) {
      console.error(`[Upload] Error uploading ${file.name}:`, error);
      const errorMessage = error.response?.data?.message || error.message || 'Upload failed';
      setUploadQueue(prev =>
        prev.map(item =>
          item.id === id
            ? { ...item, status: 'error', error: errorMessage, progress: 0 }
            : item
        )
      );
      toast.error(`Failed to upload ${file.name}: ${errorMessage}`);
    }
  };

  const removeFromQueue = (id: string) => {
    setUploadQueue(prev => prev.filter(item => item.id !== id));
  };

  const clearCompleted = () => {
    setUploadQueue(prev => prev.filter(item => item.status !== 'completed'));
  };

  const getStatusIcon = (status: UploadProgress['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircleOutlined className="text-green-500" />;
      case 'error':
        return <ExclamationCircleOutlined className="text-red-500" />;
      default:
        return <FileImageOutlined className="text-blue-500" />;
    }
  };

  const getStatusColor = (status: UploadProgress['status']) => {
    switch (status) {
      case 'completed':
        return '#52c41a';
      case 'error':
        return '#ff4d4f';
      default:
        return '#1890ff';
    }
  };

  return (
    <div className="h-full overflow-y-auto pr-4 -mr-4">
      <div className="space-y-6 pb-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Title level={2}>Upload Images</Title>
          <Text type="secondary">
            Drag and drop your images or click to select files
          </Text>
        </motion.div>

        {/* Upload Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card title="Upload Settings">
            <Form form={form} layout="vertical">
              <Form.Item
                name="description"
                label="Description (Optional)"
              >
                <TextArea
                  placeholder="Add a description for your images..."
                  rows={3}
                />
              </Form.Item>
              <Form.Item
                name="tags"
                label="Tags (Optional)"
                help="Separate tags with commas (e.g., product, banner, hero)"
              >
                <Input placeholder="Enter tags..." />
              </Form.Item>
            </Form>
          </Card>
        </motion.div>

        {/* Upload Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
          <Dragger
            multiple
            accept="image/*"
            customRequest={({ file }) => handleFileSelect({ fileList: [file] })}
            showUploadList={false}
          >
              <p className="ant-upload-drag-icon">
                <InboxOutlined className="text-6xl text-blue-400" />
              </p>
              <p className="ant-upload-text text-lg font-medium">
                Click or drag files to this area to upload
              </p>
              <p className="ant-upload-hint text-gray-500">
                Support for single or bulk upload. Images and videos are supported.
                Max file size: 10MB per file.
              </p>
            </Dragger>
          </Card>
        </motion.div>

        {/* Upload Queue */}
        <Button
          type="primary"
          onClick={() => {
            uploadQueue
              .filter(item => item.status === 'pending')
              .forEach(item => uploadFile(item.file, item.id));
          }}
          disabled={uploadQueue.every(item => item.status !== 'pending')}
        >
          Start Upload
      </Button>

        <AnimatePresence>
          
          {uploadQueue.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card
                title="Upload Progress"
                extra={
                  <Space>
                    <Button size="small" onClick={clearCompleted}>
                      Clear Completed
                    </Button>
                    <Button size="small" onClick={() => setUploadQueue([])}>
                      Clear All
                    </Button>
                  </Space>
                }
              >
                <List
                  dataSource={uploadQueue}
                  renderItem={(item, index) => (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.1 }}
                      key={item.id} // Add key for AnimatePresence to work correctly
                    >
                      <List.Item
                        actions={[
                          <Button
                            type="text"
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={() => removeFromQueue(item.id)}
                            danger
                          />,
                        ]}
                      >
                        <List.Item.Meta
                          avatar={getStatusIcon(item.status)}
                          title={
                            <div className="flex items-center justify-between">
                              <Text ellipsis className="max-w-[300px]">
                                {item.filename}
                              </Text>
                              <div className="flex items-center space-x-2">
                                {item.status === 'completed' && (
                                  <Tag color="success">Completed</Tag>
                                )}
                                {item.status === 'error' && (
                                  <Tag color="error">Failed</Tag>
                                )}
                                {item.status === 'uploading' && (
                                  <Tag color="processing">Uploading</Tag>
                                )}
                                {item.status === 'pending' && (
                                  <Tag>Pending</Tag>
                                )}
                              </div>
                            </div>
                          }
                          description={
                            <div className="space-y-2">
                              {(item.status === 'uploading' || item.status === 'pending') && (
                                <Progress
                                  percent={Math.round(item.progress || 0)}
                                  size="small"
                                  strokeColor={getStatusColor(item.status)}
                                />
                              )}
                              {item.error && (
                                <Text type="danger" className="text-sm">
                                  {item.error}
                                </Text>
                              )}
                            </div>
                          }
                        />
                      </List.Item>
                    </motion.div>
                  )}
                />
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card title="Upload Tips" size="small">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Supported Formats</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• Images: JPG, PNG, GIF, WebP, SVG</li>
                  <li>• Videos: MP4, WebM, MOV</li>
                  <li>• Max file size: 10MB</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Best Practices</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• Use descriptive filenames</li>
                  <li>• Add relevant tags for easy searching</li>
                  <li>• Optimize images before uploading</li>
                </ul>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};