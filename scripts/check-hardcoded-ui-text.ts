import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import * as ts from 'typescript';

type Finding = {
  file: string;
  line: number;
  column: number;
  kind: 'jsx-text' | 'prop';
  value: string;
  detail: string;
};

const ROOT_DIR = process.cwd();
const FRONTEND_DIR = path.join(ROOT_DIR, 'src');
const BASELINE_FILE = path.join(ROOT_DIR, 'scripts', 'check-hardcoded-ui-text.baseline.json');
const SHOULD_UPDATE_BASELINE = process.argv.includes('--update-baseline');
const CHECKED_PROP_NAMES = new Set([
  'label',
  'title',
  'placeholder',
  'aria-label',
  'description',
  'emptyMessage',
  'error',
  'success'
]);
const IGNORED_PATH_PARTS = new Set(['__tests__', '__mocks__', 'fixtures']);
const TEST_FILE_PATTERN = /\.(test|spec|stories)\.tsx$/;
const ALLOWLIST_COMMENT_PATTERN = /i18n-check-ignore/;
const INTERNAL_VALUE_PATTERN = /^[a-z][a-z0-9_.:/-]*$/;
const CONSTANT_VALUE_PATTERN = /^[A-Z0-9_./:-]+$/;
const WORD_PATTERN = /\p{L}/u;

const getTsxFiles = (dir: string): string[] => {
  if (!existsSync(dir)) return [];

  const entries = readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (IGNORED_PATH_PARTS.has(entry.name) || entry.name === 'node_modules') continue;
      files.push(...getTsxFiles(fullPath));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith('.tsx') && !TEST_FILE_PATTERN.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files.sort();
};

const normalizeText = (value: string) => value.replace(/\s+/g, ' ').trim();

const isUserFacingCandidate = (value: string) => {
  const text = normalizeText(value);
  if (!text || !WORD_PATTERN.test(text)) return false;
  if (text.length === 1) return false;
  if (INTERNAL_VALUE_PATTERN.test(text)) return false;
  if (CONSTANT_VALUE_PATTERN.test(text)) return false;
  return true;
};

const lineHasIgnoreComment = (sourceText: string, line: number) => {
  const lines = sourceText.split(/\r?\n/);
  const currentLine = lines[line - 1] ?? '';
  const previousLine = lines[line - 2] ?? '';
  return ALLOWLIST_COMMENT_PATTERN.test(currentLine) || ALLOWLIST_COMMENT_PATTERN.test(previousLine);
};

const isReactComponentName = (tagName: ts.JsxTagNameExpression) => ts.isIdentifier(tagName) && /^[A-Z]/.test(tagName.text);

const isAllowedComponentProp = (tagName: ts.JsxTagNameExpression, propName: string, value: string) => {
  const text = normalizeText(value);

  // Icon components may expose a `title` accessibility helper that names the glyph,
  // not product copy. These should still avoid sentences, but component names are fine.
  if (propName === 'title' && isReactComponentName(tagName) && /^[A-Z][A-Za-z0-9]*$/.test(text)) {
    return true;
  }

  return false;
};

const getJsxTagName = (node: ts.Node): ts.JsxTagNameExpression | null => {
  if (ts.isJsxAttribute(node) && ts.isJsxOpeningLikeElement(node.parent.parent)) {
    return node.parent.parent.tagName;
  }
  return null;
};

const getStringLiteralAttributeValue = (initializer: ts.JsxAttribute['initializer']) => {
  if (!initializer) return null;
  if (ts.isStringLiteral(initializer)) return initializer.text;
  if (ts.isJsxExpression(initializer)) {
    const expression = initializer.expression;
    if (!expression) return null;
    if (ts.isStringLiteral(expression) || ts.isNoSubstitutionTemplateLiteral(expression)) return expression.text;
  }
  return null;
};

const report = (findings: Finding[], sourceFile: ts.SourceFile, node: ts.Node, kind: Finding['kind'], value: string, detail: string) => {
  const position = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
  const line = position.line + 1;
  if (lineHasIgnoreComment(sourceFile.text, line)) return;

  findings.push({
    file: path.relative(ROOT_DIR, sourceFile.fileName),
    line,
    column: position.character + 1,
    kind,
    value: normalizeText(value),
    detail
  });
};

const scanSourceFile = (file: string) => {
  const sourceText = readFileSync(file, 'utf8');
  const sourceFile = ts.createSourceFile(file, sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const findings: Finding[] = [];

  const visit = (node: ts.Node) => {
    if (ts.isJsxText(node) && isUserFacingCandidate(node.getText(sourceFile))) {
      report(findings, sourceFile, node, 'jsx-text', node.getText(sourceFile), 'visible JSX text');
    }

    if (ts.isJsxExpression(node) && node.expression && ts.isStringLiteral(node.expression) && ts.isJsxElement(node.parent)) {
      const value = node.expression.text;
      if (isUserFacingCandidate(value)) {
        report(findings, sourceFile, node, 'jsx-text', value, 'string literal JSX child');
      }
    }

    if (ts.isJsxAttribute(node)) {
      const propName = node.name.getText(sourceFile);
      if (CHECKED_PROP_NAMES.has(propName)) {
        const value = getStringLiteralAttributeValue(node.initializer);
        const tagName = getJsxTagName(node);
        if (value && isUserFacingCandidate(value) && !(tagName && isAllowedComponentProp(tagName, propName, value))) {
          report(findings, sourceFile, node, 'prop', value, `hardcoded ${propName} prop`);
        }
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return findings;
};

const findingKey = (finding: Finding) => `${finding.file}|${finding.kind}|${finding.detail}|${finding.value}`;

const readBaseline = () => {
  if (!existsSync(BASELINE_FILE)) return new Set<string>();
  const values = JSON.parse(readFileSync(BASELINE_FILE, 'utf8')) as string[];
  return new Set(values);
};

const findings = getTsxFiles(FRONTEND_DIR).flatMap(scanSourceFile);
const baseline = readBaseline();

if (SHOULD_UPDATE_BASELINE) {
  const values = Array.from(new Set(findings.map(findingKey))).sort();
  writeFileSync(BASELINE_FILE, `${JSON.stringify(values, null, 2)}\n`);
  console.log(`Updated ${path.relative(ROOT_DIR, BASELINE_FILE)} with ${values.length} entries.`);
  process.exit(0);
}

const unbaselinedFindings = findings.filter((finding) => !baseline.has(findingKey(finding)));

if (unbaselinedFindings.length > 0) {
  console.error('Hardcoded UI text check failed. Move user-facing text into i18n resources, or add // i18n-check-ignore for a documented non-user-facing exception.');
  console.error('Existing legacy findings are tracked in scripts/check-hardcoded-ui-text.baseline.json; new findings should not be added to that baseline unless they are part of a documented migration checkpoint.');
  console.error('');

  for (const finding of unbaselinedFindings) {
    console.error(`${finding.file}:${finding.line}:${finding.column} ${finding.kind} ${finding.detail}: "${finding.value}"`);
  }

  process.exit(1);
}

console.log(`No new hardcoded user-facing JSX text found (${findings.length} existing baseline finding${findings.length === 1 ? '' : 's'} ignored).`);
