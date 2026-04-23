import { useState, useEffect } from 'react'
import Modal from '@components/Modal'
import Button from '@components/Button'
import { manageCountry, manageCity, manageCurrency } from '@api/masters.api'

const OfficeViewModal = ({ isOpen, onClose, office }) => {
    const [countries, setCountries] = useState([])
    const [cities, setCities] = useState([])
    const [currencies, setCurrencies] = useState([])

    useEffect(() => {
        if (isOpen && office) {
            fetchInitialData()
            if (office.countryId) {
                fetchCities(office.countryId)
            }
        }
    }, [isOpen, office])

    const fetchInitialData = async () => {
        try {
            const [countryRes, currencyRes] = await Promise.all([
                manageCountry({ spType: 'R', isDeleted: false }),
                manageCurrency({ spType: 'R', isActive: true })
            ])

            if (countryRes.data?.data) {
                setCountries(countryRes.data.data)
            }

            if (currencyRes.data?.data) {
                setCurrencies(currencyRes.data.data)
            }
        } catch (error) {
            console.error('Error fetching initial data:', error)
        }
    }

    const fetchCities = async (countryId) => {
        if (!countryId) return
        try {
            const response = await manageCity({ spType: 'R', countryId: parseInt(countryId), isActive: true })
            if (response.data?.data) {
                setCities(response.data.data)
            } else {
                setCities([])
            }
        } catch (error) {
            console.error('Error fetching cities:', error)
            setCities([])
        }
    }

    const getCountryName = (id) => {
        const item = countries.find(c => c.countryId === id)
        return item ? item.countryName : 'N/A'
    }

    const getCityName = (id) => {
        const item = cities.find(c => c.cityId === id)
        return item ? item.cityName : 'N/A'
    }

    const getCurrencyName = (id) => {
        const item = currencies.find(c => (c.id || c.currencyId) === id)
        return item ? item.currencyName : 'N/A'
    }

    if (!office) return null

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="View Office Details" size="lg">
            <div className="space-y-6 max-h-[70vh] overflow-y-auto px-1 pr-2">
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-secondary-900 border-b pb-2">Office Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-secondary-600 mb-1">Office Name</label>
                            <p className="text-sm text-secondary-900 font-medium">{office.officeName || 'N/A'}</p>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-secondary-600 mb-1">Currency</label>
                            <p className="text-sm text-secondary-900">{getCurrencyName(office.currencyId)}</p>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-secondary-600 mb-1">Country</label>
                            <p className="text-sm text-secondary-900">{getCountryName(office.countryId)}</p>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-secondary-600 mb-1">City</label>
                            <p className="text-sm text-secondary-900">{getCityName(office.cityId)}</p>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs font-medium text-secondary-600 mb-1">Address</label>
                            <p className="text-sm text-secondary-900">{office.address || 'N/A'}</p>
                        </div>
                    </div>
                </div>

                {office.contacts && office.contacts.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-secondary-900 border-b pb-2">Contact Persons</h3>
                        <div className="space-y-3">
                            {office.contacts.map((contact, index) => (
                                <div key={index} className="p-3 bg-gray-50 rounded-lg border">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="flex justify-end mt-6 pt-4 border-t border-secondary-200">
                <Button variant="secondary" onClick={onClose}>Close</Button>
            </div>
        </Modal>
    )
}

export default OfficeViewModal
