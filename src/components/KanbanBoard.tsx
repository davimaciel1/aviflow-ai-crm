import { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  User,
  Plus,
  Edit3,
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
  MoreHorizontal
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Note {
  id: string;
  content: string;
  author: string;
  authorRole: 'admin' | 'client';
  timestamp: string;
  attachments?: {
    type: 'photo' | 'video';
    url: string;
    name: string;
  }[];
}

interface Deal {
  id: string;
  title: string;
  client: string;
  clientId: string;
  companyName: string;
  contact: string;
  priority: "low" | "medium" | "high";
  description?: string;
  confidentialInfo: string;
  notes: Note[];
  avatar?: string;
}

interface Column {
  id: string;
  title: string;
  deals: Deal[];
  color: string;
}

interface Pipeline {
  id: string;
  name: string;
  columns: Column[];
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
  const [isEditSheetOpen, setIsEditSheetOpen] = useState<boolean>(false);
  const [newNote, setNewNote] = useState<string>("");

  // Lista de empresas disponíveis
  const companies = [
    { id: "techcorp", name: "TechCorp Ltd" },
    { id: "startupxyz", name: "StartupXYZ" },
    { id: "abccorp", name: "ABC Corporation" },
    { id: "retailplus", name: "RetailPlus" },
    { id: "datacorp", name: "DataCorp" },
    { id: "shopmais", name: "ShopMais" }
  ];

  const [pipelines, setPipelines] = useState<Pipeline[]>([
    {
      id: "sales",
      name: "Pipeline de Vendas",
      columns: [
        {
          id: "prospecting",
          title: "Prospecção",
          color: "bg-slate-100",
          deals: [
            {
              id: "1",
              title: "Sistema ERP - TechCorp",
              client: "TechCorp Ltd",
              clientId: "techcorp",
              companyName: "TechCorp Ltd",
              contact: "João Silva",
              priority: "high",
              description: "Implementação de sistema ERP completo",
              confidentialInfo: "Margem: 45% - Concorrente: Oracle",
              notes: [
                {
                  id: "note1",
                  content: "Cliente muito interessado no projeto. Reunião agendada para próxima semana.",
                  author: "Admin User",
                  authorRole: "admin",
                  timestamp: "2024-06-10T10:30:00Z"
                }
              ],
              avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face"
            },
            {
              id: "2",
              title: "Consultoria Digital - StartupXYZ",
              client: "StartupXYZ",
              clientId: "startupxyz",
              companyName: "StartupXYZ",
              contact: "Maria Santos",
              priority: "medium",
              description: "Consultoria para transformação digital",
              confidentialInfo: "Budget máximo: R$ 100k",
              notes: [],
              avatar: undefined
            }
          ]
        },
        {
          id: "qualification",
          title: "Qualificação",
          color: "bg-blue-50",
          deals: [
            {
              id: "3",
              title: "Website Institucional - ABC Corp",
              client: "ABC Corporation",
              clientId: "abccorp",
              companyName: "ABC Corporation",
              contact: "Pedro Oliveira",
              priority: "medium",
              description: "Desenvolvimento de website corporativo",
              confidentialInfo: "Decisor: CEO Pedro",
              notes: [],
              avatar: undefined
            }
          ]
        },
        {
          id: "proposal",
          title: "Proposta",
          color: "bg-yellow-50",
          deals: [
            {
              id: "4",
              title: "App Mobile - RetailPlus",
              client: "RetailPlus",
              clientId: "retailplus",
              companyName: "RetailPlus",
              contact: "Ana Costa",
              priority: "high",
              description: "Aplicativo mobile para e-commerce",
              confidentialInfo: "Reunião de fechamento agendada para sexta",
              notes: [],
              avatar: undefined
            }
          ]
        },
        {
          id: "negotiation",
          title: "Negociação",
          color: "bg-orange-50",
          deals: [
            {
              id: "5",
              title: "Dashboard Analytics - DataCorp",
              client: "DataCorp",
              clientId: "datacorp",
              companyName: "DataCorp",
              contact: "Carlos Lima",
              priority: "high",
              description: "Dashboard para análise de dados",
              confidentialInfo: "Aguardando aprovação do board",
              notes: [],
              avatar: undefined
            }
          ]
        },
        {
          id: "won",
          title: "Fechados",
          color: "bg-green-50",
          deals: [
            {
              id: "6",
              title: "E-commerce - ShopMais",
              client: "ShopMais",
              clientId: "shopmais",
              companyName: "ShopMais",
              contact: "Lucas Ferreira",
              priority: "medium",
              description: "Plataforma de e-commerce completa",
              confidentialInfo: "Projeto finalizado com sucesso",
              notes: [],
              avatar: undefined
            }
          ]
        }
      ]
    },
    {
      id: "support",
      name: "Pipeline de Suporte",
      columns: [
        {
          id: "new",
          title: "Novos",
          color: "bg-red-50",
          deals: [
            {
              id: "7",
              title: "Bug Sistema ERP",
              client: "TechCorp Ltd",
              clientId: "techcorp",
              companyName: "TechCorp Ltd",
              contact: "João Silva",
              priority: "high",
              description: "Correção de bug crítico no sistema",
              confidentialInfo: "Bug afeta módulo financeiro",
              notes: [],
              avatar: undefined
            }
          ]
        },
        {
          id: "in_progress",
          title: "Em Andamento",
          color: "bg-yellow-50",
          deals: []
        },
        {
          id: "testing",
          title: "Testando",
          color: "bg-blue-50",
          deals: []
        },
        {
          id: "resolved",
          title: "Resolvidos",
          color: "bg-green-50",
          deals: []
        }
      ]
    },
    {
      id: "projects",
      name: "Pipeline de Projetos",
      columns: [
        {
          id: "planning",
          title: "Planejamento",
          color: "bg-purple-50",
          deals: []
        },
        {
          id: "development",
          title: "Desenvolvimento",
          color: "bg-blue-50",
          deals: []
        },
        {
          id: "testing_proj",
          title: "Testes",
          color: "bg-yellow-50",
          deals: []
        },
        {
          id: "delivery",
          title: "Entrega",
          color: "bg-green-50",
          deals: []
        }
      ]
    }
  ]);

  const currentPipeline = pipelines.find(p => p.id === selectedPipeline) || pipelines[0];

  // Filter deals for client view
  const getFilteredColumns = () => {
    if (!isClientView || !user?.clientId) {
      return currentPipeline.columns;
    }

    return currentPipeline.columns.map(column => ({
      ...column,
      deals: column.deals.filter(deal => deal.clientId === user.clientId)
    }));
  };

  // Stage management functions
  const handleAddStage = () => {
    if (!newStageTitle.trim()) return;
    
    const newStageId = `stage_${Date.now()}`;
    const colors = ["bg-slate-100", "bg-blue-50", "bg-yellow-50", "bg-orange-50", "bg-green-50", "bg-purple-50"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    setPipelines(prev => prev.map(pipeline => {
      if (pipeline.id === selectedPipeline) {
        return {
          ...pipeline,
          columns: [...pipeline.columns, {
            id: newStageId,
            title: newStageTitle,
            color: randomColor,
            deals: []
          }]
        };
      }
      return pipeline;
    }));
    
    setAddingStage(false);
    setNewStageTitle("");
  };

  const handleDeleteStage = (columnId: string) => {
    if (window.confirm("Tem certeza que deseja excluir este stage? Todos os cards serão movidos para o primeiro stage.")) {
      setPipelines(prev => prev.map(pipeline => {
        if (pipeline.id === selectedPipeline) {
          const columnToDelete = pipeline.columns.find(col => col.id === columnId);
          const firstColumn = pipeline.columns[0];
          
          if (!columnToDelete || !firstColumn || columnId === firstColumn.id) return pipeline;
          
          const updatedColumns = pipeline.columns.filter(col => col.id !== columnId);
          
          // Move deals from deleted column to first column
          if (columnToDelete.deals.length > 0) {
            updatedColumns[0] = {
              ...updatedColumns[0],
              deals: [...updatedColumns[0].deals, ...columnToDelete.deals]
            };
          }
          
          return {
            ...pipeline,
            columns: updatedColumns
          };
        }
        return pipeline;
      }));
    }
  };

  // Stage editing functions
  const handleEditStage = (columnId: string, currentTitle: string) => {
    setEditingStage(columnId);
    setTempStageTitle(currentTitle);
  };

  const handleSaveStage = (columnId: string) => {
    setPipelines(prev => prev.map(pipeline => {
      if (pipeline.id === selectedPipeline) {
        return {
          ...pipeline,
          columns: pipeline.columns.map(col => 
            col.id === columnId ? { ...col, title: tempStageTitle } : col
          )
        };
      }
      return pipeline;
    }));
    setEditingStage(null);
    setTempStageTitle("");
  };

  const handleCancelStageEdit = () => {
    setEditingStage(null);
    setTempStageTitle("");
  };

  // Card editing functions with pipeline selection
  const handleEditCard = (deal: Deal) => {
    setEditingCard(deal.id);
    setTempCardData({
      title: deal.title,
      description: deal.description || "",
      contact: deal.contact,
      companyName: deal.companyName,
      clientId: deal.clientId,
      confidentialInfo: deal.confidentialInfo || "",
      notes: deal.notes || []
    });
    setIsEditSheetOpen(true);
  };

  const handleSaveCard = (dealId: string) => {
    setPipelines(prev => prev.map(pipeline => {
      if (pipeline.id === selectedPipeline) {
        return {
          ...pipeline,
          columns: pipeline.columns.map(col => ({
            ...col,
            deals: col.deals.map(deal => 
              deal.id === dealId ? { 
                ...deal, 
                ...tempCardData,
                client: tempCardData.companyName || deal.client
              } : deal
            )
          }))
        };
      }
      return pipeline;
    }));
    setEditingCard(null);
    setTempCardData({});
    setIsEditSheetOpen(false);
  };

  const handleAddNote = () => {
    if (!newNote.trim() || !editingCard || !user) return;

    const note: Note = {
      id: `note_${Date.now()}`,
      content: newNote,
      author: user.name,
      authorRole: user.role,
      timestamp: new Date().toISOString()
    };

    setTempCardData(prev => ({
      ...prev,
      notes: [...(prev.notes || []), note]
    }));

    setNewNote("");
  };

  const handleFileUpload = (type: 'photo' | 'video') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = type === 'photo' ? 'image/*' : 'video/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        console.log(`Uploading ${type}:`, file.name);
        
        const mockUrl = URL.createObjectURL(file);
        
        // Create a new note with the attachment
        if (!user) return;
        
        const noteWithAttachment: Note = {
          id: `note_${Date.now()}`,
          content: `${type === 'photo' ? 'Foto' : 'Vídeo'} adicionado`,
          author: user.name,
          authorRole: user.role,
          timestamp: new Date().toISOString(),
          attachments: [{
            type,
            url: mockUrl,
            name: file.name
          }]
        };

        setTempCardData(prev => ({
          ...prev,
          notes: [...(prev.notes || []), noteWithAttachment]
        }));
      }
    };
    input.click();
  };

  const handleEditConfidential = (dealId: string, currentValue: string = "") => {
    setEditingConfidential(dealId);
    setTempConfidentialValue(currentValue);
  };

  const handleSaveConfidential = (dealId: string) => {
    setPipelines(prev => prev.map(pipeline => {
      if (pipeline.id === selectedPipeline) {
        return {
          ...pipeline,
          columns: pipeline.columns.map(col => ({
            ...col,
            deals: col.deals.map(deal => 
              deal.id === dealId ? { ...deal, confidentialInfo: tempConfidentialValue } : deal
            )
          }))
        };
      }
      return pipeline;
    }));
    setEditingConfidential(null);
    setTempConfidentialValue("");
  };

  const handleCancelConfidentialEdit = () => {
    setEditingConfidential(null);
    setTempConfidentialValue("");
  };

  // Move card between pipelines
  const handleMoveToPipeline = (dealId: string, targetPipelineId: string) => {
    if (targetPipelineId === selectedPipeline) return;
    
    let dealToMove: Deal | null = null;
    
    // Remove deal from current pipeline
    setPipelines(prev => prev.map(pipeline => {
      if (pipeline.id === selectedPipeline) {
        const updatedColumns = pipeline.columns.map(col => {
          const dealIndex = col.deals.findIndex(d => d.id === dealId);
          if (dealIndex !== -1) {
            dealToMove = col.deals[dealIndex];
            return {
              ...col,
              deals: col.deals.filter(d => d.id !== dealId)
            };
          }
          return col;
        });
        return { ...pipeline, columns: updatedColumns };
      }
      return pipeline;
    }));
    
    // Add deal to target pipeline's first column
    if (dealToMove) {
      setPipelines(prev => prev.map(pipeline => {
        if (pipeline.id === targetPipelineId) {
          const updatedColumns = [...pipeline.columns];
          if (updatedColumns.length > 0) {
            updatedColumns[0] = {
              ...updatedColumns[0],
              deals: [...updatedColumns[0].deals, dealToMove!]
            };
          }
          return { ...pipeline, columns: updatedColumns };
        }
        return pipeline;
      }));
    }
  };

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId, type } = result;

    // Se não há destino (dropped outside), retorna
    if (!destination) {
      return;
    }

    // Se dropped na mesma posição, retorna
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Se está reordenando stages
    if (type === "stage") {
      if (isClientView) return; // Clientes não podem reordenar stages
      
      setPipelines(prev => prev.map(pipeline => {
        if (pipeline.id === selectedPipeline) {
          const newColumns = Array.from(pipeline.columns);
          const [reorderedColumn] = newColumns.splice(source.index, 1);
          newColumns.splice(destination.index, 0, reorderedColumn);
          
          return {
            ...pipeline,
            columns: newColumns
          };
        }
        return pipeline;
      }));
      return;
    }

    // Disable card drag & drop for client view
    if (isClientView) {
      return;
    }

    // Reordenação de cards (código existente)
    setPipelines(prev => prev.map(pipeline => {
      if (pipeline.id === selectedPipeline) {
        // Encontrar as colunas de origem e destino
        const sourceColumn = pipeline.columns.find(col => col.id === source.droppableId);
        const destColumn = pipeline.columns.find(col => col.id === destination.droppableId);
        
        if (!sourceColumn || !destColumn) return pipeline;

        // Encontrar o deal sendo movido
        const deal = sourceColumn.deals.find(d => d.id === draggableId);
        if (!deal) return pipeline;

        // Se movendo dentro da mesma coluna
        if (source.droppableId === destination.droppableId) {
          const newDeals = Array.from(sourceColumn.deals);
          newDeals.splice(source.index, 1);
          newDeals.splice(destination.index, 0, deal);

          return {
            ...pipeline,
            columns: pipeline.columns.map(col =>
              col.id === source.droppableId
                ? { ...col, deals: newDeals }
                : col
            )
          };
        }

        // Movendo entre colunas diferentes
        const sourceDeals = Array.from(sourceColumn.deals);
        const destDeals = Array.from(destColumn.deals);

        // Remover da coluna de origem
        sourceDeals.splice(source.index, 1);
        
        // Adicionar à coluna de destino
        destDeals.splice(destination.index, 0, deal);

        return {
          ...pipeline,
          columns: pipeline.columns.map(col => {
            if (col.id === source.droppableId) {
              return { ...col, deals: sourceDeals };
            }
            if (col.id === destination.droppableId) {
              return { ...col, deals: destDeals };
            }
            return col;
          })
        };
      }
      return pipeline;
    }));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const DealCard = ({ deal, index }: { deal: Deal; index: number }) => (
    <Draggable draggableId={deal.id} index={index} isDragDisabled={isClientView}>
      {(provided, snapshot) => (
        <Card 
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`mb-4 hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 ${
            deal.priority === 'high' ? 'border-l-red-500' : 
            deal.priority === 'medium' ? 'border-l-yellow-500' : 'border-l-green-500'
          } ${snapshot.isDragging ? 'shadow-2xl transform rotate-2 scale-105' : ''}`}
        >
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start gap-3">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-sm font-semibold leading-tight text-slate-900 mb-2">
                  {deal.title}
                </CardTitle>
                {deal.description && (
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {deal.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Avatar className="w-8 h-8 border-2 border-white shadow-sm">
                  {deal.avatar ? (
                    <AvatarImage src={deal.avatar} alt={deal.companyName} />
                  ) : null}
                  <AvatarFallback className="text-xs font-medium bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                    {getInitials(deal.companyName)}
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditCard(deal)}
                  className="h-8 w-8 p-0 hover:bg-slate-100"
                >
                  <Edit3 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-3 pt-0">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Building className="w-4 h-4 text-slate-400" />
                <span className="font-medium truncate">{deal.companyName}</span>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <User className="w-4 h-4 text-slate-400" />
                <span className="truncate">{deal.contact}</span>
              </div>
            </div>
            
            {/* Show confidential info only to admins */}
            {!isClientView && deal.confidentialInfo && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1">
                    <Shield className="w-3 h-3 text-red-600" />
                    <strong className="text-xs text-red-800 font-semibold">Confidencial</strong>
                  </div>
                  {editingConfidential !== deal.id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditConfidential(deal.id, deal.confidentialInfo || "")}
                      className="h-6 w-6 p-0 hover:bg-red-100"
                    >
                      <Edit3 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
                
                {editingConfidential === deal.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={tempConfidentialValue}
                      onChange={(e) => setTempConfidentialValue(e.target.value)}
                      placeholder="Informações confidenciais..."
                      className="text-xs min-h-[60px] resize-none border-red-200"
                    />
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        onClick={() => handleSaveConfidential(deal.id)}
                        className="h-6 px-2 text-xs"
                      >
                        <Check className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelConfidentialEdit}
                        className="h-6 px-2 text-xs"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-red-800 leading-relaxed">{deal.confidentialInfo}</div>
                )}
              </div>
            )}
            
            {/* Show notes preview - only header with count */}
            {deal.notes && deal.notes.length > 0 && (
              <div 
                className="p-3 bg-blue-50 border border-blue-200 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
                onDoubleClick={() => handleEditCard(deal)}
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-3 h-3 text-blue-600" />
                  <strong className="text-xs text-blue-800 font-semibold">Anotações & Insights</strong>
                  <Badge variant="secondary" className="text-xs">
                    {deal.notes.length}
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </Draggable>
  );

  const filteredColumns = getFilteredColumns();

  return (
    <div className="space-y-4">
      {/* Pipeline Selector */}
      {!isClientView && (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            <span className="text-sm font-medium">Pipeline:</span>
          </div>
          <Select value={selectedPipeline} onValueChange={setSelectedPipeline}>
            <SelectTrigger className="w-48">
              <SelectValue />
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
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="stages" direction="horizontal" type="stage">
          {(provided) => (
            <div 
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="flex gap-6 overflow-x-auto pb-6 min-h-[700px]"
            >
              {filteredColumns.map((column, index) => (
                <Draggable 
                  key={column.id} 
                  draggableId={column.id} 
                  index={index}
                  isDragDisabled={isClientView}
                >
                  {(provided, snapshot) => (
                    <div 
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`flex-shrink-0 w-80 ${snapshot.isDragging ? 'transform rotate-1' : ''}`}
                    >
                      <div className={`${column.color} rounded-xl p-4 min-h-full shadow-sm border border-slate-200`}>
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center gap-2 flex-1">
                            {!isClientView && (
                              <div {...provided.dragHandleProps} className="cursor-grab hover:cursor-grabbing">
                                <GripVertical className="w-4 h-4 text-slate-400" />
                              </div>
                            )}
                            
                            {editingStage === column.id ? (
                              <div className="flex items-center gap-2 flex-1">
                                <Input
                                  value={tempStageTitle}
                                  onChange={(e) => setTempStageTitle(e.target.value)}
                                  className="text-sm h-8"
                                  autoFocus
                                />
                                <Button
                                  size="sm"
                                  onClick={() => handleSaveStage(column.id)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Check className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={handleCancelStageEdit}
                                  className="h-6 w-6 p-0"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            ) : (
                              <>
                                <h3 className="font-semibold text-slate-900 text-sm flex-1">
                                  {column.title}
                                </h3>
                              </>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs font-medium">
                              {column.deals.length}
                            </Badge>
                            {!isClientView && (
                              <>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <Plus className="w-3 h-3" />
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                      <MoreHorizontal className="w-3 h-3" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem 
                                      onClick={() => handleEditStage(column.id, column.title)}
                                    >
                                      <Edit3 className="w-3 h-3 mr-2" />
                                      Editar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => handleDeleteStage(column.id)}
                                      className="text-red-600"
                                    >
                                      <Trash2 className="w-3 h-3 mr-2" />
                                      Excluir
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </>
                            )}
                          </div>
                        </div>
                        
                        <Droppable droppableId={column.id}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className={`space-y-3 min-h-[400px] ${
                                snapshot.isDraggingOver ? 'bg-blue-50 bg-opacity-50 rounded-lg p-2' : ''
                              }`}
                            >
                              {column.deals.map((deal, index) => (
                                <DealCard key={deal.id} deal={deal} index={index} />
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
              
              {/* Add Stage Button */}
              {!isClientView && (
                <div className="flex-shrink-0 w-80">
                  {addingStage ? (
                    <div className="bg-slate-50 rounded-xl p-4 border-2 border-dashed border-slate-300 min-h-[200px]">
                      <Input
                        value={newStageTitle}
                        onChange={(e) => setNewStageTitle(e.target.value)}
                        placeholder="Nome do novo stage..."
                        className="text-sm mb-3"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleAddStage}>
                          <Check className="w-4 h-4 mr-1" />
                          Adicionar
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => {
                          setAddingStage(false);
                          setNewStageTitle("");
                        }}>
                          <X className="w-4 h-4 mr-1" />
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 rounded-xl p-4 border-2 border-dashed border-slate-300 min-h-[200px] flex items-center justify-center">
                      <Button
                        variant="ghost"
                        onClick={() => setAddingStage(true)}
                        className="text-slate-600 hover:text-slate-900"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Stage
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Edit Card Sheet */}
      <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
        <SheetContent side="right" className="w-[1400px] sm:w-[1500px] max-w-[98vw]">
          <SheetHeader>
            <SheetTitle>Editar Card</SheetTitle>
            <SheetDescription>
              Edite as informações do card abaixo
            </SheetDescription>
          </SheetHeader>
          
          <div className="py-6 space-y-6 max-h-[calc(100vh-120px)] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Título</label>
                  <Input
                    value={tempCardData.title || ""}
                    onChange={(e) => setTempCardData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Título do projeto"
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Empresa</label>
                  <Select
                    value={tempCardData.clientId || ""}
                    onValueChange={(value) => {
                      const selectedCompany = companies.find(c => c.id === value);
                      setTempCardData(prev => ({ 
                        ...prev, 
                        clientId: value,
                        companyName: selectedCompany?.name || ""
                      }));
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecionar empresa" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Contato</label>
                  <Input
                    value={tempCardData.contact || ""}
                    onChange={(e) => setTempCardData(prev => ({ ...prev, contact: e.target.value }))}
                    placeholder="Nome do contato"
                    className="w-full"
                  />
                </div>

                {/* Move to Pipeline Dropdown */}
                {!isClientView && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Mover para pipeline:</label>
                    <Select
                      onValueChange={(value) => editingCard && handleMoveToPipeline(editingCard, value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecionar pipeline" />
                      </SelectTrigger>
                      <SelectContent>
                        {pipelines.filter(p => p.id !== selectedPipeline).map(pipeline => (
                          <SelectItem key={pipeline.id} value={pipeline.id}>
                            <div className="flex items-center gap-2">
                              <ArrowRight className="w-4 h-4" />
                              {pipeline.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Descrição</label>
                  <Textarea
                    value={tempCardData.description || ""}
                    onChange={(e) => setTempCardData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descrição detalhada do projeto"
                    className="w-full min-h-[100px]"
                  />
                </div>
                
                {!isClientView && (
                  <div>
                    <label className="text-sm font-medium mb-2 block text-red-600 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Informações Confidenciais
                    </label>
                    <Textarea
                      value={tempCardData.confidentialInfo || ""}
                      onChange={(e) => setTempCardData(prev => ({ ...prev, confidentialInfo: e.target.value }))}
                      placeholder="Informações internas e confidenciais (visível apenas para administradores)"
                      className="w-full min-h-[100px] border-red-200 focus:border-red-300"
                    />
                  </div>
                )}
              </div>
            </div>
            
            {/* Notes Section */}
            <div className="space-y-4 border-t pt-6">
              <div>
                <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Anotações & Insights
                </label>
                
                {/* Existing Notes */}
                {tempCardData.notes && tempCardData.notes.length > 0 && (
                  <div className="space-y-3 mb-4 max-h-[400px] overflow-y-auto">
                    {tempCardData.notes.map((note) => (
                      <div key={note.id} className="p-4 bg-slate-50 rounded-lg border">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-sm font-medium ${note.authorRole === 'admin' ? 'text-purple-600' : 'text-green-600'}`}>
                            {note.author} ({note.authorRole === 'admin' ? 'Admin' : 'Cliente'})
                          </span>
                          <span className="text-xs text-slate-500">
                            {new Date(note.timestamp).toLocaleString('pt-BR')}
                          </span>
                        </div>
                        <div className="text-sm text-slate-700 whitespace-pre-wrap mb-2">{note.content}</div>
                        {note.attachments && note.attachments.length > 0 && (
                          <div className="space-y-2">
                            {note.attachments.map((attachment, idx) => (
                              <div key={idx}>
                                {attachment.type === 'photo' ? (
                                  <img 
                                    src={attachment.url} 
                                    alt={attachment.name}
                                    className="max-w-full max-h-40 object-cover rounded border"
                                  />
                                ) : (
                                  <video 
                                    src={attachment.url} 
                                    controls
                                    className="max-w-full max-h-40 rounded border"
                                  />
                                )}
                                <p className="text-xs text-slate-500 mt-1">{attachment.name}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Add New Note */}
                <div className="space-y-3">
                  <Textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Adicionar nova anotação..."
                    className="w-full min-h-[100px]"
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleAddNote} size="sm" disabled={!newNote.trim()}>
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Anotação
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleFileUpload('photo')}>
                      <Camera className="w-4 h-4 mr-2" />
                      Foto
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleFileUpload('video')}>
                      <Video className="w-4 h-4 mr-2" />
                      Vídeo
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 pt-4 border-t">
              <Button onClick={() => editingCard && handleSaveCard(editingCard)} className="flex-1">
                <Check className="w-4 h-4 mr-2" />
                Salvar Alterações
              </Button>
              <Button variant="outline" onClick={() => {
                setEditingCard(null);
                setTempCardData({});
                setIsEditSheetOpen(false);
              }} className="flex-1">
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default KanbanBoard;
