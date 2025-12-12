import { useLocation, Link } from 'react-router-dom'

const MastersNavigation = () => {
    const location = useLocation()

    const tabs = [
        { name: 'Countries', path: '/masters/countries' },
        { name: 'Destinations', path: '/masters/destinations' },
        { name: 'Currencies', path: '/masters/currencies' },
        { name: 'Credit Cards', path: '/masters/credit-cards' },
        { name: 'Service Types', path: '/masters/service-types' },
        { name: 'Suppliers', path: '/masters/suppliers' },
        { name: 'Clients', path: '/masters/clients' },
        { name: 'Handlers', path: '/masters/handlers' },
    ]

    return (
        <div className="mb-6 overflow-x-auto">
            <nav className="flex space-x-2 border-b border-secondary-200 pb-1 w-max">
                {tabs.map((tab) => {
                    const isActive = location.pathname === tab.path
                    return (
                        <Link
                            key={tab.path}
                            to={tab.path}
                            className={`
                                px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap
                                ${isActive
                                    ? 'bg-primary-50 text-primary-700 border-b-2 border-primary-600'
                                    : 'text-secondary-600 hover:text-primary-600 hover:bg-secondary-50'}
                            `}
                        >
                            {tab.name}
                        </Link>
                    )
                })}
            </nav>
        </div>
    )
}

export default MastersNavigation
