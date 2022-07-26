import { store } from "@graphprotocol/graph-ts";
import { AdapterRegistration, MetalabelCreated } from "../generated/CoreDataSource/Core";
import { Adapter, Metalabel } from "../generated/schema";
import { getOrCreateAccount } from "./entities";

export function handleAdapterRegistration(event: AdapterRegistration): void {
  const timestamp = event.block.timestamp;
  const address = event.params.adapter.toHexString();
  const id = `adapter-${address}`;
  if (event.params.isRegistered) {
    const adapter = new Adapter(id);
    adapter.address = address;
    adapter.createdAtTimestamp = timestamp.toI32();
    adapter.save();
  } else {
    store.remove('Adapter', id);
  }
}

export function handleMetalabelCreated(event: MetalabelCreated): void {
  const timestamp = event.block.timestamp;
  const metalabelId = event.params.metalabelId;

  const admin = getOrCreateAccount(event.params.admin, timestamp);
  admin.lastActivityAtTimestamp = timestamp.toI32();
  admin.save();

  const metalabel = new Metalabel(`metalabel-${metalabelId}`);
  metalabel.metalabelId = metalabelId;
  metalabel.admin = admin.id;
  metalabel.metadataUri = event.params.metadataUri;
  metalabel.createdAtTimestamp = timestamp.toI32();
  metalabel.lastActivityAtTimestamp = timestamp.toI32();

  metalabel.save();
}
