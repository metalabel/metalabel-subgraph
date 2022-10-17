import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Node, Account, Catalog, Sequence, Record } from "../generated/schema";

export const getNode = (nodeId: BigInt): Node => {
  const id = `node-${nodeId.toString()}`;
  const node = Node.load(id);
  if (!node) throw new Error(`Node ${id} not found`);
  return node;
}

export const getAccount = (accountId: BigInt): Account => {
  const id = `account-${accountId.toString()}`;
  const account = Account.load(id);
  if (!account) throw new Error(`Account ${id} not found`);
  return account;
}

export const getCatalog = (address: Address): Catalog => {
  const id = `catalog-${address.toHexString()}`;
  const catalog = Catalog.load(id);
  if (!catalog) throw new Error(`Catalog ${id} not found`);
  return catalog;
}

export const getSequence = (catalogId: string, sequenceId: i32): Sequence => {
  const id = `sequence-${catalogId}-${sequenceId.toString()}`;
  const sequence = Sequence.load(id);
  if (!sequence) throw new Error(`Sequence ${id} not found`);
  return sequence;
}

export const getRecordOrNull = (catalogId: string, tokenId: BigInt): Record | null=> {
  const id = `record-${catalogId}-${tokenId.toString()}`;
  const record = Record.load(id);
  return record;
}
