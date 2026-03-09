import { useEffect, useMemo, useState } from "react"
import { X } from "lucide-react"
import { useAppSelector } from "@/app/hooks"
import { useSubmitLeadMutation } from "@/services/leadsApi"
import { Service } from "../types"
import toast from "react-hot-toast"

type EnquiryModalProps = {
  service: Service
  onClose: () => void
}

const buildInitialName = (
  user?: { firstName?: string | null; lastName?: string | null } | null,
) => {
  const parts = [user?.firstName?.trim(), user?.lastName?.trim()].filter(Boolean)
  return parts.join(" ") || ""
}

export default function EnquiryModal({ service, onClose }: EnquiryModalProps) {
  const authUser = useAppSelector((state) => state.auth.user)
  const [name, setName] = useState(buildInitialName(authUser))
  const [email, setEmail] = useState(authUser?.email ?? "")
  const [phone, setPhone] = useState("")
  const [message, setMessage] = useState("")

  useEffect(() => {
    setName(buildInitialName(authUser))
    if (authUser?.email) {
      setEmail(authUser.email)
    }
  }, [authUser])

  const [submitLead, { isLoading }] = useSubmitLeadMutation()

  const isDisabled = useMemo(
    () => !name.trim() || !email.trim() || message.trim().length < 2 || !service.categoryId,
    [name, email, message, service.categoryId],
  )
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-2xl font-bold text-slate-900">Send enquiry</h3>
            <p className="text-sm text-slate-500">
              Get details, availability, and a quick response
            </p>
          </div>
          <button
            type="button"
            className="rounded-full bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="h-15 w-15 overflow-hidden rounded-2xl">
            <img
              src={service.image}
              alt={service.title}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-base font-semibold text-slate-900">
              {service.title}
            </p>
            <p className="text-sm text-slate-500">
              {service.location} · From {service.details[0].price}
            </p>
          </div>
        </div>

        <form
          className="mt-5 space-y-4"
          onSubmit={async (event) => {
            event.preventDefault()
            if (isDisabled) return
            try {
              await submitLead({
                categoryId: service.categoryId,
                name: name.trim(),
                email: email.trim(),
                phone: phone.trim() || undefined,
                message: message.trim(),
                source: `service:${service.id}`,
              }).unwrap()
              toast.success("Enquiry submitted. We'll be in touch shortly.")
              onClose()
            } catch (error: any) {
              toast.error(
                error?.data?.message ||
                  error?.message ||
                  "We couldn't submit the enquiry right now.",
              )
            }
          }}
        >
          <div>
            <label className="text-[13px] font-semibold text-slate-600">
              Your details
            </label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              type="text"
              placeholder="Full name"
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm transition focus:border-blue-400 focus:outline-none"
            />
          </div>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            placeholder="Email"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm transition focus:border-blue-400 focus:outline-none"
          />
          <input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            type="tel"
            placeholder="Phone number"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm transition focus:border-blue-400 focus:outline-none"
          />
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Tell us what you’re looking for (optional)"
            rows={3}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm transition focus:border-blue-400 focus:outline-none"
          />

          <div className="flex items-center gap-4 text-sm text-slate-600">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-emerald-600">
              <span className="h-2 w-2 rounded-full bg-emerald-600" />
              Verified provider
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 text-slate-600">
              <span className="h-2 w-2 rounded-full bg-slate-600" />
              No payment required
            </span>
          </div>

          <button
            type="submit"
            disabled={isDisabled || isLoading}
            className="w-full rounded-2xl bg-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Sending..." : "Send enquiry"}
          </button>
        </form>
      </div>
    </div>
  )
}
