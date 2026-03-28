import React from 'react';

export const InputField = ({ label, type = 'text', value, onChange, placeholder, required, disabled, error, className = '', icon, ...props }) => {
  return (
    <div className={className}>
      {label && (
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 flex items-center gap-1.5">
          {icon && <span className="text-slate-500">{icon}</span>}
          {label}
          {required && <span className="text-pink-400">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`w-full input-glass rounded-xl px-4 py-3 text-sm transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${error ? 'border-pink-500 focus:border-pink-500 focus:shadow-[0_0_15px_rgba(255,45,120,0.3)]' : ''}`}
        {...props}
      />
      {error && (
        <p className="text-[10px] text-pink-400 font-bold mt-1">{error}</p>
      )}
    </div>
  );
};

export const TextArea = ({ label, value, onChange, placeholder, required, disabled, error, className = '', rows = 3, ...props }) => {
  return (
    <div className={className}>
      {label && (
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
          {label}
          {required && <span className="text-pink-400 ml-1">*</span>}
        </label>
      )}
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        rows={rows}
        className={`w-full input-glass rounded-xl px-4 py-3 text-sm transition-all resize-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${error ? 'border-pink-500' : ''}`}
        {...props}
      />
      {error && <p className="text-[10px] text-pink-400 font-bold mt-1">{error}</p>}
    </div>
  );
};

export const SelectField = ({ label, value, onChange, options = [], required, disabled, error, className = '', placeholder = 'Select...', ...props }) => {
  return (
    <div className={className}>
      {label && (
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
          {label}
          {required && <span className="text-pink-400 ml-1">*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`w-full input-glass rounded-xl px-4 py-3 text-sm transition-all appearance-none cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${error ? 'border-pink-500' : ''}`}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map(opt => (
          <option key={opt.value || opt} value={opt.value || opt}>
            {opt.label || opt}
          </option>
        ))}
      </select>
      {error && <p className="text-[10px] text-pink-400 font-bold mt-1">{error}</p>}
    </div>
  );
};
