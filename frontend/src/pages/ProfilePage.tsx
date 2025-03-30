// src/pages/ProfilePage.tsx (Corrected & Cleaned)
import React, { FC, useState, useEffect, ChangeEvent, FormEvent, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getCurrentUser, updateUserProfile } from '../services/api';
import { User } from '../types';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';
import { Link } from 'react-router-dom';

const DefaultAvatar: FC<{ className?: string }> = ({ className = "h-full w-full text-gray-400" }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
);

const BACKEND_URL = 'http://localhost:4000';

const ProfilePage: FC = () => {
    const { token, login } = useAuth();
    const [profileData, setProfileData] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [nameInput, setNameInput] = useState('');
    const [newAvatarFile, setNewAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const getAvatarSrc = useCallback((avatarPath: string | null | undefined): string | null => {
         if (!avatarPath) return null;
         if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) return avatarPath;
         return `${BACKEND_URL}${avatarPath}`;
    }, []);

    const fetchProfile = useCallback(async () => {
        if (!token) {
            setError("Authentication required."); setIsLoading(false); return;
        }
        setIsLoading(true); setError(null);
        try {
            const data = await getCurrentUser(); // Now returns User with avatarUrl (camelCase)
            setProfileData(data);
            setNameInput(data.name || '');
            // Use camelCase consistently now
            setAvatarPreview(getAvatarSrc(data.avatarUrl));

            // Construct context user data using camelCase
            const userForContext = {
                id: data.id,
                email: data.email,
                name: data.name || null,
                avatarUrl: data.avatarUrl || null // Access camelCase property
            };
            // This login call should now receive the correct avatarUrl
            login(userForContext, token);

        } catch (err) {
            setError(err instanceof Error ? `Failed to load profile: ${err.message}` : "An unknown error occurred.");
            setProfileData(null);
        } finally {
            setIsLoading(false);
        }
    }, [token, login, getAvatarSrc]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => setNameInput(e.target.value);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setNewAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setAvatarPreview(reader.result as string);
            reader.readAsDataURL(file);
        } else {
            setNewAvatarFile(null);
            // Use camelCase here too
            setAvatarPreview(getAvatarSrc(profileData?.avatarUrl));
        }
    };

    const handleProfileUpdate = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null); setSuccessMessage(null);
        const nameChanged = nameInput !== (profileData?.name || '');
        const avatarChanged = newAvatarFile !== null;

        if (!nameChanged && !avatarChanged) { setError("No changes detected."); return; }

        setIsSaving(true);
        const formData = new FormData();
        if (nameChanged) formData.append('name', nameInput);
        if (avatarChanged && newAvatarFile) formData.append('avatarImage', newAvatarFile);

        try {
            await updateUserProfile(formData);
            await fetchProfile(); // Refetch updates profileData, avatarPreview and context
            setSuccessMessage("Profile updated successfully!");
            setNewAvatarFile(null);
        } catch (err) {
            setError(err instanceof Error ? `Failed to update profile: ${err.message}` : "An unknown error occurred.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading && !profileData) {
        return <div className="flex justify-center items-center py-10"><Spinner size="lg" /></div>;
    }

    if (error && !profileData && !isSaving) {
         return ( <div className="px-4 sm:px-6 lg:px-8 py-4 text-center"> <Alert message={error} type="error" title="Error Loading Profile!" onClose={() => setError(null)} /><Link to="/" className="text-blue-500 hover:underline mt-4 inline-block">Back to homepage</Link></div>);
    }

    if (!profileData) {
        return <div className="px-4 sm:px-6 lg:px-8 py-4 text-center">Could not load profile data.</div>;
    }

    // Use avatarPreview for display logic
    const currentAvatarDisplay = avatarPreview;

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
                <h1 className="text-2xl font-bold mb-4 text-gray-900">Your Profile</h1>

                {error && !isLoading && (<Alert message={error} type="error" title="Update Error!" onClose={() => setError(null)} />)}
                {successMessage && (<Alert message={successMessage} type="success" title="Success!" onClose={() => setSuccessMessage(null)} />)}

                <form onSubmit={handleProfileUpdate} className="space-y-6 mt-4">
                    <div className="flex items-center space-x-4">
                         <div className="flex-shrink-0">
                            {currentAvatarDisplay ? ( <img className="h-20 w-20 rounded-full object-cover ring-2 ring-offset-2 ring-indigo-500" src={currentAvatarDisplay} alt="Current or preview avatar" />)
                            : (<span className="inline-block h-20 w-20 overflow-hidden rounded-full bg-gray-200 ring-2 ring-offset-2 ring-indigo-500"><DefaultAvatar className="h-full w-full text-gray-400"/></span>)}
                        </div>
                        <div>
                            <label htmlFor="avatarImage" className="block text-sm font-medium text-gray-700 mb-1">Change Avatar:</label>
                            <input type="file" id="avatarImage" name="avatarImage" accept="image/png, image/jpeg, image/gif" onChange={handleFileChange} disabled={isSaving} className="block w-full text-sm text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 disabled:opacity-50"/>
                            <p className="text-xs text-gray-500 mt-1">Max 5MB (PNG, JPG, GIF)</p>
                        </div>
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-gray-700">Email:</label>
                         <p className="mt-1 text-sm text-gray-600 bg-gray-50 px-3 py-2 border border-gray-300 rounded-md">{profileData.email}</p>
                    </div>
                    <div>
                         <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name:</label>
                         <input type="text" id="name" name="name" value={nameInput} onChange={handleNameChange} disabled={isSaving} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Your Name"/>
                    </div>
                     <div>
                         <button type="submit" disabled={isSaving || (!newAvatarFile && nameInput === (profileData?.name || ''))} className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed`}>
                            {isSaving ? (<><Spinner size="sm" color="text-white" className="mr-2"/>Saving...</>) : 'Save Changes'}
                         </button>
                     </div>
                </form>
                 <div className="mt-6 border-t pt-6">
                      <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Change Password</h3>
                      <p className="text-sm text-gray-500">(Password change form coming soon...)</p>
                 </div>
            </div>
        </div>
    );
};
export default ProfilePage;
