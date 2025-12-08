/**
 * Loader Component
 * Reusable loading spinner with different sizes and variants
 */
const Loader = ({
    size = 'md',
    variant = 'primary',
    fullScreen = false,
    text = '',
}) => {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-12 w-12',
        xl: 'h-16 w-16',
    }

    const colorClasses = {
        primary: 'border-primary-600',
        secondary: 'border-secondary-600',
        white: 'border-white',
    }

    const spinner = (
        <div className="flex flex-col items-center justify-center gap-3">
            <div
                className={`
          animate-spin rounded-full border-b-2
          ${sizeClasses[size] || sizeClasses.md}
          ${colorClasses[variant] || colorClasses.primary}
        `}
            />
            {text && (
                <p className="text-sm text-secondary-600">{text}</p>
            )}
        </div>
    )

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
                {spinner}
            </div>
        )
    }

    return spinner
}

export default Loader
