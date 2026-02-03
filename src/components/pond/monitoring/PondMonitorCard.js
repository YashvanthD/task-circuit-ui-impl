/**
 * PondMonitorCard - Main card for daily pond monitoring
 */
import React from 'react';
import { BaseCard } from '../../common';
import { HealthStatusChip } from '../../common/enhanced';
import AlertBanner from './AlertBanner';
import StockSummary from './StockSummary';
import WaterQualitySnapshot from './WaterQualitySnapshot';
import DailyTaskChecklist from './DailyTaskChecklist';
import QuickActions from './QuickActions';

import EditIcon from '@mui/icons-material/Edit';
import WavesIcon from '@mui/icons-material/Waves';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Box, IconButton } from '@mui/material';

export default function PondMonitorCard({
  pond,
  health,
  currentStock,
  allStocks = [], // Added allStocks prop
  analytics, // Added analytics prop
  lastWaterQuality,
  todaysTasks = [],
  onLogWQ,
  onFeed,
  onViewDetails,
  onEdit, // Added onEdit prop
  onNavigateToStock, // Added nav prop
  onPerformSampling, // Added sampling prop
  priority = 'normal', // urgent|attention|normal
}) {
  if (!pond) return null;

  const hasIssues = health?.issues?.length > 0;

  // Define Quick Actions
  const quickActions = [
    {
      id: 'log_wq',
      label: 'Log WQ',
      icon: <WavesIcon fontSize="small" />,
      onClick: (e) => {
        e.stopPropagation();
        onLogWQ && onLogWQ(pond);
      },
      color: 'info'
    },
    {
      id: 'feed',
      label: 'Feed',
      icon: <RestaurantIcon fontSize="small" />,
      onClick: (e) => {
        e.stopPropagation();
        onFeed && onFeed(pond);
      },
      color: 'success'
    },
    {
      id: 'view',
      label: 'View',
      icon: <VisibilityIcon fontSize="small" />,
      onClick: (e) => {
        e.stopPropagation();
        onViewDetails && onViewDetails(pond);
      },
      color: 'primary'
    }
  ];

  const getBorderColor = () => {
    if (priority === 'urgent') return 'error.main';
    if (priority === 'attention') return 'warning.main';
    return 'divider';
  };

  return (
    <BaseCard
      title={`${pond.name} | ${pond.pond_type}`}
      subtitle={`Farm: ${pond.farm_name || 'N/A'} | ${pond.area_sqm}m²`}
      headerAction={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation(); // Prevent triggering card onClick
              onEdit && onEdit(pond);
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <HealthStatusChip status={health?.status} />
        </Box>
      }
      clickable={true} // Enable click on the entire card
      onClick={() => onViewDetails && onViewDetails(pond)} // Trigger view on card click
      sx={{
        border: priority !== 'normal' ? '2px solid' : '1px solid',
        borderColor: getBorderColor(),
        height: '100%',
        cursor: 'pointer'
      }}
    >
      {/* Alert Banner */}
      {hasIssues && (
        <AlertBanner
          issues={health.issues}
          severity={health.status === 'critical' ? 'critical' : 'warning'}
          compact
        />
      )}

      {/* Stock Summary */}
      <StockSummary
        stock={currentStock}
        stocks={allStocks} // Pass all stocks
        analytics={analytics} // Pass analytics
        onClick={(e) => {
          e.stopPropagation();
          onViewDetails && onViewDetails(pond);
        }}
        onNavigateToStock={onNavigateToStock} // Pass nav handler
        onPerformSampling={onPerformSampling} // Pass sampling handler
        clickable
      />

      {/* Water Quality Snapshot */}
      <WaterQualitySnapshot
        waterQuality={lastWaterQuality}
        onClick={(e) => {
          e.stopPropagation();
          onViewDetails && onViewDetails(pond);
        }}
      />

      {/* Today's Tasks */}
      <DailyTaskChecklist
        tasks={todaysTasks}
        onComplete={(taskId, e) => {
          if (e) e.stopPropagation();
          console.log('Complete task', taskId);
        }}
      />

      {/* Quick Actions */}
      <QuickActions actions={quickActions} />
    </BaseCard>
  );
}
