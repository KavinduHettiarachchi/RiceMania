import DishArt from "@/app/components/DishArt";
import FoodImage from "@/app/components/FoodImage";

export default function FoodHeroImage({
  src,
  name,
}: {
  src: string | null;
  name: string;
}) {
  return (
    <div className="group relative aspect-square overflow-hidden rounded-[2rem] bg-linear-to-br from-lime-glow via-[#f5f9dc] to-carrot-100 sm:rounded-[2.5rem]">
      <div
        aria-hidden
        className="animate-spin-slow absolute inset-[10%] rounded-full border border-dashed border-carrot-500/20"
      />

      {src ? (
        <FoodImage
          src={src}
          name={name}
          sizes="(max-width: 1024px) 92vw, 46vw"
          priority
          className="absolute inset-0 size-full"
        />
      ) : (
        <div className="animate-float absolute inset-[6%]">
          <DishArt
            name={name}
            steam
            className="size-full rounded-full bg-transparent!"
          />
        </div>
      )}
    </div>
  );
}
