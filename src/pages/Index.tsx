
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { LogOut, BarChart3, Users, FileText, Settings, UserCog } from "lucide-react";
import KanbanBoard from "@/components/KanbanBoard";
import ClientsList from "@/components/ClientsList";
import TasksList from "@/components/TasksList";
import AIInsights from "@/components/AIInsights";
import AppSettings from "@/components/AppSettings";
import UserManagement from "@/components/UserManagement";

const Index = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("pipeline");

  const handleLogout = () => {
    logout();
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">D</span>
                </div>
                <h1 className="text-xl font-bold text-slate-900">DaviFlow CRM</h1>
              </div>
              <Badge variant="outline" className="ml-4">
                {user.role === 'admin' ? 'Administrador' : 'Cliente'}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Olá, {user.name}</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="pipeline" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Pipeline
            </TabsTrigger>
            <TabsTrigger value="clients" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Clientes
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Tarefas
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Insights
            </TabsTrigger>
            {user.role === 'admin' && (
              <TabsTrigger value="users" className="flex items-center gap-2">
                <UserCog className="h-4 w-4" />
                Usuários
              </TabsTrigger>
            )}
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configurações
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="pipeline">
              <KanbanBoard />
            </TabsContent>

            <TabsContent value="clients">
              <ClientsList />
            </TabsContent>

            <TabsContent value="tasks">
              <TasksList />
            </TabsContent>

            <TabsContent value="insights">
              <AIInsights />
            </TabsContent>

            {user.role === 'admin' && (
              <TabsContent value="users">
                <UserManagement />
              </TabsContent>
            )}

            <TabsContent value="settings">
              <AppSettings />
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
