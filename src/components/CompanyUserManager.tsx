
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Users, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  X,
  Mail,
  Lock,
  User
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface CompanyUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: "admin" | "user";
  companyId: string;
  companyName: string;
}

interface Company {
  id: string;
  name: string;
}

const CompanyUserManager = () => {
  const [users, setUsers] = useState<CompanyUser[]>([
    {
      id: "u1",
      name: "João Silva",
      email: "joao@techcorp.com",
      password: "123456",
      role: "admin",
      companyId: "techcorp",
      companyName: "TechCorp Ltd"
    },
    {
      id: "u2",
      name: "Maria Santos",
      email: "maria@startupxyz.com",
      password: "123456",
      role: "admin",
      companyId: "startupxyz",
      companyName: "StartupXYZ"
    },
    {
      id: "u3",
      name: "Pedro Oliveira",
      email: "pedro@abccorp.com",
      password: "123456",
      role: "user",
      companyId: "abccorp",
      companyName: "ABC Corporation"
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [newUser, setNewUser] = useState<Partial<CompanyUser>>({});

  const companies: Company[] = [
    { id: "techcorp", name: "TechCorp Ltd" },
    { id: "startupxyz", name: "StartupXYZ" },
    { id: "abccorp", name: "ABC Corporation" },
    { id: "retailplus", name: "RetailPlus" },
    { id: "datacorp", name: "DataCorp" },
    { id: "shopmais", name: "ShopMais" }
  ];

  const handleAddUser = () => {
    if (newUser.name && newUser.email && newUser.password && newUser.companyId) {
      const selectedCompany = companies.find(c => c.id === newUser.companyId);
      setUsers(prev => [...prev, {
        id: `u${Date.now()}`,
        name: newUser.name!,
        email: newUser.email!,
        password: newUser.password!,
        role: newUser.role || "user",
        companyId: newUser.companyId!,
        companyName: selectedCompany?.name || ""
      }]);
      setNewUser({});
      setIsDialogOpen(false);
    }
  };

  const handleEditUser = (user: CompanyUser) => {
    setEditingUser(user.id);
    setNewUser(user);
    setIsDialogOpen(true);
  };

  const handleUpdateUser = () => {
    if (editingUser && newUser.name && newUser.email && newUser.password) {
      const selectedCompany = companies.find(c => c.id === newUser.companyId);
      setUsers(prev => prev.map(user => 
        user.id === editingUser 
          ? { ...user, ...newUser, companyName: selectedCompany?.name || user.companyName }
          : user
      ));
      setNewUser({});
      setEditingUser(null);
      setIsDialogOpen(false);
    }
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(prev => prev.filter(user => user.id !== userId));
  };

  const getRoleColor = (role: string) => {
    return role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Usuários das Empresas</h2>
          <p className="text-muted-foreground">Gerencie os usuários que têm acesso aos projetos de cada empresa</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setNewUser({}); setEditingUser(null); }}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
              <DialogDescription>
                {editingUser ? 'Atualize as informações do usuário' : 'Adicione um novo usuário para uma empresa'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nome</label>
                <Input
                  value={newUser.name || ""}
                  onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nome completo"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={newUser.email || ""}
                  onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="email@empresa.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Senha</label>
                <Input
                  type="password"
                  value={newUser.password || ""}
                  onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Senha de acesso"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Empresa</label>
                <select
                  value={newUser.companyId || ""}
                  onChange={(e) => setNewUser(prev => ({ ...prev, companyId: e.target.value }))}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="">Selecionar empresa</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Perfil</label>
                <select
                  value={newUser.role || "user"}
                  onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value as "admin" | "user" }))}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="user">Usuário</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button onClick={editingUser ? handleUpdateUser : handleAddUser} className="flex-1">
                  {editingUser ? 'Atualizar' : 'Adicionar'}
                </Button>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user) => (
          <Card key={user.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">{user.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{user.companyName}</p>
                  </div>
                </div>
                <Badge className={getRoleColor(user.role)}>
                  {user.role === 'admin' ? 'Admin' : 'Usuário'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Lock className="w-4 h-4 text-muted-foreground" />
                <span>••••••</span>
                <span className="text-xs text-muted-foreground ml-auto">
                  Senha: {user.password}
                </span>
              </div>
              <div className="flex gap-2 pt-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleEditUser(user)}
                  className="flex-1"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Editar
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDeleteUser(user.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CompanyUserManager;
