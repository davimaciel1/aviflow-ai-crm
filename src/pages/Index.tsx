
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
  FileText,
  Settings,
  Bell,
  Search,
  Plus
} from "lucide-react";
import KanbanBoard from "@/components/KanbanBoard";
import ClientsList from "@/components/ClientsList";
import TasksList from "@/components/TasksList";
import DocumentsList from "@/components/DocumentsList";
import AIInsights from "@/components/AIInsights";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  // Mock data for demonstration
  const dashboardMetrics = {
    totalDeals: 156,
    totalValue: "R$ 2.4M",
    activeClients: 42,
    pendingTasks: 18,
    conversionRate: 67,
    monthlyGrowth: 12.5
  };

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
                <h1 className="text-xl font-bold text-slate-900">DaviFlow CRM</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Search className="w-4 h-4 mr-2" />
                Buscar
              </Button>
              <Button variant="outline" size="sm">
                <Bell className="w-4 h-4" />
              </Button>
              <Avatar>
                <AvatarImage src="/placeholder-avatar.jpg" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:w-fit lg:grid-cols-6">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="kanban" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Pipeline
            </TabsTrigger>
            <TabsTrigger value="clients" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Clientes
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Tarefas
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Documentos
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Configurações
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">Dashboard</h2>
                <p className="text-slate-600">Visão geral do seu negócio com insights de IA</p>
              </div>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Deal
              </Button>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Deals</CardTitle>
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
                  <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
                  <DollarSign className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardMetrics.totalValue}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">+{dashboardMetrics.monthlyGrowth}%</span> crescimento
                  </p>
                </CardContent>
              </Card>

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

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tarefas Pendentes</CardTitle>
                  <Calendar className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardMetrics.pendingTasks}</div>
                  <p className="text-xs text-muted-foreground">
                    5 vencendo hoje
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
                    Performance do Pipeline
                  </CardTitle>
                  <CardDescription>
                    Distribuição de deals por estágio
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Prospecção</span>
                      <Badge variant="secondary">45 deals</Badge>
                    </div>
                    <Progress value={65} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Qualificação</span>
                      <Badge variant="secondary">32 deals</Badge>
                    </div>
                    <Progress value={45} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Proposta</span>
                      <Badge variant="secondary">28 deals</Badge>
                    </div>
                    <Progress value={40} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Fechamento</span>
                      <Badge variant="default">51 deals</Badge>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <AIInsights />
            </div>
          </TabsContent>

          {/* Kanban Tab */}
          <TabsContent value="kanban" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">Pipeline Kanban</h2>
                <p className="text-slate-600">Gerencie seus deals com drag & drop</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  Filtros
                </Button>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Deal
                </Button>
              </div>
            </div>
            <KanbanBoard />
          </TabsContent>

          {/* Clients Tab */}
          <TabsContent value="clients" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">Clientes</h2>
                <p className="text-slate-600">Gerencie sua base de clientes</p>
              </div>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Cliente
              </Button>
            </div>
            <ClientsList />
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">Minhas Tarefas</h2>
                <p className="text-slate-600">Organize suas atividades e prazos</p>
              </div>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nova Tarefa
              </Button>
            </div>
            <TasksList />
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">Documentos</h2>
                <p className="text-slate-600">Gerencie e analise documentos com IA</p>
              </div>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Upload
              </Button>
            </div>
            <DocumentsList />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Configurações</h2>
              <p className="text-slate-600">Configure seu CRM</p>
            </div>
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
      </div>
    </div>
  );
};

export default Index;
