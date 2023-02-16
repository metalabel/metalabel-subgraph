import { DropCreated } from "../generated/DropEngineV2DataSource/DropEngineV2";
import { getCollection, getSequence } from "./entities";

export function handleDropCreated(event: DropCreated): void {
  const collection = getCollection(event.params.collection);
  const sequence = getSequence(collection.id, event.params.sequenceId);
  sequence.price = event.params.dropData.price;
  sequence.royaltyBps = event.params.dropData.royaltyBps;
  sequence.allowContractMints = event.params.dropData.allowContractMints;
  sequence.randomizeMetadataVariants =
    event.params.dropData.randomizeMetadataVariants;
  sequence.maxRecordsPerTransaction =
    event.params.dropData.maxRecordsPerTransaction;
  sequence.revenueRecipient = event.params.dropData.revenueRecipient.toHexString();
  sequence.primarySaleFeeBps = event.params.dropData.primarySaleFeeBps;
  sequence.priceDecayPerDay = event.params.dropData.priceDecayPerDay;
  sequence.decayStopTimestamp = event.params.dropData.decayStopTimestamp;
  sequence.save();
}
