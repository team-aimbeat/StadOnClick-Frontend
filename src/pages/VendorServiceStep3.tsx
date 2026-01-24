import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react"
import dayjs from "dayjs"
import {
  Controller,
  ControllerRenderProps,
  FieldError,
  useFieldArray,
  useForm,
} from "react-hook-form"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export type VendorServiceStep3Handle = {
  validate: () => Promise<boolean>
  getValues: () => Step3Values | null
}

type VendorServiceStep3Props = {
  hideFooter?: boolean
  onSave?: (payload: Step3Values) => void
  serviceId: string
}

const currencyOptions = ["SEK", "USD", "EUR"]
const slotStatuses = ["OPEN", "CLOSED"] as const

type SlotInput = {
  startTime: string
  endTime?: string
  capacity: number
  status: (typeof slotStatuses)[number]
}

type OfferingForm = {
  name: string
  description?: string
  basePrice: number
  salePrice?: number
  currency: string
  maxQuantity?: number
  usesSlots: boolean
  slots: SlotInput[]
}

type Step3Values = {
  offerings: (OfferingForm & { serviceId: string })[]
}

const defaultOffering: OfferingForm = {
  name: "",
  description: "",
  basePrice: 0,
  salePrice: undefined,
  currency: "SEK",
  maxQuantity: undefined,
  usesSlots: false,
  slots: [],
}

const VendorServiceStep3 = forwardRef<VendorServiceStep3Handle, VendorServiceStep3Props>(
  ({ hideFooter, onSave, serviceId }, ref) => {
    const {
      control,
      register,
      handleSubmit,
      formState: { errors },
      watch,
      setError,
    } = useForm<Step3Values>({
      defaultValues: { offerings: [defaultOffering] },
      mode: "onBlur",
    })

    const { fields } = useFieldArray({
      control,
      name: "offerings",
    })

    const normalizedRef = useRef<Step3Values | null>(null)

    const handleValid = (values: Step3Values) => {
      // Check for offerings that require slots but have none
      const invalidOfferingIndex = values.offerings.findIndex(
        (offering) => offering.usesSlots && offering.slots.length === 0,
      )
      if (invalidOfferingIndex > -1) {
        setError(
          `offerings.${invalidOfferingIndex}.slots`,
          { type: "manual", message: "At least one slot is required when 'Uses slots' is checked" },
          { shouldFocus: true },
        )
        throw new Error("validation failed")
      }

      // Normalize and attach serviceId to every offering
      const normalizedOfferings = values.offerings.map((offering) => ({
        ...offering,
        serviceId,
        maxQuantity: offering.maxQuantity ?? null,
        salePrice: offering.salePrice ?? 0,
        slots: offering.slots.map((slot) => ({
          ...slot,
          capacity: Number(slot.capacity),
        })),
      }))

      const finalPayload: Step3Values = { offerings: normalizedOfferings }

      normalizedRef.current = finalPayload
      onSave?.(finalPayload)
      return finalPayload
    }

    const watchedOfferings = watch("offerings")

    const submitHandler = handleSubmit(handleValid)

    useImperativeHandle(
      ref,
      () => ({
        validate: async () => {
          try {
            await submitHandler()
            return true
          } catch {
            return false
          }
        },
        getValues: () => normalizedRef.current,
      }),
      [submitHandler],
    )

    return (
      <div className="space-y-6 pb-10 max-w-4xl mx-auto">

        {/* Visual feedback: show which category we're working under */}
        <div className="rounded-2xl bg-blue-50/70 border border-blue-100 p-5 shadow-sm">
          <p className="text-sm font-medium text-blue-800 mb-1">
            Creating offerings for category
          </p>
          <p className="text-base font-semibold text-slate-900 break-all">
            {serviceId}
          </p>
        </div>

        <form onSubmit={submitHandler} className="space-y-8">
          {fields.map((field, index) => (
            <OfferingCard
              key={field.id}
              fieldIndex={index}
              control={control}
              register={register}
              currencyOptions={currencyOptions}
              slotStatuses={slotStatuses}
              watch={watch}
              errors={{
                name: errors.offerings?.[index]?.name,
                basePrice: errors.offerings?.[index]?.basePrice,
                salePrice: errors.offerings?.[index]?.salePrice,
                maxQuantity: errors.offerings?.[index]?.maxQuantity,
                slots: errors.offerings?.[index]?.slots,
                slotValidation: watchedOfferings[index]?.usesSlots
                  ? errors.offerings?.[index]?.slots?.message
                  : undefined,
              }}
              totalOfferings={fields.length}
            />
          ))}

          {!hideFooter && (
            <div className="flex gap-3 justify-end">
              <button
                type="submit"
                className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
              >
                Save & Continue
              </button>
            </div>
          )}
        </form>
      </div>
    )
  },
)

VendorServiceStep3.displayName = "VendorServiceStep3"

export default VendorServiceStep3

// ────────────────────────────────────────────────
//  OfferingCard – minor visual & label improvements
// ────────────────────────────────────────────────

type OfferingCardProps = {
  fieldIndex: number
  control: ReturnType<typeof useForm<Step3Values>>["control"]
  register: ReturnType<typeof useForm<Step3Values>>["register"]
  currencyOptions: string[]
  slotStatuses: readonly string[]
  errors: {
    name?: { message?: string }
    basePrice?: { message?: string }
    salePrice?: { message?: string }
    maxQuantity?: { message?: string }
    slots?: { message?: string }
    slotValidation?: string
  }
  watch: ReturnType<typeof useForm<Step3Values>>["watch"]
  totalOfferings: number
}

function OfferingCard({
  fieldIndex,
  control,
  register,
  currencyOptions,
  slotStatuses,
  errors,
  watch,
  totalOfferings
}: OfferingCardProps) {
  const slotsFieldArray = useFieldArray({
    control,
    name: `offerings.${fieldIndex}.slots`,
  })

  const usesSlots = watch(`offerings.${fieldIndex}.usesSlots`)

  return (
    <div className="space-y-5 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">
       Offering {totalOfferings > 1 ? `#${fieldIndex + 1}` : ""}
        </h2>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="space-y-1.5">
          <span className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
            Name *
          </span>
          <input
            type="text"
            {...register(`offerings.${fieldIndex}.name`, {
              required: "Service name is required",
              minLength: { value: 3, message: "Name should be at least 3 characters" },
            })}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring focus:ring-blue-200/40"
            placeholder="e.g. Guided City Tour"
          />
          {errors.name && <p className="text-xs text-rose-600">{errors.name.message}</p>}
        </label>

        <label className="space-y-1.5">
          <span className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
            Base Price *
          </span>
          <input
            type="number"
            step="0.01"
            {...register(`offerings.${fieldIndex}.basePrice`, {
              required: "Base price is required",
              valueAsNumber: true,
              min: { value: 0, message: "Price cannot be negative" },
            })}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring focus:ring-blue-200/40"
            placeholder="e.g. 1499"
          />
          {errors.basePrice && <p className="text-xs text-rose-600">{errors.basePrice.message}</p>}
        </label>

        <label className="space-y-1.5">
          <span className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
            Sale Price
          </span>
          <input
            type="number"
            step="0.01"
            {...register(`offerings.${fieldIndex}.salePrice`, {
              valueAsNumber: true,
              min: { value: 0, message: "Price cannot be negative" },
            })}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring focus:ring-blue-200/40"
            placeholder="e.g. 1299 (optional discount)"
          />
          {errors.salePrice && <p className="text-xs text-rose-600">{errors.salePrice.message}</p>}
        </label>

        <label className="space-y-1.5">
          <span className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
            Currency
          </span>
          <select
            {...register(`offerings.${fieldIndex}.currency`)}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring focus:ring-blue-200/40"
          >
            {currencyOptions.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5">
          <span className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
            Max quantity per booking
          </span>
          <input
            type="number"
            {...register(`offerings.${fieldIndex}.maxQuantity`, {
              valueAsNumber: true,
              min: { value: 1, message: "Must be at least 1" },
            })}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring focus:ring-blue-200/40"
            placeholder="e.g. 10 (optional)"
          />
          {errors.maxQuantity && <p className="text-xs text-rose-600">{errors.maxQuantity.message}</p>}
        </label>
      </div>

      <label className="flex items-center gap-3 pt-2">
        <input
          type="checkbox"
          {...register(`offerings.${fieldIndex}.usesSlots`)}
          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
        />
        <span className="text-sm font-medium text-slate-700">This offering uses time slots / availability</span>
      </label>

      <label className="space-y-1.5">
        <span className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
          Description / What's included
        </span>
        <textarea
          {...register(`offerings.${fieldIndex}.description`)}
          rows={3}
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring focus:ring-blue-200/40"
          placeholder="Duration, inclusions, requirements, cancellation policy..."
        />
      </label>

      {usesSlots && (
        <SlotManager
          register={register}
          fieldIndex={fieldIndex}
          slotsFieldArray={slotsFieldArray}
          slotStatuses={slotStatuses}
          error={errors.offerings?.[fieldIndex]?.slots?.message}
          watch={watch}
          control={control}
        />
      )}
    </div>
  )
}

// ────────────────────────────────────────────────
//  SlotManager & DateTimeField (unchanged – just copied for completeness)
// ────────────────────────────────────────────────

type SlotManagerProps = {
  fieldIndex: number
  register: ReturnType<typeof useForm<Step3Values>>["register"]
  slotsFieldArray: ReturnType<typeof useFieldArray<Step3Values>>
  control: ReturnType<typeof useForm<Step3Values>>["control"]
  slotStatuses: readonly string[]
  error?: string
  watch: ReturnType<typeof useForm<Step3Values>>["watch"]
}

function SlotManager({ fieldIndex, register, slotsFieldArray, slotStatuses, error, watch, control }: SlotManagerProps) {
  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-slate-700">Time Slots / Availability</p>
        <button
          type="button"
          onClick={() =>
            slotsFieldArray.append({
              startTime: "",
              endTime: "",
              capacity: 1,
              status: "OPEN",
            })
          }
          className="text-xs font-medium text-blue-600 hover:text-blue-800"
        >
          + Add slot
        </button>
      </div>

      {error && <p className="mb-3 text-xs text-rose-600 font-medium">{error}</p>}

      <div className="space-y-4">
        {slotsFieldArray.fields.map((slot, slotIndex) => (
          <div
            key={slot.id}
            className="grid gap-4 md:grid-cols-[1fr_1fr_140px_auto] items-start bg-white p-4 rounded-xl border border-slate-100"
          >
            <Controller
              control={control}
              name={`offerings.${fieldIndex}.slots.${slotIndex}.startTime`}
              rules={{ required: "Start time is required" }}
              render={({ field, fieldState }) => (
                <DateTimeField
                  field={field}
                  label="Start"
                  required
                  error={fieldState.error}
                />
              )}
            />

            <Controller
              control={control}
              name={`offerings.${fieldIndex}.slots.${slotIndex}.endTime`}
              render={({ field, fieldState }) => (
                <DateTimeField
                  field={field}
                  label="End"
                  error={fieldState.error}
                />
              )}
            />

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1">
                  Capacity
                </label>
                <input
                  type="number"
                  {...register(`offerings.${fieldIndex}.slots.${slotIndex}.capacity`, {
                    required: "Capacity is required",
                    valueAsNumber: true,
                    min: { value: 1, message: "≥ 1" },
                  })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring focus:ring-blue-200/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1">
                  Status
                </label>
                <select
                  {...register(`offerings.${fieldIndex}.slots.${slotIndex}.status`)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring focus:ring-blue-200/40"
                >
                  {slotStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={() => slotsFieldArray.remove(slotIndex)}
              className="mt-8 text-xs font-medium text-rose-600 hover:text-rose-800"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// DateTimeField and parseDateValue remain unchanged
// (copy them from your original file if needed)

type DateTimeFieldProps = {
  field: ControllerRenderProps<string, string>
  label: string
  required?: boolean
  error?: FieldError
}

// ... DateTimeField component here (same as yours) ...
