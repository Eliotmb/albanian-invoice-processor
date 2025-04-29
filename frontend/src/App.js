import React, { useState } from 'react';
import { Container, Box, Button } from '@mui/material';
import UploadForm from './components/UploadForm';
import InvoiceDisplay from './components/InvoiceDisplay';
import './App.css';

function App() {
  const [invoiceData, setInvoiceData] = useState(null);

  const handleBackClick = () => {
    setInvoiceData(null);
  };

  return (
    <Box className={`main-box ${invoiceData ? 'with-data' : ''}`}>
      <Container maxWidth="md">
        {!invoiceData ? (
          <UploadForm onUploadSuccess={setInvoiceData} />
        ) : (
          <>
            <Box className="back-button-box">
              <Button className="back-button" variant="outlined" onClick={handleBackClick}>
                Back to Upload
              </Button>
            </Box>

            <Box className="invoice-display-box">
              <InvoiceDisplay data={invoiceData} />
            </Box>
          </>
        )}
      </Container>
    </Box>
  );
}

export default App;
