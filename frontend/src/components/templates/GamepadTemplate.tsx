import type { CardData } from "../../lib/types";
import { Icon } from "../Icon";
import { CARD_W, CARD_H, ProductImage } from "./shared";

const DARK = "#4a6450";

export function GamepadTemplate({ data }: { data: CardData }) {
  return (
    <div
      style={{
        width: CARD_W,
        height: CARD_H,
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(160deg,#eef2ec 0%,#e3ebe2 100%)",
        fontFamily: "Manrope, sans-serif",
        color: "#2d3a30",
      }}
    >
      {/* top bar */}
      <div
        style={{
          position: "absolute",
          top: 28,
          left: 36,
          right: 36,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        <span style={{ fontWeight: 800 }}>{data.brand}</span>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          {data.nav.map((n, i) => (
            <span
              key={n}
              style={{
                padding: i === 0 ? "4px 12px" : 0,
                borderRadius: 20,
                background: i === 0 ? DARK : "transparent",
                color: i === 0 ? "#fff" : "#3a4a3e",
              }}
            >
              {n}
            </span>
          ))}
        </div>
      </div>

      {/* title */}
      <div style={{ position: "absolute", top: 70, left: 36, right: 36 }}>
        <h1
          style={{
            margin: 0,
            fontSize: 86,
            lineHeight: 0.92,
            fontWeight: 800,
            color: DARK,
            letterSpacing: -2,
          }}
        >
          {data.title.split("\n")[0]}
        </h1>
        <div
          style={{
            marginTop: 6,
            fontSize: 22,
            fontWeight: 600,
            color: "#52685a",
          }}
        >
          {data.subtitle}
        </div>
      </div>

      {/* badge card */}
      <div
        style={{
          position: "absolute",
          top: 196,
          left: 36,
          background: DARK,
          color: "#fff",
          borderRadius: 18,
          padding: "14px 18px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          zIndex: 3,
          boxShadow: "0 10px 30px rgba(74,100,80,0.25)",
        }}
      >
        <Icon name="Clock" size={26} />
        <span style={{ fontSize: 52, fontWeight: 800, lineHeight: 1 }}>
          {data.badgeValue}
        </span>
        <span style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.05 }}>
          {data.badgeLabel.split(" ")[0]}
          <br />
          {data.badgeLabel.split(" ").slice(1).join(" ")}
        </span>
      </div>

      {/* product */}
      <ProductImage
        src={data.imageUrl}
        style={{
          position: "absolute",
          top: 210,
          left: 60,
          width: 480,
          height: 360,
        }}
      />

      {/* features */}
      <div
        style={{
          position: "absolute",
          bottom: 150,
          left: 36,
          right: 36,
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        {data.features.slice(0, 2).map((f) => (
          <div key={f.title} style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: DARK,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name={f.icon} size={22} />
            </div>
            <div style={{ fontSize: 22, lineHeight: 1.1 }}>
              <span style={{ color: "#5c6f60" }}>{f.title}</span>
              <br />
              <span style={{ fontWeight: 800, color: DARK }}>{f.subtitle}</span>
            </div>
            <div style={{ flex: 1, height: 1, background: "rgba(74,100,80,0.25)" }} />
          </div>
        ))}
      </div>

      {/* gift card */}
      <div
        style={{
          position: "absolute",
          bottom: 28,
          right: 36,
          background: DARK,
          color: "#fff",
          borderRadius: 18,
          padding: "12px 18px",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <Icon name="Gift" size={22} />
        <span style={{ fontSize: 17, fontWeight: 700, whiteSpace: "pre-line" }}>
          {data.giftLabel}
        </span>
      </div>

      {/* decorative blobs */}
      <div
        style={{
          position: "absolute",
          top: -60,
          right: -60,
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: "rgba(94,122,100,0.12)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 40,
          left: -50,
          width: 160,
          height: 160,
          borderRadius: "50%",
          background: "rgba(94,122,100,0.1)",
        }}
      />
    </div>
  );
}
