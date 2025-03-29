import React, { useState } from 'react';
import { Container, Typography, CssBaseline, Box } from '@mui/material';
import UploadForm from './components/UploadForm';
import InvoiceDisplay from './components/InvoiceDisplay';

function App() {
  const [invoiceData, setInvoiceData] = useState(null);

  return (
    <>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Albanian Invoice Processor
          </Typography>
          
          <UploadForm onUploadSuccess={setInvoiceData} />
          <InvoiceDisplay data={invoiceData} />
        </Box>
      </Container>
    </>
  );
}

export default App;
