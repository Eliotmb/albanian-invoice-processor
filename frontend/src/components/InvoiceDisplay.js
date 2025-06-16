import React from 'react';
import { 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Typography,
  Box 
} from '@mui/material';

const InvoiceDisplay = ({ data }) => {
  if (!data) return <Typography>Loading...</Typography>;

  const totals = data.extracted_data && data.extracted_data.totals ? data.extracted_data.totals : {};
  // const pairs = data.extracted_data && data.extracted_data.pairs ? data.extracted_data.pairs : [];

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Invoice Details
      </Typography>

      {Object.keys(totals).length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" gutterBottom>
            Invoice Totals
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableBody>
                {Object.entries(totals).map(([label, value]) => (
                  <TableRow key={label}>
                    <TableCell>{label}</TableCell>
                    <TableCell align="right">{value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {data.items && data.items.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nr Kartele</TableCell>
                <TableCell>Përshkrimi</TableCell>
                <TableCell>Njësia</TableCell>
                <TableCell align="right">Sasia</TableCell>
                <TableCell align="right">Çmimi</TableCell>
                <TableCell align="right">Vlera pa TVSH</TableCell>
                <TableCell align="right">TVSH</TableCell>
                <TableCell align="right">Vlera me TVSH</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.nr_kartele}</TableCell>
                  <TableCell>{item.pershkrimi}</TableCell>
                  <TableCell>{item.njesia}</TableCell>
                  <TableCell align="right">{item.sasia}</TableCell>
                  <TableCell align="right">{item.cmimi}</TableCell>
                  <TableCell align="right">{item.vlera_pa_tvsh}</TableCell>
                  <TableCell align="right">{item.tvsh}</TableCell>
                  <TableCell align="right">{item.vlera_me_tvsh}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography variant="body1" color="text.secondary">
          No items found in the invoice.
        </Typography>
      )}

      {data.text && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Raw Extracted Text:
          </Typography>
          <Paper sx={{ p: 2, mt: 1, maxHeight: 200, overflow: 'auto' }}>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
              {data.text}
            </pre>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default InvoiceDisplay;
