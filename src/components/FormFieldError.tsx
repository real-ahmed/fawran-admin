interface FormFieldErrorProps {
  message?: string;
}

export const FormFieldError = ({ message }: FormFieldErrorProps) => (
  <p className="min-h-5 text-xs font-medium text-destructive">
    {message || '\u00A0'}
  </p>
);
