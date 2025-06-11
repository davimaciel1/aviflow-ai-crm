
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
  User,
  Eye,
  EyeOff
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
  passwordHash: string; // Changed from password to passwordHash
  role: "admin" | "user";
  companyId: string;
  companyName: string;
}

interface Company {
  id: string;
  name: string;
}

// Utility function to generate password hash (simplified for demo)
const generatePasswordHash = (password: string): string => {
  // In a real application, use bcrypt or similar
  return `hash_${password}_${Date.now()}`;
};

// Utility function to validate password strength
const validatePassword = (password: string): { isValid: boolean; message: string } => {
  if (password.length < 6) {
    return { isValid: false, message: "Senha deve ter pelo menos 6 caracteres" };
  }
  if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(password)) {
    return { isValid: false, message: "Senha deve conter letras e números" };
  }
  return { isValid: true, message: "" };
};

const CompanyUserManager = () => {
  const [users, setUsers] = useState<CompanyUser[]>([
    {
      id: "u1",
      name: "João Silva",
      email: "joao@techcorp.com",
      passwordHash: generatePasswordHash("secure123"),
      role: "admin",
      companyId: "techcorp",
      companyName: "TechCorp Ltd"
    },
    {
      id: "u2",
      name: "Maria Santos",
      email: "maria@startupxyz.com",
      passwordHash: generatePasswordHash("secure456"),
      role: "admin",
      companyId: "startupxyz",
      companyName: "StartupXYZ"
    },
    {
      id: "u3",
      name: "Pedro Oliveira",
      email: "pedro@abccorp.com",
      passwordHash: generatePasswordHash("secure789"),
      role: "user",
      companyId: "abccorp",
      companyName: "ABC Corporation"
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [newUser, setNewUser] = useState<Partial<CompanyUser & { password: string }>>({});
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [passwordError, setPasswordError] = useState("");

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
      // Validate password
      const passwordValidation = validatePassword(newUser.password);
      if (!passwordValidation.isValid) {
        setPasswordError(passwordValidation.message);
        return;
      }

      // Check if email already exists
      if (users.some(user => user.email === newUser.email)) {
        setPasswordError("Este email já está em uso");
        return;
      }

      const selectedCompany = companies.find(c => c.id === newUser.companyId);
      setUsers(prev => [...prev, {
        id: `u${Date.now()}`,
        name: newUser.name!,
        email: newUser.email!,
        passwordHash: generatePasswordHash(newUser.password!),
        role: newUser.role || "user",
        companyId: newUser.companyId!,
        companyName: selectedCompany?.name || ""
      }]);
      setNewUser({});
      setPasswordError("");
      setIsDialogOpen(false);
    }
  };

  const handleEditUser = (user: CompanyUser) => {
    setEditingUser(user.id);
    setNewUser({
      ...user,
      password: "" // Don't prefill password for security
    });
    setPasswordError("");
    setIsDialogOpen(true);
  };

  const handleUpdateUser = () => {
    if (editingUser && newUser.name && newUser.email) {
      // If password is provided, validate it
      if (newUser.password) {
        const passwordValidation = validatePassword(newUser.password);
        if (!passwordValidation.isValid) {
          setPasswordError(passwordValidation.message);
          return;
        }
      }

      // Check if email is already used by another user
      if (users.some(user => user.email === newUser.email && user.id !== editingUser)) {
        setPasswordError("Este email já está em uso por outro usuário");
        return;
      }

      const selectedCompany = companies.find(c => c.id === newUser.companyId);
      setUsers(prev => prev.map(user => 
        user.id === editingUser 
          ? { 
              ...user, 
              ...newUser,
              passwordHash: newUser.password ? generatePasswordHash(newUser.password) : user.passwordHash,
              companyName: selectedCompany?.name || user.companyName
            }
          : user
      ));
      setNewUser({});
      setEditingUser(null);
      setPasswordError("");
      setIsDialogOpen(false);
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm("Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.")) {
      setUsers(prev => prev.filter(user => user.id !== userId));
    }
  };

  const togglePasswordVisibility = (userId: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
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
            <Button onClick={() => { setNewUser({}); setEditingUser(null); setPasswordError(""); }}>
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
                <label className="text-sm font-medium">Nome *</label>
                <Input
                  value={newUser.name || ""}
                  onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nome completo"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email *</label>
                <Input
                  type="email"
                  value={newUser.email || ""}
                  onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="email@empresa.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  {editingUser ? 'Nova Senha (deixe em branco para manter atual)' : 'Senha *'}
                </label>
                <Input
                  type="password"
                  value={newUser.password || ""}
                  onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                  placeholder={editingUser ? "Nova senha (opcional)" : "Senha de acesso"}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Mínimo 6 caracteres, deve conter letras e números
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Empresa *</label>
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
              
              {passwordError && (
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                  {passwordError}
                </div>
              )}
              
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
                <span className="text-xs text-muted-foreground">
                  Senha protegida
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
