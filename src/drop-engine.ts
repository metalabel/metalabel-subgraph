import { Address } from "@graphprotocol/graph-ts";
import {
  DropCreated,
  PublicMintEnabled,
} from "../generated/DropEngineDataSource/DropEngine";
import { getCollection, getSequence } from "./entities";

export function handleDropCreated(event: DropCreated): void {
  const collection = getCollection(event.params.collection);
  const sequence = getSequence(collection.id, event.params.sequenceId);
  sequence.unitPrice = event.params.price;
  sequence.revenueRecipient = event.params.recipient.toHexString();
  sequence.royaltyBps = event.params.royaltyBps;
  sequence.uriPrefix = event.params.uriPrefix;

  sequence.isPublicMint = event.params.mintAuthority.equals(Address.zero());
  if (!sequence.isPublicMint) {
    sequence.mintAuthority = event.params.mintAuthority.toHexString();
  }

  sequence.save();
}

export function handlePublicMintEnabled(event: PublicMintEnabled): void {
  const collection = getCollection(event.params.collection);
  const sequence = getSequence(collection.id, event.params.sequenceId);
  sequence.isPublicMint = true;
  sequence.mintAuthority = null;
  sequence.save();
}
