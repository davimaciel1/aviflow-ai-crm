
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Mail, Check, X, Users, UserPlus } from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
}

interface Invitation {
  id: string;
  email: string;
  token: string;
  expires_at: string;
  used: boolean;
  created_at: string;
}

const UserManagement = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [newInviteEmail, setNewInviteEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (user?.role === 'admin') {
      loadUsers();
      loadInvitations();
    }
  }, [user]);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadInvitations = async () => {
    try {
      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvitations(data || []);
    } catch (error) {
      console.error('Error loading invitations:', error);
    }
  };

  const sendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (!newInviteEmail) {
        setError("Por favor, insira um email");
        return;
      }

      // Generate a random token
      const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
      
      // Set expiration to 7 days from now
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const { error } = await supabase
        .from('invitations')
        .insert({
          email: newInviteEmail.toLowerCase().trim(),
          invited_by: user!.id,
          token: token,
          expires_at: expiresAt.toISOString()
        });

      if (error) throw error;

      setSuccess(`Convite enviado para ${newInviteEmail}. Token: ${token}`);
      setNewInviteEmail("");
      loadInvitations();
    } catch (error: any) {
      setError(error.message || "Erro ao enviar convite");
    } finally {
      setLoading(false);
    }
  };

  const approveUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'approved' })
        .eq('id', userId);

      if (error) throw error;
      
      setSuccess("Usuário aprovado com sucesso!");
      loadUsers();
    } catch (error: any) {
      setError(error.message || "Erro ao aprovar usuário");
    }
  };

  const rejectUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'rejected' })
        .eq('id', userId);

      if (error) throw error;
      
      setSuccess("Usuário rejeitado");
      loadUsers();
    } catch (error: any) {
      setError(error.message || "Erro ao rejeitar usuário");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Aprovado</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejeitado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (user?.role !== 'admin') {
    return (
      <Alert>
        <AlertDescription>
          Acesso negado. Apenas administradores podem gerenciar usuários.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Usuários
          </TabsTrigger>
          <TabsTrigger value="invites" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Convites
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Usuários</CardTitle>
              <CardDescription>
                Aprove ou rejeite solicitações de acesso
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((userProfile) => (
                  <div key={userProfile.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div>
                          <h3 className="font-medium">{userProfile.name}</h3>
                          <p className="text-sm text-gray-500">{userProfile.email}</p>
                        </div>
                        {getStatusBadge(userProfile.status)}
                        <Badge variant="outline">{userProfile.role}</Badge>
                      </div>
                    </div>
                    
                    {userProfile.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => approveUser(userProfile.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Aprovar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => rejectUser(userProfile.id)}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Rejeitar
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invites">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Enviar Convite</CardTitle>
                <CardDescription>
                  Convide novos usuários para o sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={sendInvitation} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="invite-email">Email do convidado</Label>
                    <Input
                      id="invite-email"
                      type="email"
                      value={newInviteEmail}
                      onChange={(e) => setNewInviteEmail(e.target.value)}
                      placeholder="usuario@example.com"
                      required
                    />
                  </div>
                  <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Mail className="mr-2 h-4 w-4" />
                    Enviar Convite
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Convites Enviados</CardTitle>
                <CardDescription>
                  Histórico de convites
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {invitations.map((invitation) => (
                    <div key={invitation.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{invitation.email}</p>
                        <p className="text-sm text-gray-500">
                          Token: <code className="bg-gray-100 px-1 rounded">{invitation.token}</code>
                        </p>
                        <p className="text-xs text-gray-400">
                          Expira em: {new Date(invitation.expires_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <Badge variant={invitation.used ? "default" : "secondary"}>
                        {invitation.used ? "Usado" : "Pendente"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserManagement;
