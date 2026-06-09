export const CARD_W = 600;
export const CARD_H = 800;

export function ProductImage({
  src,
  style,
  className,
}: {
  src: string | null;
  style?: React.CSSProperties;
  className?: string;
}) {
  if (src) {
    return (
      <img
        src={src}
        alt="product"
        crossOrigin="anonymous"
        className={className}
        style={{ objectFit: "contain", ...style }}
      />
    );
  }
  return (
    <div
      className={className}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "rgba(0,0,0,0.25)",
        fontWeight: 600,
        border: "2px dashed rgba(0,0,0,0.18)",
        borderRadius: 24,
        background: "rgba(0,0,0,0.03)",
        ...style,
      }}
    >
      Фото товара
    </div>
  );
}
