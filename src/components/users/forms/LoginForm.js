/**
 * Login form component using unified layout.
 */
import React, { useState } from 'react';
import { FormContainer, FormField, FormActions } from '../../common/forms';
import { Grid } from '@mui/material';

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    // Add login logic here
    console.log('Login attempt:', username);
  };

  return (
    <FormContainer
      title="Login"
      onSubmit={handleSubmit}
      maxWidth={400}
    >
      <Grid container spacing={2}>
        <FormField
          label="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
          xs={12}
        />
        <FormField
          label="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          xs={12}
        />

        <FormActions
          submitText="Login"
        />
      </Grid>
    </FormContainer>
  );
}
