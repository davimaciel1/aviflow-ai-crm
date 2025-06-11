import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, 
  Users, 
  DollarSign, 
  Target, 
  TrendingUp, 
  Brain,
  Calendar,
  Settings,
  Bell,
  Search,
  Plus,
  LogOut,
  User
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import KanbanBoard from "@/components/KanbanBoard";
import ClientsList from "@/components/ClientsList";
import TasksList from "@/components/TasksList";
import AIInsights from "@/components/AIInsights";
import CompanyUserManager from "@/components/CompanyUserManager";
import KanbanConfigPanel from "@/components/KanbanConfigPanel";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { user, logout } = useAuth();
  const isClientView = user?.role === 'client';

  // Mock data for demonstration
  const dashboardMetrics = {
    totalDeals: isClientView ? 3 : 156,
    totalValue: isClientView ? "R$ 375K" : "R$ 2.4M",
    activeClients: isClientView ? 1 : 42,
    pendingTasks: isClientView ? 5 : 18,
    conversionRate: 67,
    monthlyGrowth: 12.5
  };

  const getAvailableTabs = () => {
    if (isClientView) {
      return ["dashboard", "kanban", "tasks"];
    }
    return ["dashboard", "kanban", "clients", "users", "tasks", "settings"];
  };

  const availableTabs = getAvailableTabs();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">D</span>
                </div>
                <h1 className="text-xl font-bold text-slate-900">
                  DaviFlow CRM {isClientView && "- Portal do Cliente"}
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {!isClientView && (
                <Button variant="outline" size="sm">
                  <Search className="w-4 h-4 mr-2" />
                  Buscar
                </Button>
              )}
              <Button variant="outline" size="sm">
                <Bell className="w-4 h-4" />
              </Button>
              <div className="flex items-center space-x-2">
                <Avatar>
                  <AvatarImage src="/placeholder-avatar.jpg" />
                  <AvatarFallback>
                    {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className={`grid w-full ${isClientView ? 'grid-cols-3' : 'grid-cols-6'} lg:w-fit`}>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="kanban" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              {isClientView ? "Meus Projetos" : "Pipeline"}
            </TabsTrigger>
            {!isClientView && (
              <TabsTrigger value="clients" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Clientes
              </TabsTrigger>
            )}
            {!isClientView && (
              <TabsTrigger value="users" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Usuários
              </TabsTrigger>
            )}
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {isClientView ? "Minhas Tarefas" : "Tarefas"}
            </TabsTrigger>
            {!isClientView && (
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Configurações
              </TabsTrigger>
            )}
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">
                  {isClientView ? "Meu Dashboard" : "Dashboard"}
                </h2>
                <p className="text-slate-600">
                  {isClientView ? "Acompanhe o progresso dos seus projetos" : "Visão geral do seu negócio com insights de IA"}
                </p>
              </div>
              {!isClientView && (
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Deal
                </Button>
              )}
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {isClientView ? "Meus Projetos" : "Total de Deals"}
                  </CardTitle>
                  <Target className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardMetrics.totalDeals}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">+12%</span> vs. mês anterior
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {isClientView ? "Valor dos Projetos" : "Valor Total"}
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardMetrics.totalValue}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">+{dashboardMetrics.monthlyGrowth}%</span> crescimento
                  </p>
                </CardContent>
              </Card>

              {!isClientView && (
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
                    <Users className="h-4 w-4 text-purple-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardMetrics.activeClients}</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-green-600">+3</span> novos este mês
                    </p>
                  </CardContent>
                </Card>
              )}

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {isClientView ? "Minhas Tarefas" : "Tarefas Pendentes"}
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardMetrics.pendingTasks}</div>
                  <p className="text-xs text-muted-foreground">
                    {isClientView ? "2 vencendo hoje" : "5 vencendo hoje"}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts and AI Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    {isClientView ? "Progresso dos Projetos" : "Performance do Pipeline"}
                  </CardTitle>
                  <CardDescription>
                    {isClientView ? "Status dos seus projetos" : "Distribuição de deals por estágio"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Prospecção</span>
                      <Badge variant="secondary">{isClientView ? "1 projeto" : "45 deals"}</Badge>
                    </div>
                    <Progress value={65} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Qualificação</span>
                      <Badge variant="secondary">{isClientView ? "1 projeto" : "32 deals"}</Badge>
                    </div>
                    <Progress value={45} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Proposta</span>
                      <Badge variant="secondary">{isClientView ? "0 projetos" : "28 deals"}</Badge>
                    </div>
                    <Progress value={40} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Fechamento</span>
                      <Badge variant="default">{isClientView ? "1 projeto" : "51 deals"}</Badge>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {!isClientView && <AIInsights />}
              
              {isClientView && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      Próximas Atividades
                    </CardTitle>
                    <CardDescription>
                      Suas próximas reuniões e marcos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium">Reunião de alinhamento</p>
                          <p className="text-xs text-muted-foreground">Hoje, 14:00</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                        <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium">Entrega do protótipo</p>
                          <p className="text-xs text-muted-foreground">Amanhã, 16:00</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Kanban Tab */}
          <TabsContent value="kanban" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">
                  {isClientView ? "Meus Projetos" : "Pipeline Kanban"}
                </h2>
                <p className="text-slate-600">
                  {isClientView ? "Acompanhe o progresso dos seus projetos" : "Gerencie seus deals com drag & drop"}
                </p>
              </div>
              <div className="flex gap-2">
                {!isClientView && (
                  <>
                    <Button variant="outline">
                      Filtros
                    </Button>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Novo Deal
                    </Button>
                  </>
                )}
              </div>
            </div>
            <KanbanBoard />
          </TabsContent>

          {/* Users Tab */}
          {!isClientView && (
            <TabsContent value="users" className="space-y-6">
              <CompanyUserManager />
            </TabsContent>
          )}

          {/* Clients Tab */}
          {!isClientView && (
            <TabsContent value="clients" className="space-y-6">
              <ClientsList />
            </TabsContent>
          )}

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">
                  {isClientView ? "Minhas Tarefas" : "Minhas Tarefas"}
                </h2>
                <p className="text-slate-600">
                  {isClientView ? "Suas atividades e prazos" : "Organize suas atividades e prazos"}
                </p>
              </div>
              {!isClientView && (
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Tarefa
                </Button>
              )}
            </div>
            <TasksList />
          </TabsContent>

          {!isClientView && (
            <TabsContent value="settings" className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">Configurações</h2>
                <p className="text-slate-600">Configure seu CRM</p>
              </div>
              
              <Tabs defaultValue="kanban" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="kanban">Kanban</TabsTrigger>
                  <TabsTrigger value="system">Sistema</TabsTrigger>
                </TabsList>
                
                <TabsContent value="kanban">
                  <KanbanConfigPanel />
                </TabsContent>
                
                <TabsContent value="system">
                  <Card>
                    <CardHeader>
                      <CardTitle>Configurações do Sistema</CardTitle>
                      <CardDescription>
                        Personalize o comportamento do seu CRM
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Em desenvolvimento - configurações avançadas em breve
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
