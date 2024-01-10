import * as vscode from 'vscode';
import { getBookSource } from '../dataManager';
import { RuleManager, Rule, SearchItem, ChapterItem } from '@any-reader/core';

export interface TreeNode {
  rule: Rule;
  type: number; // 1=SearchItem 2=ChapterItem
  data: SearchItem | ChapterItem;
}

class BookManager implements vscode.Disposable {
  public list: TreeNode[] = [];

  public dispose(): void {
    this.list = [];
  }

  public async searchBook() {
    const keyword = await vscode.window.showInputBox({
      prompt: '书源搜索',
      value: ''
    });
    if (!keyword) {
      return;
    }

    // 读取书源配置
    const bookSource = await getBookSource();
    if (bookSource.length === 0) {
      return;
    }

    const bs = bookSource[0];
    const rm = new RuleManager(bs);
    const list = await rm.search(keyword);
    this.list = list.map((searchItem: any) => {
      return {
        rule: bs,
        type: 1,
        data: searchItem
      };
    });
  }

  public getChildren(): Promise<TreeNode[]> {
    return Promise.resolve(this.list);
  }

  public async getChapter(tn: TreeNode): Promise<TreeNode[]> {
    const rm = new RuleManager(tn.rule);
    const list = await rm.getChapter(tn.data.url);
    return Promise.resolve(
      list.map((e: any) => ({
        type: 2,
        rule: tn.rule,
        data: e
      }))
    );
  }

  public async getContent(tn: TreeNode): Promise<string> {
    const rm = new RuleManager(tn.rule);
    return rm.getContent(tn.data.url);
  }
}

export default new BookManager();
