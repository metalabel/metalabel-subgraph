import { Record, Sequence } from "../generated/schema";
import {
  ControlNodeSet,
  OwnershipTransferred,
  RecordCreated,
  SequenceConfigured,
  Transfer,
  Catalog,
} from "../generated/templates/CatalogDatasource/Catalog";
import { getCatalog, getNode, getRecordOrNull, getSequence } from "./entities";

export function handleOwnershipTransferred(event: OwnershipTransferred): void {
  const catalog = getCatalog(event.address);
  catalog.ownerAddress = event.params.newOwner.toHexString();
  catalog.save();
}

export function handleControlNodeSet(event: ControlNodeSet): void {
  const catalog = getCatalog(event.address);
  catalog.controlNode = getNode(event.params.controlNode).id;
  catalog.save();
}

export function handleSequenceConfigured(event: SequenceConfigured): void {
  const catalog = getCatalog(event.address);
  const sId = `sequence-${catalog.id}-${event.params.sequenceId.toString()}`;

  catalog.sequenceCount += 1;
  catalog.save();

  const node = getNode(event.params.dropId);
  node.sequenceCount += 1;
  node.save();

  const sequence = new Sequence(sId);
  sequence.catalog = catalog.id;
  sequence.sequenceId = event.params.sequenceId;
  sequence.dropNode = node.id;
  sequence.engineAddress = event.params.engine.toHexString();
  sequence.createdAtTimestamp = event.block.timestamp.toI32();
  sequence.recordCount = 0;

  sequence.dropNode = getNode(event.params.dropId).id;
  sequence.engineAddress = event.params.engine.toHexString();
  sequence.save();
}

export function handleRecordCreated(event: RecordCreated): void {
  const catalog = getCatalog(event.address);
  const sequence = getSequence(catalog.id, event.params.sequenceId);

  catalog.recordCount += 1;
  catalog.save();

  sequence.recordCount += 1;
  sequence.save();

  const id = `record-${catalog.id}-${event.params.tokenId.toString()}`;
  const record = new Record(id);
  record.tokenId = event.params.tokenId;
  record.catalog = catalog.id;
  record.sequence = sequence.id;
  record.dropNode = sequence.dropNode;
  record.data = event.params.data;
  record.etching = event.params.etching;
  record.createdAtTimestamp = event.block.timestamp.toI32();

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
