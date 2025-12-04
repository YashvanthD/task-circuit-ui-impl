/**
 * Reusable Card component using Material UI.
 * @param {object} props - Card props
 * @returns {JSX.Element}
 */
import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

export default function CustomCard({ children, ...props }) {
  return (
    <Card {...props}>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

