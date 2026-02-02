/**
 * Calendar - Simple monthly calendar view
 */
import React from 'react';
import { Box, Paper, Typography, Grid, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';

export default function Calendar({
  events = [],
  onDateClick,
  onEventClick,
}) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const renderHeader = () => {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, p: 1 }}>
        <IconButton onClick={prevMonth}><ArrowBackIcon /></IconButton>
        <Typography variant="h6">{format(currentMonth, 'MMMM yyyy')}</Typography>
        <IconButton onClick={nextMonth}><ArrowForwardIcon /></IconButton>
      </Box>
    );
  };

  const renderDays = () => {
    const days = [];
    const startDate = startOfWeek(currentMonth);

    for (let i = 0; i < 7; i++) {
        days.push(
            <Grid item xs={12 / 7} key={i} sx={{ textAlign: 'center', fontWeight: 'bold' }}>
              {format(addDays(startDate, i), 'EEE')}
            </Grid>
        );
    }
    return <Grid container spacing={0}>{days}</Grid>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const formattedDate = format(day, 'd');
        const cloneDay = day;
        const isCurrentMonth = isSameMonth(day, monthStart);
        const dayEvents = events.filter(e => isSameDay(new Date(e.date), day));

        days.push(
          <Grid item xs={12 / 7} key={day} sx={{
              height: 80,
              border: '1px solid #eee',
              bgcolor: isCurrentMonth ? 'background.paper' : 'action.hover',
              cursor: 'pointer',
              overflow: 'hidden',
              position: 'relative'
          }} onClick={() => onDateClick && onDateClick(cloneDay)}>
             <Box sx={{ p: 0.5 }}>
               <Typography variant="caption" sx={{ color: !isCurrentMonth ? 'text.disabled' : 'text.primary' }}>
                 {formattedDate}
               </Typography>
               <Box sx={{ mt: 0.5 }}>
                 {dayEvents.map((evt, idx) => (
                   <Box
                     key={idx}
                     onClick={(e) => { e.stopPropagation(); onEventClick && onEventClick(evt); }}
                     sx={{
                       bgcolor: evt.color || 'primary.main',
                       color: 'white',
                       fontSize: '0.65rem',
                       p: 0.25,
                       borderRadius: 1,
                       mb: 0.25,
                       whiteSpace: 'nowrap',
                       overflow: 'hidden',
                       textOverflow: 'ellipsis'
                     }}
                   >
                     {evt.title}
                   </Box>
                 ))}
               </Box>
             </Box>
          </Grid>
        );
        day = addDays(day, 1);
      }
      rows.push(<Grid container key={day} spacing={0}>{days}</Grid>);
      days = [];
    }
    return <Box>{rows}</Box>;
  };

  return (
    <Paper sx={{ p: 2 }}>
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </Paper>
  );
}
