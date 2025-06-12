
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [inviteToken, setInviteToken] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showSignup, setShowSignup] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const { login, isLoading } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !password) {
      setError("Por favor, preencha todos os campos");
      return;
    }

    const success = await login(email, password);
    if (!success) {
      setError("Email ou senha inválidos");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !password || !name || !inviteToken) {
      setError("Por favor, preencha todos os campos");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    try {
      // Validate invitation token first
      const { data: isValid } = await supabase.rpc('validate_invitation_token', {
        invitation_token: inviteToken
      });

      if (!isValid) {
        setError("Token de convite inválido ou expirado");
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          data: {
            name: name.trim(),
            invitation_token: inviteToken
          },
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          setError("Este email já está cadastrado. Tente fazer login.");
        } else {
          setError(error.message);
        }
        return;
      }

      if (data.user) {
        // Mark invitation as used
        await supabase.rpc('use_invitation_token', {
          invitation_token: inviteToken,
          user_email: email.toLowerCase().trim()
        });

        setSuccess("Conta criada com sucesso! Sua conta está pendente de aprovação pelo administrador.");
        setEmail("");
        setPassword("");
        setName("");
        setInviteToken("");
        setShowSignup(false);
      }
    } catch (error) {
      console.error('Signup error:', error);
      setError("Erro inesperado. Tente novamente.");
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsResetting(true);

    if (!email) {
      setError("Por favor, digite seu email");
      setIsResetting(false);
      return;
    }

    try {
      console.log('Enviando email de recuperação para:', email);
      
      // Use o domínio personalizado se estiver disponível
      const redirectUrl = window.location.hostname.includes('lovableproject.com') 
        ? `${window.location.origin}/reset-password`
        : 'https://crm.ippax.com/reset-password';
      
      console.log('Redirect URL:', redirectUrl);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl
      });

      if (error) {
        console.error('Erro ao enviar email:', error);
        setError(`Erro ao enviar email: ${error.message}`);
        setIsResetting(false);
        return;
      }

      console.log('Email de recuperação enviado com sucesso');
      setSuccess("Email de recuperação enviado! Verifique sua caixa de entrada e spam.");
      setEmail("");
      
      // Não fechar o modal imediatamente, deixar o usuário ver a mensagem
      setTimeout(() => {
        setShowForgotPassword(false);
        setSuccess("");
      }, 5000);

    } catch (error) {
      console.error('Erro inesperado:', error);
      setError("Erro inesperado. Verifique sua conexão e tente novamente.");
    } finally {
      setIsResetting(false);
    }
  };

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
          <CardTitle>
            {showForgotPassword ? "Recuperar Senha" : showSignup ? "Criar Conta" : "Acesse sua conta"}
          </CardTitle>
          <CardDescription>
            {showForgotPassword 
              ? "Digite seu email para receber instruções de recuperação"
              : showSignup 
                ? "Use seu token de convite para criar uma conta" 
                : "Faça login com suas credenciais"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showForgotPassword ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  autoComplete="email"
                  disabled={isResetting}
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

              <Button type="submit" className="w-full" disabled={isResetting}>
                {isResetting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isResetting ? "Enviando..." : "Enviar Email de Recuperação"}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setError("");
                    setSuccess("");
                  }}
                  className="text-sm text-blue-600 hover:underline"
                  disabled={isResetting}
                >
                  Voltar ao login
                </button>
              </div>

              <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-xs text-amber-800">
                  <strong>Dica:</strong> Se não receber o email, verifique sua pasta de spam. 
                  O email pode levar alguns minutos para chegar.
                </p>
              </div>
            </form>
          ) : !showSignup ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha"
                  required
                  autoComplete="current-password"
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
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>

              <div className="text-center space-y-2">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-blue-600 hover:underline block w-full"
                >
                  Esqueci minha senha
                </button>
                <button
                  type="button"
                  onClick={() => setShowSignup(true)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Tem um convite? Criar conta
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="invite-token">Token de Convite</Label>
                <Input
                  id="invite-token"
                  type="text"
                  value={inviteToken}
                  onChange={(e) => setInviteToken(e.target.value)}
                  placeholder="Seu token de convite"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-name">Nome Completo</Label>
                <Input
                  id="signup-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome completo"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Senha</Label>
                <Input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
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
                {isLoading ? "Criando conta..." : "Criar Conta"}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowSignup(false)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Já tem conta? Fazer login
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-sm mb-2">Sistema de Convites:</h3>
            <div className="text-xs space-y-1">
              <p>• Apenas usuários convidados podem se cadastrar</p>
              <p>• Novas contas precisam de aprovação do admin</p>
              <p>• Contate o administrador para obter um convite</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
