import React, { useEffect, useState } from 'react';
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
  const [items, setItems] = useState([]);

  useEffect(() => {
    // When backend is not ready, mocking only the items
    if (data && data.raw_text) {
      const mockItems = [
        {
          nr_kartele: '12345',
          pershkrimi: 'Shërbim X',
          njesia: 'copë',
          sasia: 5,
          cmimi: 100.00,
          vlera_pa_tvsh: 500.00,
          tvsh: '18%',
          vlera_me_tvsh: 590.00
        },
        {
          nr_kartele: '12346',
          pershkrimi: 'Shërbim Y',
          njesia: 'copë',
          sasia: 3,
          cmimi: 150.00,
          vlera_pa_tvsh: 450.00,
          tvsh: '18%',
          vlera_me_tvsh: 531.00
        }
      ];
      setItems(mockItems);
    }
  }, [data]);

  if (!data || !data.raw_text) return <Typography>Loading...</Typography>;

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Invoice Details
      </Typography>

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
            {items.map((item, index) => (
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

      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Raw Extracted Text:
        </Typography>
        <Paper sx={{ p: 2, mt: 1, maxHeight: 200, overflow: 'auto' }}>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
            {data.raw_text}
          </pre>
        </Paper>
      </Box>
    </Box>
  );
};

export default InvoiceDisplay;
