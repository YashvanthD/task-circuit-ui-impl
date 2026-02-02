/**
 * IssueReporter - Flag issues in forms
 */
import React from 'react';
import { Box, Typography,  FormGroup, FormControlLabel, Checkbox, TextField } from '@mui/material';
import { FormPhotoUpload } from '../../common/forms';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

export default function IssueReporter({
  hasIssues,
  onToggleIssue,
  issueDetails, // { type, description, photos }
  onChangeDetails,
  issueTypes = ['Disease spotted', 'Dead fish', 'Equipment failure', 'Water quality issue', 'Other'],
  showPhoto = true,
}) {
  return (
    <Box sx={{ p: 2, border: '1px solid', borderColor: hasIssues ? 'error.main' : 'divider', borderRadius: 1, bgcolor: hasIssues ? 'error.lighter' : 'background.paper' }}>
      <FormControlLabel
        control={
          <Checkbox
            checked={hasIssues}
            onChange={(e) => onToggleIssue(e.target.checked)}
            color="error"
          />
        }
        label={
          <Box sx={{ display: 'flex', alignItems: 'center', color: hasIssues ? 'error.main' : 'text.primary' }}>
            <WarningAmberIcon sx={{ mr: 1 }} />
            <Typography variant="subtitle2" component="span" fontWeight={600}>
              Report Issue / Problem
            </Typography>
          </Box>
        }
      />

      {hasIssues && (
        <Box sx={{ mt: 2, pl: 4 }}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>What is wrong?</Typography>
          <FormGroup row>
            {issueTypes.map(type => (
              <FormControlLabel
                key={type}
                control={
                  <Checkbox
                    checked={issueDetails?.type?.includes(type)}
                    onChange={(e) => {
                      const currentTypes = issueDetails?.type ? issueDetails.type.split(', ') : [];
                      let newTypes;
                      if (e.target.checked) {
                        newTypes = [...currentTypes, type];
                      } else {
                        newTypes = currentTypes.filter(t => t !== type);
                      }
                      onChangeDetails('type', newTypes.join(', '));
                    }}
                    size="small"
                  />
                }
                label={<Typography variant="body2">{type}</Typography>}
                sx={{ width: { xs: '100%', sm: '45%' } }}
              />
            ))}
          </FormGroup>

          <TextField
            fullWidth
            multiline
            rows={2}
            placeholder="Describe the issue..."
            value={issueDetails?.description || ''}
            onChange={(e) => onChangeDetails('description', e.target.value)}
            sx={{ mt: 2, mb: 2, bgcolor: 'background.paper' }}
            variant="outlined"
            size="small"
          />

          {showPhoto && (
            <FormPhotoUpload
              label="Add Evidence Photo"
              value={issueDetails?.photos || []}
              onChange={(files) => onChangeDetails('photos', files)}
              maxPhotos={3}
            />
          )}
        </Box>
      )}
    </Box>
  );
}
