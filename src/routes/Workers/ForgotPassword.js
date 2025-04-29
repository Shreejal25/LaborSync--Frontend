import React, { useState } from 'react';
import { forgotPassword } from '../../endpoints/api'; // Import the API service

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);

        try {
            const response = await forgotPassword(email);
            if (response.success) {
                setMessage('If the email exists, a reset link has been sent.');
            } else {
                setError(response.message || 'Something went wrong.');
            }
        } catch (err) {
            setError('Failed to send reset link. Please try again.');
        } finally {
            setLoading(false);
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
                
                {message && (
                    <div className="mb-6 p-3 bg-green-50 border-l-4 border-green-400 rounded-md">
                        <p className="text-sm text-green-600">{message}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Email Address</label>
                        <input
                            type="email"
                            className="w-full px-4 py-3 border-gray-200 border rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition"
                            placeholder="your@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 disabled:opacity-70"
                        disabled={loading}
                    >
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <a href="/login" className="text-sm text-blue-500 hover:text-blue-600 transition">
                        Return to login
                    </a>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;