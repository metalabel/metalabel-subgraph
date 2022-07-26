import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Account, Metalabel } from "../generated/schema";

export const getMetalabel = (metalabelId: BigInt): Metalabel => {
  const id = `metalabel-${metalabelId}`;
  let metalabel = Metalabel.load(id);
  if (metalabel != null) return metalabel;
  throw new Error(`metalabel ${metalabelId} not found`);
}

export const getOrCreateAccount = (address: Address, timestamp: BigInt): Account => {
  const accountId = `account-${address.toHexString()}`;
  let account = Account.load(accountId);
  if (account != null) return account;

  account = new Account(accountId);
  account.address = address.toHexString();
  account.createdAtTimestamp = timestamp.toI32();
  account.lastActivityAtTimestamp = timestamp.toI32();

  account.save();
  return account;
}
