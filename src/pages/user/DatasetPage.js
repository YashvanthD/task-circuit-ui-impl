import React, { useState } from 'react';
import { Paper, Typography, Stack, Card, CardContent, CardActionArea, Grid, Dialog, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PoolIcon from '@mui/icons-material/Pool';
import FishIcon from '@mui/icons-material/EmojiNature';
import PersonIcon from '@mui/icons-material/Person';
import ReceiptIcon from '@mui/icons-material/ReceiptLong';
import TaskIcon from '@mui/icons-material/ListAlt';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { AddFarmForm } from '../../components/farm/forms';
import {
  BASE_APP_PATH_USER_FISH,
  BASE_APP_PATH_USER_POND,
  BASE_APP_PATH_USER_MANAGE_USERS,
  BASE_APP_PATH_USER_EXPENSES,
  BASE_APP_PATH_USER_TASKS
} from '../../config';

const datasets = [
  { key: 'farms', title: 'Farms', desc: 'Manage farm locations and properties', action: 'add-farm', icon: <AgricultureIcon sx={{ fontSize: 40, color: 'success.main' }} /> },
  { key: 'fish', title: 'Fish', desc: 'View, edit and add fish records', to: BASE_APP_PATH_USER_FISH, icon: <FishIcon sx={{ fontSize: 40, color: 'primary.main' }} /> },
  { key: 'ponds', title: 'Ponds', desc: 'View, edit and add pond records', to: BASE_APP_PATH_USER_POND, icon: <PoolIcon sx={{ fontSize: 40, color: 'primary.main' }} /> },
  { key: 'users', title: 'Users', desc: 'Manage application users and roles', to: BASE_APP_PATH_USER_MANAGE_USERS, icon: <PersonIcon sx={{ fontSize: 40, color: 'primary.main' }} /> },
  { key: 'expenses', title: 'Expenses', desc: 'Manage expenses and cost items', to: BASE_APP_PATH_USER_EXPENSES, icon: <ReceiptIcon sx={{ fontSize: 40, color: 'primary.main' }} /> },
  { key: 'tasks', title: 'Tasks', desc: 'Manage tasks and schedules', to: BASE_APP_PATH_USER_TASKS, icon: <TaskIcon sx={{ fontSize: 40, color: 'primary.main' }} /> },
];

export default function DatasetPage() {
  const navigate = useNavigate();
  const [addFarmDialogOpen, setAddFarmDialogOpen] = useState(false);

  const handleCardClick = (dataset) => {
    if (dataset.action === 'add-farm') {
      setAddFarmDialogOpen(true);
    } else if (dataset.to) {
      navigate(dataset.to);
    }
  };

  const handleCloseFarmDialog = () => {
    setAddFarmDialogOpen(false);
  };

  const handleFarmCreated = (farm) => {
    console.log('Farm created:', farm);
    setAddFarmDialogOpen(false);
    // Could navigate to a farm list page or show success message
  };

  return (
    <Paper sx={{ padding: 4, maxWidth: 1200, margin: '24px auto' }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Dataset
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Collections that describe domain entities (farms, fish, ponds, users, expenses, tasks). Click a card to manage the dataset.
      </Typography>

      <Grid container spacing={3}>
        {datasets.map(ds => (
          <Grid key={ds.key} item xs={12} sm={6} md={4} lg={3}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              {ds.action === 'add-farm' ? (
                // For farms card, don't use CardActionArea to avoid nested buttons
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, height: '100%' }}>
                  <Stack alignItems="center" justifyContent="center" sx={{ width: 72 }}>
                    {ds.icon}
                  </Stack>
                  <Stack sx={{ flex: 1 }}>
                    <Typography variant="h6">{ds.title}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{ds.desc}</Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<AddCircleIcon />}
                      sx={{ mt: 1, alignSelf: 'flex-start' }}
                      onClick={() => setAddFarmDialogOpen(true)}
                    >
                      Add Farm
                    </Button>
                  </Stack>
                </CardContent>
              ) : (
                // For other cards, use CardActionArea for clickable behavior
                <CardActionArea onClick={() => handleCardClick(ds)} sx={{ height: '100%', display: 'flex', alignItems: 'stretch' }}>
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Stack alignItems="center" justifyContent="center" sx={{ width: 72 }}>
                      {ds.icon}
                    </Stack>
                    <Stack sx={{ flex: 1 }}>
                      <Typography variant="h6">{ds.title}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{ds.desc}</Typography>
                    </Stack>
                  </CardContent>
                </CardActionArea>
              )}
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add Farm Dialog */}
      <Dialog open={addFarmDialogOpen} onClose={handleCloseFarmDialog} maxWidth="sm" fullWidth>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Add New Farm</Typography>
          <AddFarmForm
            onSuccess={handleFarmCreated}
            onCancel={handleCloseFarmDialog}
          />
        </Box>
      </Dialog>

    </Paper>
  );
}
