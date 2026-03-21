import { useState } from "react";
import { ChevronDownIcon } from "../../icons";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  options: Option[];
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
  defaultValue?: string;
  value?: string;
}

const Select: React.FC<SelectProps> = ({
  options,
  placeholder ,
  onChange,
  className = "",
  defaultValue = "",
  value,
}) => {
  // Manage the selected value (uncontrolled fallback)
  const [selectedValue, setSelectedValue] = useState<string>(defaultValue);

  const controlled = value !== undefined;
  const displayValue = controlled ? value : selectedValue;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value;
    if (!controlled) setSelectedValue(v);
    onChange(v); // Trigger parent handler
  };
 
  return (
   <div className="relative ">
     <select
      className={`h-11 w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-8 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:placeholder:text-white/30 dark:focus:border-brand-600 ${
        displayValue
          ? "text-gray-800 dark:text-white/90"
          : "text-gray-400 dark:text-gray-500"
      } ${className}`}
      value={displayValue}
      onChange={handleChange}
    >
      
      {
        placeholder && <option
        value=""
        disabled
        className="text-gray-700 dark:bg-gray-800 dark:text-gray-300"
      >
        {placeholder}
      </option>
      }
      {/* Map over options */}
      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
          className="text-gray-700 dark:bg-gray-800 dark:text-gray-300"
        >
          {option.label}
        </option>
      ))}
    </select>
    <ChevronDownIcon
                  className={`absolute right-2 top-0 h-11 w-5 text-gray-500 pointer-events-none  transition-transform duration-200 `}
    />
   </div>
  );
};

export default Select;
