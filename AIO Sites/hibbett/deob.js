const parser = require("@babel/parser")
const t = require("@babel/types")
const traverse = require("@babel/traverse").default
const generate = require("@babel/generator").default
const got = require("got")
const atob = require("atob")
const fs = require('fs')
const { writeFileSync } = require("fs")

const decodePXString = (encoded) => {
  for (var i = atob(encoded), a = "9AJAQA2", c = "", u = 0; u < i.length; ++u) {
    var f = a.charCodeAt(u % 7);
    c += String.fromCharCode(f ^ i.charCodeAt(u));
  }
  return c;
};

// All PX strings follow the format
// "PX" and then a series of numbers after
// returns true if the string follows the format
const isPXString = (str) => {
  const pxRegex = new RegExp(/PX\d*/gm);
  return pxRegex.test(str);
};

const deobFuscate = (script) => {
  const ast = parser.parse(script);

  traverse(ast, {
    // find all PX strings
    // ex. PX175
    StringLiteral(path) {
      const pxString = decodePXString(path.node.value);
      // console.log(pxString)
      if (
        // path.node.value.match(/Cgt/gm) &&
        path.parentPath.node.type === "CallExpression" &&
        isPXString(pxString)
      ) {
        path.parentPath.replaceWith(t.stringLiteral(pxString));
      }
    },

    Identifier(path) {
      if (
        path.node.name === "Tn" &&
        path.parentPath.node.type === "CallExpression" &&
        path.parentPath.node.arguments.length === 1 &&
        path.parentPath.node.arguments[0].type === "StringLiteral"
      ) {
        const decodedString = atob(path.parentPath.node.arguments[0].value);
        path.parentPath.replaceWith(t.stringLiteral(decodedString));
      }
    },
  });
  const deob = generate(ast).code;
  return deob;
};

const main = async () => {
  // const { body } = await got("https://www.hibbett.com/AJDckzHD/init.js");
  const body = fs.readFileSync("./original.js").toString();
  const deobfuscated = deobFuscate(body);
  writeFileSync("./deobbed.js", deobfuscated);
  console.log("Finished, now follow step 2!")
};

main();