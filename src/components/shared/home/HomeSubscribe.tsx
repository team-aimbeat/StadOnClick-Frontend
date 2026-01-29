import profileSeven from "@/assets/images/profile-7.jpeg";
import profileEight from "@/assets/images/profile-8.jpeg";
import profileNine from "@/assets/images/profile-9.jpeg";
import profileTen from "@/assets/images/profile-10.jpeg";
import subscribeBg from "@/assets/images/subscribe.png";


const avatars = [
  { src: profileSeven, alt: "Subscriber portrait" },
  { src: profileEight, alt: "Subscriber portrait" },
  { src: profileNine, alt: "Subscriber portrait" },
  { src: profileTen, alt: "Subscriber portrait" },
];

export default function HomeSubscribe() {
  return (
   <section
  className="relative mt-12 w-screen -mx-[calc((100vw-100%)/2)] py-16 bg-cover bg-center h-[454px] "
  style={{ backgroundImage: `url(${subscribeBg})` }}
>
  {/* Dark overlay */}

  <div className="relative mx-auto max-w-7xl px-4">
    <div className="relative flex flex-col items-center gap-5 text-center">
      <h2 className="text-[32px] font-semibold text-black sm:text-2xl md:text-3xl">
        Subscribe to get the latest
        <br />
        activity updates
      </h2>

      <button
        type="button"
        className="mt-2 rounded-full bg-[#3289FF] px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-600 md:px-8 md:py-3 md:text-base w-[250px] h-[61px]"
      >
        Subscribe now
      </button>
    </div>

    {/* Floating avatars */}
  <div className="pointer-events-none">
  <img
    src={avatars[0].src}
    alt={avatars[0].alt}
    className="absolute left-1 top-4 h-[160px] w-[160px] rounded-full object-cover shadow-md"
  />

  <img
    src={avatars[1].src}
    alt={avatars[1].alt}
    className="absolute left-[20%] top-20 h-[160px] w-[160px] rounded-full object-cover shadow-md"
  />

  <img
    src={avatars[2].src}
    alt={avatars[2].alt}
    className="absolute right-[24%] top-30 h-[160px] w-[160px] rounded-full object-cover shadow-md"
  />

  <img
    src={avatars[3].src}
    alt={avatars[3].alt}
    className="absolute right-10 top-4 h-[160px] w-[160px] rounded-full object-cover shadow-md"
  />
</div>


  </div>
</section>

  );
}