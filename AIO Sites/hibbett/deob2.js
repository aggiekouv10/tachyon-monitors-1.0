const parser = require("@babel/parser")
const t = require("@babel/types")
const traverse = require("@babel/traverse").default
const generate = require("@babel/generator").default
const got = require("got")
const atob = require("atob")
const fs = require('fs')
const { writeFileSync } = require("fs")

function r(r) {
  for (var n = atob(r), t = n.charCodeAt(0), c = "", e = 1; e < n.length; ++e) c += String.fromCharCode(t ^ n.charCodeAt(e));

  return c;
}

// All PX strings follow the format
// "PX" and then a series of numbers after
// returns true if the string follows the format
const isPXString = (str) => {
  const pxRegex = new RegExp(/PX\d*/gm);
  return pxRegex.test(str);
};

const deobFuscate = (script) => {
  const ast = parser.parse(script);
  let functionList = []

  traverse(ast, {
    // Call all deobfuscating functions
    VariableDeclaration(path) {
      for (let declaration of path.node.declarations) {
        if (declaration.init && declaration.init.type === 'Identifier' && declaration.init.name === 'deob') {
          if (!functionList.includes(declaration.id.name))
            functionList.push(declaration.id.name)
        }
      }
    },
  });
  console.log(functionList)
  traverse(ast, {
    Identifier(path) {
      if (
        functionList.includes(path.node.name) &&
        path.parentPath.node.type === "CallExpression" &&
        path.parentPath.node.arguments.length === 1 &&
        path.parentPath.node.arguments[0].type === "StringLiteral"
      ) {
        const decodedString = r(path.parentPath.node.arguments[0].value);
        path.parentPath.replaceWith(t.stringLiteral(decodedString));
      }
    }
  });
  const deob = generate(ast).code;
  return deob;
};

const main = async () => {
  // const { body } = await got("https://www.hibbett.com/AJDckzHD/init.js");
  const body = fs.readFileSync("./deobbed.js").toString();
  const deobfuscated = deobFuscate(body);
  writeFileSync("./deobbed.js", deobfuscated);
  console.log("Finished Deobfuscation of PX Script!")
};

main();