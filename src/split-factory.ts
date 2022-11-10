import { Split } from "../generated/schema";
import { SplitCreated } from "../generated/SplitFactoryDataSource/SplitFactory";
import { getNode } from "./entities";

export function handleSplitCreated(event: SplitCreated): void {
  const node = getNode(event.params.nodeId);
  const timestamp = event.block.timestamp;
  const address = event.params.split;
  node.splitCount++;
  node.save();
  const id = `split-${address.toHexString()}`;
  const split = new Split(id);
  split.address = address.toHexString();
  split.controlNode = node.id;
  split.metadata = event.params.metadata;

  split.recipientAddresses = event.params.accounts.map<string>((a) =>
    a.toHexString()
  );
  split.recipientAllocations = event.params.percentAllocations.map<i32>((a) =>
    a.toI32()
  );
  split.createdAtTimestamp = timestamp;
  split.createdAtTransaction = event.transaction.hash;
  split.save();
}
