import { createSignal, onMount } from "solid-js";
import { doTheParse } from "./helpers/ParserHelpers";

function App() {
  const [data, setData] = createSignal<any>(null);

  onMount(() => {
    const output = doTheParse();
    console.log("Output", output);
    setData(output);
  });

  return (
    <>
      <pre>
        <code>{JSON.stringify(data, null, 2)}</code>
      </pre>
    </>
  );
}

export default App;
