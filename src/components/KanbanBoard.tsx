
import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Calendar, User, Building2, Phone, Mail, FileText, Check, X, ChevronDown, ChevronUp, Lock, MessageSquare } from "lucide-react";
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
  assignedUserId?: string;
  notes?: string[];
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

  // Mock data with assigned users
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
      confidential: 'Orçamento aprovado pela diretoria. Projeto tem prazo apertado.',
      createdAt: '2024-01-15',
      assignedUserId: user?.id,
      notes: ['Reunião inicial marcada', 'Cliente interessado em integração com sistema atual']
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
      createdAt: '2024-01-20',
      assignedUserId: 'client-user-id-1',
      confidential: 'Budget limitado, negociação em andamento.',
      notes: ['Referências de design enviadas', 'Aguardando aprovação do wireframe']
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
      confidential: 'Prazo apertado para lançamento no Q2. Competidor no mercado.',
      createdAt: '2024-01-25',
      assignedUserId: user?.id,
      notes: ['Especificações técnicas definidas', 'Mockups aprovados', 'Desenvolvimento iniciado']
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
      createdAt: '2024-02-01',
      assignedUserId: 'other-user-id',
      confidential: 'Integração com sistema ERP existente obrigatória.',
      notes: ['Proposta enviada', 'Aguardando assinatura do contrato']
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
      createdAt: '2024-02-05',
      assignedUserId: user?.id,
      confidential: 'Projeto de longo prazo, implementação em fases.',
      notes: ['Levantamento de requisitos em andamento']
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

  // Filter stages based on user role and assigned deals
  const getFilteredStages = () => {
    if (isClientView) {
      return allStages.map(stage => ({
        ...stage,
        deals: stage.deals.filter(deal => deal.assignedUserId === user?.id)
      })).filter(stage => stage.deals.length > 0);
    } else {
      return allStages;
    }
  };

  const [stages, setStages] = useState<Stage[]>(getFilteredStages());
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    client: ''
  });
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

  const handleDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const sourceStageIndex = stages.findIndex(stage => stage.id === source.droppableId);
    const destStageIndex = stages.findIndex(stage => stage.id === destination.droppableId);

    const sourceStage = stages[sourceStageIndex];
    const destStage = stages[destStageIndex];

    const draggedDeal = sourceStage.deals.find(deal => deal.id === draggableId);
    if (!draggedDeal) return;

    const newStages = [...stages];

    // Remove from source
    newStages[sourceStageIndex] = {
      ...sourceStage,
      deals: sourceStage.deals.filter(deal => deal.id !== draggableId)
    };

    // Add to destination
    const updatedDeal = {
      ...draggedDeal,
      stage: destination.droppableId
    };

    const destDeals = [...destStage.deals];
    destDeals.splice(destination.index, 0, updatedDeal);

    newStages[destStageIndex] = {
      ...destStage,
      deals: destDeals
    };

    setStages(newStages);
  };

  const toggleCardExpand = (cardId: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(cardId)) {
      newExpanded.delete(cardId);
    } else {
      newExpanded.add(cardId);
    }
    setExpandedCards(newExpanded);
  };

  const startEditing = (deal: Deal) => {
    setEditingCard(deal.id);
    setEditForm({
      title: deal.title,
      description: deal.description || '',
      client: deal.client?.id || ''
    });
  };

  const saveEdit = (dealId: string) => {
    const selectedClient = mockClients.find(c => c.id === editForm.client);
    
    setStages(prevStages => 
      prevStages.map(stage => ({
        ...stage,
        deals: stage.deals.map(deal => 
          deal.id === dealId 
            ? {
                ...deal,
                title: editForm.title,
                description: editForm.description,
                client: selectedClient
              }
            : deal
        )
      }))
    );
    setEditingCard(null);
  };

  const cancelEdit = () => {
    setEditingCard(null);
    setEditForm({
      title: '',
      description: '',
      client: ''
    });
  };

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
      createdAt: new Date().toISOString().split('T')[0],
      assignedUserId: user?.id,
      notes: []
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
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">
            {isClientView ? "Meus Projetos Designados" : "Pipeline de Vendas"}
          </h2>
          <p className="text-slate-600">
            {isClientView ? "Projetos que foram designados especificamente para você" : "Gerencie seus deals e acompanhe o progresso"}
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

      {/* Message when client has no assigned deals */}
      {isClientView && stages.length === 0 && (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              Nenhum projeto designado
            </h3>
            <p className="text-slate-600">
              Você ainda não tem projetos designados para você. Entre em contato com a administração para mais informações.
            </p>
          </div>
        </div>
      )}

      {/* Kanban Board with Drag and Drop */}
      <DragDropContext onDragEnd={handleDragEnd}>
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
                
                <Droppable droppableId={stage.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`space-y-3 min-h-[200px] ${
                        snapshot.isDraggingOver ? 'bg-blue-50 rounded-lg p-2' : ''
                      }`}
                    >
                      {stage.deals.map((deal, index) => (
                        <Draggable key={deal.id} draggableId={deal.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`${
                                snapshot.isDragging ? 'rotate-2 shadow-lg' : ''
                              }`}
                            >
                              <Card className="cursor-grab hover:shadow-md transition-shadow bg-white">
                                <CardContent className="p-4">
                                  <div className="space-y-3">
                                    {/* Header with expand/collapse button */}
                                    <div className="flex items-start justify-between">
                                      {editingCard === deal.id ? (
                                        <div className="flex-1 space-y-2">
                                          <Input
                                            value={editForm.title}
                                            onChange={(e) =>
                                              setEditForm({
                                                ...editForm,
                                                title: e.target.value
                                              })
                                            }
                                            className="text-sm font-medium"
                                          />
                                          <Textarea
                                            value={editForm.description}
                                            onChange={(e) =>
                                              setEditForm({
                                                ...editForm,
                                                description: e.target.value
                                              })
                                            }
                                            className="text-xs"
                                            rows={2}
                                          />
                                          <Select
                                            value={editForm.client}
                                            onValueChange={(value) =>
                                              setEditForm({
                                                ...editForm,
                                                client: value
                                              })
                                            }
                                          >
                                            <SelectTrigger className="text-xs">
                                              <SelectValue placeholder="Selecione a empresa" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {mockClients.map((client) => (
                                                <SelectItem key={client.id} value={client.id}>
                                                  {client.company}
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                          <div className="flex space-x-1">
                                            <Button size="sm" onClick={() => saveEdit(deal.id)}>
                                              <Check className="w-3 h-3" />
                                            </Button>
                                            <Button size="sm" variant="outline" onClick={cancelEdit}>
                                              <X className="w-3 h-3" />
                                            </Button>
                                          </div>
                                        </div>
                                      ) : (
                                        <>
                                          <div className="flex-1">
                                            <h4 className="font-medium text-slate-900 line-clamp-2 text-sm mb-1">
                                              {deal.title}
                                            </h4>
                                            {deal.description && (
                                              <p className="text-xs text-slate-600 line-clamp-2 mb-2">
                                                {deal.description}
                                              </p>
                                            )}
                                          </div>
                                          <div className="flex items-center space-x-1">
                                            {!isClientView && (
                                              <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => startEditing(deal)}
                                                className="h-6 w-6 p-0"
                                              >
                                                <Edit className="w-3 h-3" />
                                              </Button>
                                            )}
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              onClick={() => toggleCardExpand(deal.id)}
                                              className="h-6 w-6 p-0"
                                            >
                                              {expandedCards.has(deal.id) ? (
                                                <ChevronUp className="w-3 h-3" />
                                              ) : (
                                                <ChevronDown className="w-3 h-3" />
                                              )}
                                            </Button>
                                          </div>
                                        </>
                                      )}
                                    </div>
                                    
                                    {/* Client info - Always visible */}
                                    {deal.client && (
                                      <div className="flex items-center space-x-2">
                                        <Avatar className="w-6 h-6">
                                          <AvatarFallback className="text-xs bg-blue-100 text-blue-800">
                                            <Building2 className="w-3 h-3" />
                                          </AvatarFallback>
                                        </Avatar>
                                        <span className="text-xs font-medium text-slate-700">
                                          {deal.client.company}
                                        </span>
                                      </div>
                                    )}

                                    {/* Expanded content - Only when expanded */}
                                    {expandedCards.has(deal.id) && (
                                      <div className="space-y-3 pt-2 border-t border-slate-100">
                                        {/* Confidential Information */}
                                        {deal.confidential && (
                                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                            <div className="flex items-start space-x-2">
                                              <Lock className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                              <div>
                                                <h5 className="text-xs font-medium text-amber-800 mb-1">
                                                  Informação Confidencial
                                                </h5>
                                                <p className="text-xs text-amber-700">
                                                  {deal.confidential}
                                                </p>
                                              </div>
                                            </div>
                                          </div>
                                        )}

                                        {/* Notes */}
                                        {deal.notes && deal.notes.length > 0 && (
                                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                            <div className="flex items-start space-x-2">
                                              <MessageSquare className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                              <div className="flex-1">
                                                <h5 className="text-xs font-medium text-blue-800 mb-2">
                                                  Anotações
                                                </h5>
                                                <div className="space-y-1">
                                                  {deal.notes.map((note, index) => (
                                                    <p key={index} className="text-xs text-blue-700">
                                                      • {note}
                                                    </p>
                                                  ))}
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default KanbanBoard;
