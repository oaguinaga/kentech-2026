import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import { Input } from '../Input';

export interface DateInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    return (
      <Input
        ref={ref}
        type="date"
        label={label}
        error={error}
        helperText={helperText}
        className={className}
        {...props}
      />
    );
  }
);

DateInput.displayName = 'DateInput';

