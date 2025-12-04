import React from 'react';
import { Paper, Typography } from '@mui/material';

export default function SalesTaxPage() {
    return (
        <Paper sx={{ padding: 4, maxWidth: 1000, margin: '40px auto' }}>
            <Typography variant="h4" sx={{ mb: 2 }}>
                Sales Tax
            </Typography>
            <Typography variant="body1">
                This is the Sales Tax page. Add your sales tax management features here.
            </Typography>
        </Paper>
    );
}

