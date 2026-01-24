import { Link } from "react-router-dom";
import {
  Shield,
  MessageCircle,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  LifeBuoy,
  Clock3,
  Inbox,
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
  { label: "Open conversations", value: "12", tone: "text-blue-700", bg: "bg-blue-50", icon: Inbox },
  { label: "Waiting longest", value: "18m", tone: "text-amber-700", bg: "bg-amber-50", icon: Clock3 },
  { label: "Escalations today", value: "2", tone: "text-rose-700", bg: "bg-rose-50", icon: AlertTriangle },
];

export default function SupportDashboard() {
  const user = useAppSelector((s) => s.auth.user);
  const firstName = user?.firstName || "there";

  return (
    <div className="space-y-6 px-3 pb-8 sm:px-6">
      <TitleBreadCrumbs title="Support Console" breadCrumbTitle="Admin / Support" className="w-full" />

      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <Card className="overflow-hidden border border-slate-200 bg-slate-50/80 shadow-sm">
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-3">
              <Badge className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-blue-800 hover:bg-blue-100">
                <Shield className="h-4 w-4" />
                Support Admin
              </Badge>
              <div className="space-y-1">
                <CardTitle className="text-2xl font-semibold text-slate-900">
                  Welcome back, {firstName}
                </CardTitle>
                <CardDescription className="max-w-2xl text-base text-slate-700">
                  Keep the queue calm and responsive. Prioritize open tickets, assign quickly, and keep vendors informed.
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button asChild size="lg" className="gap-2 px-5 text-base">
                  <Link to="/admin/chat">Open Inbox</Link>
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="lg" className="gap-2 text-slate-700 hover:bg-white">
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
                        Keep responses concise, confirm user context, and tag conversations that require escalation to Admin.
                      </p>
                      <ul className="list-disc space-y-1 pl-4">
                        <li>Respond within 5 minutes when online.</li>
                        <li>Use the chat to capture next steps and expected timelines.</li>
                        <li>Escalate billing or compliance questions immediately.</li>
                      </ul>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            <div className="hidden rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm sm:flex">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <MessageCircle className="h-5 w-5 text-blue-600" />
                  Support at a glance
                </div>
                <p className="text-xs text-slate-600">
                  Watch conversations, assignments, and SLAs from one place.
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          {statCards.map((stat) => (
            <Card key={stat.label} className="rounded-2xl border border-slate-200 shadow-sm">
              <CardHeader className="flex flex-row items-start gap-3 pb-4">
                <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.tone}`} />
                </span>
                <div className="space-y-1">
                  <CardDescription className="text-xs uppercase tracking-[0.14em] text-slate-500">
                    {stat.label}
                  </CardDescription>
                  <CardTitle className="text-2xl font-semibold text-slate-900">{stat.value}</CardTitle>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="rounded-2xl border border-slate-200 shadow-sm">
            <CardHeader className="space-y-2 pb-4">
              <CardDescription className="text-xs uppercase tracking-[0.16em] text-slate-500">
                Actions
              </CardDescription>
              <CardTitle className="text-lg text-slate-900">Work quickly</CardTitle>
              <CardDescription className="text-sm text-slate-600">
                Triage the queue, keep context, and move conversations forward.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button asChild className="gap-2 px-4">
                <Link to="/admin/chat">Open Inbox</Link>
              </Button>
              <Button variant="outline" className="gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                Review macros
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-slate-200 shadow-sm">
            <CardHeader className="space-y-2 pb-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                <Sparkles className="h-4 w-4 text-amber-500" />
                Scope of Access
              </div>
              <CardTitle className="text-lg text-slate-900">What you can do</CardTitle>
              <CardDescription className="text-sm text-slate-600">
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
