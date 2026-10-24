import PDFDocument from 'pdfkit';
import { Response } from 'express';
import SVGtoPDF from 'svg-to-pdfkit';
import { mathjax } from 'mathjax-full/js/mathjax.js';
import { TeX } from 'mathjax-full/js/input/tex.js';
import { AllPackages } from 'mathjax-full/js/input/tex/AllPackages.js';
import { SVG } from 'mathjax-full/js/output/svg.js';
import { liteAdaptor } from 'mathjax-full/js/adaptors/liteAdaptor.js';
import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html.js';
import { normalizeMarkdownEscapedNewlines } from '../lib/markdown';

type PDFDocumentInstance = InstanceType<typeof PDFDocument>;

export interface PDFGenerateOptions {
  title: string;
  resourceType: string;
  subject: string;
  topic: string;
  educationLevel: string;
  difficulty?: string;
  program?: string;
  semester?: string;
  authorName?: string;
  institution?: string;
  content: string;
  structuredData?: unknown;
}

const PAGE_MARGIN = 56;
const FOOTER_TOP = 790;
const CONTENT_BOTTOM = FOOTER_TOP - 18;
const ACCENT = '#4F46E5';
const INK = '#17263D';
const BODY = '#344256';
const LINE = '#DCE3ED';
const CONTENT_WIDTH = 595.28 - PAGE_MARGIN * 2;

type MarkdownBlock =
  | { type: 'heading'; level: number; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; ordered: boolean; marker: string; text: string }
  | { type: 'math'; tex: string }
  | { type: 'code'; language: string; code: string }
  | { type: 'table'; rows: string[][] }
  | { type: 'quote'; text: string }
  | { type: 'rule' };

let mathDocument: ReturnType<typeof createMathDocument> | undefined;

function createMathDocument() {
  const adaptor = liteAdaptor();
  RegisterHTMLHandler(adaptor);
  return {
    adaptor,
    document: mathjax.document('', {
      InputJax: new TeX({ packages: AllPackages }),
      OutputJax: new SVG({ fontCache: 'none' })
    })
  };
}

function stripMarkdown(text: string): string {
  return text
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '$1')
    .replace(/(?<!_)_([^_]+)_(?!_)/g, '$1')
    .replace(/`([^`]+)`/g, '$1');
}

function readableLatex(tex: string): string {
  const symbols: Record<string, string> = {
    alpha: 'alpha', beta: 'beta', gamma: 'gamma', delta: 'delta', epsilon: 'epsilon', theta: 'theta',
    lambda: 'lambda', mu: 'mu', pi: 'pi', rho: 'rho', sigma: 'sigma', tau: 'tau', phi: 'phi',
    omega: 'omega', Gamma: 'Gamma', Delta: 'Delta', Theta: 'Theta', Lambda: 'Lambda', Sigma: 'Sigma',
    Phi: 'Phi', Omega: 'Omega', nabla: 'nabla', partial: 'partial', infty: 'infinity', cdot: '*',
    times: 'x', pm: '+/-', leq: '<=', geq: '>=', neq: '!=', approx: '~',
    to: '->', rightarrow: '->', leftarrow: '<-', forall: 'for all', exists: 'there exists',
    int: 'integral', oint: 'closed integral', sum: 'sum', prod: 'product', circ: 'o', degree: 'degrees'
  };
  let result = tex;
  for (let pass = 0; pass < 3; pass++) {
    result = result.replace(/\\frac\s*\{([^{}]+)\}\s*\{([^{}]+)\}/g, '($1)/($2)')
      .replace(/\\sqrt\s*\{([^{}]+)\}/g, '√($1)')
      .replace(/\\vec\s*\{([^{}]+)\}/g, 'vec($1)')
      .replace(/\\(?:mathrm|text|mathbf|mathit)\s*\{([^{}]*)\}/g, '$1')
      .replace(/\\left|\\right/g, '')
      .replace(/\\([A-Za-z]+)/g, (_match, name: string) => symbols[name] ?? name)
      .replace(/\^\{([^{}]+)\}/g, '^($1)')
      .replace(/_\{([^{}]+)\}/g, '_($1)')
      .replace(/\\,/g, ' ')
      .replace(/\\;/g, ' ')
      .replace(/\\quad|\\qquad/g, '  ')
      .replace(/[{}]/g, '');
  }
  return result.replace(/\s+/g, ' ').trim();
}

function inlineText(text: string): string {
  const normalized = stripMarkdown(text)
    .replace(/\$([^$]+)\$/g, (_match, tex: string) => readableLatex(tex))
    .replace(/\$+/g, '');
  return normalized.includes('\\') ? readableLatex(normalized) : normalized;
}

function isBlockStart(lines: string[], index: number): boolean {
  const line = lines[index].trim();
  return /^(#{1,6})\s|^```|^\$\$|^([-*_]\s*){3,}$|^>\s|^[-*+]\s|^\d+[.)]\s/.test(line) ||
    (line.startsWith('|') && index + 1 < lines.length && /^\s*\|?\s*:?-{3,}/.test(lines[index + 1]));
}

function wrapBareLatex(markdown: string): string {
  const command = String.raw`\\(?:[A-Za-z]+)(?:\s*\{(?:[^{}]|\{[^{}]*\})*\})*(?:\s*[_^]\{?[^\s{}]+\}?)*(?:\s+[A-Za-z](?:[_^]\{?[^\s{}]+\}?)?)*`;
  const atom = String.raw`(?:${command}|[A-Za-z][A-Za-z0-9]*(?:[_^]\{?[^\s{}]+\}?)*|\d+(?:\.\d+)?)`;
  const operator = String.raw`(?:=|≈|\\(?:cdot|times|approx|propto|to|rightarrow|leq|geq|neq)|[+\-*/])`;
  const equation = new RegExp(String.raw`(?<![$\\])${atom}(?:\s*${operator}\s*[-+]?${atom})+`, 'g');
  let inDisplayMath = false;
  let inCodeBlock = false;

  return markdown.split('\n').map((line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      return line;
    }
    if (!inCodeBlock && trimmed === '$$') {
      inDisplayMath = !inDisplayMath;
      return line;
    }
    if (inCodeBlock || inDisplayMath) return line;

    const normalized = line.replace(/\\\\(?=(?:vec|nabla|frac|partial|cdot|times|pi|rho|epsilon)\b)/g, '\\');
    return normalized.replace(equation, (match) => `$${match.trim()}$`);
  }).join('\n');
}

function parseMarkdown(markdown: string): MarkdownBlock[] {
  const normalized = normalizeMarkdownEscapedNewlines(markdown.replace(/\r\n?/g, '\n'));
  const lines = wrapBareLatex(normalized).split('\n');
  const blocks: MarkdownBlock[] = [];
  let index = 0;

  while (index < lines.length) {
    const trimmed = lines[index].trim();
    if (!trimmed) { index++; continue; }

    if (trimmed.startsWith('```')) {
      const language = trimmed.slice(3).trim();
      const codeLines: string[] = [];
      index++;
      while (index < lines.length && !lines[index].trim().startsWith('```')) codeLines.push(lines[index++]);
      if (index < lines.length) index++;
      blocks.push({ type: 'code', language, code: codeLines.join('\n') });
      continue;
    }

    if (trimmed === '$$' || (trimmed.startsWith('$$') && trimmed.endsWith('$$') && trimmed.length > 4)) {
      if (trimmed.length > 4) {
        blocks.push({ type: 'math', tex: trimmed.slice(2, -2).trim() });
        index++;
      } else {
        const mathLines: string[] = [];
        index++;
        while (index < lines.length && lines[index].trim() !== '$$') mathLines.push(lines[index++]);
        if (index < lines.length) index++;
        blocks.push({ type: 'math', tex: mathLines.join('\n').trim() });
      }
      continue;
    }

    const heading = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      blocks.push({ type: 'heading', level: heading[1].length, text: heading[2].trim() });
      index++;
      continue;
    }

    if (/^([-*_]\s*){3,}$/.test(trimmed)) {
      blocks.push({ type: 'rule' });
      index++;
      continue;
    }

    if (trimmed.startsWith('|') && index + 1 < lines.length && /^\s*\|?\s*:?-{3,}/.test(lines[index + 1])) {
      const rows: string[][] = [];
      const parseRow = (row: string) => row.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((cell) => inlineText(cell.trim()));
      rows.push(parseRow(lines[index++]));
      index++;
      while (index < lines.length && lines[index].trim().startsWith('|')) rows.push(parseRow(lines[index++]));
      blocks.push({ type: 'table', rows });
      continue;
    }

    const listItem = trimmed.match(/^([-*+]\s+|\d+[.)]\s+)(.+)$/);
    if (listItem) {
      const ordered = /^\d/.test(listItem[1]);
      const marker = ordered ? listItem[1].trim() : '•';
      blocks.push({ type: 'list', ordered, marker, text: listItem[2] });
      index++;
      continue;
    }

    if (trimmed.startsWith('>')) {
      const quoteLines: string[] = [];
      while (index < lines.length && lines[index].trim().startsWith('>')) quoteLines.push(lines[index++].trim().replace(/^>\s?/, ''));
      blocks.push({ type: 'quote', text: quoteLines.join(' ') });
      continue;
    }

    const paragraph: string[] = [trimmed];
    index++;
    while (index < lines.length && lines[index].trim() && !isBlockStart(lines, index)) paragraph.push(lines[index++].trim());
    const text = paragraph.join(' ');
    const inlineMath = /(?<!\\)\$([^$\n]+)\$([.,;:!?])?|\\\((.+?)\\\)([.,;:!?])?/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = inlineMath.exec(text))) {
      const before = text.slice(lastIndex, match.index).trim();
      if (before) blocks.push({ type: 'paragraph', text: before });
      blocks.push({ type: 'math', tex: `${match[1] ?? match[3]}${match[2] ?? match[4] ?? ''}`.trim() });
      lastIndex = inlineMath.lastIndex;
    }
    const after = text.slice(lastIndex).trim();
    if (after) blocks.push({ type: 'paragraph', text: after });
    if (!lastIndex && !after) blocks.push({ type: 'paragraph', text });
  }
  return blocks;
}

function newPage(doc: PDFDocumentInstance): void {
  doc.addPage({ size: 'A4', margin: PAGE_MARGIN });
  doc.x = PAGE_MARGIN;
  doc.y = PAGE_MARGIN;
}

function ensureSpace(doc: PDFDocumentInstance, height: number): void {
  if (doc.y + Math.min(height, CONTENT_BOTTOM - PAGE_MARGIN) > CONTENT_BOTTOM) newPage(doc);
}

function drawText(doc: PDFDocumentInstance, text: string, options: {
  x?: number; width?: number; font?: string; fontSize?: number; color?: string;
  lineGap?: number; spaceAfter?: number; indent?: number;
} = {}): void {
  const font = options.font ?? 'Helvetica';
  const fontSize = options.fontSize ?? 11;
  const x = options.x ?? PAGE_MARGIN;
  const width = options.width ?? CONTENT_WIDTH;
  const lineGap = options.lineGap ?? 4;
  doc.font(font).fontSize(fontSize);
  const height = doc.heightOfString(text, { width, lineGap });
  ensureSpace(doc, height + (options.spaceAfter ?? 8));
  const startY = doc.y;
  doc.fillColor(options.color ?? BODY).text(text, x, startY, { width, lineGap });
  doc.y = startY + height + (options.spaceAfter ?? 8);
}

function renderMath(doc: PDFDocumentInstance, tex: string): void {
  try {
    mathDocument ??= createMathDocument();
    const node = mathDocument.document.convert(tex, { display: true });
    const renderedMath = mathDocument.adaptor.outerHTML(node);
    const svg = renderedMath.match(/<svg\b[\s\S]*?<\/svg>/i)?.[0]
      .replace(/currentColor/g, INK);
    if (!svg) throw new Error('MathJax did not return an SVG element.');
    const widthEx = Number(svg.match(/\bwidth="([\d.]+)ex"/)?.[1]);
    const heightEx = Number(svg.match(/\bheight="([\d.]+)ex"/)?.[1]);
    if (!widthEx || !heightEx) throw new Error('MathJax did not return measurable SVG dimensions.');

    const naturalWidth = widthEx * 6;
    const naturalHeight = heightEx * 6;
    const width = Math.min(CONTENT_WIDTH - 24, naturalWidth);
    const height = naturalHeight * (width / naturalWidth);
    ensureSpace(doc, height + 18);
    const startY = doc.y;
    SVGtoPDF(doc, svg, PAGE_MARGIN + 12, startY + 2, { width, height });
    doc.y = startY + height + 18;
  } catch (error) {
    console.warn('Equation SVG rendering failed; using readable notation:', error);
    drawText(doc, readableLatex(tex), { x: PAGE_MARGIN + 12, width: CONTENT_WIDTH - 24, font: 'Helvetica', fontSize: 11, color: INK, spaceAfter: 14 });
  }
}

function drawTable(doc: PDFDocumentInstance, rows: string[][]): void {
  const columnCount = Math.max(1, ...rows.map((row) => row.length));
  const widths = Array.from({ length: columnCount }, () => CONTENT_WIDTH / columnCount);
  const drawRow = (row: string[], rowIndex: number) => {
    const cellTexts = Array.from({ length: columnCount }, (_, index) => row[index] ?? '');
    doc.font(rowIndex === 0 ? 'Helvetica-Bold' : 'Helvetica').fontSize(9.5);
    const heights = cellTexts.map((cell, index) => doc.heightOfString(cell, { width: widths[index] - 12, lineGap: 2 }));
    const rowHeight = Math.max(24, ...heights.map((height) => height + 12));
    ensureSpace(doc, rowHeight + 2);
    const rowStart = doc.y;
    let x = PAGE_MARGIN;
    cellTexts.forEach((cell, index) => {
      const background = rowIndex === 0 ? '#E9ECFA' : rowIndex % 2 === 0 ? '#F8FAFD' : '#FFFFFF';
      doc.rect(x, rowStart, widths[index], rowHeight).fillAndStroke(background, LINE);
      doc.font(rowIndex === 0 ? 'Helvetica-Bold' : 'Helvetica').fontSize(9.5)
        .fillColor(rowIndex === 0 ? INK : BODY)
        .text(cell, x + 6, rowStart + 6, { width: widths[index] - 12, lineGap: 2 });
      x += widths[index];
    });
    doc.y = rowStart + rowHeight;
  };

  rows.forEach((row, index) => drawRow(row, index));
  doc.y += 10;
}

function drawCode(doc: PDFDocumentInstance, code: string): void {
  const lines = code.split('\n');
  for (const line of lines) {
    doc.font('Courier').fontSize(8.5);
    const height = Math.max(14, doc.heightOfString(line || ' ', { width: CONTENT_WIDTH - 20 }));
    ensureSpace(doc, height + 6);
    const startY = doc.y;
    doc.rect(PAGE_MARGIN, startY - 2, CONTENT_WIDTH, height + 5).fill('#F3F5F8');
    doc.fillColor('#243249').text(line || ' ', PAGE_MARGIN + 9, startY, { width: CONTENT_WIDTH - 18 });
    doc.y = startY + height + 5;
  }
  doc.y += 8;
}

function renderBlock(doc: PDFDocumentInstance, block: MarkdownBlock, pageByHeading: Map<string, number>): void {
  if (block.type === 'heading') {
    const sizes: Record<number, number> = { 1: 17, 2: 14, 3: 12, 4: 11, 5: 10.5, 6: 10.5 };
    const fontSize = sizes[block.level] ?? 10.5;
    const text = inlineText(block.text);
    doc.font('Helvetica-Bold').fontSize(fontSize);
    const height = doc.heightOfString(text, { width: CONTENT_WIDTH });
    ensureSpace(doc, height + 28);
    pageByHeading.set(text, doc.bufferedPageRange().count);
    const startY = doc.y;
    doc.fillColor(block.level <= 2 ? INK : ACCENT).text(text, PAGE_MARGIN, startY, { width: CONTENT_WIDTH });
    doc.y = startY + height + (block.level <= 2 ? 12 : 7);
    if (block.level <= 2) {
      doc.strokeColor(LINE).lineWidth(0.7).moveTo(PAGE_MARGIN, doc.y).lineTo(PAGE_MARGIN + CONTENT_WIDTH, doc.y).stroke();
      doc.y += 9;
    }
    return;
  }
  if (block.type === 'paragraph') {
    drawText(doc, inlineText(block.text), { fontSize: 11, lineGap: 4.5, spaceAfter: 9 });
    return;
  }
  if (block.type === 'list') {
    const marker = block.ordered ? block.marker : '•';
    doc.font('Helvetica').fontSize(10.5);
    const text = inlineText(block.text);
    const height = doc.heightOfString(text, { width: CONTENT_WIDTH - 20, lineGap: 3.5 });
    ensureSpace(doc, height + 6);
    const startY = doc.y;
    doc.fillColor(ACCENT).text(marker, PAGE_MARGIN + 3, startY, { width: 20 });
    doc.fillColor(BODY).text(text, PAGE_MARGIN + 21, startY, { width: CONTENT_WIDTH - 21, lineGap: 3.5 });
    doc.y = startY + height + 6;
    return;
  }
  if (block.type === 'math') { renderMath(doc, block.tex); return; }
  if (block.type === 'code') { drawCode(doc, block.code); return; }
  if (block.type === 'table') { drawTable(doc, block.rows); return; }
  if (block.type === 'quote') {
    const text = inlineText(block.text);
    doc.font('Helvetica-Oblique').fontSize(10.5);
    const height = doc.heightOfString(text, { width: CONTENT_WIDTH - 30, lineGap: 4 });
    ensureSpace(doc, height + 18);
    const startY = doc.y;
    doc.rect(PAGE_MARGIN, startY, 3, height + 7).fill(ACCENT);
    doc.fillColor(BODY).text(text, PAGE_MARGIN + 12, startY + 2, { width: CONTENT_WIDTH - 18, lineGap: 4 });
    doc.y = startY + height + 17;
    return;
  }
  if (block.type === 'rule') {
    ensureSpace(doc, 14);
    doc.strokeColor(LINE).lineWidth(0.8).moveTo(PAGE_MARGIN, doc.y + 3).lineTo(PAGE_MARGIN + CONTENT_WIDTH, doc.y + 3).stroke();
    doc.y += 14;
  }
}

function drawCover(doc: PDFDocumentInstance, options: PDFGenerateOptions): void {
  const pageWidth = doc.page.width;
  doc.rect(0, 0, pageWidth, 18).fill(ACCENT);
  doc.fillColor(ACCENT).font('Helvetica-Bold').fontSize(14).text('MULTIGRADE MITRA', PAGE_MARGIN, 74, { characterSpacing: 1.2 });
  doc.fillColor('#65728A').font('Helvetica').fontSize(9).text('STUDY GUIDE  /  LEARNING MATERIAL', PAGE_MARGIN, 98, { characterSpacing: 0.7 });

  doc.strokeColor('#D7DDF0').lineWidth(1).moveTo(PAGE_MARGIN, 132).lineTo(PAGE_MARGIN + CONTENT_WIDTH, 132).stroke();
  doc.y = 188;
  doc.fillColor(INK).font('Helvetica-Bold').fontSize(29);
  const titleY = doc.y;
  const titleHeight = doc.heightOfString(options.title, { width: CONTENT_WIDTH, lineGap: 5 });
  doc.text(options.title, PAGE_MARGIN, titleY, {
    width: CONTENT_WIDTH,
    lineGap: 5
  });
  doc.y = titleY + titleHeight + 22;
  doc.fillColor(ACCENT).font('Helvetica-Bold').fontSize(15);
  const topicY = doc.y;
  const topicText = options.topic || options.title;
  const topicHeight = doc.heightOfString(topicText, { width: CONTENT_WIDTH });
  doc.text(topicText, PAGE_MARGIN, topicY, { width: CONTENT_WIDTH });
  doc.y = topicY + topicHeight + 12;
  doc.fillColor('#65728A').font('Helvetica').fontSize(12).text(options.subject || 'Academic Study Material', PAGE_MARGIN, doc.y);

  const details = [
    ['ACADEMIC LEVEL', [options.educationLevel, options.program].filter(Boolean).join(' · ') || 'Not specified'],
    ['DIFFICULTY', options.difficulty || 'Not specified'],
    ['SEMESTER', options.semester || 'Not specified'],
    ['GENERATED', new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })]
  ];
  const cardY = Math.max(390, doc.y + 90);
  details.forEach(([label, value], index) => {
    const y = cardY + index * 56;
    doc.fillColor('#78849A').font('Helvetica-Bold').fontSize(8).text(label, PAGE_MARGIN, y, { characterSpacing: 0.7 });
    doc.fillColor(INK).font('Helvetica').fontSize(12).text(value, PAGE_MARGIN, y + 15, { width: CONTENT_WIDTH });
  });
  doc.strokeColor('#D7DDF0').lineWidth(1).moveTo(PAGE_MARGIN, 737).lineTo(PAGE_MARGIN + CONTENT_WIDTH, 737).stroke();
  doc.fillColor('#65728A').font('Helvetica').fontSize(9).text('Prepared for learning and revision. Check course-specific requirements with your instructor.', PAGE_MARGIN, 750, { width: CONTENT_WIDTH });
}

function drawContentsPage(doc: PDFDocumentInstance, headings: Array<{ text: string; level: number }>, pageByHeading: Map<string, number>): void {
  doc.switchToPage(1);
  doc.x = PAGE_MARGIN;
  doc.y = PAGE_MARGIN;
  doc.fillColor(INK).font('Helvetica-Bold').fontSize(22).text('Contents', PAGE_MARGIN, doc.y);
  doc.y = PAGE_MARGIN + 28;
  headings.forEach((heading) => {
    const x = PAGE_MARGIN + (heading.level > 1 ? 16 : 0);
    const pageNumber = pageByHeading.get(inlineText(heading.text));
    const rowY = doc.y;
    doc.font(heading.level === 1 ? 'Helvetica-Bold' : 'Helvetica').fontSize(10.5).fillColor(BODY)
      .text(inlineText(heading.text), x, rowY, { width: CONTENT_WIDTH - (x - PAGE_MARGIN) - 35, lineBreak: false, ellipsis: true });
    if (pageNumber) doc.text(String(pageNumber), PAGE_MARGIN + CONTENT_WIDTH - 25, rowY, { width: 25, align: 'right', lineBreak: false });
    doc.y = rowY + 20;
  });
}

export function generateEducationalPDF(options: PDFGenerateOptions, res: Response): void {
  const doc = new PDFDocument({
    size: 'A4',
    margin: PAGE_MARGIN,
    bufferPages: true,
    info: {
      Title: options.title,
      Author: options.authorName || 'MultiGrade Mitra',
      Subject: `${options.subject} - ${options.topic}`,
      Keywords: 'Education, MultiGrade Mitra, Study Notes, Exam Prep, Engineering'
    }
  });

  const filename = (options.title || 'MultiGrade_Mitra_Document').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 50);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`);
  doc.on('error', (error) => {
    console.error('PDF stream error:', error);
    if (!res.headersSent) res.status(500).end('PDF generation failed.');
    else res.destroy(error);
  });
  doc.pipe(res);

  drawCover(doc, options);

  const blocks = parseMarkdown(options.content || '');
  const contentBlocks = blocks[0]?.type === 'heading' && inlineText(blocks[0].text).toLowerCase() === options.title.trim().toLowerCase()
    ? blocks.slice(1)
    : blocks;
  const headingBlocks = contentBlocks.filter((block): block is Extract<MarkdownBlock, { type: 'heading' }> => block.type === 'heading');
  const includeContents = headingBlocks.length >= 6 || (options.content?.length ?? 0) >= 4500;
  const pageByHeading = new Map<string, number>();

  if (includeContents) {
    newPage(doc);
    newPage(doc);
  } else {
    newPage(doc);
  }

  contentBlocks.forEach((block, index) => {
    if (block.type === 'heading') {
      const next = contentBlocks[index + 1];
      if (next?.type === 'paragraph') {
        doc.font('Helvetica').fontSize(11);
        const followingHeight = Math.min(38, doc.heightOfString(inlineText(next.text), { width: CONTENT_WIDTH }));
        ensureSpace(doc, followingHeight + 44);
      }
    }
    renderBlock(doc, block, pageByHeading);
  });

  const pageRange = doc.bufferedPageRange();
  if (includeContents) {
    drawContentsPage(doc, headingBlocks.map(({ text, level }) => ({ text, level })), pageByHeading);
    doc.switchToPage(pageRange.start + pageRange.count - 1);
  }

  for (let page = pageRange.start; page < pageRange.start + pageRange.count; page++) {
    doc.switchToPage(page);
    const pageHeight = doc.page.height;
    const bottomMargin = doc.page.margins.bottom;
    doc.page.margins.bottom = 0;
    doc.strokeColor(LINE).lineWidth(0.65).moveTo(PAGE_MARGIN, FOOTER_TOP).lineTo(doc.page.width - PAGE_MARGIN, FOOTER_TOP).stroke();
    doc.fillColor('#65728A').font('Helvetica').fontSize(8)
      .text('MultiGrade Mitra  ·  AI-generated learning material', PAGE_MARGIN, FOOTER_TOP + 9, {
        width: CONTENT_WIDTH - 80,
        lineBreak: false
      });
    doc.fillColor('#65728A').font('Helvetica').fontSize(8)
      .text(`${page + 1} / ${pageRange.count}`, doc.page.width - PAGE_MARGIN - 70, FOOTER_TOP + 9, {
        width: 70,
        align: 'right',
        lineBreak: false
      });
    doc.page.margins.bottom = bottomMargin;
    if (pageHeight < 800) console.warn('Unexpected PDF page size detected.');
  }

  doc.end();
}