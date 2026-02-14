import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Box, Paper, Button, Stack, Typography, Chip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';

import { DataTable, PageHeader } from '../../components/common';
import { createFish, modifyFish, removeFish, getFishList, getStockList } from '../../utils/fish';
import { FishFormDialog } from '../../components/fish';

export default function FishPage() {
  const [speciesData, setSpeciesData] = useState([]);
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSpecies, setSelectedSpecies] = useState(null);
  const [dialogMode, setDialogMode] = useState('add');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [speciesRes, stockRes] = await Promise.all([
        getFishList(),
        getStockList()
      ]);
      setSpeciesData(speciesRes.data || []);
      setStockData(stockRes.data || []);
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Map stocks to species to get aggregate counts
  const rows = useMemo(() => {
    return speciesData.map(species => {
      const speciesStocks = stockData.filter(
        s => s.species_id === species.species_id || s.species_id === species.id
      );
      const totalCount = speciesStocks.reduce((sum, s) => sum + (Number(s.current_count) || 0), 0);
      const activeStocks = speciesStocks.filter(s => s.status === 'active').length;

      return {
        ...species,
        total_count: totalCount,
        active_stocks: activeStocks,
      };
    });
  }, [speciesData, stockData]);

  const handleEdit = (row) => {
    setSelectedSpecies(row);
    setDialogMode('edit');
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedSpecies({});
    setDialogMode('add');
    setDialogOpen(true);
  };

  const handleDelete = useCallback(async (row) => {
    if (window.confirm(`Are you sure you want to delete ${row.common_name}?`)) {
      try {
        await removeFish(row.species_id || row.id);
        fetchData();
      } catch (err) {
        console.error("Delete failed", err);
      }
    }
  }, []);

  const handleDialogSubmit = async (formData) => {
    try {
      if (dialogMode === 'add') {
        await createFish(formData);
      } else {
        await modifyFish(selectedSpecies.species_id || selectedSpecies.id, formData);
      }
      setDialogOpen(false);
      fetchData();
    } catch (err) {
      console.error('Operation failed', err);
      alert('Operation failed');
    }
  };

  const columns = useMemo(() => [
    {
      id: 'common_name',
      label: 'Common Name',
      // flex: 1, // DataTable might not support flex directly in cellSx, checking header code it just spreads ...headerSx. Let's assume align or width works.
      render: (row) => (
        <Stack>
          <Typography variant="body2" fontWeight="bold">{row.common_name}</Typography>
          <Typography variant="caption" color="text.secondary">{row.scientific_name}</Typography>
        </Stack>
      )
    },
    {
      id: 'category',
      label: 'Category',
      render: (row) => row.category ? <Chip label={row.category} size="small" variant="outlined" /> : '-'
    },
    {
      id: 'active_stocks',
      label: 'Active Stocks',
      align: 'center',
      render: (row) => (
         <Chip label={row.active_stocks} color={row.active_stocks > 0 ? "success" : "default"} size="small" />
      )
    },
    {
      id: 'total_count',
      label: 'Total Population',
      align: 'right',
      render: (row) => (
        <Typography variant="body2" fontWeight="bold">
          {row.total_count?.toLocaleString()}
        </Typography>
      )
    },
    {
      id: 'status',
      label: 'Status',
      render: (row) => {
        const color = row.status === 'active' ? 'success' : 'default';
        return <Chip label={row.status} color={color} size="small" variant="outlined" />;
      }
    }
  ], []);

  const rowActions = [
    {
      label: 'Edit',
      icon: <EditIcon fontSize="small" />,
      onClick: (row) => handleEdit(row),
      color: 'primary'
    },
    {
      label: 'Delete',
      icon: <DeleteIcon fontSize="small" />,
      onClick: (row) => handleDelete(row),
      color: 'error'
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader
        title="Fish Species"
        subtitle="Manage fish species catalog"
        actions={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
          >
            Add Fish
          </Button>
        }
      />

      <Paper sx={{ mt: 3, p: 2 }}>
        <Stack direction="row" justifyContent="flex-end" mb={2}>
           <Button startIcon={<RefreshIcon />} onClick={fetchData} size="small">
             Refresh
           </Button>
        </Stack>

        <DataTable
          data={rows}
          columns={columns}
          loading={loading}
          getRowKey={(row) => row.species_id || row.id}
          clickableRows={true}
          onRowClick={(row) => handleEdit(row)}
          rowActions={rowActions}
        />
      </Paper>

      <FishFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleDialogSubmit}
        initialData={selectedSpecies}
        mode={dialogMode}
      />
    </Box>
  );
}
