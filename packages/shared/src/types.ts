// ===========================================
// PureSkin Store — Shared Types
// ===========================================

// --- User ---
export interface ApiUser {
  id: string;
  discordId: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  role: 'OWNER' | 'STAFF' | 'USER';
  canRestock: boolean;
  lastLogin: string | null;
  createdAt: string;
}

// --- Account/Stock ---
export type AccountStatus = 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'UNAVAILABLE';

export interface ApiAccount {
  id: string;
  name: string;
  skinRange: string | null;
  price: number;
  platform: string;
  description: string | null;
  status: AccountStatus;
  createdAt: string;
  updatedAt: string;
  ticketId: string | null;
}

export interface CreateAccountPayload {
  name: string;
  skinRange?: string;
  price: number;
  platform?: string;
  description?: string;
  status?: AccountStatus;
  credentials?: string;
}

export interface UpdateAccountPayload extends Partial<CreateAccountPayload> {}

// --- Ticket ---
export type TicketCategory = 'BUY_ACCOUNT' | 'CONNECTION_ISSUE' | 'EXCHANGE';
export type TicketStatus = 'OPEN' | 'CLOSED' | 'DELETED';

export interface ApiTicket {
  id: string;
  ticketNumber: number;
  category: TicketCategory;
  status: TicketStatus;
  channelId: string | null;
  creatorId: string;
  assigneeId: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  creator?: ApiUser;
  assignee?: ApiUser | null;
}

export interface ApiTicketMessage {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  ticketId: string;
  createdAt: string;
}

// --- Restock ---
export interface ApiRestock {
  id: string;
  channelId: string;
  messageId: string | null;
  title: string;
  description: string | null;
  priceFrom: number;
  imageUrl: string | null;
  accountCount: number;
  creatorId: string;
  sentAt: string;
  createdAt: string;
  creator?: ApiUser;
}

export interface CreateRestockPayload {
  channelId: string;
  title?: string;
  description?: string;
  priceFrom: number;
  imageUrl?: string;
  accountIds: string[];
}

// --- Stats ---
export interface DashboardStats {
  totalAccounts: number;
  availableAccounts: number;
  soldAccounts: number;
  reservedAccounts: number;
  openTickets: number;
  closedTickets: number;
  totalRestocks: number;
  recentSales: { date: string; count: number }[];
  recentRestocks: { date: string; count: number }[];
}

// --- Log ---
export type LogAction =
  | 'TICKET_CREATED'
  | 'TICKET_CLOSED'
  | 'TICKET_DELETED'
  | 'ACCOUNT_ADDED'
  | 'ACCOUNT_MODIFIED'
  | 'ACCOUNT_DELETED'
  | 'ACCOUNT_SOLD'
  | 'RESTOCK_SENT'
  | 'PANEL_LOGIN'
  | 'PERMISSION_CHANGED'
  | 'SETTINGS_CHANGED';

export interface ApiLog {
  id: string;
  action: LogAction;
  details: string | null;
  ipAddress: string | null;
  userId: string | null;
  user?: ApiUser | null;
  createdAt: string;
}

// --- Discord ---
export interface DiscordChannel {
  id: string;
  name: string;
  type: number;
}

// --- API Response ---
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// --- Settings ---
export interface ApiSetting {
  id: string;
  key: string;
  value: string;
  description: string | null;
  updatedAt: string;
}

// --- WebSocket Events ---
export interface WsEvents {
  'stock:created': ApiAccount;
  'stock:updated': ApiAccount;
  'stock:deleted': { id: string };
  'ticket:created': ApiTicket;
  'ticket:closed': ApiTicket;
  'ticket:deleted': { id: string };
  'restock:sent': ApiRestock;
}
