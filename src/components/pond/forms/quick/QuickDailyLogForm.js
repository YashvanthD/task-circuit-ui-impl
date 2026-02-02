/**
 * QuickDailyLogForm - Main daily log form optimized for mobile
 */
import React, { useState, useEffect } from 'react';
import { FormContainer, FormSection, FormActions } from '../../../common/forms';
import QuickActionButtons from './QuickActionButtons';
import WaterQualityQuickLog from './WaterQualityQuickLog';
import FeedingLogForm from './FeedingLogForm';
import ObservationChecklist from '../../shared/ObservationChecklist';
import IssueReporter from '../../shared/IssueReporter';

export default function QuickDailyLogForm({
  pond,
  initialData,
  onSubmit,
  onCancel,
}) {
  // Default State
  const [formData, setFormData] = useState({
    log_date: new Date().toISOString().split('T')[0],
    log_time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),

    // Quick Logs
    visual_check: true,

    // Water Quality
    temperature: '',
    ph: '',
    dissolved_oxygen: '',

    // Feeding
    time_slot: 'morning',
    amount_kg: '',
    feeding_behavior: 'normal',

    // Observations
    observations: {
      fish_activity: 'normal',
      water_color: 'clear',
      smell: 'normal',
      visibility: 'good'
    },

    // Issues
    has_issues: false,
    issue_type: '',
    issue_description: '',
    issue_photos: [],

    ...initialData
  });

  useEffect(() => {
    // Auto-set time slot based on current time
    const hour = new Date().getHours();
    let slot = 'morning';
    if (hour >= 12 && hour < 17) slot = 'afternoon';
    if (hour >= 17) slot = 'evening';

    setFormData(prev => ({ ...prev, time_slot: slot }));
  }, []);

  const handleQuickAction = (action) => {
    // Convenience setters
    if (action === 'visual_ok') {
      setFormData(prev => ({
        ...prev,
        visual_check: true,
        has_issues: false,
        observations: { ...prev.observations, fish_activity: 'normal', water_color: 'clear' }
      }));
    }
    if (action === 'fed_normal') {
      setFormData(prev => ({
        ...prev,
        amount_kg: '15', // Should be from recommended model logic
        feeding_behavior: 'normal'
      }));
    }
    // More logic...
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleObservationChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      observations: { ...prev.observations, [key]: value }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit && onSubmit(formData);
  };

  return (
    <FormContainer
      onSubmit={handleSubmit}
      onCancel={onCancel}
      title={`Daily Log - ${pond?.name || 'Unknown Pond'}`}
      submitText="Save Log"
    >
      {/* 1. Quick Actions */}
      <QuickActionButtons onQuickAction={handleQuickAction} />

      {/* 2. Water Quality */}
      <FormSection>
        <WaterQualityQuickLog
          values={formData}
          onChange={handleChange}
        />
      </FormSection>

      {/* 3. Feeding */}
      <FormSection>
        <FeedingLogForm
          values={formData}
          onChange={handleChange}
          recommendedAmount={15} // Placeholder
        />
      </FormSection>

      {/* 4. Observations */}
      <FormSection>
        <ObservationChecklist
          values={formData.observations}
          onChange={handleObservationChange}
        />
      </FormSection>

      {/* 5. Issues */}
      <FormSection>
        <IssueReporter
          hasIssues={formData.has_issues}
          onToggleIssue={(val) => handleChange('has_issues', val)}
          issueDetails={{
            type: formData.issue_type,
            description: formData.issue_description,
            photos: formData.issue_photos
          }}
          onChangeDetails={(key, val) => {
            if (key === 'photos') handleChange('issue_photos', val);
            else if (key === 'type') handleChange('issue_type', val);
            else handleChange('issue_description', val);
          }}
        />
      </FormSection>

      {/* 6. Form Actions */}
      <FormActions
        onCancel={onCancel}
        onSubmit={handleSubmit}
        submitText="Save Log"
      />
    </FormContainer>
  );
}
