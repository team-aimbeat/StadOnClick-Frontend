import AdminSupportChatbox from "./Admin/AdminSupportChatbox";

// Route alias: keep /admin/chat pointing to the new ticket-scoped support chatbox
export default function ChatBox() {
  return <AdminSupportChatbox />;
}
