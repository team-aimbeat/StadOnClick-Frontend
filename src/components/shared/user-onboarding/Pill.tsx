type PillProps = {
  text: string
}

export function Pill({ text }: PillProps) {
  return (
    <div className="flex items-center gap-2 rounded-full bg-black/45 px-4 py-2 text-sm backdrop-blur">
      <span className="h-2 w-2 rounded-full bg-white/70" />
      {text}
    </div>
  )
}
