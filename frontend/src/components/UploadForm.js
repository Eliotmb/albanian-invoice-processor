import React, { useState } from 'react';
import { Button, Box, CircularProgress, Alert } from '@mui/material';
import axios from 'axios';

const UploadForm = ({ onUploadSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

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
        timeout: 30000, // 30 second timeout
      });

      console.log('Server response:', response.data);
      onUploadSuccess(response.data);
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ my: 4, textAlign: 'center' }}>
      <input
        accept="image/*"
        style={{ display: 'none' }}
        id="raised-button-file"
        type="file"
        onChange={handleFileUpload}
      />
      <label htmlFor="raised-button-file">
        <Button variant="contained" component="span" disabled={loading}>
          Upload Invoice
        </Button>
      </label>

      {loading && (
        <Box sx={{ mt: 2 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Box sx={{ mt: 2 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}
    </Box>
  );
};

export default UploadForm;
