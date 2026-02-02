/**
 * DataTableExport Component
 * Export table data to PDF, CSV, or Excel
 */

import React, { useState } from 'react';
import { Box, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import {
  PictureAsPdf as PdfIcon,
  TableChart as CsvIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import ActionButton from '../ActionButton';

/**
 * Export table data to CSV
 */
const exportToCSV = (data, columns, filename = 'export.csv') => {
  // Get headers
  const headers = columns.map(col => col.label).join(',');

  // Get rows
  const rows = data.map(row => {
    return columns.map(col => {
      const value = col.render ? col.render(row, 0) : row[col.id];
      // Handle objects, numbers, strings
      if (value === null || value === undefined) return '';
      if (typeof value === 'object') return JSON.stringify(value);
      // Escape commas and quotes
      const stringValue = String(value).replace(/"/g, '""');
      return `"${stringValue}"`;
    }).join(',');
  }).join('\n');

  const csv = `${headers}\n${rows}`;

  // Create blob and download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export table data to PDF using browser print
 */
const exportToPDF = (data, columns, filename = 'export.pdf') => {
  // Create a new window with the table
  const printWindow = window.open('', '_blank');

  // Get headers
  const headers = columns.map(col => `<th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">${col.label}</th>`).join('');

  // Get rows - extract text content from rendered values
  const rows = data.map(row => {
    const cells = columns.map(col => {
      let value = col.render ? col.render(row, 0) : row[col.id];

      // If value is a React element, try to extract text
      if (value && typeof value === 'object' && value.props) {
        // Try to get text content from React element
        if (value.props.children) {
          value = value.props.children;
        } else {
          value = String(value);
        }
      }

      // Handle null/undefined
      if (value === null || value === undefined) value = '';

      // Convert to string and escape HTML
      const stringValue = String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

      return `<td style="border: 1px solid #ddd; padding: 8px;">${stringValue}</td>`;
    }).join('');

    return `<tr>${cells}</tr>`;
  }).join('');

  // Create HTML content
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <title>${filename}</title>
      <style>
        @media print {
          body { margin: 0; }
          table { page-break-inside: auto; }
          tr { page-break-inside: avoid; page-break-after: auto; }
        }
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
        }
        table {
          border-collapse: collapse;
          width: 100%;
          margin: 20px 0;
        }
        h1 {
          font-size: 24px;
          margin-bottom: 10px;
        }
        .meta {
          color: #666;
          font-size: 14px;
          margin-bottom: 20px;
        }
      </style>
    </head>
    <body>
      <h1>${filename.replace('.pdf', '')}</h1>
      <div class="meta">
        Generated on ${new Date().toLocaleString()}
        <br>
        Total Records: ${data.length}
      </div>
      <table>
        <thead>
          <tr>${headers}</tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
      <script>
        window.onload = function() {
          window.print();
          window.onafterprint = function() {
            window.close();
          };
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};

export default function DataTableExport({
  data,
  columns,
  filename = 'table-export',
  formats = ['pdf', 'csv'],
  variant = 'contained',
  size = 'small',
  color = 'primary',
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    if (formats.length === 1) {
      // Direct export if only one format
      handleExport(formats[0]);
    } else {
      // Show menu if multiple formats
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleExport = (format) => {
    const fileExt = format === 'pdf' ? '.pdf' : '.csv';
    const fullFilename = filename.endsWith(fileExt) ? filename : `${filename}${fileExt}`;

    switch (format) {
      case 'pdf':
        exportToPDF(data, columns, fullFilename);
        break;
      case 'csv':
        exportToCSV(data, columns, fullFilename);
        break;
      default:
        console.warn(`Export format "${format}" not supported`);
    }

    handleClose();
  };

  if (!data || data.length === 0) {
    return null; // Don't show export button if no data
  }

  return (
    <Box>
      <ActionButton
        variant={variant}
        size={size}
        color={color}
        icon={<DownloadIcon />}
        onClick={handleClick}
      >
        Export
      </ActionButton>

      {formats.length > 1 && (
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          {formats.includes('pdf') && (
            <MenuItem onClick={() => handleExport('pdf')}>
              <ListItemIcon>
                <PdfIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>Export as PDF</ListItemText>
            </MenuItem>
          )}
          {formats.includes('csv') && (
            <MenuItem onClick={() => handleExport('csv')}>
              <ListItemIcon>
                <CsvIcon fontSize="small" color="success" />
              </ListItemIcon>
              <ListItemText>Export as CSV</ListItemText>
            </MenuItem>
          )}
        </Menu>
      )}
    </Box>
  );
}
