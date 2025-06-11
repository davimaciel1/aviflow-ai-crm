import { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  User,
  Plus,
  Edit,
  Check,
  X,
  Settings,
  Building,
  Trash2,
  ArrowRight,
  FileText,
  Video,
  Camera,
  GripVertical,
  Shield,
  MoreHorizontal,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Deal {
  id: string;
  title: string;
  description?: string;
  client: string;
  clientId?: string;
  companyName?: string;
  contact: string;
  confidentialInfo?: string;
  priority: "low" | "medium" | "high";
  stageId: string;
  notes?: Note[];
  avatar?: string;
}

interface Note {
  id: string;
  author: string;
  authorRole: "admin" | "client";
  content: string;
  timestamp: string;
  attachments?: Attachment[];
}

interface Attachment {
  type: "photo" | "video";
  name: string;
  url: string;
}

interface Pipeline {
  id: string;
  name: string;
  stages: Stage[];
}

interface Stage {
  id: string;
  title: string;
  color: string;
  deals: Deal[];
}

interface Client {
  id: string;
  name: string;
  company: string;
  contact: string;
  email: string;
  phone?: string;
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
  
  // Estados para adicionar cliente
  const [isAddClientDialogOpen, setIsAddClientDialogOpen] = useState<boolean>(false);
  const [newClientData, setNewClientData] = useState({
    name: "",
    company: "",
    email: "",
    phone: ""
  });

  // Estados para novo deal
  const [isAddDealDialogOpen, setIsAddDealDialogOpen] = useState<boolean>(false);
  const [newDealData, setNewDealData] = useState({
    title: "",
    description: "",
    clientId: "",
    contact: "",
    priority: "low" as const,
    stageId: ""
  });

  // Estados para gerenciar pipelines
  const [isAddPipelineDialogOpen, setIsAddPipelineDialogOpen] = useState<boolean>(false);
  const [isEditPipelineDialogOpen, setIsEditPipelineDialogOpen] = useState<boolean>(false);
  const [editingPipelineId, setEditingPipelineId] = useState<string | null>(null);
  const [newPipelineData, setNewPipelineData] = useState({
    name: "",
    stages: [{ title: "Novo Stage", color: "bg-blue-100" }]
  });

  // Get clients from localStorage - buscar na chave correta
  const getClientsFromStorage = (): Client[] => {
    try {
      console.log('Buscando clientes no localStorage...');
      
      // Primeiro tentar a chave daviflow_clients que tem os dados corretos
      const daviflowClients = localStorage.getItem('daviflow_clients');
      if (daviflowClients) {
        try {
          const parsedClients = JSON.parse(daviflowClients);
          console.log('Clientes encontrados em daviflow_clients:', parsedClients);
          if (Array.isArray(parsedClients) && parsedClients.length > 0) {
            return parsedClients.map(client => ({
              id: client.id,
              name: client.company || client.name,
              company: client.company,
              contact: client.name,
              email: client.email,
              phone: client.phone || ""
            }));
          }
        } catch (parseError) {
          console.error('Erro ao fazer parse dos clientes daviflow:', parseError);
        }
      }

      // Fallback: tentar crm-clients se não encontrar daviflow_clients
      const crmClients = localStorage.getItem('crm-clients');
      if (crmClients) {
        try {
          const parsedClients = JSON.parse(crmClients);
          console.log('Clientes encontrados em crm-clients:', parsedClients);
          if (Array.isArray(parsedClients) && parsedClients.length > 0) {
            return parsedClients.map(client => ({
              id: client.id,
              name: client.name,
              company: client.name,
              contact: client.contactEmail || '',
              email: client.contactEmail || '',
              phone: ""
            }));
          }
        } catch (parseError) {
          console.error('Erro ao fazer parse dos clientes crm:', parseError);
        }
      }
      
      console.log('Nenhum cliente encontrado em localStorage');
      return [];
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      return [];
    }
  };

  const [clients, setClients] = useState<Client[]>(() => getClientsFromStorage());

  // Função para adicionar novo cliente
  const handleAddNewClient = () => {
    if (!newClientData.name.trim() || !newClientData.company.trim()) {
      return;
    }

    const newClient: Client = {
      id: `client-${Date.now()}`,
      name: newClientData.name,
      company: newClientData.company,
      email: newClientData.email,
      phone: newClientData.phone,
      contact: newClientData.name
    };

    // Adicionar ao estado local
    setClients(prev => [...prev, newClient]);

    // Salvar no localStorage (daviflow_clients)
    try {
      const existingClients = JSON.parse(localStorage.getItem('daviflow_clients') || '[]');
      const updatedClients = [...existingClients, newClient];
      localStorage.setItem('daviflow_clients', JSON.stringify(updatedClients));
      console.log('Cliente adicionado ao localStorage:', newClient);
    } catch (error) {
      console.error('Erro ao salvar cliente no localStorage:', error);
    }

    // Selecionar o novo cliente automaticamente
    setTempCardData(prev => ({
      ...prev,
      clientId: newClient.id,
      companyName: newClient.company,
      contact: newClient.name
    }));

    // Limpar formulário e fechar modal
    setNewClientData({ name: "", company: "", email: "", phone: "" });
    setIsAddClientDialogOpen(false);
  };

  // Função para adicionar novo deal
  const handleAddNewDeal = () => {
    if (!newDealData.title.trim() || !newDealData.stageId) {
      return;
    }

    const selectedClient = clients.find(c => c.id === newDealData.clientId);
    
    const newDeal: Deal = {
      id: `deal-${Date.now()}`,
      title: newDealData.title,
      description: newDealData.description,
      client: selectedClient?.company || "",
      clientId: newDealData.clientId,
      companyName: selectedClient?.company,
      contact: selectedClient?.contact || newDealData.contact,
      priority: newDealData.priority,
      stageId: newDealData.stageId,
      notes: []
    };

    setPipelines(prevPipelines => {
      return prevPipelines.map(pipeline => {
        if (pipeline.id !== selectedPipeline) return pipeline;

        const newStages = pipeline.stages.map(stage => {
          if (stage.id === newDealData.stageId) {
            return { ...stage, deals: [...stage.deals, newDeal] };
          }
          return stage;
        });

        return { ...pipeline, stages: newStages };
      });
    });

    // Limpar formulário e fechar modal
    setNewDealData({
      title: "",
      description: "",
      clientId: "",
      contact: "",
      priority: "low",
      stageId: ""
    });
    setIsAddDealDialogOpen(false);
  };

  // Função para adicionar nova pipeline
  const handleAddNewPipeline = () => {
    if (!newPipelineData.name.trim()) {
      return;
    }

    const newPipeline: Pipeline = {
      id: `pipeline-${Date.now()}`,
      name: newPipelineData.name,
      stages: newPipelineData.stages.map((stage, index) => ({
        id: `stage-${Date.now()}-${index}`,
        title: stage.title,
        color: stage.color,
        deals: []
      }))
    };

    setPipelines(prev => [...prev, newPipeline]);

    // Limpar formulário e fechar modal
    setNewPipelineData({
      name: "",
      stages: [{ title: "Novo Stage", color: "bg-blue-100" }]
    });
    setIsAddPipelineDialogOpen(false);
  };

  // Função para editar pipeline
  const handleEditPipeline = (pipelineId: string) => {
    const pipeline = pipelines.find(p => p.id === pipelineId);
    if (pipeline) {
      setNewPipelineData({
        name: pipeline.name,
        stages: pipeline.stages.map(stage => ({ title: stage.title, color: stage.color }))
      });
      setEditingPipelineId(pipelineId);
      setIsEditPipelineDialogOpen(true);
    }
  };

  // Função para salvar edição da pipeline
  const handleSavePipelineEdit = () => {
    if (!editingPipelineId || !newPipelineData.name.trim()) {
      return;
    }

    setPipelines(prev => prev.map(pipeline => {
      if (pipeline.id === editingPipelineId) {
        return {
          ...pipeline,
          name: newPipelineData.name,
          stages: pipeline.stages.map((stage, index) => {
            const newStageData = newPipelineData.stages[index];
            if (newStageData) {
              return {
                ...stage,
                title: newStageData.title,
                color: newStageData.color
              };
            }
            return stage;
          })
        };
      }
      return pipeline;
    }));

    // Limpar e fechar
    setNewPipelineData({
      name: "",
      stages: [{ title: "Novo Stage", color: "bg-blue-100" }]
    });
    setEditingPipelineId(null);
    setIsEditPipelineDialogOpen(false);
  };

  // Função para excluir pipeline
  const handleDeletePipeline = (pipelineId: string) => {
    if (!window.confirm("Tem certeza que deseja excluir esta pipeline?")) return;
    
    setPipelines(prev => prev.filter(p => p.id !== pipelineId));
    
    // Se a pipeline excluída era a selecionada, selecionar a primeira disponível
    if (selectedPipeline === pipelineId) {
      const remainingPipelines = pipelines.filter(p => p.id !== pipelineId);
      if (remainingPipelines.length > 0) {
        setSelectedPipeline(remainingPipelines[0].id);
      }
    }
  };

  // Example pipelines and stages data
  const [pipelines, setPipelines] = useState<Pipeline[]>([
    {
      id: "sales",
      name: "Sales Pipeline",
      stages: [
        {
          id: "stage1",
          title: "Prospects",
          color: "bg-blue-100",
          deals: []
        },
        {
          id: "stage2",
          title: "Negotiation",
          color: "bg-yellow-100",
          deals: []
        },
        {
          id: "stage3",
          title: "Closed",
          color: "bg-green-100",
          deals: []
        }
      ]
    },
    {
      id: "marketing",
      name: "Marketing Pipeline",
      stages: [
        {
          id: "stage4",
          title: "Leads",
          color: "bg-purple-100",
          deals: []
        },
        {
          id: "stage5",
          title: "Qualified",
          color: "bg-pink-100",
          deals: []
        }
      ]
    }
  ]);

  const currentPipeline = pipelines.find(p => p.id === selectedPipeline) || pipelines[0];

  // Helper to get all columns (stages) with deals
  const getFilteredColumns = () => {
    return currentPipeline.stages;
  };

  // Toggle card expansion
  const toggleCardExpansion = (cardId: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  // Handle drag end for drag and drop
  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    setPipelines(prevPipelines => {
      return prevPipelines.map(pipeline => {
        if (pipeline.id !== selectedPipeline) return pipeline;

        const sourceStageIndex = pipeline.stages.findIndex(s => s.id === source.droppableId);
        const destStageIndex = pipeline.stages.findIndex(s => s.id === destination.droppableId);
        if (sourceStageIndex === -1 || destStageIndex === -1) return pipeline;

        const sourceStage = pipeline.stages[sourceStageIndex];
        const destStage = pipeline.stages[destStageIndex];

        const draggedDeal = sourceStage.deals.find(d => d.id === draggableId);
        if (!draggedDeal) return pipeline;

        // Remove from source
        const newSourceDeals = Array.from(sourceStage.deals);
        newSourceDeals.splice(source.index, 1);

        // Add to destination
        const newDestDeals = Array.from(destStage.deals);
        newDestDeals.splice(destination.index, 0, { ...draggedDeal, stageId: destStage.id });

        const newStages = [...pipeline.stages];
        newStages[sourceStageIndex] = { ...sourceStage, deals: newSourceDeals };
        newStages[destStageIndex] = { ...destStage, deals: newDestDeals };

        return { ...pipeline, stages: newStages };
      });
    });
  };

  // Handle editing confidential info
  const handleEditConfidential = (dealId: string, currentValue: string) => {
    setEditingConfidential(dealId);
    setTempConfidentialValue(currentValue);
  };

  const handleSaveConfidential = (dealId: string) => {
    setPipelines(prevPipelines => {
      return prevPipelines.map(pipeline => {
        if (pipeline.id !== selectedPipeline) return pipeline;

        const newStages = pipeline.stages.map(stage => {
          const newDeals = stage.deals.map(deal => {
            if (deal.id === dealId) {
              return { ...deal, confidentialInfo: tempConfidentialValue };
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

  const handleCancelConfidentialEdit = () => {
    setEditingConfidential(null);
    setTempConfidentialValue("");
  };

  // Handle editing stage title
  const handleEditStage = (stageId: string, currentTitle: string) => {
    setEditingStage(stageId);
    setTempStageTitle(currentTitle);
  };

  const handleSaveStage = (stageId: string) => {
    setPipelines(prevPipelines => {
      return prevPipelines.map(pipeline => {
        if (pipeline.id !== selectedPipeline) return pipeline;

        const newStages = pipeline.stages.map(stage => {
          if (stage.id === stageId) {
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

  const handleCancelStageEdit = () => {
    setEditingStage(null);
    setTempStageTitle("");
  };

  // Handle deleting stage
  const handleDeleteStage = (stageId: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este stage?")) return;

    setPipelines(prevPipelines => {
      return prevPipelines.map(pipeline => {
        if (pipeline.id !== selectedPipeline) return pipeline;

        const newStages = pipeline.stages.filter(stage => stage.id !== stageId);

        return { ...pipeline, stages: newStages };
      });
    });
  };

  // Handle adding new stage
  const handleAddStage = () => {
    if (!newStageTitle.trim()) return;

    setPipelines(prevPipelines => {
      return prevPipelines.map(pipeline => {
        if (pipeline.id !== selectedPipeline) return pipeline;

        const newStage: Stage = {
          id: `stage-${Date.now()}`,
          title: newStageTitle.trim(),
          color: "bg-gray-100",
          deals: []
        };

        return { ...pipeline, stages: [...pipeline.stages, newStage] };
      });
    });

    setNewStageTitle("");
    setAddingStage(false);
  };

  // Handle editing card
  const handleEditCard = (deal: Deal) => {
    setEditingCard(deal.id);
    setTempCardData({ ...deal });
    setIsEditDrawerOpen(true);
  };

  // Handle saving card changes
  const handleSaveCard = (dealId: string) => {
    setPipelines(prevPipelines => {
      return prevPipelines.map(pipeline => {
        if (pipeline.id !== selectedPipeline) return pipeline;

        const newStages = pipeline.stages.map(stage => {
          const newDeals = stage.deals.map(deal => {
            if (deal.id === dealId) {
              return { ...deal, ...tempCardData };
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

  // Handle cancel editing card
  const handleCancelEditCard = () => {
    setEditingCard(null);
    setTempCardData({});
    setIsEditDrawerOpen(false);
  };

  // Handle adding new card
  const handleAddCard = (stageId: string) => {
    const newDeal: Deal = {
      id: `deal-${Date.now()}`,
      title: "Novo Card",
      client: "",
      contact: "",
      priority: "low",
      stageId,
      notes: []
    };

    setPipelines(prevPipelines => {
      return prevPipelines.map(pipeline => {
        if (pipeline.id !== selectedPipeline) return pipeline;

        const newStages = pipeline.stages.map(stage => {
          if (stage.id === stageId) {
            return { ...stage, deals: [...stage.deals, newDeal] };
          }
          return stage;
        });

        return { ...pipeline, stages: newStages };
      });
    });
  };

  // Handle moving card to another pipeline
  const handleMoveToPipeline = (dealId: string, targetPipelineId: string) => {
    let movedDeal: Deal | null = null;

    setPipelines(prevPipelines => {
      let updatedPipelines = prevPipelines.map(pipeline => {
        if (pipeline.id === selectedPipeline) {
          // Remove deal from current pipeline
          const newStages = pipeline.stages.map(stage => {
            const newDeals = stage.deals.filter(deal => {
              if (deal.id === dealId) {
                movedDeal = deal;
                return false;
              }
              return true;
            });
            return { ...stage, deals: newDeals };
          });
          return { ...pipeline, stages: newStages };
        }
        return pipeline;
      });

      if (movedDeal) {
        updatedPipelines = updatedPipelines.map(pipeline => {
          if (pipeline.id === targetPipelineId) {
            // Add deal to first stage of target pipeline
            const newStages = pipeline.stages.map((stage, index) => {
              if (index === 0) {
                return { ...stage, deals: [...stage.deals, { ...movedDeal!, stageId: stage.id }] };
              }
              return stage;
            });
            return { ...pipeline, stages: newStages };
          }
          return pipeline;
        });
      }

      return updatedPipelines;
    });
  };

  // Handle adding note to card
  const handleAddNote = () => {
    if (!editingCard || !newNote.trim()) return;

    const note: Note = {
      id: `note-${Date.now()}`,
      author: user?.name || "Unknown",
      authorRole: user?.role === "admin" ? "admin" : "client",
      content: newNote.trim(),
      timestamp: new Date().toISOString(),
      attachments: []
    };

    setPipelines(prevPipelines => {
      return prevPipelines.map(pipeline => {
        if (pipeline.id !== selectedPipeline) return pipeline;

        const newStages = pipeline.stages.map(stage => {
          const newDeals = stage.deals.map(deal => {
            if (deal.id === editingCard) {
              const updatedNotes = deal.notes ? [...deal.notes, note] : [note];
              return { ...deal, notes: updatedNotes };
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

  // Handle file upload (photo or video) for notes
  const handleFileUpload = (type: "photo" | "video") => {
    if (!editingCard) return;

    // For demo purposes, just add a dummy attachment
    const attachment: Attachment = {
      type,
      name: type === "photo" ? "Foto Exemplo.jpg" : "Vídeo Exemplo.mp4",
      url: "https://example.com/file"
    };

    setPipelines(prevPipelines => {
      return prevPipelines.map(pipeline => {
        if (pipeline.id !== selectedPipeline) return pipeline;

        const newStages = pipeline.stages.map(stage => {
          const newDeals = stage.deals.map(deal => {
            if (deal.id === editingCard) {
              const lastNote = deal.notes && deal.notes.length > 0 ? deal.notes[deal.notes.length - 1] : null;
              if (lastNote && lastNote.author === (user?.name || "Unknown") && !lastNote.attachments) {
                // Append attachment to last note if no attachments yet
                const updatedNote = { ...lastNote, attachments: [attachment] };
                const updatedNotes = [...deal.notes!.slice(0, -1), updatedNote];
                return { ...deal, notes: updatedNotes };
              } else {
                // Create new note with attachment
                const newNote: Note = {
                  id: `note-${Date.now()}`,
                  author: user?.name || "Unknown",
                  authorRole: user?.role === "admin" ? "admin" : "client",
                  content: "",
                  timestamp: new Date().toISOString(),
                  attachments: [attachment]
                };
                const updatedNotes = deal.notes ? [...deal.notes, newNote] : [newNote];
                return { ...deal, notes: updatedNotes };
              }
            }
            return deal;
          });
          return { ...stage, deals: newDeals };
        });

        return { ...pipeline, stages: newStages };
      });
    });
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Kanban Board</h2>
        <div className="flex items-center space-x-2">
          <Select
            value={selectedPipeline}
            onValueChange={setSelectedPipeline}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Selecionar pipeline" />
            </SelectTrigger>
            <SelectContent className="bg-white border shadow-lg">
              {pipelines.map((pipeline) => (
                <SelectItem key={pipeline.id} value={pipeline.id}>
                  {pipeline.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {!isClientView && (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Pipelines
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white border shadow-lg">
                  <DropdownMenuItem onClick={() => setIsAddPipelineDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Pipeline
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleEditPipeline(selectedPipeline)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Editar Pipeline
                  </DropdownMenuItem>
                  {pipelines.length > 1 && (
                    <DropdownMenuItem 
                      onClick={() => handleDeletePipeline(selectedPipeline)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Excluir Pipeline
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button onClick={() => setIsAddDealDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Deal
              </Button>
            </>
          )}
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex space-x-4 overflow-x-auto pb-4">
          {getFilteredColumns().map((column) => (
            <Droppable key={column.id} droppableId={column.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`min-w-[280px] ${column.color} rounded-lg p-3 ${
                    snapshot.isDraggingOver ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    {editingStage === column.id ? (
                      <div className="flex items-center space-x-2 flex-1">
                        <Input
                          value={tempStageTitle}
                          onChange={(e) => setTempStageTitle(e.target.value)}
                          className="text-sm font-semibold h-8"
                          onKeyPress={(e) => e.key === 'Enter' && handleSaveStage(column.id)}
                        />
                        <Button size="sm" onClick={() => handleSaveStage(column.id)}>
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancelStageEdit}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                        {column.title}
                        <Badge variant="secondary" className="text-xs">
                          {column.deals.length}
                        </Badge>
                      </h3>
                    )}

                    {!isClientView && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white border shadow-lg">
                          <DropdownMenuItem onClick={() => handleEditStage(column.id, column.title)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Editar Stage
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteStage(column.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir Stage
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>

                  <div className="space-y-3">
                    {column.deals.map((deal, index) => {
                      const isExpanded = expandedCards.has(deal.id);
                      
                      return (
                        <Draggable key={deal.id} draggableId={deal.id} index={index}>
                          {(provided, snapshot) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`cursor-pointer transition-all duration-200 ${
                                snapshot.isDragging ? 'rotate-2 shadow-lg' : 'hover:shadow-md'
                              }`}
                            >
                              <CardHeader 
                                className="pb-2" 
                                {...provided.dragHandleProps}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex items-center space-x-2 flex-1">
                                    <Avatar className="h-8 w-8">
                                      <AvatarImage src={deal.avatar} />
                                      <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                                        {deal.client.split(' ').map(n => n[0]).join('').toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                      <CardTitle className="text-sm font-medium text-slate-800">
                                        {deal.title}
                                      </CardTitle>
                                      <p className="text-xs text-slate-500 flex items-center gap-1">
                                        <Building className="w-3 h-3" />
                                        {deal.client}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center space-x-1">
                                    <Badge 
                                      variant={
                                        deal.priority === 'high' ? 'destructive' : 
                                        deal.priority === 'medium' ? 'default' : 'secondary'
                                      }
                                      className="text-xs"
                                    >
                                      {deal.priority === 'high' ? 'Alta' : 
                                       deal.priority === 'medium' ? 'Média' : 'Baixa'}
                                    </Badge>
                                    
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleCardExpansion(deal.id);
                                      }}
                                      className="h-6 w-6 p-0"
                                    >
                                      {isExpanded ? (
                                        <ChevronDown className="w-3 h-3" />
                                      ) : (
                                        <ChevronRight className="w-3 h-3" />
                                      )}
                                    </Button>
                                  </div>
                                </div>
                              </CardHeader>

                              <Collapsible open={isExpanded}>
                                <CollapsibleContent>
                                  <CardContent className="pt-0 space-y-3">
                                    <div className="text-xs text-slate-600">
                                      <p><span className="font-medium">Contato:</span> {deal.contact}</p>
                                      {deal.description && (
                                        <p className="mt-1"><span className="font-medium">Descrição:</span> {deal.description}</p>
                                      )}
                                    </div>

                                    {!isClientView && deal.confidentialInfo && (
                                      <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                                        <div className="flex items-center justify-between">
                                          <p className="flex items-center gap-1 text-yellow-800">
                                            <Shield className="w-3 h-3" />
                                            <span className="font-medium">Confidencial:</span>
                                          </p>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleEditConfidential(deal.id, deal.confidentialInfo)}
                                            className="h-5 w-5 p-0"
                                          >
                                            <Edit className="w-3 h-3" />
                                          </Button>
                                        </div>
                                        {editingConfidential === deal.id ? (
                                          <div className="mt-2 space-y-2">
                                            <Textarea
                                              value={tempConfidentialValue}
                                              onChange={(e) => setTempConfidentialValue(e.target.value)}
                                              className="text-xs min-h-[60px]"
                                            />
                                            <div className="flex gap-1">
                                              <Button size="sm" onClick={() => handleSaveConfidential(deal.id)}>
                                                <Check className="w-3 h-3" />
                                              </Button>
                                              <Button size="sm" variant="outline" onClick={handleCancelConfidentialEdit}>
                                                <X className="w-3 h-3" />
                                              </Button>
                                            </div>
                                          </div>
                                        ) : (
                                          <p className="text-yellow-700 mt-1">{deal.confidentialInfo}</p>
                                        )}
                                      </div>
                                    )}

                                    <div className="flex items-center gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleEditCard(deal)}
                                        className="flex-1 h-7 text-xs"
                                      >
                                        <Edit className="w-3 h-3 mr-1" />
                                        Editar
                                      </Button>
                                      
                                      {!isClientView && (
                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="sm" className="h-7 px-2">
                                              <ArrowRight className="w-3 h-3" />
                                            </Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="end" className="bg-white border shadow-lg">
                                            {pipelines
                                              .filter(p => p.id !== selectedPipeline)
                                              .map(pipeline => (
                                                <DropdownMenuItem 
                                                  key={pipeline.id}
                                                  onClick={() => handleMoveToPipeline(deal.id, pipeline.id)}
                                                >
                                                  Mover para {pipeline.name}
                                                </DropdownMenuItem>
                                              ))
                                            }
                                          </DropdownMenuContent>
                                        </DropdownMenu>
                                      )}
                                    </div>
                                  </CardContent>
                                </CollapsibleContent>
                              </Collapsible>
                            </Card>
                          )}
                        </Draggable>
                      );
                    })}
                  </div>
                  
                  {!isClientView && (
                    <Button
                      variant="ghost"
                      className="w-full mt-3 border-2 border-dashed border-slate-300 text-slate-500 hover:border-slate-400 hover:text-slate-600"
                      onClick={() => handleAddCard(column.id)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Card
                    </Button>
                  )}
                  
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
          
          {!isClientView && (
            <div className="min-w-[280px]">
              {addingStage ? (
                <div className="bg-slate-100 rounded-lg p-3">
                  <div className="space-y-2">
                    <Input
                      placeholder="Nome do novo stage..."
                      value={newStageTitle}
                      onChange={(e) => setNewStageTitle(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddStage()}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleAddStage}>
                        <Check className="w-4 h-4 mr-1" />
                        Criar
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setAddingStage(false)}>
                        <X className="w-4 h-4 mr-1" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  className="w-full h-20 border-2 border-dashed border-slate-300 text-slate-500 hover:border-slate-400 hover:text-slate-600"
                  onClick={() => setAddingStage(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Stage
                </Button>
              )}
            </div>
          )}
        </div>
      </DragDropContext>

      {/* Dialog para Novo Deal */}
      <Dialog open={isAddDealDialogOpen} onOpenChange={setIsAddDealDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Deal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Título</label>
              <Input
                value={newDealData.title}
                onChange={(e) => setNewDealData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Nome do deal"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Descrição</label>
              <Textarea
                value={newDealData.description}
                onChange={(e) => setNewDealData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrição do deal..."
                className="min-h-[80px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Cliente</label>
                <Select
                  value={newDealData.clientId}
                  onValueChange={(value) => setNewDealData(prev => ({ ...prev, clientId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar cliente" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border shadow-lg">
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.company} - {client.contact}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Stage</label>
                <Select
                  value={newDealData.stageId}
                  onValueChange={(value) => setNewDealData(prev => ({ ...prev, stageId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar stage" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border shadow-lg">
                    {currentPipeline.stages.map((stage) => (
                      <SelectItem key={stage.id} value={stage.id}>
                        {stage.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Prioridade</label>
              <Select
                value={newDealData.priority}
                onValueChange={(value: "low" | "medium" | "high") => setNewDealData(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border shadow-lg">
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddNewDeal} className="flex-1">
                <Check className="w-4 h-4 mr-2" />
                Adicionar Deal
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsAddDealDialogOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para Nova Pipeline */}
      <Dialog open={isAddPipelineDialogOpen} onOpenChange={setIsAddPipelineDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Adicionar Nova Pipeline</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nome da Pipeline</label>
              <Input
                value={newPipelineData.name}
                onChange={(e) => setNewPipelineData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nome da pipeline"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddNewPipeline} className="flex-1">
                <Check className="w-4 h-4 mr-2" />
                Criar Pipeline
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsAddPipelineDialogOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para Editar Pipeline */}
      <Dialog open={isEditPipelineDialogOpen} onOpenChange={setIsEditPipelineDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Editar Pipeline</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nome da Pipeline</label>
              <Input
                value={newPipelineData.name}
                onChange={(e) => setNewPipelineData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nome da pipeline"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSavePipelineEdit} className="flex-1">
                <Check className="w-4 h-4 mr-2" />
                Salvar Alterações
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsEditPipelineDialogOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Card Drawer */}
      <Drawer open={isEditDrawerOpen} onOpenChange={setIsEditDrawerOpen}>
        <DrawerContent className="bg-white">
          <DrawerHeader>
            <DrawerTitle>Editar Card</DrawerTitle>
            <DrawerDescription>
              Faça as alterações necessárias no card
            </DrawerDescription>
          </DrawerHeader>
          
          <div className="px-4 pb-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Título</label>
                <Input
                  value={tempCardData.title || ""}
                  onChange={(e) => setTempCardData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Título do card"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Descrição</label>
                <Textarea
                  value={tempCardData.description || ""}
                  onChange={(e) => setTempCardData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descrição do projeto..."
                  className="min-h-[80px]"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium flex items-center justify-between">
                    Cliente/Empresa
                    <Dialog open={isAddClientDialogOpen} onOpenChange={setIsAddClientDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="h-6 px-2">
                          <Plus className="w-3 h-3 mr-1" />
                          Novo
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-white">
                        <DialogHeader>
                          <DialogTitle>Adicionar Novo Cliente</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium">Nome do Contato</label>
                            <Input
                              value={newClientData.name}
                              onChange={(e) => setNewClientData(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="Nome da pessoa de contato"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Nome da Empresa</label>
                            <Input
                              value={newClientData.company}
                              onChange={(e) => setNewClientData(prev => ({ ...prev, company: e.target.value }))}
                              placeholder="Nome da empresa"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Email</label>
                            <Input
                              type="email"
                              value={newClientData.email}
                              onChange={(e) => setNewClientData(prev => ({ ...prev, email: e.target.value }))}
                              placeholder="email@empresa.com"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Telefone</label>
                            <Input
                              value={newClientData.phone}
                              onChange={(e) => setNewClientData(prev => ({ ...prev, phone: e.target.value }))}
                              placeholder="(11) 99999-9999"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={handleAddNewClient} className="flex-1">
                              <Check className="w-4 h-4 mr-2" />
                              Adicionar Cliente
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => setIsAddClientDialogOpen(false)}
                              className="flex-1"
                            >
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </label>
                  <Select
                    value={tempCardData.clientId || ""}
                    onValueChange={(value) => {
                      const selectedClient = clients.find(c => c.id === value);
                      if (selectedClient) {
                        setTempCardData(prev => ({ 
                          ...prev, 
                          clientId: value,
                          companyName: selectedClient.company,
                          contact: selectedClient.contact
                        }));
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={clients.length > 0 ? "Selecionar cliente" : "Nenhum cliente encontrado"} />
                    </SelectTrigger>
                    <SelectContent className="bg-white border shadow-lg">
                      {clients.length > 0 ? (
                        clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.company} - {client.contact}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-clients" disabled>
                          Nenhum cliente encontrado - Use o botão "Novo" para adicionar
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Contato</label>
                  <Input
                    value={tempCardData.contact || ""}
                    onChange={(e) => setTempCardData(prev => ({ ...prev, contact: e.target.value }))}
                    placeholder="Nome do contato"
                  />
                </div>
              </div>

              {!isClientView && (
                <div>
                  <label className="text-sm font-medium">Informações Confidenciais</label>
                  <Textarea
                    value={tempCardData.confidentialInfo || ""}
                    onChange={(e) => setTempCardData(prev => ({ ...prev, confidentialInfo: e.target.value }))}
                    placeholder="Informações internas, margens, estratégias..."
                    className="min-h-[60px]"
                  />
                </div>
              )}
            </div>

            {/* Notes Section */}
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Anotações e Anexos
              </h4>
              
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {tempCardData.notes && tempCardData.notes.length > 0 ? (
                  tempCardData.notes.map((note) => (
                    <div key={note.id} className="p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
                              {note.author.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{note.author}</p>
                            <p className="text-xs text-slate-500">
                              {new Date(note.timestamp).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        <Badge variant={note.authorRole === 'admin' ? 'default' : 'secondary'} className="text-xs">
                          {note.authorRole === 'admin' ? 'Admin' : 'Cliente'}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-700 mb-2">{note.content}</p>
                      {note.attachments && note.attachments.length > 0 && (
                        <div className="space-y-2">
                          {note.attachments.map((attachment, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 bg-white rounded border">
                              {attachment.type === 'photo' ? (
                                <Camera className="w-4 h-4 text-blue-600" />
                              ) : (
                                <Video className="w-4 h-4 text-red-600" />
                              )}
                              <span className="text-sm">{attachment.name}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(attachment.url, '_blank')}
                                className="ml-auto h-6 text-xs"
                              >
                                Ver
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 text-center py-4">Nenhuma anotação ainda</p>
                )}
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex gap-2">
                  <Textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Adicionar nova anotação..."
                    className="flex-1 min-h-[60px]"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={handleAddNote}
                    disabled={!newNote.trim()}
                    className="flex-1"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Adicionar Nota
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleFileUpload('photo')}
                    className="px-3"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleFileUpload('video')}
                    className="px-3"
                  >
                    <Video className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                onClick={() => editingCard && handleSaveCard(editingCard)} 
                className="flex-1"
              >
                <Check className="w-4 h-4 mr-2" />
                Salvar Alterações
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsEditDrawerOpen(false)}
                className="flex-1"
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default KanbanBoard;
