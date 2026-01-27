import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { EscalationCategory, EscalationSeverity } from "@/features/escalations/escalation.types";

type EscalationFormValues = {
  category: EscalationCategory;
  severity: EscalationSeverity;
  reason: string;
  description: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: EscalationFormValues) => void;
  isSubmitting?: boolean;
};

const categoryOptions: EscalationCategory[] = [
  "REFUND",
  "BOOKING",
  "KYC",
  "SUSPENSION",
  "PAYMENT",
  "PAYOUT",
  "SECURITY",
  "OTHER",
];

const severityOptions: EscalationSeverity[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

const emptyValues: EscalationFormValues = {
  category: "REFUND",
  severity: "MEDIUM",
  reason: "",
  description: "",
};

export default function EscalationDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: Props) {
  const [values, setValues] = useState<EscalationFormValues>(emptyValues);

  useEffect(() => {
    if (open) {
      setValues(emptyValues);
    }
  }, [open]);

  const isValid = useMemo(() => {
    return values.reason.trim().length > 3 && values.description.trim().length > 10;
  }, [values.description, values.reason]);

  const handleSubmit = () => {
    if (!isValid) return;
    onSubmit({
      ...values,
      reason: values.reason.trim(),
      description: values.description.trim(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Escalate ticket</DialogTitle>
          <DialogDescription>
            Share context for the moderator team. Vendors will never see these notes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={values.category}
                onValueChange={(value) =>
                  setValues((prev) => ({ ...prev, category: value as EscalationCategory }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Severity</Label>
              <Select
                value={values.severity}
                onValueChange={(value) =>
                  setValues((prev) => ({ ...prev, severity: value as EscalationSeverity }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  {severityOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Reason</Label>
            <Input
              placeholder="Short reason (e.g. refund approval request)"
              value={values.reason}
              onChange={(event) =>
                setValues((prev) => ({ ...prev, reason: event.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              rows={5}
              placeholder="Add detailed context, references, or links."
              value={values.description}
              onChange={(event) =>
                setValues((prev) => ({ ...prev, description: event.target.value }))
              }
            />
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || isSubmitting}>
            {isSubmitting ? "Escalating..." : "Create escalation"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
