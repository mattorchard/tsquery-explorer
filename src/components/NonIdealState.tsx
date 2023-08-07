import { ParentComponent } from "solid-js";

export const NonIdealState: ParentComponent<{
  illustration: keyof typeof Illustrations;
  title?: string;
}> = (props) => (
  <div class="m-auto flex flex-col items-center text-center ">
    <div class="fill-current opacity-30">
      {Illustrations[props.illustration]}
    </div>
    {props.title && <strong class="text-lg">{props.title}</strong>}
    <p>{props.children}</p>
  </div>
);

const Illustrations = {
  folder: (
    <svg data-icon="folder-open" width="96" height="96" viewBox="0 0 20 20">
      <path
        d="M20 9c0-.55-.45-1-1-1H5c-.43 0-.79.27-.93.65h-.01l-3 8h.01c-.04.11-.07.23-.07.35 0 .55.45 1 1 1h14c.43 0 .79-.27.93-.65h.01l3-8h-.01c.04-.11.07-.23.07-.35zM3.07 7.63C3.22 7.26 3.58 7 4 7h14V5c0-.55-.45-1-1-1H8.41l-1.7-1.71A.997.997 0 006 2H1c-.55 0-1 .45-1 1v12.31l3.07-7.68z"
        fill-rule="evenodd"
      ></path>
    </svg>
  ),

  calculator: (
    <svg data-icon="calculator" width="96" height="96" viewBox="0 0 20 20">
      <path
        d="M16 0H4c-.55 0-1 .45-1 1v18c0 .55.45 1 1 1h12c.55 0 1-.45 1-1V1c0-.55-.45-1-1-1zM7 18H5v-2h2v2zm0-4H5v-2h2v2zm0-4H5V8h2v2zm4 8H9v-2h2v2zm0-4H9v-2h2v2zm0-4H9V8h2v2zm4 8h-2v-6h2v6zm0-8h-2V8h2v2zm0-4H5V2h10v4z"
        fill-rule="evenodd"
      ></path>
    </svg>
  ),

  magnifier: (
    <svg data-icon="magnifier" height="96" width="96" viewBox="0 0 20 20">
      <path
        d="M19.56 17.44l-4.94-4.94A8.004 8.004 0 0016 8c0-4.42-3.58-8-8-8S0 3.58 0 8s3.58 8 8 8c1.67 0 3.21-.51 4.5-1.38l4.94 4.94a1.498 1.498 0 102.12-2.12zM8 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"
        fill-rule="evenodd"
      ></path>
    </svg>
  ),

  code: (
    <svg data-icon="code" height="96" width="96" role="img" viewBox="0 0 20 20">
      <path
        d="M6 6a1.003 1.003 0 00-1.71-.71l-4 4C.11 9.47 0 9.72 0 10c0 .28.11.53.29.71l4 4a1.003 1.003 0 001.42-1.42L2.41 10 5.7 6.71c.19-.18.3-.43.3-.71zm6-4c-.46 0-.83.31-.95.73l-4 14c-.02.09-.05.17-.05.27 0 .55.45 1 1 1 .46 0 .83-.31.95-.73l4-14c.02-.09.05-.17.05-.27 0-.55-.45-1-1-1zm7.71 7.29l-4-4a1.003 1.003 0 00-1.42 1.42l3.3 3.29-3.29 3.29c-.19.18-.3.43-.3.71a1.003 1.003 0 001.71.71l4-4c.18-.18.29-.43.29-.71 0-.28-.11-.53-.29-.71z"
        fill-rule="evenodd"
      ></path>
    </svg>
  ),
};
