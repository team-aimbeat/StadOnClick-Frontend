import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CalendarClock, Phone, ShieldAlert, UserRound } from "lucide-react";
import { Contact } from "../types";

type ChatDetailsPanelProps = {
  contact: Contact | null;
};

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between text-xs text-slate-500">
    <span>{label}</span>
    <span className="font-semibold text-slate-800">{value}</span>
  </div>
);

export function ChatDetailsPanel({ contact }: ChatDetailsPanelProps) {
  return (
    <aside className="hidden w-full max-w-xs flex-none border-l border-slate-200 bg-white xl:block">
      <Card className="h-full rounded-none border-0 shadow-none">
        <CardHeader>
          <CardTitle className="text-sm text-slate-700">Conversation Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {contact ? (
            <>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={contact.path}
                    alt={contact.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${
                      contact.status === "offline" ? "bg-slate-300" : "bg-emerald-400"
                    }`}
                  />
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold text-slate-900">{contact.name}</p>
                  <p className="text-xs text-slate-500">{contact.lastSeen ?? contact.time}</p>
                  <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
                    {contact.role ?? "User"}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <DetailRow label="Created" value="Today" />
                <DetailRow label="Last message" value={contact.time} />
                <DetailRow
                  label="Status"
                  value={contact.status ? contact.status.toUpperCase() : "ACTIVE"}
                />
              </div>

              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <ShieldAlert className="h-4 w-4 text-rose-500" />
                  Escalate to Admin
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <UserRound className="h-4 w-4 text-slate-500" />
                  View profile
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <Phone className="h-4 w-4 text-slate-500" />
                  Call back
                </Button>
              </div>

              <Separator />

              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
                <CalendarClock className="h-4 w-4 text-amber-500" />
                Respond within 5 minutes when online. Escalate billing/compliance quickly.
              </div>
            </>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
              Select a conversation to see participant details and quick actions.
            </div>
          )}
        </CardContent>
      </Card>
    </aside>
  );
}

export default ChatDetailsPanel;
