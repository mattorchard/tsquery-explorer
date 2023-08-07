import { Component, For, Show, createSignal } from "solid-js";
import { IndexRange, TsNode } from "../types";
import { getProperties } from "../../tsquery/src/traverse";
import { ExpandChevron } from "./ExpandChevron";

export const NodeViewer: Component<{
  node: TsNode;
  onPointer: (indexRange: IndexRange) => void;
  depth: number;
}> = (props) => {
  const nodeProperties = getProperties(props.node);
  const childNodes = props.node.getChildren();
  const isExpandable = !!childNodes?.length;
  const expandedByDefault = isExpandable && props.depth < AUTO_EXPAND_DEPTH;
  const [isExpanded, setIsExpanded] = createSignal(expandedByDefault);
  const toggleExpansion = () => {
    setIsExpanded((e) => !e);
  };

  const indexRange = {
    startIndex: props.node.getStart(),
    endIndex: props.node.getEnd(),
  };

  if (isIgnorableNode(nodeProperties.kindName)) return null;

  return (
    <div onPointerEnter={() => props.onPointer(indexRange)}>
      <button
        type="button"
        onClick={toggleExpansion}
        disabled={!isExpandable}
        class="flex w-full items-center px-2 text-start transition-colors hover:bg-slate-800"
      >
        <Show when={isExpandable}>
          <span class="pe-1">
            <ExpandChevron isOpen={isExpanded()} />
          </span>
        </Show>
        <span classList={{ "text-white/70": isExpandable }}>
          {nodeProperties.kindName}
        </span>
        <span class="ml-auto flex gap-1 pl-1 text-white/90">
          {nodeProperties.name && <em>{nodeProperties.name}</em>}
          {nodeProperties.value !== undefined && (
            <em>{`${nodeProperties.value}`}</em>
          )}
        </span>
      </button>
      <Show when={isExpanded()}>
        <ol class="border-l-[1px] border-dashed border-transparent ps-1 transition-colors hover:border-white/40">
          <For each={childNodes}>
            {(node) => (
              <li>
                <NodeViewer
                  node={node}
                  onPointer={props.onPointer}
                  depth={props.depth + 1}
                />
              </li>
            )}
          </For>
        </ol>
      </Show>
    </div>
  );
};

const isIgnorableNode = (kind: string) =>
  kind.endsWith("Token") || kind.endsWith("Keyword");

const AUTO_EXPAND_DEPTH = 10;
