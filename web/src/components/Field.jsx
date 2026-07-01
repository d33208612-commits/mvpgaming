export function Field({ label, children, hint, error, icon, required }) {
  return (
    <label className="field">
      <span className="field-label">
        {icon && <span className="ic">{icon}</span>}
        {label}
        {required && <span className="req">*</span>}
      </span>
      {children}
      {error ? (
        <span className="field-error">{error}</span>
      ) : hint ? (
        <span className="field-hint">{hint}</span>
      ) : null}
    </label>
  );
}

export function TextInput(props) {
  const { invalid, ...rest } = props;
  return <input className={invalid ? 'input invalid' : 'input'} {...rest} />;
}

export function TextArea(props) {
  return <textarea className="input textarea" {...props} />;
}

export function Select({ options, placeholder, ...props }) {
  return (
    <select className="input select" {...props}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => {
        const value = typeof o === 'string' ? o : o.value;
        const label = typeof o === 'string' ? o : o.label;
        return (
          <option key={value} value={value}>
            {label}
          </option>
        );
      })}
    </select>
  );
}

export function Chips({ options, value, onChange, allowUnset = true }) {
  return (
    <div className="chips">
      {options.map((o) => {
        const val = typeof o === 'string' ? o : o.value;
        const label = typeof o === 'string' ? o : o.label;
        const active = value === val;
        return (
          <button type="button" key={val}
            className={active ? 'chip active' : 'chip'}
            onClick={() => onChange(active && allowUnset ? '' : val)}>
            {label}
          </button>
        );
      })}
    </div>
  );
}
