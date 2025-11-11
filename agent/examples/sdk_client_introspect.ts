// 动态探测 MCP SDK 客户端导出，便于实现正式客户端调用层
async function main() {
  try {
    const mcpClient = await import('@modelcontextprotocol/sdk/client/mcp.js');
    console.log('client/mcp.js exports:', Object.keys(mcpClient));
  } catch (e) {
    console.error('Failed to import client/mcp.js:', e);
  }

  try {
    const httpClient = await import('@modelcontextprotocol/sdk/client/streamableHttp.js');
    console.log('client/streamableHttp.js exports:', Object.keys(httpClient));
  } catch (e) {
    console.error('Failed to import client/streamableHttp.js:', e);
  }

  try {
    const stdioClient = await import('@modelcontextprotocol/sdk/client/stdio.js');
    console.log('client/stdio.js exports:', Object.keys(stdioClient));
  } catch (e) {
    console.error('Failed to import client/stdio.js:', e);
  }
}

main().catch(err => {
  console.error('Introspect failed:', err);
  process.exit(1);
});