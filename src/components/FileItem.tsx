import { Component, Show } from "solid-js";
import { FileContent } from "../types";

export const FileItem: Component<{
  file: FileContent;
  isSelected: boolean;
  count: number;
  ignoreCount: boolean;
  onClick: () => void;
}> = (props) => {
  return (
    <li class="even:bg-slate-800/10">
      <button
        type="button"
        onClick={props.onClick}
        class="inner-focus-ring flex w-full items-center px-2 text-start transition-colors"
        classList={{
          "text-white/30": !props.ignoreCount && props.count === 0,
          "hover:bg-slate-800": !props.isSelected,
          "bg-cyan-700 hover:bg-cyan-600": props.isSelected,
        }}
      >
        {props.file.name}
        <Show when={!props.ignoreCount && props.count > 0}>
          <span class="my-1 ml-auto rounded-full bg-cyan-700 px-1.5 text-sm">
            {props.count}
          </span>
        </Show>
      </button>
    </li>
  );
};
