import { BellIcon, ChevronDown } from './Icons.jsx'

export default function Topbar({
  title = 'Overview',
  subtitle = 'Manage operations, users, and system configuration.',
  onMenu,
}) {
  return (
    <header className="flex items-center justify-between gap-3 rounded-[10px] bg-white/60 px-4 py-3 md:px-[50px]">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          aria-label="Open menu"
          onClick={onMenu}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white lg:hidden"
        >
          <svg viewBox="0 0 20 20" className="h-5 w-5" stroke="#454545" strokeWidth="1.6" fill="none" strokeLinecap="round">
            <path d="M3 5.5h14M3 10h14M3 14.5h14" />
          </svg>
        </button>
        <div className="flex min-w-0 flex-col gap-1 md:gap-2.5">
          <h1 className="truncate text-xl font-medium leading-[26px] tracking-[-0.5px] text-[#2D2D2D] md:text-2xl">
            {title}
          </h1>
          <p className="truncate text-sm leading-[17px] text-[#6E6E6E] md:text-base">{subtitle}</p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3 md:gap-[31px]">
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white md:h-[54px] md:w-[54px]"
        >
          <BellIcon className="h-6 w-6" />
          <span className="absolute right-[7px] top-[7px] h-2.5 w-2.5 rounded-full bg-[#D85A30]" />
        </button>

        <button
          type="button"
          className="flex items-center gap-3 rounded-full border border-[#E5E7EB] bg-white py-1.5 pl-1.5 pr-2 md:py-[13px] md:pl-[26px] md:pr-4"
        >
          <img
            src="/images/avatar-john.png"
            alt="John Doe"
            className="h-9 w-9 rounded-full object-cover md:h-[42px] md:w-[42px]"
          />
          <span className="hidden flex-col gap-1 text-left sm:flex">
            <span className="text-base font-semibold leading-[17px] text-[#2D2D2D]">John Doe</span>
            <span className="text-[13px] leading-[14px] text-[#6B7280]">Faculty Administrator</span>
          </span>
          <ChevronDown className="hidden h-5 w-5 md:block md:h-[27px] md:w-[27px]" />
        </button>
      </div>
    </header>
  )
}
