
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthRedirectHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthRedirect = () => {
      const currentUrl = window.location.href;
      const hash = window.location.hash;
      
      console.log('AuthRedirectHandler - Current URL:', currentUrl);
      console.log('AuthRedirectHandler - Hash:', hash);

      // Check if this is a Supabase auth callback
      if (hash.includes('access_token=') || hash.includes('type=recovery')) {
        console.log('Detected Supabase auth callback, redirecting to reset-password');
        
        // Store the hash in sessionStorage temporarily
        sessionStorage.setItem('supabase_auth_hash', hash);
        
        // Navigate to reset password page
        navigate('/reset-password', { replace: true });
        
        // Clean the URL
        window.history.replaceState(null, '', '/reset-password');
      }
    };

    // Run on component mount
    handleAuthRedirect();
    
    // Also listen for hash changes
    window.addEventListener('hashchange', handleAuthRedirect);
    
    return () => {
      window.removeEventListener('hashchange', handleAuthRedirect);
    };
  }, [navigate]);

  return null;
};

export default AuthRedirectHandler;
