import { AccountCreated } from "../generated/AccountRegistryDataSource/AccountRegistry"
import { Account } from "../generated/schema";

export function handleAccountCreated(event: AccountCreated): void {
  const timestamp = event.block.timestamp.toI32();
  const accountId = event.params.id;
  const id = `account-${accountId.toString()}`;
  const account = new Account(id);
  account.accountId = accountId;
  account.address = event.params.subject.toHexString();
  account.recoveryAddress = event.params.recovery.toHexString();
  account.createdAtTimestamp = timestamp;
  account.save();
}
