import React, { FC, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerUser } from '../services/api'; // registerUser will be updated later
import Alert from '../components/Alert';
import Spinner from '../components/Spinner';

const RegisterPage: FC = () => {
    const navigate = useNavigate();
    const { user, isLoading: isAuthLoading } = useAuth();

    // Form state (text fields)
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    // New state for the avatar file
    const [avatarFile, setAvatarFile] = useState<File | null>(null);

    // Page state
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false); // Loading during submission

    useEffect(() => {
        if (!isAuthLoading && user) {
            navigate('/');
        }
    }, [user, isAuthLoading, navigate]);

    // Handler for file input changes
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setAvatarFile(e.target.files[0]); // Store the selected file object
        } else {
            setAvatarFile(null); // Clear if no file selected
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }
        // Optional: Add validation for file size or type on the frontend too

        setIsLoading(true);

        // Create FormData object
        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);
        if (name) {
            formData.append('name', name);
        }
        // Append the file IF one was selected
        // 'avatarImage' MUST match the field name expected by multer on the backend
        if (avatarFile) {
            formData.append('avatarImage', avatarFile);
        }

        try {
            // Call API with FormData (we'll update registerUser in api.ts next)
            const result = await registerUser(formData);

            navigate('/login', {
                replace: true,
                state: { message: 'Registration successful! Please log in.' }
            });

        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unknown error occurred during registration.");
            }
            setIsLoading(false);
        }
    };

    if (isAuthLoading) {
         return (
             <div className="flex justify-center items-center min-h-screen">
                  <Spinner size="lg" />
             </div>
         );
     }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center text-gray-900">Create your Star Blog Account</h2>

                {error && (
                    <Alert
                        message={error}
                        type="error"
                        title="Registration Failed!"
                        onClose={() => setError(null)}
                    />
                )}

                {/* Changed form encoding type - though fetch handles FormData automatically */}
                <form onSubmit={handleRegister} className="space-y-4">
                     <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name (Optional):</label>
                        <input type="text" id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} disabled={isLoading} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Your Name" />
                    </div>
                    <div>
                        <label htmlFor="email-register" className="block text-sm font-medium text-gray-700">Email:</label>
                        <input type="email" id="email-register" name="email" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="your.email@example.com"/>
                    </div>
                     {/* Add File Input */}
                     <div>
                         <label htmlFor="avatarImage" className="block text-sm font-medium text-gray-700">Avatar Image (Optional):</label>
                         <input
                             type="file"
                             id="avatarImage"
                             name="avatarImage"
                             accept="image/png, image/jpeg, image/gif" // Hint for file types
                             onChange={handleFileChange}
                             disabled={isLoading}
                             className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 disabled:opacity-50"
                         />
                         {/* Optional: Preview selected image */}
                         {avatarFile && <p className="text-xs text-gray-500 mt-1">Selected: {avatarFile.name}</p>}
                     </div>
                    <div>
                        <label htmlFor="password-register" className="block text-sm font-medium text-gray-700">Password:</label>
                        <input type="password" id="password-register" name="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="********"/>
                    </div>
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password:</label>
                        <input type="password" id="confirmPassword" name="confirmPassword" required minLength={6} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={isLoading} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="********"/>
                    </div>
                    <div>
                        <button type="submit" disabled={isLoading} className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            {isLoading ? 'Registering...' : 'Register'}
                        </button>
                    </div>
                </form>
                <div className="text-sm text-center">
                    <span className="text-gray-600">Already have an account?</span>{' '}
                    <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                        Log In
                    </Link>
                </div>
            </div>
        </div>
    );
};
export default RegisterPage;
