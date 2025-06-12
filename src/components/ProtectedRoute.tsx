
import { useAuth } from "@/contexts/AuthContext";
import Login from "@/pages/Login";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <span className="text-lg font-medium">Carregando...</span>
        </div>
      </div>
    );
  }

  if (!user || user.status !== 'approved') {
    return <Login />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
