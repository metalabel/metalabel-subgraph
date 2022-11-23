import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Waterfall } from "../generated/schema";
import { WaterfallCreated } from "../generated/WaterfallFactoryDataSource/WaterfallFactory";
import { getNode } from "./entities";

export function handleWaterfallCreated(event: WaterfallCreated): void {
  const node = getNode(event.params.nodeId);
  const timestamp = event.block.timestamp;
  const address = event.params.waterfall;
  node.waterfallCount++;
  node.save();
  const id = `waterfall-${address.toHexString()}`;
  const waterfall = new Waterfall(id);
  waterfall.address = address.toHexString();
  waterfall.controlNode = node.id;
  waterfall.metadata = event.params.metadata;
  waterfall.nonWaterfallRecipientAddress = event.params.nonWaterfallRecipient.toHexString();

  // if token is zero address -> its ETH, leave tokenAddress as null
  const tokenAddress = event.params.token;
  if (!tokenAddress.equals(Address.zero())) {
    waterfall.tokenAddress = event.params.token.toHexString();
  }

  waterfall.recipientAddresses = event.params.recipients.map<string>((a) =>
    a.toHexString()
  );
  waterfall.recipientThresholds = event.params.thresholds;
  waterfall.createdAtTimestamp = timestamp;
  waterfall.createdAtTransaction = event.transaction.hash;
  waterfall.save();
}
