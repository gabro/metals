"use strict";

import * as path from "path";
import { workspace, ExtensionContext, window, commands } from "vscode";
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
  RevealOutputChannelOn,
  ExecuteCommandRequest
} from "vscode-languageclient";
import { exec } from "child_process";
import { writeFile } from 'fs';
import { dirname } from 'path';
import open = require('opn');

export async function activate(context: ExtensionContext) {
  // The debug options for the server
  const debugOptions = [
    "-Xdebug",
    "-Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=8000,quiet=y"
  ];

  const coursierPath = path.join(context.extensionPath, "./coursier");

  const serverVersion = workspace.getConfiguration("metals").get("serverVersion")

  const coursierArgs = [
    "launch",
    "-r", "bintray:scalameta/maven",
    `org.scalameta:metals_2.12:${serverVersion}`,
    "-M", "scala.meta.metals.Main"
  ];

  const javaArgs = [
    `-XX:+UseG1GC`,
    `-XX:+UseStringDeduplication`,
    "-jar", coursierPath
  ].concat(coursierArgs);

  const serverOptions: ServerOptions = {
    run: { command: "java", args: javaArgs },
    debug: { command: "java", args: debugOptions.concat(javaArgs) }
  };

  const clientOptions: LanguageClientOptions = {
    documentSelector: ["scala"],
    synchronize: {
      fileEvents: [
        workspace.createFileSystemWatcher("**/*.semanticdb"),
        workspace.createFileSystemWatcher("**/.metals/buildinfo/**/*.properties")
      ],
      configurationSection: 'metals'
    },
    revealOutputChannelOn: RevealOutputChannelOn.Never
  };

  const client = new LanguageClient(
    'metals',
    'Metals',
    serverOptions,
    clientOptions
  );

  const restartServerCommand = commands.registerCommand(
    'metals.restartServer',
    async () => {
      const serverPid = client["_serverProcess"].pid;
      await exec(`kill ${serverPid}`);
      const showLogsAction = "Show server logs";
      const selectedAction = await window.showInformationMessage(
        'Metals Language Server killed, it should restart in a few seconds',
        showLogsAction
      );

      if (selectedAction === showLogsAction) {
        client.outputChannel.show(true);
      }
    }
  );

  client.onReady().then(() => {
    const clearIndexCacheCommand = commands.registerCommand(
      'metals.clearIndexCache',
      async () => {
        return client.sendRequest(ExecuteCommandRequest.type, {
          command: "clearIndexCache"
        });
      }
    );
    const resetPresentationCompiler = commands.registerCommand(
      'metals.resetPresentationCompiler',
      async () => {
        return client.sendRequest(ExecuteCommandRequest.type, {
          command: "resetPresentationCompiler"
        });
      }
    );
    const sbtConnectCommand = commands.registerCommand(
      'metals.sbtConnect',
      async () => {
        return client.sendRequest(ExecuteCommandRequest.type, {
          command: "sbtConnect"
        });
      }
    );
    const downloadDebugPayloadCommand = commands.registerCommand(
      'metals.downloadDebugPayload',
      async () => {
        try {
          const path = await client.sendRequest(ExecuteCommandRequest.type, {
            command: "downloadDebugPayload",
            arguments: [window.activeTextEditor.document.uri.toString()]
          })
          const revealInFileExplorerOption = "Reveal in file explorer";
          const option = await window.showInformationMessage(`Debug payload saved to ${path}`,
            revealInFileExplorerOption
          )
          if (option === revealInFileExplorerOption) {
            open(dirname(path))
          }
        } catch (err) {
          window.showErrorMessage(err.message)
        }
      }
    )
    context.subscriptions.push(
      clearIndexCacheCommand,
      resetPresentationCompiler,
      sbtConnectCommand,
      downloadDebugPayloadCommand
    );
  });

  context.subscriptions.push(client.start(), restartServerCommand);
}
