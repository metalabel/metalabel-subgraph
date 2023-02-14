import { Address, store } from "@graphprotocol/graph-ts";
import { MembershipNFT } from "../generated/schema";
import {
  OwnershipTransferred,
  Transfer,
} from "../generated/templates/MembershipsDatasource/Memberships";
import { getMembershipNFT, getMembershipsCollection } from "./entities";

export function handleOwnershipTransferred(event: OwnershipTransferred): void {
  const collection = getMembershipsCollection(event.address);
  collection.ownerAddress = event.params.newOwner.toHexString();
  collection.save();
}

export function handleTransfer(event: Transfer): void {
  const membershipsCollection = getMembershipsCollection(event.address);

  const isMint = event.params.from.equals(Address.zero());
  const isBurn = event.params.to.equals(Address.zero());
  const tokenId = event.params.id;
  const id = `membershipNFT-${membershipsCollection.id}-${tokenId.toString()}`;
  const owner = event.params.to.toHexString();

  if (isMint) {
    const nft = new MembershipNFT(id);
    nft.tokenId = event.params.id;
    nft.ownerAddress = owner;
    nft.membershipsCollection = membershipsCollection.id;
    nft.controlNode = membershipsCollection.controlNode;
    nft.createdAtTimestamp = event.block.timestamp;
    nft.createdAtTransaction = event.transaction.hash;
    nft.save();

    membershipsCollection.membershipNFTCount++;
    membershipsCollection.save();
  } else if (isBurn) {
    store.remove("MembershipNFT", id);
    membershipsCollection.membershipNFTCount--;
    membershipsCollection.save();
  } else {
    const nft = getMembershipNFT(membershipsCollection.id, tokenId);
    nft.ownerAddress = owner;
    nft.save();
  }
}
