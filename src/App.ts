import * as vscode from 'vscode';
import { Rule } from '@any-reader/core';
import { COMMANDS } from './constants';
import { config } from './config';
import { BookProvider } from './explorer/book';
import { SourceProvider } from './explorer/source';
import bookManager, { TreeNode } from './explorer/bookManager';
import sourceManager from './explorer/sourceManager';
import { BOOK_SOURCE_PATH, ensureFile } from './dataManager';

class App {
  private bookProvider: BookProvider = new BookProvider();
  private sourceProvider: SourceProvider = new SourceProvider();

  private context?: vscode.ExtensionContext;
  private webviewPanel?: vscode.WebviewPanel;

  activate(context: vscode.ExtensionContext) {
    this.context = context;
    ensureFile();
    const registerCommand = vscode.commands.registerCommand;
    const registerTreeDataProvider = vscode.window.registerTreeDataProvider;
    [
      registerCommand(COMMANDS.editBookSource, this.editBookSource, this),
      registerCommand(COMMANDS.searchBook, this.searchBook, this),
      registerCommand(COMMANDS.getContent, this.getContent, this),
      registerCommand(COMMANDS.getBookSource, this.getBookSource, this)
    ].forEach((command) => context.subscriptions.push(command));
    registerTreeDataProvider('any-reader-book', this.bookProvider);
    registerTreeDataProvider('any-reader-source', this.sourceProvider);
    vscode.commands.executeCommand(COMMANDS.getBookSource);
  }

  // 书源编辑
  editBookSource() {
    vscode.workspace.openTextDocument(vscode.Uri.file(BOOK_SOURCE_PATH)).then((doc) => {
      vscode.window.showTextDocument(doc);
    });
  }

  // 搜索
  async searchBook(rule?: Rule) {
    await bookManager.searchBook(rule);
    this.bookProvider.refresh();
  }

  // 获取文章详情
  async getContent(article: TreeNode) {
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Window,
        title: 'loading...',
        cancellable: false
      },
      async () => {
        let content = await bookManager.getContent(article);
        if (!content) {
          vscode.window.showWarningMessage('empty content');
        } else {
          if (config.app.get('hideImage', false)) {
            content = content.replace(/<img .*?>/gim, '');
          }
          const injectedHtml = config.app.get('injectedHtml', '');
          content && this.openWebviewPanel(article, `${injectedHtml}<style>body{font-size:1em}</style>${content}`);
        }
      }
    );
  }

  // 打开阅读面板
  async openWebviewPanel(article: TreeNode, content: string) {
    const title: string = article.data.name;

    if (!this.webviewPanel) {
      this.webviewPanel = vscode.window.createWebviewPanel('rss', title, vscode.ViewColumn.One, {
        retainContextWhenHidden: true,
        enableScripts: true
      });
      this.webviewPanel.onDidDispose(
        () => {
          this.webviewPanel = undefined;
        },
        this,
        this.context!.subscriptions
      );
    } else {
      this.webviewPanel.title = title;
    }
    this.webviewPanel.webview.html = content;
    this.webviewPanel.reveal();
  }

  // 获取本地书源列表
  public async getBookSource() {
    sourceManager.getBookSource();
    this.sourceProvider.refresh();
  }
}

export const app = new App();
