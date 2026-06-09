import type { CardData } from "../../lib/types";
import { CARD_W, CARD_H, ProductImage } from "./shared";

const BG = "#3a3a3c";
const ORANGE = "#ee7a1a";
const CREAM = "#d8d2c4";

export function FenTemplate({ data }: { data: CardData }) {
  return (
    <div
      style={{
        width: CARD_W,
        height: CARD_H,
        position: "relative",
        overflow: "hidden",
        background: BG,
        fontFamily: "Manrope, sans-serif",
        color: "#fff",
      }}
    >
      {/* top */}
      <div
        style={{
          position: "absolute",
          top: 26,
          left: 32,
          right: 32,
          display: "flex",
          justifyContent: "space-between",
          fontSize: 14,
          fontWeight: 800,
        }}
      >
        <span>{data.brand}</span>
        <span>{data.code ? `№ ${data.code}` : ""}</span>
      </div>

      {/* title */}
      <div style={{ position: "absolute", top: 60, left: 30, right: 30 }}>
        <div style={{ position: "relative" }}>
          <h1
            style={{
              margin: 0,
              fontSize: 78,
              lineHeight: 0.9,
              fontWeight: 800,
              color: CREAM,
              letterSpacing: -2,
              whiteSpace: "pre-line",
            }}
          >
            {data.title}
          </h1>
          <div
            style={{
              position: "absolute",
              top: 8,
              right: 0,
              fontSize: 13,
              fontWeight: 600,
              color: CREAM,
              textAlign: "left",
              maxWidth: 130,
            }}
          >
            {data.subtitle}
          </div>
        </div>
      </div>

      {/* product */}
      <ProductImage
        src={data.imageUrl}
        style={{
          position: "absolute",
          top: 210,
          left: 150,
          width: 420,
          height: 360,
        }}
      />

      {/* stat bar */}
      <div
        style={{
          position: "absolute",
          top: 430,
          left: 30,
          width: 300,
          background: ORANGE,
          borderRadius: 16,
          padding: "16px 18px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        {data.stats.slice(0, 3).map((s) => (
          <div key={s.label} style={{ maxWidth: 80 }}>
            <div style={{ fontSize: 40, fontWeight: 800, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 11, fontWeight: 600, marginTop: 4, lineHeight: 1.1 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* circular gauges */}
      <div
        style={{
          position: "absolute",
          top: 545,
          left: 30,
          display: "flex",
          gap: 16,
        }}
      >
        {data.stats.slice(3, 5).map((s) => (
          <Gauge key={s.label} value={s.value} label={s.label} />
        ))}
      </div>

      {/* extra characteristics */}
      <div style={{ position: "absolute", bottom: 60, left: 30, maxWidth: 260 }}>
        <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 8 }}>
          {data.extraTitle}
        </div>
        {data.extraList.map((e) => (
          <div
            key={e}
            style={{ fontSize: 13, color: "#d6d6d6", marginBottom: 4, display: "flex", gap: 8 }}
          >
            <span style={{ color: ORANGE }}>•</span>
            {e}
          </div>
        ))}
      </div>

      {/* code */}
      <div style={{ position: "absolute", bottom: 24, left: 30, fontSize: 14, fontWeight: 800 }}>
        {data.code ? `Код: ${data.code}` : ""}
      </div>
    </div>
  );
}

function Gauge({ value, label }: { value: string; label: string }) {
  return (
    <div
      style={{
        width: 132,
        height: 92,
        borderRadius: 14,
        border: `3px solid ${ORANGE}`,
        borderRightColor: "transparent",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 10, color: "#cfcfcf", marginTop: 3, maxWidth: 90 }}>{label}</div>
    </div>
  );
}
