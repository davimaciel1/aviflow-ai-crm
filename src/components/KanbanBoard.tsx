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
  EyeOff
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const KanbanBoard = () => {
  const { user } = useAuth();
  const isClientView = user?.role === 'client';
  
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [showConfidential, setShowConfidential] = useState<Set<string>>(new Set());

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

  const deals = [
    {
      id: '1',
      title: 'Desenvolvimento de App Mobile',
      client: 'Petz',
      company: 'Petz SA',
      stage: 'prospecting',
      value: 'R$ 50.000',
      nextContact: '2024-03-15',
      avatar: '/petz-logo.png',
      description: 'Criação de aplicativo para agendamento de serviços e compra de produtos.',
      phone: '(11) 98765-4321',
      email: 'contato@petz.com.br',
      budget: 'R$ 60.000',
      decisionMaker: 'Carlos Eduardo',
      competitors: 'Cobasi',
      notes: 'Cliente busca inovação e experiência do usuário diferenciada.'
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
      notes: 'Foco em aumentar o reconhecimento da marca e as vendas online.'
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
      notes: 'Necessidade de centralizar informações e melhorar o atendimento.'
    },
    {
      id: '4',
      title: 'Desenvolvimento de E-commerce',
      client: 'Casas Bahia',
      company: 'Via Varejo SA',
      stage: 'negotiation',
      value: 'R$ 120.000',
      nextContact: '2024-03-30',
      avatar: '/casasbahia-logo.png',
      description: 'Criação de loja virtual com funcionalidades avançadas.',
      phone: '(11) 97777-6666',
      email: 'ecommerce@casasbahia.com.br',
      budget: 'R$ 130.000',
      decisionMaker: 'Roberto Fulcherberguer',
      competitors: 'Magazine Luiza',
      notes: 'Busca por plataforma escalável e design atraente.'
    },
    {
      id: '5',
      title: 'Campanha Publicitária Online',
      client: 'Ponto Frio',
      company: 'Via Varejo SA',
      stage: 'closing',
      value: 'R$ 40.000',
      nextContact: '2024-04-05',
      avatar: '/pontofrio-logo.png',
      description: 'Criação e gestão de campanhas de anúncios online.',
      phone: '(21) 96666-5555',
      email: 'marketingdigital@pontofrio.com.br',
      budget: 'R$ 45.000',
      decisionMaker: 'Paulo Madureira',
      competitors: 'Ricardo Eletro',
      notes: 'Objetivo de aumentar o tráfego e as conversões no site.'
    }
  ];

  const clientDeals = [
    {
      id: '6',
      title: 'Otimização de SEO',
      client: 'Cliente 1',
      company: 'Empresa A',
      stage: 'prospecting',
      value: 'R$ 10.000',
      nextContact: '2024-04-10',
      avatar: '/placeholder-avatar.jpg',
      description: 'Análise e otimização de SEO para melhorar o ranking no Google.',
      phone: '(11) 95555-4444',
      email: 'cliente1@empresaA.com.br',
      budget: 'R$ 12.000',
      decisionMaker: 'João Silva',
      competitors: 'Nenhum',
      notes: 'Cliente busca aumentar a visibilidade online.'
    },
    {
      id: '7',
      title: 'Criação de Conteúdo para Blog',
      client: 'Cliente 2',
      company: 'Empresa B',
      stage: 'qualification',
      value: 'R$ 8.000',
      nextContact: '2024-04-15',
      avatar: '/placeholder-avatar.jpg',
      description: 'Produção de artigos e posts para blog corporativo.',
      phone: '(21) 94444-3333',
      email: 'cliente2@empresaB.com.br',
      budget: 'R$ 9.000',
      decisionMaker: 'Maria Souza',
      competitors: 'Nenhum',
      notes: 'Cliente busca atrair mais visitantes e leads.'
    },
    {
      id: '8',
      title: 'Gestão de Redes Sociais',
      client: 'Cliente 1',
      company: 'Empresa A',
      stage: 'closing',
      value: 'R$ 15.000',
      nextContact: '2024-04-20',
      avatar: '/placeholder-avatar.jpg',
      description: 'Administração e criação de conteúdo para redes sociais.',
      phone: '(11) 95555-4444',
      email: 'cliente1@empresaA.com.br',
      budget: 'R$ 17.000',
      decisionMaker: 'João Silva',
      competitors: 'Nenhum',
      notes: 'Cliente busca fortalecer a presença online e engajar o público.'
    }
  ];

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

  const renderDealCard = (deal: any) => {
    const isExpanded = expandedCards.has(deal.id);
    const showConfidentialInfo = showConfidential.has(deal.id);

    return (
      <Card key={deal.id} className="mb-3 hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader 
          className="pb-2 px-3 py-2"
          onClick={() => toggleCard(deal.id)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <Avatar className="h-6 w-6 flex-shrink-0">
                <AvatarImage src={deal.avatar} />
                <AvatarFallback className="text-xs">
                  {deal.client.split(' ').map((n: string) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <CardTitle className="text-sm font-medium truncate">{deal.title}</CardTitle>
                <p className="text-xs text-muted-foreground truncate">{deal.company}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Badge variant="secondary" className="text-xs px-1 py-0">
                {deal.value}
              </Badge>
              {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </div>
          </div>
          <div className="text-xs text-muted-foreground">{deal.client}</div>
        </CardHeader>
        
        {isExpanded && (
          <CardContent className="pt-0 px-3 pb-3">
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                {deal.description}
              </p>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Phone className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs">{deal.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs">{deal.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs">Próximo contato: {deal.nextContact}</span>
                </div>
              </div>

              {!isClientView && (
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium">Informações Confidenciais</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleConfidential(deal.id);
                      }}
                      className="h-6 w-6 p-0"
                    >
                      {showConfidentialInfo ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </Button>
                  </div>
                  
                  {showConfidentialInfo && (
                    <div className="space-y-1">
                      <p className="text-xs"><strong>Orçamento:</strong> {deal.budget}</p>
                      <p className="text-xs"><strong>Decisor:</strong> {deal.decisionMaker}</p>
                      <p className="text-xs"><strong>Concorrentes:</strong> {deal.competitors}</p>
                      <p className="text-xs"><strong>Anotações:</strong> {deal.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    );
  };

  return (
    <div className="flex gap-3 overflow-x-auto pb-4">
      {stages.map((stage) => (
        <div key={stage.id} className="flex-shrink-0 w-64">
          <div className={`rounded-lg p-3 ${stage.color} mb-3`}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">{stage.title}</h3>
              <Badge variant="secondary" className="text-xs">
                {stage.count}
              </Badge>
            </div>
          </div>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {getDealsForStage(stage.id).map(renderDealCard)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default KanbanBoard;
