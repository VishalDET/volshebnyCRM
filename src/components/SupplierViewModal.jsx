import Modal from '@components/Modal'
import Button from '@components/Button'

const SupplierViewModal = ({ isOpen, onClose, supplier, countries, serviceTypes }) => {
    if (!supplier) return null

    const getCountryName = (countryId) => {
        const country = countries.find(c => c.value === countryId)
        return country ? country.label : 'N/A'
    }

    const getServiceNames = (serviceIds) => {
        if (!serviceIds || serviceIds.length === 0) return 'None'
        return serviceIds
            .map(id => {
                const service = serviceTypes.find(s => s.value === id)
                return service ? service.label : null
            })
            .filter(Boolean)
            .join(', ')
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="View Supplier Details">
            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                {/* Company Information */}
                <div className="border-b pb-4">
                    <h3 className="text-lg font-semibold text-secondary-800 mb-3">Company Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-secondary-600 mb-1">Company Name</label>
                            <p className="text-secondary-900">{supplier.companyName || 'N/A'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-600 mb-1">Contact Person</label>
                            <p className="text-secondary-900">{supplier.fullName || 'N/A'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-600 mb-1">Company Contact</label>
                            <p className="text-secondary-900">{supplier.companyContactNo || 'N/A'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-600 mb-1">Company Email</label>
                            <p className="text-secondary-900">{supplier.companyEmailId || 'N/A'}</p>
                        </div>
                    </div>
                </div>

                {/* Location Information */}
                <div className="border-b pb-4">
                    <h3 className="text-lg font-semibold text-secondary-800 mb-3">Location</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-secondary-600 mb-1">Country</label>
                            <p className="text-secondary-900">{getCountryName(supplier.countryId)}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-600 mb-1">City ID</label>
                            <p className="text-secondary-900">{supplier.cityId || 'N/A'}</p>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-secondary-600 mb-1">Address</label>
                            <p className="text-secondary-900">{supplier.address || 'N/A'}</p>
                        </div>
                    </div>
                </div>

                {/* GST Information */}
                {supplier.isGSTIN && (
                    <div className="border-b pb-4">
                        <h3 className="text-lg font-semibold text-secondary-800 mb-3">GST Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-secondary-600 mb-1">GST Number</label>
                                <p className="text-secondary-900">{supplier.gstNumber || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-secondary-600 mb-1">GST Certificate</label>
                                <p className="text-secondary-900">{supplier.gstCertificate || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Contacts */}
                {supplier.contacts && supplier.contacts.length > 0 && (
                    <div className="border-b pb-4">
                        <h3 className="text-lg font-semibold text-secondary-800 mb-3">Additional Contacts</h3>
                        <div className="space-y-3">
                            {supplier.contacts.map((contact, index) => (
                                <div key={index} className="p-3 bg-gray-50 rounded-lg border">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-secondary-600 mb-1">Name</label>
                                            <p className="text-sm text-secondary-900">{contact.contactName || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-secondary-600 mb-1">Number</label>
                                            <p className="text-sm text-secondary-900">{contact.contactNumber || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-secondary-600 mb-1">Email</label>
                                            <p className="text-sm text-secondary-900">{contact.contactEmail || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-secondary-600 mb-1">Type</label>
                                            <p className="text-sm text-secondary-900">{contact.spType || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Services */}
                <div>
                    <h3 className="text-lg font-semibold text-secondary-800 mb-3">Services Provided</h3>
                    <div className="p-3 bg-gray-50 rounded-lg border">
                        <p className="text-secondary-900">{getServiceNames(supplier.serviceIds)}</p>
                    </div>
                </div>
            </div>

            <div className="flex justify-end mt-6 pt-4 border-t">
                <Button variant="secondary" onClick={onClose}>Close</Button>
            </div>
        </Modal>
    )
}

export default SupplierViewModal
