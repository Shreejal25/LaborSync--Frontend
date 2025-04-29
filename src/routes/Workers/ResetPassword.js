import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resetPasswordConfirm } from '../../endpoints/api'; // Import the API service

function ResetPassword() {
    const { uid, token } = useParams();  // Extract uid and token
    const navigate = useNavigate();

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    
    // Add state for password visibility
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        try {
            const response = await resetPasswordConfirm(uid, token, newPassword, confirmPassword);
            if (response.success) {
                setSuccessMessage('Password has been reset successfully. Redirecting...');
                setTimeout(() => navigate('/login'), 3000);
            } else {
                setError(response.message);
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <div className="w-full max-w-md px-8 pt-8 pb-10 bg-white rounded-xl shadow-sm">
                <h2 className="text-2xl font-medium text-gray-800 mb-6 text-center">Reset Password</h2>
                
                {error && (
                    <div className="mb-6 p-3 bg-red-50 border-l-4 border-red-400 rounded-md">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}
                
                {successMessage && (
                    <div className="mb-6 p-3 bg-green-50 border-l-4 border-green-400 rounded-md">
                        <p className="text-sm text-green-600">{successMessage}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">New Password</label>
                        <div className="relative">
                            <input
                                type={showNewPassword ? "text" : "password"}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-400 hover:text-gray-600"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                            >
                                {showNewPassword ? 'Hide' : 'Show'}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-400 hover:text-gray-600"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? 'Hide' : 'Show'}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2"
                    >
                        Reset Password
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <a href="/login" className="text-sm text-blue-500 hover:text-blue-600 transition">
                        Back to login
                    </a>
                </div>
            </div>
        </div>
    );
}

export default ResetPassword;