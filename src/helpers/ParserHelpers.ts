import { ast, query } from "../../tsquery/src";

export const doTheParse = () => {
  const codeAst = ast(`const magic = 5;

  function f(n:any){
    return n+n;
  }
  
  
  function g() {
    return f(magic);
  }
  
  console.log(g());`);
  return query(codeAst, `FunctionDeclaration`);
};
