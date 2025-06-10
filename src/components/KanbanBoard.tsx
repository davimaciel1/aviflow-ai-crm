import { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  MoreHorizontal, 
  DollarSign, 
  Calendar, 
  User, 
  Phone,
  Mail,
  Building,
  Plus,
  Edit3,
  Check,
  X
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Deal {
  id: string;
  title: string;
  value: string;
  client: string;
  clientId: string;
  contact: string;
  email: string;
  phone: string;
  dueDate: string;
  priority: "low" | "medium" | "high";
  tasks: { total: number; completed: number };
  confidentialInfo?: string;
}

interface Column {
  id: string;
  title: string;
  deals: Deal[];
  color: string;
}

const KanbanBoard = () => {
  const { user } = useAuth();
  const isClientView = user?.role === 'client';
  const [editingConfidential, setEditingConfidential] = useState<string | null>(null);
  const [tempConfidentialValue, setTempConfidentialValue] = useState<string>("");

  const [columns, setColumns] = useState<Column[]>([
    {
      id: "prospecting",
      title: "Prospecção",
      color: "bg-slate-100",
      deals: [
        {
          id: "1",
          title: "Sistema ERP - TechCorp",
          value: "R$ 150.000",
          client: "TechCorp Ltd",
          clientId: "techcorp",
          contact: "João Silva",
          email: "joao@techcorp.com",
          phone: "(11) 99999-9999",
          dueDate: "2024-06-15",
          priority: "high",
          tasks: { total: 5, completed: 2 },
          confidentialInfo: "Margem: 45% - Concorrente: Oracle"
        },
        {
          id: "2",
          title: "Consultoria Digital - StartupXYZ",
          value: "R$ 75.000",
          client: "StartupXYZ",
          clientId: "startupxyz",
          contact: "Maria Santos",
          email: "maria@startupxyz.com",
          phone: "(11) 88888-8888",
          dueDate: "2024-06-20",
          priority: "medium",
          tasks: { total: 3, completed: 1 },
          confidentialInfo: "Budget máximo: R$ 100k"
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
          value: "R$ 45.000",
          client: "ABC Corporation",
          clientId: "abccorp",
          contact: "Pedro Oliveira",
          email: "pedro@abccorp.com",
          phone: "(11) 77777-7777",
          dueDate: "2024-06-18",
          priority: "medium",
          tasks: { total: 4, completed: 3 },
          confidentialInfo: "Decisor: CEO Pedro"
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
          value: "R$ 200.000",
          client: "RetailPlus",
          clientId: "retailplus",
          contact: "Ana Costa",
          email: "ana@retailplus.com",
          phone: "(11) 66666-6666",
          dueDate: "2024-06-12",
          priority: "high",
          tasks: { total: 6, completed: 4 }
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
          value: "R$ 120.000",
          client: "DataCorp",
          clientId: "datacorp",
          contact: "Carlos Lima",
          email: "carlos@datacorp.com",
          phone: "(11) 55555-5555",
          dueDate: "2024-06-14",
          priority: "high",
          tasks: { total: 3, completed: 2 }
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
          value: "R$ 180.000",
          client: "ShopMais",
          clientId: "shopmais",
          contact: "Lucas Ferreira",
          email: "lucas@shopmais.com",
          phone: "(11) 44444-4444",
          dueDate: "2024-06-10",
          priority: "medium",
          tasks: { total: 8, completed: 8 }
        }
      ]
    }
  ]);

  // Filter deals for client view
  const getFilteredColumns = () => {
    if (!isClientView || !user?.clientId) {
      return columns;
    }

    return columns.map(column => ({
      ...column,
      deals: column.deals.filter(deal => deal.clientId === user.clientId)
    }));
  };

  const handleEditConfidential = (dealId: string, currentValue: string = "") => {
    setEditingConfidential(dealId);
    setTempConfidentialValue(currentValue);
  };

  const handleSaveConfidential = (dealId: string) => {
    setColumns(prevColumns => 
      prevColumns.map(column => ({
        ...column,
        deals: column.deals.map(deal => 
          deal.id === dealId 
            ? { ...deal, confidentialInfo: tempConfidentialValue }
            : deal
        )
      }))
    );
    setEditingConfidential(null);
    setTempConfidentialValue("");
  };

  const handleCancelEdit = () => {
    setEditingConfidential(null);
    setTempConfidentialValue("");
  };

  const onDragEnd = (result: DropResult) => {
    // Disable drag & drop for client view
    if (isClientView) {
      return;
    }

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

    const sourceColumn = columns.find(col => col.id === source.droppableId);
    const destColumn = columns.find(col => col.id === destination.droppableId);

    if (!sourceColumn || !destColumn) {
      return;
    }

    if (source.droppableId === destination.droppableId) {
      // Moving within the same column
      const newDeals = Array.from(sourceColumn.deals);
      const [reorderedDeal] = newDeals.splice(source.index, 1);
      newDeals.splice(destination.index, 0, reorderedDeal);

      const newColumns = columns.map(col => {
        if (col.id === sourceColumn.id) {
          return {
            ...col,
            deals: newDeals
          };
        }
        return col;
      });

      setColumns(newColumns);
    } else {
      // Moving between different columns
      const sourceDeals = Array.from(sourceColumn.deals);
      const destDeals = Array.from(destColumn.deals);
      const [movedDeal] = sourceDeals.splice(source.index, 1);
      destDeals.splice(destination.index, 0, movedDeal);

      const newColumns = columns.map(col => {
        if (col.id === sourceColumn.id) {
          return {
            ...col,
            deals: sourceDeals
          };
        }
        if (col.id === destColumn.id) {
          return {
            ...col,
            deals: destDeals
          };
        }
        return col;
      });

      setColumns(newColumns);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const DealCard = ({ deal, index }: { deal: Deal; index: number }) => (
    <Draggable draggableId={deal.id} index={index} isDragDisabled={isClientView}>
      {(provided, snapshot) => (
        <Card 
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`mb-4 hover:shadow-md transition-shadow ${!isClientView ? 'cursor-pointer' : ''} ${
            snapshot.isDragging ? 'shadow-lg transform rotate-2' : ''
          }`}
        >
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <CardTitle className="text-sm font-medium">{deal.title}</CardTitle>
              {!isClientView && (
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="font-semibold text-green-600">{deal.value}</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building className="w-4 h-4" />
              <span>{deal.client}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="w-4 h-4" />
              <span>{deal.contact}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="w-4 h-4" />
              <span className="truncate">{deal.email}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="w-4 h-4" />
              <span>{deal.phone}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{deal.dueDate}</span>
            </div>
            
            {/* Show confidential info only to admins */}
            {!isClientView && (
              <div className="p-2 bg-red-50 border border-red-200 rounded">
                <div className="flex items-center justify-between mb-2">
                  <strong className="text-xs text-red-800">Confidencial:</strong>
                  {editingConfidential !== deal.id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditConfidential(deal.id, deal.confidentialInfo || "")}
                      className="h-6 w-6 p-0"
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
                      className="text-xs min-h-[60px] resize-none"
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
                        onClick={handleCancelEdit}
                        className="h-6 px-2 text-xs"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-red-800">
                    {deal.confidentialInfo || "Clique no ícone de edição para adicionar informações confidenciais"}
                  </div>
                )}
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className={getPriorityColor(deal.priority)}>
                {deal.priority}
              </Badge>
              <div className="text-xs text-muted-foreground">
                {deal.tasks.completed}/{deal.tasks.total} tarefas
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <Avatar className="w-6 h-6">
                <AvatarFallback className="text-xs">
                  {deal.contact.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="w-full mx-2 bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-blue-600 h-1.5 rounded-full" 
                  style={{ width: `${(deal.tasks.completed / deal.tasks.total) * 100}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </Draggable>
  );

  const filteredColumns = getFilteredColumns();

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-6 overflow-x-auto pb-6 min-h-[600px]">
        {filteredColumns.map((column) => (
          <div key={column.id} className="flex-shrink-0 w-80">
            <div className={`${column.color} rounded-lg p-4 min-h-full`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-slate-900">
                  {column.title}
                </h3>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {column.deals.length}
                  </Badge>
                  {!isClientView && (
                    <Button variant="ghost" size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
              
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`space-y-3 min-h-[200px] ${
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
      </div>
    </DragDropContext>
  );
};

export default KanbanBoard;

}
