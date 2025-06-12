import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleAuthRedirect = async () => {
      try {
        console.log('=== RESET PASSWORD PAGE LOADED ===');
        console.log('Current URL:', window.location.href);
        console.log('Hash:', window.location.hash);
        console.log('Pathname:', window.location.pathname);
        console.log('Location search:', location.search);
        
        // First check if there are tokens in the URL hash
        let hashParams = new URLSearchParams();
        if (window.location.hash) {
          // Remove the # and parse
          hashParams = new URLSearchParams(window.location.hash.substring(1));
        }
        
        // Also check URL search params as fallback
        const searchParams = new URLSearchParams(location.search);
        
        // Get tokens from either hash or search params
        const accessToken = hashParams.get('access_token') || searchParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token') || searchParams.get('refresh_token');
        const type = hashParams.get('type') || searchParams.get('type');

        console.log('Extracted params:', { 
          accessToken: accessToken ? 'EXISTS' : 'MISSING', 
          refreshToken: refreshToken ? 'EXISTS' : 'MISSING', 
          type: type || 'MISSING'
        });

        if (accessToken && type === 'recovery') {
          console.log('Valid recovery tokens found, setting session...');
          
          try {
            // Set the session with the tokens from URL
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || ''
            });

            if (error) {
              console.error('Error setting session:', error);
              setError("Link de recuperação inválido ou expirado. Tente solicitar um novo.");
            } else if (data.session) {
              console.log('Session set successfully:', data.session.user?.email);
              setIsValidSession(true);
              
              // Clean the URL to remove tokens for security
              window.history.replaceState(null, '', '/reset-password');
            } else {
              console.error('No session returned from setSession');
              setError("Erro ao configurar sessão de recuperação");
            }
          } catch (sessionError) {
            console.error('Session error:', sessionError);
            setError("Erro ao processar tokens de recuperação");
          }
        } else {
          console.log('No recovery tokens found in URL, checking existing session...');
          
          // Check if there's already a valid session
          try {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            
            if (sessionError) {
              console.error('Error getting session:', sessionError);
              setError("Erro ao verificar sessão");
            } else if (session?.user) {
              console.log('Found existing valid session for user:', session.user.email);
              setIsValidSession(true);
            } else {
              console.log('No valid session found');
              setError("Link de recuperação inválido ou expirado. Por favor, solicite um novo link de recuperação.");
            }
          } catch (sessionError) {
            console.error('Session check error:', sessionError);
            setError("Erro ao verificar sessão existente");
          }
        }
      } catch (error) {
        console.error('Error in handleAuthRedirect:', error);
        setError("Erro inesperado ao processar link de recuperação");
      } finally {
        setIsCheckingSession(false);
      }
    };

    // Run immediately without delay to process tokens quickly
    handleAuthRedirect();
  }, [location]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    if (!password || !confirmPassword) {
      setError("Por favor, preencha todos os campos");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      setIsLoading(false);
      return;
    }

    try {
      console.log('Updating password...');
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        console.error('Error updating password:', error);
        setError("Erro ao atualizar senha: " + error.message);
        setIsLoading(false);
        return;
      }

      console.log('Password updated successfully');
      setSuccess("Senha atualizada com sucesso! Redirecionando para o login...");
      
      // Clear the session and redirect to login
      setTimeout(async () => {
        await supabase.auth.signOut();
        navigate('/login');
      }, 2000);

    } catch (error) {
      console.error('Unexpected error:', error);
      setError("Erro inesperado. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="text-lg font-medium">Verificando link de recuperação...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">DaviFlow CRM</h1>
          </div>
          <CardTitle>Redefinir Senha</CardTitle>
          <CardDescription>
            {isValidSession 
              ? "Digite sua nova senha para concluir a recuperação"
              : "Verificando link de recuperação..."
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isValidSession ? (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Nova Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Digite a senha novamente"
                  required
                  minLength={6}
                  disabled={isLoading}
                />
              </div>
              
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "Atualizando..." : "Atualizar Senha"}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-sm text-blue-600 hover:underline"
                  disabled={isLoading}
                >
                  Voltar ao login
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="text-center space-y-4">
                <p className="text-sm text-gray-600">
                  Se você chegou aqui sem usar um link de recuperação válido, 
                  solicite um novo link através da página de login.
                </p>
                
                <Button 
                  onClick={() => navigate('/login')} 
                  className="w-full"
                >
                  Ir para Login
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
