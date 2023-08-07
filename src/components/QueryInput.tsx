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
  onChange: (value: string) => void;
}> = (props) => {
  let ref: HTMLTextAreaElement;
  const [draft, setDraft] = createSignal("");
  const [parserError, setParserError] = createSignal("");
  let timeoutId: number | null = null;

  createEffect(() => {
    const currentDraft = draft();
    const newError = currentDraft ? getParserError(currentDraft) ?? "" : "";
    ref.setCustomValidity(newError);
    setParserError(newError);
    if (timeoutId) window.clearTimeout(timeoutId);
    if (!newError) {
      timeoutId = setTimeout(
        () => props.onChange(currentDraft),
        DEBOUNCE_THRESHOLD,
      );
    }
  });

  return (
    <div class="flex flex-col">
      <textarea
        placeholder="Search query"
        aria-label="Search query"
        ref={ref!}
        value={draft()}
        onInput={(e) => setDraft(e.currentTarget.value)}
        class="h-[56px] resize-none appearance-none bg-transparent text-xl"
      />
      <div class="text-red-400">
        {parserError()}
        &nbsp;
      </div>
    </div>
  );
};

const DEBOUNCE_THRESHOLD = 300;
