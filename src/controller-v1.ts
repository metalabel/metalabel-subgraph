import { SubdomainReserved } from "../generated/ControllerV1DataSource/ControllerV1";
import { getNode } from "./entities";

export function handleSubdomainReserved(event: SubdomainReserved): void {
  const node = getNode(event.params.metalabelNodeId);
  node.reservedSubdomain = event.params.subdomain;
  node.save();
}
