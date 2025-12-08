/**
 * PageHeader Component
 * Reusable page header with title, breadcrumbs, and actions
 */
const PageHeader = ({
    title,
    subtitle,
    breadcrumbs = [],
    actions,
    className = '',
}) => {
    return (
        <div className={`mb-6 ${className}`}>
            {/* Breadcrumbs */}
            {breadcrumbs.length > 0 && (
                <nav className="flex mb-2" aria-label="Breadcrumb">
                    <ol className="inline-flex items-center space-x-1 md:space-x-3">
                        {breadcrumbs.map((crumb, index) => (
                            <li key={index} className="inline-flex items-center">
                                {index > 0 && (
                                    <svg
                                        className="w-4 h-4 text-secondary-400 mx-1"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                )}
                                {crumb.href ? (
                                    <a
                                        href={crumb.href}
                                        className="text-sm font-medium text-secondary-600 hover:text-primary-600 transition-colors"
                                    >
                                        {crumb.label}
                                    </a>
                                ) : (
                                    <span className="text-sm font-medium text-secondary-500">
                                        {crumb.label}
                                    </span>
                                )}
                            </li>
                        ))}
                    </ol>
                </nav>
            )}

            {/* Title and Actions */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-secondary-900">{title}</h1>
                    {subtitle && (
                        <p className="mt-1 text-sm text-secondary-600">{subtitle}</p>
                    )}
                </div>

                {actions && (
                    <div className="flex items-center gap-3">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    )
}

export default PageHeader
