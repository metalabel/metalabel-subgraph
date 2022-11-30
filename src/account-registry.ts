import { store } from "@graphprotocol/graph-ts";
import {
  AccountBroadcast,
  AccountCreated,
  AccountIssuerSet,
  AccountTransfered,
} from "../generated/AccountRegistryDataSource/AccountRegistry";
import { Account, AuthorizedAccountIssuer } from "../generated/schema";
import { getAccount } from "./entities";

export function handleAccountCreated(event: AccountCreated): void {
  const timestamp = event.block.timestamp;
  const accountId = event.params.id;
  const id = `account-${accountId.toString()}`;
  const account = new Account(id);
  account.accountId = accountId;
  account.address = event.params.subject.toHexString();
  account.metadata = event.params.metadata;
  account.createdAtTimestamp = timestamp;
  account.createdAtTransaction = event.transaction.hash;
  account.save();
}

export function handleAccountBroadcast(event: AccountBroadcast): void {
  const account = getAccount(event.params.id);

  if (event.params.topic.localeCompare("metadata") === 0) {
    account.metadata = event.params.message;
    account.save();
  }
}

export function handleAccountTransfered(event: AccountTransfered): void {
  const account = getAccount(event.params.id);
  account.address = event.params.newOwner.toHexString();
  account.save();
}

export function handleAccountIssuerSet(event: AccountIssuerSet): void {
  const address = event.params.issuer;
  const id = `authorized-account-issuer-${address.toHexString()}`;
  const existing = AuthorizedAccountIssuer.load(id);

  // there and removed -> delete
  if (existing && !event.params.authorized) {
    store.remove("AuthorizedAccountIssuer", id);
  }
  // not there and added -> create
  else if (!existing && event.params.authorized) {
    const entity = new AuthorizedAccountIssuer(id);
    entity.address = address.toHexString();
    entity.createdAtTimestamp = event.block.timestamp;
    entity.createdAtTransaction = event.transaction.hash;
    entity.save();
  }
}
