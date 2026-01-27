import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import { setPageTitle } from "@/features/Layout/themeConfigSlice";
import { RootState } from "@/app/store";
import { agentUser, contactsMock } from "./mockData";
import { Contact, Message } from "./types";
import ChatSidebar from "./components/ChatSidebar";
import ChatConversation from "./components/ChatConversation";
import ChatComposer from "./components/ChatComposer";
import ChatDetailsPanel from "./components/ChatDetailsPanel";
import { Separator } from "@/components/ui/separator";

const ChatBox = () => {
  const dispatch = useDispatch();
  const isRtl =
    useSelector((state: RootState) => state.themeConfig.rtlClass) === "rtl";
  const [contacts, setContacts] = useState<Contact[]>(contactsMock);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "unread">("all");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [composerValue, setComposerValue] = useState("");
  const [isShowChatMenu, setIsShowChatMenu] = useState(false);

  useEffect(() => {
    dispatch(setPageTitle("Admin Chatbox"));
  }, [dispatch]);

  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) => {
      const term = searchTerm.toLowerCase();
      const matches =
        contact.name.toLowerCase().includes(term) ||
        contact.preview.toLowerCase().includes(term);

      const filterMatch =
        filter === "all"
          ? true
          : filter === "active"
            ? contact.status === "active"
            : (contact.unreadCount ?? 0) > 0;

      return matches && filterMatch;
    });
  }, [contacts, searchTerm, filter]);

  const selectedContact = useMemo(
    () => contacts.find((c) => c.userId === selectedId) ?? null,
    [contacts, selectedId]
  );

  const handleSelect = (contact: Contact) => {
    setSelectedId(contact.userId);
    setIsShowChatMenu(false);
  };

  const handleSend = () => {
    const text = composerValue.trim();
    if (!text || !selectedContact) return;

    const now = new Date();
    const newMessage: Message = {
      id: `${now.getTime()}`,
      fromUserId: agentUser.id,
      toUserId: selectedContact.userId,
      text,
      time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      createdAt: "Today",
    };

    setContacts((prev) =>
      prev.map((contact) =>
        contact.userId === selectedContact.userId
          ? {
              ...contact,
              messages: [...contact.messages, newMessage],
              preview: text,
              time: newMessage.time ?? contact.time,
              unreadCount: 0,
            }
          : contact
      )
    );

    setComposerValue("");

    setTimeout(() => {
      const element = document.querySelector(".chat-conversation-box") as HTMLElement | null;
      if (element) {
        element.scrollTop = element.scrollHeight;
      }
    }, 40);
  };

  const toggleMenu = () => setIsShowChatMenu((prev) => !prev);

  return (
    <div className="space-y-4 px-2 sm:px-4">
      <div className="w-full">
        <TitleBreadCrumbs
          title="Admin Chatbox"
          breadCrumbTitle="Admin / Chat"
          className="w-full"
        />
      </div>

      <div className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div
            className={`bg-black/40 absolute inset-0 z-10 ${isShowChatMenu ? "block xl:hidden" : "hidden"}`}
            onClick={toggleMenu}
          />

          <div className="flex flex-col xl:flex-row">
            <ChatSidebar
              contacts={filteredContacts}
              selectedId={selectedId}
              onSelect={handleSelect}
              searchTerm={searchTerm}
              onSearch={setSearchTerm}
              filter={filter}
              onFilterChange={setFilter}
              isShowChatMenu={isShowChatMenu}
              toggleMenu={toggleMenu}
            />

            <Separator orientation="vertical" className="hidden xl:block h-auto" />

            <div className="flex flex-1 flex-col">
              <ChatConversation
                contact={selectedContact}
                agent={agentUser}
                isRtl={isRtl}
                onToggleMenu={toggleMenu}
              />
              <ChatComposer
                value={composerValue}
                onChange={setComposerValue}
                onSend={handleSend}
                disabled={!selectedContact}
              />
            </div>

            <ChatDetailsPanel contact={selectedContact} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
