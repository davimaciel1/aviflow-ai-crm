import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  MoreVertical,
  Edit,
  Trash2,
  Plus,
  Check,
  X,
  GripVertical,
  AlertTriangle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/AuthContext";

interface Deal {
  id: string;
  title: string;
  description: string;
  value: number;
  stageId: string;
  clientId: string;
  client: string;
  companyName: string;
  contact: string;
  avatar?: string;
}

interface Stage {
  id: string;
  name: string;
  deals: Deal[];
}

interface Pipeline {
  id: string;
  name: string;
  stages: Stage[];
}

interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: "active" | "inactive" | "prospect";
  totalValue: number;
  projectsCount: number;
  lastContact: string;
  address?: string;
  notes?: string;
  avatar?: string;
}

const KanbanBoard = () => {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [activePipelineId, setActivePipelineId] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [tempCardData, setTempCardData] = useState<Partial<Deal>>({});
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newCardData, setNewCardData] = useState<Partial<Deal>>({});
  const { user } = useAuth();
  const { toast } = useToast()

  useEffect(() => {
    const savedPipelines = localStorage.getItem('daviflow_pipelines');
    if (savedPipelines) {
      setPipelines(JSON.parse(savedPipelines));
    } else {
      loadDefaultPipeline();
    }

    const savedClients = localStorage.getItem('daviflow_clients');
    if (savedClients) {
      try {
        setClients(JSON.parse(savedClients));
      } catch (error) {
        console.error('Erro ao carregar clientes:', error);
        loadDefaultClients();
      }
    } else {
      loadDefaultClients();
    }
  }, []);

  useEffect(() => {
    if (pipelines.length > 0) {
      localStorage.setItem('daviflow_pipelines', JSON.stringify(pipelines));
      if (!activePipelineId) {
        setActivePipelineId(pipelines[0].id);
      }
    }
  }, [pipelines, activePipelineId]);

  const loadDefaultPipeline = () => {
    const defaultPipeline: Pipeline[] = [{
      id: "1",
      name: "Pipeline Padrão",
      stages: [
        {
          id: "s1",
          name: "Prospecção",
          deals: [
            {
              id: "d1",
              title: "Contato inicial com o cliente",
              description: "Agendar reunião de apresentação",
              value: 1000,
              stageId: "s1",
              clientId: "1",
              client: "TechCorp Ltd",
              companyName: "TechCorp Ltd",
              contact: "João Silva",
              avatar: "/placeholder-avatar.jpg"
            }
          ]
        },
        {
          id: "s2",
          name: "Qualificação",
          deals: [
            {
              id: "d2",
              title: "Entendimento das necessidades",
              description: "Análise detalhada dos requisitos",
              value: 2500,
              stageId: "s2",
              clientId: "2",
              client: "StartupXYZ",
              companyName: "StartupXYZ",
              contact: "Maria Santos",
              avatar: "/placeholder-avatar.jpg"
            }
          ]
        },
        {
          id: "s3",
          name: "Proposta",
          deals: [
            {
              id: "d3",
              title: "Apresentação da proposta",
              description: "Discussão dos termos e condições",
              value: 5000,
              stageId: "s3",
              clientId: "1",
              client: "TechCorp Ltd",
              companyName: "TechCorp Ltd",
              contact: "João Silva",
              avatar: "/placeholder-avatar.jpg"
            }
          ]
        },
        {
          id: "s4",
          name: "Fechamento",
          deals: [
            {
              id: "d4",
              title: "Negociação final e assinatura",
              description: "Preparar contrato e coletar assinaturas",
              value: 10000,
              stageId: "s4",
              clientId: "2",
              client: "StartupXYZ",
              companyName: "StartupXYZ",
              contact: "Maria Santos",
              avatar: "/placeholder-avatar.jpg"
            }
          ]
        }
      ]
    }];
    setPipelines(defaultPipeline);
    setActivePipelineId(defaultPipeline[0].id);
  };

  const loadDefaultClients = () => {
    const defaultClients: Client[] = [
      {
        id: "1",
        name: "João Silva",
        company: "TechCorp Ltd",
        email: "joao@techcorp.com",
        phone: "(11) 99999-0001",
        status: "active",
        totalValue: 45000,
        projectsCount: 3,
        lastContact: "2024-06-08",
        address: "São Paulo, SP",
        notes: "Cliente premium, sempre pontual nos pagamentos.",
        avatar: "/placeholder-avatar.jpg"
      },
      {
        id: "2",
        name: "Maria Santos",
        company: "StartupXYZ",
        email: "maria@startupxyz.com",
        phone: "(11) 99999-0002",
        status: "active",
        totalValue: 28000,
        projectsCount: 2,
        lastContact: "2024-06-09",
        address: "Rio de Janeiro, RJ",
        notes: "Startup em crescimento, muito engajada no projeto.",
        avatar: "/placeholder-avatar.jpg"
      },
      {
        id: "3",
        name: "Pedro Oliveira",
        company: "ABC Corporation",
        email: "pedro@abccorp.com",
        phone: "(11) 99999-0003",
        status: "prospect",
        totalValue: 0,
        projectsCount: 0,
        lastContact: "2024-06-10",
        address: "Belo Horizonte, MG",
        notes: "Interessado em consultoria digital.",
        avatar: "/placeholder-avatar.jpg"
      }
    ];
    setClients(defaultClients);
  };

  const handleEditCard = (deal: Deal) => {
    setEditingCard(deal.id);
    setTempCardData({ ...deal });
  };

  const handleSaveCard = () => {
    if (!editingCard || !tempCardData) return;

    const dealId = editingCard;
    
    setPipelines(prev => prev.map(pipeline => {
      if (pipeline.id === activePipelineId) {
        const newStages = pipeline.stages.map(stage => {
          const newDeals = stage.deals.map(deal => {
            if (deal.id === dealId) {
              // Get the selected client data
              const selectedClient = clients.find(c => c.id === tempCardData.clientId);
              
              return { 
                ...deal, 
                ...tempCardData,
                // Ensure client data is properly updated
                client: selectedClient?.company || tempCardData.client || deal.client,
                companyName: selectedClient?.company || tempCardData.companyName || deal.companyName,
                contact: selectedClient?.name || tempCardData.contact || deal.contact,
                avatar: selectedClient?.avatar || tempCardData.avatar || deal.avatar
              };
            }
            return deal;
          });
          return { ...stage, deals: newDeals };
        });
        return { ...pipeline, stages: newStages };
      }
      return pipeline;
    }));

    setEditingCard(null);
    setTempCardData({});
  };

  const handleCancelEdit = () => {
    setEditingCard(null);
    setTempCardData({});
  };

  const handleDeleteCard = (dealId: string, stageId: string) => {
    if (window.confirm("Tem certeza que deseja excluir este deal?")) {
      setPipelines(prev => prev.map(pipeline => {
        if (pipeline.id === activePipelineId) {
          const newStages = pipeline.stages.map(stage => {
            if (stage.id === stageId) {
              const newDeals = stage.deals.filter(deal => deal.id !== dealId);
              return { ...stage, deals: newDeals };
            }
            return stage;
          });
          return { ...pipeline, stages: newStages };
        }
        return pipeline;
      }));
    }
  };

  const handleCreateCard = () => {
    if (!activePipelineId) return;

    const activePipeline = pipelines.find(pipeline => pipeline.id === activePipelineId);
    if (!activePipeline) return;

    const firstStageId = activePipeline.stages[0].id;

    if (!newCardData.title || !newCardData.description || !newCardData.value) {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    const newDeal: Deal = {
      id: Date.now().toString(),
      title: newCardData.title || "",
      description: newCardData.description || "",
      value: newCardData.value || 0,
      stageId: firstStageId,
      clientId: newCardData.clientId || "",
      client: newCardData.client || "",
      companyName: newCardData.companyName || "",
      contact: newCardData.contact || "",
      avatar: newCardData.avatar || ""
    };

    setPipelines(prev => prev.map(pipeline => {
      if (pipeline.id === activePipelineId) {
        const newStages = pipeline.stages.map(stage => {
          if (stage.id === firstStageId) {
            return { ...stage, deals: [...stage.deals, newDeal] };
          }
          return stage;
        });
        return { ...pipeline, stages: newStages };
      }
      return pipeline;
    }));

    setNewCardData({});
    setIsCreateDialogOpen(false);
  };

  const moveCard = (dealId: string, sourceStageId: string, destinationStageId: string) => {
    setPipelines(prev => prev.map(pipeline => {
      if (pipeline.id === activePipelineId) {
        const newStages = pipeline.stages.map(stage => {
          if (stage.id === sourceStageId) {
            const dealToMoveIndex = stage.deals.findIndex(deal => deal.id === dealId);
            if (dealToMoveIndex === -1) return stage;
            const dealToMove = stage.deals[dealToMoveIndex];
            const newDeals = [...stage.deals.slice(0, dealToMoveIndex), ...stage.deals.slice(dealToMoveIndex + 1)];
            return { ...stage, deals: newDeals };
          } else if (stage.id === destinationStageId) {
            const activePipeline = pipelines.find(pipeline => pipeline.id === activePipelineId);
            if (!activePipeline) return stage;

            const sourceStage = activePipeline.stages.find(stage => stage.id === sourceStageId);
            if (!sourceStage) return stage;

            const dealToMove = sourceStage.deals.find(deal => deal.id === dealId);
            if (!dealToMove) return stage;

            dealToMove.stageId = destinationStageId;
            return { ...stage, deals: [...stage.deals, dealToMove] };
          }
          return stage;
        });
        return { ...pipeline, stages: newStages };
      }
      return pipeline;
    }));
  };

  const getStageName = (stageId: string) => {
    const activePipeline = pipelines.find(pipeline => pipeline.id === activePipelineId);
    if (!activePipeline) return "Stage not found";

    const stage = activePipeline.stages.find(stage => stage.id === stageId);
    if (!stage) return "Stage not found";

    return stage.name;
  };

  const getTotalDealsInStage = (stageId: string) => {
    const activePipeline = pipelines.find(pipeline => pipeline.id === activePipelineId);
    if (!activePipeline) return 0;

    const stage = activePipeline.stages.find(stage => stage.id === stageId);
    if (!stage) return 0;

    return stage.deals.length;
  };

  const getFormattedValue = (value: number | undefined) => {
    if (value === undefined || value === null || isNaN(value)) {
      return "R$ 0,00";
    }
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const activePipeline = pipelines.find(pipeline => pipeline.id === activePipelineId);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Pipeline de Vendas</h2>
          <p className="text-slate-600">Acompanhe seus deals em cada etapa do funil</p>
        </div>
        <Select value={activePipelineId || ""} onValueChange={setActivePipelineId}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Selecione um pipeline" />
          </SelectTrigger>
          <SelectContent>
            {pipelines.map((pipeline) => (
              <SelectItem key={pipeline.id} value={pipeline.id}>
                {pipeline.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-4">
        {activePipeline?.stages.map((stage) => (
          <div key={stage.id} className="min-w-[300px] flex-shrink-0">
            <div className="bg-slate-100 rounded-md p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-800">{stage.name}</h3>
                <Badge variant="secondary">{stage.deals.length} deals</Badge>
              </div>

              <div className="space-y-3">
                {stage.deals.map((deal) => {
                  // Find the client data for this deal
                  const dealClient = clients.find(c => c.id === deal.clientId);
                  
                  return (
                    <Card key={deal.id} className="cursor-pointer hover:shadow-md transition-shadow bg-white">
                      <div
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('dealId', deal.id);
                          e.dataTransfer.setData('sourceStageId', stage.id);
                        }}
                        className="relative"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3 flex-1">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={dealClient?.avatar || deal.avatar} />
                                <AvatarFallback className="bg-blue-100 text-blue-600 text-xs font-semibold">
                                  {(dealClient?.company || deal.client || deal.companyName || "??")
                                    .split(' ')
                                    .map(n => n[0])
                                    .join('')
                                    .toUpperCase()
                                    .slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <h4 className="font-semibold text-sm text-slate-800 line-clamp-1">
                                  {deal.title}
                                </h4>
                                <p className="text-xs text-slate-600 line-clamp-1">
                                  {dealClient?.company || deal.client || deal.companyName}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {dealClient?.name || deal.contact}
                                </p>
                              </div>
                            </div>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-6 w-6 p-0 rounded-md hover:bg-slate-100">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" forceMount>
                                <DropdownMenuItem onClick={() => handleEditCard(deal)}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDeleteCard(deal.id, stage.id)} className="text-red-600">
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          <div className="flex items-center justify-between text-xs text-slate-600">
                            <span>{getFormattedValue(deal.value)}</span>
                            <Badge variant="outline">
                              {stage.name}
                            </Badge>
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  );
                })}
                
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setIsCreateDialogOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Deal
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Deal</DialogTitle>
            <DialogDescription>
              Adicione um novo negócio ao pipeline
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Título</label>
              <Input
                value={newCardData.title || ""}
                onChange={(e) => setNewCardData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Nome do negócio"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Cliente</label>
              <Select
                value={newCardData.clientId || ""}
                onValueChange={(value) => {
                  const selectedClient = clients.find(c => c.id === value);
                  setNewCardData({
                    ...newCardData,
                    clientId: value,
                    client: selectedClient?.company || "",
                    companyName: selectedClient?.company || "",
                    contact: selectedClient?.name || "",
                    avatar: selectedClient?.avatar || ""
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={client.avatar} />
                          <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                            {client.company.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{client.company}</div>
                          <div className="text-xs text-muted-foreground">{client.name}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Descrição</label>
              <Textarea
                value={newCardData.description || ""}
                onChange={(e) => setNewCardData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Detalhes do negócio"
                className="min-h-[80px]"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Valor (R$)</label>
              <Input
                type="number"
                value={newCardData.value || ""}
                onChange={(e) => setNewCardData(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                placeholder="Valor estimado do negócio"
              />
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button onClick={handleCreateCard} className="flex-1">
              <Check className="w-4 h-4 mr-2" />
              Criar Deal
            </Button>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="flex-1">
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Deal Dialog */}
      <Dialog open={!!editingCard} onOpenChange={() => setEditingCard(null)}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Deal</DialogTitle>
            <DialogDescription>
              Atualize as informações do negócio
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Título</label>
              <Input
                value={tempCardData.title || ""}
                onChange={(e) => setTempCardData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Nome do negócio"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Cliente</label>
              <Select
                value={tempCardData.clientId || ""}
                onValueChange={(value) => {
                  const selectedClient = clients.find(c => c.id === value);
                  console.log('Cliente selecionado:', selectedClient);
                  setTempCardData({
                    ...tempCardData,
                    clientId: value,
                    client: selectedClient?.company || "",
                    companyName: selectedClient?.company || "",
                    contact: selectedClient?.name || "",
                    avatar: selectedClient?.avatar || ""
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={client.avatar} />
                          <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                            {client.company.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{client.company}</div>
                          <div className="text-xs text-muted-foreground">{client.name}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Descrição</label>
              <Textarea
                value={tempCardData.description || ""}
                onChange={(e) => setTempCardData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Detalhes do negócio"
                className="min-h-[80px]"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Valor (R$)</label>
              <Input
                type="number"
                value={tempCardData.value || ""}
                onChange={(e) => setTempCardData(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                placeholder="Valor estimado do negócio"
              />
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button onClick={handleSaveCard} className="flex-1">
              <Check className="w-4 h-4 mr-2" />
              Salvar Deal
            </Button>
            <Button variant="outline" onClick={handleCancelEdit} className="flex-1">
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KanbanBoard;

}
