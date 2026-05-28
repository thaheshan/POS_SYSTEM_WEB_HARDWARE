const fs = require('fs');
const ts = require('typescript');

const fileName = 'C:/Users/Thahe/Documents/GitHub/POS_SYSTEM_WEB_HARDWARE/src/app/pos/page.tsx';
const sourceFile = ts.createSourceFile(
  fileName,
  fs.readFileSync(fileName, 'utf8'),
  ts.ScriptTarget.Latest,
  true
);

const diagnostics = ts.getPreEmitDiagnostics(ts.createProgram([fileName], {
  jsx: ts.JsxEmit.ReactJSX,
  esModuleInterop: true,
  skipLibCheck: true
}));

if (diagnostics.length > 0) {
  console.log("Errors found:");
  diagnostics.forEach(diagnostic => {
    if (diagnostic.file) {
      const { line, character } = ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start);
      const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
      console.log(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
    } else {
      console.log(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
    }
  });
} else {
  console.log("No syntax errors found!");
}
