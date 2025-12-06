const fs = require('fs');
const path = require('path');

const baseSql = fs.readFileSync(path.join(__dirname,'..','base.sql'),'utf8');

// Parse CREATE TABLE blocks
const tableRegex = /CREATE TABLE IF NOT EXISTS `?(\w+)`? \(([^;]+?)\);/gsm;
const tables = {};
let m;
while ((m = tableRegex.exec(baseSql)) !== null) {
  const name = m[1];
  const body = m[2];
  const cols = [];
  body.split(/,\n/).forEach(line=>{
    const colMatch = line.trim().match(/^`?(\w+)`?\s+(\w+)/);
    if(colMatch) cols.push(colMatch[1]);
  });
  tables[name]=new Set(cols);
}

// Fallback for older format without IF NOT EXISTS
if(Object.keys(tables).length===0){
  const tableRegex2 = /CREATE TABLE `?(\w+)`? \(([^;]+?)\)\s*;/gsm;
  while ((m = tableRegex2.exec(baseSql)) !== null) {
    const name = m[1];
    const body = m[2];
    const cols = [];
    body.split(/,\n/).forEach(line=>{
      const colMatch = line.trim().match(/^`?(\w+)`?\s+(\w+)/);
      if(colMatch) cols.push(colMatch[1]);
    });
    tables[name]=new Set(cols);
  }
}

if(Object.keys(tables).length===0){
  console.error('No tables parsed from base.sql');
  process.exit(1);
}

console.log('Parsed tables and columns:');
Object.keys(tables).forEach(t=>console.log(' -',t,Array.from(tables[t]).join(', ')));

// Read repository files
const repoDir = path.join(__dirname,'..','Server','src','repositories');
const files = fs.readdirSync(repoDir).filter(f=>f.endsWith('.js'));

const sqlTableRefRegex = /(?:FROM|INTO|UPDATE)\s+`?(\w+)`?/i;
const identRegex = /`?(\w+)`?\s*(?:,|\)|=|\bAS\b|\bFROM\b|\bWHERE\b|\bSET\b|\bVALUES\b)/ig;

const problems = [];

files.forEach(file=>{
  const content = fs.readFileSync(path.join(repoDir,file),'utf8');
  const sqlStrings = [];
  // crude: find backtick or single/double-quoted SQL snippets
  const strRegex = /(?:['\"])((?:SELECT|INSERT|UPDATE|DELETE)[\s\S]*?)(?:['\"])/ig;
  let sm;
  while((sm = strRegex.exec(content))!==null){
    sqlStrings.push(sm[1]);
  }
  // also find db.query(`...`)
  const qRegex = /db\.query\s*\(\s*`([\s\S]*?)`/g;
  while((sm = qRegex.exec(content))!==null){
    sqlStrings.push(sm[1]);
  }

  sqlStrings.forEach(sql=>{
    const tableMatch = sql.match(sqlTableRefRegex);
    if(!tableMatch) return;
    const table = tableMatch[1];
    const cols = tables[table] ? tables[table] : null;
    if(!cols) {
      problems.push({file,sql,issue:`Table ${table} not found in base.sql`});
      return;
    }
    // find identifiers in column lists after SELECT or in INSERT (...) etc
    // simplistic: extract tokens that look like column names
    const tokens = new Set();
    let r;
    while((r = identRegex.exec(sql))!==null){
      tokens.add(r[1]);
    }
    // Known SQL keywords to ignore
    const ignore = new Set(['SELECT','FROM','WHERE','AND','OR','INSERT','INTO','VALUES','UPDATE','SET','ORDER','BY','LIMIT','OFFSET','GROUP','HAVING','AS','DESC','ASC','JOIN']);
    tokens.forEach(tok=>{
      if(ignore.has(tok.toUpperCase())) return;
      if(/\'|\"|\d+/.test(tok)) return;
      if(!cols.has(tok) && !tok.match(/LAST_INSERT_ID|NOW|CURRENT_TIMESTAMP|COUNT|SUM|MIN|MAX/)){
        problems.push({file,table,sqlSnippet: sql.replace(/\n/g,' ').slice(0,200),col:tok,issue:`Column '${tok}' not in table '${table}'`});
      }
    });
  });
});

if(problems.length===0){
  console.log('\nNo obvious mismatches found between repository SQL and base.sql columns.');
} else {
  console.log('\nProblems found:');
  problems.forEach(p=>console.log('-',p.file,p.issue, p.col?('col='+p.col):'', p.table?('table='+p.table):''));
}

process.exit(0);
