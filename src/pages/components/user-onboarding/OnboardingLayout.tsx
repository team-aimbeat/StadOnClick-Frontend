import { Badge } from "@/components/ui/badge"
import verifiedIcon from "../../../assets/icons/check.svg"
import trustedIcon from "../../../assets/icons/Lock.svg"
import secureIcon from "../../../assets/icons/Star.svg"

type OnboardingLayoutProps = {
  image: string
  imageTitle: string
  imageSubtitle: string
  children: React.ReactNode
}

export function OnboardingLayout({
  image,
  imageTitle,
  imageSubtitle,
  children,
}: OnboardingLayoutProps) {
  return (
    <div className="relative min-h-screen w-full bg-[#F5F5F5] px-3 py-4 sm:px-6 sm:py-6">
      <div className="absolute inset-0">
        <div className="relative h-full w-full overflow-hidden rounded-2xl">
          <img
            key={image}
            src={image}
            alt="Onboarding"
            className="h-full w-full object-cover object-center bg-slide-in"
            loading="lazy"
          />
          <div className="absolute right-0 top-0 h-10 w-10 bg-[#F5F5F5]" />
          <div className="absolute bottom-0 left-0 h-10 w-10 bg-[#F5F5F5]" />
        </div>
      </div>

      <div className="relative z-20 flex min-h-screen items-center px-4 py-8 sm:px-6 lg:px-12 lg:py-12">
        <div className="w-full flex justify-start gap-4 lg:flex-row lg:items-center lg:gap-40">
          <div className="flex justify-center lg:justify-start drop-shadow-lg">{children}</div>

          <div className="hidden lg:flex flex-col items-center text-center text-white gap-4">
            <h2 className="font-normal drop-shadow-lg hero-script whitespace-pre-line">
              {imageTitle}
            </h2>
            {imageSubtitle ? (
              <p className="text-lg text-white/90 hero-subtitle">{imageSubtitle}</p>
            ) : null}

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Badge
                variant="secondary"
                className="flex items-center gap-2 bg-black/40 px-4 py-2 text-white backdrop-blur"
              >
                <img
                  src={verifiedIcon}
                  alt="Verified"
                  className="h-4 w-4"
                />
                Verified providers
              </Badge>

              <Badge
                variant="secondary"
                className="flex items-center gap-2 bg-black/40 px-4 py-2 text-white backdrop-blur"
              >
                <img
                  src={trustedIcon}
                  alt="Trusted"
                  className="h-4 w-4"
                />
                Trusted by locals
              </Badge>

              <Badge
                variant="secondary"
                className="flex items-center gap-2 bg-black/40 px-4 py-2 text-white backdrop-blur"
              >
                <img
                  src={secureIcon}
                  alt="Secure"
                  className="h-4 w-4"
                />
                Secure signup
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
