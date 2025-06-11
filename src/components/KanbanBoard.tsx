import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { 
  MoreHorizontal, 
  Plus, 
  Trash2, 
  Edit, 
  Check, 
  X, 
  ChevronDown, 
  ChevronRight,
  Clock,
  Calendar,
  User,
  Building2,
  Mail,
  Phone,
  AlertTriangle,
  Flag,
  MessageSquare,
  Lock,
  Unlock,
  PenSquare
} from "lucide-react";

interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: "active" | "inactive" | "prospect";
}

interface Note {
  id: string;
  text: string;
  date: string;
  author: string;
}

interface Deal {
  id: string;
  title: string;
  description?: string;
  client?: string;
  clientId?: string;
  companyName?: string;
  contact?: string;
  value?: number;
  priority: "low" | "medium" | "high";
  stageId: string;
  confidential?: string;
  notes?: Note[];
}

interface Stage {
  id: string;
  title: string;
  deals: Deal[];
}

interface Pipeline {
  id: string;
  name: string;
  stages: Stage[];
}

const KanbanBoard = () => {
  const { user } = useAuth();
  const isClientView = user?.role === 'client';
  const [editingConfidential, setEditingConfidential] = useState<string | null>(null);
  const [tempConfidentialValue, setTempConfidentialValue] = useState<string>("");
  const [editingStage, setEditingStage] = useState<string | null>(null);
  const [tempStageTitle, setTempStageTitle] = useState<string>("");
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [tempCardData, setTempCardData] = useState<Partial<Deal>>({});
  const [selectedPipeline, setSelectedPipeline] = useState<string>("sales");
  const [addingStage, setAddingStage] = useState<boolean>(false);
  const [newStageTitle, setNewStageTitle] = useState<string>("");
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState<boolean>(false);
  const [newNote, setNewNote] = useState<string>("");
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  
  // Novos estados para adicionar cliente
  const [isAddClientDialogOpen, setIsAddClientDialogOpen] = useState<boolean>(false);
  const [newClientData, setNewClientData] = useState({
    name: "",
    company: "",
    email: "",
    phone: ""
  });

  // Estados para gerenciar pipelines
  const [isAddPipelineDialogOpen, setIsAddPipelineDialogOpen] = useState<boolean>(false);
  const [newPipelineData, setNewPipelineData] = useState({
    name: ""
  });
  const [editingPipeline, setEditingPipeline] = useState<string | null>(null);
  const [tempPipelineName, setTempPipelineName] = useState<string>("");

  // Estados para novo deal
  const [isAddDealDialogOpen, setIsAddDealDialogOpen] = useState<boolean>(false);
  const [newDealData, setNewDealData] = useState<{
    title: string;
    description: string;
    clientId: string;
    contact: string;
    priority: "low" | "medium" | "high";
    stageId: string;
  }>({
    title: "",
    description: "",
    clientId: "",
    contact: "",
    priority: "low",
    stageId: ""
  });

  // Carregar clientes do localStorage
  const [clients, setClients] = useState<Client[]>([]);

  const getClientsFromStorage = () => {
    const savedClients = localStorage.getItem('daviflow_clients');
    if (savedClients) {
      try {
        return JSON.parse(savedClients);
      } catch (error) {
        console.error('Erro ao carregar clientes:', error);
        return [];
      }
    }
    return [];
  };

  useEffect(() => {
    setClients(getClientsFromStorage());
  }, []);

  const handleAddNewClient = () => {
    if (!newClientData.name || !newClientData.company || !newClientData.email) {
      return;
    }

    const newClient = {
      id: `client-${Date.now()}`,
      name: newClientData.name,
      company: newClientData.company,
      email: newClientData.email,
      phone: newClientData.phone,
      status: "prospect" as const
    };

    const updatedClients = [...clients, newClient];
    setClients(updatedClients);
    localStorage.setItem('daviflow_clients', JSON.stringify(updatedClients));

    setNewClientData({
      name: "",
      company: "",
      email: "",
      phone: ""
    });
    setIsAddClientDialogOpen(false);
  };

  // Carregar pipelines do localStorage ou usar padrão
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);

  useEffect(() => {
    const savedPipelines = localStorage.getItem('daviflow_pipelines');
    if (savedPipelines) {
      try {
        setPipelines(JSON.parse(savedPipelines));
      } catch (error) {
        console.error('Erro ao carregar pipelines:', error);
        loadDefaultPipelines();
      }
    } else {
      loadDefaultPipelines();
    }
  }, []);

  // Salvar no localStorage sempre que pipelines mudar
  useEffect(() => {
    if (pipelines.length > 0) {
      localStorage.setItem('daviflow_pipelines', JSON.stringify(pipelines));
    }
  }, [pipelines]);

  const loadDefaultPipelines = () => {
    const defaultPipelines: Pipeline[] = [
      {
        id: "sales",
        name: "Pipeline de Vendas",
        stages: [
          {
            id: "prospecting",
            title: "Prospecção",
            deals: [
              {
                id: "deal1",
                title: "Website para TechCorp",
                description: "Desenvolvimento de website corporativo com CMS",
                client: "TechCorp Ltd",
                clientId: "1",
                companyName: "TechCorp Ltd",
                contact: "João Silva",
                value: 45000,
                priority: "high",
                stageId: "prospecting",
                notes: [
                  {
                    id: "note1",
                    text: "Cliente interessado em iniciar em agosto",
                    date: "2024-06-08",
                    author: "Ana Souza"
                  }
                ]
              },
              {
                id: "deal2",
                title: "Consultoria SEO",
                description: "Otimização de mecanismos de busca",
                client: "StartupXYZ",
                clientId: "2",
                companyName: "StartupXYZ",
                contact: "Maria Santos",
                value: 12000,
                priority: "medium",
                stageId: "prospecting",
                notes: []
              }
            ]
          },
          {
            id: "qualification",
            title: "Qualificação",
            deals: [
              {
                id: "deal3",
                title: "App Mobile",
                description: "Aplicativo iOS e Android para delivery",
                client: "ABC Corporation",
                clientId: "3",
                companyName: "ABC Corporation",
                contact: "Pedro Oliveira",
                value: 85000,
                priority: "high",
                stageId: "qualification",
                confidential: "Orçamento máximo de R$ 100.000",
                notes: []
              }
            ]
          },
          {
            id: "proposal",
            title: "Proposta",
            deals: []
          },
          {
            id: "closing",
            title: "Fechamento",
            deals: [
              {
                id: "deal4",
                title: "Manutenção de Sistemas",
                description: "Contrato anual de manutenção",
                client: "TechCorp Ltd",
                clientId: "1",
                companyName: "TechCorp Ltd",
                contact: "João Silva",
                value: 36000,
                priority: "low",
                stageId: "closing",
                notes: []
              }
            ]
          }
        ]
      },
      {
        id: "projects",
        name: "Projetos Ativos",
        stages: [
          {
            id: "planning",
            title: "Planejamento",
            deals: []
          },
          {
            id: "execution",
            title: "Execução",
            deals: [
              {
                id: "project1",
                title: "Redesign de Marca",
                description: "Atualização de identidade visual",
                client: "StartupXYZ",
                clientId: "2",
                companyName: "StartupXYZ",
                contact: "Maria Santos",
                value: 18000,
                priority: "medium",
                stageId: "execution",
                notes: []
              }
            ]
          },
          {
            id: "review",
            title: "Revisão",
            deals: []
          },
          {
            id: "delivered",
            title: "Entregue",
            deals: []
          }
        ]
      }
    ];
    setPipelines(defaultPipelines);
  };

  const currentPipeline = pipelines.find(p => p.id === selectedPipeline) || {
    id: "",
    name: "",
    stages: []
  };

  const toggleExpanded = (dealId: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dealId)) {
        newSet.delete(dealId);
      } else {
        newSet.add(dealId);
      }
      return newSet;
    });
  };

  const handleDragEnd = (result: any) => {
    const { source, destination, draggableId } = result;
    
    // Dropped outside the list
    if (!destination) {
      return;
    }
    
    // Dropped in the same position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }
    
    // Find the deal that was dragged
    let draggedDeal: Deal | undefined;
    let sourceStageIndex = -1;
    
    currentPipeline.stages.forEach((stage, stageIndex) => {
      const foundDealIndex = stage.deals.findIndex(deal => deal.id === draggableId);
      if (foundDealIndex !== -1) {
        draggedDeal = stage.deals[foundDealIndex];
        sourceStageIndex = stageIndex;
      }
    });
    
    if (!draggedDeal) return;
    
    // Create a new pipeline with the updated stages
    setPipelines(prevPipelines => {
      return prevPipelines.map(pipeline => {
        if (pipeline.id !== selectedPipeline) return pipeline;
        
        const newStages = [...pipeline.stages];
        
        // Remove from source
        const sourceDeals = [...newStages[sourceStageIndex].deals];
        const [removedDeal] = sourceDeals.splice(
          source.index,
          1
        );
        newStages[sourceStageIndex] = {
          ...newStages[sourceStageIndex],
          deals: sourceDeals
        };
        
        // Find destination stage index
        const destStageIndex = newStages.findIndex(
          stage => stage.id === destination.droppableId
        );
        
        // Add to destination
        const destDeals = [...newStages[destStageIndex].deals];
        destDeals.splice(
          destination.index,
          0,
          { ...removedDeal, stageId: destination.droppableId }
        );
        newStages[destStageIndex] = {
          ...newStages[destStageIndex],
          deals: destDeals
        };
        
        return { ...pipeline, stages: newStages };
      });
    });
  };

  // Helper function to get client display information
  const getClientDisplayInfo = (deal: Deal) => {
    // First try to find the client by clientId
    const clientFromStorage = clients.find(c => c.id === deal.clientId);
    
    if (clientFromStorage) {
      return {
        name: clientFromStorage.name,
        company: clientFromStorage.company,
        avatar: clientFromStorage.avatar
      };
    }
    
    // Fallback to deal's stored client data
    return {
      name: deal.contact || deal.client || "Contato não informado",
      company: deal.companyName || deal.client || "Empresa não informada",
      avatar: deal.avatar
    };
  };

  const handleEditStage = (stageId: string, currentTitle: string) => {
    setEditingStage(stageId);
    setTempStageTitle(currentTitle);
  };

  const handleSaveStage = () => {
    if (!editingStage || !tempStageTitle.trim()) return;

    setPipelines(prevPipelines => {
      return prevPipelines.map(pipeline => {
        if (pipeline.id !== selectedPipeline) return pipeline;

        const newStages = pipeline.stages.map(stage => {
          if (stage.id === editingStage) {
            return { ...stage, title: tempStageTitle };
          }
          return stage;
        });

        return { ...pipeline, stages: newStages };
      });
    });

    setEditingStage(null);
    setTempStageTitle("");
  };

  const handleCancelEditStage = () => {
    setEditingStage(null);
    setTempStageTitle("");
  };

  const handleAddStage = () => {
    if (!newStageTitle.trim()) return;

    const newStageId = `stage-${Date.now()}`;

    setPipelines(prevPipelines => {
      return prevPipelines.map(pipeline => {
        if (pipeline.id !== selectedPipeline) return pipeline;

        return {
          ...pipeline,
          stages: [
            ...pipeline.stages,
            {
              id: newStageId,
              title: newStageTitle,
              deals: []
            }
          ]
        };
      });
    });

    setAddingStage(false);
    setNewStageTitle("");
  };

  const handleDeleteStage = (stageId: string) => {
    if (window.confirm("Tem certeza que deseja excluir este estágio? Todos os deals serão removidos.")) {
      setPipelines(prevPipelines => {
        return prevPipelines.map(pipeline => {
          if (pipeline.id !== selectedPipeline) return pipeline;

          return {
            ...pipeline,
            stages: pipeline.stages.filter(stage => stage.id !== stageId)
          };
        });
      });
    }
  };

  const handleEditCard = (deal: Deal) => {
    setEditingCard(deal.id);
    // When editing, ensure we show the correct client data
    const clientInfo = getClientDisplayInfo(deal);
    setTempCardData({ 
      ...deal,
      contact: clientInfo.name,
      companyName: clientInfo.company,
      client: clientInfo.company
    });
    setIsEditDrawerOpen(true);
  };

  const handleSaveCard = (dealId: string) => {
    setPipelines(prevPipelines => {
      return prevPipelines.map(pipeline => {
        if (pipeline.id !== selectedPipeline) return pipeline;

        const newStages = pipeline.stages.map(stage => {
          const newDeals = stage.deals.map(deal => {
            if (deal.id === dealId) {
              // Get the selected client data
              const selectedClient = clients.find(c => c.id === tempCardData.clientId);
              
              return { 
                ...deal, 
                ...tempCardData,
                // Ensure client data is properly updated and synchronized
                client: selectedClient?.company || tempCardData.companyName || deal.client,
                companyName: selectedClient?.company || tempCardData.companyName || deal.companyName,
                contact: selectedClient?.name || tempCardData.contact || deal.contact
              };
            }
            return deal;
          });
          return { ...stage, deals: newDeals };
        });

        return { ...pipeline, stages: newStages };
      });
    });

    setEditingCard(null);
    setTempCardData({});
    setIsEditDrawerOpen(false);
  };

  const handleDeleteCard = (dealId: string) => {
    if (window.confirm("Tem certeza que deseja excluir este card?")) {
      setPipelines(prevPipelines => {
        return prevPipelines.map(pipeline => {
          if (pipeline.id !== selectedPipeline) return pipeline;

          const newStages = pipeline.stages.map(stage => {
            return {
              ...stage,
              deals: stage.deals.filter(deal => deal.id !== dealId)
            };
          });

          return { ...pipeline, stages: newStages };
        });
      });
    }
  };

  const handleEditConfidential = (dealId: string, currentValue: string = "") => {
    setEditingConfidential(dealId);
    setTempConfidentialValue(currentValue);
  };

  const handleSaveConfidential = (dealId: string, stageId: string) => {
    setPipelines(prevPipelines => {
      return prevPipelines.map(pipeline => {
        if (pipeline.id !== selectedPipeline) return pipeline;

        const newStages = pipeline.stages.map(stage => {
          if (stage.id !== stageId) return stage;

          const newDeals = stage.deals.map(deal => {
            if (deal.id === dealId) {
              return { ...deal, confidential: tempConfidentialValue };
            }
            return deal;
          });

          return { ...stage, deals: newDeals };
        });

        return { ...pipeline, stages: newStages };
      });
    });

    setEditingConfidential(null);
    setTempConfidentialValue("");
  };

  const handleCancelEditConfidential = () => {
    setEditingConfidential(null);
    setTempConfidentialValue("");
  };

  const handleAddNote = (dealId: string, stageId: string) => {
    if (!newNote.trim()) return;

    const note: Note = {
      id: `note-${Date.now()}`,
      text: newNote,
      date: new Date().toISOString().split('T')[0],
      author: user?.name || "Usuário"
    };

    setPipelines(prevPipelines => {
      return prevPipelines.map(pipeline => {
        if (pipeline.id !== selectedPipeline) return pipeline;

        const newStages = pipeline.stages.map(stage => {
          if (stage.id !== stageId) return stage;

          const newDeals = stage.deals.map(deal => {
            if (deal.id === dealId && deal.notes) {
              return { 
                ...deal, 
                notes: deal.notes.filter(note => note.id !== noteId)
              };
            }
            return deal;
          });

          return { ...stage, deals: newDeals };
        });

        return { ...pipeline, stages: newStages };
      });
    });

    setNewNote("");
  };

  const handleDeleteNote = (dealId: string, stageId: string, noteId: string) => {
    setPipelines(prevPipelines => {
      return prevPipelines.map(pipeline => {
        if (pipeline.id !== selectedPipeline) return pipeline;

        const newStages = pipeline.stages.map(stage => {
          if (stage.id !== stageId) return stage;

          const newDeals = stage.deals.map(deal => {
            if (deal.id === dealId && deal.notes) {
              return { 
                ...deal, 
                notes: deal.notes.filter(note => note.id !== noteId)
              };
            }
            return deal;
          });

          return { ...stage, deals: newDeals };
        });

        return { ...pipeline, stages: newStages };
      });
    });
  };

  const handleAddPipeline = () => {
    if (!newPipelineData.name.trim()) return;

    const newPipeline: Pipeline = {
      id: `pipeline-${Date.now()}`,
      name: newPipelineData.name,
      stages: [
        {
          id: `stage-${Date.now()}-1`,
          title: "Novo Estágio",
          deals: []
        }
      ]
    };

    setPipelines(prev => [...prev, newPipeline]);
    setNewPipelineData({ name: "" });
    setIsAddPipelineDialogOpen(false);
  };

  const handleEditPipeline = (pipelineId: string, currentName: string) => {
    setEditingPipeline(pipelineId);
    setTempPipelineName(currentName);
  };

  const handleSavePipeline = () => {
    if (!editingPipeline || !tempPipelineName.trim()) return;

    setPipelines(prevPipelines => {
      return prevPipelines.map(pipeline => {
        if (pipeline.id === editingPipeline) {
          return { ...pipeline, name: tempPipelineName };
        }
        return pipeline;
      });
    });

    setEditingPipeline(null);
    setTempPipelineName("");
  };

  const handleDeletePipeline = (pipelineId: string) => {
    if (pipelines.length <= 1) {
      alert("Você não pode excluir o único pipeline existente.");
      return;
    }

    if (window.confirm("Tem certeza que deseja excluir este pipeline? Todos os estágios e deals serão removidos.")) {
      setPipelines(prev => prev.filter(pipeline => pipeline.id !== pipelineId));
      
      // Se o pipeline excluído for o selecionado, selecione outro
      if (pipelineId === selectedPipeline) {
        const remainingPipelines = pipelines.filter(p => p.id !== pipelineId);
        if (remainingPipelines.length > 0) {
          setSelectedPipeline(remainingPipelines[0].id);
        }
      }
    }
  };

  // Função para adicionar novo deal
  const handleAddNewDeal = () => {
    console.log('handleAddNewDeal chamado');
    console.log('newDealData:', newDealData);
    console.log('selectedPipeline:', selectedPipeline);
    console.log('currentPipeline:', currentPipeline);
    
    if (!newDealData.title.trim()) {
      console.log('Erro: título vazio');
      alert('O título é obrigatório');
      return;
    }
    
    if (!newDealData.stageId) {
      console.log('Erro: estágio não selecionado');
      alert('Selecione um estágio');
      return;
    }

    const selectedClient = clients.find(c => c.id === newDealData.clientId);
    console.log('selectedClient:', selectedClient);
    
    const newDeal: Deal = {
      id: `deal-${Date.now()}`,
      title: newDealData.title,
      description: newDealData.description,
      client: selectedClient?.company || "",
      clientId: newDealData.clientId,
      companyName: selectedClient?.company || "",
      contact: selectedClient?.name || newDealData.contact,
      priority: newDealData.priority,
      stageId: newDealData.stageId,
      notes: []
    };

    console.log('newDeal criado:', newDeal);

    setPipelines(prevPipelines => {
      console.log('Atualizando pipelines...');
      const updatedPipelines = prevPipelines.map(pipeline => {
        if (pipeline.id !== selectedPipeline) return pipeline;

        const newStages = pipeline.stages.map(stage => {
          if (stage.id === newDealData.stageId) {
            console.log(`Adicionando deal ao estágio ${stage.id}`);
            return { ...stage, deals: [...stage.deals, newDeal] };
          }
          return stage;
        });

        return { ...pipeline, stages: newStages };
      });
      
      console.log('Pipelines atualizados:', updatedPipelines);
      return updatedPipelines;
    });

    // Limpar formulário e fechar modal
    console.log('Limpando formulário...');
    setNewDealData({
      title: "",
      description: "",
      clientId: "",
      contact: "",
      priority: "low",
      stageId: ""
    });
    setIsAddDealDialogOpen(false);
    console.log('Modal fechado e formulário limpo');
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

  // Função para lidar com duplo clique no nome do estágio
  const handleStageDoubleClick = (stageId: string, currentTitle: string) => {
    if (!isClientView) {
      setEditingStage(stageId);
      setTempStageTitle(currentTitle);
    }
  };

  const renderDealCard = (deal: Deal, index: number, stage: any) => {
    const isExpanded = expandedCards.has(deal.id);
    const clientInfo = getClientDisplayInfo(deal);
    
    return (
      <Draggable
        key={deal.id}
        draggableId={deal.id}
        index={index}
        isDragDisabled={isClientView}
      >
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className="bg-white rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
          >
            <div className="p-3">
              <div className="flex justify-between items-start">
                <h4 className="font-medium text-slate-800">{deal.title}</h4>
                <div className="flex items-center">
                  <Badge className={getPriorityColor(deal.priority)}>
                    {getPriorityLabel(deal.priority)}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpanded(deal.id)}
                    className="h-7 w-7 p-0 ml-1"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              {deal.description && (
                <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                  {deal.description}
                </p>
              )}
              
              {clientInfo.company && (
                <div className="flex items-center gap-1 mt-2 text-xs text-slate-500">
                  <Building2 className="h-3 w-3" />
                  <span>{clientInfo.company}</span>
                </div>
              )}

              {clientInfo.name && (
                <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                  <User className="h-3 w-3" />
                  <span>{clientInfo.name}</span>
                </div>
              )}
              
              {/* Rest of the card content when expanded */}
              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-slate-100 space-y-3">
                  {deal.value && (
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <span className="font-medium text-green-600">
                        R$ {deal.value.toLocaleString()}
                      </span>
                    </div>
                  )}
                  
                  {/* Confidential Information */}
                  <div className="bg-slate-50 rounded p-2">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1 text-xs font-medium text-slate-700">
                        <Lock className="h-3 w-3" />
                        <span>Informação Confidencial</span>
                      </div>
                      {!isClientView && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditConfidential(deal.id, deal.confidential)}
                          className="h-5 w-5 p-0"
                        >
                          <PenSquare className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    
                    {editingConfidential === deal.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={tempConfidentialValue}
                          onChange={(e) => setTempConfidentialValue(e.target.value)}
                          placeholder="Informação confidencial..."
                          className="text-xs min-h-[60px]"
                        />
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSaveConfidential(deal.id, stage.id)}
                            className="h-7 text-xs flex-1"
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Salvar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancelEditConfidential}
                            className="h-7 text-xs flex-1"
                          >
                            <X className="h-3 w-3 mr-1" />
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-600">
                        {deal.confidential || "Nenhuma informação confidencial"}
                      </p>
                    )}
                  </div>
                  
                  {/* Notes Section */}
                  <div>
                    <div className="flex items-center gap-1 mb-2">
                      <MessageSquare className="h-3 w-3" />
                      <span className="text-xs font-medium">Notas</span>
                    </div>
                    
                    <div className="space-y-2">
                      {deal.notes && deal.notes.length > 0 ? (
                        deal.notes.map(note => (
                          <div key={note.id} className="bg-slate-50 rounded p-2">
                            <div className="flex justify-between">
                              <p className="text-xs text-slate-600">{note.text}</p>
                              {!isClientView && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteNote(deal.id, stage.id, note.id)}
                                  className="h-5 w-5 p-0 -mt-1 -mr-1"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <Clock className="h-2 w-2 text-slate-400" />
                              <span className="text-[10px] text-slate-400">
                                {note.date} por {note.author}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 italic">
                          Nenhuma nota
                        </p>
                      )}
                      
                      {!isClientView && (
                        <div className="pt-1">
                          <Textarea
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            placeholder="Adicionar nota..."
                            className="text-xs min-h-[60px]"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleAddNote(deal.id, stage.id)}
                            className="mt-2 h-7 text-xs w-full"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Adicionar Nota
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {!isClientView && (
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditCard(deal)}
                        className="flex-1 h-8"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCard(deal.id)}
                        className="flex-1 h-8 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Excluir
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </Draggable>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header with Pipeline Selector and Actions */}
      <div className="flex items-center justify-between gap-4">
        {/* Left side - Pipeline info and selector */}
        <div className="flex items-center gap-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Pipeline Kanban</h2>
            <p className="text-sm text-slate-600">Gerencie seus deals com drag & drop</p>
          </div>
          
          {/* Pipeline Dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium whitespace-nowrap">Pipeline:</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-48 justify-between">
                  <span className="truncate">{currentPipeline.name || "Selecione um pipeline"}</span>
                  <ChevronDown className="h-4 w-4 flex-shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                {pipelines.map(pipeline => (
                  <DropdownMenuItem 
                    key={pipeline.id} 
                    onClick={() => setSelectedPipeline(pipeline.id)}
                    className="flex items-center justify-between"
                  >
                    <span className="truncate">{pipeline.name}</span>
                    {selectedPipeline === pipeline.id && <Check className="h-4 w-4 flex-shrink-0" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Pipeline Edit Mode */}
          {editingPipeline && (
            <div className="flex items-center gap-2">
              <Input
                value={tempPipelineName}
                onChange={(e) => setTempPipelineName(e.target.value)}
                className="h-8 w-40"
                placeholder="Nome do pipeline"
              />
              <Button size="sm" variant="ghost" onClick={handleSavePipeline} className="h-8 w-8 p-0">
                <Check className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setEditingPipeline(null)} className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        
        {/* Right side - Action Buttons */}
        {!isClientView && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              Filtros
            </Button>
            
            {/* Add Pipeline Button */}
            <Dialog open={isAddPipelineDialogOpen} onOpenChange={setIsAddPipelineDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Pipeline
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Novo Pipeline</DialogTitle>
                  <DialogDescription>
                    Crie um novo pipeline para organizar seus deals
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nome do Pipeline</label>
                    <Input
                      value={newPipelineData.name}
                      onChange={(e) => setNewPipelineData({ ...newPipelineData, name: e.target.value })}
                      placeholder="Ex: Vendas, Projetos, Marketing..."
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAddPipelineDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleAddPipeline}>
                      Criar Pipeline
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Add Deal Button */}
            <Dialog open={isAddDealDialogOpen} onOpenChange={(open) => {
              console.log('Dialog state changed:', open);
              setIsAddDealDialogOpen(open);
            }}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  console.log('Botão Novo Deal clicado');
                  setIsAddDealDialogOpen(true);
                }}>
                  <Plus className="h-4 w-4 mr-1" />
                  Novo Deal
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Novo Deal</DialogTitle>
                  <DialogDescription>
                    Adicione um novo deal ao seu pipeline
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Título *</label>
                    <Input
                      value={newDealData.title}
                      onChange={(e) => {
                        console.log('Título alterado:', e.target.value);
                        setNewDealData({ ...newDealData, title: e.target.value });
                      }}
                      placeholder="Nome do deal ou projeto"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Descrição</label>
                    <Textarea
                      value={newDealData.description}
                      onChange={(e) => setNewDealData({ ...newDealData, description: e.target.value })}
                      placeholder="Descrição do deal"
                      className="min-h-[80px]"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Cliente</label>
                    <Select
                      value={newDealData.clientId}
                      onValueChange={(value) => {
                        console.log('Cliente selecionado:', value);
                        setNewDealData({ ...newDealData, clientId: value });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map(client => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name} ({client.company})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Contato</label>
                    <Input
                      value={newDealData.contact}
                      onChange={(e) => setNewDealData({ ...newDealData, contact: e.target.value })}
                      placeholder="Nome do contato (se não for um cliente cadastrado)"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Prioridade</label>
                    <Select
                      value={newDealData.priority}
                      onValueChange={(value: "low" | "medium" | "high") => 
                        setNewDealData({ ...newDealData, priority: value })
                      }
                    >
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
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Estágio *</label>
                    <Select
                      value={newDealData.stageId}
                      onValueChange={(value) => {
                        console.log('Estágio selecionado:', value);
                        setNewDealData({ ...newDealData, stageId: value });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um estágio" />
                      </SelectTrigger>
                      <SelectContent>
                        {currentPipeline.stages.map(stage => (
                          <SelectItem key={stage.id} value={stage.id}>
                            {stage.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => {
                      console.log('Cancelar clicado');
                      setIsAddDealDialogOpen(false);
                    }}>
                      Cancelar
                    </Button>
                    <Button onClick={() => {
                      console.log('Adicionar Deal clicado');
                      handleAddNewDeal();
                    }}>
                      Adicionar Deal
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-6">
          {currentPipeline.stages.map((stage) => (
            <div key={stage.id} className="flex-shrink-0 w-80">
              <div className="bg-slate-50 rounded-lg shadow-sm border border-slate-200">
                <div className="p-3 border-b border-slate-200 bg-slate-100 rounded-t-lg">
                  {editingStage === stage.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={tempStageTitle}
                        onChange={(e) => setTempStageTitle(e.target.value)}
                        className="h-8"
                      />
                      <Button size="sm" variant="ghost" onClick={handleSaveStage} className="h-8 w-8 p-0">
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={handleCancelEditStage} className="h-8 w-8 p-0">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <h3 
                        className="font-medium text-slate-800 flex items-center cursor-pointer"
                        onDoubleClick={() => handleStageDoubleClick(stage.id, stage.title)}
                      >
                        {stage.title}
                        <Badge variant="outline" className="ml-2 bg-white">
                          {stage.deals.length}
                        </Badge>
                      </h3>
                    </div>
                  )}
                </div>
                
                <Droppable droppableId={stage.id}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="min-h-[200px] p-3 space-y-3"
                    >
                      {stage.deals.map((deal, index) => renderDealCard(deal, index, stage))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
                
                {!isClientView && !addingStage && (
                  <div className="p-3 border-t border-slate-200">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsAddDealDialogOpen(true)}
                      className="w-full justify-center text-slate-600 hover:text-slate-900"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Adicionar Card
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {!isClientView && (
            <div className="flex-shrink-0 w-80">
              {addingStage ? (
                <div className="bg-slate-50 rounded-lg shadow-sm border border-slate-200 p-3">
                  <h3 className="font-medium text-slate-800 mb-2">Novo Estágio</h3>
                  <Input
                    value={newStageTitle}
                    onChange={(e) => setNewStageTitle(e.target.value)}
                    placeholder="Nome do estágio"
                    className="mb-3"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleAddStage} className="flex-1">
                      <Check className="h-4 w-4 mr-1" />
                      Adicionar
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setAddingStage(false)} className="flex-1">
                      <X className="h-4 w-4 mr-1" />
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="border-dashed border-2 h-12 w-full"
                  onClick={() => setAddingStage(true)}
                >
                  <Plus className="h-5 w-5 mr-1" />
                  Adicionar Estágio
                </Button>
              )}
            </div>
          )}
        </div>
      </DragDropContext>

      {/* Edit Deal Drawer */}
      <Drawer open={isEditDrawerOpen} onOpenChange={setIsEditDrawerOpen}>
        <DrawerContent>
          <div className="mx-auto w-full max-w-sm">
            <DrawerHeader>
              <DrawerTitle>Editar Deal</DrawerTitle>
              <DrawerDescription>
                Atualize as informações do deal
              </DrawerDescription>
            </DrawerHeader>
            <div className="p-4 pb-0">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Título</label>
                  <Input
                    value={tempCardData.title || ""}
                    onChange={(e) => setTempCardData({ ...tempCardData, title: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Descrição</label>
                  <Textarea
                    value={tempCardData.description || ""}
                    onChange={(e) => setTempCardData({ ...tempCardData, description: e.target.value })}
                    className="min-h-[100px]"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Cliente</label>
                  <Select
                    value={tempCardData.clientId || ""}
                    onValueChange={(value) => {
                      const selectedClient = clients.find(c => c.id === value);
                      setTempCardData({
                        ...tempCardData,
                        clientId: value,
                        client: selectedClient?.company || "",
                        companyName: selectedClient?.company || "",
                        contact: selectedClient?.name || ""
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map(client => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name} ({client.company})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Contato</label>
                  <Input
                    value={tempCardData.contact || ""}
                    onChange={(e) => setTempCardData({ ...tempCardData, contact: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Valor (R$)</label>
                  <Input
                    type="number"
                    value={tempCardData.value || ""}
                    onChange={(e) => setTempCardData({ ...tempCardData, value: parseFloat(e.target.value) })}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Prioridade</label>
                  <Select
                    value={tempCardData.priority || "low"}
                    onValueChange={(value: "low" | "medium" | "high") => 
                      setTempCardData({ ...tempCardData, priority: value })
                    }
                  >
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
                
                <div className="flex justify-end gap-2 pb-6">
                  <Button variant="outline" onClick={() => setIsEditDrawerOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={() => handleSaveCard(editingCard || "")}>
                    Salvar Alterações
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default KanbanBoard;
