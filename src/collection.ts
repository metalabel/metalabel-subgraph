import { Record, Sequence } from "../generated/schema";
import {
  OwnershipTransferred,
  RecordCreated,
  SequenceConfigured,
  Transfer,
  Collection,
} from "../generated/templates/CollectionDatasource/Collection";
import {
  getCollection,
  getNode,
  getNodeById,
  getOrCreateRecordCollector,
  getRecordOrNull,
  getSequence,
} from "./entities";

export function handleOwnershipTransferred(event: OwnershipTransferred): void {
  const collection = getCollection(event.address);
  collection.ownerAddress = event.params.newOwner.toHexString();
  collection.save();
}

export function handleSequenceConfigured(event: SequenceConfigured): void {
  const collection = getCollection(event.address);
  const sId = `sequence-${collection.id}-${event.params.sequenceId.toString()}`;
  const sequenceData = event.params.sequenceData;

  collection.sequenceCount += 1;
  collection.save();

  const node = getNode(sequenceData.dropNodeId);
  node.sequenceCount += 1;
  node.save();

  const sequence = new Sequence(sId);
  sequence.collection = collection.id;
  sequence.sequenceId = event.params.sequenceId;
  sequence.dropNode = node.id;
  sequence.engineAddress = sequenceData.engine.toHexString();
  sequence.createdAtTimestamp = event.block.timestamp;
  sequence.createdAtTransaction = event.transaction.hash;
  sequence.recordCount = 0;
  sequence.maxSupply = sequenceData.maxSupply;
  sequence.sealedAfterTimestamp = sequenceData.sealedAfterTimestamp;
  sequence.sealedBeforeTimestamp = sequenceData.sealedBeforeTimestamp;
  sequence.engineData = event.params.engineData.toHexString();

  sequence.save();
}

export function handleRecordCreated(event: RecordCreated): void {
  const collection = getCollection(event.address);
  const sequence = getSequence(collection.id, event.params.sequenceId);
  const node = getNodeById(sequence.dropNode);

  collection.recordCount += 1;
  collection.save();

  sequence.recordCount += 1;
  sequence.save();

  node.recordCount += 1;
  node.save();

  const id = `record-${collection.id}-${event.params.tokenId.toString()}`;
  const record = new Record(id);
  record.tokenId = event.params.tokenId;
  record.collection = collection.id;
  record.sequence = sequence.id;
  record.dropNode = sequence.dropNode;
  record.data = event.params.data;
  record.createdAtTimestamp = event.block.timestamp;
  record.createdAtTransaction = event.transaction.hash;

  const nftContract = Collection.bind(event.address);
  record.ownerAddress = nftContract.ownerOf(record.tokenId).toHexString();

  // collector info
  const collector = getOrCreateRecordCollector(
    record.ownerAddress,
    record.collection,
    record.dropNode,
    record.sequence
  );
  collector.recordCount += 1;
  collector.createdAtTimestamp = collector.createdAtTimestamp.isZero()
    ? event.block.timestamp
    : collector.createdAtTimestamp;
  collector.save();

  record.recordCollector = collector.id;

  record.save();
}

export function handleTransfer(event: Transfer): void {
  const collection = getCollection(event.address);
  const record = getRecordOrNull(collection.id, event.params.id);
  if (record === null) {
    // on mint, the RecordCreated event has not yet been emittted, so skip owner
    // updates. handleRecoredCreated will handle the mint case
    return;
  }

  // else, its a transfer
  const newOwner = event.params.to.toHexString();

  // decrement old collector - we don't remove collector entity if count goes
  // down to zero, gives us a way of finding older collectors if we want and can
  // always filter by count > 0
  const previousOwner = record.ownerAddress;
  const oldCollector = getOrCreateRecordCollector(
    previousOwner,
    record.collection,
    record.dropNode,
    record.sequence
  );
  oldCollector.recordCount -= 1;
  oldCollector.save();

  // increment new collector
  const newCollector = getOrCreateRecordCollector(
    newOwner,
    record.collection,
    record.dropNode,
    record.sequence
  );
  newCollector.recordCount += 1;
  // possible this is the first time the collector has been seen, so set the
  // createdAtTimestamp if it is zero
  newCollector.createdAtTimestamp = newCollector.createdAtTimestamp.isZero()
    ? event.block.timestamp
    : newCollector.createdAtTimestamp;
  newCollector.save();

  // write updates to record
  record.ownerAddress = newOwner;
  record.recordCollector = newCollector.id;
  record.save();
}
