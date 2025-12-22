import { useState, useEffect } from 'react'
import { X, Plus, MapPin } from 'lucide-react'
import Select from './Select'
import Button from './Button'

/**
 * DestinationSelector Component
 * Allows selecting multiple destinations with country->city hierarchy
 */
const DestinationSelector = ({
    label,
    name,
    value = [],
    onChange,
    onBlur,
    error,
    touched,
    required = false,
    className = ''
}) => {
    // Mock data - In production, this should come from API/Redux
    const countries = [
        { value: 'India', label: 'India' },
        { value: 'UAE', label: 'UAE' },
        { value: 'Thailand', label: 'Thailand' },
        { value: 'Singapore', label: 'Singapore' },
        { value: 'Malaysia', label: 'Malaysia' }
    ]

    const citiesByCountry = {
        'India': [
            { value: 'Mumbai', label: 'Mumbai' },
            { value: 'Delhi', label: 'Delhi' },
            { value: 'Bangalore', label: 'Bangalore' },
            { value: 'Goa', label: 'Goa' },
            { value: 'Jaipur', label: 'Jaipur' }
        ],
        'UAE': [
            { value: 'Dubai', label: 'Dubai' },
            { value: 'Abu Dhabi', label: 'Abu Dhabi' },
            { value: 'Sharjah', label: 'Sharjah' }
        ],
        'Thailand': [
            { value: 'Bangkok', label: 'Bangkok' },
            { value: 'Phuket', label: 'Phuket' },
            { value: 'Pattaya', label: 'Pattaya' },
            { value: 'Chiang Mai', label: 'Chiang Mai' }
        ],
        'Singapore': [
            { value: 'Singapore', label: 'Singapore' }
        ],
        'Malaysia': [
            { value: 'Kuala Lumpur', label: 'Kuala Lumpur' },
            { value: 'Penang', label: 'Penang' },
            { value: 'Langkawi', label: 'Langkawi' }
        ]
    }

    const [selectedCountry, setSelectedCountry] = useState('')
    const [selectedCity, setSelectedCity] = useState('')
    const [availableCities, setAvailableCities] = useState([])

    useEffect(() => {
        if (selectedCountry) {
            setAvailableCities(citiesByCountry[selectedCountry] || [])
            setSelectedCity('')
        } else {
            setAvailableCities([])
            setSelectedCity('')
        }
    }, [selectedCountry])

    const handleAddDestination = () => {
        if (!selectedCountry || !selectedCity) return

        const newDestination = {
            country: selectedCountry,
            city: selectedCity,
            id: Date.now()
        }

        // Check if this destination already exists
        const exists = value.some(
            dest => dest.country === selectedCountry && dest.city === selectedCity
        )

        if (!exists) {
            const updatedValue = [...value, newDestination]
            onChange({
                target: {
                    name,
                    value: updatedValue
                }
            })
        }

        // Reset selection
        setSelectedCountry('')
        setSelectedCity('')
    }

    const handleRemoveDestination = (id) => {
        const updatedValue = value.filter(dest => dest.id !== id)
        onChange({
            target: {
                name,
                value: updatedValue
            }
        })
    }

    return (
        <div className={`w-full ${className}`}>
            {label && (
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            {/* Selected Destinations Display */}
            {value.length > 0 && (
                <div className="mb-3 space-y-2">
                    {value.map((dest) => (
                        <div
                            key={dest.id}
                            className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-3 py-2"
                        >
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-blue-600" />
                                <span className="text-sm font-medium text-secondary-800">
                                    {dest.city}, {dest.country}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleRemoveDestination(dest.id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-100 rounded p-1 transition-colors"
                                title="Remove destination"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Destination Form */}
            <div className="border border-secondary-300 rounded-lg p-4 bg-secondary-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <Select
                        label="Country"
                        name="country"
                        value={selectedCountry}
                        onChange={(e) => setSelectedCountry(e.target.value)}
                        options={countries}
                        placeholder="Select Country"
                    />
                    <Select
                        label="City"
                        name="city"
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        options={availableCities}
                        placeholder={selectedCountry ? "Select City" : "Select country first"}
                        disabled={!selectedCountry}
                    />
                </div>
                <Button
                    type="button"
                    variant="secondary"
                    onClick={handleAddDestination}
                    disabled={!selectedCountry || !selectedCity}
                    className="w-full"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Destination
                </Button>
            </div>

            {error && touched && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
        </div>
    )
}

export default DestinationSelector
