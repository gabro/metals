# Scalameta language-server

[![](https://travis-ci.org/scalameta/language-server.svg?branch=master)](https://travis-ci.org/scalameta/language-server)

This project is an experiment to implement a [Language Server](https://github.com/Microsoft/language-server-protocol)
for Scala using Scalameta semanticdb and the Scala presentation compiler.


:warning: This project is very alpha stage.
Expect bugs and surprising behavior.
Ticket reports and patches are welcome!

## Project Goals

This project has the following goals:

- a good UX for the final users, including simple installation and setup
- low memory requirements
- integration with scalameta-based tools, such as [Scalafix](https://github.com/scalacenter/scalafix) and [Scalafmt](https://github.com/scalameta/scalafmt)

## Roadmap

Below is a rough summary of what features have been implemented.
Even if some checkbox is marked it does not mean that feature works perfectly.
Some of those features are a likely outside the scope of this project, we are
still learning and exploring what's possible.

- [x] Linting with Scalafix on compile (textDocument/publishDiagnostics)
- [ ] Linting with Scalafix as you type (textDocument/publishDiagnostics)
- [ ] Refactoring with Scalafix (textDocument/codeAction)
- [x] Formatting with Scalafmt (textDocument/formatting)
- [ ] Formatting with Scalafmt for range (textDocument/rangeFormatting)
- [ ] Formatting with Scalafmt as you type (textDocument/onTypeFormatting)
- [x] Auto completions as you type with presentation compiler (textDocument/completions)
- [x] Show type at position as you type (textDocument/hover)
- [x] Go to definition from project Scala sources to project Scala sources on compile (textDocument/definition)
- [x] Go to definition from project sources to Scala dependency source files on compile (textDocument/definition)
- [x] Go to definition from project sources to Java dependency source file on compile (textDocument/definition)
- [ ] Go to definition as you type (textDocument/definition)
- [x] Show parameter list as you type (textDocument/signatureHelper)
- [ ] Show red squigglies as you type (textDocument/publishDiagnostics)
- [ ] Show red squigglies on compile (textDocument/publishDiagnostics)
- [ ] Auto-insert missing import when completing a global symbol (textDocument/completions)
- [ ] Find symbol references (textDocument/references)
- [ ] Rename local symbol (textDocument/rename)
- [ ] Rename global symbol (textDocument/rename)

## Contributing

See the [contributing guide](CONTRIBUTING.md).

### Team
The current maintainers (people who can merge pull requests) are:

* Gabriele Petronella - [`@gabro`](https://github.com/gabro)
* Alexey Alekhin - [`@laughedelic`](https://github.com/laughedelic)
* Ólafur Páll Geirsson - [`@olafurpg`](https://github.com/olafurpg)

## Acknowledgement
Huge thanks to [`@dragos`](https://github.com/dragos) for his work on a Scala implementation of the LSP protocol (see: https://github.com/dragos/dragos-vscode-scala).
We've decided to copy the sources over in order to iterate much faster in adding features to the original implementation, with the explicit goal of contributing them back upstream.

## Related work

- [ENSIME](http://ensime.org): a tool for providing IDE-like features to text editors, that [recently added LSP support](https://github.com/ensime/ensime-server/pull/1888)
