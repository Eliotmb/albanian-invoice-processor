import React, { useState } from 'react';
import { Upload, Spin, Alert, Typography, Card, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './UploadForm.css';

const { Dragger } = Upload;

const UploadForm = ({ onUploadSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState('');
  const navigate = useNavigate();

  const handleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    setError(null);

    try {
      console.log('Sending file to server...');
      const response = await axios.post('http://localhost:8080/api/process-invoice/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000,
      });

      console.log('Server response:', response.data);
      setResult(response.data.text);
      onUploadSuccess(response.data);

      navigate('/invoice');
    } catch (err) {
      console.error('Upload error:', err);
      let errorMessage;

      if (err.code === 'ECONNABORTED') {
        errorMessage = 'Request timed out. Please try again.';
      } else if (err.code === 'ERR_NETWORK') {
        errorMessage = 'Network error. Please check if the server is running and try again.';
      } else {
        errorMessage = err.response?.data?.detail ||
                       err.response?.data?.error ||
                       err.message ||
                       'Error processing invoice';
      }

      setError(`Error: ${errorMessage}`);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const uploadProps = {
    name: 'file',
    accept: 'image/*',
    multiple: false,
    customRequest: ({ file, onSuccess }) => {
      handleFileUpload(file);
      setTimeout(() => {
        onSuccess('ok');
      }, 0);
    },
    showUploadList: false,
  };

  return (
    <div className="upload-container">
      <Typography.Title level={2} className="upload-heading">
        Albanian Invoice Processor
      </Typography.Title>

      <Dragger {...uploadProps} className="upload-dropzone">
        <InboxOutlined style={{ fontSize: '40px', color: '#1890ff' }} />
        <p className="upload-instruction">Drag and drop an invoice here, or click to upload</p>
      </Dragger>


      {loading && (
        <div style={{ marginTop: '20px' }}>
          <Spin size="large" />
        </div>
      )}

      {error && (
        <div style={{ marginTop: '20px' }}>
          <Alert message={error} type="error" showIcon />
        </div>
      )}

      {result && !loading && !error && (
        <div style={{ marginTop: '30px' }}>
          <Card className="upload-result">
            <Typography.Title level={4} className="upload-result-title">
              Extracted Text:
            </Typography.Title>
            <Typography.Paragraph className="upload-result-text">
              {result}
            </Typography.Paragraph>
          </Card>
        </div>
      )}
    </div>
  );
};

export default UploadForm;
