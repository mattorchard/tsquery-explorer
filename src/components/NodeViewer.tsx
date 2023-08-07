import { Component, For, Show, createSignal } from "solid-js";
import { IndexRange, TsNode, TsNodeProperties } from "../types";
import { getProperties } from "../../tsquery/src/traverse";
import { ExpandChevron } from "./ExpandChevron";

export const NodeViewer: Component<{
  node: TsNode;
  onPointer: (indexRange: IndexRange) => void;
  depth: number;
}> = (props) => {
  const nodeProperties = getProperties(props.node);

  if (isIgnorableNode(nodeProperties.kindName)) return null;

  if (isPassThroughNode(nodeProperties.kindName)) {
    const childNodes = props.node.getChildren();
    return (
      <>
        <For each={childNodes}>
          {(childNode) => (
            <NodeViewer
              node={childNode}
              onPointer={props.onPointer}
              depth={props.depth + 1}
            />
          )}
        </For>
      </>
    );
  }

  return (
    <DetailedNodeViewer
      nodeProperties={nodeProperties}
      node={props.node}
      onPointer={props.onPointer}
      depth={props.depth}
    />
  );
};

const DetailedNodeViewer: Component<{
  node: TsNode;
  nodeProperties: TsNodeProperties;
  onPointer: (indexRange: IndexRange) => void;
  depth: number;
}> = (props) => {
  const childNodes = props.node.getChildren();
  const isExpandable = !!childNodes?.length;
  const expandedByDefault = isExpandable && props.depth < AUTO_EXPAND_DEPTH;
  const [isExpanded, setIsExpanded] = createSignal(expandedByDefault);

  const toggleExpansion = () => {
    setIsExpanded((e) => !e);
  };

  const handleKeyDown = isExpandable
    ? (e: KeyboardEvent) => {
        switch (e.key) {
          case "ArrowRight":
            setIsExpanded(true);
            break;
          case "ArrowLeft":
            setIsExpanded(false);
            break;
        }
      }
    : undefined;

  const handleInteract = () => props.onPointer(indexRange);

  const indexRange = {
    startIndex: props.node.getStart(),
    endIndex: props.node.getEnd(),
  };

  return (
    <div
      onPointerOver={handleInteract}
      data-start-index={indexRange.startIndex}
      data-end-index={indexRange.endIndex}
      data-depth={props.depth}
    >
      <button
        type="button"
        disabled={!isExpandable}
        onClick={toggleExpansion}
        onKeyDown={handleKeyDown}
        onFocus={handleInteract}
        class="flex w-full items-center px-2 text-start transition-colors hover:bg-slate-800"
      >
        <Show when={isExpandable}>
          <span class="pe-1">
            <ExpandChevron isOpen={isExpanded()} />
          </span>
        </Show>
        <span classList={{ "text-white/70": isExpandable }}>
          {props.nodeProperties.kindName}
        </span>
        <span class="ml-auto flex gap-1 pl-1 text-white/90">
          {props.nodeProperties.name && <em>{props.nodeProperties.name}</em>}
          {props.nodeProperties.value !== undefined && (
            <em>{`${props.nodeProperties.value}`}</em>
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

const isPassThroughNode = (kind: string) => kind === "SyntaxList";

const AUTO_EXPAND_DEPTH = 10;
