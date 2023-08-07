import { Component, For, Show, createSignal } from "solid-js";
import { IndexRange, TsNode } from "../types";
import { getProperties } from "../../tsquery/src/traverse";

export const NodeViewer: Component<{
  node: TsNode;
  onPointer: (indexRange: IndexRange) => void;
}> = (props) => {
  const nodeProperties = getProperties(props.node);
  const childNodes = props.node.getChildren();
  const isExpandable = !!childNodes?.length;

  const [isExpanded, setIsExpanded] = createSignal(false);
  const toggleExpansion = () => {
    setIsExpanded((e) => !e);
  };

  const indexRange = {
    startIndex: props.node.getStart(),
    endIndex: props.node.getEnd(),
  };

  return (
    <div onPointerEnter={() => props.onPointer(indexRange)}>
      <button
        type="button"
        onClick={toggleExpansion}
        disabled={!isExpandable}
        classList={{ underline: isExpandable }}
      >
        {nodeProperties.kindName}
        {nodeProperties.name && <em class="pl-2">{nodeProperties.name}</em>}
      </button>
      <Show when={isExpanded()}>
        <ol class="px-2">
          <For each={childNodes}>
            {(node) => (
              <li>
                <NodeViewer node={node} onPointer={props.onPointer} />
              </li>
            )}
          </For>
        </ol>
      </Show>
    </div>
  );
};
