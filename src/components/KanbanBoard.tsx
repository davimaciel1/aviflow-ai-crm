import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  DollarSign, 
  Calendar,
  User,
  Building2,
  Phone,
  Mail,
  MapPin,
  FileText
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// Mock data types
interface Client {
  id: string;
  name: string;
  email: string;
  company: string;
  phone?: string;
  status: 'prospect' | 'qualified' | 'client' | 'inactive';
}

interface Deal {
  id: string;
  title: string;
  description?: string;
  value?: number;
  client?: Client;
  stage: string;
  priority: 'low' | 'medium' | 'high';
  contact?: string;
  confidential?: string;
  createdAt: string;
}

interface Stage {
  id: string;
  title: string;
  deals: Deal[];
}

const KanbanBoard = () => {
  const { user } = useAuth();
  const isClientView = user?.role === 'client';

  console.log('KanbanBoard - User:', user);

  // Mock data and state management
  const mockClients: Client[] = [
    {
      id: '1',
      name: 'João Silva',
      email: 'joao@techcorp.com',
      company: 'TechCorp',
      phone: '+55 11 99999-9999',
      status: 'qualified'
    },
    {
      id: '2',
      name: 'Maria Santos',
      email: 'maria@startupxyz.com',
      company: 'StartupXYZ',
      phone: '+55 21 88888-8888',
      status: 'client'
    },
    {
      id: '3',
      name: 'Pedro Oliveira',
      email: 'pedro@abccorp.com',
      company: 'ABC Corp',
      phone: '+55 31 77777-7777',
      status: 'prospect'
    }
  ];

  const mockDeals: Deal[] = [
    {
      id: '1',
      title: 'Sistema de CRM Personalizado',
      description: 'Desenvolvimento de sistema CRM completo para gestão de vendas',
      value: 150000,
      client: mockClients[0],
      stage: '1',
      priority: 'high',
      contact: 'João Silva - CEO',
      confidential: 'Orçamento aprovado pela diretoria',
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      title: 'Website Institucional',
      description: 'Criação de website moderno e responsivo',
      value: 25000,
      client: mockClients[1],
      stage: '2',
      priority: 'medium',
      contact: 'Maria Santos - Marketing',
      createdAt: '2024-01-20'
    },
    {
      id: '3',
      title: 'App Mobile',
      description: 'Desenvolvimento de aplicativo mobile para iOS e Android',
      value: 80000,
      client: mockClients[2],
      stage: '3',
      priority: 'high',
      contact: 'Pedro Oliveira - CTO',
      confidential: 'Prazo apertado para lançamento',
      createdAt: '2024-01-25'
    },
    {
      id: '4',
      title: 'E-commerce Platform',
      description: 'Plataforma completa de e-commerce',
      value: 200000,
      client: mockClients[0],
      stage: '4',
      priority: 'medium',
      contact: 'João Silva - CEO',
      createdAt: '2024-02-01'
    },
    {
      id: '5',
      title: 'Sistema de Gestão',
      description: 'ERP customizado para gestão empresarial',
      value: 300000,
      client: mockClients[1],
      stage: '1',
      priority: 'low',
      contact: 'Maria Santos - Diretora',
      createdAt: '2024-02-05'
    }
  ];

  const allStages: Stage[] = [
    {
      id: '1',
      title: 'Prospecção',
      deals: mockDeals.filter(deal => deal.stage === '1')
    },
    {
      id: '2',
      title: 'Qualificação',
      deals: mockDeals.filter(deal => deal.stage === '2')
    },
    {
      id: '3',
      title: 'Proposta',
      deals: mockDeals.filter(deal => deal.stage === '3')
    },
    {
      id: '4',
      title: 'Fechamento',
      deals: mockDeals.filter(deal => deal.stage === '4')
    }
  ];

  // Filter stages based on user role
  const getFilteredStages = () => {
    if (isClientView) {
      // For clients, show deals related to their email
      const clientEmail = user?.email;
      return allStages.map(stage => ({
        ...stage,
        deals: stage.deals.filter(deal => deal.client?.email === clientEmail)
      })).filter(stage => stage.deals.length > 0);
    }
    return allStages;
  };

  const [stages, setStages] = useState<Stage[]>(getFilteredStages());
  const [newDealTitle, setNewDealTitle] = useState("");
  const [newDealDescription, setNewDealDescription] = useState("");
  const [newDealValue, setNewDealValue] = useState("");
  const [newDealClient, setNewDealClient] = useState("");
  const [newDealPriority, setNewDealPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [selectedStageId, setSelectedStageId] = useState("");
  const [isAddingDeal, setIsAddingDeal] = useState(false);

  useEffect(() => {
    setStages(getFilteredStages());
  }, [user]);

  const handleAddDeal = () => {
    if (!newDealTitle.trim() || !selectedStageId) return;

    const newDeal: Deal = {
      id: Date.now().toString(),
      title: newDealTitle,
      description: newDealDescription,
      value: newDealValue ? parseFloat(newDealValue) : undefined,
      client: mockClients.find(c => c.id === newDealClient),
      stage: selectedStageId,
      priority: newDealPriority,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setStages(prevStages =>
      prevStages.map(stage =>
        stage.id === selectedStageId
          ? { ...stage, deals: [...stage.deals, newDeal] }
          : stage
      )
    );

    // Reset form
    setNewDealTitle("");
    setNewDealDescription("");
    setNewDealValue("");
    setNewDealClient("");
    setNewDealPriority('medium');
    setSelectedStageId("");
    setIsAddingDeal(false);
  };

  const getPriorityColor = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatCurrency = (value?: number) => {
    if (!value) return 'Valor não informado';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">
            {isClientView ? "Meus Projetos" : "Pipeline de Vendas"}
          </h2>
          <p className="text-slate-600">
            {isClientView 
              ? "Acompanhe o progresso dos seus projetos" 
              : "Gerencie seus deals e acompanhe o progresso"}
          </p>
        </div>
        {!isClientView && (
          <Dialog open={isAddingDeal} onOpenChange={setIsAddingDeal}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Deal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Deal</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título *</Label>
                    <Input
                      id="title"
                      value={newDealTitle}
                      onChange={(e) => setNewDealTitle(e.target.value)}
                      placeholder="Nome do projeto"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="stage">Estágio *</Label>
                    <Select value={selectedStageId} onValueChange={setSelectedStageId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o estágio" />
                      </SelectTrigger>
                      <SelectContent>
                        {stages.map((stage) => (
                          <SelectItem key={stage.id} value={stage.id}>
                            {stage.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={newDealDescription}
                    onChange={(e) => setNewDealDescription(e.target.value)}
                    placeholder="Descreva o projeto..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="value">Valor (R$)</Label>
                    <Input
                      id="value"
                      type="number"
                      value={newDealValue}
                      onChange={(e) => setNewDealValue(e.target.value)}
                      placeholder="150000"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="client">Cliente</Label>
                    <Select value={newDealClient} onValueChange={setNewDealClient}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockClients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name} - {client.company}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="priority">Prioridade</Label>
                    <Select value={newDealPriority} onValueChange={(value: 'low' | 'medium' | 'high') => setNewDealPriority(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setIsAddingDeal(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddDeal} disabled={!newDealTitle.trim() || !selectedStageId}>
                    Adicionar Deal
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Kanban Board */}
      <div className="flex space-x-6 overflow-x-auto pb-6">
        {stages.map((stage) => (
          <div key={stage.id} className="flex-shrink-0 w-80">
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900">{stage.title}</h3>
                <Badge variant="secondary" className="text-xs">
                  {stage.deals.length}
                </Badge>
              </div>
              
              <div className="space-y-3">
                {stage.deals.map((deal) => (
                  <Dialog key={deal.id}>
                    <DialogTrigger asChild>
                      <Card className="cursor-pointer hover:shadow-md transition-shadow bg-white">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <h4 className="font-medium text-slate-900 line-clamp-2">
                                {deal.title}
                              </h4>
                              <Badge className={`text-xs ${getPriorityColor(deal.priority)}`}>
                                {deal.priority === 'high' ? 'Alta' : deal.priority === 'medium' ? 'Média' : 'Baixa'}
                              </Badge>
                            </div>
                            
                            {deal.description && (
                              <p className="text-sm text-slate-600 line-clamp-2">
                                {deal.description}
                              </p>
                            )}
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <DollarSign className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-medium text-green-600">
                                  {formatCurrency(deal.value)}
                                </span>
                              </div>
                              
                              {deal.client && (
                                <div className="flex items-center space-x-1">
                                  <Avatar className="w-6 h-6">
                                    <AvatarFallback className="text-xs">
                                      {deal.client.name.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                  </Avatar>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </DialogTrigger>
                    
                    {/* Deal Details Modal */}
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-xl">{deal.title}</DialogTitle>
                      </DialogHeader>
                      
                      <Tabs defaultValue="details" className="space-y-4">
                        <TabsList>
                          <TabsTrigger value="details">Detalhes</TabsTrigger>
                          <TabsTrigger value="client">Cliente</TabsTrigger>
                          <TabsTrigger value="notes">Notas</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="details" className="space-y-4">
                          <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <div>
                                <Label className="text-sm font-medium text-slate-700">Descrição</Label>
                                <p className="text-slate-600 mt-1">
                                  {deal.description || 'Nenhuma descrição fornecida'}
                                </p>
                              </div>
                              
                              <div>
                                <Label className="text-sm font-medium text-slate-700">Valor</Label>
                                <p className="text-lg font-semibold text-green-600 mt-1">
                                  {formatCurrency(deal.value)}
                                </p>
                              </div>
                              
                              <div>
                                <Label className="text-sm font-medium text-slate-700">Prioridade</Label>
                                <Badge className={`mt-1 ${getPriorityColor(deal.priority)}`}>
                                  {deal.priority === 'high' ? 'Alta' : deal.priority === 'medium' ? 'Média' : 'Baixa'}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="space-y-4">
                              <div>
                                <Label className="text-sm font-medium text-slate-700">Data de Criação</Label>
                                <p className="text-slate-600 mt-1">
                                  {new Date(deal.createdAt).toLocaleDateString('pt-BR')}
                                </p>
                              </div>
                              
                              {deal.contact && (
                                <div>
                                  <Label className="text-sm font-medium text-slate-700">Contato</Label>
                                  <p className="text-slate-600 mt-1">{deal.contact}</p>
                                </div>
                              )}
                              
                              {deal.confidential && (
                                <div>
                                  <Label className="text-sm font-medium text-slate-700">Informações Confidenciais</Label>
                                  <p className="text-slate-600 mt-1 italic">{deal.confidential}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="client" className="space-y-4">
                          {deal.client ? (
                            <div className="bg-slate-50 rounded-lg p-6">
                              <div className="flex items-start space-x-4">
                                <Avatar className="w-16 h-16">
                                  <AvatarFallback className="text-lg">
                                    {deal.client.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                
                                <div className="flex-1 space-y-3">
                                  <div>
                                    <h3 className="text-lg font-semibold text-slate-900">{deal.client.name}</h3>
                                    <p className="text-slate-600">{deal.client.company}</p>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center space-x-2">
                                      <Mail className="w-4 h-4 text-slate-400" />
                                      <span className="text-sm text-slate-600">{deal.client.email}</span>
                                    </div>
                                    
                                    {deal.client.phone && (
                                      <div className="flex items-center space-x-2">
                                        <Phone className="w-4 h-4 text-slate-400" />
                                        <span className="text-sm text-slate-600">{deal.client.phone}</span>
                                      </div>
                                    )}
                                    
                                    <div className="flex items-center space-x-2">
                                      <Building2 className="w-4 h-4 text-slate-400" />
                                      <span className="text-sm text-slate-600">{deal.client.company}</span>
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                      <User className="w-4 h-4 text-slate-400" />
                                      <Badge variant="outline" className="text-xs">
                                        {deal.client.status === 'prospect' ? 'Prospect' :
                                         deal.client.status === 'qualified' ? 'Qualificado' :
                                         deal.client.status === 'client' ? 'Cliente' : 'Inativo'}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-8 text-slate-500">
                              <User className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                              <p>Nenhum cliente associado a este deal</p>
                            </div>
                          )}
                        </TabsContent>
                        
                        <TabsContent value="notes" className="space-y-4">
                          <div className="text-center py-8 text-slate-500">
                            <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                            <p>Nenhuma nota adicionada ainda</p>
                            <Button variant="outline" className="mt-4">
                              <Plus className="w-4 h-4 mr-2" />
                              Adicionar Nota
                            </Button>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </DialogContent>
                  </Dialog>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KanbanBoard;
