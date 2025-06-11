import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Building, 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Plus,
  Users,
  Check,
  X,
  Camera,
  Upload,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ClientUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: "admin" | "user";
}

interface Client {
  id: string;
  name: string;
  industry: string;
  contactEmail: string;
  contactPhone: string;
  website: string;
  address: string;
  status: "active" | "inactive" | "prospect";
  dealsCount: number;
  users: ClientUser[];
  avatar?: string;
}

const ClientsList = () => {
  // Dados iniciais dos clientes
  const initialClients: Client[] = [
    {
      id: "1",
      name: "TechCorp Ltd",
      industry: "Tecnologia",
      contactEmail: "contato@techcorp.com",
      contactPhone: "(11) 99999-9999",
      website: "www.techcorp.com",
      address: "São Paulo, SP",
      status: "active",
      dealsCount: 3,
      users: [
        {
          id: "u1",
          name: "João Silva",
          email: "joao@techcorp.com",
          password: "123456",
          role: "admin"
        },
        {
          id: "u2",
          name: "Ana Costa",
          email: "ana@techcorp.com",
          password: "123456",
          role: "user"
        }
      ]
    },
    {
      id: "2",
      name: "StartupXYZ",
      industry: "Fintech",
      contactEmail: "hello@startupxyz.com",
      contactPhone: "(11) 88888-8888",
      website: "www.startupxyz.com",
      address: "Rio de Janeiro, RJ",
      status: "active",
      dealsCount: 2,
      users: [
        {
          id: "u3",
          name: "Maria Santos",
          email: "maria@startupxyz.com",
          password: "123456",
          role: "admin"
        }
      ]
    },
    {
      id: "3",
      name: "ABC Corporation",
      industry: "Varejo",
      contactEmail: "vendas@abccorp.com",
      contactPhone: "(11) 77777-7777",
      website: "www.abccorp.com",
      address: "Belo Horizonte, MG",
      status: "prospect",
      dealsCount: 1,
      users: []
    },
    {
      id: "4",
      name: "RetailPlus",
      industry: "E-commerce",
      contactEmail: "comercial@retailplus.com",
      contactPhone: "(11) 66666-6666",
      website: "www.retailplus.com",
      address: "Curitiba, PR",
      status: "active",
      dealsCount: 4,
      users: []
    },
    {
      id: "5",
      name: "DataCorp",
      industry: "Analytics",
      contactEmail: "info@datacorp.com",
      contactPhone: "(11) 55555-5555",
      website: "www.datacorp.com",
      address: "Porto Alegre, RS",
      status: "inactive",
      dealsCount: 1,
      users: []
    }
  ];

  // Função para carregar dados do localStorage
  const loadClientsFromStorage = (): Client[] => {
    try {
      const storedClients = localStorage.getItem('crm-clients');
      if (storedClients) {
        console.log('Loading clients from localStorage');
        return JSON.parse(storedClients);
      }
    } catch (error) {
      console.error('Error loading clients from localStorage:', error);
    }
    console.log('Using initial clients data');
    return initialClients;
  };

  // Função para salvar dados no localStorage
  const saveClientsToStorage = (clients: Client[]) => {
    try {
      localStorage.setItem('crm-clients', JSON.stringify(clients));
      console.log('Clients saved to localStorage');
    } catch (error) {
      console.error('Error saving clients to localStorage:', error);
    }
  };

  const [clients, setClients] = useState<Client[]>(loadClientsFromStorage);
  
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [newUser, setNewUser] = useState<Partial<ClientUser>>({});
  const [isAddingUser, setIsAddingUser] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const [editFormData, setEditFormData] = useState<Partial<Client>>({});
  const [newClientData, setNewClientData] = useState<Partial<Client>>({});
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());

  // Salvar no localStorage sempre que os clientes mudarem
  useEffect(() => {
    saveClientsToStorage(clients);
  }, [clients]);

  const toggleClientExpansion = (clientId: string) => {
    setExpandedClients(prev => {
      const newSet = new Set(prev);
      if (newSet.has(clientId)) {
        newSet.delete(clientId);
      } else {
        newSet.add(clientId);
      }
      return newSet;
    });
  };

  const handleViewDetails = (client: Client) => {
    console.log('Opening edit dialog for client:', client.name);
    setSelectedClient(client);
    setEditFormData({
      name: client.name,
      industry: client.industry,
      contactEmail: client.contactEmail,
      contactPhone: client.contactPhone,
      website: client.website,
      address: client.address,
      status: client.status,
      avatar: client.avatar
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveClient = () => {
    if (!selectedClient) {
      console.log('No selected client to save');
      return;
    }
    
    console.log('Saving client changes:', editFormData);
    console.log('Selected client ID:', selectedClient.id);
    
    setClients(prev => {
      const updatedClients = prev.map(client => {
        if (client.id === selectedClient.id) {
          const updatedClient = { ...client, ...editFormData };
          console.log('Updated client:', updatedClient);
          return updatedClient;
        }
        return client;
      });
      console.log('All clients after update:', updatedClients);
      return updatedClients;
    });
    
    setIsEditDialogOpen(false);
    setSelectedClient(null);
    setEditFormData({});
  };

  const handleAddClient = () => {
    if (!newClientData.name || !newClientData.industry || !newClientData.contactEmail) {
      console.log('Missing required fields for new client');
      return;
    }

    const newClient: Client = {
      id: `client-${Date.now()}`,
      name: newClientData.name,
      industry: newClientData.industry || '',
      contactEmail: newClientData.contactEmail,
      contactPhone: newClientData.contactPhone || '',
      website: newClientData.website || '',
      address: newClientData.address || '',
      status: newClientData.status || 'prospect',
      dealsCount: 0,
      users: [],
      avatar: newClientData.avatar
    };

    console.log('Adding new client:', newClient);
    setClients(prev => [...prev, newClient]);
    setIsAddDialogOpen(false);
    setNewClientData({});
  };

  const handleAvatarUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const imageUrl = URL.createObjectURL(file);
        setEditFormData(prev => ({ ...prev, avatar: imageUrl }));
      }
    };
    input.click();
  };

  const handleNewAvatarUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const imageUrl = URL.createObjectURL(file);
        setNewClientData(prev => ({ ...prev, avatar: imageUrl }));
      }
    };
    input.click();
  };

  const handleAddUser = (clientId: string) => {
    if (newUser.name && newUser.email && newUser.password) {
      setClients(prev => prev.map(client => {
        if (client.id === clientId) {
          return {
            ...client,
            users: [...client.users, {
              id: `u${Date.now()}`,
              name: newUser.name!,
              email: newUser.email!,
              password: newUser.password!,
              role: newUser.role as "admin" | "user" || "user"
            }]
          };
        }
        return client;
      }));
      setNewUser({});
      setIsAddingUser(null);
    }
  };

  const handleDeleteUser = (clientId: string, userId: string) => {
    setClients(prev => prev.map(client => {
      if (client.id === clientId) {
        return {
          ...client,
          users: client.users.filter(user => user.id !== userId)
        };
      }
      return client;
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "inactive": return "bg-gray-100 text-gray-800";
      case "prospect": return "bg-blue-100 text-blue-800";
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
    <>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Lista de Clientes</h3>
          <p className="text-sm text-muted-foreground">Gerencie seus clientes e usuários</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map((client) => {
          const isExpanded = expandedClients.has(client.id);
          
          return (
            <Collapsible
              key={client.id}
              open={isExpanded}
              onOpenChange={() => toggleClientExpansion(client.id)}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CollapsibleTrigger asChild>
                  <CardHeader className="pb-3 cursor-pointer">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          {client.avatar ? (
                            <AvatarImage src={client.avatar} alt={client.name} />
                          ) : (
                            <AvatarFallback className="bg-blue-100 text-blue-600">
                              {client.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="flex-1">
                          <CardTitle className="text-lg">{client.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{client.industry}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleViewDetails(client)}>
                              <Eye className="w-4 h-4 mr-2" />
                              Visualizar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleViewDetails(client)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    
                    {/* Informações sempre visíveis */}
                    <div className="flex justify-between items-center mt-2">
                      <Badge className={getStatusColor(client.status)}>
                        {getStatusLabel(client.status)}
                      </Badge>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">{client.dealsCount} deals</div>
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <CardContent className="space-y-4 pt-0">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{client.contactEmail}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        <span>{client.contactPhone}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Globe className="w-4 h-4" />
                        <span className="truncate">{client.website}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{client.address}</span>
                      </div>
                    </div>

                    {/* Seção de Usuários */}
                    <div className="pt-3 border-t border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1 text-sm font-medium">
                          <Users className="w-4 h-4" />
                          Usuários ({client.users.length})
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsAddingUser(client.id);
                          }}
                          className="h-6 w-6 p-0"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>

                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {client.users.map((user) => (
                          <div key={user.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                            <div className="flex-1">
                              <div className="font-medium">{user.name}</div>
                              <div className="text-muted-foreground">{user.email}</div>
                              <div className="text-muted-foreground">Senha: {user.password}</div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                                {user.role}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteUser(client.id, user.id);
                                }}
                                className="h-5 w-5 p-0 text-red-600"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))}

                        {isAddingUser === client.id && (
                          <div className="p-2 border border-gray-200 rounded space-y-2">
                            <Input
                              placeholder="Nome"
                              value={newUser.name || ""}
                              onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                              className="text-xs h-7"
                            />
                            <Input
                              placeholder="Email"
                              value={newUser.email || ""}
                              onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                              className="text-xs h-7"
                            />
                            <Input
                              placeholder="Senha"
                              value={newUser.password || ""}
                              onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                              className="text-xs h-7"
                            />
                            <div className="flex items-center gap-1">
                              <select
                                value={newUser.role || "user"}
                                onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value as "admin" | "user" }))}
                                className="text-xs border rounded px-2 py-1 flex-1"
                              >
                                <option value="user">Usuário</option>
                                <option value="admin">Admin</option>
                              </select>
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddUser(client.id);
                                }}
                                className="h-6 w-6 p-0"
                              >
                                <Check className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setIsAddingUser(null);
                                }}
                                className="h-6 w-6 p-0"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="pt-3 border-t border-slate-200">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(client);
                        }}
                      >
                        <Building className="w-4 h-4 mr-2" />
                        Ver Detalhes
                      </Button>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          );
        })}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
            <DialogDescription>
              Atualize as informações do cliente
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-2">
              <Avatar className="w-20 h-20">
                {editFormData.avatar ? (
                  <AvatarImage src={editFormData.avatar} alt={editFormData.name} />
                ) : (
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-lg">
                    {editFormData.name?.split(' ').map(n => n[0]).join('') || 'CL'}
                  </AvatarFallback>
                )}
              </Avatar>
              <Button variant="outline" size="sm" onClick={handleAvatarUpload}>
                <Camera className="w-4 h-4 mr-2" />
                Alterar Avatar
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-sm font-medium">Nome</label>
                <Input
                  value={editFormData.name || ""}
                  onChange={(e) => {
                    console.log('Changing name to:', e.target.value);
                    setEditFormData(prev => ({ ...prev, name: e.target.value }));
                  }}
                />
              </div>
              
              <div className="col-span-2">
                <label className="text-sm font-medium">Indústria</label>
                <Input
                  value={editFormData.industry || ""}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, industry: e.target.value }))}
                />
              </div>
              
              <div className="col-span-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  value={editFormData.contactEmail || ""}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Telefone</label>
                <Input
                  value={editFormData.contactPhone || ""}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Status</label>
                <select
                  value={editFormData.status || "active"}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, status: e.target.value as "active" | "inactive" | "prospect" }))}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                  <option value="prospect">Prospect</option>
                </select>
              </div>
              
              <div className="col-span-2">
                <label className="text-sm font-medium">Website</label>
                <Input
                  value={editFormData.website || ""}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, website: e.target.value }))}
                />
              </div>
              
              <div className="col-span-2">
                <label className="text-sm font-medium">Endereço</label>
                <Input
                  value={editFormData.address || ""}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button onClick={handleSaveClient} className="flex-1">
                Salvar
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setSelectedClient(null);
                  setEditFormData({});
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Cliente</DialogTitle>
            <DialogDescription>
              Adicione um novo cliente ao sistema
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-2">
              <Avatar className="w-20 h-20">
                {newClientData.avatar ? (
                  <AvatarImage src={newClientData.avatar} alt={newClientData.name} />
                ) : (
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-lg">
                    {newClientData.name?.split(' ').map(n => n[0]).join('') || 'NC'}
                  </AvatarFallback>
                )}
              </Avatar>
              <Button variant="outline" size="sm" onClick={handleNewAvatarUpload}>
                <Camera className="w-4 h-4 mr-2" />
                Adicionar Avatar
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-sm font-medium">Nome *</label>
                <Input
                  value={newClientData.name || ""}
                  onChange={(e) => setNewClientData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nome do cliente"
                />
              </div>
              
              <div className="col-span-2">
                <label className="text-sm font-medium">Indústria *</label>
                <Input
                  value={newClientData.industry || ""}
                  onChange={(e) => setNewClientData(prev => ({ ...prev, industry: e.target.value }))}
                  placeholder="Tecnologia, Fintech, etc."
                />
              </div>
              
              <div className="col-span-2">
                <label className="text-sm font-medium">Email *</label>
                <Input
                  value={newClientData.contactEmail || ""}
                  onChange={(e) => setNewClientData(prev => ({ ...prev, contactEmail: e.target.value }))}
                  placeholder="contato@empresa.com"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Telefone</label>
                <Input
                  value={newClientData.contactPhone || ""}
                  onChange={(e) => setNewClientData(prev => ({ ...prev, contactPhone: e.target.value }))}
                  placeholder="(11) 99999-9999"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Status</label>
                <select
                  value={newClientData.status || "prospect"}
                  onChange={(e) => setNewClientData(prev => ({ ...prev, status: e.target.value as "active" | "inactive" | "prospect" }))}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="prospect">Prospect</option>
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                </select>
              </div>
              
              <div className="col-span-2">
                <label className="text-sm font-medium">Website</label>
                <Input
                  value={newClientData.website || ""}
                  onChange={(e) => setNewClientData(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="www.empresa.com"
                />
              </div>
              
              <div className="col-span-2">
                <label className="text-sm font-medium">Endereço</label>
                <Input
                  value={newClientData.address || ""}
                  onChange={(e) => setNewClientData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Cidade, Estado"
                />
              </div>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button onClick={handleAddClient} className="flex-1">
                Criar Cliente
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsAddDialogOpen(false);
                  setNewClientData({});
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ClientsList;
