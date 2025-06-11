import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Plus,
  MoreVertical,
  Edit,
  Trash,
  Eye,
  EyeOff,
  Check,
  X,
  Building2,
  Laptop,
  Zap,
  Store,
  Factory,
  Smartphone,
  Globe,
  Heart,
  Shield,
  Truck
} from "lucide-react";
import { 
  Pipeline, 
  Stage, 
  Deal, 
  Client,
  convertDatabaseClientToClient,
  convertDatabaseDealToDeal,
  DatabaseClient,
  DatabaseDeal,
  DatabaseNote,
  DatabaseStage,
  DatabasePipeline
} from "@/types/database";

const KanbanBoard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isClientView = user?.role === 'client';
  
  // State management
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedPipeline, setSelectedPipeline] = useState<string>("");
  const [loading, setLoading] = useState(true);
  
  // UI state
  const [editingConfidential, setEditingConfidential] = useState<string | null>(null);
  const [tempConfidentialValue, setTempConfidentialValue] = useState<string>("");
  const [editingStage, setEditingStage] = useState<string | null>(null);
  const [tempStageTitle, setTempStageTitle] = useState<string>("");
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [tempCardData, setTempCardData] = useState<Partial<Deal>>({});
  const [addingStage, setAddingStage] = useState<boolean>(false);
  const [newStageTitle, setNewStageTitle] = useState<string>("");
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState<boolean>(false);
  const [newNote, setNewNote] = useState<string>("");
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  // Editing states
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const [editingDescription, setEditingDescription] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string | null>(null);
  const [tempTitle, setTempTitle] = useState<string>("");
  const [tempDescription, setTempDescription] = useState<string>("");
  const [tempValue, setTempValue] = useState<string>("");

  // Dialog states
  const [isAddClientDialogOpen, setIsAddClientDialogOpen] = useState<boolean>(false);
  const [newClientData, setNewClientData] = useState({
    name: "",
    company: "",
    email: "",
    phone: ""
  });

  const [isAddPipelineDialogOpen, setIsAddPipelineDialogOpen] = useState<boolean>(false);
  const [newPipelineData, setNewPipelineData] = useState({
    name: ""
  });
  const [editingPipeline, setEditingPipeline] = useState<string | null>(null);
  const [tempPipelineName, setTempPipelineName] = useState<string>("");

  const [isAddDealDialogOpen, setIsAddDealDialogOpen] = useState<boolean>(false);
  const [newDealData, setNewDealData] = useState<{
    title: string;
    description: string;
    client_id: string;
    contact: string;
    priority: "low" | "medium" | "high";
    stage_id: string;
  }>({
    title: "",
    description: "",
    client_id: "",
    contact: "",
    priority: "low",
    stage_id: ""
  });

  // Load data from Supabase
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Load clients
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (clientsError) throw clientsError;
      
      // Convert database clients to frontend clients
      const convertedClients = (clientsData || []).map(convertDatabaseClientToClient);
      setClients(convertedClients);

      // Load pipelines with stages and deals
      const { data: pipelinesData, error: pipelinesError } = await supabase
        .from('pipelines')
        .select(`
          *,
          stages (
            *,
            deals (
              *,
              notes (*)
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (pipelinesError) throw pipelinesError;
      
      // Convert database pipelines to frontend pipelines
      const formattedPipelines: Pipeline[] = (pipelinesData || []).map((pipeline: DatabasePipeline & { stages: (DatabaseStage & { deals: (DatabaseDeal & { notes: DatabaseNote[] })[] })[] }) => ({
        id: pipeline.id,
        name: pipeline.name,
        user_id: pipeline.user_id,
        stages: (pipeline.stages || [])
          .sort((a, b) => a.position - b.position)
          .map((stage): Stage => ({
            id: stage.id,
            title: stage.title,
            pipeline_id: stage.pipeline_id,
            position: stage.position,
            deals: (stage.deals || [])
              .sort((a, b) => a.position - b.position)
              .map((deal): Deal => convertDatabaseDealToDeal(deal))
          }))
      }));

      setPipelines(formattedPipelines);
      
      if (formattedPipelines.length > 0 && !selectedPipeline) {
        setSelectedPipeline(formattedPipelines[0].id);
      }
      
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const currentPipeline = pipelines.find(p => p.id === selectedPipeline) || {
    id: "",
    name: "",
    stages: [],
    user_id: ""
  };

  // Helper functions
  const getClientDisplayInfo = (deal: Deal) => {
    if (deal.client) {
      return {
        name: deal.client.name,
        company: deal.client.company,
        avatar: deal.client.avatar || ""
      };
    }
    return {
      name: deal.contact || "Contato não informado",
      company: "Empresa não informada",
      avatar: ""
    };
  };

  const getCompanyIcon = (companyName: string) => {
    const name = companyName.toLowerCase();
    if (name.includes('tech') || name.includes('software') || name.includes('digital')) {
      return <Laptop className="h-4 w-4 text-blue-600" />;
    }
    if (name.includes('corp') || name.includes('corporation') || name.includes('enterprise')) {
      return <Building2 className="h-4 w-4 text-gray-600" />;
    }
    if (name.includes('startup') || name.includes('innovation')) {
      return <Zap className="h-4 w-4 text-yellow-600" />;
    }
    if (name.includes('store') || name.includes('shop') || name.includes('retail')) {
      return <Store className="h-4 w-4 text-green-600" />;
    }
    if (name.includes('factory') || name.includes('manufacturing') || name.includes('industrial')) {
      return <Factory className="h-4 w-4 text-orange-600" />;
    }
    if (name.includes('mobile') || name.includes('app') || name.includes('device')) {
      return <Smartphone className="h-4 w-4 text-purple-600" />;
    }
    if (name.includes('web') || name.includes('internet') || name.includes('online')) {
      return <Globe className="h-4 w-4 text-indigo-600" />;
    }
    if (name.includes('health') || name.includes('medical') || name.includes('care')) {
      return <Heart className="h-4 w-4 text-red-600" />;
    }
    if (name.includes('security') || name.includes('safe') || name.includes('protect')) {
      return <Shield className="h-4 w-4 text-emerald-600" />;
    }
    if (name.includes('transport') || name.includes('delivery') || name.includes('logistics')) {
      return <Truck className="h-4 w-4 text-cyan-600" />;
    }

    // Default icon for general business
    return <Building2 className="h-4 w-4 text-gray-600" />;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "high": return "Alta";
      case "medium": return "Média";
      case "low": return "Baixa";
      default: return priority;
    }
  };

  const getFormattedValue = (value: number | undefined) => {
    if (value === undefined || value === null || isNaN(value)) {
      return "R$ 0,00";
    }
    return `R$ ${value.toLocaleString('pt-BR')}`;
  };

  // CRUD operations
  const handleAddNewClient = async () => {
    if (!newClientData.name || !newClientData.company || !newClientData.email || !user) {
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert([{
          name: newClientData.name,
          company: newClientData.company,
          email: newClientData.email,
          phone: newClientData.phone,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      const convertedClient = convertDatabaseClientToClient(data);
      setClients(prev => [convertedClient, ...prev]);
      setNewClientData({ name: "", company: "", email: "", phone: "" });
      setIsAddClientDialogOpen(false);
      
      toast({
        title: "Sucesso",
        description: "Cliente adicionado com sucesso"
      });
    } catch (error) {
      console.error('Error adding client:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar cliente",
        variant: "destructive"
      });
    }
  };

  const handleEditTitle = (dealId: string) => {
    const deal = currentPipeline.stages
      .flatMap(stage => stage.deals)
      .find(deal => deal.id === dealId);

    if (deal) {
      setTempTitle(deal.title);
      setEditingTitle(dealId);
    }
  };

  const handleSaveTitle = async (dealId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('deals')
        .update({ title: tempTitle })
        .eq('id', dealId)
        .eq('user_id', user.id);

      if (error) throw error;

      setPipelines(prevPipelines => {
        return prevPipelines.map(pipeline => ({
          ...pipeline,
          stages: pipeline.stages.map(stage => ({
            ...stage,
            deals: stage.deals.map(deal => {
              if (deal.id === dealId) {
                return { ...deal, title: tempTitle };
              }
              return deal;
            })
          }))
        }));
      });

      setEditingTitle(null);
      toast({
        title: "Sucesso",
        description: "Título atualizado com sucesso"
      });
    } catch (error) {
      console.error('Error updating title:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar título",
        variant: "destructive"
      });
    }
  };

  const handleCancelTitleEdit = () => {
    setEditingTitle(null);
  };

  const handleEditDescription = (dealId: string) => {
    const deal = currentPipeline.stages
      .flatMap(stage => stage.deals)
      .find(deal => deal.id === dealId);

    if (deal) {
      setTempDescription(deal.description || "");
      setEditingDescription(dealId);
    }
  };

  const handleSaveDescription = async (dealId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('deals')
        .update({ description: tempDescription })
        .eq('id', dealId)
        .eq('user_id', user.id);

      if (error) throw error;

      setPipelines(prevPipelines => {
        return prevPipelines.map(pipeline => ({
          ...pipeline,
          stages: pipeline.stages.map(stage => ({
            ...stage,
            deals: stage.deals.map(deal => {
              if (deal.id === dealId) {
                return { ...deal, description: tempDescription };
              }
              return deal;
            })
          }))
        }));
      });

      setEditingDescription(null);
      toast({
        title: "Sucesso",
        description: "Descrição atualizada com sucesso"
      });
    } catch (error) {
      console.error('Error updating description:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar descrição",
        variant: "destructive"
      });
    }
  };

  const handleCancelDescriptionEdit = () => {
    setEditingDescription(null);
  };

  const handleEditValue = (dealId: string) => {
    const deal = currentPipeline.stages
      .flatMap(stage => stage.deals)
      .find(deal => deal.id === dealId);

    if (deal) {
      setTempValue(deal.value?.toString() || "");
      setEditingValue(dealId);
    }
  };

  const handleSaveValue = async (dealId: string) => {
    if (!user) return;

    try {
      const parsedValue = parseFloat(tempValue);
      if (isNaN(parsedValue)) {
        toast({
          title: "Erro",
          description: "Valor inválido",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('deals')
        .update({ value: parsedValue })
        .eq('id', dealId)
        .eq('user_id', user.id);

      if (error) throw error;

      setPipelines(prevPipelines => {
        return prevPipelines.map(pipeline => ({
          ...pipeline,
          stages: pipeline.stages.map(stage => ({
            ...stage,
            deals: stage.deals.map(deal => {
              if (deal.id === dealId) {
                return { ...deal, value: parsedValue };
              }
              return deal;
            })
          }))
        }));
      });

      setEditingValue(null);
      toast({
        title: "Sucesso",
        description: "Valor atualizado com sucesso"
      });
    } catch (error) {
      console.error('Error updating value:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar valor",
        variant: "destructive"
      });
    }
  };

  const handleCancelValueEdit = () => {
    setEditingValue(null);
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando pipeline...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">
              {isClientView ? "Meus Projetos" : "Pipeline de Vendas"}
            </h2>
            <p className="text-slate-600">
              {isClientView ? "Acompanhe o progresso dos seus projetos" : "Gerencie seus deals e oportunidades"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {pipelines.length > 0 && (
            <Select value={selectedPipeline} onValueChange={setSelectedPipeline}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Selecionar pipeline" />
              </SelectTrigger>
              <SelectContent>
                {pipelines.map((pipeline) => (
                  <SelectItem key={pipeline.id} value={pipeline.id}>
                    {pipeline.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          {!isClientView && (
            <>
              <Dialog open={isAddClientDialogOpen} onOpenChange={setIsAddClientDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Cliente
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Novo Cliente</DialogTitle>
                    <DialogDescription>
                      Preencha as informações do cliente
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Nome</Label>
                      <Input
                        id="name"
                        value={newClientData.name}
                        onChange={(e) => setNewClientData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Nome do cliente"
                      />
                    </div>
                    <div>
                      <Label htmlFor="company">Empresa</Label>
                      <Input
                        id="company"
                        value={newClientData.company}
                        onChange={(e) => setNewClientData(prev => ({ ...prev, company: e.target.value }))}
                        placeholder="Nome da empresa"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newClientData.email}
                        onChange={(e) => setNewClientData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="email@exemplo.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        value={newClientData.phone}
                        onChange={(e) => setNewClientData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddClientDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleAddNewClient}>
                      Adicionar Cliente
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>

      {pipelines.length === 0 ? (
        <Card className="mt-6">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {isClientView ? "Nenhum projeto encontrado" : "Nenhum pipeline encontrado"}
              </h3>
              <p className="text-gray-500 mb-4">
                {isClientView 
                  ? "Você ainda não tem projetos atribuídos" 
                  : "Comece criando seu primeiro pipeline de vendas"
                }
              </p>
              {!isClientView && (
                <Dialog open={isAddPipelineDialogOpen} onOpenChange={setIsAddPipelineDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Pipeline
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Criar Novo Pipeline</DialogTitle>
                      <DialogDescription>
                        Defina um nome para seu pipeline de vendas
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="pipeline-name">Nome do Pipeline</Label>
                        <Input
                          id="pipeline-name"
                          value={newPipelineData.name}
                          onChange={(e) => setNewPipelineData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Ex: Vendas B2B, Prospecção, etc."
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddPipelineDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={() => console.log('Create pipeline')}>
                        Criar Pipeline
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-6 flex-1 overflow-x-auto">
          <div className="flex gap-6 pb-6 min-w-max">
            {currentPipeline.stages.map((stage) => (
              <div key={stage.id} className="flex-shrink-0 w-80">
                <div className="bg-gray-50 rounded-lg p-4 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">{stage.title}</h3>
                    <Badge variant="secondary">{stage.deals.length}</Badge>
                  </div>
                  
                  <div className="space-y-3">
                    {stage.deals.map((deal) => {
                      const clientInfo = getClientDisplayInfo(deal);
                      return (
                        <Card key={deal.id} className="hover:shadow-md transition-shadow cursor-pointer">
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <div className="flex items-start justify-between">
                                <h4 className="font-medium text-sm text-gray-900 line-clamp-2">
                                  {deal.title}
                                </h4>
                                <Badge className={`text-xs ${getPriorityColor(deal.priority)}`}>
                                  {getPriorityLabel(deal.priority)}
                                </Badge>
                              </div>
                              
                              {deal.description && (
                                <p className="text-xs text-gray-600 line-clamp-2">
                                  {deal.description}
                                </p>
                              )}
                              
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={clientInfo.avatar} />
                                  <AvatarFallback className="text-xs">
                                    {clientInfo.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1">
                                    {getCompanyIcon(clientInfo.company)}
                                    <span className="text-xs text-gray-600 truncate">
                                      {clientInfo.company}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-500 truncate">
                                    {clientInfo.name}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-green-600">
                                  {getFormattedValue(deal.value)}
                                </span>
                                {deal.notes.length > 0 && (
                                  <Badge variant="outline" className="text-xs">
                                    {deal.notes.length} nota{deal.notes.length !== 1 ? 's' : ''}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default KanbanBoard;
