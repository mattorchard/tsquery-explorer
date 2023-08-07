import { Component } from "solid-js";

export const ExpandChevron: Component<{ isOpen: boolean }> = (props) => {
  return (
    <svg
      stroke="currentColor"
      fill="none"
      stroke-width="2"
      viewBox="0 0 24 24"
      stroke-linecap="round"
      stroke-linejoin="round"
      height="1em"
      width="1em"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Todo: Animate */}
      {props.isOpen ? (
        <polyline points="6 9 12 15 18 9"></polyline>
      ) : (
        <polyline points="18 15 12 9 6 15"></polyline>
      )}
    </svg>
  );
};
