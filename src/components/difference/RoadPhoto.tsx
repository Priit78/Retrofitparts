import Image from "next/image";
import roadNight from "@/assets/photos/road-night.jpg";
import { cn } from "@/lib/cn";

/** The slider spans the container: at most 1232 px (Container's 1280 px minus its padding). */
const SIZES = "(min-width: 1280px) 1232px, (min-width: 768px) calc(100vw - 48px), calc(100vw - 32px)";

/*
 * Both sides of the comparison are the same night photo; CSS does the simulation. The values
 * were tuned by eye in the direction A mockup. Filter order matters, so they stay plain CSS
 * strings rather than Tailwind's fixed-order filter utilities.
 */
const look = {
  before: {
    // A faded halogen: warm, dim, flat and slightly soft. The 2% scale hides the blurred edge.
    filter: "sepia(.6) saturate(1.35) hue-rotate(-6deg) brightness(.74) contrast(.84) blur(1.1px)",
    // A dark vignette: the light falls off quickly outside a short pool in front of the car.
    overlay:
      "radial-gradient(ellipse 60% 50% at 46% 74%, transparent 0%, rgb(0 0 0 / 0.35) 55%, rgb(0 0 0 / 0.7) 100%)",
  },
  after: {
    // A new projector: neutral white, a little brighter and crisper.
    filter: "saturate(.3) brightness(1.1) contrast(1.06)",
    // A faint cool tint, screened over the photo.
    overlay: "linear-gradient(180deg, rgb(160 195 255 / 0.07), rgb(160 195 255 / 0.03))",
  },
} as const;

/** One side of the before/after slider: the night road photo with that side's look. */
export function RoadPhoto({ variant, alt }: { variant: keyof typeof look; alt: string }) {
  const { filter, overlay } = look[variant];
  return (
    <>
      <Image
        src={roadNight}
        alt={alt}
        fill
        sizes={SIZES}
        className={cn("object-cover object-[50%_60%]", variant === "before" && "scale-[1.02]")}
        style={{ filter }}
      />
      <div
        aria-hidden
        className={cn("absolute inset-0", variant === "after" && "mix-blend-screen")}
        style={{ backgroundImage: overlay }}
      />
    </>
  );
}
