import type { CardData } from "../../lib/types";
import { Icon } from "../Icon";
import { CARD_W, CARD_H, ProductImage } from "./shared";

const GREEN = "#5d7a5f";
const LIGHT = "#dff0d8";

export function AirpodsTemplate({ data }: { data: CardData }) {
  const words = data.title.replace(/\n/g, " ").split(" ").filter(Boolean);
  return (
    <div
      style={{
        width: CARD_W,
        height: CARD_H,
        position: "relative",
        overflow: "hidden",
        background: "#ffffff",
        fontFamily: "Manrope, sans-serif",
        color: "#243524",
      }}
    >
      {/* big title */}
      <div style={{ position: "absolute", top: 40, left: 40 }}>
        {words.slice(0, 3).map((w, i) => (
          <div
            key={i}
            style={{
              fontSize: 96,
              lineHeight: 0.92,
              fontWeight: 800,
              color: GREEN,
              letterSpacing: -3,
            }}
          >
            {w}
          </div>
        ))}
      </div>

      {/* top-right callout */}
      <div
        style={{
          position: "absolute",
          top: 60,
          right: 36,
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 14,
          padding: "12px 16px",
          display: "flex",
          gap: 10,
          alignItems: "flex-start",
          boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
          maxWidth: 190,
        }}
      >
        <div
          style={{
            width: 22,
            height: 22,
            borderRadius: 6,
            background: GREEN,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon name="Check" size={14} />
        </div>
        <span style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.15 }}>{data.subtitle}</span>
      </div>

      {/* product */}
      <ProductImage
        src={data.imageUrl}
        style={{
          position: "absolute",
          top: 300,
          left: 70,
          width: 460,
          height: 360,
        }}
      />

      {/* left callout */}
      <div
        style={{
          position: "absolute",
          bottom: 150,
          left: 36,
          background: LIGHT,
          borderRadius: 16,
          padding: "14px 16px",
          display: "flex",
          gap: 10,
          alignItems: "flex-start",
          maxWidth: 210,
        }}
      >
        <div
          style={{
            width: 22,
            height: 22,
            borderRadius: 6,
            background: GREEN,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon name="Check" size={14} />
        </div>
        <span style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.2 }}>
          {data.features[0]
            ? `${data.features[0].title} ${data.features[0].subtitle}`
            : "Дополнительно в комплекте"}
        </span>
      </div>

      {/* bottom stats */}
      <div
        style={{
          position: "absolute",
          bottom: 36,
          left: 36,
          right: 36,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        {data.stats.slice(0, 3).map((s) => (
          <div key={s.label} style={{ maxWidth: 150 }}>
            <div style={{ fontSize: 16, fontWeight: 500, color: "#3a4a3a" }}>
              до{" "}
              <span style={{ fontSize: 26, fontWeight: 800, color: GREEN }}>{s.value}</span>
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.15 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
