import { Record, Sequence } from "../generated/schema";
import {
  ControlNodeSet,
  OwnershipTransferred,
  RecordCreated,
  SequenceConfigured,
  Transfer,
  Catalog,
} from "../generated/templates/CatalogDatasource/Catalog";
import {
  getCatalog,
  getNode,
  getNodeById,
  getRecordOrNull,
  getSequence,
} from "./entities";

export function handleOwnershipTransferred(event: OwnershipTransferred): void {
  const catalog = getCatalog(event.address);
  catalog.ownerAddress = event.params.newOwner.toHexString();
  catalog.save();
}

export function handleControlNodeSet(event: ControlNodeSet): void {
  const catalog = getCatalog(event.address);

  if (catalog.controlNode != "") {
    const oldNode = getNodeById(catalog.controlNode);
    oldNode.catalogCount -= 1;
    oldNode.save();
  }

  const node = getNode(event.params.controlNode);
  catalog.controlNode = node.id;

  node.catalogCount += 1;
  node.save();

  catalog.save();
}

export function handleSequenceConfigured(event: SequenceConfigured): void {
  const catalog = getCatalog(event.address);
  const sId = `sequence-${catalog.id}-${event.params.sequenceId.toString()}`;
  const sequenceData = event.params.sequenceData;

  catalog.sequenceCount += 1;
  catalog.save();

  const node = getNode(sequenceData.dropId);
  node.sequenceCount += 1;
  node.save();

  const sequence = new Sequence(sId);
  sequence.catalog = catalog.id;
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

  sequence.dropNode = getNode(sequenceData.dropId).id;
  sequence.engineAddress = sequenceData.engine.toHexString();
  sequence.save();
}

export function handleRecordCreated(event: RecordCreated): void {
  const catalog = getCatalog(event.address);
  const sequence = getSequence(catalog.id, event.params.sequenceId);
  const node = getNodeById(sequence.dropNode);

  catalog.recordCount += 1;
  catalog.save();

  sequence.recordCount += 1;
  sequence.save();

  node.recordCount += 1;
  node.save();

  const id = `record-${catalog.id}-${event.params.tokenId.toString()}`;
  const record = new Record(id);
  record.tokenId = event.params.tokenId;
  record.catalog = catalog.id;
  record.sequence = sequence.id;
  record.dropNode = sequence.dropNode;
  record.data = event.params.data;
  record.etching = event.params.etching;
  record.createdAtTimestamp = event.block.timestamp;
  record.createdAtTransaction = event.transaction.hash;

  const collection = Catalog.bind(event.address);
  record.ownerAddress = collection.ownerOf(record.tokenId).toHexString();

  record.save();
}

export function handleTransfer(event: Transfer): void {
  const catalog = getCatalog(event.address);
  const record = getRecordOrNull(catalog.id, event.params.id);
  if (record === null) {
    // on mint, the RecordCreated event has not yet been emittted, so skip owner
    // updates. handleRecoredCreated will update the owner
    return;
  }

  record.ownerAddress = event.params.to.toHexString();
  record.save();
}
