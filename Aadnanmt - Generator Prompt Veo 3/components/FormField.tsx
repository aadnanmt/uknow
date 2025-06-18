import React from 'react';

interface FormFieldProps {
  label: string;
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  type?: 'text' | 'textarea';
  rows?: number;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  id,
  name,
  value,
  onChange,
  placeholder,
  type = 'text',
  rows = 3
}) => {
  const commonProps = {
    id,
    name,
    value,
    onChange,
    placeholder,
    className: "mt-1 block w-full bg-white border border-slate-300 rounded-md shadow-sm py-2 px-3 text-slate-900 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm transition-colors duration-150"
  };

  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      {type === 'textarea' ? (
        <textarea {...commonProps} rows={rows}></textarea>
      ) : (
        <input type={type} {...commonProps} />
      )}
    </div>
  );
};

export default FormField;