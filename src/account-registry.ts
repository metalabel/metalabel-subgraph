import {
  AccountBroadcast,
  AccountCreated,
  AccountRecoverySet,
  AccountTransfered,
} from "../generated/AccountRegistryDataSource/AccountRegistry";
import { Account } from "../generated/schema";
import { getAccount } from "./entities";

export function handleAccountCreated(event: AccountCreated): void {
  const timestamp = event.block.timestamp;
  const accountId = event.params.id;
  const id = `account-${accountId.toString()}`;
  const account = new Account(id);
  account.accountId = accountId;
  account.address = event.params.subject.toHexString();
  account.recoveryAddress = event.params.recovery.toHexString();
  account.createdAtTimestamp = timestamp;
  account.createdAtTransaction = event.transaction.hash;
  account.metadata = event.params.metadata;
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

export function handleAccountRecoverySet(event: AccountRecoverySet): void {
  const account = getAccount(event.params.id);
  account.recoveryAddress = event.params.newRecoveryAddress.toHexString();
  account.save();
}
