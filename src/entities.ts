import { BigInt } from "@graphprotocol/graph-ts";
import { Node, Account } from "../generated/schema";

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
