import { Link } from "react-router-dom";
import {
  Shield,
  MessageCircle,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  LifeBuoy,
} from "lucide-react";
import { useAppSelector } from "@/app/hooks";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

const statCards = [
  { label: "Open conversations", value: "12", tone: "text-blue-700 bg-blue-50" },
  { label: "Waiting longest", value: "18m", tone: "text-amber-700 bg-amber-50" },
  { label: "Escalations today", value: "2", tone: "text-rose-700 bg-rose-50" },
];

export default function SupportDashboard() {
  const user = useAppSelector((s) => s.auth.user);
  const firstName = user?.firstName || "there";

  return (
    <div className="space-y-6 px-2 sm:px-4">
      <div className="w-full">
        <TitleBreadCrumbs
          title="Support Console"
          breadCrumbTitle="Admin / Support"
          className="w-full"
        />
      </div>

      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <Card className="overflow-hidden border-blue-100 bg-gradient-to-r from-sky-50 via-white to-indigo-50 shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div className="space-y-2">
              <Badge className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-blue-800 hover:bg-blue-100">
                <Shield className="h-4 w-4" />
                Support Admin
              </Badge>
              <CardTitle className="text-2xl font-semibold text-slate-900">
                Hey {firstName}!
              </CardTitle>
              <CardDescription className="max-w-2xl text-base text-slate-700">
                Monitor conversations, handle escalations, and maintain response SLAs. Your view is
                streamlined for support operations.
              </CardDescription>
            </div>
            <div className="hidden rounded-full bg-white/80 p-3 shadow-sm sm:flex">
              <MessageCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="gap-2 bg-[#0b59a2] hover:bg-[#094477]">
              <Link to="/admin/chat">Open Inbox</Link>
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="lg" className="gap-2">
                  <LifeBuoy className="h-4 w-4" />
                  Support Guidelines
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Support Guidelines</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 text-sm text-slate-600">
                  <p>
                    Keep responses concise, confirm user context, and tag conversations that require
                    escalation to Admin.
                  </p>
                  <ul className="list-disc space-y-1 pl-4">
                    <li>Respond within 5 minutes when online.</li>
                    <li>Use the chat to capture next steps and expected timelines.</li>
                    <li>Escalate billing or compliance questions immediately.</li>
                  </ul>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          {statCards.map((stat) => (
            <Card key={stat.label} className="shadow-sm">
              <CardHeader className="pb-3">
                <CardDescription className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  {stat.label}
                </CardDescription>
                <CardTitle className={`text-2xl font-semibold ${stat.tone}`}>{stat.value}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="shadow-sm">
            <CardHeader>
              <CardDescription className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Actions
              </CardDescription>
              <CardTitle className="text-lg">Work quickly</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button asChild className="gap-2 bg-[#0b59a2] hover:bg-[#094477]">
                <Link to="/admin/chat">Open Inbox</Link>
              </Button>
              <Button variant="outline" className="gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                Review macros
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                <Sparkles className="h-4 w-4 text-amber-500" />
                Scope of Access
              </div>
              <CardTitle className="text-lg">What you can do</CardTitle>
              <CardDescription>
                Restricted access keeps the console focused on chat operations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm text-slate-700">
                {[
                  "Access chat inbox and reply to conversations",
                  "View this support dashboard",
                  "Escalate complex issues to Admin/Moderator",
                  "No vendor, staff, or lead management access",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                <AlertTriangle className="mt-0.5 h-4 w-4" />
                <div>
                  <p className="font-semibold">Restricted Access</p>
                  <p>Only Admin/Moderators can manage staff, leads, or vendors.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
