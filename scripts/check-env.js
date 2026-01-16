#!/usr/bin/env node

/**
 * 环境检查脚本
 * 用于验证本地开发环境是否正确配置
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function check(message, condition, fix = '') {
  const status = condition ? `${colors.green}✓${colors.reset}` : `${colors.red}✗${colors.reset}`;
  console.log(`${status} ${message}`);
  if (!condition && fix) {
    console.log(`  ${colors.yellow}→ 解决方法: ${fix}${colors.reset}`);
  }
  return condition;
}

console.log(`${colors.blue}环境检查开始...${colors.reset}\n`);

let allPass = true;

// 检查 Node.js 版本
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
allPass = check(`Node.js 版本: ${nodeVersion}`, majorVersion >= 18, '请安装 Node.js 18 或更高版本') && allPass;

// 检查 npm 版本
try {
  const { execSync } = require('child_process');
  const npmVersion = execSync('npm --version', { encoding: 'utf-8' }).trim();
  check(`npm 版本: ${npmVersion}`, true);
} catch (e) {
  allPass = check('npm 可用', false, '请确保已安装 npm') && allPass;
}

// 检查必要文件
const requiredFiles = [
  'package.json',
  'next.config.js',
  'tsconfig.json',
  'tailwind.config.js',
  'app/layout.tsx',
  'app/page.tsx',
  'components/AVBSigner.tsx',
  'public/scripts/avbtool.py',
  'public/coi-serviceworker.js',
  'public/coi-sw.js',
];

console.log(`\n${colors.blue}检查必要文件...${colors.reset}`);
requiredFiles.forEach((file) => {
  const exists = fs.existsSync(path.join(process.cwd(), file));
  allPass = check(`文件存在: ${file}`, exists, `请确保文件 ${file} 存在`) && allPass;
});

// 检查 node_modules
const nodeModulesExists = fs.existsSync(path.join(process.cwd(), 'node_modules'));
if (nodeModulesExists) {
  check('依赖已安装 (node_modules 存在)', true);
} else {
  allPass = check('依赖已安装', false, '请运行: npm install') && allPass;
}

// 检查 package.json 中的关键依赖
try {
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8')
  );
  const requiredDeps = ['next', 'react', 'react-dom', 'pyodide'];
  console.log(`\n${colors.blue}检查关键依赖...${colors.reset}`);
  requiredDeps.forEach((dep) => {
    const hasDep = packageJson.dependencies && packageJson.dependencies[dep];
    check(`依赖: ${dep}`, hasDep, `请在 package.json 中添加 ${dep}`);
  });
} catch (e) {
  console.log(`${colors.red}✗${colors.reset} 无法读取 package.json: ${e.message}`);
  allPass = false;
}

// 总结
console.log(`\n${'='.repeat(50)}`);
if (allPass) {
  console.log(`${colors.green}✓ 环境检查通过！可以开始开发了。${colors.reset}`);
  console.log(`\n运行以下命令启动开发服务器:`);
  console.log(`  ${colors.blue}npm run dev${colors.reset}\n`);
} else {
  console.log(`${colors.red}✗ 环境检查未通过，请解决上述问题。${colors.reset}\n`);
  process.exit(1);
}