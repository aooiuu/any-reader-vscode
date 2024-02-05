import * as vscode from 'vscode';
import { Rule } from '@any-reader/core';
import { getBookSource } from '../dataManager';

class SourceManager implements vscode.Disposable {
  private bookSource: Rule[] = [];

  dispose(): void {
    this.bookSource = [];
  }

  async getBookSource() {
    const rules = await getBookSource();
    this.bookSource = rules.filter((e) => e.enableSearch);
  }

  async getChildren(): Promise<Rule[]> {
    return this.bookSource;
  }
}

export default new SourceManager();
