import * as React from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";

const shippingStates = [
  "Stockholm",
  "Västra Götaland",
  "Skåne",
  "Uppsala",
  "Östergötland",
  "Västmanland",
  "Norrbotten",
];

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AddShippingAddressDialog({ open, onOpenChange }: Props) {
  const [state, setState] = React.useState("");

  return (
    <Dialog open={open}  onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>New shipping address</DialogTitle>
            <DialogClose aria-label="Close">
              <X className="h-4 w-4" />
            </DialogClose>
          </div>
          <DialogDescription>
            Enter the details for this Swedish address.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Label>First and Last Name</Label>
            <Input className="h-12" />
          </div>

          <div className="space-y-1">
            <Label>Address</Label>
            <Input className="h-12" />
          </div>

          <div className="space-y-1">
            <Label>Apartment, Suite (Optional)</Label>
            <Input className="h-12" />
          </div>

          <div className="space-y-1">
            <Label>City</Label>
            <Input className="h-12" />
          </div>

          <div className="space-y-1">
            <Label>Zip code</Label>
            <Input className="h-12" />
          </div>

          <div className="space-y-1">
            <Label>State / County</Label>
            <Select value={state} onValueChange={setState}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Sweden</SelectLabel>
                  <SelectSeparator />
                  {shippingStates.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button>Add shipping address</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
