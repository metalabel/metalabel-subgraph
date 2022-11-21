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

  sequence.dropNode = getNode(sequenceData.dropNodeId).id;
  sequence.engineAddress = sequenceData.engine.toHexString();
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
  record.etching = event.params.etching;
  record.createdAtTimestamp = event.block.timestamp;
  record.createdAtTransaction = event.transaction.hash;

  const nftContract = Collection.bind(event.address);
  record.ownerAddress = nftContract.ownerOf(record.tokenId).toHexString();

  record.save();
}

export function handleTransfer(event: Transfer): void {
  const collection = getCollection(event.address);
  const record = getRecordOrNull(collection.id, event.params.id);
  if (record === null) {
    // on mint, the RecordCreated event has not yet been emittted, so skip owner
    // updates. handleRecoredCreated will update the owner
    return;
  }

  record.ownerAddress = event.params.to.toHexString();
  record.save();
}
