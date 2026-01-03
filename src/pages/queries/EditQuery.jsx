import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PageHeader from '@components/PageHeader'
import Button from '@components/Button'
import Input from '@components/Input'
import Select from '@components/Select'
import { toast } from 'react-hot-toast'
import { manageQuery } from '@api/query.api'
import { manageClient, manageHandler, manageCountry, manageCity } from '@api/masters.api'

const EditQuery = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const [isLoading, setIsLoading] = useState(false)

    // Master Data States
    const [clients, setClients] = useState([])
    const [handlers, setHandlers] = useState([])
    const [countries, setCountries] = useState([])
    const [cityOptions, setCityOptions] = useState({}) // Cache cities by countryId

    // Form State
    const initialFormState = {
        queryNo: '',
        handlerId: '',
        clientId: '',
        clientName: '',
        originCountryId: '',
        originCityId: '',
        destinations: [],
        travelDate: '',
        returnDate: '',
        totalDays: 0,
        adults: 1,
        children: 0,
        infants: 0,
        childAges: [],
        budget: '',
        queryStatus: 'Pending',
        specialRequirements: ''
    }
    const [formData, setFormData] = useState(initialFormState)

    useEffect(() => {
        const init = async () => {
            await fetchMasters()
            fetchQueryDetails()
        }
        init()
    }, [id])

    useEffect(() => {
        if (formData.travelDate && formData.returnDate) {
            const start = new Date(formData.travelDate)
            const end = new Date(formData.returnDate)
            const diffTime = Math.abs(end - start)
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
            setFormData(prev => ({ ...prev, totalDays: diffDays }))
        }
    }, [formData.travelDate, formData.returnDate])

    // Update childAges array when children count changes
    useEffect(() => {
        const count = parseInt(formData.children) || 0
        setFormData(prev => {
            const currentAges = prev.childAges || []
            if (currentAges.length === count) return prev

            const newAges = Array(count).fill(null).map((_, i) =>
                currentAges[i] || { childAge: 0, spType: 'C' }
            )
            return { ...prev, childAges: newAges }
        })
    }, [formData.children])

    const fetchMasters = async () => {
        try {
            // Fetch Clients
            const clientPayload = {
                id: 0,
                firstName: "string",
                lastName: "string",
                mobileNo: "string",
                companyName: "string",
                emailId: "string",
                isGSTIN: true,
                gstNumber: "string",
                gstCertificate: "string",
                address: "string",
                landmark: "string",
                countryId: 0,
                stateId: 0,
                cityId: 0,
                pincode: "string",
                contacts: [],
                createdBy: 0,
                modifiedBy: 0,
                isActive: true,
                spType: "R"
            }
            const clientRes = await manageClient(clientPayload)
            const clientData = clientRes.data?.data || (Array.isArray(clientRes.data) ? clientRes.data : [])
            if (clientData) {
                // Filter duplicates by id
                const uniqueClients = []
                const clientIds = new Set()
                clientData.forEach(c => {
                    if (!clientIds.has(c.id)) {
                        clientIds.add(c.id)
                        uniqueClients.push({
                            value: c.id,
                            label: `${c.firstName} ${c.lastName} (${c.companyName})`
                        })
                    }
                })
                setClients(uniqueClients)
            }

            // Fetch Handlers
            const handlerPayload = {
                id: 0,
                handlerId: "string",
                handlerName: "string",
                emailId: "string",
                mobileNo: "string",
                roleId: 0,
                createdBy: 0,
                modifiedBy: 0,
                isActive: true,
                spType: "R"
            }
            const handlerRes = await manageHandler(handlerPayload)
            const handlerData = handlerRes.data?.data || handlerRes.data || []
            if (Array.isArray(handlerData)) {
                // Filter duplicates by id
                const uniqueHandlers = []
                const handlerIds = new Set()
                handlerData.forEach(h => {
                    if (!handlerIds.has(h.id)) {
                        handlerIds.add(h.id)
                        uniqueHandlers.push({
                            value: h.id,
                            label: h.handlerName
                        })
                    }
                })
                setHandlers(uniqueHandlers)
            }

            // Fetch Countries
            const countryPayload = {
                countryId: 0,
                countryName: "string",
                isActive: true,
                isDeleted: false,
                spType: "R"
            }
            const countryRes = await manageCountry(countryPayload)
            if (countryRes.data?.data) {
                // Filter duplicates by countryId
                const uniqueCountries = []
                const countryIds = new Set()
                countryRes.data.data.forEach(c => {
                    if (!countryIds.has(c.countryId)) {
                        countryIds.add(c.countryId)
                        uniqueCountries.push({
                            value: c.countryId,
                            label: c.countryName
                        })
                    }
                })
                setCountries(uniqueCountries)
            }
        } catch (error) {
            console.error("Error fetching masters:", error)
            toast.error("Failed to load master data")
        }
    }

    const fetchQueryDetails = async () => {
        setIsLoading(true)
        try {
            const payload = {
                id: parseInt(id),
                queryNo: "string",
                handlerId: 0,
                clientId: 0,
                originCountryId: 0,
                originCityId: 0,
                travelDate: new Date().toISOString(),
                returnDate: new Date().toISOString(),
                totalDays: 0,
                adults: 0,
                children: 0,
                infants: 0,
                budget: 0,
                queryStatus: "string",
                specialRequirements: "string",
                createdBy: 0,
                modifiedBy: 0,
                isActive: true,
                spType: "E",
                destinations: [
                    {
                        mappingId: 0,
                        queryId: 0,
                        countryId: 0,
                        cityId: 0,
                        countryName: "string",
                        cityName: "string",
                        spType: "U"
                    }
                ],
                childAges: [
                    {
                        ageId: 0,
                        queryId: 0,
                        childAge: 0,
                        spType: "string"
                    }
                ]
            }
            const res = await manageQuery(payload)
            const queryDataList = res.data?.data || []
            const queryData = Array.isArray(queryDataList) ? queryDataList[0] : queryDataList

            if (queryData) {
                // Pre-fetch cities for origin country
                if (queryData.originCountryId) {
                    fetchCitiesForCountry(queryData.originCountryId)
                }

                // Pre-fetch cities for destination countries
                if (queryData.destinations) {
                    queryData.destinations.forEach(dest => {
                        if (dest.countryId) fetchCitiesForCountry(dest.countryId)
                    })
                }

                // Map Dates to YYYY-MM-DD using local time to prevent off-by-one errors
                const formatDate = (dateStr) => {
                    if (!dateStr) return ''
                    const date = new Date(dateStr)
                    const year = date.getFullYear()
                    const month = String(date.getMonth() + 1).padStart(2, '0')
                    const day = String(date.getDate()).padStart(2, '0')
                    return `${year}-${month}-${day}`
                }

                setFormData({
                    queryNo: queryData.queryNo || '',
                    handlerId: queryData.handlerId || '',
                    clientId: queryData.clientId || '',
                    clientName: queryData.clientName || '',
                    originCountryId: queryData.originCountryId || '',
                    originCityId: queryData.originCityId || '',
                    destinations: queryData.destinations?.length > 0
                        ? queryData.destinations.map(d => ({
                            ...d,
                            spType: 'U',
                            id: d.id || d.mappingId || 0
                        }))
                        : [{ countryId: '', cityId: '', spType: 'C' }],
                    travelDate: formatDate(queryData.travelDate),
                    returnDate: formatDate(queryData.returnDate),
                    totalDays: queryData.totalDays || 0,
                    adults: queryData.adults || 1,
                    children: queryData.children || 0,
                    infants: queryData.infants || 0,
                    childAges: queryData.childAges?.length > 0
                        ? queryData.childAges.map(c => ({
                            ...c,
                            spType: 'U',
                            id: c.id || c.ageId || 0
                        }))
                        : [],
                    budget: queryData.budget || '',
                    queryStatus: queryData.queryStatus || 'Pending',
                    specialRequirements: queryData.specialRequirements || ''
                })
            }
        } catch (error) {
            console.error("Error fetching query details:", error)
            toast.error("Failed to load query details")
        } finally {
            setIsLoading(false)
        }
    }

    const fetchCitiesForCountry = async (countryId) => {
        if (!countryId || cityOptions[countryId]) return

        try {
            const payload = {
                cityId: 0,
                cityName: "string",
                countryId: parseInt(countryId),
                stateId: 0,
                isActive: true,
                isDeleted: false,
                spType: "R"
            }
            const res = await manageCity(payload)
            if (res.data?.data) {
                // Filter by countryId (client-side safeguard) and then filter duplicates
                const uniqueCities = []
                const cityIds = new Set()
                res.data.data.forEach(c => {
                    const matchesCountry = c.countryId === parseInt(countryId)
                    if (matchesCountry && !cityIds.has(c.cityId)) {
                        cityIds.add(c.cityId)
                        uniqueCities.push({ value: c.cityId, label: c.cityName })
                    }
                })
                setCityOptions(prev => ({
                    ...prev,
                    [countryId]: uniqueCities
                }))
            }
        } catch (error) {
            console.error(`Error fetching cities for country ${countryId}:`, error)
        }
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))

        if (name === 'originCountryId') {
            fetchCitiesForCountry(value)
            setFormData(prev => ({ ...prev, originCountryId: value, originCityId: '' }))
        }
    }

    const handleDestinationChange = (index, field, value) => {
        const newDestinations = [...formData.destinations]
        newDestinations[index][field] = value
        setFormData(prev => ({ ...prev, destinations: newDestinations }))

        if (field === 'countryId') {
            fetchCitiesForCountry(value)
            newDestinations[index].cityId = ''
            setFormData(prev => ({ ...prev, destinations: newDestinations }))
        }
    }

    const addDestination = () => {
        setFormData(prev => ({
            ...prev,
            destinations: [...prev.destinations, { countryId: '', cityId: '', spType: 'C' }]
        }))
    }

    const removeDestination = (index) => {
        if (formData.destinations.length === 1) return
        const destToRemove = formData.destinations[index]

        if (destToRemove.id) {
            // Mark for deletion if it exists on backend
            const newDestinations = [...formData.destinations]
            newDestinations[index] = { ...destToRemove, spType: 'D' }
            setFormData(prev => ({ ...prev, destinations: newDestinations }))
            toast.success("Destination marked for removal")
        } else {
            setFormData(prev => ({
                ...prev,
                destinations: prev.destinations.filter((_, i) => i !== index)
            }))
        }
    }

    const handleChildAgeChange = (index, value) => {
        const newAges = [...formData.childAges]
        newAges[index] = { ...newAges[index], childAge: parseInt(value) || 0 }
        setFormData(prev => ({ ...prev, childAges: newAges }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formData.clientId || !formData.queryNo || !formData.handlerId) {
            toast.error("Please fill required fields")
            return
        }

        setIsLoading(true)
        try {
            const payload = {
                id: parseInt(id),
                queryNo: formData.queryNo,
                handlerId: parseInt(formData.handlerId),
                clientId: parseInt(formData.clientId),
                originCountryId: parseInt(formData.originCountryId) || 0,
                originCityId: parseInt(formData.originCityId) || 0,
                travelDate: formData.travelDate ? new Date(formData.travelDate).toISOString() : null,
                returnDate: formData.returnDate ? new Date(formData.returnDate).toISOString() : null,
                totalDays: parseInt(formData.totalDays) || 0,
                adults: parseInt(formData.adults) || 0,
                children: parseInt(formData.children) || 0,
                infants: parseInt(formData.infants) || 0,
                budget: parseFloat(formData.budget) || 0,
                queryStatus: formData.queryStatus || 'Pending',
                specialRequirements: formData.specialRequirements,
                createdBy: 0,
                modifiedBy: 0,
                isActive: true,
                spType: "U",
                destinations: formData.destinations.map(d => ({
                    id: d.id || 0,
                    mappingId: d.id || 0,
                    queryId: parseInt(id),
                    countryId: parseInt(d.countryId) || 0,
                    cityId: parseInt(d.cityId) || 0,
                    countryName: "",
                    cityName: "",
                    spType: d.spType || "U"
                })),
                childAges: formData.childAges.map(c => ({
                    id: c.id || 0,
                    ageId: c.id || 0,
                    queryId: parseInt(id),
                    childAge: parseInt(c.childAge) || 0,
                    spType: c.spType || "U"
                }))
            }

            const response = await manageQuery(payload)
            if (response.data && (response.data.success || response.status === 200)) {
                toast.success("Query updated successfully!")
                navigate('/queries')
            } else {
                toast.error(response.data?.message || "Failed to update query")
            }
        } catch (error) {
            console.error("Error updating query:", error)
            toast.error("Failed to update query")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div>
            <PageHeader
                title="Edit Query"
                breadcrumbs={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Queries', href: '/queries' },
                    { label: 'Edit' }
                ]}
            />

            <form onSubmit={handleSubmit} className="card max-w-4xl p-0 mt-4">
                <div className='card-header bg-gray-50 p-4 border-b rounded-t-lg'>
                    <div className='flex flex-nowrap gap-4 items-end'>
                        <Input
                            label="Query No"
                            name="queryNo"
                            value={formData.queryNo}
                            onChange={handleInputChange}
                            placeholder="e.g. Q-2025-001"
                            required
                            className="w-48"
                            disabled
                        />
                        <Select
                            label="Handler"
                            name="handlerId"
                            value={formData.handlerId}
                            onChange={handleInputChange}
                            options={handlers}
                            required
                            className="w-48"
                            placeholder="Select Handler"
                        />
                        <Select
                            label="Client"
                            name="clientId"
                            value={formData.clientId}
                            onChange={handleInputChange}
                            options={clients}
                            required
                            className="w-72"
                            placeholder="Select Client"
                        />
                    </div>
                </div>

                <div className='card-body p-6 space-y-6'>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-4 border rounded-lg bg-gray-50">
                            <h4 className="font-semibold mb-3">Origin</h4>
                            <div className="space-y-3">
                                <Select
                                    label="Country"
                                    name="originCountryId"
                                    value={formData.originCountryId}
                                    onChange={handleInputChange}
                                    options={countries}
                                    placeholder="Select Country"
                                />
                                <Select
                                    label="City"
                                    name="originCityId"
                                    value={formData.originCityId}
                                    onChange={handleInputChange}
                                    options={cityOptions[formData.originCountryId] || []}
                                    disabled={!formData.originCountryId}
                                    placeholder="Select City"
                                />
                            </div>
                        </div>

                        <div className="p-4 border rounded-lg bg-gray-50">
                            <div className="flex justify-between items-center mb-3">
                                <h4 className="font-semibold">Destinations</h4>
                                <button type="button" onClick={addDestination} className="text-primary-600 text-sm font-bold">+ Add</button>
                            </div>
                            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                                {formData.destinations.filter(d => d.spType !== 'D').map((dest, index) => (
                                    <div key={index} className="flex gap-2 items-end border-b pb-2">
                                        <div className="flex-1">
                                            <Select
                                                label={index === 0 ? "Country" : ""}
                                                value={dest.countryId}
                                                onChange={(e) => handleDestinationChange(index, "countryId", e.target.value)}
                                                options={countries}
                                                placeholder="Country"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <Select
                                                label={index === 0 ? "City" : ""}
                                                value={dest.cityId}
                                                onChange={(e) => handleDestinationChange(index, "cityId", e.target.value)}
                                                options={cityOptions[dest.countryId] || []}
                                                disabled={!dest.countryId}
                                                placeholder="City"
                                            />
                                        </div>
                                        {formData.destinations.filter(d => d.spType !== 'D').length > 1 && (
                                            <button type="button" onClick={() => removeDestination(index)} className="text-red-500 pb-2">&times;</button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Input
                            label="Travel Date"
                            name="travelDate"
                            type="date"
                            value={formData.travelDate}
                            onChange={handleInputChange}
                            required
                        />
                        <Input
                            label="Return Date"
                            name="returnDate"
                            type="date"
                            value={formData.returnDate}
                            onChange={handleInputChange}
                            required
                        />
                        <div className="flex flex-col justify-end">
                            <label className="text-sm font-bold text-gray-500 mb-1">Total Days</label>
                            <div className="p-2 bg-gray-100 rounded text-center font-bold">{formData.totalDays} Days</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Input
                            label="Adults"
                            name="adults"
                            type="number"
                            min="1"
                            value={formData.adults}
                            onChange={handleInputChange}
                        />
                        <Input
                            label="Children"
                            name="children"
                            type="number"
                            min="0"
                            value={formData.children}
                            onChange={handleInputChange}
                        />
                        <Input
                            label="Infants"
                            name="infants"
                            type="number"
                            min="0"
                            value={formData.infants}
                            onChange={handleInputChange}
                        />
                        <Input
                            label="Budget"
                            name="budget"
                            type="number"
                            value={formData.budget}
                            onChange={handleInputChange}
                            placeholder="Budget"
                        />
                    </div>

                    {formData.children > 0 && (
                        <div className="p-4 bg-blue-50 rounded border border-blue-100">
                            <h5 className="text-sm font-bold text-blue-800 mb-2">Children Ages</h5>
                            <div className="flex flex-wrap gap-4">
                                {formData.childAges.map((ageObj, index) => (
                                    <div key={index} className="w-24">
                                        <label className="text-xs text-gray-600 block mb-1">Child {index + 1}</label>
                                        <Input
                                            type="number"
                                            value={ageObj.childAge}
                                            onChange={(e) => handleChildAgeChange(index, e.target.value)}
                                            className="h-8 text-sm"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div>
                        <Select
                            label="Status"
                            name="queryStatus"
                            value={formData.queryStatus}
                            onChange={handleInputChange}
                            options={[
                                { value: 'Pending', label: 'Pending' },
                                { value: 'Confirmed', label: 'Confirmed' },
                                { value: 'Cancelled', label: 'Cancelled' }
                            ]}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1">
                            Special Requirements
                        </label>
                        <textarea
                            name="specialRequirements"
                            value={formData.specialRequirements}
                            onChange={handleInputChange}
                            rows="4"
                            className="input"
                            placeholder="Any special requirements or notes..."
                        />
                    </div>

                    <div className="flex gap-3 justify-end pt-4 border-t">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => navigate('/queries')}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            loading={isLoading}
                            disabled={isLoading}
                        >
                            Update Query
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default EditQuery
