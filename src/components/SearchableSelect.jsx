import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Search, X } from 'lucide-react'

/**
 * SearchableSelect Component
 * Dropdown with a live search/filter input inside it.
 * Props match the existing Select component for easy drop-in replacement.
 */
const SearchableSelect = ({
    label,
    name,
    value = '',
    onChange,
    options = [],
    placeholder = 'Select an option',
    required = false,
    disabled = false,
    error,
    touched,
    className = '',
    multiSelect = false
}) => {
    const [isOpen, setIsOpen] = useState(false)
    const [search, setSearch] = useState('')
    const containerRef = useRef(null)
    const searchRef = useRef(null)

    const selectedOptions = multiSelect
        ? (Array.isArray(value) ? options.filter(o => value.map(v => String(v)).includes(String(o.value))) : [])
        : (options.find(o => String(o.value) === String(value)) ? [options.find(o => String(o.value) === String(value))] : [])

    const filtered = options.filter(o =>
        o.label?.toLowerCase().includes(search.toLowerCase())
    )

    // Close on outside click
    useEffect(() => {
        const handler = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false)
                setSearch('')
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    // Focus search input when opened
    useEffect(() => {
        if (isOpen && searchRef.current) {
            searchRef.current.focus()
        }
    }, [isOpen])

    const handleSelect = (option) => {
        if (multiSelect) {
            const current = Array.isArray(value) ? [...value] : []
            const idx = current.findIndex(v => String(v) === String(option.value))
            if (idx > -1) {
                current.splice(idx, 1)
            } else {
                current.push(option.value)
            }
            onChange({ target: { name, value: current } })
        } else {
            onChange({ target: { name, value: option.value } })
            setIsOpen(false)
        }
        setSearch('')
    }

    const handleClear = (e) => {
        e.stopPropagation()
        onChange({ target: { name, value: multiSelect ? [] : '' } })
        setSearch('')
    }

    const toggleOpen = () => {
        if (!disabled) setIsOpen(prev => !prev)
    }

    return (
        <div className={`w-full relative ${className}`} ref={containerRef}>
            {label && (
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            {/* Trigger */}
            <button
                type="button"
                onClick={toggleOpen}
                disabled={disabled}
                className={`
                    input w-full flex items-center justify-between gap-2 text-left h-auto min-h-[38px] py-2
                    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    ${error && touched ? 'input-error' : ''}
                    ${isOpen ? 'ring-2 ring-primary-500 border-primary-500' : ''}
                `.trim().replace(/\s+/g, ' ')}
            >
                <span className={selectedOptions && selectedOptions.length > 0 ? 'text-secondary-900' : 'text-secondary-400'}>
                    {selectedOptions && selectedOptions.length > 0
                        ? (multiSelect ? selectedOptions.map(o => o.label).join(', ') : selectedOptions[0].label)
                        : placeholder}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                    {selectedOptions && selectedOptions.length > 0 && !disabled && (
                        <span
                            onClick={handleClear}
                            className="p-0.5 rounded hover:bg-secondary-200 transition-colors text-secondary-400 hover:text-secondary-700"
                        >
                            <X className="w-3.5 h-3.5" />
                        </span>
                    )}
                    <ChevronDown className={`w-4 h-4 text-secondary-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-secondary-200 rounded-lg shadow-lg overflow-hidden">
                    {/* Search box */}
                    <div className="p-2 border-b border-secondary-100 flex items-center gap-2">
                        <Search className="w-4 h-4 text-secondary-400 shrink-0" />
                        <input
                            ref={searchRef}
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search..."
                            className="w-full text-sm outline-none bg-transparent text-secondary-900 placeholder:text-secondary-400"
                        />
                        {search && (
                            <button onClick={() => setSearch('')} className="text-secondary-400 hover:text-secondary-700">
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Options list */}
                    <ul className="max-h-52 overflow-y-auto py-1">
                        {filtered.length === 0 ? (
                            <li className="px-3 py-2 text-sm text-secondary-400 italic">No results found</li>
                        ) : (
                            filtered.map((option, idx) => (
                                <li
                                    key={`${option.value}-${idx}`}
                                    onClick={() => handleSelect(option)}
                                    className={`
                                        px-3 py-2 text-sm cursor-pointer transition-colors
                                        ${multiSelect
                                            ? (Array.isArray(value) && value.map(v => String(v)).includes(String(option.value)) ? 'bg-primary-50 text-primary-700 font-medium' : 'text-secondary-800 hover:bg-secondary-50')
                                            : (String(option.value) === String(value) ? 'bg-primary-50 text-primary-700 font-medium' : 'text-secondary-800 hover:bg-secondary-50')
                                        }
                                    `.trim().replace(/\s+/g, ' ')}
                                >
                                    {option.label}
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            )}

            {error && touched && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
        </div>
    )
}

export default SearchableSelect
