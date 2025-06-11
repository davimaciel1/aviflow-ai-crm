import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  DragDropContext, 
  Droppable, 
  Draggable,
  DropResult 
} from "@hello-pangea/dnd";
import { 
  Plus, 
  MoreHorizontal, 
  Calendar, 
  DollarSign,
  Building2,
  Briefcase,
  Factory,
  ShoppingCart,
  Smartphone,
  Car,
  Heart,
  GraduationCap,
  Home,
  Plane
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface Deal {
  id: string;
  title: string;
  company: string;
  clientName: string;
  clientAvatar: string;
  value: number;
  stage: "prospecting" | "qualification" | "proposal" | "closing";
  priority: "low" | "medium" | "high";
  dueDate: string;
  description?: string;
}

interface Column {
  id: Deal['stage'];
  title: string;
  icon: React.ReactNode;
}

const getCompanyIcon = (company: string) => {
  switch (company) {
    case "Queiroz Industrial":
      return <Factory className="w-4 h-4 text-blue-600" />;
    case "TechFlow Solutions":
      return <Smartphone className="w-4 h-4 text-blue-600" />;
    case "Digital Boost":
      return <TrendingUp className="w-4 h-4 text-blue-600" />;
    case "RetailMax":
      return <ShoppingCart className="w-4 h-4 text-blue-600" />;
    default:
      return <Building2 className="w-4 h-4 text-blue-600" />;
  }
};

const KanbanBoard = () => {
  const { user } = useAuth();
  const isClientView = user?.role === 'client';
  const { toast } = useToast();
  
  const [deals, setDeals] = useState<Deal[]>([]);
  const [columns, setColumns] = useState<Column[]>([
    {
      id: "prospecting",
      title: "Prospecção",
      icon: <Briefcase className="w-4 h-4" />,
    },
    {
      id: "qualification",
      title: "Qualificação",
      icon: <Search className="w-4 h-4" />,
    },
    {
      id: "proposal",
      title: "Proposta",
      icon: <FileText className="w-4 h-4" />,
    },
    {
      id: "closing",
      title: "Fechamento",
      icon: <CheckCircle className="w-4 h-4" />,
    },
  ]);
  const [newDeal, setNewDeal] = useState<Omit<Deal, 'id'>>({
    title: "",
    company: "",
    clientName: "",
    clientAvatar: "",
    value: 0,
    stage: "prospecting",
    priority: "medium",
    dueDate: new Date().toISOString().split('T')[0],
    description: ""
  });

  useEffect(() => {
    // Simulate fetching deals from an API
    setTimeout(() => {
      setDeals(mockDeals);
    }, 500);
  }, []);

  const mockDeals: Deal[] = [
    {
      id: "1",
      title: "LUVA MULTIUSO",
      company: "Queiroz Industrial",
      clientName: "Anderson",
      clientAvatar: `https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=150&h=150&fit=crop&crop=face`,
      value: 45000,
      stage: "prospecting",
      priority: "high",
      dueDate: "2024-01-15",
      description: "Fornecimento de luvas multiuso para indústria"
    },
    {
      id: "2", 
      title: "Sistema CRM Personalizado",
      company: "TechFlow Solutions",
      clientName: "Maria Silva",
      clientAvatar: `https://images.unsplash.com/photo-1493962853295-0fd70327578a?w=150&h=150&fit=crop&crop=face`,
      value: 85000,
      stage: "qualification", 
      priority: "medium",
      dueDate: "2024-01-20",
      description: "Desenvolvimento de sistema CRM sob medida"
    },
    {
      id: "3",
      title: "Consultoria em Marketing Digital", 
      company: "Digital Boost",
      clientName: "Carlos Santos",
      clientAvatar: `https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?w=150&h=150&fit=crop&crop=face`,
      value: 32000,
      stage: "proposal",
      priority: "low", 
      dueDate: "2024-01-25",
      description: "Estratégia completa de marketing digital"
    },
    {
      id: "4",
      title: "Plataforma E-commerce",
      company: "RetailMax",
      clientName: "Ana Costa",
      clientAvatar: `https://images.unsplash.com/photo-1501286353178-1ec881214838?w=150&h=150&fit=crop&crop=face`,
      value: 120000,
      stage: "closing",
      priority: "high",
      dueDate: "2024-01-30", 
      description: "Desenvolvimento completo de e-commerce"
    }
  ];

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newDeals = [...deals];
    const dealIndex = newDeals.findIndex(deal => deal.id === draggableId);
    const deal = newDeals[dealIndex];
    newDeals.splice(dealIndex, 1);
    deal.stage = destination.droppableId as Deal['stage'];
    newDeals.splice(destination.index, 0, deal);

    setDeals(newDeals);

    toast({
      title: "Deal movido",
      description: `O deal ${deal.title} foi movido para a fase de ${columns.find(column => column.id === destination.droppableId)?.title}.`,
    });
  };

  const addDeal = () => {
    const newId = Math.random().toString(36).substring(7);
    const dealToAdd = { ...newDeal, id: newId };
    setDeals([...deals, dealToAdd]);
    setNewDeal({
      title: "",
      company: "",
      clientName: "",
      clientAvatar: "",
      value: 0,
      stage: "prospecting",
      priority: "medium",
      dueDate: new Date().toISOString().split('T')[0],
      description: ""
    });

    toast({
      title: "Novo deal adicionado",
      description: `O deal ${dealToAdd.title} foi adicionado à fase de Prospecção.`,
    });
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">
            {isClientView ? "Meus Projetos" : "Pipeline de Vendas"}
          </h2>
          <p className="text-slate-600">
            {isClientView ? "Acompanhe o progresso dos seus projetos" : "Gerencie suas oportunidades de negócio"}
          </p>
        </div>
        {!isClientView && (
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Deal
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Criar Novo Deal</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={newDeal.title}
                    onChange={(e) => setNewDeal({...newDeal, title: e.target.value})}
                    placeholder="Nome do deal"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="company">Empresa</Label>
                  <Input
                    id="company"
                    value={newDeal.company}
                    onChange={(e) => setNewDeal({...newDeal, company: e.target.value})}
                    placeholder="Nome da empresa"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="clientName">Nome do Cliente</Label>
                  <Input
                    id="clientName"
                    value={newDeal.clientName}
                    onChange={(e) => setNewDeal({...newDeal, clientName: e.target.value})}
                    placeholder="Nome do responsável"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="value">Valor (R$)</Label>
                  <Input
                    id="value"
                    type="number"
                    value={newDeal.value}
                    onChange={(e) => setNewDeal({...newDeal, value: Number(e.target.value)})}
                    placeholder="0"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="priority">Prioridade</Label>
                  <Select value={newDeal.priority} onValueChange={(value: Deal['priority']) => setNewDeal({...newDeal, priority: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dueDate">Data de Vencimento</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={newDeal.dueDate}
                    onChange={(e) => setNewDeal({...newDeal, dueDate: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={newDeal.description}
                    onChange={(e) => setNewDeal({...newDeal, description: e.target.value})}
                    placeholder="Detalhes do deal"
                  />
                </div>
                <Button onClick={addDeal} className="w-full">
                  Criar Deal
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {columns.map((column) => (
            <div key={column.id} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  {column.icon}
                  {column.title}
                </h3>
                <Badge variant="secondary">
                  {deals.filter(deal => deal.stage === column.id).length}
                </Badge>
              </div>
              
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`min-h-[200px] space-y-3 p-2 rounded-lg transition-colors ${
                      snapshot.isDraggingOver ? 'bg-blue-50' : 'bg-transparent'
                    }`}
                  >
                    {deals
                      .filter(deal => deal.stage === column.id)
                      .map((deal, index) => (
                        <Draggable key={deal.id} draggableId={deal.id} index={index}>
                          {(provided, snapshot) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow ${
                                snapshot.isDragging ? 'shadow-lg rotate-2' : ''
                              }`}
                            >
                              <CardContent className="p-4">
                                <div className="space-y-3">
                                  <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                                      {getCompanyIcon(deal.company)}
                                      <h4 className="font-medium text-sm leading-tight">
                                        {deal.title}
                                      </h4>
                                    </div>
                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                      <MoreHorizontal className="h-3 w-3" />
                                    </Button>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <p className="text-xs text-muted-foreground">
                                      {deal.company}
                                    </p>
                                    
                                    <div className="flex items-center gap-2">
                                      <Avatar className="h-6 w-6">
                                        <AvatarImage src={deal.clientAvatar} alt={deal.clientName} />
                                        <AvatarFallback className="text-xs">
                                          {deal.clientName.split(' ').map(n => n[0]).join('')}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span className="text-xs text-muted-foreground">
                                        {deal.clientName}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1">
                                      <DollarSign className="h-3 w-3 text-green-600" />
                                      <span className="text-sm font-medium text-green-600">
                                        {formatCurrency(deal.value)}
                                      </span>
                                    </div>
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
                                  </div>
                                  
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(deal.dueDate).toLocaleDateString('pt-BR')}
                                  </div>
                                  
                                  {deal.description && (
                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                      {deal.description}
                                    </p>
                                  )}
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
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default KanbanBoard;

import {
  Search,
  FileText,
  CheckCircle,
  TrendingUp
} from "lucide-react";
