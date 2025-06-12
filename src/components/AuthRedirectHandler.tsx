
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthRedirectHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleAuthRedirect = () => {
      const currentUrl = window.location.href;
      const hash = window.location.hash;
      
      console.log('AuthRedirectHandler - Current URL:', currentUrl);
      console.log('AuthRedirectHandler - Hash:', hash);
      console.log('AuthRedirectHandler - Pathname:', location.pathname);

      // Only process if we have auth tokens in the hash and we're not already on reset-password
      if (hash.includes('access_token=') || hash.includes('type=recovery')) {
        if (location.pathname !== '/reset-password') {
          console.log('Detected Supabase auth callback, redirecting to reset-password');
          
          // Store the hash in sessionStorage temporarily
          sessionStorage.setItem('supabase_auth_hash', hash);
          
          // Navigate to reset password page
          navigate('/reset-password', { replace: true });
          
          // Clean the URL
          window.history.replaceState(null, '', '/reset-password');
        }
      }
    };

    // Only run if we have hash with auth tokens
    if (window.location.hash && (window.location.hash.includes('access_token=') || window.location.hash.includes('type=recovery'))) {
      handleAuthRedirect();
    }
    
    // Also listen for hash changes
    window.addEventListener('hashchange', handleAuthRedirect);
    
    return () => {
      window.removeEventListener('hashchange', handleAuthRedirect);
    };
  }, [navigate, location.pathname]);

  return null;
};

export default AuthRedirectHandler;
