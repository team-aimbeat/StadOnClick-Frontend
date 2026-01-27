export type Message = {
  id: string;
  fromUserId: number;
  toUserId: number;
  text: string;
  time?: string;
  createdAt?: string;
};

export type Contact = {
  userId: number;
  name: string;
  path: string;
  time: string;
  preview: string;
  messages: Message[];
  active: boolean;
  unreadCount?: number;
  role?: string;
  lastSeen?: string;
  status?: "active" | "away" | "offline";
};

export type AgentUser = {
  id: number;
  name: string;
  path: string;
  designation: string;
};
