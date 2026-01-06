import { ReactNode, useEffect, useRef, useState } from "react";

type DropdownProps = {
  button: ReactNode;
  children: ReactNode;
  offset?: [number, number];
  placement?: string;
  btnClassName?: string;
};

export default function Dropdown({
  button,
  children,
  btnClassName = "",
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        className={btnClassName}
        onClick={() => setOpen((o) => !o)}
      >
        {button}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 z-50 bg-white dark:bg-black border rounded shadow-lg">
          {children}
        </div>
      )}
    </div>
  );
}
