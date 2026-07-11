import '../../styles/components/ui.css';

export default function Input({
  label, type = 'text', value, onChange, required = false, placeholder = '', name, variant = 'underline',
}) {
  return (
    <div className="field">
      {label && <label className="field__label">{label}</label>}
      <input
        className={variant === 'boxed' ? 'field__input field__input--boxed' : 'field__input'}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
      />
    </div>
  );
}