import { UserDetailContext } from '@/context/UserDetailContext';
import { useGoogleLogout } from '@react-oauth/google';
import { useContext } from 'react';

function useLogout() {
    const { userDetail, setUserDetail } = useContext(UserDetailContext);

    const logOut = () => {
        try {
            // Clear local storage
            if (typeof window !== 'undefined') {
                localStorage.removeItem('user'); // Remove user data
            }

            // Clear user context
            setUserDetail(null);

            // Optional: Add a redirect to the login page or home page
            window.location.href = '/'; // Redirect to home page
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    return { logOut };
}

export default useLogout;
