import {
  NodeControllerSet,
  NodeBroadcast,
  NodeCreated,
  NodeOwnerSet,
  NodeGroupNodeSet,
  NodeParentSet,
} from "../generated/NodeRegistryDataSource/NodeRegistry";
import { Node, NodeController } from "../generated/schema";
import { getAccount, getNode } from "./entities";
import { store } from "@graphprotocol/graph-ts";

const nodeTypeToEnum = (type: i32): string => {
  switch (type) {
    case 1:
      return "METALABEL";
    case 2:
      return "RELEASE";
    default:
      return "UNKNOWN";
  }
};

export function handleNodeCreated(event: NodeCreated): void {
  const timestamp = event.block.timestamp;
  const nodeId = event.params.id;
  const nodeType = event.params.nodeType;
  const ownerAccountId = event.params.owner;
  const parentId = event.params.parent;
  const groupNodeId = event.params.groupNode;

  const id = `node-${nodeId.toString()}`;
  const node = new Node(id);
  node.nodeId = nodeId;
  node.nodeType = nodeTypeToEnum(nodeType);
  node.metadata = event.params.metadata;

  if (!ownerAccountId.isZero()) {
    node.owner = getAccount(ownerAccountId).id;
  }
  if (!parentId.isZero()) {
    const parent = getNode(parentId);
    node.parent = parent.id;
    parent.childrenCount += 1;
    parent.save();
  }
  if (!groupNodeId.isZero()) {
    const groupNode = getNode(groupNodeId);
    node.groupNode = groupNode.id;
    groupNode.groupChildrenCount += 1;
    groupNode.save();
  }

  node.collectionCount = 0;
  node.membershipsCollectionCount = 0;
  node.childrenCount = 0;
  node.groupChildrenCount = 0;
  node.controllerCount = 0;
  node.sequenceCount = 0;
  node.recordCount = 0;

  node.createdAtTimestamp = timestamp;
  node.createdAtTransaction = event.transaction.hash;
  node.save();
}

export function handleControllerSet(event: NodeControllerSet): void {
  const node = getNode(event.params.id);
  const address = event.params.controller.toHexString();
  const id = `node-controller-${node.id}-${address}`;
  const existing = NodeController.load(id);

  if (existing && !event.params.isAuthorized) {
    store.remove("NodeController", id);
    node.controllerCount -= 1;
    node.save();
  } else if (!existing && event.params.isAuthorized) {
    const entity = new NodeController(id);
    entity.node = node.id;
    entity.address = address;
    entity.createdAtTimestamp = event.block.timestamp;
    entity.createdAtTransaction = event.transaction.hash;
    entity.save();
    node.controllerCount += 1;
    node.save();
  }
}

export function handleNodeBroadcast(event: NodeBroadcast): void {
  const node = getNode(event.params.id);

  if (event.params.topic.localeCompare("metadata") === 0) {
    node.metadata = event.params.message;
    node.save();
  }
}

export function handleNodeOwnerSet(event: NodeOwnerSet): void {
  const node = getNode(event.params.id);
  node.owner = getAccount(event.params.owner).id;
  node.save();
}

export function handleNodeParentSet(event: NodeParentSet): void {
  const node = getNode(event.params.id);
  node.parent = getNode(event.params.parent).id;
  node.save();
}

export function handleGroupNodeSet(event: NodeGroupNodeSet): void {
  const node = getNode(event.params.id);
  node.groupNode = getNode(event.params.groupNode).id;
  node.save();
}
