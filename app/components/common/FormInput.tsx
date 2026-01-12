import React from 'react';
import styles from './FormInput.module.css';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

const FormInput: React.FC<FormInputProps> = ({ className = '', ...props }) => {
  return <input className={`${styles.formInput} ${className}`} {...props} />;
};

export default FormInput;
