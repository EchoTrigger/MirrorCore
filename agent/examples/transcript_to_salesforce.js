// 代码模式示例：从 Google Drive 读取会议记录并更新 Salesforce 线索
// 注意：需要配置 MCP_SERVER_URL 指向可达的 MCP 服务器，且该服务器暴露 google_drive__get_document 与 salesforce__update_record 工具
import * as gdrive from '../src/servers/google-drive/index.js';
import * as salesforce from '../src/servers/salesforce/index.js';
async function run() {
    const transcript = (await gdrive.getDocument({ documentId: 'abc123' })).content;
    const result = await salesforce.updateRecord({
        objectType: 'SalesMeeting',
        recordId: '00Q5f000001abcXYZ',
        data: { Notes: transcript }
    });
    console.log('Salesforce update result:', result);
}
run().catch(err => {
    console.error('Example failed:', err);
    process.exit(1);
});
