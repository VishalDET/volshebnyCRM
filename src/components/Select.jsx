/**
 * Select Component
 * Reusable dropdown select with label and error handling
 */
const Select = ({
    label,
    name,
    value = '',
    onChange,
    onBlur,
    options = [],
    error,
    touched,
    required = false,
    disabled = false,
    placeholder = 'Select an option',
    className = '',
    ...props
}) => {
    const selectClasses = `
    input
    ${error && touched ? 'input-error' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ')

    return (
        <div className="w-full">
            {label && (
                <label htmlFor={name} className="block text-sm font-medium text-secondary-700 mb-1">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <select
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                disabled={disabled}
                className={selectClasses}
                {...props}
            >
                <option value="">{placeholder}</option>
                {options.map((option, index) => (
                    <option
                        key={`${option.value || option.id}-${index}`}
                        value={option.value || option.id}
                    >
                        {option.label || option.name}
                    </option>
                ))}
            </select>

            {error && touched && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
        </div>
    )
}

export default Select
