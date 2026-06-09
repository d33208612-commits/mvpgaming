import type { CardData, TemplateId } from "../../lib/types";
import { GamepadTemplate } from "./GamepadTemplate";
import { FenTemplate } from "./FenTemplate";
import { AirpodsTemplate } from "./AirpodsTemplate";
import { ToothpasteTemplate } from "./ToothpasteTemplate";
import { CARD_W, CARD_H } from "./shared";

export { CARD_W, CARD_H };

export function TemplateRenderer({
  template,
  data,
}: {
  template: TemplateId;
  data: CardData;
}) {
  switch (template) {
    case "fen":
      return <FenTemplate data={data} />;
    case "airpods":
      return <AirpodsTemplate data={data} />;
    case "toothpaste":
      return <ToothpasteTemplate data={data} />;
    case "gamepad":
    default:
      return <GamepadTemplate data={data} />;
  }
}
