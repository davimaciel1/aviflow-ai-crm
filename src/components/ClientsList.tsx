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
  X,
  User,
  Upload
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
  users?: CompanyUser[];
}

interface CompanyUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: "admin" | "user";
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
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [newUserData, setNewUserData] = useState<Partial<CompanyUser>>({});
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingAvatarId, setEditingAvatarId] = useState<string | null>(null);
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const [newAvatarUrl, setNewAvatarUrl] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

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
        notes: "Cliente premium, sempre pontual nos pagamentos.",
        users: [
          { id: "u1", name: "João Silva", email: "joao@techcorp.com", password: "123456", role: "admin" },
          { id: "u2", name: "Ana Costa", email: "ana@techcorp.com", password: "123456", role: "user" }
        ]
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
        notes: "Startup em crescimento, muito engajada no projeto.",
        users: [
          { id: "u3", name: "Maria Santos", email: "maria@startupxyz.com", password: "123456", role: "admin" }
        ]
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
        notes: "Interessado em consultoria digital.",
        users: []
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
      notes: newClientData.notes || "",
      users: []
    };

    setClients(prev => [...prev, newClient]);
    setNewClientData({ status: "prospect" });
    setIsCreateDialogOpen(false);
  };

  // User management functions
  const handleAddUser = () => {
    if (!selectedClientId || !newUserData.name || !newUserData.email || !newUserData.password) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    const newUser: CompanyUser = {
      id: Date.now().toString(),
      name: newUserData.name,
      email: newUserData.email,
      password: newUserData.password,
      role: newUserData.role || "user"
    };

    setClients(prev => prev.map(client => 
      client.id === selectedClientId 
        ? { ...client, users: [...(client.users || []), newUser] }
        : client
    ));

    setNewUserData({});
    setIsUserDialogOpen(false);
    setEditingUserId(null);
  };

  const handleEditUser = (user: CompanyUser, clientId: string) => {
    setSelectedClientId(clientId);
    setEditingUserId(user.id);
    setNewUserData(user);
    setIsUserDialogOpen(true);
  };

  const handleUpdateUser = () => {
    if (!selectedClientId || !editingUserId || !newUserData.name || !newUserData.email || !newUserData.password) {
      return;
    }

    setClients(prev => prev.map(client => 
      client.id === selectedClientId 
        ? { 
            ...client, 
            users: client.users?.map(user => 
              user.id === editingUserId 
                ? { ...user, ...newUserData } as CompanyUser
                : user
            ) || []
          }
        : client
    ));

    setNewUserData({});
    setIsUserDialogOpen(false);
    setEditingUserId(null);
    setSelectedClientId(null);
  };

  const handleDeleteUser = (userId: string, clientId: string) => {
    if (window.confirm("Tem certeza que deseja excluir este usuário?")) {
      setClients(prev => prev.map(client => 
        client.id === clientId 
          ? { ...client, users: client.users?.filter(user => user.id !== userId) || [] }
          : client
      ));
    }
  };

  const openUserDialog = (clientId: string) => {
    setSelectedClientId(clientId);
    setNewUserData({});
    setEditingUserId(null);
    setIsUserDialogOpen(true);
  };

  const handleEditAvatar = (clientId: string, currentAvatar?: string) => {
    setEditingAvatarId(clientId);
    setNewAvatarUrl(currentAvatar || "");
    setUploadedFile(null);
    setPreviewUrl(currentAvatar || "");
    setIsAvatarDialogOpen(true);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setNewAvatarUrl(""); // Clear URL input when file is selected
    }
  };

  const handleUrlChange = (url: string) => {
    setNewAvatarUrl(url);
    setPreviewUrl(url);
    setUploadedFile(null); // Clear file when URL is entered
  };

  const handleSaveAvatar = () => {
    if (!editingAvatarId) return;

    let avatarUrl = "";
    
    if (uploadedFile) {
      // In a real app, you would upload to a service like Supabase Storage
      // For now, we'll use the object URL (note: this won't persist after page reload)
      avatarUrl = URL.createObjectURL(uploadedFile);
    } else {
      avatarUrl = newAvatarUrl;
    }

    setClients(prev => prev.map(client => 
      client.id === editingAvatarId 
        ? { ...client, avatar: avatarUrl }
        : client
    ));

    setEditingAvatarId(null);
    setNewAvatarUrl("");
    setUploadedFile(null);
    setPreviewUrl("");
    setIsAvatarDialogOpen(false);
  };

  const handleCancelAvatarEdit = () => {
    setEditingAvatarId(null);
    setNewAvatarUrl("");
    setUploadedFile(null);
    setPreviewUrl("");
    setIsAvatarDialogOpen(false);
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

  const getRoleColor = (role: string) => {
    return role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Clientes</h2>
          <p className="text-slate-600">Gerencie sua base de clientes e usuários</p>
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
                  onValueChange={(value: "active" | "inactive" | "prospect") => setNewClientData(prev => ({ ...prev, status: value }))}
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

      {/* Avatar Edit Dialog */}
      <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Avatar</DialogTitle>
            <DialogDescription>
              Faça upload de uma imagem ou adicione uma URL para o avatar
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Upload de Arquivo</label>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="avatar-upload"
                />
                <label htmlFor="avatar-upload" className="flex-1">
                  <Button variant="outline" className="w-full cursor-pointer" asChild>
                    <div className="flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      {uploadedFile ? uploadedFile.name : "Escolher arquivo"}
                    </div>
                  </Button>
                </label>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="text-sm text-gray-500">ou</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">URL da Imagem</label>
              <Input
                value={newAvatarUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://exemplo.com/avatar.jpg"
                disabled={!!uploadedFile}
              />
            </div>
            
            {previewUrl && (
              <div className="flex justify-center">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={previewUrl} />
                  <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                    Preview
                  </AvatarFallback>
                </Avatar>
              </div>
            )}
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button onClick={handleSaveAvatar} className="flex-1">
              <Check className="w-4 h-4 mr-2" />
              Salvar Avatar
            </Button>
            <Button variant="outline" onClick={handleCancelAvatarEdit} className="flex-1">
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* User Management Dialog */}
      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUserId ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
            <DialogDescription>
              {editingUserId ? 'Atualize as informações do usuário' : 'Adicione um novo usuário para a empresa'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nome *</label>
              <Input
                value={newUserData.name || ""}
                onChange={(e) => setNewUserData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nome completo"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email *</label>
              <Input
                type="email"
                value={newUserData.email || ""}
                onChange={(e) => setNewUserData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="email@empresa.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Senha *</label>
              <Input
                type="password"
                value={newUserData.password || ""}
                onChange={(e) => setNewUserData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Senha de acesso"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Perfil</label>
              <Select
                value={newUserData.role || "user"}
                onValueChange={(value: "admin" | "user") => setNewUserData(prev => ({ ...prev, role: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Usuário</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={editingUserId ? handleUpdateUser : handleAddUser} className="flex-1">
                {editingUserId ? 'Atualizar' : 'Adicionar'}
              </Button>
              <Button variant="outline" onClick={() => setIsUserDialogOpen(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map((client) => {
          const isExpanded = expandedCards.has(client.id);
          const isEditing = editingClient === client.id;

          return (
            <Card key={client.id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
              <Collapsible open={isExpanded} onOpenChange={() => toggleExpanded(client.id)}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={client.avatar} />
                          <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                            {client.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditAvatar(client.id, client.avatar)}
                          className="absolute -top-1 -right-1 h-6 w-6 p-0 bg-white border shadow-sm rounded-full hover:bg-gray-50"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="flex-1">
                        <CollapsibleTrigger className="flex items-center gap-2 w-full text-left">
                          <div>
                            <CardTitle className="text-lg text-slate-800">{client.name}</CardTitle>
                            <CardDescription className="flex items-center gap-1 text-slate-600">
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
                  
                  <div className="flex items-center justify-between mt-3">
                    <Badge className={getStatusColor(client.status)}>
                      {getStatusLabel(client.status)}
                    </Badge>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {client.users?.length || 0} usuários
                      </span>
                      <div className="flex gap-1">
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
                          onValueChange={(value: "active" | "inactive" | "prospect") => setTempClientData(prev => ({ ...prev, status: value }))}
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
                      <div className="space-y-4">
                        {/* Client Info */}
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

                        {/* Users Section */}
                        <div className="border-t pt-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-slate-800 flex items-center gap-2">
                              <User className="w-4 h-4" />
                              Usuários da Empresa
                            </h4>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openUserDialog(client.id)}
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Usuário
                            </Button>
                          </div>
                          
                          <div className="space-y-2">
                            {client.users && client.users.length > 0 ? (
                              client.users.map((user) => (
                                <div key={user.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-6 w-6">
                                      <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
                                        {user.name.split(' ').map(n => n[0]).join('')}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="text-sm font-medium">{user.name}</p>
                                      <p className="text-xs text-slate-500">{user.email}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge className={getRoleColor(user.role)} variant="secondary">
                                      {user.role === 'admin' ? 'Admin' : 'User'}
                                    </Badge>
                                    <div className="flex gap-1">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleEditUser(user, client.id)}
                                        className="h-6 w-6 p-0"
                                      >
                                        <Edit className="w-3 h-3" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleDeleteUser(user.id, client.id)}
                                        className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-sm text-slate-500 text-center py-2">Nenhum usuário cadastrado</p>
                            )}
                          </div>
                        </div>
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
