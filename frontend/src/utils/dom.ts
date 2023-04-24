import _ from "lodash";
import Mark from "mark.js";

export const getDeepChildForNodes = (childNodes: NodeListOf<Node>) => {
  const child: Node[] = [];
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

export const getMarkNodeAttributes = (node: Node) => {
  if (node.parentElement?.tagName !== "MARK") {
    return;
  }
  const id = node.parentElement.getAttribute("id");
  const index = node.parentElement.getAttribute("data-index");
  if (!id || !index) {
    return;
  }
  return {
    id,
    index,
  };
};

export const getNodesTextContentLength = (nodes: Node[]) =>
  nodes.reduce((acc, n) => (acc += n.textContent?.length ?? 0), 0);

export const getTextNodesWithinSelectRange = (
  articleDiv: HTMLDivElement | null,
  range: Range,
  nodes: Node[]
) => {
  return nodes.filter(
    (n) =>
      n.nodeType === Node.TEXT_NODE &&
      n.textContent?.length &&
      rangeCompareNode(range, n) === 3 &&
      articleDiv?.contains(n)
  );
};

export const getMarkLengthBySelectRange = (
  articleDiv: HTMLDivElement | null,
  range: Range,
  withinRangeNodes: Node[]
) => {
  if (!articleDiv) {
    return 0;
  }
  const { startOffset, endOffset, startContainer, endContainer } = range;
  const isStartContainerSelectable = articleDiv.contains(startContainer);
  const isEndContainerSelectable = articleDiv.contains(endContainer);
  const isOneContainerSelected = startContainer.isSameNode(endContainer);
  const startContainerMarkId = getMarkNodeAttributes(startContainer);
  const endContainerMarkId = getMarkNodeAttributes(endContainer);

  const startMarkLength = startContainerMarkId
    ? getNodesTextContentLength([startContainer])
    : 0;
  const endMarkLength = endContainerMarkId
    ? getNodesTextContentLength([endContainer])
    : 0;

  if (isOneContainerSelected) {
    // Check if container is a part of article body
    if (!articleDiv.contains(startContainer)) {
      return 0;
    } else {
      return endOffset - startOffset;
    }
  } else {
    const selectInStartContainerLength = !isStartContainerSelectable
      ? 0
      : startMarkLength
      ? startMarkLength
      : getNodesTextContentLength([startContainer]) - startOffset;
    const betweenTextLength = getNodesTextContentLength(withinRangeNodes);
    const selectInEndContainerLength = !isEndContainerSelectable
      ? 0
      : endMarkLength
      ? endMarkLength
      : endOffset;
    return (
      selectInStartContainerLength +
      betweenTextLength +
      selectInEndContainerLength
    );
  }
};

export const findMarkedNodes = (nodes: Node[]) => {
  const marksToRemove = new Set<{ id: string; index: string }>();
  nodes.forEach((n) => {
    const markId = getMarkNodeAttributes(n);
    if (markId) {
      marksToRemove.add(markId);
    }
  });
  return marksToRemove;
};

export const setMarkAsSelected = (
  articleDiv: HTMLDivElement | null,
  markId: string
) => {
  articleDiv?.querySelectorAll(`#${markId}`).forEach((n) => {
    n.setAttribute("selected", "true");
  });
};

export const setMarkAsNotSelected = (
  articleDiv: HTMLDivElement | null,
  markId: string
) => {
  articleDiv?.querySelectorAll(`#${markId}[selected]`).forEach((n) => {
    n.removeAttribute("selected");
  });
};

export const unmark = (
  markjs: Mark | null,
  marks:
    | Array<{ id: string; index?: string }>
    | Iterable<{ id: string; index?: string }>
) => {
  if (!markjs) return;
  return Promise.all(
    Array.from(marks).map(
      ({ id, index }) =>
        new Promise((res) => {
          markjs.unmark({
            element: `#${id}`,
            index,
            done: () => {
              res("");
            },
          });
        })
    )
  );
};

export const formatHtml = (html: string) => {
  // formats article html code as if it was really inserted to the document
  const fakeDiv = window.document.createElement("div");
  fakeDiv.innerHTML = html;
  const originalHtml = fakeDiv.innerHTML;
  return originalHtml;
};

export const isSelectionRangesEqual = (aRanges: Range[], bRanges: Range[]) => {
  if (aRanges.length !== bRanges.length) {
    return false;
  }
  const notEqualRanages = aRanges.filter(
    (a) =>
      !bRanges.find(
        (b) =>
          b.startOffset === a.startOffset &&
          b.endOffset === a.endOffset &&
          b.startContainer === a.startContainer &&
          b.endContainer === a.endContainer
      )
  );
  return !notEqualRanages.length;
};

export const getSelectionRanges = (selection: Selection | null) => {
  if (!selection) return [];
  const ranges: Range[] = [];
  for (const i of _.range(0, selection.rangeCount)) {
    const range = selection?.getRangeAt(i);
    if (range) {
      ranges.push(range);
    }
  }
  return ranges;
};
