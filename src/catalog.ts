import { Record, Sequence } from '../generated/schema';
import { ControlNodeSet, OwnershipTransferred, RecordCreated, SequenceConfigured } from '../generated/templates/CatalogDatasource/Catalog';
import { getCatalog, getNode, getSequence } from './entities';

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

  let sequence = Sequence.load(sId);
  if (!sequence) {
    sequence = new Sequence(sId);
    sequence.catalog = catalog.id;
    sequence.sequenceId = event.params.sequenceId;
    sequence.dropNode = getNode(event.params.dropId).id;
    sequence.engineAddress = event.params.engine.toHexString();
    sequence.createdAtTimestamp = event.block.timestamp.toI32();
  }

  sequence.dropNode = getNode(event.params.dropId).id;
  sequence.engineAddress = event.params.engine.toHexString();
  sequence.save();
}

export function handleRecordCreated(event: RecordCreated): void {
  const catalog = getCatalog(event.address);

  const id = `record-${catalog.id}-${event.params.tokenId.toString()}`;
  const record = new Record(id);
  record.tokenId = event.params.tokenId;
  record.catalog = catalog.id;
  record.sequence = getSequence(catalog.id, event.params.sequenceId).id;
  record.data = event.params.data;
  record.etching = event.params.etching;
  record.createdAtTimestamp = event.block.timestamp.toI32();
  record.save();
}
