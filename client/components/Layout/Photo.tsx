import Image from "next/image";
import styles from "../../styles/Home.module.css";

type Props = {
  src: string;
  alt: string;
  size: "sm" | "md" | "lg";
  type: "profile" | "event" | "team";
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
    size == "sm" ? styles.imageContainerSmall : styles.imageContainerLarge;

  const placeholderImg =
    type == "profile"
      ? "/images/profile_placeholder.png"
      : "/images/team_placeholder.png";

  return (
    <div className={styleSize}>
      {!isLoading && src !== undefined && src !== "" ? (
        <Image src={src} alt={alt} layout="fill" objectFit="cover" priority />
      ) : (
        <Image
          src={placeholderImg}
          alt={`${type} placeholder`}
          layout="fill"
          objectFit="cover"
          priority
        />
      )}
    </div>
  );
};
