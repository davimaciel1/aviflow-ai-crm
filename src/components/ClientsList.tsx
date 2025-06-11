
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  DollarSign,
  Users,
  ChevronDown,
  ChevronRight,
  Edit,
  Trash2,
  Plus,
  Check,
  X
} from "lucide-react";

interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: "active" | "inactive" | "prospect";
  totalValue: number;
  projectsCount: number;
  lastContact: string;
  address?: string;
  notes?: string;
  avatar?: string;
}

const ClientsList = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [editingClient, setEditingClient] = useState<string | null>(null);
  const [tempClientData, setTempClientData] = useState<Partial<Client>>({});
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newClientData, setNewClientData] = useState<Partial<Client>>({
    status: "prospect"
  });

  // Carregar dados do localStorage
  useEffect(() => {
    const savedClients = localStorage.getItem('daviflow_clients');
    if (savedClients) {
      try {
        setClients(JSON.parse(savedClients));
      } catch (error) {
        console.error('Erro ao carregar clientes:', error);
        loadDefaultClients();
      }
    } else {
      loadDefaultClients();
    }
  }, []);

  // Salvar no localStorage sempre que clients mudar
  useEffect(() => {
    if (clients.length > 0) {
      localStorage.setItem('daviflow_clients', JSON.stringify(clients));
    }
  }, [clients]);

  const loadDefaultClients = () => {
    const defaultClients: Client[] = [
      {
        id: "1",
        name: "João Silva",
        company: "TechCorp Ltd",
        email: "joao@techcorp.com",
        phone: "(11) 99999-0001",
        status: "active",
        totalValue: 45000,
        projectsCount: 3,
        lastContact: "2024-06-08",
        address: "São Paulo, SP",
        notes: "Cliente premium, sempre pontual nos pagamentos."
      },
      {
        id: "2",
        name: "Maria Santos",
        company: "StartupXYZ",
        email: "maria@startupxyz.com",
        phone: "(11) 99999-0002",
        status: "active",
        totalValue: 28000,
        projectsCount: 2,
        lastContact: "2024-06-09",
        address: "Rio de Janeiro, RJ",
        notes: "Startup em crescimento, muito engajada no projeto."
      },
      {
        id: "3",
        name: "Pedro Oliveira",
        company: "ABC Corporation",
        email: "pedro@abccorp.com",
        phone: "(11) 99999-0003",
        status: "prospect",
        totalValue: 0,
        projectsCount: 0,
        lastContact: "2024-06-10",
        address: "Belo Horizonte, MG",
        notes: "Interessado em consultoria digital."
      }
    ];
    setClients(defaultClients);
  };

  const toggleExpanded = (clientId: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(clientId)) {
        newSet.delete(clientId);
      } else {
        newSet.add(clientId);
      }
      return newSet;
    });
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client.id);
    setTempClientData({ ...client });
  };

  const handleSaveClient = () => {
    if (!editingClient || !tempClientData) return;

    setClients(prev => prev.map(client => 
      client.id === editingClient 
        ? { ...client, ...tempClientData } 
        : client
    ));

    setEditingClient(null);
    setTempClientData({});
  };

  const handleCancelEdit = () => {
    setEditingClient(null);
    setTempClientData({});
  };

  const handleDeleteClient = (clientId: string) => {
    if (window.confirm("Tem certeza que deseja excluir este cliente?")) {
      setClients(prev => prev.filter(client => client.id !== clientId));
    }
  };

  const handleCreateClient = () => {
    if (!newClientData.name || !newClientData.company || !newClientData.email) {
      alert("Por favor, preencha pelo menos o nome, empresa e email.");
      return;
    }

    const newClient: Client = {
      id: Date.now().toString(),
      name: newClientData.name || "",
      company: newClientData.company || "",
      email: newClientData.email || "",
      phone: newClientData.phone || "",
      status: (newClientData.status as "active" | "inactive" | "prospect") || "prospect",
      totalValue: newClientData.totalValue || 0,
      projectsCount: newClientData.projectsCount || 0,
      lastContact: new Date().toISOString().split('T')[0],
      address: newClientData.address || "",
      notes: newClientData.notes || ""
    };

    setClients(prev => [...prev, newClient]);
    setNewClientData({ status: "prospect" });
    setIsCreateDialogOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "inactive": return "bg-red-100 text-red-800";
      case "prospect": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active": return "Ativo";
      case "inactive": return "Inativo";
      case "prospect": return "Prospect";
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Clientes</h2>
          <p className="text-slate-600">Gerencie sua base de clientes</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Criar Novo Cliente</DialogTitle>
              <DialogDescription>
                Preencha as informações do novo cliente
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Nome *</label>
                <Input
                  value={newClientData.name || ""}
                  onChange={(e) => setNewClientData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nome do cliente"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Empresa *</label>
                <Input
                  value={newClientData.company || ""}
                  onChange={(e) => setNewClientData(prev => ({ ...prev, company: e.target.value }))}
                  placeholder="Nome da empresa"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Email *</label>
                <Input
                  type="email"
                  value={newClientData.email || ""}
                  onChange={(e) => setNewClientData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="email@empresa.com"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Telefone</label>
                <Input
                  value={newClientData.phone || ""}
                  onChange={(e) => setNewClientData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="(11) 99999-9999"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select
                  value={newClientData.status || "prospect"}
                  onValueChange={(value) => setNewClientData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prospect">Prospect</SelectItem>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Endereço</label>
                <Input
                  value={newClientData.address || ""}
                  onChange={(e) => setNewClientData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Cidade, Estado"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Observações</label>
                <Textarea
                  value={newClientData.notes || ""}
                  onChange={(e) => setNewClientData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Observações sobre o cliente..."
                  className="min-h-[80px]"
                />
              </div>
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button onClick={handleCreateClient} className="flex-1">
                <Check className="w-4 h-4 mr-2" />
                Criar Cliente
              </Button>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="flex-1">
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map((client) => {
          const isExpanded = expandedCards.has(client.id);
          const isEditing = editingClient === client.id;

          return (
            <Card key={client.id} className="hover:shadow-lg transition-all duration-200">
              <Collapsible open={isExpanded} onOpenChange={() => toggleExpanded(client.id)}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <Avatar>
                        <AvatarImage src={client.avatar} />
                        <AvatarFallback>
                          {client.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <CollapsibleTrigger className="flex items-center gap-2 w-full text-left">
                          <div>
                            <CardTitle className="text-lg">{client.name}</CardTitle>
                            <CardDescription className="flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              {client.company}
                            </CardDescription>
                          </div>
                          <div className="ml-auto">
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-slate-400" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                        </CollapsibleTrigger>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2">
                    <Badge className={getStatusColor(client.status)}>
                      {getStatusLabel(client.status)}
                    </Badge>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClient(client)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClient(client.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CollapsibleContent>
                  <CardContent className="pt-0">
                    {isEditing ? (
                      <div className="space-y-3">
                        <Input
                          value={tempClientData.name || ""}
                          onChange={(e) => setTempClientData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Nome"
                        />
                        <Input
                          value={tempClientData.company || ""}
                          onChange={(e) => setTempClientData(prev => ({ ...prev, company: e.target.value }))}
                          placeholder="Empresa"
                        />
                        <Input
                          value={tempClientData.email || ""}
                          onChange={(e) => setTempClientData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="Email"
                        />
                        <Input
                          value={tempClientData.phone || ""}
                          onChange={(e) => setTempClientData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="Telefone"
                        />
                        <Select
                          value={tempClientData.status || "prospect"}
                          onValueChange={(value) => setTempClientData(prev => ({ ...prev, status: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="prospect">Prospect</SelectItem>
                            <SelectItem value="active">Ativo</SelectItem>
                            <SelectItem value="inactive">Inativo</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          value={tempClientData.address || ""}
                          onChange={(e) => setTempClientData(prev => ({ ...prev, address: e.target.value }))}
                          placeholder="Endereço"
                        />
                        <Textarea
                          value={tempClientData.notes || ""}
                          onChange={(e) => setTempClientData(prev => ({ ...prev, notes: e.target.value }))}
                          placeholder="Observações"
                          className="min-h-[60px]"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleSaveClient}>
                            <Check className="w-4 h-4 mr-1" />
                            Salvar
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                            <X className="w-4 h-4 mr-1" />
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Mail className="w-4 h-4" />
                          <span>{client.email}</span>
                        </div>
                        
                        {client.phone && (
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Phone className="w-4 h-4" />
                            <span>{client.phone}</span>
                          </div>
                        )}
                        
                        {client.address && (
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <MapPin className="w-4 h-4" />
                            <span>{client.address}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Calendar className="w-4 h-4" />
                          <span>Último contato: {new Date(client.lastContact).toLocaleDateString('pt-BR')}</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 pt-2">
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1 text-green-600 font-semibold">
                              <DollarSign className="w-4 h-4" />
                              <span>R$ {client.totalValue.toLocaleString()}</span>
                            </div>
                            <p className="text-xs text-slate-500">Valor Total</p>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1 text-blue-600 font-semibold">
                              <Users className="w-4 h-4" />
                              <span>{client.projectsCount}</span>
                            </div>
                            <p className="text-xs text-slate-500">Projetos</p>
                          </div>
                        </div>
                        
                        {client.notes && (
                          <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                            <p className="text-sm text-slate-700">{client.notes}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ClientsList;
