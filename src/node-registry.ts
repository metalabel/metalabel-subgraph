import { AuthorizedManagerSet, NodeCreated, NodeMetadata } from '../generated/NodeRegistryDataSource/NodeRegistry';
import { Node, AuthorizedNodeManager } from '../generated/schema';
import { getAccount, getNode } from './entities';
import { store } from '@graphprotocol/graph-ts';

const nodeTypeToEnum = (type: i32): string => {
  switch (type) {
    case 1:
      return 'METALABEL';
    case 2:
      return 'SQUAD';
    case 3:
      return 'RELEASE';
    case 4:
      return 'DROP';
    case 5:
      return 'TREASURY';
    case 6:
      return 'SPLIT';
    default:
      return 'UNKNOWN';
  }
}


export function handleNodeCreated(event: NodeCreated): void {
  const timestamp = event.block.timestamp.toI32();
  const nodeId = event.params.id;
  const nodeType = event.params.nodeType;
  const ownerAccountId = event.params.owner;
  const parentId = event.params.parent;
  const accessNodeId = event.params.accessNode;

  const id = `node-${nodeId.toString()}`;
  const node = new Node(id);
  node.nodeId = nodeId;
  node.nodeType = nodeTypeToEnum(nodeType);
  node.metadata = '';

  if (!ownerAccountId.isZero()) {
    node.owner = getAccount(ownerAccountId).id;
  }
  if (!parentId.isZero()) {
    node.parent = getNode(parentId).id;
  }
  if (!accessNodeId.isZero()) {
    node.accessNode = getNode(accessNodeId).id;
  }

  node.createdAtTimestamp = timestamp;
  node.save();
}

export function handleNodeMetadata(event: NodeMetadata): void {
  const node = getNode(event.params.id);
  node.metadata = event.params.metadata;
  node.save();
}

export function handleAuthorizedManagerSet(event: AuthorizedManagerSet): void {
  const node = getNode(event.params.id);
  const address = event.params.manager.toHexString();
  const id = `authorized-node-manager-${node.id}-${address}`;
  const existing = AuthorizedNodeManager.load(id);

  if (existing && !event.params.isAuthorized) {
    store.remove('AuthorizedNodeManager', id);
  } else if (!existing && event.params.isAuthorized) {
    const entity = new AuthorizedNodeManager(id);
    entity.node = node.id;
    entity.address = address;
    entity.createdAtTimestamp = event.block.timestamp.toI32();
    entity.save();
  }
}
