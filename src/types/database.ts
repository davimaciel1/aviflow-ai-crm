
// Database types that match Supabase schema
export interface DatabaseClient {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  status: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseDeal {
  id: string;
  title: string;
  description: string | null;
  client_id: string | null;
  contact: string | null;
  value: number | null;
  priority: string;
  stage_id: string;
  confidential: string | null;
  position: number;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseNote {
  id: string;
  text: string;
  deal_id: string;
  author_id: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseStage {
  id: string;
  title: string;
  pipeline_id: string;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface DatabasePipeline {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
}

// Frontend types
export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone?: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'prospect';
}

export interface Deal {
  id: string;
  title: string;
  description?: string;
  client?: Client;
  contact?: string;
  value?: number;
  priority: 'low' | 'medium' | 'high';
  confidential?: string;
  position: number;
  notes: Note[];
}

export interface Note {
  id: string;
  text: string;
  dealId: string;
  authorId: string;
  createdAt: string;
}

export interface Stage {
  id: string;
  title: string;
  deals: Deal[];
  pipeline_id: string;
  position: number;
}

export interface Pipeline {
  id: string;
  name: string;
  stages: Stage[];
  user_id: string;
}

// Type guards and converters
export const isValidStatus = (status: string): status is 'active' | 'inactive' | 'prospect' => {
  return ['active', 'inactive', 'prospect'].includes(status);
};

export const isValidPriority = (priority: string): priority is 'low' | 'medium' | 'high' => {
  return ['low', 'medium', 'high'].includes(priority);
};

export const isValidRole = (role: string): role is 'admin' | 'client' => {
  return ['admin', 'client'].includes(role);
};

export const convertDatabaseClientToClient = (dbClient: DatabaseClient): Client => ({
  id: dbClient.id,
  name: dbClient.name,
  company: dbClient.company,
  email: dbClient.email,
  phone: dbClient.phone || undefined,
  avatar: dbClient.avatar || undefined,
  status: isValidStatus(dbClient.status) ? dbClient.status : 'prospect',
});

export const convertDatabaseDealToDeal = (dbDeal: DatabaseDeal & { notes?: DatabaseNote[], client?: DatabaseClient }): Deal => ({
  id: dbDeal.id,
  title: dbDeal.title,
  description: dbDeal.description || undefined,
  client: dbDeal.client ? convertDatabaseClientToClient(dbDeal.client) : undefined,
  contact: dbDeal.contact || undefined,
  value: dbDeal.value || undefined,
  priority: isValidPriority(dbDeal.priority) ? dbDeal.priority : 'low',
  confidential: dbDeal.confidential || undefined,
  position: dbDeal.position,
  notes: (dbDeal.notes || []).map(note => ({
    id: note.id,
    text: note.text,
    dealId: note.deal_id,
    authorId: note.author_id,
    createdAt: note.created_at,
  })),
});
