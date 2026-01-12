import React, { useState, useRef, useEffect } from 'react';
import styles from './CustomSelect.module.css';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ options, value, onChange, placeholder, className }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={`${styles.selectWrapper} ${className || ''}`} ref={ref} tabIndex={0}>
      <div
        className={styles.selectBox}
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={styles.selectedValue}>
          {selectedOption ? selectedOption.label : placeholder || '선택하세요'}
        </span>
        <span className={styles.icon}>
          {/* SVG 아이콘 */}
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="8" viewBox="0 0 13 8" fill="none">
            <path d="M6.87713 7.41375C6.4795 7.85939 5.78244 7.85939 5.38482 7.41375L0.256071 1.66577C-0.318983 1.02129 0.138486 7.39931e-07 1.00223 8.15442e-07L11.2597 1.71218e-06C12.1235 1.78769e-06 12.5809 1.02129 12.0059 1.66577L6.87713 7.41375Z" fill="#9EA4AA"/>
          </svg>
        </span>
      </div>
      {open && (
        <ul className={styles.options} role="listbox">
          {options.map(opt => (
            <li
              key={opt.value}
              className={
                `${styles.option} ${opt.value === value ? styles.selected : ''}`
              }
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              role="option"
              aria-selected={opt.value === value}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomSelect;
