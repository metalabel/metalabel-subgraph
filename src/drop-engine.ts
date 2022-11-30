import { DropCreated } from "../generated/DropEngineDataSource/DropEngine";
import { getCollection, getSequence } from "./entities";

export function handleDropCreated(event: DropCreated): void {
  const collection = getCollection(event.params.collection);
  const sequence = getSequence(collection.id, event.params.sequenceId);
  sequence.unitPrice = event.params.price;
  sequence.revenueRecipient = event.params.recipient.toHexString();
  sequence.royaltyBps = event.params.royaltyBps;
  sequence.uriPrefix = event.params.uriPrefix;
  sequence.save();
}
