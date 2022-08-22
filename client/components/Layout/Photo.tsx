import Image from "next/image";

type Props = {
  src: string;
  alt: string;
  size: "sm" | "md" | "lg";
  type: "profile" | "event" | "team" | "venue" | "park";
  isLoading: boolean;
  h?: number;
  w?: number;
};

export const Photo = ({
  src,
  alt,
  size,
  type,
  h,
  w,
  isLoading = true,
}: Props) => {
  const styleSize =
    size == "sm"
      ? "md:w-[100px] md:h-[100px] w-[60px] h-[60px] relative"
      : "md:w-[200px] md:h-[200px] w-[120px] h-[120px] relative";

  const setPlaceholder = (type: string) => {
    return `/images/${type}_placeholder.png`;
  };

  const placeholderImg = setPlaceholder(type);

  return (
    <div className={styleSize}>
      {!isLoading && src !== undefined && src !== "" ? (
        <Image
          src={src}
          alt={alt}
          layout="fill"
          objectFit="cover"
          priority
          className="rounded-full"
        />
      ) : (
        <Image
          src={placeholderImg}
          alt={`${type} placeholder`}
          layout="fill"
          objectFit="cover"
          priority
          className={`rounded-full ${type == "venue" && "bg-slate-50"}`}
        />
      )}
    </div>
  );
};
