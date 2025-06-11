import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, 
  Calendar, 
  Phone, 
  Mail, 
  Building,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Edit,
  MoreHorizontal,
  Lock
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { useKanbanConfig } from "@/hooks/useKanbanConfig";

const KanbanBoard = () => {
  const { user } = useAuth();
  const isClientView = user?.role === 'client';
  const { config } = useKanbanConfig();
  
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [showConfidential, setShowConfidential] = useState<Set<string>>(new Set());

  // Initialize deals state
  const [deals, setDeals] = useState([
    {
      id: '1',
      title: 'Sistema ERP - TechCorp',
      client: 'TechCorp',
      company: 'TechCorp Ltd',
      stage: 'prospecting',
      value: 'R$ 50.000',
      nextContact: '2024-03-15',
      avatar: '/petz-logo.png',
      description: 'Implementação de sistema ERP completo. Implementação de sistema',
      phone: '(11) 98765-4321',
      email: 'contato@techcorp.com',
      budget: 'R$ 60.000',
      decisionMaker: 'João Silva',
      competitors: 'Oracle',
      notes: 'Margem: 45% - Concorrente: Oracle',
      confidentialNotes: 'Informações confidenciais sobre orçamento e estratégia',
      progress: 45
    },
    {
      id: '2',
      title: 'Consultoria em Marketing Digital',
      client: 'Ambev',
      company: 'Ambev SA',
      stage: 'qualification',
      value: 'R$ 30.000',
      nextContact: '2024-03-20',
      avatar: '/ambev-logo.png',
      description: 'Análise e otimização das campanhas de marketing online.',
      phone: '(21) 99999-8888',
      email: 'marketing@ambev.com.br',
      budget: 'R$ 35.000',
      decisionMaker: 'Ana Beatriz',
      competitors: 'Heineken',
      notes: 'Foco em aumentar o reconhecimento da marca.',
      confidentialNotes: 'Cliente tem orçamento maior disponível',
      progress: 30
    },
    {
      id: '3',
      title: 'Implementação de CRM',
      client: 'Magazine Luiza',
      company: 'Magazine Luiza SA',
      stage: 'proposal',
      value: 'R$ 80.000',
      nextContact: '2024-03-25',
      avatar: '/magalu-logo.png',
      description: 'Integração de sistema CRM para gestão de clientes e vendas.',
      phone: '(16) 98888-7777',
      email: 'ti@magazineluiza.com.br',
      budget: 'R$ 90.000',
      decisionMaker: 'Frederico Trajano',
      competitors: 'Via Varejo',
      notes: 'Necessidade de centralizar informações.',
      confidentialNotes: 'Decisão final depende do board',
      progress: 70
    }
  ]);

  const [clientDeals, setClientDeals] = useState([
    {
      id: '6',
      title: 'Otimização de SEO',
      client: 'Cliente 1',
      company: 'Empresa A',
      stage: 'prospecting',
      value: 'R$ 10.000',
      nextContact: '2024-04-10',
      avatar: '/placeholder-avatar.jpg',
      description: 'Análise e otimização de SEO para melhorar o ranking.',
      phone: '(11) 95555-4444',
      email: 'cliente1@empresaA.com.br',
      budget: 'R$ 12.000',
      decisionMaker: 'João Silva',
      competitors: 'Nenhum',
      notes: 'Cliente busca aumentar a visibilidade online.',
      progress: 25
    }
  ]);

  const toggleCard = (cardId: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(cardId)) {
      newExpanded.delete(cardId);
    } else {
      newExpanded.add(cardId);
    }
    setExpandedCards(newExpanded);
  };

  const toggleConfidential = (cardId: string) => {
    const newShowConfidential = new Set(showConfidential);
    if (newShowConfidential.has(cardId)) {
      newShowConfidential.delete(cardId);
    } else {
      newShowConfidential.add(cardId);
    }
    setShowConfidential(newShowConfidential);
  };

  const stages = [
    {
      id: 'prospecting',
      title: 'Prospecção',
      color: 'bg-slate-100',
      count: isClientView ? 1 : 12
    },
    {
      id: 'qualification',
      title: 'Qualificação',
      color: 'bg-blue-100',
      count: isClientView ? 1 : 8
    },
    {
      id: 'proposal',
      title: 'Proposta',
      color: 'bg-yellow-100',
      count: isClientView ? 0 : 6
    },
    {
      id: 'negotiation',
      title: 'Negociação',
      color: 'bg-orange-100',
      count: isClientView ? 0 : 4
    },
    {
      id: 'closing',
      title: 'Fechamento',
      color: 'bg-green-100',
      count: isClientView ? 1 : 3
    }
  ];

  const getDealsForStage = (stageId: string) => {
    if (isClientView) {
      return clientDeals.filter(deal => deal.stage === stageId);
    }
    return deals.filter(deal => deal.stage === stageId);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    if (source.droppableId === destination.droppableId) return;

    console.log('Moving deal:', draggableId, 'from', source.droppableId, 'to', destination.droppableId);

    if (isClientView) {
      const updatedDeals = clientDeals.map(deal => 
        deal.id === draggableId 
          ? { ...deal, stage: destination.droppableId }
          : deal
      );
      setClientDeals(updatedDeals);
    } else {
      const updatedDeals = deals.map(deal => 
        deal.id === draggableId 
          ? { ...deal, stage: destination.droppableId }
          : deal
      );
      setDeals(updatedDeals);
    }
  };

  const renderDealCard = (deal: any, index: number) => {
    const isExpanded = expandedCards.has(deal.id);
    const showConfidentialInfo = showConfidential.has(deal.id);

    return (
      <Draggable key={deal.id} draggableId={deal.id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`mb-3 ${snapshot.isDragging ? 'rotate-3 scale-105' : ''} transition-transform`}
          >
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-blue-500">
              <CardHeader className="pb-2 px-3 py-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm font-semibold text-gray-900 leading-tight mb-1">
                      {deal.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="h-5 w-5 flex-shrink-0">
                        <AvatarImage src={deal.avatar} />
                        <AvatarFallback className="text-xs bg-gray-200">
                          {deal.client.split(' ').map((n: string) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-gray-600 truncate">{deal.client}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 flex-shrink-0">
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {deal.description}
                  </p>
                  
                  {!isClientView && deal.notes && (
                    <div className="flex items-center gap-2 p-2 bg-red-50 rounded text-xs border border-red-200">
                      <Lock className="h-3 w-3 text-red-600 flex-shrink-0" />
                      <span className="text-red-700 font-medium">Confidencial</span>
                    </div>
                  )}
                  
                  <div className="space-y-1">
                    {deal.notes && (
                      <p className="text-xs text-gray-700">{deal.notes}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between pt-2">
                    <Badge variant="secondary" className="text-xs px-2 py-1 bg-blue-100 text-blue-800">
                      {deal.value}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <div className="text-xs text-gray-500">1</div>
                      <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>
        )}
      </Draggable>
    );
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => (
          <div 
            key={stage.id} 
            className="flex-shrink-0"
            style={{ width: `${config.cardWidth}px` }}
          >
            <div className={`rounded-lg p-3 ${stage.color} mb-3`}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-gray-800">{stage.title}</h3>
                <Badge variant="secondary" className="text-xs bg-white">
                  {getDealsForStage(stage.id).length}
                </Badge>
              </div>
            </div>
            
            <Droppable droppableId={stage.id}>
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={`space-y-2 overflow-y-auto min-h-32 p-2 rounded-lg ${
                    snapshot.isDraggingOver ? 'bg-blue-50 border-2 border-blue-200 border-dashed' : 'bg-gray-50'
                  } transition-colors`}
                  style={{ maxHeight: `${config.cardHeight}px` }}
                >
                  {getDealsForStage(stage.id).map((deal, index) => renderDealCard(deal, index))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
};

export default KanbanBoard;
