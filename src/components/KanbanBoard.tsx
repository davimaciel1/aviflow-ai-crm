
import React, { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit2, Trash2, MessageSquare, Settings } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  email: string;
  company: string;
  phone?: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'prospect';
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface Deal {
  id: string;
  title: string;
  description?: string;
  client_id?: string;
  contact?: string;
  value?: number;
  priority: 'low' | 'medium' | 'high';
  stage_id: string;
  confidential?: string;
  position: number;
  user_id: string;
  created_at: string;
  updated_at: string;
  notes?: Note[];
  client?: Client;
}

interface Note {
  id: string;
  text: string;
  deal_id: string;
  author_id: string;
  created_at: string;
  updated_at: string;
}

interface Stage {
  id: string;
  title: string;
  pipeline_id: string;
  position: number;
  created_at: string;
  updated_at: string;
  deals: Deal[];
}

interface Pipeline {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  stages: Stage[];
}

interface NewDealData {
  title: string;
  description: string;
  contact: string;
  value: string;
  priority: 'low' | 'medium' | 'high';
  client_id: string;
  confidential: string;
}

const KanbanBoard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [currentPipeline, setCurrentPipeline] = useState<Pipeline | null>(null);
  const [loading, setLoading] = useState(true);
  const [newDealDialogOpen, setNewDealDialogOpen] = useState(false);
  const [newDeal, setNewDeal] = useState<NewDealData>({
    title: '',
    description: '',
    contact: '',
    value: '',
    priority: 'low',
    client_id: '',
    confidential: ''
  });
  const [selectedStageId, setSelectedStageId] = useState<string>('');

  // Load data
  const loadPipelines = useCallback(async () => {
    if (!user) return;

    try {
      const { data: pipelineData, error: pipelineError } = await supabase
        .from('pipelines')
        .select(`
          *,
          stages (
            *,
            deals (
              *,
              notes (*),
              clients (*)
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at');

      if (pipelineError) {
        throw pipelineError;
      }

      const formattedPipelines = pipelineData?.map(pipeline => ({
        ...pipeline,
        stages: pipeline.stages?.map((stage: any) => ({
          ...stage,
          deals: stage.deals?.map((deal: any) => ({
            ...deal,
            client: deal.clients,
            priority: deal.priority as 'low' | 'medium' | 'high'
          })) || []
        })) || []
      })) || [];

      setPipelines(formattedPipelines);
      
      if (formattedPipelines.length > 0 && !currentPipeline) {
        setCurrentPipeline(formattedPipelines[0]);
      }
    } catch (error) {
      console.error('Error loading pipelines:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os pipelines",
        variant: "destructive",
      });
    }
  }, [user, currentPipeline, toast]);

  const loadClients = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;

      const formattedClients = data?.map(client => ({
        ...client,
        status: client.status as 'active' | 'inactive' | 'prospect'
      })) || [];

      setClients(formattedClients);
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  }, [user]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([loadPipelines(), loadClients()]);
      setLoading(false);
    };

    if (user) {
      loadData();
    }
  }, [user, loadPipelines, loadClients]);

  // Handle drag and drop
  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination || !currentPipeline) return;

    const { source, destination, draggableId } = result;

    // If dropped in the same position, do nothing
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    try {
      const sourceStageIndex = currentPipeline.stages.findIndex(stage => stage.id === source.droppableId);
      const destStageIndex = currentPipeline.stages.findIndex(stage => stage.id === destination.droppableId);

      if (sourceStageIndex === -1 || destStageIndex === -1) return;

      const newPipelines = [...pipelines];
      const pipelineIndex = newPipelines.findIndex(p => p.id === currentPipeline.id);
      
      if (pipelineIndex === -1) return;

      const newStages = [...newPipelines[pipelineIndex].stages];
      const sourceStage = { ...newStages[sourceStageIndex] };
      const destStage = { ...newStages[destStageIndex] };

      // Remove deal from source
      const dealToMove = sourceStage.deals.find(deal => deal.id === draggableId);
      if (!dealToMove) return;

      sourceStage.deals = sourceStage.deals.filter(deal => deal.id !== draggableId);

      // Add deal to destination
      dealToMove.stage_id = destination.droppableId;
      destStage.deals.splice(destination.index, 0, dealToMove);

      // Update positions for destination stage
      destStage.deals.forEach((deal, index) => {
        deal.position = index;
      });

      // Update positions for source stage
      sourceStage.deals.forEach((deal, index) => {
        deal.position = index;
      });

      newStages[sourceStageIndex] = sourceStage;
      newStages[destStageIndex] = destStage;
      newPipelines[pipelineIndex].stages = newStages;

      setPipelines(newPipelines);
      setCurrentPipeline(newPipelines[pipelineIndex]);

      // Update in database
      const { error } = await supabase
        .from('deals')
        .update({ 
          stage_id: destination.droppableId,
          position: destination.index
        })
        .eq('id', draggableId);

      if (error) throw error;

      // Update positions for all affected deals
      const allDealsToUpdate = [...sourceStage.deals, ...destStage.deals];
      for (const deal of allDealsToUpdate) {
        await supabase
          .from('deals')
          .update({ position: deal.position })
          .eq('id', deal.id);
      }

    } catch (error) {
      console.error('Error updating deal:', error);
      toast({
        title: "Erro",
        description: "Não foi possível mover o card",
        variant: "destructive",
      });
      // Reload data to revert changes
      loadPipelines();
    }
  };

  // Create new deal
  const createDeal = async () => {
    if (!user || !selectedStageId || !newDeal.title.trim()) {
      toast({
        title: "Erro",
        description: "Preencha pelo menos o título do deal",
        variant: "destructive",
      });
      return;
    }

    try {
      const stage = currentPipeline?.stages.find(s => s.id === selectedStageId);
      if (!stage) return;

      const position = stage.deals.length;

      const { data, error } = await supabase
        .from('deals')
        .insert({
          title: newDeal.title.trim(),
          description: newDeal.description.trim() || null,
          contact: newDeal.contact.trim() || null,
          value: newDeal.value ? parseFloat(newDeal.value) : null,
          priority: newDeal.priority,
          client_id: newDeal.client_id || null,
          confidential: newDeal.confidential.trim() || null,
          stage_id: selectedStageId,
          position,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Add client data if exists
      let clientData = null;
      if (newDeal.client_id) {
        clientData = clients.find(c => c.id === newDeal.client_id);
      }

      // Update local state
      const newDealWithClient = {
        ...data,
        notes: [],
        client: clientData,
        priority: data.priority as 'low' | 'medium' | 'high'
      };

      setPipelines(prev => prev.map(pipeline => 
        pipeline.id === currentPipeline?.id
          ? {
              ...pipeline,
              stages: pipeline.stages.map(stage => 
                stage.id === selectedStageId
                  ? { ...stage, deals: [...stage.deals, newDealWithClient] }
                  : stage
              )
            }
          : pipeline
      ));

      // Reset form
      setNewDeal({
        title: '',
        description: '',
        contact: '',
        value: '',
        priority: 'low',
        client_id: '',
        confidential: ''
      });
      setSelectedStageId('');
      setNewDealDialogOpen(false);

      toast({
        title: "Sucesso",
        description: "Deal criado com sucesso",
      });

    } catch (error) {
      console.error('Error creating deal:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o deal",
        variant: "destructive",
      });
    }
  };

  // Add new stage
  const addNewStage = async () => {
    if (!user || !currentPipeline) return;

    const title = prompt('Nome do novo estágio:');
    if (!title?.trim()) return;

    try {
      const position = currentPipeline.stages.length;

      const { data, error } = await supabase
        .from('stages')
        .insert({
          title: title.trim(),
          pipeline_id: currentPipeline.id,
          position
        })
        .select()
        .single();

      if (error) throw error;

      const newStage: Stage = {
        ...data,
        deals: []
      };

      setPipelines(prev => prev.map(pipeline => 
        pipeline.id === currentPipeline.id
          ? { ...pipeline, stages: [...pipeline.stages, newStage] }
          : pipeline
      ));

      if (currentPipeline.id === currentPipeline.id) {
        setCurrentPipeline(prev => prev ? { ...prev, stages: [...prev.stages, newStage] } : null);
      }

      toast({
        title: "Sucesso",
        description: "Estágio criado com sucesso",
      });

    } catch (error) {
      console.error('Error creating stage:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o estágio",
        variant: "destructive",
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
      default: return priority;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando pipeline...</p>
        </div>
      </div>
    );
  }

  if (!currentPipeline) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum pipeline encontrado</h3>
        <p className="text-gray-600">Crie seu primeiro pipeline para começar a gerenciar seus deals.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{currentPipeline.name}</h1>
          <p className="text-gray-600">Gerencie seus deals e oportunidades</p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={newDealDialogOpen} onOpenChange={setNewDealDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Deal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Criar Novo Deal</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="stage">Estágio</Label>
                  <Select value={selectedStageId} onValueChange={setSelectedStageId}>
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

                <div>
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={newDeal.title}
                    onChange={(e) => setNewDeal(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Nome do deal"
                  />
                </div>

                <div>
                  <Label htmlFor="client">Cliente</Label>
                  <Select value={newDeal.client_id} onValueChange={(value) => setNewDeal(prev => ({ ...prev, client_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map(client => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name} - {client.company}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="contact">Contato</Label>
                  <Input
                    id="contact"
                    value={newDeal.contact}
                    onChange={(e) => setNewDeal(prev => ({ ...prev, contact: e.target.value }))}
                    placeholder="Pessoa de contato"
                  />
                </div>

                <div>
                  <Label htmlFor="value">Valor</Label>
                  <Input
                    id="value"
                    type="number"
                    step="0.01"
                    value={newDeal.value}
                    onChange={(e) => setNewDeal(prev => ({ ...prev, value: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="priority">Prioridade</Label>
                  <Select value={newDeal.priority} onValueChange={(value: 'low' | 'medium' | 'high') => setNewDeal(prev => ({ ...prev, priority: value }))}>
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

                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={newDeal.description}
                    onChange={(e) => setNewDeal(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Detalhes do deal..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={createDeal} className="flex-1">
                    Criar Deal
                  </Button>
                  <Button variant="outline" onClick={() => setNewDealDialogOpen(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline" onClick={addNewStage}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Estágio
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-6 min-w-max pb-6">
            {currentPipeline.stages.map((stage) => (
              <div key={stage.id} className="flex-shrink-0 w-80">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-900">{stage.title}</h3>
                    <Badge variant="secondary">
                      {stage.deals.length}
                    </Badge>
                  </div>

                  <Droppable droppableId={stage.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`space-y-3 min-h-[200px] ${
                          snapshot.isDraggingOver ? 'bg-blue-50' : ''
                        }`}
                      >
                        {stage.deals.map((deal, index) => (
                          <Draggable key={deal.id} draggableId={deal.id} index={index}>
                            {(provided, snapshot) => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`cursor-move ${
                                  snapshot.isDragging ? 'shadow-lg rotate-3' : ''
                                }`}
                              >
                                <CardContent className="p-4">
                                  <div className="space-y-3">
                                    <div className="flex items-start justify-between">
                                      <h4 className="font-medium text-sm leading-tight">{deal.title}</h4>
                                      <Badge className={getPriorityColor(deal.priority)}>
                                        {getPriorityLabel(deal.priority)}
                                      </Badge>
                                    </div>

                                    {deal.description && (
                                      <p className="text-xs text-gray-600 line-clamp-2">
                                        {deal.description}
                                      </p>
                                    )}

                                    {deal.client && (
                                      <div className="flex items-center gap-2">
                                        <Avatar className="h-6 w-6">
                                          <AvatarImage src={deal.client.avatar} />
                                          <AvatarFallback className="text-xs">
                                            {deal.client.name.substring(0, 2).toUpperCase()}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0 flex-1">
                                          <p className="text-xs font-medium truncate">{deal.client.name}</p>
                                          <p className="text-xs text-gray-500 truncate">{deal.client.company}</p>
                                        </div>
                                      </div>
                                    )}

                                    {deal.contact && (
                                      <p className="text-xs text-gray-600">
                                        <strong>Contato:</strong> {deal.contact}
                                      </p>
                                    )}

                                    {deal.value && (
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-green-600">
                                          R$ {deal.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </span>
                                      </div>
                                    )}

                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                      <span>{new Date(deal.created_at).toLocaleDateString('pt-BR')}</span>
                                      {deal.notes && deal.notes.length > 0 && (
                                        <div className="flex items-center gap-1">
                                          <MessageSquare className="h-3 w-3" />
                                          <span>{deal.notes.length}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
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
    </div>
  );
};

export default KanbanBoard;
