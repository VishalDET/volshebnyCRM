import { Link } from 'react-router-dom'
import PageHeader from '@components/PageHeader'
import {
    Flag, MapPin, Banknote, CreditCard,
    Bus, Building2, Users, UserCog
} from 'lucide-react'

const MastersDashboard = () => {
    const masterModules = [
        {
            title: 'Country Master',
            description: 'Manage countries',
            icon: Flag,
            path: '/masters/countries',
            color: 'bg-blue-100 text-blue-600'
        },
        {
            title: 'Destination Master',
            description: 'Manage destinations, cities, and places',
            icon: MapPin,
            path: '/masters/destinations',
            color: 'bg-green-100 text-green-600'
        },
        {
            title: 'Currency Master',
            description: 'Manage currencies and symbols',
            icon: Banknote,
            path: '/masters/currencies',
            color: 'bg-yellow-100 text-yellow-600'
        },
        {
            title: 'Credit Cards',
            description: 'Manage bank names for credit cards',
            icon: CreditCard,
            path: '/masters/credit-cards',
            color: 'bg-purple-100 text-purple-600'
        },
        {
            title: 'Service Types',
            description: 'Manage types of services (Hotel, Bus, etc.)',
            icon: Bus,
            path: '/masters/service-types',
            color: 'bg-pink-100 text-pink-600'
        },
        {
            title: 'Supplier Master',
            description: 'Manage suppliers and their services',
            icon: Building2,
            path: '/masters/suppliers',
            color: 'bg-indigo-100 text-indigo-600'
        },
        {
            title: 'Client Master',
            description: 'Manage clients and contact details',
            icon: Users,
            path: '/masters/clients',
            color: 'bg-orange-100 text-orange-600'
        },
        {
            title: 'Handler Master',
            description: 'Manage handlers (Emp ID, Email)',
            icon: Users,
            path: '/masters/handlers',
            color: 'bg-teal-100 text-teal-600'
        },
        {
            title: 'User Management',
            description: 'Manage system users and roles',
            icon: UserCog,
            path: '/masters/users',
            color: 'bg-red-100 text-red-600'
        }
    ]

    return (
        <div>
            <PageHeader
                title="Master Data Management"
                subtitle="Configure system-wide master data"
                breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Masters' }]}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 card hover:shadow-md transition-shadow rounded-2xl">
                {masterModules.map((module, index) => {
                    const Icon = module.icon
                    return (
                        <Link
                            key={index}
                            to={module.path}
                            className="transition-shadow cursor-pointer group"
                        >
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-lg ${module.color} group-hover:scale-110 transition-transform`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg text-secondary-900 mb-1">
                                        {module.title}
                                    </h3>
                                    <p className="text-sm text-secondary-500">
                                        {module.description}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}

export default MastersDashboard
