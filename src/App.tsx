import { For, createSignal, onMount } from "solid-js";
import { doTheParse } from "./helpers/ParserHelpers";
import { TsNode } from "./types";
import { NodeViewer } from "./components/NodeViewer";

function App() {
  const [nodes, setNodes] = createSignal<TsNode[]>([]);

  onMount(() => {
    const output = doTheParse();
    console.log("Output", output);
    setNodes(output);
  });

  return (
    <>
      <For each={nodes()}>{(node) => <NodeViewer node={node} />}</For>
    </>
  );
}

export default App;
