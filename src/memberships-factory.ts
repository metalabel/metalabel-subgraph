import { MembershipsCreated } from "../generated/MembershipsFactoryDataSource/MembershipsFactory";
import { Memberships as MembershipsContract } from "../generated/templates/MembershipsDataSource/Memberships";
import { MembershipsCollection } from "../generated/schema";
import { MembershipsDataSource } from "../generated/templates";
import { getNode } from "./entities";

export function handleMembershipsCreated(event: MembershipsCreated): void {
  const timestamp = event.block.timestamp;
  const address = event.params.memberships;
  const id = `memberships-collection-${address.toHexString()}`;
  const memberships = new MembershipsCollection(id);
  const membershipsContract = MembershipsContract.bind(address);
  const node = getNode(membershipsContract.controlNode());

  memberships.address = address.toHexString();
  memberships.name = membershipsContract.name();
  memberships.symbol = membershipsContract.symbol();
  memberships.ownerAddress = membershipsContract.owner().toHexString();
  memberships.controlNode = node.id;
  memberships.createdAtTimestamp = timestamp;
  memberships.createdAtTransaction = event.transaction.hash;
  memberships.membershipNFTCount = 0;
  memberships.save();

  node.membershipsCollectionCount++;
  node.save();

  // save and spawn new datasource for this catalog
  MembershipsDataSource.create(address);
}
