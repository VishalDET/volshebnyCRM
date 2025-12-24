/**
 * Input Component
 * Reusable input field with label, error handling, and validation states
 */
const Input = ({
    label,
    name,
    type = 'text',
    value = '',
    onChange,
    onBlur,
    placeholder,
    error,
    touched,
    required = false,
    disabled = false,
    className = '',
    icon,
    ...props
}) => {
    const inputClasses = `
    input
    ${error && touched ? 'input-error' : ''}
    ${icon ? 'pl-10' : ''}
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

            <div className="relative">
                {icon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-secondary-400">{icon}</span>
                    </div>
                )}

                <input
                    id={name}
                    name={name}
                    type={type}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={inputClasses}
                    {...props}
                />
            </div>

            {error && touched && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
        </div>
    )
}

export default Input
