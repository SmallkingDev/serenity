import { Uint8, VarLong } from '@serenityjs/binarystream';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket';
import { Packet as PacketId, RespawnState } from '../enums';
import { Vec3f, Vector3f } from '../types';

@Packet(PacketId.Respawn)
class Respawn extends DataPacket {
	@Serialize(Vector3f) public position!: Vec3f;
	@Serialize(Uint8) public state!: RespawnState;
	@Serialize(VarLong) public runtimeEntityId!: bigint;
}

export { Respawn };