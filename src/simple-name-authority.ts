import { NameRegistered } from "../generated/SimpleNameAuthorityDataSource/SimpleNameAuthority";
import { getAccount } from "./entities";

export function handleNameRegistered(event: NameRegistered): void {
  const account = getAccount(event.params.id);
  account.username = event.params.name;
  account.save();
}
