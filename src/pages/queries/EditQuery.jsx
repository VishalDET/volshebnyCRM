import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PageHeader from '@components/PageHeader'
import Button from '@components/Button'
import Input from '@components/Input'
import Select from '@components/Select'
import { manageQuery, manageConfirmQuery } from '@api/query.api'
import { manageClient, manageHandler, manageCountry, manageCity, manageSupplier, manageCurrency } from '@api/masters.api'
import Loader from '@components/Loader'
import { Plus, Trash2, Calendar, User, Building, Users, Banknote, FileText, Briefcase } from 'lucide-react'

const EditQuery = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const [isLoading, setIsLoading] = useState(false)

    // Master Data States
    const [clients, setClients] = useState([])
    const [handlers, setHandlers] = useState([])
    const [countries, setCountries] = useState([])
    const [cityOptions, setCityOptions] = useState({}) // Cache cities by countryId
    const [suppliers, setSuppliers] = useState([])
    const [currencies, setCurrencies] = useState([])
    const [suppliersByDest, setSuppliersByDest] = useState({}) // { [destIndex]: [suppliers] }
    const [locationNames, setLocationNames] = useState({}) // map ID to name

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

    // Confirmation States
    const [tourLeads, setTourLeads] = useState([])
    const [servicesByDest, setServicesByDest] = useState({})
    const [guides, setGuides] = useState([])
    const [generalInfo, setGeneralInfo] = useState({
        isVisaIncluded: false,
        finalItinerary: '',
        miscellaneous: ''
    })
    const [isConfirmedDataLoading, setIsConfirmedDataLoading] = useState(false)

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
                // Map countries for locationNames
                const map = {}
                uniqueCountries.forEach(c => map[`country_${c.value}`] = c.label)
                setLocationNames(prev => ({ ...prev, ...map }))
            }

            // Fetch Suppliers
            const sPayload = {
                id: 0,
                fullName: "string",
                companyContactNo: "string",
                companyEmailId: "string",
                companyName: "string",
                gstCertificate: "string",
                isGSTIN: true,
                gstNumber: "string",
                address: "string",
                countryId: 0,
                stateId: 0,
                cityId: 0,
                createdBy: 0,
                modifiedBy: 0,
                isActive: true,
                spType: "R"
            }
            const sRes = await manageSupplier(sPayload)
            const sData = sRes.data?.data || (Array.isArray(sRes.data) ? sRes.data : []) || []
            const uniqueSuppliers = []
            const sIds = new Set()
            sData.forEach(s => {
                if (!sIds.has(s.id)) {
                    sIds.add(s.id)
                    uniqueSuppliers.push({
                        value: s.id,
                        label: s.companyName || s.supplierName || s.fullName || 'Unknown Supplier',
                        countryId: s.countryId,
                        cityId: s.cityId
                    })
                }
            })
            setSuppliers(uniqueSuppliers)

            // Fetch Currencies
            const currPayload = {
                id: 0,
                currencyName: "string",
                currencySign: "string",
                isActive: true,
                isDeleted: false,
                spType: "R"
            }
            const currRes = await manageCurrency(currPayload)
            const currData = currRes.data?.data || (Array.isArray(currRes.data) ? currRes.data : []) || []
            const uniqueCurrencies = []
            const currIds = new Set()
            currData.forEach(c => {
                if (!currIds.has(c.id)) {
                    currIds.add(c.id)
                    uniqueCurrencies.push({
                        value: String(c.id),
                        label: `${c.currencyName} (${c.currencySign})`
                    })
                }
            })
            setCurrencies(uniqueCurrencies)
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
                // Seed locationNames from queryData names if available
                const initialNames = {}
                if (queryData.originCountryName) initialNames[`country_${queryData.originCountryId}`] = queryData.originCountryName
                if (queryData.originCityName) initialNames[`city_${queryData.originCityId}`] = queryData.originCityName

                if (queryData.destinations) {
                    queryData.destinations.forEach(d => {
                        if (d.countryName) initialNames[`country_${d.countryId}`] = d.countryName
                        if (d.cityName) initialNames[`city_${d.cityId}`] = d.cityName
                    })
                }
                setLocationNames(prev => ({ ...prev, ...initialNames }))

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

                // If confirmed, fetch confirmation details
                if (queryData.queryStatus?.toLowerCase() === 'confirmed') {
                    fetchConfirmDetails(queryData.id, queryData.destinations)
                }
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
                const uniqueCities = []
                const cityIds = new Set()
                const map = {}
                res.data.data.forEach(c => {
                    if (c.countryId === parseInt(countryId) && !cityIds.has(c.cityId)) {
                        cityIds.add(c.cityId)
                        uniqueCities.push({ value: c.cityId, label: c.cityName })
                        map[`city_${c.cityId}`] = c.cityName
                    }
                })
                setLocationNames(prev => ({ ...prev, ...map }))
                setCityOptions(prev => ({ ...prev, [countryId]: uniqueCities }))
            }
        } catch (error) {
            console.error(`Error fetching cities for country ${countryId}:`, error)
        }
    }

    const fetchConfirmDetails = async (queryId, destinations = []) => {
        setIsConfirmedDataLoading(true)
        try {
            const payload = {
                queryId: parseInt(queryId),
                isVisaIncluded: true,
                finalItinerary: "string",
                miscellaneous: "string",
                spType: "R", // Read
                tourLeads: [],
                services: [],
                guides: []
            }
            const res = await manageConfirmQuery(payload)
            const rawData = res.data?.data
            const confirmedData = Array.isArray(rawData) ? rawData[0] : rawData

            if (confirmedData) {
                setTourLeads(confirmedData.tourLeads?.length > 0 ? confirmedData.tourLeads : [{ leadName: '', gender: '', age: '', visaStatus: '' }])
                setGuides(confirmedData.guides?.length > 0 ? confirmedData.guides : [{ supplierId: '', supplierName: '', guideName: '', gender: '', contactNumber: '', language: '' }])
                setGeneralInfo({
                    isVisaIncluded: confirmedData.isVisaIncluded || false,
                    finalItinerary: confirmedData.finalItinerary || '',
                    miscellaneous: ''
                })

                // Group services by destination index
                if (destinations.length > 0 && confirmedData.services) {
                    const grouped = {}
                    destinations.forEach((dest, dIdx) => {
                        const destServices = confirmedData.services.filter(srv =>
                            srv.countryId === dest.countryId &&
                            srv.cityId === dest.cityId
                        ).map(srv => ({
                            ...srv,
                            serviceDate: srv.serviceDate ? srv.serviceDate.split('T')[0] : '',
                            checkInDate: srv.checkInDate ? srv.checkInDate.split('T')[0] : '',
                            checkOutDate: srv.checkOutDate ? srv.checkOutDate.split('T')[0] : ''
                        }))
                        grouped[dIdx] = destServices
                        // Also fetch suppliers for each destination for the selects
                        fetchSuppliersForDestination(dest.countryId, dest.cityId, dIdx)
                    })
                    setServicesByDest(grouped)
                }
            } else {
                setTourLeads([{ leadName: '', gender: '', age: '', visaStatus: '' }])
                setGuides([{ supplierId: '', supplierName: '', guideName: '', gender: '', contactNumber: '', language: '' }])
            }
        } catch (error) {
            console.error("Error fetching confirmation details:", error)
            toast.error("Failed to load confirmation details")
        } finally {
            setIsConfirmedDataLoading(false)
        }
    }

    const fetchSuppliersForDestination = async (countryId, cityId, destIndex) => {
        try {
            const payload = {
                id: 0,
                fullName: "string",
                companyContactNo: "string",
                companyEmailId: "string",
                companyName: "string",
                gstCertificate: "string",
                isGSTIN: true,
                gstNumber: "string",
                address: "string",
                countryId: countryId || 0,
                stateId: 0,
                cityId: cityId || 0,
                createdBy: 0,
                modifiedBy: 0,
                isActive: true,
                spType: "R"
            }
            const res = await manageSupplier(payload)
            const data = res.data?.data || (Array.isArray(res.data) ? res.data : []) || []

            const uniqueSuppliers = []
            const sIds = new Set()
            data.forEach(s => {
                const matchesCountry = !countryId || s.countryId === countryId
                const matchesCity = !cityId || s.cityId === cityId

                if (matchesCountry && matchesCity && !sIds.has(s.id)) {
                    sIds.add(s.id)
                    uniqueSuppliers.push({
                        value: s.id,
                        label: s.companyName || s.supplierName || s.fullName || 'Unknown Supplier'
                    })
                }
            })
            setSuppliersByDest(prev => ({ ...prev, [destIndex]: uniqueSuppliers }))
        } catch (error) {
            console.error('Error fetching suppliers for destination:', error)
        }
    }

    // --- Tour Leads Handlers ---
    const addTourLead = () => setTourLeads([...tourLeads, { leadName: '', gender: '', age: '', visaStatus: '' }])
    const removeTourLead = (index) => tourLeads.length > 1 && setTourLeads(tourLeads.filter((_, i) => i !== index))
    const updateTourLead = (index, field, value) => {
        const updated = [...tourLeads]
        updated[index][field] = value
        setTourLeads(updated)
    }

    // --- Services Handlers ---
    const addService = (destIndex) => {
        setServicesByDest(prev => ({
            ...prev,
            [destIndex]: [
                ...(prev[destIndex] || []),
                {
                    serviceType: 'Transportation',
                    supplierId: '',
                    serviceCharge: '',
                    currencyId: '',
                    description: '',
                    serviceDate: '',
                    pickupLocation: '', dropLocation: '',
                    checkInDate: '', checkOutDate: '',
                    mealType: ''
                }
            ]
        }))
    }
    const removeService = (destIndex, sIndex) => {
        setServicesByDest(prev => ({
            ...prev,
            [destIndex]: prev[destIndex].filter((_, i) => i !== sIndex)
        }))
    }
    const updateService = (destIndex, sIndex, field, value) => {
        setServicesByDest(prev => {
            const destServices = [...(prev[destIndex] || [])]
            destServices[sIndex] = { ...destServices[sIndex], [field]: value }
            return { ...prev, [destIndex]: destServices }
        })
    }

    // --- Guides Handlers ---
    const addGuide = () => setGuides([...guides, { supplierId: '', supplierName: '', guideName: '', gender: '', contactNumber: '', language: '' }])
    const removeGuide = (index) => guides.length > 1 && setGuides(guides.filter((_, i) => i !== index))
    const updateGuide = (index, field, value) => {
        const updated = [...guides]
        updated[index][field] = value
        if (field === 'supplierId') {
            const sup = suppliers.find(s => s.value == value)
            updated[index].supplierName = sup ? sup.label : ''
        }
        setGuides(updated)
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
                // If confirmed, also update confirmation details
                if (formData.queryStatus?.toLowerCase() === 'confirmed') {
                    const flatServices = []
                    formData.destinations.forEach((dest, dIdx) => {
                        const destServices = servicesByDest[dIdx] || []
                        destServices.forEach(srv => {
                            flatServices.push({
                                countryId: parseInt(dest.countryId),
                                cityId: parseInt(dest.cityId),
                                serviceType: srv.serviceType,
                                serviceCharge: parseFloat(srv.serviceCharge) || 0,
                                currencyId: parseInt(srv.currencyId) || 0,
                                supplierId: parseInt(srv.supplierId) || 0,
                                supplierName: srv.supplierName || "",
                                description: srv.description || "",
                                serviceDate: srv.serviceDate ? new Date(srv.serviceDate).toISOString() : null,
                                checkInDate: srv.checkInDate ? new Date(srv.checkInDate).toISOString() : null,
                                checkOutDate: srv.checkOutDate ? new Date(srv.checkOutDate).toISOString() : null,
                                pickupLocation: srv.pickupLocation || "",
                                dropLocation: srv.dropLocation || "",
                                mealType: srv.mealType || ""
                            })
                        })
                    })

                    const confirmPayload = {
                        queryId: parseInt(id),
                        isVisaIncluded: generalInfo.isVisaIncluded,
                        finalItinerary: generalInfo.finalItinerary || "",
                        spType: "U", // Update
                        tourLeads: tourLeads.map(tl => ({
                            leadName: tl.leadName || "",
                            gender: tl.gender || "",
                            age: parseInt(tl.age) || 0,
                            visaStatus: tl.visaStatus || ""
                        })),
                        services: flatServices,
                        guides: guides.map(g => ({
                            supplierId: parseInt(g.supplierId) || 0,
                            supplierName: g.supplierName || "",
                            guideName: g.guideName || "",
                            gender: g.gender || "",
                            contactNumber: g.contactNumber || "",
                            language: g.language || ""
                        }))
                    }

                    const confirmRes = await manageConfirmQuery(confirmPayload)
                    if (!confirmRes.data?.success && confirmRes.status !== 200) {
                        toast.error("Query basic info updated, but confirmation details failed.")
                        // We still consider it a partial success, or we could rollback? 
                        // Backend might not support rollback easily.
                    }
                }

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
                <div className='card-header bg-gray-50 p-4 border rounded-t-lg'>
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

                    {formData.queryStatus === 'Confirmed' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {/* Tour Leads Section */}
                            <div className="border-t pt-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold flex items-center gap-2">
                                        <Users className="w-5 h-5 text-blue-600" />
                                        Tour Leads
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={addTourLead}
                                        className="btn btn-secondary btn-sm flex items-center gap-1"
                                    >
                                        <Plus className="w-4 h-4" /> Add Lead
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {tourLeads.map((lead, index) => (
                                        <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg bg-gray-50 relative group">
                                            <Input
                                                label="Lead Name"
                                                value={lead.leadName}
                                                onChange={(e) => updateTourLead(index, 'leadName', e.target.value)}
                                                placeholder="Enter Name"
                                            />
                                            <Select
                                                label="Gender"
                                                value={lead.gender}
                                                onChange={(e) => updateTourLead(index, 'gender', e.target.value)}
                                                options={[{ value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }, { value: 'Other', label: 'Other' }]}
                                            />
                                            <Input
                                                label="Age"
                                                type="number"
                                                value={lead.age}
                                                onChange={(e) => updateTourLead(index, 'age', e.target.value)}
                                                placeholder="Age"
                                            />
                                            <Select
                                                label="Visa Status"
                                                value={lead.visaStatus}
                                                onChange={(e) => updateTourLead(index, 'visaStatus', e.target.value)}
                                                options={[
                                                    { value: 'Applied', label: 'Applied' },
                                                    { value: 'Approved', label: 'Approved' },
                                                    { value: 'Pending', label: 'Pending' },
                                                    { value: 'Not Required', label: 'Not Required' }
                                                ]}
                                            />
                                            <div className="flex items-end justify-center pb-2">
                                                {tourLeads.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeTourLead(index)}
                                                        className="text-red-500 hover:text-red-700 p-2"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Services Section */}
                            <div className="border-t pt-6">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-blue-600" />
                                    Destination-wise Services
                                </h3>
                                <div className="space-y-6">
                                    {formData.destinations.filter(d => d.spType !== 'D').map((dest, dIdx) => (
                                        <div key={dIdx} className="border rounded-lg overflow-hidden">
                                            <div className="bg-blue-600 text-white p-3 flex justify-between items-center">
                                                <span className="font-bold flex items-center gap-2">
                                                    {locationNames[`country_${dest.countryId}`] || dest.countryName || 'Loading...'} - {locationNames[`city_${dest.cityId}`] || dest.cityName || 'Loading...'}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => addService(dIdx)}
                                                    className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                                                >
                                                    <Plus className="w-4 h-4" /> Add Service
                                                </button>
                                            </div>
                                            <div className="p-4 space-y-4 bg-white">
                                                {(servicesByDest[dIdx] || []).length === 0 ? (
                                                    <p className="text-gray-500 text-center py-4 text-sm italic">No services added for this destination.</p>
                                                ) : (
                                                    (servicesByDest[dIdx] || []).map((service, sIdx) => (
                                                        <div key={sIdx} className="border rounded p-4 bg-gray-50">
                                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                                                <Select
                                                                    label="Service Type"
                                                                    value={service.serviceType}
                                                                    onChange={(e) => updateService(dIdx, sIdx, 'serviceType', e.target.value)}
                                                                    options={[
                                                                        { value: 'Transportation', label: 'Transportation' },
                                                                        { value: 'Hotel', label: 'Hotel' },
                                                                        { value: 'Meal', label: 'Meal' },
                                                                        { value: 'Sightseeing', label: 'Sightseeing' },
                                                                        { value: 'Others', label: 'Others' }
                                                                    ]}
                                                                />
                                                                <Select
                                                                    label="Supplier"
                                                                    value={service.supplierId}
                                                                    onChange={(e) => updateService(dIdx, sIdx, 'supplierId', e.target.value)}
                                                                    options={suppliersByDest[dIdx] || []}
                                                                />
                                                                <Input
                                                                    label="Charge"
                                                                    type="number"
                                                                    value={service.serviceCharge}
                                                                    onChange={(e) => updateService(dIdx, sIdx, 'serviceCharge', e.target.value)}
                                                                />
                                                                <Select
                                                                    label="Currency"
                                                                    value={service.currencyId}
                                                                    onChange={(e) => updateService(dIdx, sIdx, 'currencyId', e.target.value)}
                                                                    options={currencies}
                                                                />
                                                            </div>

                                                            {/* Dynamic Fields based on Service Type */}
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                {service.serviceType === 'Hotel' ? (
                                                                    <>
                                                                        <Input label="Check In" type="date" value={service.checkInDate} onChange={(e) => updateService(dIdx, sIdx, 'checkInDate', e.target.value)} />
                                                                        <Input label="Check Out" type="date" value={service.checkOutDate} onChange={(e) => updateService(dIdx, sIdx, 'checkOutDate', e.target.value)} />
                                                                    </>
                                                                ) : service.serviceType === 'Meal' ? (
                                                                    <>
                                                                        <Input label="Date" type="date" value={service.serviceDate} onChange={(e) => updateService(dIdx, sIdx, 'serviceDate', e.target.value)} />
                                                                        <Select
                                                                            label="Meal Type"
                                                                            value={service.mealType}
                                                                            onChange={(e) => updateService(dIdx, sIdx, 'mealType', e.target.value)}
                                                                            options={[{ value: 'BF', label: 'Breakfast' }, { value: 'LN', label: 'Lunch' }, { value: 'DN', label: 'Dinner' }]}
                                                                        />
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Input label="Date" type="date" value={service.serviceDate} onChange={(e) => updateService(dIdx, sIdx, 'serviceDate', e.target.value)} />
                                                                        <Input label="Details" value={service.description} onChange={(e) => updateService(dIdx, sIdx, 'description', e.target.value)} placeholder="Route, Pickup etc." />
                                                                    </>
                                                                )}
                                                            </div>
                                                            <div className="flex justify-end mt-2">
                                                                <button type="button" onClick={() => removeService(dIdx, sIdx)} className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1">
                                                                    <Trash2 className="w-4 h-4" /> Remove Service
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Guides Section */}
                            <div className="border-t pt-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold flex items-center gap-2">
                                        <User className="w-5 h-5 text-blue-600" />
                                        Guides Details
                                    </h3>
                                    <button type="button" onClick={addGuide} className="btn btn-secondary btn-sm flex items-center gap-1">
                                        <Plus className="w-4 h-4" /> Add Guide
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {guides.map((guide, index) => (
                                        <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border rounded-lg bg-gray-50 relative group">
                                            <div className="md:col-span-2">
                                                <Select
                                                    label="Agent/Supplier"
                                                    value={guide.supplierId}
                                                    onChange={(e) => updateGuide(index, 'supplierId', e.target.value)}
                                                    options={suppliers}
                                                />
                                            </div>
                                            <Input label="Guide Name" value={guide.guideName} onChange={(e) => updateGuide(index, 'guideName', e.target.value)} />
                                            <Select
                                                label="Gender"
                                                value={guide.gender}
                                                onChange={(e) => updateGuide(index, 'gender', e.target.value)}
                                                options={[{ value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }]}
                                            />
                                            <Input label="Contact" value={guide.contactNumber} onChange={(e) => updateGuide(index, 'contactNumber', e.target.value)} />
                                            <div className="flex items-end justify-center pb-2">
                                                {guides.length > 1 && (
                                                    <button type="button" onClick={() => removeGuide(index)} className="text-red-500 hover:text-red-700 p-2">
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Final Details */}
                            <div className="border-t pt-6 bg-blue-50/50 p-6 rounded-lg border">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-blue-800">
                                    <FileText className="w-5 h-5" />
                                    Post-Confirmation Details
                                </h3>
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4 p-3 bg-white border rounded shadow-sm">
                                        <label className="flex items-center gap-2 cursor-pointer font-medium">
                                            <input
                                                type="checkbox"
                                                checked={generalInfo.isVisaIncluded}
                                                onChange={(e) => setGeneralInfo({ ...generalInfo, isVisaIncluded: e.target.checked })}
                                                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            Visa Assistance Included?
                                        </label>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Final Itinerary Link/Note</label>
                                            <textarea
                                                className="input w-full min-h-[100px]"
                                                value={generalInfo.finalItinerary}
                                                onChange={(e) => setGeneralInfo({ ...generalInfo, finalItinerary: e.target.value })}
                                                placeholder="Link to PDF or summary of itinerary..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Miscellaneous Info</label>
                                            <textarea
                                                className="input w-full min-h-[100px]"
                                                value={generalInfo.miscellaneous}
                                                onChange={(e) => setGeneralInfo({ ...generalInfo, miscellaneous: e.target.value })}
                                                placeholder="Any extra notes for operational teams..."
                                            />
                                        </div>
                                    </div>
                                </div>
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
