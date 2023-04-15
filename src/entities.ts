import { Address, BigInt } from "@graphprotocol/graph-ts";
import {
  Node,
  Account,
  Collection,
  Sequence,
  Record,
  MembershipsCollection,
  MembershipNFT,
  RecordCollector,
} from "../generated/schema";

export const getNodeById = (id: string): Node => {
  const node = Node.load(id);
  if (!node) throw new Error(`Node ${id} not found`);
  return node;
};

export const getNode = (nodeId: BigInt): Node => {
  const id = `node-${nodeId.toString()}`;
  return getNodeById(id);
};

export const getAccount = (accountId: BigInt): Account => {
  const id = `account-${accountId.toString()}`;
  const account = Account.load(id);
  if (!account) throw new Error(`Account ${id} not found`);
  return account;
};

export const getCollection = (address: Address): Collection => {
  const id = `collection-${address.toHexString()}`;
  const collection = Collection.load(id);
  if (!collection) throw new Error(`Collection ${id} not found`);
  return collection;
};

export const getMembershipsCollection = (
  address: Address
): MembershipsCollection => {
  const id = `memberships-collection-${address.toHexString()}`;
  const memberships = MembershipsCollection.load(id);
  if (!memberships) throw new Error(`MembershipsCollection ${id} not found`);
  return memberships;
};

export const getSequence = (
  collectionId: string,
  sequenceId: i32
): Sequence => {
  const id = `sequence-${collectionId}-${sequenceId.toString()}`;
  const sequence = Sequence.load(id);
  if (!sequence) throw new Error(`Sequence ${id} not found`);
  return sequence;
};

export const getRecordOrNull = (
  collectionId: string,
  tokenId: BigInt
): Record | null => {
  const id = `record-${collectionId}-${tokenId.toString()}`;
  const record = Record.load(id);
  return record;
};

export const getOrCreateRecordCollector = (
  ownerAddress: string,
  collectionId: string,
  dropNodeId: string,
  sequenceId: string
): RecordCollector => {
  const id = `record-collector-${ownerAddress}-${collectionId}-${dropNodeId}-${sequenceId}`;
  let collector = RecordCollector.load(id);
  if (collector) return collector;

  collector = new RecordCollector(id);
  collector.ownerAddress = ownerAddress;
  collector.collection = collectionId;
  collector.dropNode = dropNodeId;
  collector.sequence = sequenceId;
  collector.recordCount = 0;
  collector.createdAtTimestamp = BigInt.fromI32(0);

  return collector;
};

export const getMembershipNFT = (
  membershipsId: string,
  tokenId: BigInt
): MembershipNFT => {
  const id = `membershipNFT-${membershipsId}-${tokenId.toString()}`;
  const nft = MembershipNFT.load(id);
  if (!nft) throw new Error(`MembershipNFT ${id} not found`);
  return nft;
};
