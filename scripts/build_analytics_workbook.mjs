import fs from 'node:fs/promises';
import path from 'node:path';
import { SpreadsheetFile, Workbook } from '@oai/artifact-tool';

const outputDir = path.resolve('outputs/deraaskalderij-analytics');
const outputPath = path.join(outputDir, 'De-Raaskalderij-Analytics.xlsx');
const previewDir = path.join(outputDir, 'previews');

const colors = {
  ink: '#111111',
  paper: '#F5F0E6',
  orange: '#F15A24',
  yellow: '#F2C94C',
  input: '#FFF4C2',
  sage: '#DCE6D6',
  muted: '#6E6A62',
  white: '#FFFFFF',
  line: '#D7D0C4',
};

const postHeaders = [
  'Date', 'Post URL', 'Post title', 'Topic', 'Format', 'Opening hook', 'CTA', 'Publish time',
  'Reach', 'Likes', 'Comments', 'Shares', 'Saves', 'Profile visits', 'Follows', 'Interactions',
  'Engagement rate', 'Share rate', 'Save rate', 'Profile visit rate', 'Follow rate', 'Reel completion rate', 'Notes',
];

const websiteHeaders = [
  'Week starting', 'Users', 'Sessions', 'Page views', 'Engaged sessions', 'Organic search users', 'Direct users',
  'Social users', 'Instagram users', 'Referral users', 'Top landing page', 'Newsletter page views',
  'Newsletter signups', 'Signup conversion rate', 'Search Console notes', 'Data notes',
];

const instagramWeeklyHeaders = [
  'Week starting', 'Followers (end)', 'New follows', 'Accounts reached', 'Content interactions', 'Profile visits',
  'Website taps', 'Story link taps', 'Non-follower reach %', 'Reels plays', 'Average watch time (sec)', 'Notes',
];

const titleStyle = { fill: colors.ink, font: { bold: true, color: colors.paper, size: 16 } };
const sectionStyle = { fill: colors.orange, font: { bold: true, color: colors.white } };
const headerStyle = { fill: colors.ink, font: { bold: true, color: colors.paper } };
const inputStyle = { fill: colors.input };
const formulaStyle = { fill: colors.sage };

function title(sheet, range, text) {
  sheet.mergeCells(range);
  const cell = sheet.getRange(range.split(':')[0]);
  cell.values = [[text]];
  cell.format = titleStyle;
  cell.format.rowHeight = 30;
  cell.format.horizontalAlignment = 'left';
  cell.format.verticalAlignment = 'center';
}

function section(sheet, range, text) {
  sheet.mergeCells(range);
  const cell = sheet.getRange(range.split(':')[0]);
  cell.values = [[text]];
  cell.format = sectionStyle;
}

function setWidths(sheet, widths) {
  for (const [column, width] of Object.entries(widths)) sheet.getRange(`${column}:${column}`).format.columnWidth = width;
}

function styleHeader(sheet, range) {
  sheet.getRange(range).format = headerStyle;
  sheet.getRange(range).format.wrapText = true;
  sheet.getRange(range).format.horizontalAlignment = 'center';
  sheet.getRange(range).format.verticalAlignment = 'center';
  sheet.getRange(range).format.rowHeight = 34;
}

function percentFormat(sheet, range) {
  sheet.getRange(range).format.numberFormat = '0.0%';
}

function makePostsSheet(workbook) {
  const sheet = workbook.worksheets.add('Instagram Posts');
  title(sheet, 'A1:W1', 'INSTAGRAM POSTS - 48-HOUR POST SCORECARD');
  sheet.getRange('A2:W2').values = [postHeaders];
  styleHeader(sheet, 'A2:W2');
  sheet.getRange('A3:W3').values = [[
    '2026-07-09', 'https://www.instagram.com/p/Dalico7DQn8/', 'Start hier: De Raaskalderij', 'Intro', 'Static card',
    'Brand premise', 'Follow + link in bio', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
    '',
  ]];
  sheet.getRange('A3:W102').format.wrapText = true;
  sheet.getRange('A3:O102').format = inputStyle;
  sheet.getRange('W3:W102').format = inputStyle;
  sheet.getRange('P3:V102').format = formulaStyle;
  for (let row = 3; row <= 102; row += 1) {
    sheet.getRange(`P${row}:V${row}`).formulas = [[
      `=IFERROR(J${row}+K${row}+L${row}+M${row},0)`,
      `=IFERROR(P${row}/I${row},0)`,
      `=IFERROR(L${row}/I${row},0)`,
      `=IFERROR(M${row}/I${row},0)`,
      `=IFERROR(N${row}/I${row},0)`,
      `=IFERROR(O${row}/I${row},0)`,
      '',
    ]];
  }
  percentFormat(sheet, 'Q3:V102');
  sheet.getRange('A3:A102').format.numberFormat = 'yyyy-mm-dd';
  sheet.getRange('H3:H102').format.numberFormat = 'hh:mm';
  sheet.getRange('A2:W102').format.borders = { style: 'continuous', color: colors.line };
  sheet.freezePanes.freezeRows(2);
  setWidths(sheet, { A: 13, B: 34, C: 31, D: 16, E: 16, F: 20, G: 20, H: 13, I: 12, J: 10, K: 11, L: 10, M: 10, N: 15, O: 10, P: 13, Q: 15, R: 12, S: 12, T: 18, U: 13, V: 19, W: 30 });
  sheet.getRange('A2:W102').format.autofitRows();
  sheet.getRange('Q3:V102').conditionalFormats.add('colorScale', {
    criteria: [
      { type: 'lowestValue', color: '#F4D8D0' },
      { type: 'percentile', value: 50, color: '#FFF1B3' },
      { type: 'highestValue', color: '#B9D8B2' },
    ],
  });
}

function makeWebsiteSheet(workbook) {
  const sheet = workbook.worksheets.add('Website Weekly');
  title(sheet, 'A1:P1', 'WEBSITE WEEKLY - GA4 + SEARCH CONSOLE');
  sheet.getRange('A2:P2').values = [websiteHeaders];
  styleHeader(sheet, 'A2:P2');
  sheet.getRange('A3:P55').format = inputStyle;
  sheet.getRange('N3:N55').format = formulaStyle;
  for (let row = 3; row <= 55; row += 1) sheet.getRange(`N${row}`).formulas = [[`=IFERROR(M${row}/L${row},0)`]];
  sheet.getRange('A3:A55').format.numberFormat = 'yyyy-mm-dd';
  percentFormat(sheet, 'N3:N55');
  sheet.getRange('A2:P55').format.borders = { style: 'continuous', color: colors.line };
  sheet.freezePanes.freezeRows(2);
  setWidths(sheet, { A: 15, B: 12, C: 12, D: 13, E: 17, F: 19, G: 13, H: 13, I: 16, J: 14, K: 36, L: 22, M: 19, N: 21, O: 34, P: 30 });
  sheet.getRange('A2:P55').format.wrapText = true;
  sheet.getRange('A2:P55').format.autofitRows();
}

function makeInstagramWeeklySheet(workbook) {
  const sheet = workbook.worksheets.add('Instagram Weekly');
  title(sheet, 'A1:L1', 'INSTAGRAM WEEKLY - ACCOUNT INSIGHTS');
  sheet.getRange('A2:L2').values = [instagramWeeklyHeaders];
  styleHeader(sheet, 'A2:L2');
  sheet.getRange('A3:L55').format = inputStyle;
  sheet.getRange('A3:A55').format.numberFormat = 'yyyy-mm-dd';
  percentFormat(sheet, 'I3:I55');
  sheet.getRange('A2:L55').format.borders = { style: 'continuous', color: colors.line };
  sheet.freezePanes.freezeRows(2);
  setWidths(sheet, { A: 15, B: 17, C: 14, D: 19, E: 21, F: 15, G: 14, H: 17, I: 20, J: 14, K: 24, L: 30 });
  sheet.getRange('A2:L55').format.wrapText = true;
  sheet.getRange('A2:L55').format.autofitRows();
}

function makeTaxonomySheet(workbook) {
  const sheet = workbook.worksheets.add('Taxonomy');
  title(sheet, 'A1:D1', 'EDITORIAL TAXONOMY - KEEP LABELS CONSISTENT');
  sheet.getRange('A3:D3').values = [['Topic', 'Format', 'Opening hook', 'CTA']];
  styleHeader(sheet, 'A3:D3');
  const rows = [
    ['Voetbal', 'Static card', 'Straight news', 'Follow'],
    ['Politiek', 'Carousel', 'Absurd escalation', 'Link in bio'],
    ['Vlaanderen', 'Reel', 'Quote parody', 'Read full story'],
    ['Brussel', 'Story', 'Local specificity', 'Share with a friend'],
    ['Gent', 'Photo post', 'Expectation reversal', 'Comment your take'],
    ['Cultuur', '', 'Deadpan fact', 'Save this'],
    ['Werk', '', 'Visual contradiction', 'No CTA'],
    ['Intro', '', 'Brand premise', 'Follow + link in bio'],
  ];
  sheet.getRange(`A4:D${rows.length + 3}`).values = rows;
  sheet.getRange(`A3:D${rows.length + 3}`).format.borders = { style: 'continuous', color: colors.line };
  setWidths(sheet, { A: 22, B: 22, C: 28, D: 28 });
}

function makeGuideSheet(workbook) {
  const sheet = workbook.worksheets.add('How To Use');
  title(sheet, 'A1:D1', 'HOW TO USE THE ANALYTICS SYSTEM');
  const rows = [
    ['Cadence', 'After 48 hours', 'Enter Instagram post-level insights for each new post or Reel.', 'Do not judge a post on likes alone.'],
    ['Cadence', 'Every Monday', 'Add Instagram account Insights and GA4 acquisition figures.', 'Use the same Monday-to-Sunday period every week.'],
    ['Source', 'Instagram Insights', 'Reach, likes, comments, shares, saves, profile visits, follows, Reel watch data.', 'Use post-level Insights, not the grid preview.'],
    ['Source', 'GA4 Traffic acquisition', 'Users, sessions, page views, source / medium, newsletter events.', 'Filter `ig / social` for Instagram traffic.'],
    ['Source', 'Google Search Console', 'Clicks, impressions and emerging search queries.', 'Keep concise notes until organic search needs its own tracker.'],
    ['Metric', 'Engagement rate', '(Likes + comments + shares + saves) / reach', 'Shows response from the reached audience.'],
    ['Metric', 'Share rate', 'Shares / reach', 'Best signal that a joke travels beyond the current audience.'],
    ['Metric', 'Follow rate', 'Follows / reach', 'Best signal for audience growth.'],
    ['Metric', 'Newsletter conversion', 'Newsletter signups / newsletter page views', 'Shows whether site visitors take a deeper relationship.'],
  ];
  sheet.getRange('A3:D3').values = [['Type', 'When / Metric', 'What to enter or calculate', 'Interpretation']];
  styleHeader(sheet, 'A3:D3');
  sheet.getRange(`A4:D${rows.length + 3}`).values = rows;
  sheet.getRange(`A3:D${rows.length + 3}`).format.borders = { style: 'continuous', color: colors.line };
  sheet.getRange(`A3:D${rows.length + 3}`).format.wrapText = true;
  sheet.getRange(`A3:D${rows.length + 3}`).format.autofitRows();
  setWidths(sheet, { A: 14, B: 26, C: 54, D: 48 });
}

function makeDashboard(workbook) {
  const sheet = workbook.worksheets.add('Dashboard');
  title(sheet, 'A1:L1', 'DE RAASKALDERIJ - GROWTH SCOREBOARD');
  section(sheet, 'A3:F3', 'INSTAGRAM OUTCOMES');
  section(sheet, 'H3:L3', 'WEBSITE OUTCOMES');
  sheet.getRange('A4:F5').values = [
    ['Post reach', 'Engagement rate', 'Post follows', 'Share rate', 'Save rate', 'Posts tracked'],
    ['', '', '', '', '', ''],
  ];
  sheet.getRange('H4:L5').values = [
    ['Website users', 'Instagram users', 'Newsletter views', 'Newsletter signups', 'Signup conversion'],
    ['', '', '', '', ''],
  ];
  sheet.getRange('A4:F4').format = headerStyle;
  sheet.getRange('H4:L4').format = headerStyle;
  sheet.getRange('A5:F5').format = { fill: colors.sage, font: { bold: true, color: colors.ink, size: 14 } };
  sheet.getRange('H5:L5').format = { fill: colors.sage, font: { bold: true, color: colors.ink, size: 14 } };
  sheet.getRange('A5:F5').formulas = [[
    "=SUM('Instagram Posts'!I3:I102)",
    "=IFERROR(SUM('Instagram Posts'!P3:P102)/SUM('Instagram Posts'!I3:I102),0)",
    "=SUM('Instagram Posts'!O3:O102)",
    "=IFERROR(SUM('Instagram Posts'!L3:L102)/SUM('Instagram Posts'!I3:I102),0)",
    "=IFERROR(SUM('Instagram Posts'!M3:M102)/SUM('Instagram Posts'!I3:I102),0)",
    "=COUNTIF('Instagram Posts'!I3:I102,\">0\")",
  ]];
  sheet.getRange('H5:L5').formulas = [[
    "=SUM('Website Weekly'!B3:B55)",
    "=SUM('Website Weekly'!I3:I55)",
    "=SUM('Website Weekly'!L3:L55)",
    "=SUM('Website Weekly'!M3:M55)",
    "=IFERROR(SUM('Website Weekly'!M3:M55)/SUM('Website Weekly'!L3:L55),0)",
  ]];
  percentFormat(sheet, 'B5:B5');
  percentFormat(sheet, 'D5:E5');
  percentFormat(sheet, 'L5:L5');

  section(sheet, 'A8:F8', 'WHAT TOPICS ARE WINNING?');
  sheet.getRange('A9:F9').values = [['Topic', 'Posts', 'Avg reach', 'Avg engagement', 'Avg shares', 'Avg follows']];
  styleHeader(sheet, 'A9:F9');
  const topics = ['Voetbal', 'Politiek', 'Vlaanderen', 'Brussel', 'Gent', 'Cultuur', 'Werk', 'Intro'];
  sheet.getRange('A10:A17').values = topics.map(topic => [topic]);
  for (let row = 10; row <= 17; row += 1) {
    sheet.getRange(`B${row}:F${row}`).formulas = [[
      `=COUNTIF('Instagram Posts'!D3:D102,A${row})`,
      `=IFERROR(AVERAGEIF('Instagram Posts'!D3:D102,A${row},'Instagram Posts'!I3:I102),0)`,
      `=IFERROR(AVERAGEIF('Instagram Posts'!D3:D102,A${row},'Instagram Posts'!Q3:Q102),0)`,
      `=IFERROR(AVERAGEIF('Instagram Posts'!D3:D102,A${row},'Instagram Posts'!L3:L102),0)`,
      `=IFERROR(AVERAGEIF('Instagram Posts'!D3:D102,A${row},'Instagram Posts'!O3:O102),0)`,
    ]];
  }
  percentFormat(sheet, 'D10:D17');

  section(sheet, 'H8:L8', 'WHICH FORMATS ARE WINNING?');
  sheet.getRange('H9:L9').values = [['Format', 'Posts', 'Avg reach', 'Avg engagement', 'Avg follows']];
  styleHeader(sheet, 'H9:L9');
  const formats = ['Static card', 'Carousel', 'Reel', 'Story', 'Photo post'];
  sheet.getRange('H10:H14').values = formats.map(format => [format]);
  for (let row = 10; row <= 14; row += 1) {
    sheet.getRange(`I${row}:L${row}`).formulas = [[
      `=COUNTIF('Instagram Posts'!E3:E102,H${row})`,
      `=IFERROR(AVERAGEIF('Instagram Posts'!E3:E102,H${row},'Instagram Posts'!I3:I102),0)`,
      `=IFERROR(AVERAGEIF('Instagram Posts'!E3:E102,H${row},'Instagram Posts'!Q3:Q102),0)`,
      `=IFERROR(AVERAGEIF('Instagram Posts'!E3:E102,H${row},'Instagram Posts'!O3:O102),0)`,
    ]];
  }
  percentFormat(sheet, 'K10:K14');

  section(sheet, 'A20:L20', 'DECISION RULE');
  sheet.mergeCells('A21:L23');
  sheet.getRange('A21').values = [["Call a topic or format a winner only after at least three posts. Prioritise a combination of above-average reach and either share rate or follow rate. Use Instagram reach for distribution, GA4 `ig / social` for website visits, and `newsletter_signup` for the deepest conversion."]];
  sheet.getRange('A21').format = { fill: colors.paper, font: { italic: true, color: colors.muted } };
  sheet.getRange('A21').format.wrapText = true;
  sheet.getRange('A21').format.verticalAlignment = 'center';
  sheet.getRange('A21').format.borders = { style: 'continuous', color: colors.line };

  sheet.getRange('A9:F17').format.borders = { style: 'continuous', color: colors.line };
  sheet.getRange('H9:L14').format.borders = { style: 'continuous', color: colors.line };
  sheet.getRange('D10:D17').conditionalFormats.add('colorScale', {
    criteria: [
      { type: 'lowestValue', color: '#F4D8D0' },
      { type: 'percentile', value: 50, color: '#FFF1B3' },
      { type: 'highestValue', color: '#B9D8B2' },
    ],
  });
  sheet.getRange('K10:K14').conditionalFormats.add('colorScale', {
    criteria: [
      { type: 'lowestValue', color: '#F4D8D0' },
      { type: 'percentile', value: 50, color: '#FFF1B3' },
      { type: 'highestValue', color: '#B9D8B2' },
    ],
  });
  setWidths(sheet, { A: 20, B: 14, C: 16, D: 18, E: 15, F: 15, G: 4, H: 20, I: 14, J: 16, K: 18, L: 18 });
  sheet.getRange('A1:L23').format.wrapText = true;
  sheet.getRange('A1:L23').format.autofitRows();
  sheet.freezePanes.freezeRows(1);
}

await fs.mkdir(outputDir, { recursive: true });
await fs.mkdir(previewDir, { recursive: true });

const workbook = Workbook.create();
makePostsSheet(workbook);
makeWebsiteSheet(workbook);
makeInstagramWeeklySheet(workbook);
makeTaxonomySheet(workbook);
makeGuideSheet(workbook);
makeDashboard(workbook);

for (const sheetName of ['Dashboard', 'Instagram Posts', 'Website Weekly']) {
  const preview = await workbook.render({ sheetName, autoCrop: 'all', scale: 1, format: 'png' });
  await fs.writeFile(path.join(previewDir, `${sheetName.replace(/ /g, '-').toLowerCase()}.png`), new Uint8Array(await preview.arrayBuffer()));
}

const xlsx = await SpreadsheetFile.exportXlsx(workbook);
await xlsx.save(outputPath);

console.log(outputPath);
