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
      setClients(clientsData || []);

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
      
      const formattedPipelines = (pipelinesData || []).map(pipeline => ({
        ...pipeline,
        stages: (pipeline.stages || [])
          .sort((a, b) => a.position - b.position)
          .map(stage => ({
            ...stage,
            deals: (stage.deals || [])
              .sort((a, b) => a.position - b.position)
              .map(deal => ({
                ...deal,
                notes: deal.notes || []
              }))
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
    const clientFromStorage = clients.find(c => c.id === deal.client_id);
    if (clientFromStorage) {
      return {
        name: clientFromStorage.name,
        company: clientFromStorage.company,
        avatar: clientFromStorage.avatar || ""
      };
    }
    return {
      name: deal.contact || "Contato não informado",
      company: deal.client || "Empresa não informada",
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

      setClients(prev => [data, ...prev]);
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

  // Funções de edição inline
  const handleEditTitle = (dealId: string, currentTitle: string) => {
    setEditingTitle(dealId);
    setTempTitle(currentTitle);
  };
  const handleSaveTitle = (dealId: string, stageId: string) => {
    setPipelines(prevPipelines => {
      return prevPipelines.map(pipeline => {
        if (pipeline.id !== selectedPipeline) return pipeline;
        const newStages = pipeline.stages.map(stage => {
          if (stage.id !== stageId) return stage;
          const newDeals = stage.deals.map(deal => {
            if (deal.id === dealId) {
              return {
                ...deal,
                title: tempTitle
              };
            }
            return deal;
          });
          return {
            ...stage,
            deals: newDeals
          };
        });
        return {
          ...pipeline,
          stages: newStages
        };
      });
    });
    setEditingTitle(null);
    setTempTitle("");
  };
  const handleEditDescription = (dealId: string, currentDescription: string = "") => {
    setEditingDescription(dealId);
    setTempDescription(currentDescription);
  };
  const handleSaveDescription = (dealId: string, stageId: string) => {
    setPipelines(prevPipelines => {
      return prevPipelines.map(pipeline => {
        if (pipeline.id !== selectedPipeline) return pipeline;
        const newStages = pipeline.stages.map(stage => {
          if (stage.id !== stageId) return stage;
          const newDeals = stage.deals.map(deal => {
            if (deal.id === dealId) {
              return {
                ...deal,
                description: tempDescription
              };
            }
            return deal;
          });
          return {
            ...stage,
            deals: newDeals
          };
        });
        return {
          ...pipeline,
          stages: newStages
        };
      });
    });
    setEditingDescription(null);
    setTempDescription("");
  };
  const handleEditValue = (dealId: string, currentValue: number = 0) => {
    setEditingValue(dealId);
    setTempValue(currentValue.toString());
  };
  const handleSaveValue = (dealId: string, stageId: string) => {
    const numericValue = parseFloat(tempValue) || 0;
    setPipelines(prevPipelines => {
      return prevPipelines.map(pipeline => {
        if (pipeline.id !== selectedPipeline) return pipeline;
        const newStages = pipeline.stages.map(stage => {
          if (stage.id !== stageId) return stage;
          const newDeals = stage.deals.map(deal => {
            if (deal.id === dealId) {
              return {
                ...deal,
                value: numericValue
              };
            }
            return deal;
          });
          return {
            ...stage,
            deals: newDeals
          };
        });
        return {
          ...pipeline,
          stages: newStages
        };
      });
    });
    setEditingValue(null);
    setTempValue("");
  };
  const handleCancelEdit = () => {
    setEditingTitle(null);
    setEditingDescription(null);
    setEditingValue(null);
    setTempTitle("");
    setTempDescription("");
    setTempValue("");
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
            return {
              ...stage,
              title: tempStageTitle
            };
          }
          return stage;
        });
        return {
          ...pipeline,
          stages: newStages
        };
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
          stages: [...pipeline.stages, {
            id: newStageId,
            title: newStageTitle,
            deals: []
          }]
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
    const clientInfo = getClientDisplayInfo(deal);
    setTempCardData({
      ...deal,
      contact: clientInfo.name,
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
              const selectedClient = clients.find(c => c.id === tempCardData.client_id);
              return {
                ...deal,
                ...tempCardData,
                client: selectedClient?.company || tempCardData.client || deal.client,
                contact: selectedClient?.name || tempCardData.contact || deal.contact
              };
            }
            return deal;
          });
          return {
            ...stage,
            deals: newDeals
          };
        });
        return {
          ...pipeline,
          stages: newStages
        };
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
          return {
            ...pipeline,
            stages: newStages
          };
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
              return {
                ...deal,
                confidential: tempConfidentialValue
              };
            }
            return deal;
          });
          return {
            ...stage,
            deals: newDeals
          };
        });
        return {
          ...pipeline,
          stages: newStages
        };
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
      created_at: new Date().toISOString(),
      author_id: user?.id || ""
    };
    setPipelines(prevPipelines => {
      return prevPipelines.map(pipeline => {
        if (pipeline.id !== selectedPipeline) return pipeline;
        const newStages = pipeline.stages.map(stage => {
          if (stage.id !== stageId) return stage;
          const newDeals = stage.deals.map(deal => {
            if (deal.id === dealId) {
              return {
                ...deal,
                notes: [...(deal.notes || []), note]
              };
            }
            return deal;
          });
          return {
            ...stage,
            deals: newDeals
          };
        });
        return {
          ...pipeline,
          stages: newStages
        };
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
          return {
            ...stage,
            deals: newDeals
          };
        });
        return {
          ...pipeline,
          stages: newStages
        };
      });
    });
  };
  const handleAddPipeline = () => {
    if (!newPipelineData.name.trim()) return;
    const newPipeline: Pipeline = {
      id: `pipeline-${Date.now()}`,
      name: newPipelineData.name,
      stages: [{
        id: `stage-${Date.now()}-1`,
        title: "Novo Estágio",
        deals: [],
        pipeline_id: `pipeline-${Date.now()}`,
        position: 0
      }],
      user_id: user?.id || ""
    };
    setPipelines(prev => [...prev, newPipeline]);
    setNewPipelineData({
      name: ""
    });
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
          return {
            ...pipeline,
            name: tempPipelineName
          };
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
      if (pipelineId === selectedPipeline) {
        const remainingPipelines = pipelines.filter(p => p.id !== pipelineId);
        if (remainingPipelines.length > 0) {
          setSelectedPipeline(remainingPipelines[0].id);
        }
      }
    }
  };
  const handleAddNewDeal = () => {
    if (!newDealData.title.trim()) {
      alert('O título é obrigatório');
      return;
    }
    if (!newDealData.stage_id) {
      alert('Selecione um estágio');
      return;
    }
    const selectedClient = clients.find(c => c.id === newDealData.client_id);
    const newDeal: Deal = {
      id: `deal-${Date.now()}`,
      title: newDealData.title,
      description: newDealData.description,
      client: selectedClient?.company || "",
      client_id: newDealData.client_id,
      contact: selectedClient?.name || newDealData.contact,
      priority: newDealData.priority,
      stage_id: newDealData.stage_id,
      notes: [],
      user_id: user?.id || ""
    };
    setPipelines(prevPipelines => {
      const updatedPipelines = prevPipelines.map(pipeline => {
        if (pipeline.id !== selectedPipeline) return pipeline;
        const newStages = pipeline.stages.map(stage => {
          if (stage.id === newDealData.stage_id) {
            return {
              ...stage,
              deals: [...stage.deals, newDeal]
            };
          }
          return stage;
        });
        return {
          ...pipeline,
          stages: newStages
        };
      });
      return updatedPipelines;
    });
    setNewDealData({
      title: "",
      description: "",
      client_id: "",
      contact: "",
      priority: "low",
      stage_id: ""
    });
    setIsAddDealDialogOpen(false);
  };
  const handleStageDoubleClick = (stageId: string, currentTitle: string) => {
    if (!isClientView) {
      setEditingStage(stageId);
      setTempStageTitle(currentTitle);
    }
  };
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    // Handle moving deals between stages
    const pipeline = currentPipeline;
    if (!pipeline) return;

    const sourceStage = pipeline.stages.find(s => s.id === source.droppableId);
    const destStage = pipeline.stages.find(s => s.id === destination.droppableId);
    
    if (!sourceStage || !destStage) return;

    const deal = sourceStage.deals.find(d => d.id === draggableId);
    if (!deal) return;

    // Update local state immediately for better UX
    const newPipelines = pipelines.map(p => {
      if (p.id !== pipeline.id) return p;
      
      return {
        ...p,
        stages: p.stages.map(stage => {
          if (stage.id === source.droppableId) {
            // Remove deal from source stage
            return {
              ...stage,
              deals: stage.deals.filter(d => d.id !== draggableId)
            };
          } else if (stage.id === destination.droppableId) {
            // Add deal to destination stage
            const newDeals = [...stage.deals];
            newDeals.splice(destination.index, 0, deal);
            return {
              ...stage,
              deals: newDeals
            };
          }
          return stage;
        })
      };
    });

    setPipelines(newPipelines);

    // Update in database
    updateDealStage(draggableId, destination.droppableId, destination.index);
  };

  const updateDealStage = async (dealId: string, newStageId: string, newPosition: number) => {
    try {
      const { error } = await supabase
        .from('deals')
        .update({
          stage_id: newStageId,
          position: newPosition
        })
        .eq('id', dealId);

      if (error) {
        console.error('Error updating deal:', error);
        toast({
          title: "Error",
          description: "Failed to update deal position",
          variant: "destructive",
        });
        // Reload data to sync with database
        loadPipelines();
      }
    } catch (error) {
      console.error('Error updating deal:', error);
    }
  };

  const handleCreateStage = async () => {
    if (!user || !newStage.title || !newStage.pipelineId) return;

    try {
      const pipeline = pipelines.find(p => p.id === newStage.pipelineId);
      const position = pipeline ? pipeline.stages.length : 0;

      const { data, error } = await supabase
        .from('stages')
        .insert([{
          title: newStage.title,
          pipeline_id: newStage.pipelineId,
          position: position
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating stage:', error);
        toast({
          title: "Error",
          description: "Failed to create stage",
          variant: "destructive",
        });
        return;
      }

      // Update local state
      setPipelines(prevPipelines => 
        prevPipelines.map(p => 
          p.id === newStage.pipelineId 
            ? {
                ...p,
                stages: [...p.stages, {
                  id: data.id,
                  title: data.title,
                  pipeline_id: data.pipeline_id,
                  position: data.position,
                  deals: []
                }]
              }
            : p
        )
      );

      setNewStage({ title: '', pipelineId: '' });
      setIsCreateStageOpen(false);
      
      toast({
        title: "Success",
        description: "Stage created successfully",
      });
    } catch (error) {
      console.error('Error creating stage:', error);
    }
  };

  const handleCreateDeal = async () => {
    if (!user || !newDeal.title || !newDeal.stageId) return;

    try {
      const stage = getStageById(newDeal.stageId);
      const position = stage ? stage.deals.length : 0;

      const { data, error } = await supabase
        .from('deals')
        .insert([{
          title: newDeal.title,
          description: newDeal.description || null,
          client_id: newDeal.clientId || null,
          contact: newDeal.contact || null,
          value: newDeal.value ? parseFloat(newDeal.value) : null,
          priority: newDeal.priority,
          stage_id: newDeal.stageId,
          confidential: newDeal.confidential || null,
          position: position,
          user_id: user.id
        }])
        .select(`
          *,
          client:clients(*),
          notes:notes(*)
        `)
        .single();

      if (error) {
        console.error('Error creating deal:', error);
        toast({
          title: "Error",
          description: "Failed to create deal",
          variant: "destructive",
        });
        return;
      }

      // Convert and update local state
      const newDealConverted = convertDatabaseDealToDeal({
        ...data,
        client: data.client,
        notes: data.notes || []
      });

      setPipelines(prevPipelines => 
        prevPipelines.map(p => ({
          ...p,
          stages: p.stages.map(stage => 
            stage.id === newDeal.stageId 
              ? { ...stage, deals: [...stage.deals, newDealConverted] }
              : stage
          )
        }))
      );

      setNewDeal({
        title: '',
        description: '',
        clientId: '',
        contact: '',
        value: '',
        priority: 'low',
        stageId: '',
        confidential: ''
      });
      setIsCreateDealOpen(false);
      
      toast({
        title: "Success",
        description: "Deal created successfully",
      });
    } catch (error) {
      console.error('Error creating deal:', error);
    }
  };

  const getStageById = (stageId: string) => {
    const pipeline = currentPipeline;
    return pipeline?.stages.find(s => s.id === stageId);
  };

  const getCurrentPipeline = () => {
    return pipelines.find(p => p.id === selectedPipeline);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Pipeline Kanban</h2>
            <p className="text-sm text-slate-600">Gerencie seus deals com drag & drop</p>
          </div>
          
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
          {editingPipeline && <div className="flex items-center gap-2">
              <Input value={tempPipelineName} onChange={e => setTempPipelineName(e.target.value)} className="h-8 w-40" placeholder="Nome do pipeline" />
              <Button size="sm" variant="ghost" onClick={handleSavePipeline} className="h-8 w-8 p-0">
                <Check className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setEditingPipeline(null)} className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>}
        </div>
        
        {!isClientView && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              Filtros
            </Button>
            
            <Dialog open={isAddClientDialogOpen} onOpenChange={setIsAddClientDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Cliente
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Novo Cliente</DialogTitle>
                  <DialogDescription>
                    Adicione um novo cliente ao sistema
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nome *</label>
                    <Input 
                      value={newClientData.name}
                      onChange={(e) => setNewClientData({...newClientData, name: e.target.value})}
                      placeholder="Nome do cliente"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Empresa *</label>
                    <Input 
                      value={newClientData.company}
                      onChange={(e) => setNewClientData({...newClientData, company: e.target.value})}
                      placeholder="Nome da empresa"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email *</label>
                    <Input 
                      type="email"
                      value={newClientData.email}
                      onChange={(e) => setNewClientData({...newClientData, email: e.target.value})}
                      placeholder="email@exemplo.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Telefone</label>
                    <Input 
                      value={newClientData.phone}
                      onChange={(e) => setNewClientData({...newClientData, phone: e.target.value})}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAddClientDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleAddNewClient}>
                      Adicionar Cliente
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
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
                    <Input value={newPipelineData.name} onChange={e => setNewPipelineData({
                  ...newPipelineData,
                  name: e.target.value
                })} placeholder="Ex: Vendas, Projetos, Marketing..." />
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
            <Dialog open={isAddDealDialogOpen} onOpenChange={open => {
          setIsAddDealDialogOpen(open);
        }}>
              <DialogTrigger asChild>
                <Button onClick={() => {
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
                    <Input value={newDealData.title} onChange={e => {
                  setNewDealData({
                    ...newDealData,
                    title: e.target.value
                  });
                }} placeholder="Nome do deal ou projeto" />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Descrição</label>
                    <Textarea value={newDealData.description} onChange={e => setNewDealData({
                  ...newDealData,
                  description: e.target.value
                })} placeholder="Descrição do deal" className="min-h-[80px]" />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Cliente</label>
                    <Select value={newDealData.client_id} onValueChange={value => {
                  setNewDealData({
                    ...newDealData,
                    client_id: value
                  });
                }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map(client => <SelectItem key={client.id} value={client.id}>
                            {client.name} ({client.company})
                          </SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Contato</label>
                    <Input value={newDealData.contact} onChange={e => setNewDealData({
                  ...newDealData,
                  contact: e.target.value
                })} placeholder="Nome do contato (se não for um cliente cadastrado)" />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Prioridade</label>
                    <Select value={newDealData.priority} onValueChange={(value: "low" | "medium" | "high") => setNewDealData({
                  ...newDealData,
                  priority: value
                })}>
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
                    <Select value={newDealData.stage_id} onValueChange={value => {
                  setNewDealData({
                    ...newDealData,
                    stage_id: value
                  });
                }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um estágio" />
                      </SelectTrigger>
                      <SelectContent>
                        {currentPipeline.stages.map(stage => <SelectItem key={stage.id} value={stage.id}>
                            {stage.title}
                          </SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => {
                  setIsAddDealDialogOpen(false);
                }}>
                      Cancelar
                    </Button>
                    <Button onClick={() => {
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
      {currentPipeline ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-6 overflow-x-auto pb-6">
            {currentPipeline.stages.map(stage => <div key={stage.id} className="flex-shrink-0 w-80">
                <div className="bg-slate-50 rounded-lg shadow-sm border border-slate-200">
                  <div className="p-3 border-b border-slate-200 bg-slate-100 rounded-t-lg">
                    {editingStage === stage.id ? <div className="flex items-center gap-2">
                        <Input value={tempStageTitle} onChange={e => setTempStageTitle(e.target.value)} className="h-8" />
                        <Button size="sm" variant="ghost" onClick={handleSaveStage} className="h-8 w-8 p-0">
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={handleCancelEditStage} className="h-8 w-8 p-0">
                          <X className="h-4 w-4" />
                        </Button>
                      </div> : <div className="flex items-center justify-between">
                        <h3 className="font-medium text-slate-800 flex items-center cursor-pointer" onDoubleClick={() => handleStageDoubleClick(stage.id, stage.title)}>
                          {stage.title}
                          <Badge variant="outline" className="ml-2 bg-white">
                            {stage.deals.length}
                          </Badge>
                        </h3>
                      </div>}
                  
                  <Droppable droppableId={stage.id}>
                    {provided => <div ref={provided.innerRef} {...provided.droppableProps} className="min-h-[200px] p-3 space-y-3">
                        {stage.deals.map((deal, index) => (
                          <Draggable key={deal.id} draggableId={deal.id} index={index} isDragDisabled={isClientView}>
                            {provided => (
                              <div 
                                ref={provided.innerRef} 
                                {...provided.draggableProps} 
                                {...provided.dragHandleProps} 
                                className="bg-white rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
                              >
                                <div className="p-3">
                                  <div className="flex justify-between items-start">
                                    {/* Título editável inline */}
                                    {editingTitle === deal.id ? (
                                      <div className="flex-1 mr-2">
                                        <Input 
                                          value={tempTitle} 
                                          onChange={e => setTempTitle(e.target.value)} 
                                          className="text-sm font-medium" 
                                          onBlur={() => handleSaveTitle(deal.id, stage.id)} 
                                          onKeyDown={e => {
                                            if (e.key === 'Enter') {
                                              handleSaveTitle(deal.id, stage.id);
                                            } else if (e.key === 'Escape') {
                                              handleCancelEdit();
                                            }
                                          }} 
                                          autoFocus 
                                        />
                                      </div>
                                    ) : (
                                      <h4 
                                        className="font-medium text-slate-800 cursor-pointer hover:bg-slate-50 p-1 rounded flex-1" 
                                        onDoubleClick={() => !isClientView && handleEditTitle(deal.id, deal.title)}
                                      >
                                        {deal.title}
                                      </h4>
                                    )}
                                    
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
                                        {expandedCards.has(deal.id) ? 
                                          <ChevronDown className="h-4 w-4" /> : 
                                          <ChevronRight className="h-4 w-4" />
                                        }
                                      </Button>
                                    </div>
                                  </div>
                                  
                                  {/* Descrição editável inline */}
                                  {editingDescription === deal.id ? (
                                    <div className="mt-1">
                                      <Textarea 
                                        value={tempDescription} 
                                        onChange={e => setTempDescription(e.target.value)} 
                                        className="text-sm min-h-[60px]" 
                                        onBlur={() => handleSaveDescription(deal.id, stage.id)} 
                                        onKeyDown={e => {
                                          if (e.key === 'Enter' && e.ctrlKey) {
                                            handleSaveDescription(deal.id, stage.id);
                                          } else if (e.key === 'Escape') {
                                            handleCancelEdit();
                                          }
                                        }} 
                                        autoFocus 
                                      />
                                    </div>
                                  ) : deal.description && (
                                    <p 
                                      className="text-sm text-slate-600 mt-1 line-clamp-2 cursor-pointer hover:bg-slate-50 p-1 rounded" 
                                      onDoubleClick={() => !isClientView && handleEditDescription(deal.id, deal.description)}
                                    >
                                      {deal.description}
                                    </p>
                                  )}
                                  
                                  {/* Client information with avatar */}
                                  {(() => {
                                    const clientInfo = getClientDisplayInfo(deal);
                                    return (
                                      <>
                                        {clientInfo.company && (
                                          <div className="flex items-center gap-2 mt-2">
                                            <Avatar className="h-6 w-6">
                                              {clientInfo.avatar && (
                                                <AvatarImage src={clientInfo.avatar} alt={clientInfo.name} />
                                              )}
                                              <AvatarFallback className="text-xs">
                                                {clientInfo.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                              </AvatarFallback>
                                            </Avatar>
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                              {getCompanyIcon(clientInfo.company)}
                                              <span>{clientInfo.company}</span>
                                            </div>
                                          </div>
                                        )}
                                        
                                        {clientInfo.name && (
                                          <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                                            <User className="h-3 w-3" />
                                            <span>{clientInfo.name}</span>
                                          </div>
                                        )}
                                      </>
                                    );
                                  })()}
                                  
                                  {/* Rest of the card content when expanded */}
                                  {expandedCards.has(deal.id) && (
                                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-3">
                                      {/* Valor editável inline - só aparece quando expandido */}
                                      {editingValue === deal.id ? (
                                        <div>
                                          <label className="text-xs font-medium text-slate-700 block mb-1">Valor</label>
                                          <Input 
                                            type="number" 
                                            value={tempValue} 
                                            onChange={e => setTempValue(e.target.value)} 
                                            className="text-sm" 
                                            onBlur={() => handleSaveValue(deal.id, stage.id)} 
                                            onKeyDown={e => {
                                              if (e.key === 'Enter') {
                                                handleSaveValue(deal.id, stage.id);
                                              } else if (e.key === 'Escape') {
                                                handleCancelEdit();
                                              }
                                            }} 
                                            autoFocus 
                                          />
                                        </div>
                                      ) : deal.value && (
                                        <div>
                                          <label className="text-xs font-medium text-slate-700 block mb-1">Valor</label>
                                          <div 
                                            className="text-sm text-slate-600 cursor-pointer hover:bg-slate-50 p-1 rounded" 
                                            onDoubleClick={() => !isClientView && handleEditValue(deal.id, deal.value)}
                                          >
                                            <span className="font-medium text-green-600">
                                              {getFormattedValue(deal.value)}
                                            </span>
                                          </div>
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
                                              onChange={e => setTempConfidentialValue(e.target.value)} 
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
                                                    {new Date(note.created_at).toLocaleDateString()} por {note.author_id}
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
                                                onChange={e => setNewNote(e.target.value)} 
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
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>}
                  </Droppable>
                  
                  {!isClientView && !addingStage && <div className="p-3 border-t border-slate-200">
                      <Button variant="ghost" size="sm" onClick={() => setIsAddDealDialogOpen(true)} className="w-full justify-center text-slate-600 hover:text-slate-900">
                        <Plus className="h-4 w-4 mr-1" />
                        Adicionar Card
                      </Button>
                    </div>}
                </div>
              </div>)}
            
            {!isClientView && <div className="flex-shrink-0 w-80">
                {addingStage ? <div className="bg-slate-50 rounded-lg shadow-sm border border-slate-200 p-3">
                    <h3 className="font-medium text-slate-800 mb-2">Novo Estágio</h3>
                    <Input value={newStageTitle} onChange={e => setNewStageTitle(e.target.value)} placeholder="Nome do estágio" className="mb-3" />
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
                  </div> : <Button variant="outline" className="border-dashed border-2 h-12 w-full" onClick={() => setAddingStage(true)}>
                    <Plus className="h-5 w-5 mr-1" />
                    Adicionar Estágio
                  </Button>}
              </div>}
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
                  <Input value={tempCardData.title || ""} onChange={e => setTempCardData({
                  ...tempCardData,
                  title: e.target.value
                })} />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Descrição</label>
                  <Textarea value={tempCardData.description || ""} onChange={e => setTempCardData({
                  ...tempCardData,
                  description: e.target.value
                })} className="min-h-[100px]" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Cliente</label>
                  <Select value={tempCardData.client_id || ""} onValueChange={value => {
                  const selectedClient = clients.find(c => c.id === value);
                  setTempCardData({
                    ...tempCardData,
                    client_id: value,
                    client: selectedClient?.company || "",
                    contact: selectedClient?.name || ""
                  });
                }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map(client => <SelectItem key={client.id} value={client.id}>
                          {client.name} ({client.company})
                        </SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Contato</label>
                  <Input value={tempCardData.contact || ""} onChange={e => setTempCardData({
                  ...tempCardData,
                  contact: e.target.value
                })} />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Valor (R$)</label>
                  <Input type="number" value={tempCardData.value || ""} onChange={e => setTempCardData({
                  ...tempCardData,
                  value: parseFloat(e.target.value)
                })} />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Prioridade</label>
                  <Select value={tempCardData.priority || "low"} onValueChange={(value: "low" | "medium" | "high") => setTempCardData({
                  ...tempCardData,
                  priority: value
                })}>
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
