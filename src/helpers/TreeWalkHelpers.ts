const selectors = {
  focusTarget: `[data-tree-walk-focus-target]`,
  container: `[data-tree-walk-container]`,
  root: `[data-tree-walk-root]`,
  depth: (d: number) => `[data-depth="${d}"]`,
};

const getTreeWalkFocusTargetData = (target: unknown) => {
  if (!(target instanceof HTMLElement)) return null;
  const dataset = target.dataset;
  return {
    isExpandable: dataset.isExpandable === "true",
    isExpanded: dataset.isExpanded === "true",
    depth: parseInt(dataset.depth || "0"),
  };
};

const getClosestFocusTarget = (element: HTMLElement, depth: number) => {
  const parentContainer = element.closest(
    selectors.container + selectors.depth(depth - 1),
  );
  const focusTarget = parentContainer?.querySelector(selectors.focusTarget) as
    | HTMLElement
    | undefined
    | null;
  return focusTarget ?? null;
};

const getFirstChildFocusTarget = (element: HTMLElement, depth: number) => {
  const currentContainer = element.closest(selectors.container);
  const focusTarget = currentContainer?.querySelector(
    selectors.focusTarget + selectors.depth(depth + 1),
  ) as HTMLElement | undefined | null;
  return focusTarget ?? null;
};

const getPrevFocusTarget = (
  element: HTMLElement,
  depth: number,
): HTMLElement | null => {
  const parentContainer =
    element.closest(selectors.container + selectors.depth(depth - 1)) ??
    element.closest(selectors.root);
  if (!parentContainer) return null;
  const allFamilyMembers = [
    ...parentContainer.querySelectorAll(selectors.focusTarget),
  ] as HTMLElement[];
  const currentIndex = allFamilyMembers.indexOf(element);
  return allFamilyMembers[currentIndex - 1] ?? null;
};

const getNextFocusTarget = (
  element: HTMLElement,
  depth: number,
): HTMLElement | null => {
  const parentContainer =
    element.closest(selectors.container + selectors.depth(depth - 1)) ??
    element.closest(selectors.root);
  if (!parentContainer) return null;

  const allSiblingsOrCousins = [
    ...parentContainer.querySelectorAll(
      selectors.focusTarget + selectors.depth(depth),
    ),
  ] as HTMLElement[];

  const currentIndex = allSiblingsOrCousins.indexOf(element);
  if (currentIndex < 0) return null;

  // Primary flow
  const nextElement = allSiblingsOrCousins[currentIndex + 1];
  if (nextElement) return nextElement;

  // Escalate
  const closest =
    getClosestFocusTarget(element, depth) ?? element.closest(selectors.root);
  if (!closest) return null;
  return getNextFocusTarget(closest, depth - 1);
};

export const handleTreeNavigate = (e: KeyboardEvent) => {
  const walkData = getTreeWalkFocusTargetData(e.currentTarget);
  if (!walkData) return;
  if (e.key.startsWith("Arrow")) e.preventDefault();
  const { depth, isExpandable, isExpanded } = walkData;
  const currentTarget = e.currentTarget as HTMLElement;
  switch (e.key) {
    case "ArrowUp":
      getPrevFocusTarget(currentTarget, depth)?.focus();
      break;

    case "ArrowLeft":
      if (isExpanded) currentTarget.click();
      else getClosestFocusTarget(currentTarget, depth)?.focus();
      break;

    case "ArrowRight":
      if (!isExpandable) return; // Nothing no matter what
      if (!isExpanded) currentTarget.click();
      else getFirstChildFocusTarget(currentTarget, depth)?.focus();
      break;

    case "ArrowDown":
      let focusTarget = isExpanded
        ? getFirstChildFocusTarget(currentTarget, depth)
        : null;
      focusTarget ??= getNextFocusTarget(currentTarget, depth);
      focusTarget?.focus();
      break;
  }
};
