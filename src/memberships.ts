import { Address, store } from "@graphprotocol/graph-ts";
import { MembershipNFT } from "../generated/schema";
import {
  OwnershipTransferred,
  Transfer,
  Memberships,
} from "../generated/templates/MembershipsDatasource/Memberships";
import {
  getMembershipNFT,
  getMemberships,
  getNode,
  getNodeById,
} from "./entities";

export function handleOwnershipTransferred(event: OwnershipTransferred): void {
  const collection = getMemberships(event.address);
  collection.ownerAddress = event.params.newOwner.toHexString();
  collection.save();
}

export function handleTransfer(event: Transfer): void {
  const memberships = getMemberships(event.address);

  const isMint = event.params.from.equals(Address.zero());
  const isBurn = event.params.to.equals(Address.zero());
  const tokenId = event.params.id;
  const id = `membershipNFT-${memberships.id}-${tokenId.toString()}`;
  const owner = event.params.to.toHexString();

  if (isMint) {
    const nft = new MembershipNFT(id);
    nft.tokenId = event.params.id;
    nft.ownerAddress = owner;
    nft.memberships = memberships.id;
    nft.controlNode = memberships.controlNode;
    nft.createdAtTimestamp = event.block.timestamp;
    nft.createdAtTransaction = event.transaction.hash;
    nft.save();

    memberships.membershipNFTCount++;
    memberships.save();
  } else if (isBurn) {
    store.remove("MembershipNFT", id);
    memberships.membershipNFTCount--;
    memberships.save();
  } else {
    const nft = getMembershipNFT(memberships.id, tokenId);
    nft.ownerAddress = owner;
    nft.save();
  }
}
