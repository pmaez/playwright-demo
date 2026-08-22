const { spawnSync } = require('child_process');

const supportedEnvironments = new Set(['demo', 'dev', 'qa', 'uat']);
const supportedBrowsers = new Set(['chromium', 'firefox', 'webkit']);

function readArgs(argv) {
  const args = {
    env: 'demo',
    browser: 'chromium',
    tags: '',
    headed: false,
    ui: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === '--env' && next) {
      args.env = next.toLowerCase();
      index += 1;
    } else if (arg === '--browser' && next) {
      args.browser = next.toLowerCase();
      index += 1;
    } else if (arg === '--tags' && next) {
      args.tags = next;
      index += 1;
    } else if (arg === '--headed') {
      args.headed = true;
    } else if (arg === '--ui') {
      args.ui = true;
    } else if (arg === '--help' || arg === '-h') {
      args.help = true;
    }
  }

  return args;
}

function printHelp() {
  console.log(`
Usage:
  node runner/execution.js --env demo --tags smoke --browser chromium

Options:
  --env      demo | dev | qa | uat        Default: demo
  --tags     Tag list, comma-separated    Example: smoke,todo
  --browser  chromium | firefox | webkit  Default: chromium
  --headed   Run headed
  --ui       Open Playwright UI mode
`);
}

function buildGrep(tags) {
  const normalizedTags = tags
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
    .map((tag) => (tag.startsWith('@') ? tag : `@${tag}`));

  if (normalizedTags.length === 0) {
    return '';
  }

  return normalizedTags.map((tag) => `(?=.*${tag})`).join('');
}

const args = readArgs(process.argv.slice(2));

if (args.help) {
  printHelp();
  process.exit(0);
}

if (!supportedEnvironments.has(args.env)) {
  console.error(`Unsupported environment "${args.env}". Use one of: ${Array.from(supportedEnvironments).join(', ')}`);
  process.exit(1);
}

if (!supportedBrowsers.has(args.browser)) {
  console.error(`Unsupported browser "${args.browser}". Use one of: ${Array.from(supportedBrowsers).join(', ')}`);
  process.exit(1);
}

const commandArgs = ['playwright', 'test', '--project', args.browser];
const grep = buildGrep(args.tags);

if (grep) {
  commandArgs.push('--grep', grep);
}

if (args.headed) {
  commandArgs.push('--headed');
}

if (args.ui) {
  commandArgs.push('--ui');
}

console.log('Playwright framework runner');
console.log(`Environment: ${args.env}`);
console.log(`Browser: ${args.browser}`);
console.log(`Tags: ${args.tags || 'None'}`);
console.log(`Command: npx ${commandArgs.join(' ')}`);

const result = spawnSync('npx', commandArgs, {
  env: {
    ...process.env,
    TEST_ENV: args.env,
  },
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

process.exit(result.status ?? 1);
