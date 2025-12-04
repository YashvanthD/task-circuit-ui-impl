/**
 * Reusable Button component using Material UI.
 * @param {object} props - Button props
 * @returns {JSX.Element}
 */
import React from 'react';
import Button from '@mui/material/Button';

export default function CustomButton(props) {
  return <Button {...props} sx={{ boxShadow: 2, ...(props.sx || {}) }}>{props.children}</Button>;
}
