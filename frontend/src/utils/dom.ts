export const getDeepChildForNodes = (childNodes: NodeListOf<ChildNode>) => {
  const child: ChildNode[] = [];
  childNodes.forEach((node) => {
    if (!node.childNodes.length) {
      child.push(node);
    } else {
      child.push(...getDeepChildForNodes(node.childNodes));
    }
  });
  return child;
};

export const rangeCompareNode = (range: Range, node: Node) => {
  const nodeRange = node.ownerDocument!.createRange();
  try {
    nodeRange.selectNode(node);
  } catch (e) {
    nodeRange.selectNodeContents(node);
  }
  const nodeIsBefore =
    range.compareBoundaryPoints(Range.START_TO_START, nodeRange) === 1;
  const nodeIsAfter =
    range.compareBoundaryPoints(Range.END_TO_END, nodeRange) === -1;

  if (nodeIsBefore && !nodeIsAfter) return 0;
  if (!nodeIsBefore && nodeIsAfter) return 1;
  if (nodeIsBefore && nodeIsAfter) return 2;

  return 3;
};
