import { RevenueModuleDeployed } from "../generated/RevenueModuleFactoryDataSource/RevenueModuleFactory";
import { RevenueModule } from "../generated/schema";
import { getNode } from "./entities";

export function handleRevenueModuleDeployed(
  event: RevenueModuleDeployed
): void {
  const timestamp = event.block.timestamp;
  const waterfallAddress = event.params.waterfall;
  const splitAddress = event.params.split;
  const node = getNode(event.params.config.controlNodeId);

  const id = `revenue-module-${waterfallAddress.toHexString()}`;
  const revMod = new RevenueModule(id);
  revMod.waterfallAddress = waterfallAddress.toHexString();
  revMod.splitAddress = splitAddress.toHexString();
  revMod.metadata = event.params.config.metadata;
  revMod.controlNode = node.id;
  revMod.waterfallRecipientAddresses = event.params.config.waterfallRecipients.map<
    string
  >((a) => a.toHexString());
  revMod.waterfallRecipientThresholds = event.params.config.waterfallThresholds;
  revMod.splitRecipientAddresses = event.params.config.splitRecipients.map<
    string
  >((a) => a.toHexString());
  revMod.splitRecipientAllocations = event.params.config.splitPercentAllocations.map<
    i32
  >((a) => a.toI32());
  revMod.createdAtTimestamp = timestamp;
  revMod.createdAtTransaction = event.transaction.hash;
  revMod.save();

  node.revenueModuleCount++;
  node.save();
}
