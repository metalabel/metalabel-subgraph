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

const s = (val: string | null): string => (val === null ? "x" : val);

/**
 * Create a record collector entity
 *
 * In order to allow querying on increasingly narrow conditions (eg, collectors
 * across an entire collection vs collectors of a specific sequence), we allow
 * using nulls for sequence and drop node. An null will indicate the collector
 * entity is more broad in scope.
 *
 * This allows for some query patterns not otherwise possible, but creates some
 * ergonomic clunkiness:
 * To find collectors across a collection, explicit null must be passed for all
 * other params, else there will be multiple collectors for the same owner
 * address
 */
export const getOrCreateRecordCollector = (
  ownerAddress: string,
  collectionId: string,
  dropNodeId: string | null,
  sequenceId: string | null,
  timestamp: BigInt
): RecordCollector => {
  const id = `record-collector-${ownerAddress}-${collectionId}-${s(
    dropNodeId
  )}-${s(sequenceId)}`;
  let collector = RecordCollector.load(id);
  if (collector) return collector;

  collector = new RecordCollector(id);
  collector.ownerAddress = ownerAddress;
  collector.collection = collectionId;
  collector.dropNode = dropNodeId;
  collector.sequence = sequenceId;
  collector.recordCount = 0;
  collector.createdAtTimestamp = timestamp;

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
