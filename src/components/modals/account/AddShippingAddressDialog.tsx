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
import { Checkbox } from "@/components/ui/checkbox";
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
import { useForm } from "react-hook-form";
import type { ShippingAddressFormInput } from "@/features/account/api/accountApi";

const swedishCounties = [
  "Stockholm",
  "Vastra Gotaland",
  "Skane",
  "Uppsala",
  "Ostergotland",
  "Vastmanland",
  "Norrbotten",
  "Vasternorrland",
  "Jonkoping",
  "Halland",
];

const citiesByCounty: Record<string, string[]> = {
  Stockholm: ["Stockholm", "Haninge", "Solna", "Sundbyberg"],
  "Vastra Gotaland": ["Gothenburg", "Borås", "Alingsås", "Trollhättan"],
  Skane: ["Malmo", "Helsingborg", "Lund", "Ystad"],
  Uppsala: ["Uppsala", "Enköping", "Tierp"],
  Ostergotland: ["Linkoping", "Norrkoping", "Motala"],
  Vastmanland: ["Vasteras", "Köping", "Sala"],
  Norrbotten: ["Lulea", "Pitea", "Kiruna"],
  Vasternorrland: ["Sundsvall", "Härnösand"],
  Jonkoping: ["Jonkoping", "Värnamo"],
  Halland: ["Halmstad", "Varberg"],
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ShippingAddressFormInput) => Promise<void>;
  isLoading?: boolean;
};

const defaultValues: ShippingAddressFormInput = {
  name: "",
  phone: "",
  address1: "",
  address2: "",
  city: "",
  postalCode: "",
  county: "",
  country: "SE",
  isDefault: false,
};

export function AddShippingAddressDialog({ open, onOpenChange, onSubmit, isLoading }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ShippingAddressFormInput>({
    defaultValues,
  });

  const selectedCounty = watch("county");
  const selectedCity = watch("city");
  const availableCities = React.useMemo(
    () => (selectedCounty ? citiesByCounty[selectedCounty] ?? [] : []),
    [selectedCounty]
  );

  React.useEffect(() => {
    register("city", { required: "City is required" });
    register("county", {
      required: "County is required",
      minLength: { value: 2, message: "Select a valid county" },
    });
  }, [register]);

  const handleClose = () => {
    reset(defaultValues);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
    <DialogContent className="w-[min(93vw,920px)] max-w-[920px] space-y-6">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>New shipping address</DialogTitle>
            <DialogClose aria-label="Close">
              <X className="h-4 w-4" />
            </DialogClose>
          </div>
          <DialogDescription className="text-sm text-slate-500 leading-relaxed">
            Enter the recipient’s Swedish address so we can keep deliveries fast and reliable.
          </DialogDescription>
        </DialogHeader>

        <form
          id="shipping-form"
          className="mt-6 grid gap-6 sm:grid-cols-2"
          onSubmit={handleSubmit(async (values) => {
            await onSubmit(values);
            handleClose();
          })}
        >
          <div className="space-y-1">
            <Label>Recipient name</Label>
            <Input
              className="h-12"
              {...register("name", { required: "Recipient name is required" })}
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Street address</Label>
            <Input
              className="h-12"
              {...register("address1", { required: "Street address is required" })}
            />
            {errors.address1 && (
              <p className="text-xs text-red-500">{errors.address1.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Phone number</Label>
            <Input
              className="h-12"
              {...register("phone", {
                required: "Phone number is required",
                minLength: { value: 5, message: "Phone must be at least 5 characters" },
              })}
            />
            {errors.phone && (
              <p className="text-xs text-red-500">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Apartment, Suite (Optional)</Label>
            <Input className="h-12" {...register("address2")} />
          </div>

          <div className="space-y-1">
            <Label>State / County</Label>
            <Select
              value={selectedCounty ?? ""}
              onValueChange={(value) => {
                setValue("county", value as ShippingAddressFormInput["county"], {
                  shouldValidate: true,
                });
                setValue("city", "", { shouldValidate: true });
              }}
            >
              <SelectTrigger className="h-12 w-full justify-between">
                <SelectValue placeholder="Select county" />
              </SelectTrigger>
              <SelectContent className="max-h-52 overflow-y-auto">
                <SelectGroup>
                  <SelectLabel>Sweden</SelectLabel>
                  <SelectSeparator />
                  {swedishCounties.map((county) => (
                    <SelectItem key={county} value={county}>
                      {county}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {errors.county && (
              <p className="text-xs text-red-500">{errors.county.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>City</Label>
            <Select
              value={selectedCity ?? ""}
              onValueChange={(value) =>
                setValue("city", value as ShippingAddressFormInput["city"], {
                  shouldValidate: true,
                })
              }
              disabled={!availableCities.length}
            >
              <SelectTrigger className="h-12 w-full justify-between">
                <SelectValue placeholder="Select city" />
              </SelectTrigger>
              <SelectContent className="max-h-52 overflow-y-auto">
                <SelectGroup>
                  <SelectLabel>{selectedCounty || "Cities"}</SelectLabel>
                  <SelectSeparator />
                  {availableCities.length > 0 ? (
                    availableCities.map((city: string) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="__select-county-first" disabled>
                      Select a county first
                    </SelectItem>
                  )}
                </SelectGroup>
              </SelectContent>
            </Select>
            {availableCities.length === 0 && (
              <p className="text-xs text-slate-500">
                We only support Swedish cities—choose a county first.
              </p>
            )}
            {errors.city && (
              <p className="text-xs text-red-500">{errors.city.message}</p>
            )}
          </div>


          <div className="space-y-1">
            <Label>Zip code</Label>
            <Input
              className="h-12"
              {...register("postalCode", { required: "Postal code is required" })}
            />
            {errors.postalCode && (
              <p className="text-xs text-red-500">{errors.postalCode.message}</p>
            )}
          </div>


          <div className="flex items-center gap-2 sm:col-span-2">
            <Checkbox
              id="shipping-default"
              checked={Boolean(watch("isDefault"))}
              onCheckedChange={(checked) =>
                setValue("isDefault", checked === true, { shouldValidate: true })
              }
            />
            <Label htmlFor="shipping-default" className="text-sm font-medium">
              Set as default
            </Label>
          </div>
        </form>

        <DialogFooter className="mt-2 flex flex-wrap items-center justify-end gap-3">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" form="shipping-form" disabled={isLoading}>
            {isLoading ? "Saving..." : "Add shipping address"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
