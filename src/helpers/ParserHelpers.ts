import { ast, query } from "../../tsquery/src";

export const doTheParse = () => {
  const codeAst = ast(`
    function() {
      return <h1>Nice</h1>
    }
  `);
  return query(codeAst, `FunctionDeclaration`);
};
