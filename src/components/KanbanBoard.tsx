
import { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Camera
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

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
  notes?: string;
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
              notes: "",
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
              notes: ""
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
              notes: ""
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
              notes: ""
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
              notes: ""
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
              notes: ""
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
              notes: ""
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
      priority: deal.priority,
      companyName: deal.companyName,
      clientId: deal.clientId,
      confidentialInfo: deal.confidentialInfo || "",
      notes: deal.notes || ""
    });
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
  };

  const handleCancelCardEdit = () => {
    setEditingCard(null);
    setTempCardData({});
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
    // Disable drag & drop for client view
    if (isClientView) {
      return;
    }

    const { destination, source, draggableId } = result;

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
          className={`mb-3 hover:shadow-md transition-shadow cursor-pointer ${
            snapshot.isDragging ? 'shadow-lg transform rotate-1' : ''
          }`}
        >
          {editingCard === deal.id ? (
            <div className="p-4 space-y-4 max-w-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Título</label>
                    <Input
                      value={tempCardData.title || ""}
                      onChange={(e) => setTempCardData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Título"
                      className="text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-1 block">Empresa</label>
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
                      <SelectTrigger className="text-sm">
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
                    <label className="text-sm font-medium mb-1 block">Contato</label>
                    <Input
                      value={tempCardData.contact || ""}
                      onChange={(e) => setTempCardData(prev => ({ ...prev, contact: e.target.value }))}
                      placeholder="Contato"
                      className="text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-1 block">Prioridade</label>
                    <Select
                      value={tempCardData.priority || "medium"}
                      onValueChange={(value) => setTempCardData(prev => ({ ...prev, priority: value as Deal['priority'] }))}
                    >
                      <SelectTrigger className="text-sm">
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
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Descrição</label>
                    <Textarea
                      value={tempCardData.description || ""}
                      onChange={(e) => setTempCardData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descrição do projeto"
                      className="text-sm min-h-[80px]"
                    />
                  </div>
                  
                  {!isClientView && (
                    <div>
                      <label className="text-sm font-medium mb-1 block text-red-600">Informações Confidenciais</label>
                      <Textarea
                        value={tempCardData.confidentialInfo || ""}
                        onChange={(e) => setTempCardData(prev => ({ ...prev, confidentialInfo: e.target.value }))}
                        placeholder="Informações internas e confidenciais"
                        className="text-sm min-h-[80px] border-red-200"
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Anotações, Insights e Anexos
                </label>
                <Textarea
                  value={tempCardData.notes || ""}
                  onChange={(e) => setTempCardData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Use este espaço para adicionar anotações, insights, links para vídeos, fotos ou outros materiais relevantes ao projeto..."
                  className="text-sm min-h-[120px]"
                />
                <div className="flex gap-2 mt-2">
                  <Button variant="outline" size="sm" className="text-xs">
                    <Camera className="w-3 h-3 mr-1" />
                    Adicionar Foto
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs">
                    <Video className="w-3 h-3 mr-1" />
                    Adicionar Vídeo
                  </Button>
                </div>
              </div>
              
              {/* Pipeline move option */}
              {!isClientView && (
                <div className="border-t pt-3">
                  <label className="text-xs font-medium text-muted-foreground">Mover para pipeline:</label>
                  <div className="flex gap-1 mt-1">
                    {pipelines.filter(p => p.id !== selectedPipeline).map(pipeline => (
                      <Button
                        key={pipeline.id}
                        size="sm"
                        variant="outline"
                        onClick={() => handleMoveToPipeline(deal.id, pipeline.id)}
                        className="text-xs h-6"
                      >
                        <ArrowRight className="w-3 h-3 mr-1" />
                        {pipeline.name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex gap-2 pt-2">
                <Button onClick={() => handleSaveCard(deal.id)}>
                  <Check className="w-4 h-4 mr-2" />
                  Salvar
                </Button>
                <Button variant="outline" onClick={handleCancelCardEdit}>
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-sm font-medium leading-tight flex-1">
                    {deal.title}
                  </CardTitle>
                  <div className="flex items-center gap-2 ml-2">
                    <Avatar className="w-6 h-6">
                      {deal.avatar ? (
                        <AvatarImage src={deal.avatar} alt={deal.companyName} />
                      ) : null}
                      <AvatarFallback className="text-xs">
                        {getInitials(deal.companyName)}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditCard(deal)}
                      className="h-6 w-6 p-0"
                    >
                      <Edit3 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                {deal.description && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {deal.description}
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className={`${getPriorityColor(deal.priority)} text-xs`}>
                    {deal.priority === 'high' ? 'Alta' : deal.priority === 'medium' ? 'Média' : 'Baixa'}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Building className="w-3 h-3" />
                  <span className="font-medium">{deal.companyName}</span>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <User className="w-3 h-3" />
                  <span>{deal.contact}</span>
                </div>
                
                {/* Show confidential info only to admins */}
                {!isClientView && deal.confidentialInfo && (
                  <div className="p-2 bg-red-50 border border-red-200 rounded">
                    <div className="flex items-center justify-between mb-1">
                      <strong className="text-xs text-red-800">Confidencial:</strong>
                      {editingConfidential !== deal.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditConfidential(deal.id, deal.confidentialInfo || "")}
                          className="h-5 w-5 p-0"
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
                          className="text-xs min-h-[50px] resize-none"
                        />
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            onClick={() => handleSaveConfidential(deal.id)}
                            className="h-5 px-2 text-xs"
                          >
                            <Check className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancelConfidentialEdit}
                            className="h-5 px-2 text-xs"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-red-800">{deal.confidentialInfo}</div>
                    )}
                  </div>
                )}
                
                {deal.notes && (
                  <div className="p-2 bg-blue-50 border border-blue-200 rounded">
                    <div className="flex items-center gap-1 mb-1">
                      <FileText className="w-3 h-3 text-blue-600" />
                      <strong className="text-xs text-blue-800">Anotações:</strong>
                    </div>
                    <div className="text-xs text-blue-800">{deal.notes}</div>
                  </div>
                )}
              </CardContent>
            </>
          )}
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
        <div className="flex gap-4 overflow-x-auto pb-6 min-h-[600px]">
          {filteredColumns.map((column) => (
            <div key={column.id} className="flex-shrink-0 w-72">
              <div className={`${column.color} rounded-lg p-3 min-h-full`}>
                <div className="flex justify-between items-center mb-3">
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
                    <div className="flex items-center gap-2 flex-1">
                      <h3 className="font-semibold text-slate-900 text-sm">
                        {column.title}
                      </h3>
                      {!isClientView && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditStage(column.id, column.title)}
                            className="h-6 w-6 p-0"
                          >
                            <Edit3 className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteStage(column.id)}
                            className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {column.deals.length}
                    </Badge>
                    {!isClientView && (
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Plus className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
                
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`space-y-2 min-h-[200px] ${
                        snapshot.isDraggingOver ? 'bg-blue-50 bg-opacity-50 rounded-lg' : ''
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
          ))}
          
          {/* Add Stage Button */}
          {!isClientView && (
            <div className="flex-shrink-0 w-72">
              {addingStage ? (
                <div className="bg-slate-50 rounded-lg p-3 border-2 border-dashed border-slate-300">
                  <Input
                    value={newStageTitle}
                    onChange={(e) => setNewStageTitle(e.target.value)}
                    placeholder="Nome do novo stage..."
                    className="text-sm mb-2"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleAddStage}>
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => {
                      setAddingStage(false);
                      setNewStageTitle("");
                    }}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 rounded-lg p-3 border-2 border-dashed border-slate-300 min-h-[100px] flex items-center justify-center">
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
      </DragDropContext>
    </div>
  );
};

export default KanbanBoard;
