import * as fs from 'fs-extra';
import * as os from 'os';
import * as path from 'path';
import { Rule } from '@any-reader/core';

export const ROOT_PATH = path.join(os.homedir(), '.any-reader');
export const BOOK_SOURCE_PATH = path.join(ROOT_PATH, 'book-source.json');

export async function ensureFile() {
  await fs.ensureFile(BOOK_SOURCE_PATH);
}

export async function getBookSource(): Promise<Rule[]> {
  try {
    return (await fs.readJson(BOOK_SOURCE_PATH)) as Rule[];
  } catch (e) {
    console.log(e);

    return [];
  }
}

export async function setBookSource(bookSource: Rule[]) {
  await fs.ensureFile(BOOK_SOURCE_PATH);
  await fs.writeJson(BOOK_SOURCE_PATH, bookSource);
}
