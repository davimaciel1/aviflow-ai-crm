
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Calendar, 
  User, 
  Building, 
  Clock,
  CheckCircle,
  AlertCircle,
  MoreHorizontal
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Task {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "completed";
  dueDate: string;
  assignedTo: string;
  dealTitle?: string;
  clientName?: string;
  createdAt: string;
}

const TasksList = () => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Preparar proposta comercial",
      description: "Elaborar proposta detalhada com pricing e cronograma",
      priority: "high",
      status: "pending",
      dueDate: "2024-06-12",
      assignedTo: "João Silva",
      dealTitle: "Sistema ERP - TechCorp",
      clientName: "TechCorp Ltd",
      createdAt: "2024-06-10"
    },
    {
      id: "2",
      title: "Follow-up com cliente",
      description: "Ligar para discutir feedback da reunião",
      priority: "medium",
      status: "pending",
      dueDate: "2024-06-13",
      assignedTo: "Maria Santos",
      dealTitle: "App Mobile - RetailPlus",
      clientName: "RetailPlus",
      createdAt: "2024-06-09"
    },
    {
      id: "3",
      title: "Análise de requisitos",
      description: "Revisar documentação técnica enviada pelo cliente",
      priority: "medium",
      status: "completed",
      dueDate: "2024-06-11",
      assignedTo: "Pedro Oliveira",
      dealTitle: "Website Institucional - ABC Corp",
      clientName: "ABC Corporation",
      createdAt: "2024-06-08"
    },
    {
      id: "4",
      title: "Agendar reunião de kickoff",
      description: "Coordenar agenda com equipe do cliente",
      priority: "high",
      status: "pending",
      dueDate: "2024-06-14",
      assignedTo: "Ana Costa",
      dealTitle: "Dashboard Analytics - DataCorp",
      clientName: "DataCorp",
      createdAt: "2024-06-10"
    },
    {
      id: "5",
      title: "Enviar contrato para assinatura",
      description: "Preparar documentos finais e enviar via DocuSign",
      priority: "low",
      status: "pending",
      dueDate: "2024-06-15",
      assignedTo: "Carlos Lima",
      dealTitle: "E-commerce - ShopMais",
      clientName: "ShopMais",
      createdAt: "2024-06-07"
    }
  ]);

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

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const toggleTaskStatus = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, status: task.status === "completed" ? "pending" : "completed" }
        : task
    ));
  };

  const pendingTasks = tasks.filter(task => task.status === "pending");
  const completedTasks = tasks.filter(task => task.status === "completed");

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold">{pendingTasks.length}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Concluídas</p>
                <p className="text-2xl font-bold">{completedTasks.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Atrasadas</p>
                <p className="text-2xl font-bold">
                  {pendingTasks.filter(task => isOverdue(task.dueDate)).length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Tarefas Pendentes</h3>
        {pendingTasks.map((task) => (
          <Card key={task.id} className={`hover:shadow-md transition-shadow ${isOverdue(task.dueDate) ? 'border-red-200' : ''}`}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Checkbox
                  checked={task.status === "completed"}
                  onCheckedChange={() => toggleTaskStatus(task.id)}
                  className="mt-1"
                />
                
                <div className="flex-1 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-slate-900">{task.title}</h4>
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>Editar</DropdownMenuItem>
                        <DropdownMenuItem>Duplicar</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">Excluir</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span className={isOverdue(task.dueDate) ? 'text-red-600 font-medium' : ''}>
                        {task.dueDate}
                        {isOverdue(task.dueDate) && " (Atrasada)"}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{task.assignedTo}</span>
                    </div>
                    
                    {task.clientName && (
                      <div className="flex items-center gap-1">
                        <Building className="w-4 h-4" />
                        <span>{task.clientName}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Badge className={getPriorityColor(task.priority)}>
                      {getPriorityLabel(task.priority)}
                    </Badge>
                    
                    {task.dealTitle && (
                      <span className="text-xs text-muted-foreground">
                        Vinculada a: {task.dealTitle}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {pendingTasks.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold text-slate-900 mb-2">Todas as tarefas concluídas!</h3>
              <p className="text-muted-foreground">Parabéns! Você não tem tarefas pendentes.</p>
            </CardContent>
          </Card>
        )}

        {completedTasks.length > 0 && (
          <>
            <h3 className="text-lg font-semibold mt-8">Tarefas Concluídas</h3>
            {completedTasks.map((task) => (
              <Card key={task.id} className="opacity-75 hover:opacity-100 transition-opacity">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Checkbox
                      checked={true}
                      onCheckedChange={() => toggleTaskStatus(task.id)}
                      className="mt-1"
                    />
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-slate-900 line-through">{task.title}</h4>
                          <p className="text-sm text-muted-foreground">{task.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{task.dueDate}</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{task.assignedTo}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default TasksList;
