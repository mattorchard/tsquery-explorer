export const createRegexSafe = (patternText: string): RegExp | null => {
  try {
    return new RegExp(patternText, "g");
  } catch (error) {
    console.warn("Invalid regex", error);
    return null;
  }
};
