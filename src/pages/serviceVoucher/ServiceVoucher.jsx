import PageHeader from '@components/PageHeader'
import Button from '@components/Button'

const ServiceVoucher = () => {
    return (
        <div>
            <PageHeader
                title="Service Vouchers"
                subtitle="Manage service vouchers"
                breadcrumbs={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Service Vouchers' }
                ]}
                actions={<Button variant="primary">+ Create Voucher</Button>}
            />
            <div className="card">
                <p className="text-secondary-600">Service voucher management coming soon...</p>
            </div>
        </div>
    )
}

export default ServiceVoucher
