
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
        console.log('Pathname:', location.pathname);
        
        // Extract tokens from URL hash if present
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');

        console.log('Tokens found:', { 
          accessToken: accessToken ? 'EXISTS' : 'MISSING', 
          refreshToken: refreshToken ? 'EXISTS' : 'MISSING', 
          type: type || 'MISSING'
        });

        if (accessToken && type === 'recovery') {
          console.log('Processing recovery tokens...');
          
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || ''
          });

          if (error) {
            console.error('Error setting session:', error);
            setError("Link de recuperação inválido ou expirado.");
          } else if (data.session) {
            console.log('Recovery session established');
            setIsValidSession(true);
            // Clean URL after processing
            window.history.replaceState(null, '', '/reset-password');
          } else {
            setError("Erro ao processar link de recuperação");
          }
        } else {
          // Check if there's already a valid session
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.user) {
            console.log('Found existing session');
            setIsValidSession(true);
          } else {
            console.log('No valid session found');
            setError("Link de recuperação necessário. Solicite um novo através da página de login.");
          }
        }
      } catch (error) {
        console.error('Error processing reset:', error);
        setError("Erro ao processar recuperação de senha");
      } finally {
        setIsCheckingSession(false);
      }
    };

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
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        console.error('Error updating password:', error);
        setError("Erro ao atualizar senha: " + error.message);
        return;
      }

      setSuccess("Senha atualizada com sucesso! Redirecionando...");
      
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
          <span className="text-lg font-medium">Verificando link...</span>
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
              ? "Digite sua nova senha" 
              : "Acesso não autorizado"
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
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Digite novamente"
                  required
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
            </form>
          ) : (
            <div className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <Button 
                onClick={() => navigate('/login')} 
                className="w-full"
              >
                Ir para Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
