import { useState, useEffect } from 'react'
import Modal from '@components/Modal'
import Input from '@components/Input'
import Select from '@components/Select'
import Button from '@components/Button'
import { manageCountry, manageCity, manageCurrency } from '@api/masters.api'
import SearchableSelect from '@components/SearchableSelect'
import { toast } from 'react-hot-toast'

const OfficeFormModal = ({ isOpen, onClose, onSave, editingData, user }) => {
    const initialFormState = {
        officeName: '',
        address: '',
        countryId: '',
        cityId: '',
        currencyId: '',
        contacts: [
            {
                contactId: 0,
                contactName: '',
                contactNumber: '',
                contactEmail: '',
                spType: 'C'
            }
        ],
        isActive: true
    }

    const [formData, setFormData] = useState(initialFormState)
    const [countries, setCountries] = useState([])
    const [cities, setCities] = useState([])
    const [currencies, setCurrencies] = useState([])

    useEffect(() => {
        if (isOpen) {
            fetchInitialData()
            if (editingData) {
                setFormData({
                    ...editingData,
                    contacts: editingData.contacts && editingData.contacts.length > 0
                        ? editingData.contacts.map(c => ({ ...c, spType: c.contactId ? 'U' : 'C' }))
                        : initialFormState.contacts
                })
                if (editingData.countryId) {
                    fetchCities(editingData.countryId)
                }
            } else {
                setFormData(initialFormState)
            }
        }
    }, [isOpen, editingData])

    const fetchInitialData = async () => {
        try {
            const [countryRes, currencyRes] = await Promise.all([
                manageCountry({ spType: 'R', isDeleted: false }),
                manageCurrency({ spType: 'R', isActive: true })
            ])

            if (countryRes.data?.data) {
                setCountries(countryRes.data.data.map(c => ({ value: c.countryId, label: c.countryName })))
            }

            if (currencyRes.data?.data) {
                setCurrencies(currencyRes.data.data.map(c => ({
                    value: c.id || c.currencyId,
                    label: c.currencyName
                })))
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
                // Backend might return all cities, so apply client-side filter
                const filteredCities = response.data.data.filter(c => c.countryId === parseInt(countryId))
                setCities(filteredCities.map(c => ({ value: c.cityId, label: c.cityName })))
            } else {
                setCities([])
            }
        } catch (error) {
            console.error('Error fetching cities:', error)
            setCities([])
        }
    }

    const handleAddContact = () => {
        setFormData({
            ...formData,
            contacts: [...formData.contacts, { contactId: 0, contactName: '', contactNumber: '', contactEmail: '', spType: 'C' }]
        })
    }

    const handleRemoveContact = (index) => {
        if (formData.contacts.length === 1) return
        const newContacts = formData.contacts.filter((_, i) => i !== index)
        setFormData({ ...formData, contacts: newContacts })
    }

    const handleContactChange = (index, field, value) => {
        const newContacts = [...formData.contacts]
        newContacts[index][field] = value
        setFormData({ ...formData, contacts: newContacts })
    }

    const handleSave = () => {
        if (!formData.officeName || !formData.countryId || !formData.cityId) {
            toast.error('Please fill required fields (Office Name, Country, City)')
            return
        }
        onSave(formData)
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={editingData ? "Edit Office" : "Add Office"} size="md">
            <div className="space-y-6 max-h-[70vh] overflow-y-auto px-1 pr-2">
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-secondary-900 border-b pb-2">Office Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Office Name"
                            value={formData.officeName}
                            onChange={(e) => setFormData({ ...formData, officeName: e.target.value })}
                            placeholder="Enter office name"
                            required
                        />
                        <Select
                            label="Currency"
                            value={formData.currencyId}
                            onChange={(e) => setFormData({ ...formData, currencyId: e.target.value })}
                            options={currencies}
                            placeholder="Select Currency"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <SearchableSelect
                            label="Country"
                            name="countryId"
                            value={formData.countryId}
                            onChange={(e) => {
                                setFormData({ ...formData, countryId: e.target.value, cityId: '' })
                                fetchCities(e.target.value)
                            }}
                            options={countries}
                            placeholder="Search country..."
                            required
                        />
                        <SearchableSelect
                            label="City"
                            name="cityId"
                            value={formData.cityId}
                            onChange={(e) => setFormData({ ...formData, cityId: e.target.value })}
                            options={cities}
                            placeholder={formData.countryId ? 'Search city...' : 'Select country first'}
                            disabled={!formData.countryId}
                            required
                        />
                    </div>
                    <Input
                        label="Address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Enter full address"
                    />
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-2">
                        <h3 className="text-sm font-bold text-secondary-900">Contact Persons</h3>
                        <button
                            type="button"
                            onClick={handleAddContact}
                            className="text-xs text-primary-600 font-semibold hover:text-primary-800"
                        >
                            + Add Contact
                        </button>
                    </div>

                    {formData.contacts.map((contact, index) => (
                        <div key={index} className="p-4 bg-gray-50 rounded-lg relative group border">
                            {formData.contacts.length > 1 && (
                                <button
                                    onClick={() => handleRemoveContact(index)}
                                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold"
                                >
                                    &times;
                                </button>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Input
                                    label="Name"
                                    value={contact.contactName}
                                    onChange={(e) => handleContactChange(index, 'contactName', e.target.value)}
                                    placeholder="Contact Name"
                                />
                                <Input
                                    label="Number"
                                    value={contact.contactNumber}
                                    onChange={(e) => handleContactChange(index, 'contactNumber', e.target.value)}
                                    placeholder="Phone Number"
                                />
                                <Input
                                    label="Email"
                                    value={contact.contactEmail}
                                    onChange={(e) => handleContactChange(index, 'contactEmail', e.target.value)}
                                    placeholder="Email Address"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-secondary-200">
                <Button variant="secondary" onClick={onClose}>Cancel</Button>
                <Button variant="primary" onClick={handleSave}>{editingData ? 'Update' : 'Add'} Office</Button>
            </div>
        </Modal>
    )
}

export default OfficeFormModal
