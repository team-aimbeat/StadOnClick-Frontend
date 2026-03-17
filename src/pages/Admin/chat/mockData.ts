import profile7 from "@/assets/Images/profile-7.jpeg";
import profile8 from "@/assets/Images/profile-8.jpeg";
import profile9 from "@/assets/Images/profile-9.jpeg";
import profile1 from "@/assets/Images/profile-8.jpeg";
import type { AgentUser, Contact } from "./types";

let messageId = 0;
const message = (fromUserId: number, toUserId: number, text: string) => ({
  id: `msg-${++messageId}`,
  fromUserId,
  toUserId,
  text,
});

export const agentUser: AgentUser = {
  id: 0,
  name: "Alon Smith",
  path: profile7,
  designation: "Support Admin",
};

export const contactsMock: Contact[] = [
  {
    userId: 1,
    name: "Nia Hillyer",
    path: profile7,
    time: "2:09 PM",
    preview: "How do you do?",
    lastSeen: "Active now",
    role: "Vendor",
    status: "active",
    unreadCount: 2,
    messages: [
      message(1, 0, "Hi, I am back from vacation"),
      message(0, 1, "How are you?"),
      message(1, 0, "Welcome back!"),
      message(1, 0, "I am all well"),
      message(0, 1, "Coffee?"),
    ],
    active: true,
  },
  {
    userId: 2,
    name: "Sean Freeman",
    path: profile8,
    time: "12:09 PM",
    preview: "I was wondering...",
    lastSeen: "Last seen 10m ago",
    role: "Vendor",
    status: "away",
    unreadCount: 0,
    messages: [
      message(0, 2, "Hello"),
      message(0, 2, "It's me"),
      message(0, 2, "I have a question regarding project."),
    ],
    active: false,
  },
  {
    userId: 3,
    name: "Alma Clarke",
    path: profile9,
    time: "1:44 PM",
    preview: "I've forgotten how it felt before",
    lastSeen: "Active 5m ago",
    role: "Admin",
    status: "active",
    unreadCount: 1,
    messages: [
      message(0, 3, "Hey Buddy."),
      message(0, 3, "What's up"),
      message(3, 0, "I am sick"),
      message(0, 3, "Not coming to office today."),
    ],
    active: true,
  },
  {
    userId: 4,
    name: "Alan Green",
    path: profile1,
    time: "2:06 PM",
    preview: "Need approval on the refund",
    lastSeen: "Last seen 30m ago",
    role: "Vendor",
    status: "offline",
    unreadCount: 0,
    messages: [
      message(0, 4, "Hi, collect your check"),
      message(4, 0, "Ok, I will be there in 10 mins"),
    ],
    active: true,
  },
  {
    userId: 5,
    name: "Shaun Park",
    path: profile9,
    time: "2:05 PM",
    preview: "It's not that bad...",
    lastSeen: "Active 1h ago",
    role: "Vendor",
    status: "away",
    unreadCount: 3,
    messages: [
      message(0, 3, "Hi, I am back from vacation"),
      message(0, 3, "How are you?"),
      message(0, 5, "Welcome Back"),
      message(0, 5, "I am all well"),
      message(5, 0, "Coffee?"),
    ],
    active: false,
  },
  {
    userId: 6,
    name: "Roxanne",
    path: profile7,
    time: "2:00 PM",
    preview: "Uploaded files to server.",
    lastSeen: "Offline",
    role: "Vendor",
    status: "offline",
    unreadCount: 0,
    messages: [
      message(0, 6, "Hi"),
      message(0, 6, "Uploaded files to server."),
    ],
    active: false,
  },
];
