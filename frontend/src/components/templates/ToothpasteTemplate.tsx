import type { CardData } from "../../lib/types";
import { CARD_W, CARD_H, ProductImage } from "./shared";

const YELLOW = "#f2c200";
const DARK = "#161616";

export function ToothpasteTemplate({ data }: { data: CardData }) {
  return (
    <div
      style={{
        width: CARD_W,
        height: CARD_H,
        position: "relative",
        overflow: "hidden",
        background: "#ededed",
        fontFamily: "Manrope, sans-serif",
        color: DARK,
      }}
    >
      {/* logo + nav */}
      <div
        style={{
          position: "absolute",
          top: 26,
          left: 28,
          right: 28,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontWeight: 800, color: YELLOW, fontSize: 18 }}>{data.brand}</span>
        <div
          style={{
            display: "flex",
            gap: 18,
            alignItems: "center",
            border: "1px solid #cfcfcf",
            borderRadius: 30,
            padding: "8px 18px",
            fontSize: 13,
            fontWeight: 600,
            background: "#fff",
          }}
        >
          {data.nav.map((n) => (
            <span key={n}>{n}</span>
          ))}
          <span
            style={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              background: YELLOW,
              display: "inline-block",
            }}
          />
        </div>
      </div>

      {/* title */}
      <h1
        style={{
          position: "absolute",
          top: 120,
          left: 28,
          margin: 0,
          fontSize: 64,
          lineHeight: 0.95,
          fontWeight: 800,
          letterSpacing: -1.5,
          whiteSpace: "pre-line",
        }}
      >
        {data.title}
      </h1>

      {/* yellow pill */}
      <div
        style={{
          position: "absolute",
          top: 300,
          left: 28,
          background: YELLOW,
          borderRadius: 40,
          padding: "10px 22px 10px 12px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          maxWidth: 280,
        }}
      >
        <span
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: "#fff",
            display: "block",
          }}
        />
        <span style={{ fontSize: 16, fontWeight: 800, lineHeight: 1.1 }}>
          {data.subtitle}
        </span>
      </div>

      {/* black numbered card */}
      <div
        style={{
          position: "absolute",
          top: 380,
          left: 28,
          width: 290,
          background: DARK,
          borderRadius: 18,
          padding: "22px 22px",
          color: "#fff",
        }}
      >
        {data.features.slice(0, 3).map((f, i) => (
          <div
            key={f.title}
            style={{
              display: "flex",
              gap: 14,
              alignItems: "flex-start",
              marginBottom: i === 2 ? 0 : 18,
            }}
          >
            <span style={{ fontSize: 22, fontWeight: 800, color: "#777", minWidth: 30 }}>
              0{i + 1}
            </span>
            <div>
              <div style={{ fontSize: 19, fontWeight: 800 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: "#bdbdbd" }}>{f.subtitle}</div>
            </div>
          </div>
        ))}
      </div>

      {/* product */}
      <ProductImage
        src={data.imageUrl}
        style={{
          position: "absolute",
          top: 150,
          right: 20,
          width: 300,
          height: 480,
        }}
      />

      {/* description */}
      <div style={{ position: "absolute", bottom: 28, left: 28, maxWidth: 300 }}>
        <div style={{ fontSize: 14, fontWeight: 800 }}>{data.extraTitle}</div>
        <div style={{ fontSize: 11, color: "#555", marginTop: 4, lineHeight: 1.3 }}>
          {data.extraList.join(". ")}
        </div>
      </div>
    </div>
  );
}
