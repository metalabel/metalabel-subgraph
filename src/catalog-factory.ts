import { CatalogCreated } from "../generated/CatalogFactoryDataSource/CatalogFactory";
import { Catalog } from "../generated/schema";
import { CatalogDataSource } from "../generated/templates";

export function handleCatalogCreated(event: CatalogCreated): void {
  const timestamp = event.block.timestamp;
  const address = event.params.catalog;
  const id = `catalog-${address.toHexString()}`;
  const catalog = new Catalog(id);
  catalog.address = address.toHexString();
  catalog.name = event.params.name;
  catalog.symbol = event.params.symbol;
  catalog.ownerAddress = ""; // will be set in handleOwnershipTransferred
  catalog.controlNode = ""; // will be set in handleControlNodeChanged
  catalog.createdAtTimestamp = timestamp;
  catalog.createdAtTransaction = event.transaction.hash;
  catalog.recordCount = 0;
  catalog.sequenceCount = 0;
  catalog.save();

  // spawn new datasource for this catalog
  CatalogDataSource.create(address);
}
