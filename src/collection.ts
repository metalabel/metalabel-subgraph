import { Record, Sequence, Collection, Node } from "../generated/schema";
import {
  OwnershipTransferred,
  RecordCreated,
  SequenceConfigured,
  Transfer,
  Collection as CollectionContract,
} from "../generated/templates/CollectionDatasource/Collection";
import {
  getCollection,
  getNode,
  getNodeById,
  getOrCreateRecordCollector,
  getRecordOrNull,
  getSequence,
} from "./entities";
import { BigInt } from "@graphprotocol/graph-ts";

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
  sequence.recordCollectorCount = 0;
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

  node.recordCount += 1;
  node.save();

  sequence.recordCount += 1;
  sequence.save();

  const id = `record-${collection.id}-${event.params.tokenId.toString()}`;
  const record = new Record(id);
  record.tokenId = event.params.tokenId;
  record.collection = collection.id;
  record.sequence = sequence.id;
  record.dropNode = sequence.dropNode;
  record.data = event.params.data;
  record.createdAtTimestamp = event.block.timestamp;
  record.createdAtTransaction = event.transaction.hash;

  const nftContract = CollectionContract.bind(event.address);
  record.ownerAddress = nftContract.ownerOf(record.tokenId).toHexString();

  // collector info
  incrementRecordCountForCollector(
    record.ownerAddress,
    record.collection,
    record.dropNode,
    record.sequence,
    event.block.timestamp
  );
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
  decrementRecordCountForCollector(
    previousOwner,
    record.collection,
    record.dropNode,
    record.sequence,
    event.block.timestamp
  );

  // increment new collector
  incrementRecordCountForCollector(
    newOwner,
    record.collection,
    record.dropNode,
    record.sequence,
    event.block.timestamp
  );

  // write updates to record
  record.ownerAddress = newOwner;
  record.save();
}

/**
 * Increments record count for all scoped record collector entities
 *
 * If the record count for a collector goes to 1, we increment the record
 * collector count on the associated collection / node / sequence
 */
function incrementRecordCountForCollector(
  ownerAddress: string,
  collectionId: string,
  dropNodeId: string,
  sequenceId: string,
  timestamp: BigInt
): void {
  // sequence scope
  const s_collector = getOrCreateRecordCollector(
    ownerAddress,
    collectionId,
    dropNodeId,
    sequenceId,
    timestamp
  );
  s_collector.recordCount += 1;
  s_collector.save();
  if (s_collector.recordCount === 1) {
    const sequence = Sequence.load(sequenceId);
    if (!sequence) throw new Error(`sequence not found: ${sequenceId}`);
    sequence.recordCollectorCount += 1;
    sequence.save();
  }

  // node scope
  const n_collector = getOrCreateRecordCollector(
    ownerAddress,
    collectionId,
    dropNodeId,
    null,
    timestamp
  );
  n_collector.recordCount += 1;
  n_collector.save();
  if (n_collector.recordCount === 1) {
    const node = Node.load(dropNodeId);
    if (!node) throw new Error(`node not found: ${dropNodeId}`);
    node.recordCollectorCount += 1;
    node.save();
  }

  // collection scope
  const collector = getOrCreateRecordCollector(
    ownerAddress,
    collectionId,
    null,
    null,
    timestamp
  );
  collector.recordCount += 1;
  collector.save();
  if (collector.recordCount === 1) {
    const collection = Collection.load(collectionId);
    if (!collection) throw new Error(`collection not found: ${dropNodeId}`);
    collection.recordCollectorCount += 1;
    collection.save();
  }
}

/**
 * Decrements counts for all scoped record collector entities
 *
 * If the record count for a collector goes to zero, we decrement the record
 * collector count on the associated collection / node / sequence
 *
 * Not deleting the entity, as it's interesting to see the count = 0 old
 * collectors. This means there will be more collector entities than the
 * collector count, but that's ok
 */
function decrementRecordCountForCollector(
  ownerAddress: string,
  collectionId: string,
  dropNodeId: string,
  sequenceId: string,
  timestamp: BigInt
): void {
  // sequence scope
  const s_collector = getOrCreateRecordCollector(
    ownerAddress,
    collectionId,
    dropNodeId,
    sequenceId,
    timestamp
  );
  s_collector.recordCount -= 1;
  s_collector.save();
  if (s_collector.recordCount === 0) {
    const sequence = Sequence.load(sequenceId);
    if (!sequence) throw new Error(`Sequence not found: ${sequenceId}`);
    sequence.recordCollectorCount -= 1;
    sequence.save();
  }

  // node scope
  const n_collector = getOrCreateRecordCollector(
    ownerAddress,
    collectionId,
    dropNodeId,
    null,
    timestamp
  );
  n_collector.recordCount -= 1;
  n_collector.save();
  if (n_collector.recordCount === 0) {
    const node = Node.load(dropNodeId);
    if (!node) throw new Error(`Node not found: ${dropNodeId}`);
    node.recordCollectorCount -= 1;
    node.save();
  }

  // collection scope
  const collector = getOrCreateRecordCollector(
    ownerAddress,
    collectionId,
    null,
    null,
    timestamp
  );
  collector.recordCount -= 1;
  collector.save();
  if (collector.recordCount === 0) {
    const collection = Collection.load(collectionId);
    if (!collection) throw new Error(`Collection not found: ${collectionId}`);
    collection.recordCollectorCount -= 1;
    collection.save();
  }
}
