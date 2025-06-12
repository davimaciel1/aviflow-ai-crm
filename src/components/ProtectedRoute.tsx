
import { useAuth } from "@/contexts/AuthContext";
import Login from "@/pages/Login";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="text-lg font-medium">Carregando...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  // Check if user is approved
  if (user.status === 'pending') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Alert>
            <AlertDescription className="text-center">
              <div className="mb-4">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⏳</span>
                </div>
                <h2 className="text-xl font-semibold mb-2">Conta Pendente de Aprovação</h2>
                <p className="text-gray-600">
                  Sua conta foi criada com sucesso, mas ainda precisa ser aprovada por um administrador.
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Você receberá um email quando sua conta for aprovada.
                </p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Verificar Status
              </button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (user.status === 'rejected') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Alert variant="destructive">
            <AlertDescription className="text-center">
              <div className="mb-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">❌</span>
                </div>
                <h2 className="text-xl font-semibold mb-2">Acesso Negado</h2>
                <p>
                  Sua solicitação de acesso foi negada. Entre em contato com o administrador para mais informações.
                </p>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
