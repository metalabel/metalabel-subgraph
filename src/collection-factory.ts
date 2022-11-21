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
  const controlNodeId = collectionContract.controlNode();
  collection.controlNode = getNode(controlNodeId).id;

  collection.address = address.toHexString();
  collection.name = event.params.name;
  collection.symbol = event.params.symbol;
  collection.ownerAddress = ""; // will be set in handleOwnershipTransferred
  collection.createdAtTimestamp = timestamp;
  collection.createdAtTransaction = event.transaction.hash;
  collection.recordCount = 0;
  collection.sequenceCount = 0;
  collection.save();

  // spawn new datasource for this catalog
  CollectionDataSource.create(address);
}
