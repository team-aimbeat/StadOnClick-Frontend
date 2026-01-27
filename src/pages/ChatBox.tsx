import AdminSupportChatConsole from "./Admin/SupportChat/AdminSupportChatConsole";

// Route alias: keep /admin/chat pointing to the new ticket-scoped support console
export default function ChatBox() {
  return <AdminSupportChatConsole />;
}
