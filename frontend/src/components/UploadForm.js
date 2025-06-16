import React, { useState } from 'react';
import { Upload, Spin, Alert, Typography, Card, message, Progress } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import axios from 'axios';
import './UploadForm.css';

const { Dragger } = Upload;

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:3001';

const UploadForm = ({ onUploadSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState('');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');

  const handleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    setError(null);
    setProgress(0);
    setStatus('Starting upload...');

    try {
      console.log('Sending file to server...');
      console.log('API URL:', API_URL);
      console.log('Full health check URL:', `${API_URL}/health`);
      
      // First check if the server is running
      try {
        setStatus('Checking server health...');
        console.log('Attempting health check...');
        const healthCheck = await axios.get(`${API_URL}/health`, {
          timeout: 5000,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        console.log('Health check response:', healthCheck.data);
        setProgress(10);
      } catch (healthError) {
        console.error('Health check failed:', healthError);
        console.error('Error details:', {
          message: healthError.message,
          code: healthError.code,
          response: healthError.response,
          request: healthError.request
        });
        throw new Error('Backend server is not responding. Please check if the server is running.');
      }

      setStatus('Uploading image...');
      const response = await axios.post(`${API_URL}/api/process-invoice/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 120000, // Increased timeout to 120 seconds
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(10 + (percentCompleted * 0.3)); // 10-40% for upload
          setStatus(`Uploading image... ${percentCompleted}%`);
        },
      });

      setProgress(40);
      setStatus('Processing image with OCR...');
      
      console.log('Server response:', response.data);
      
      if (response.data && response.data.text) {
        setResult(response.data.text);
        onUploadSuccess(response.data);
        setProgress(100);
        setStatus('Complete');
        message.success('Image processed successfully!');
      } else {
        throw new Error('No text was extracted from the image');
      }
    } catch (err) {
      console.error('Upload error:', err);
      let errorMessage;

      if (err.code === 'ECONNABORTED') {
        errorMessage = 'Request timed out. Please try again.';
      } else if (err.code === 'ERR_NETWORK') {
        errorMessage = 'Network error. Please check if the server is running and try again.';
      } else if (err.response) {
        errorMessage = `Server error: ${err.response.status} - ${err.response.data?.detail || err.response.data?.message || 'Unknown error'}`;
      } else if (err.request) {
        errorMessage = 'No response from server. Please check if the server is running.';
      } else {
        errorMessage = err.message || 'Error processing invoice';
      }

      setError(`Error: ${errorMessage}`);
      message.error(errorMessage);
      setProgress(0);
      setStatus('Failed');
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
          <Progress percent={progress} status={error ? 'exception' : 'active'} />
          <p style={{ textAlign: 'center', marginTop: '10px' }}>{status}</p>
          <Spin size="large" />
        </div>
      )}

      {error && (
        <div style={{ marginTop: '20px' }}>
          <Alert 
            message="Error" 
            description={error} 
            type="error" 
            showIcon 
            closable
          />
        </div>
      )}

      {/* Always show the result card after upload, even if result is empty */}
      {!loading && !error && (
        <div style={{ marginTop: '30px' }}>
          <Card className="upload-result">
            <Typography.Title level={4} className="upload-result-title">
              Extracted Text:
            </Typography.Title>
            <Typography.Paragraph className="upload-result-text">
              {result || "No text extracted."}
            </Typography.Paragraph>
          </Card>
        </div>
      )}
    </div>
  );
};

export default UploadForm;
