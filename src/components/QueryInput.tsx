import { Component, createEffect, createSignal } from "solid-js";
import { parse } from "../../tsquery/src";

const getParserError = (draft: string) => {
  try {
    parse(draft);
    return null;
  } catch (error) {
    if (error instanceof Error) return error.message;
    else return "Unknown error";
  }
};

export const QueryInput: Component<{
  defaultValue: string;
  onChange: (value: string) => void;
}> = (props) => {
  let ref: HTMLTextAreaElement;
  const [draft, setDraft] = createSignal(props.defaultValue);
  const [parserError, setParserError] = createSignal("");
  let timeoutId: number | null = null;

  createEffect(() => {
    matchScrollHeight(ref);
    const currentDraft = draft();
    const newError = currentDraft ? getParserError(currentDraft) ?? "" : "";
    ref.setCustomValidity(newError);
    setParserError(newError);
    if (timeoutId) window.clearTimeout(timeoutId);
    if (!newError) {
      timeoutId = window.setTimeout(
        () => props.onChange(currentDraft),
        DEBOUNCE_THRESHOLD,
      );
    }
  });

  return (
    <div class="flex w-full flex-col">
      <label class="cursor-text p-2">
        <textarea
          placeholder="Search query"
          aria-label="Search query"
          ref={ref!}
          value={draft()}
          onInput={(e) => setDraft(e.currentTarget.value)}
          class=" w-full resize-none appearance-none bg-transparent text-xl caret-cyan-400 outline-none"
        />
      </label>
      <div class="px-2  text-red-400">
        {parserError()}
        &nbsp;
      </div>
    </div>
  );
};

const DEBOUNCE_THRESHOLD = 300;

const matchScrollHeight = (element: HTMLElement) => {
  element.style.height = "0";
  element.style.height = `${element.scrollHeight}px`;
};
