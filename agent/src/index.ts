import { discoverServers } from './discovery.js';

async function main() {
  const found = discoverServers();
  console.log('Discovered MCP code-mode servers/tools:');
  for (const s of found) {
    console.log(`- ${s.name}: ${s.tools.join(', ') || '(no tools found)'}`);
  }
}

main().catch(err => {
  console.error('agent index error:', err);
  process.exit(1);
});