import { Proto, Serialize } from "@serenityjs/raknet";
import { ZigZag } from "@serenityjs/binarystream";

import { BlockPosition } from "../types";
import { type BlockEventType, Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.BlockEvent)
class BlockEventPacket extends DataPacket {
  @Serialize(BlockPosition) public position!: BlockPosition;
  @Serialize(ZigZag) public type!: BlockEventType;
  @Serialize(ZigZag) public data!: number;
}

export { BlockEventPacket };
