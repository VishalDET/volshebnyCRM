import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@hooks/useAuth'
import Button from '@components/Button'
import Input from '@components/Input'
import { Rocket } from 'lucide-react'

/**
 * Login Page
 */
const Login = () => {
    const navigate = useNavigate()
    const { login } = useAuth()
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    })
    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    const validate = () => {
        const newErrors = {}
        if (!formData.email) {
            newErrors.email = 'Email is required'
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid'
        }
        if (!formData.password) {
            newErrors.password = 'Password is required'
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters'
        }
        return newErrors
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const validationErrors = validate()
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors)
            return
        }

        setLoading(true)
        const result = await login(formData)
        setLoading(false)

        if (result.success) {
            navigate('/dashboard')
        } else {
            let errorMessage = result.error || 'Login failed. Please try again.'

            // Map Firebase error codes to user-friendly messages
            if (errorMessage.includes('auth/invalid-credential') || errorMessage.includes('auth/user-not-found') || errorMessage.includes('auth/wrong-password')) {
                errorMessage = 'Invalid email or password.'
            } else if (errorMessage.includes('auth/too-many-requests')) {
                errorMessage = 'Too many failed login attempts. Please try again later.'
            } else if (errorMessage.includes('auth/network-request-failed')) {
                errorMessage = 'Network error. Please check your connection.'
            }

            setErrors({ general: errorMessage })
        }
    }

    const handleBypass = () => {
        // Set mock user data for demo purposes
        const mockUser = {
            id: 1,
            name: 'Demo User',
            email: 'demo@volshebnyCRM.com',
            role: 'admin'
        }
        const mockToken = 'demo-token-12345'

        localStorage.setItem('authToken', mockToken)
        localStorage.setItem('user', JSON.stringify(mockUser))

        // Navigate to dashboard
        navigate('/dashboard')
        window.location.reload() // Reload to update auth state
    }

    return (
        <div>
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-secondary-900">
                    Welcome Back
                </h2>
                <p className="text-secondary-600 mt-2">
                    Sign in to your account to continue
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {errors.general && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {errors.general}
                    </div>
                )}

                <Input
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                    touched={true}
                    placeholder="you@example.com"
                    required
                    icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                        </svg>
                    }
                />

                <Input
                    label="Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    error={errors.password}
                    touched={true}
                    placeholder="••••••••"
                    required
                    icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    }
                />

                <div className="flex items-center justify-between">
                    <label className="flex items-center">
                        <input type="checkbox" className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500" />
                        <span className="ml-2 text-sm text-secondary-600">Remember me</span>
                    </label>
                    <a href="#" className="text-sm text-primary-600 hover:text-primary-700">
                        Forgot password?
                    </a>
                </div>

                <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                    loading={loading}
                    disabled={loading}
                >
                    Sign In
                </Button>

                {/* <div className="mt-4 text-center">
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full flex items-center justify-center gap-2"
                        onClick={handleBypass}
                    >
                        <Rocket className="w-4 h-4" />
                        <span>Bypass Login (Demo)</span>
                    </Button>
                    <p className="text-xs text-secondary-500 mt-2">
                        Skip authentication to preview all UIs
                    </p>
                </div> */}
            </form>
        </div>
    )
}

export default Login
