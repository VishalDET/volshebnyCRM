/**
 * AuthLayout Component
 * Layout for authentication pages (login, register, etc.)
 */
const AuthLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo/Branding */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">
                        VolshebnyCRM
                    </h1>
                    <p className="text-primary-100">
                        Travel Management System
                    </p>
                </div>

                {/* Auth Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    {children}
                </div>

                {/* Footer */}
                <div className="text-center mt-6 text-primary-100 text-sm">
                    © {new Date().getFullYear()} VolshebnyCRM. All rights reserved.
                </div>
            </div>
        </div>
    )
}

export default AuthLayout
