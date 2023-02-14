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
  const node = getNode(collectionContract.controlNode());

  collection.address = address.toHexString();
  collection.name = collectionContract.name();
  collection.symbol = collectionContract.symbol();
  collection.ownerAddress = collectionContract.owner().toHexString();
  collection.controlNode = node.id;
  collection.recordCount = 0;
  collection.sequenceCount = 0;
  collection.createdAtTimestamp = timestamp;
  collection.createdAtTransaction = event.transaction.hash;
  collection.recordCount = 0;
  collection.sequenceCount = 0;
  collection.save();

  node.collectionCount++;
  node.save();

  // save and spawn new datasource for this catalog
  CollectionDataSource.create(address);
}
