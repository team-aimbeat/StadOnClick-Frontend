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
  offerings: OfferingForm[]
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
  ({ hideFooter, onSave }, ref) => {
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
      const invalidOfferingIndex = values.offerings.findIndex(
        (offering) => offering.usesSlots && offering.slots.length === 0,
      )
      if (invalidOfferingIndex > -1) {
        setError(
          `offerings.${invalidOfferingIndex}.slots`,
          { type: "manual", message: "Add at least one slot" },
          { shouldFocus: true },
        )
        throw new Error("validation")
      }

      const normalized = values.offerings.map((offering) => ({
        ...offering,
        maxQuantity: offering.maxQuantity ?? null,
        salePrice: offering.salePrice ?? 0,
        slots: offering.slots.map((slot) => ({
          ...slot,
          capacity: Number(slot.capacity),
        })),
      }))

      normalizedRef.current = { offerings: normalized }
      onSave?.({ offerings: normalized })
      return normalized
    }

    const watchedOfferings = watch("offerings")
    const submitHandler = handleSubmit((values) => {
      handleValid(values)
    })

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
            />
          ))}

          {!hideFooter && (
            <div className="flex gap-3">
              <button
                type="submit"
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Save & continue
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
}

function OfferingCard({
  fieldIndex,
  control,
  register,
  currencyOptions,
  slotStatuses,
  errors,
  watch,
}: OfferingCardProps) {
  const slotsFieldArray = useFieldArray({
    control,
    name: `offerings.${fieldIndex}.slots`,
  })

  const usesSlots = watch(`offerings.${fieldIndex}.usesSlots`)

  return (
    <div className="space-y-5 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Offering</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1 text-sm text-slate-700">
          <span className="font-semibold text-slate-600">Name *</span>
          <input
            type="text"
            {...register(`offerings.${fieldIndex}.name`, {
              required: "Name is required",
            })}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring focus:ring-blue-200/60"
          />
          {errors.name && (
            <span className="text-xs text-rose-500">{errors.name.message}</span>
          )}
        </label>

        <label className="space-y-1 text-sm text-slate-700">
          <span className="font-semibold text-slate-600">Base price *</span>
          <input
            type="number"
            step="0.01"
            {...register(`offerings.${fieldIndex}.basePrice`, {
              required: "Base price is required",
              valueAsNumber: true,
              min: { value: 0, message: "Cannot be negative" },
            })}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring focus:ring-blue-200/60"
          />
          {errors.basePrice && (
            <span className="text-xs text-rose-500">{errors.basePrice.message}</span>
          )}
        </label>

        <label className="space-y-1 text-sm text-slate-700">
          <span className="font-semibold text-slate-600">Sale price</span>
          <input
            type="number"
            step="0.01"
            {...register(`offerings.${fieldIndex}.salePrice`, {
              valueAsNumber: true,
              min: { value: 0, message: "Cannot be negative" },
            })}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring focus:ring-blue-200/60"
          />
          {errors.salePrice && (
            <span className="text-xs text-rose-500">{errors.salePrice.message}</span>
          )}
        </label>

        <label className="space-y-1 text-sm text-slate-700">
          <span className="font-semibold text-slate-600">Currency</span>
          <select
            {...register(`offerings.${fieldIndex}.currency`)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring focus:ring-blue-200/60"
          >
            {currencyOptions.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1 text-sm text-slate-700">
          <span className="font-semibold text-slate-600">Max quantity</span>
          <input
            type="number"
            {...register(`offerings.${fieldIndex}.maxQuantity`, {
              valueAsNumber: true,
              min: { value: 1, message: "Must be positive" },
            })}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring focus:ring-blue-200/60"
          />
          {errors.maxQuantity && (
            <span className="text-xs text-rose-500">{errors.maxQuantity.message}</span>
          )}
        </label>
      </div>

      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          {...register(`offerings.${fieldIndex}.usesSlots`)}
          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
        />
        <span className="text-sm font-semibold text-slate-700">Uses slots</span>
      </label>

      <label className="space-y-1 text-sm text-slate-700">
        <span className="font-semibold text-slate-600">Description</span>
        <textarea
          {...register(`offerings.${fieldIndex}.description`)}
          rows={3}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring focus:ring-blue-200/60"
        />
      </label>

      {usesSlots && (
        <SlotManager
          register={register}
          fieldIndex={fieldIndex}
          slotsFieldArray={slotsFieldArray}
          slotStatuses={slotStatuses}
          error={errors.slotValidation}
          watch={watch}
          control={control}
        />
      )}
    </div>
  )
}

type SlotManagerProps = {
  fieldIndex: number
  register: ReturnType<typeof useForm<Step3Values>>["register"]
  slotsFieldArray: ReturnType<typeof useFieldArray<Step3Values>>
  control: ReturnType<typeof useForm<Step3Values>>["control"]
  slotStatuses: readonly string[]
  error?: string
  watch: ReturnType<typeof useForm<Step3Values>>["watch"]
}

function SlotManager({
  fieldIndex,
  register,
  slotsFieldArray,
  slotStatuses,
  error,
  watch,
  control,
}: SlotManagerProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-700">Slots</p>
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
          className="text-xs font-semibold text-blue-600"
        >
          Add slot
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-rose-500">{error}</p>}
      <div className="mt-4 space-y-3">
        {slotsFieldArray.fields.map((slot, slotIndex) => (
          <div
            key={slot.id}
            className="grid gap-3 md:grid-cols-[minmax(0,1.35fr)_minmax(0,1.35fr)_minmax(0,1fr)_auto]"
          >
            <Controller
              control={control}
              name={`offerings.${fieldIndex}.slots.${slotIndex}.startTime`}
              rules={{ required: "Start time is required" }}
              render={({ field, fieldState }) => (
                <DateTimeField
                  field={field}
                  label="Start time"
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
                  label="End time"
                  error={fieldState.error}
                />
              )}
            />
            <div className="grid gap-2">
              <input
                type="number"
                {...register(`offerings.${fieldIndex}.slots.${slotIndex}.capacity`, {
                  required: "Capacity is required",
                  valueAsNumber: true,
                  min: { value: 1, message: "Must be at least 1" },
                })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring focus:ring-blue-200/60"
              />
              <select
                {...register(`offerings.${fieldIndex}.slots.${slotIndex}.status`)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring focus:ring-blue-200/60"
              >
                {slotStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Remaining</span>
                <span>
                  {watch(`offerings.${fieldIndex}.slots.${slotIndex}.capacity`) ?? 0}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => slotsFieldArray.remove(slotIndex)}
              className="text-xs font-semibold text-rose-500"
            >
              Remove slot
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

type DateTimeFieldProps = {
  field: ControllerRenderProps<string, string>
  label: string
  required?: boolean
  error?: FieldError
}

function DateTimeField({ field, label, required, error }: DateTimeFieldProps) {
  const parsed = useMemo(() => parseDateValue(field.value), [field.value])
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(parsed.date)
  const [timeValue, setTimeValue] = useState(parsed.time)

  useEffect(() => {
    setSelectedDate(parsed.date)
  }, [parsed.date])

  useEffect(() => {
    setTimeValue(parsed.time)
  }, [parsed.time])

  const handleTimeChange = (nextValue: string) => {
    setTimeValue(nextValue)
    const baseDate = selectedDate ?? new Date()
    const formattedDate = dayjs(baseDate).format("YYYY-MM-DD")
    field.onChange(`${formattedDate}T${nextValue}`)
  }

  const handleDateSelect = (date?: Date) => {
    if (!date) {
      return
    }

    setSelectedDate(date)
    const formattedDate = dayjs(date).format("YYYY-MM-DD")
    const formValue = timeValue || "00:00"
    field.onChange(`${formattedDate}T${formValue}`)
    setCalendarOpen(false)
  }

  const displayDate = selectedDate
    ? dayjs(selectedDate).format("ddd, MMM D, YYYY")
    : "Select date"

  return (
    <div className="space-y-1 text-sm text-slate-700">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-slate-600">
          {label}
          {required && " *"}
        </span>
      </div>
      <div className="flex gap-2">
        <input
          type="time"
          value={timeValue}
          onChange={(event) => handleTimeChange(event.target.value)}
          className="w-1/3 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring focus:ring-blue-200/60"
        />
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-left text-sm text-slate-600 shadow-sm hover:border-blue-500 focus:outline-none focus:ring focus:ring-blue-200/60"
            >
              {displayDate}
            </button>
          </PopoverTrigger>
          <PopoverContent side="bottom" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
            />
          </PopoverContent>
        </Popover>
      </div>
      {error && <p className="text-xs text-rose-500">{error.message}</p>}
    </div>
  )
}

function parseDateValue(value?: string) {
  if (!value) {
    return { date: undefined, time: "" }
  }

  const parsed = dayjs(value)
  if (!parsed.isValid()) {
    return { date: undefined, time: "" }
  }

  return {
    date: parsed.toDate(),
    time: parsed.format("HH:mm"),
  }
}
