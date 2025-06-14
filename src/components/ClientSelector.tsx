
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Check, X } from "lucide-react";
import { useClients, type Client } from "@/hooks/useClients";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface ClientSelectorProps {
  value?: string;
  onValueChange: (clientId: string) => void;
  placeholder?: string;
}

const ClientSelector = ({ value, onValueChange, placeholder = "Selecionar cliente..." }: ClientSelectorProps) => {
  const { clients, addClient, isLoading } = useClients();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newClientData, setNewClientData] = useState<Partial<Client>>({
    status: "prospect"
  });

  const handleCreateClient = async () => {
    // Debug logs para entender o problema
    console.log('Debug - handleCreateClient chamado');
    console.log('Debug - user object:', user);
    console.log('Debug - user.id:', user?.id);
    console.log('Debug - newClientData:', newClientData);

    if (!newClientData.name || !newClientData.company || !newClientData.email) {
      toast({
        title: "Erro",
        description: "Por favor, preencha pelo menos o nome, empresa e email.",
        variant: "destructive"
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newClientData.email)) {
      toast({
        title: "Erro",
        description: "Por favor, insira um email válido.",
        variant: "destructive"
      });
      return;
    }

    if (!user?.id) {
      console.log('Debug - Erro: user.id não encontrado');
      console.log('Debug - user completo:', JSON.stringify(user, null, 2));
      toast({
        title: "Erro de Autenticação",
        description: "Você precisa estar logado para criar clientes. Por favor, faça login primeiro.",
        variant: "destructive"
      });
      return;
    }

    try {
      const clientToAdd = {
        name: newClientData.name || "",
        company: newClientData.company || "",
        email: newClientData.email || "",
        phone: newClientData.phone || "",
        status: (newClientData.status as "prospect" | "qualified" | "client" | "inactive") || "prospect",
        user_id: user.id
      };

      console.log('Creating client with data:', clientToAdd);

      const result = await addClient(clientToAdd);
      
      if (result) {
        console.log('Cliente criado com sucesso:', result);
        onValueChange(result.id);
        setNewClientData({ status: "prospect" });
        setIsCreateDialogOpen(false);
        toast({
          title: "Sucesso",
          description: "Cliente criado com sucesso!"
        });
      } else {
        toast({
          title: "Erro",
          description: "Erro ao criar cliente. Tente novamente.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error in handleCreateClient:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar cliente. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const selectedClient = clients.find(client => client.id === value);

  return (
    <div className="flex gap-2">
      <Select value={value} onValueChange={onValueChange} disabled={isLoading}>
        <SelectTrigger className="flex-1">
          <SelectValue placeholder={isLoading ? "Carregando..." : (clients.length === 0 ? "Nenhum cliente encontrado" : placeholder)}>
            {selectedClient ? `${selectedClient.name} - ${selectedClient.company}` : (isLoading ? "Carregando..." : (clients.length === 0 ? "Nenhum cliente encontrado" : placeholder))}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {clients.map((client) => (
            <SelectItem key={client.id} value={client.id}>
              {client.name} - {client.company}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon" disabled={isLoading}>
            <Plus className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Cliente</DialogTitle>
            <DialogDescription>
              Preencha as informações do novo cliente
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={newClientData.name || ""}
                onChange={(e) => setNewClientData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nome do cliente"
              />
            </div>
            
            <div>
              <Label htmlFor="company">Empresa *</Label>
              <Input
                id="company"
                value={newClientData.company || ""}
                onChange={(e) => setNewClientData(prev => ({ ...prev, company: e.target.value }))}
                placeholder="Nome da empresa"
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={newClientData.email || ""}
                onChange={(e) => setNewClientData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="email@empresa.com"
              />
            </div>
            
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={newClientData.phone || ""}
                onChange={(e) => setNewClientData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="(11) 99999-9999"
              />
            </div>
            
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={newClientData.status || "prospect"}
                onValueChange={(value: "prospect" | "qualified" | "client" | "inactive") => 
                  setNewClientData(prev => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="prospect">Prospect</SelectItem>
                  <SelectItem value="qualified">Qualificado</SelectItem>
                  <SelectItem value="client">Cliente</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>
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
  );
};

export default ClientSelector;
