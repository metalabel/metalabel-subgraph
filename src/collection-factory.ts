import { CollectionCreated } from "../generated/CollectionFactoryDataSource/CollectionFactory";
import { Collection as CollectionContract } from "../generated/templates/CollectionDataSource/Collection";
import { Collection } from "../generated/schema";
import { CollectionDataSource } from "../generated/templates";
import { getNode } from "./entities";

export function handleCollectionCreated(event: CollectionCreated): void {
  const timestamp = event.block.timestamp;
  const address = event.params.collection;
  const id = `collection-${address.toHexString()}`;
  const collection = new Collection(id);

  const collectionContract = CollectionContract.bind(address);

  collection.address = address.toHexString();
  collection.name = collectionContract.name();
  collection.symbol = collectionContract.symbol();
  collection.ownerAddress = collectionContract.owner().toHexString();
  collection.recordCount = 0;
  collection.sequenceCount = 0;
  collection.createdAtTimestamp = timestamp;
  collection.createdAtTransaction = event.transaction.hash;

  const controlNodeId = collectionContract.controlNode();
  collection.controlNode = getNode(controlNodeId).id;

  // save and spawn new datasource for this catalog
  collection.save();
  // CollectionDataSource.create(address);
}
