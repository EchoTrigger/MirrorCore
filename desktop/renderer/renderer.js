// 全局变量
let agentName = '智能助手';
// 通用偏好设置（除 Chat 外的其他设置项）
let appPreferences = {
    enableAgent: true,
    enableMCP: true,
    mcpServerUrl: 'http://localhost:3001',
    enableNotifications: true,
    enableSound: false,
    enableAnalytics: false,
    theme: 'auto',
    language: 'zh-CN',
    dataRetention: 30,
    enableBuilder: true,
    enableCodeExecution: false
};
let selectedImage = null;
let currentConversationId = null;
let conversations = [];
let socket = null; // Socket.IO 连接
let enableThinking = true; // 是否请求服务端返回“思考过程”（与设置联动）
// 搜索运行时配置（从后端读取/保存）
let searchRuntimeConfig = {
    method: 'auto',
    engine: 'bing',
    maxResults: 8,
    locale: 'zh-CN',
    headless: true,
    timeoutMs: 30000,
    maxQuestions: 3
};
let chatSettings = {
    model: '',
    temperature: 0.7,
    maxTokens: 2000,
    enableThinking: true,
    agentName: '智能助手',
    personalityPrompt: '',
    agentAvatar: '',
    userSalutation: ''
};
// 活跃的流式消息映射：messageId -> { messageDiv, bubble, answerEl, reasoningEl, fullAnswer, fullReasoning }
const activeStreams = {};
// 等待服务端 stream_start 的占位气泡队列
const pendingStreamBubbles = [];

// DOM 元素
const chatContainer = document.getElementById('chat-container');
const messagesContainer = document.getElementById('messages-container');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const attachBtn = document.getElementById('attach-btn');
const imageInput = document.getElementById('image-input');
const imagePreview = document.getElementById('image-preview');
const sidebar = document.getElementById('sidebar');
const conversationsList = document.getElementById('conversations-list');
const newChatBtn = document.getElementById('new-chat-btn');
const sidebarToggle = document.getElementById('sidebar-toggle');
// 搜索面板元素
const searchSection = document.getElementById('search-section');
const openSearchPanelBtn = document.getElementById('open-search-panel');
const closeSearchPanelBtn = document.getElementById('close-search-panel');
const searchInputEl = document.getElementById('search-input');
const searchBtnEl = document.getElementById('search-btn');
const searchStatusEl = document.getElementById('search-status');
const searchResultsEl = document.getElementById('search-results');

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
    // 直接显示聊天界面
    showChatInterface();
    
    // 绑定事件监听器
    bindEventListeners();

    // 初始化 Socket 连接（用于实时流）
    initSocket();
    
    // 初始化发送按钮状态
    updateSendButtonState();
    
    // 加载并初始化设置
    await initSettings();

    // 加载对话历史
    await loadConversations();
});

// 绑定事件监听器
function bindEventListeners() {
    // 发送消息
    if (sendBtn) {
        sendBtn.addEventListener('click', sendMessage);
    }

    if (messageInput) {
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        
        messageInput.addEventListener('input', autoResizeTextarea);
    }

    // 图片上传
    if (attachBtn && imageInput) {
        attachBtn.addEventListener('click', () => {
            imageInput.click();
        });
        
        imageInput.addEventListener('change', handleImageSelect);
    }

    // 设置按钮
    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', openSettings);
    }

    // 侧边栏相关事件
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }

    if (newChatBtn) {
        newChatBtn.addEventListener('click', startNewConversation);
    }

    // 初始化右键菜单
    initContextMenu();

    // 绑定设置面板标签点击滚动行为
    bindSettingsTabScroll();

    // 搜索面板入口
    if (openSearchPanelBtn) {
        openSearchPanelBtn.addEventListener('click', openSearchPanel);
    }
    if (closeSearchPanelBtn) {
        closeSearchPanelBtn.addEventListener('click', closeSearchPanel);
    }
    if (searchBtnEl) {
        searchBtnEl.addEventListener('click', () => {
            const q = (searchInputEl?.value || '').trim();
            if (!q) {
                setSearchStatus('请输入关键词', 'error');
                return;
            }
            performSearch(q);
        });
    }
    if (searchInputEl) {
        searchInputEl.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const q = (searchInputEl?.value || '').trim();
                if (!q) return;
                performSearch(q);
            }
        });
    }
}

// 显示聊天界面
function showChatInterface() {
    if (chatContainer) {
        chatContainer.style.display = 'flex';
    }
    if (messageInput) {
        messageInput.focus();
    }
    showWelcomeMessage();
}

// 显示欢迎消息
function showWelcomeMessage() {
    const welcomeMsg = messagesContainer.querySelector('.welcome-message');
    if (welcomeMsg) {
        const content = welcomeMsg.querySelector('.message-content');
        content.innerHTML = `
            <p>你好！我是 ${agentName}，你的助手。</p>
            <p>我可以帮你处理各种任务，提供智能对话和协助。</p>
            <p>试试对我说："你好" 或 "帮我搜索信息"</p>
        `;
    }
}

// 打开搜索面板
function openSearchPanel() {
    if (searchSection) {
        searchSection.style.display = 'block';
    }
    const welcomeSection = document.getElementById('welcome-section');
    if (welcomeSection) {
        welcomeSection.style.display = 'none';
    }
    const messagesContainer = document.getElementById('messages-container');
    if (messagesContainer) {
        messagesContainer.style.display = 'none';
    }
    if (searchInputEl) {
        searchInputEl.focus();
    }
}

function closeSearchPanel() {
    if (searchSection) {
        searchSection.style.display = 'none';
    }
    const welcomeSection = document.getElementById('welcome-section');
    if (welcomeSection) {
        welcomeSection.style.display = '';
    }
}

function setSearchStatus(text, type = 'info') {
    if (!searchStatusEl) return;
    searchStatusEl.style.display = text ? 'block' : 'none';
    searchStatusEl.textContent = text || '';
    searchStatusEl.style.background = type === 'error' ? 'var(--error-container)' : 'var(--surface-container)';
    searchStatusEl.style.color = type === 'error' ? 'var(--on-error-container)' : 'var(--on-surface-variant)';
}

async function performSearch(query) {
    try {
        setSearchStatus('正在搜索中...');
        if (searchResultsEl) searchResultsEl.innerHTML = '';
        const params = new URLSearchParams({ query });
        const res = await fetch(`/api/search?${params.toString()}`);
        if (!res.ok) {
            const text = await res.text();
            throw new Error(text || `HTTP ${res.status}`);
        }
        const data = await res.json();
        const { results = [], engineUsed, modeUsed } = data || {};
        setSearchStatus(`搜索完成（模式：${modeUsed || 'auto'}；引擎：${engineUsed || 'auto'}；条数：${results.length}）`);
        renderSearchResults(results);
    } catch (err) {
        setSearchStatus(`搜索失败：${(err && err.message) || String(err)}`, 'error');
    }
}

function renderSearchResults(results) {
    if (!Array.isArray(results)) return;
    if (!searchResultsEl) return;
    if (results.length === 0) {
        searchResultsEl.innerHTML = '<div class="search-status">未找到相关结果</div>';
        return;
    }
    const frag = document.createDocumentFragment();
    for (const item of results) {
        const el = document.createElement('div');
        el.className = 'search-result-item';
        const safeTitle = escapeHtml(item.title || '无标题');
        const safeSnippet = escapeHtml(item.snippet || '');
        const url = item.url || '#';
        const source = item.source || 'unknown';
        const sourceMeta = getSourceMeta(source);
        el.innerHTML = `
            <div class="search-result-title"><a href="${url}" target="_blank" rel="noopener noreferrer">${safeTitle}</a></div>
            <div class="search-result-snippet">${safeSnippet}</div>
            <div class="search-result-meta">
                <span class="source-badge"><span class="material-symbols-outlined source-icon">${sourceMeta.icon}</span>${sourceMeta.label}</span>
                <span class="on-surface-variant" style="font-size: var(--font-size-xs);">${escapeHtml(url)}</span>
            </div>
        `;
        frag.appendChild(el);
    }
    searchResultsEl.innerHTML = '';
    searchResultsEl.appendChild(frag);
}

function getSourceMeta(source) {
    switch (source) {
        case 'google': return { icon: 'language', label: 'Google' };
        case 'bing': return { icon: 'globe', label: 'Bing' };
        case 'baidu': return { icon: 'public', label: 'Baidu' };
        case 'duckduckgo': return { icon: 'shield', label: 'DuckDuckGo' };
        default: return { icon: 'help', label: String(source || '未知') };
    }
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// 发送消息
async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message && !selectedImage) return;

    // 切换到聊天界面（隐藏欢迎界面，显示消息容器）
    const welcomeSection = document.getElementById('welcome-section');
    const messagesContainer = document.getElementById('messages-container');
    
    if (welcomeSection.style.display !== 'none') {
        welcomeSection.style.display = 'none';
        messagesContainer.style.display = 'block';
    }

    // 显示用户消息
    addMessage(message, 'user', selectedImage);
    
    // 清空输入
    const imageData = selectedImage;
    messageInput.value = '';
    selectedImage = null;
    removeImagePreview();
    autoResizeTextarea();

    // 处理消息
    await processMessage(message, imageData);
}

// 处理消息
async function processMessage(message, imageData) {
    // 优先尝试：使用后端 LLM 解析“打开<站点>并搜索<关键词>”
    try {
        const llmIntent = await tryLLMParseSiteSearch(message);
        if (llmIntent && llmIntent.type === 'open') {
            try {
                const url = llmIntent.url;
                window.open(url, '_blank', 'noopener,noreferrer');
                addMessage(`已在浏览器中打开 ${llmIntent.name || url}`, 'assistant');
            } catch (e) {
                addMessage(`打开失败：${(e && e.message) || String(e)}`, 'assistant');
            }
            return;
        }
    } catch (e) {
        console.warn('LLM 站点搜索意图解析失败，继续本地规则：', e);
    }

    // 智能意图识别与模式切换
    const intent = detectSmartIntent(message);
    if (intent && intent.type === 'open') {
        try {
            const url = intent.url;
            window.open(url, '_blank', 'noopener,noreferrer');
            addMessage(`已在浏览器中打开 ${intent.name || url}`, 'assistant');
        } catch (e) {
            addMessage(`打开失败：${(e && e.message) || String(e)}`, 'assistant');
        }
        return;
    }

    if (intent && (intent.type === 'search_fast' || intent.type === 'search_research' || intent.type === 'search_cn')) {
        try {
            await performSmartSearchAndSummarize(message, intent);
        } catch (e) {
            addMessage(`搜索分析失败：${(e && e.message) || String(e)}`, 'assistant');
        }
        return;
    }

    if (intent && intent.type === 'summarize_url') {
        try {
            await performUrlVisitAndSummarize(intent.url, intent.headed === true);
        } catch (e) {
            addMessage(`网址总结失败：${(e && e.message) || String(e)}`, 'assistant');
        }
        return;
    }

    // 默认：走 WebSocket 实时流
    await sendMessageViaSocket(message, imageData);
}

// 通过 Socket.IO 发送消息并接收实时流
async function sendMessageViaSocket(message, imageData) {
    if (!socket) {
        console.warn('Socket 未初始化，尝试重新连接');
        initSocket();
    }

    // 创建一个占位的 AI 气泡，用于后续填充流式内容
    const { messageDiv, bubble, answerEl, reasoningEl } = createAssistantStreamMessage();
    pendingStreamBubbles.push({ messageDiv, bubble, answerEl, reasoningEl });

    // 发送请求到服务端
    socket.emit('stream_chat', {
        conversationId: currentConversationId,
        message,
        imageData,
        // 向服务端发送本次请求的配置项
        options: {
            model: chatSettings.model || undefined,
            temperature: chatSettings.temperature,
            maxTokens: chatSettings.maxTokens,
            enableThinking: chatSettings.enableThinking,
            // 传递当前自定义的智能体名称，影响服务端系统提示
            agentName: agentName,
            personalityPrompt: chatSettings.personalityPrompt || '',
            userSalutation: chatSettings.userSalutation || ''
        }
    });
}

// 添加消息
function addMessage(text, sender, image = null) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const time = formatTime(new Date());
    
    // 创建头像
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    if (sender === 'user') {
        avatar.textContent = 'U';
    } else {
        if (chatSettings.agentAvatar) {
            avatar.innerHTML = `<img src="${chatSettings.agentAvatar}" alt="助手头像">`;
            avatar.style.background = 'transparent';
        } else {
            avatar.innerHTML = '✨'; // 默认图标
        }
    }
    
    // 创建消息气泡
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    
    let imageHtml = '';
    if (image) {
        imageHtml = `<div class="message-image"><img src="${image}" alt="上传的图片" onclick="openImageModal('${image}')"></div>`;
    }
    
    // 助手消息展示名称
    const assistantHeaderHtml = sender === 'assistant' ? `<div class="message-header"><span class="assistant-name">${agentName}</span></div>` : '';
    bubble.innerHTML = `
        <div class="message-content">
            ${assistantHeaderHtml}
            ${imageHtml}
            <p>${text}</p>
        </div>
        <div class="message-time">${time}</div>
    `;
    
    // 组装消息结构
    if (sender === 'user') {
        // 用户消息：气泡在左，头像在右
        messageDiv.appendChild(bubble);
        messageDiv.appendChild(avatar);
    } else {
        // AI消息：头像在左，气泡在右
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(bubble);
    }
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // 返回创建的DOM元素
    return messageDiv;
}

// 创建一个用于流式显示的助手消息气泡（包含“思考过程”折叠区）
function createAssistantStreamMessage() {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message assistant-message';

    const time = formatTime(new Date());

    // 头像
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    if (chatSettings.agentAvatar) {
        avatar.innerHTML = `<img src="${chatSettings.agentAvatar}" alt="助手头像">`;
        avatar.style.background = 'transparent';
    } else {
        avatar.innerHTML = '✨';
    }

    // 气泡
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble loading';

    // 内容容器
    const contentWrap = document.createElement('div');
    contentWrap.className = 'message-content';

    // 顶部名称
    const header = document.createElement('div');
    header.className = 'message-header';
    const nameEl = document.createElement('span');
    nameEl.className = 'assistant-name';
    nameEl.textContent = agentName;
    header.appendChild(nameEl);

    // 答案内容（流式追加）
    const answerEl = document.createElement('p');
    answerEl.className = 'answer-content';
    answerEl.textContent = '正在思考中...';

    // 思考过程（折叠）
    const reasoningDetails = document.createElement('details');
    reasoningDetails.className = 'reasoning-collapse';
    const summary = document.createElement('summary');
    summary.textContent = '思考过程';
    const reasoningEl = document.createElement('div');
    reasoningEl.className = 'reasoning-content';
    reasoningEl.textContent = '';
    reasoningDetails.appendChild(summary);
    reasoningDetails.appendChild(reasoningEl);
    // 如果未启用思考过程，则隐藏该区域
    if (!chatSettings.enableThinking) {
        reasoningDetails.style.display = 'none';
    }

    const timeEl = document.createElement('div');
    timeEl.className = 'message-time';
    timeEl.textContent = time;

    contentWrap.appendChild(header);
    contentWrap.appendChild(answerEl);
    contentWrap.appendChild(reasoningDetails);
    bubble.appendChild(contentWrap);
    bubble.appendChild(timeEl);

    // 组装结构（助手消息：头像在左，气泡在右）
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(bubble);

    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    return { messageDiv, bubble, answerEl, reasoningEl };
}

// 初始化 Socket 连接与事件监听
function initSocket() {
    try {
        // 连接到后端 Socket.IO 服务
        socket = io('http://localhost:3000');

        socket.on('connect', () => {
            console.log('Socket 已连接:', socket.id);
        });

        socket.on('disconnect', () => {
            console.log('Socket 已断开连接');
        });

        // 当服务端创建了新的对话
        socket.on('conversation_created', ({ conversationId }) => {
            currentConversationId = conversationId;
            // 更新侧边栏列表
            loadConversations();
        });

        // 确认已接收用户消息（可选用于状态提示）
        socket.on('message_received', ({ conversationId, message }) => {
            // 这里可以在 UI 上标记“已送达”，当前先忽略
            // console.log('服务端已接收消息', conversationId, message);
        });

        // 流开始：为最近的占位气泡绑定 messageId
        socket.on('stream_start', ({ conversationId, messageId }) => {
            const pending = pendingStreamBubbles.shift();
            if (!pending) return;
            activeStreams[messageId] = {
                messageDiv: pending.messageDiv,
                bubble: pending.bubble,
                answerEl: pending.answerEl,
                reasoningEl: pending.reasoningEl,
                fullAnswer: '',
                fullReasoning: ''
            };
            // 更新当前对话ID
            currentConversationId = conversationId || currentConversationId;
        });

        // 流内容：答案或思考过程分块追加
        socket.on('stream_content', ({ conversationId, messageId, content, type }) => {
            const stream = activeStreams[messageId];
            if (!stream) return;
            if (type === 'answer') {
                stream.fullAnswer += content;
                stream.answerEl.textContent = stream.fullAnswer;
            } else if (type === 'reasoning') {
                stream.fullReasoning += content;
                stream.reasoningEl.textContent = stream.fullReasoning;
            }
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        });

        // 流结束：收尾、更新时间与对话列表
        socket.on('stream_end', async ({ conversationId, messageId, message, usage, error }) => {
            const stream = activeStreams[messageId];
            if (!stream) return;
            // 移除 loading 状态
            stream.bubble.classList.remove('loading');
            // 更新时间戳
            const timeEl = stream.bubble.querySelector('.message-time');
            if (timeEl) {
                timeEl.textContent = formatTime(new Date());
            }
            // 若服务端返回最终 message，其中 reasoning_content 可能存在
            if (message && message.reasoning_content && stream.fullReasoning.length === 0) {
                stream.reasoningEl.textContent = message.reasoning_content;
            }
            // 更新当前对话ID
            if (conversationId) {
                currentConversationId = conversationId;
            }
            // 刷新对话列表，确保摘要与更新时间展示正确
            await loadConversations();
            // 清理映射
            delete activeStreams[messageId];
        });

        // 通用错误处理
        socket.on('error', (payload) => {
            console.error('Socket 错误:', payload);
            // 将最近的占位气泡移除，并提示错误
            const pending = pendingStreamBubbles.shift();
            const target = pending || Object.values(activeStreams)[0];
            if (target) {
                // 移除 loading
                target.bubble.classList.remove('loading');
                target.answerEl.textContent = '抱歉，AI 服务暂时不可用，请稍后再试。';
            } else {
                addMessage('抱歉，AI 服务暂时不可用，请稍后再试。', 'assistant');
            }
        });

    } catch (e) {
        console.error('初始化 Socket 失败:', e);
    }
}

// 处理图片选择
function handleImageSelect(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            selectedImage = e.target.result;
            showImagePreview(selectedImage, file.name);
            updateSendButtonState(); // 更新发送按钮状态
        };
        reader.readAsDataURL(file);
    }
}

// 显示图片预览
function showImagePreview(imageSrc, fileName) {
    if (imagePreview) {
        imagePreview.innerHTML = `
            <img src="${imageSrc}" alt="${fileName}">
            <button onclick="removeImagePreview()" class="remove-image">×</button>
        `;
        imagePreview.style.display = 'block';
    }
}

// 移除图片预览
function removeImagePreview() {
    if (imagePreview) {
        imagePreview.innerHTML = '';
        imagePreview.style.display = 'none';
    }
    selectedImage = null;
    updateSendButtonState(); // 更新发送按钮状态
}

// 自动调整文本框高度
function autoResizeTextarea() {
    if (messageInput) {
        messageInput.style.height = 'auto';
        messageInput.style.height = messageInput.scrollHeight + 'px';
    }
    // 更新发送按钮状态
    updateSendButtonState();
}

// 更新发送按钮状态
function updateSendButtonState() {
    if (sendBtn && messageInput) {
        const hasText = messageInput.value.trim().length > 0;
        const hasImage = selectedImage !== null;
        sendBtn.disabled = !(hasText || hasImage);
    }
}

// 格式化时间
function formatTime(date) {
    return date.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

// 打开图片模态框
function openImageModal(imageSrc) {
    const modal = document.getElementById('image-modal');
    const modalImage = document.getElementById('modal-image');
    
    if (modal && modalImage) {
        modalImage.src = imageSrc;
        modal.style.display = 'flex';
        
        // 添加ESC键关闭功能
        document.addEventListener('keydown', handleModalKeydown);
    }
}

// 关闭图片模态框
function closeImageModal() {
    const modal = document.getElementById('image-modal');
    
    if (modal) {
        modal.style.display = 'none';
        
        // 移除ESC键监听
        document.removeEventListener('keydown', handleModalKeydown);
    }
}

// 处理模态框键盘事件
function handleModalKeydown(e) {
    if (e.key === 'Escape') {
        closeImageModal();
    }
}

// ===== 设置联动：前端设置影响模型、温度、最大tokens、是否启用reasoning =====

async function initSettings() {
    try {
        // 从本地存储加载设置
        const saved = localStorage.getItem('chatSettings');
        if (saved) {
            chatSettings = { ...chatSettings, ...JSON.parse(saved) };
        }
        // 加载通用偏好设置
        const savedPrefs = localStorage.getItem('appPreferences');
        if (savedPrefs) {
            appPreferences = { ...appPreferences, ...JSON.parse(savedPrefs) };
        }
        // 若未设置模型，尝试从后端获取默认模型
        if (!chatSettings.model) {
            const resp = await fetch('http://localhost:3000/api/chat/ai-status');
            if (resp.ok) {
                const data = await resp.json();
                if (data?.model) {
                    chatSettings.model = data.model;
                }
            }
        }
        // 同步到全局 enableThinking
        enableThinking = !!chatSettings.enableThinking;
        // 同步智能体名称到全局变量
        agentName = chatSettings.agentName || agentName;
        updateAgentNameUI();
        // 应用通用偏好至运行时（语言、主题等）
        applyRuntimePreferences();
        // 从后端拉取搜索运行时配置
        try {
            const respSearch = await fetch('http://localhost:3000/api/settings/search');
            if (respSearch.ok) {
                const data = await respSearch.json();
                const rt = data?.runtime || {};
                searchRuntimeConfig = {
                    method: rt.method || searchRuntimeConfig.method,
                    engine: rt.engine || searchRuntimeConfig.engine,
                    maxResults: typeof rt.maxResults === 'number' ? rt.maxResults : searchRuntimeConfig.maxResults,
                    locale: rt.locale || searchRuntimeConfig.locale,
                    headless: typeof rt.headless === 'boolean' ? rt.headless : searchRuntimeConfig.headless,
                    timeoutMs: typeof rt.timeoutMs === 'number' ? rt.timeoutMs : searchRuntimeConfig.timeoutMs,
                    maxQuestions: typeof rt.maxQuestions === 'number' ? rt.maxQuestions : searchRuntimeConfig.maxQuestions
                };
            }
        } catch (err) {
            console.warn('加载搜索设置失败:', err);
        }
        // 初始化设置面板的显示值
        applySettingsToUI();
    } catch (e) {
        console.warn('初始化设置失败:', e);
    }
}

function applySettingsToUI() {
    const modal = document.getElementById('settings-modal');
    const agentNameInput = document.getElementById('agent-name-setting');
    const personalityInput = document.getElementById('agent-personality-setting');
    const userSalutationInput = document.getElementById('user-salutation-setting');
    const avatarInput = document.getElementById('agent-avatar-input');
    const avatarPreview = document.getElementById('agent-avatar-preview');
    const removeAvatarBtn = document.getElementById('remove-agent-avatar');
    const modelInput = document.getElementById('model-input');
    const maxTokensInput = document.getElementById('max-tokens');
    const maxTokensValue = maxTokensInput ? maxTokensInput.nextElementSibling : null;
    const temperatureInput = document.getElementById('temperature');
    const temperatureValue = temperatureInput ? temperatureInput.nextElementSibling : null;
    const enableThinkingInput = document.getElementById('enable-thinking');

    // 其他设置项元素
    const enableAgentInput = document.getElementById('enable-agent');
    const enableMCPInput = document.getElementById('enable-mcp');
    const mcpServerUrlInput = document.getElementById('mcp-server-url');
    const enableBuilderInput = document.getElementById('enable-builder');
    const enableCodeExecInput = document.getElementById('enable-code-execution');
    const dataRetentionSelect = document.getElementById('data-retention');
    const themeSelect = document.getElementById('theme-select');
    const languageSelect = document.getElementById('language-select');
    const enableNotificationsInput = document.getElementById('enable-notifications');
    const enableSoundInput = document.getElementById('enable-sound');
    const enableAnalyticsInput = document.getElementById('enable-analytics');

    // 搜索设置元素
    const searchMethodSelect = document.getElementById('search-method-select');
    const searchEngineSelect = document.getElementById('search-engine-select');
    const searchMaxResultsInput = document.getElementById('search-max-results');
    const searchLocaleSelect = document.getElementById('search-locale');
    const searchHeadlessInput = document.getElementById('search-headless');
    const searchTimeoutInput = document.getElementById('search-timeout-ms');

    if (agentNameInput) agentNameInput.value = chatSettings.agentName || agentName || '';
    if (personalityInput) personalityInput.value = chatSettings.personalityPrompt || '';
    if (userSalutationInput) userSalutationInput.value = chatSettings.userSalutation || '';
    if (avatarPreview) {
        if (chatSettings.agentAvatar) {
            avatarPreview.src = chatSettings.agentAvatar;
            avatarPreview.style.display = 'block';
        } else {
            avatarPreview.src = '';
            avatarPreview.style.display = 'none';
        }
    }
    if (modelInput) modelInput.value = chatSettings.model || '';
    if (maxTokensInput) maxTokensInput.value = chatSettings.maxTokens;
    if (maxTokensValue) maxTokensValue.textContent = `${chatSettings.maxTokens} tokens`;
    if (temperatureInput) temperatureInput.value = chatSettings.temperature;
    if (temperatureValue) temperatureValue.textContent = `${chatSettings.temperature}`;
    if (enableThinkingInput) enableThinkingInput.checked = !!chatSettings.enableThinking;

    // 应用其他设置到UI
    if (enableAgentInput) enableAgentInput.checked = !!appPreferences.enableAgent;
    if (enableMCPInput) enableMCPInput.checked = !!appPreferences.enableMCP;
    if (mcpServerUrlInput) mcpServerUrlInput.value = appPreferences.mcpServerUrl || '';
    if (enableBuilderInput) enableBuilderInput.checked = !!appPreferences.enableBuilder;
    if (enableCodeExecInput) enableCodeExecInput.checked = !!appPreferences.enableCodeExecution;
    if (dataRetentionSelect) dataRetentionSelect.value = String(appPreferences.dataRetention);
    if (themeSelect) themeSelect.value = appPreferences.theme || 'auto';
    if (languageSelect) languageSelect.value = appPreferences.language || 'zh-CN';
    if (enableNotificationsInput) enableNotificationsInput.checked = !!appPreferences.enableNotifications;
    if (enableSoundInput) enableSoundInput.checked = !!appPreferences.enableSound;
    if (enableAnalyticsInput) enableAnalyticsInput.checked = !!appPreferences.enableAnalytics;

    // 应用搜索设置到UI
    if (searchMethodSelect) searchMethodSelect.value = searchRuntimeConfig.method || 'auto';
    if (searchEngineSelect) searchEngineSelect.value = searchRuntimeConfig.engine || 'bing';
    if (searchMaxResultsInput) searchMaxResultsInput.value = String(searchRuntimeConfig.maxResults || 8);
    if (searchLocaleSelect) searchLocaleSelect.value = searchRuntimeConfig.locale || 'zh-CN';
    if (searchHeadlessInput) searchHeadlessInput.checked = !!searchRuntimeConfig.headless;
    if (searchTimeoutInput) searchTimeoutInput.value = String(searchRuntimeConfig.timeoutMs || 30000);

    // 绑定输入的变化以更新显示值
    if (maxTokensInput) {
        maxTokensInput.addEventListener('input', () => {
            if (maxTokensValue) maxTokensValue.textContent = `${maxTokensInput.value} tokens`;
        });
    }
    if (temperatureInput) {
        temperatureInput.addEventListener('input', () => {
            if (temperatureValue) temperatureValue.textContent = `${temperatureInput.value}`;
        });
    }

    // 绑定头像事件
    if (avatarInput) {
        avatarInput.onchange = handleAgentAvatarChange;
    }
    if (removeAvatarBtn) {
        removeAvatarBtn.onclick = () => {
            chatSettings.agentAvatar = '';
            localStorage.setItem('chatSettings', JSON.stringify(chatSettings));
            const preview = document.getElementById('agent-avatar-preview');
            if (preview) {
                preview.src = '';
                preview.style.display = 'none';
            }
        };
    }

    // 绑定关闭/保存/重置事件
    const closeBtn = document.getElementById('close-settings');
    const saveBtn = document.getElementById('save-settings-btn');
    const resetBtn = document.getElementById('reset-settings-btn');

    if (closeBtn) closeBtn.onclick = closeSettings;
    if (saveBtn) saveBtn.onclick = saveSettings;
    if (resetBtn) resetBtn.onclick = resetSettings;
}

// 打开设置模态框
function openSettings() {
    const modal = document.getElementById('settings-modal');
    if (modal) {
        modal.style.display = 'flex';
        // 应用当前设置到面板
        applySettingsToUI();
        // ESC 关闭
        document.addEventListener('keydown', handleSettingsEsc);
        // 点击遮罩关闭
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeSettings();
        });
    }
}

function handleSettingsEsc(e) {
    if (e.key === 'Escape') closeSettings();
}

function closeSettings() {
    const modal = document.getElementById('settings-modal');
    if (modal) {
        modal.style.display = 'none';
        document.removeEventListener('keydown', handleSettingsEsc);
    }
}

// 设置面板：点击上方标签（Chat / Builder / 通用）平滑滚动到对应内容位置
function bindSettingsTabScroll() {
    try {
        const modal = document.getElementById('settings-modal');
        const tabs = document.querySelectorAll('#settings-modal .settings-tabs .tab-btn');
        const contentContainer = document.querySelector('#settings-modal .settings-content');

        if (!modal || !tabs || !contentContainer) return;

        tabs.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = btn.getAttribute('data-tab');
                if (!targetId) return;
                const targetEl = document.getElementById(targetId);
                if (!targetEl) return;

                // 切换激活样式
                tabs.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // 计算目标在容器中的相对位置并平滑滚动
                const containerRect = contentContainer.getBoundingClientRect();
                const targetRect = targetEl.getBoundingClientRect();
                const topOffset = targetRect.top - containerRect.top + contentContainer.scrollTop;
                contentContainer.scrollTo({ top: topOffset, behavior: 'smooth' });
            });
        });
    } catch (err) {
        console.warn('绑定设置标签滚动失败:', err);
    }
}

function saveSettings() {
    const agentNameInput = document.getElementById('agent-name-setting');
    const personalityInput = document.getElementById('agent-personality-setting');
    const userSalutationInput = document.getElementById('user-salutation-setting');
    const avatarPreview = document.getElementById('agent-avatar-preview');
    const modelInput = document.getElementById('model-input');
    const maxTokensInput = document.getElementById('max-tokens');
    const temperatureInput = document.getElementById('temperature');
    const enableThinkingInput = document.getElementById('enable-thinking');

    // 其他设置项元素
    const enableAgentInput = document.getElementById('enable-agent');
    const enableMCPInput = document.getElementById('enable-mcp');
    const mcpServerUrlInput = document.getElementById('mcp-server-url');
    const enableBuilderInput = document.getElementById('enable-builder');
    const enableCodeExecInput = document.getElementById('enable-code-execution');
    const dataRetentionSelect = document.getElementById('data-retention');
    const themeSelect = document.getElementById('theme-select');
    const languageSelect = document.getElementById('language-select');
    const enableNotificationsInput = document.getElementById('enable-notifications');
    const enableSoundInput = document.getElementById('enable-sound');
    const enableAnalyticsInput = document.getElementById('enable-analytics');

    const newSettings = {
        agentName: agentNameInput ? agentNameInput.value.trim() || '智能助手' : chatSettings.agentName,
        personalityPrompt: personalityInput ? personalityInput.value.trim() : chatSettings.personalityPrompt,
        userSalutation: userSalutationInput ? userSalutationInput.value.trim() : chatSettings.userSalutation,
        agentAvatar: avatarPreview && avatarPreview.src ? avatarPreview.src : chatSettings.agentAvatar,
        model: modelInput ? modelInput.value.trim() : chatSettings.model,
        maxTokens: maxTokensInput ? parseInt(maxTokensInput.value, 10) : chatSettings.maxTokens,
        temperature: temperatureInput ? parseFloat(temperatureInput.value) : chatSettings.temperature,
        enableThinking: enableThinkingInput ? !!enableThinkingInput.checked : chatSettings.enableThinking
    };

    chatSettings = { ...chatSettings, ...newSettings };
    enableThinking = !!chatSettings.enableThinking;
    agentName = chatSettings.agentName || agentName;
    localStorage.setItem('chatSettings', JSON.stringify(chatSettings));
    updateAgentNameUI();
    updateAssistantAvatarUI();

    // 保存通用偏好
    const newPrefs = {
        enableAgent: enableAgentInput ? !!enableAgentInput.checked : appPreferences.enableAgent,
        enableMCP: enableMCPInput ? !!enableMCPInput.checked : appPreferences.enableMCP,
        mcpServerUrl: mcpServerUrlInput ? (mcpServerUrlInput.value.trim() || appPreferences.mcpServerUrl) : appPreferences.mcpServerUrl,
        enableNotifications: enableNotificationsInput ? !!enableNotificationsInput.checked : appPreferences.enableNotifications,
        enableSound: enableSoundInput ? !!enableSoundInput.checked : appPreferences.enableSound,
        enableAnalytics: enableAnalyticsInput ? !!enableAnalyticsInput.checked : appPreferences.enableAnalytics,
        theme: themeSelect ? (themeSelect.value || appPreferences.theme) : appPreferences.theme,
        language: languageSelect ? (languageSelect.value || appPreferences.language) : appPreferences.language,
        dataRetention: dataRetentionSelect ? parseInt(dataRetentionSelect.value, 10) : appPreferences.dataRetention,
        enableBuilder: enableBuilderInput ? !!enableBuilderInput.checked : appPreferences.enableBuilder,
        enableCodeExecution: enableCodeExecInput ? !!enableCodeExecInput.checked : appPreferences.enableCodeExecution
    };
    appPreferences = { ...appPreferences, ...newPrefs };
    localStorage.setItem('appPreferences', JSON.stringify(appPreferences));
    applyRuntimePreferences();
    // 保存搜索运行时配置到后端
    try {
        const searchMethodSelect = document.getElementById('search-method-select');
        const searchEngineSelect = document.getElementById('search-engine-select');
        const searchMaxResultsInput = document.getElementById('search-max-results');
        const searchLocaleSelect = document.getElementById('search-locale');
        const searchHeadlessInput = document.getElementById('search-headless');
        const searchTimeoutInput = document.getElementById('search-timeout-ms');
        const nextSearchRuntime = {
            method: searchMethodSelect ? searchMethodSelect.value : searchRuntimeConfig.method,
            engine: searchEngineSelect ? searchEngineSelect.value : searchRuntimeConfig.engine,
            maxResults: searchMaxResultsInput ? parseInt(searchMaxResultsInput.value, 10) : searchRuntimeConfig.maxResults,
            locale: searchLocaleSelect ? searchLocaleSelect.value : searchRuntimeConfig.locale,
            headless: searchHeadlessInput ? !!searchHeadlessInput.checked : searchRuntimeConfig.headless,
            timeoutMs: searchTimeoutInput ? parseInt(searchTimeoutInput.value, 10) : searchRuntimeConfig.timeoutMs
        };
        fetch('http://localhost:3000/api/settings/search', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nextSearchRuntime)
        }).then(resp => resp.json())
          .then(data => {
              if (data?.ok) {
                  searchRuntimeConfig = { ...searchRuntimeConfig, ...nextSearchRuntime };
              } else {
                  console.warn('保存搜索设置失败:', data?.error);
              }
          }).catch(err => {
              console.warn('保存搜索设置异常:', err);
          });
    } catch (err) {
        console.warn('构造保存搜索设置失败:', err);
    }
    closeSettings();
}

function resetSettings() {
    chatSettings = {
        agentName: chatSettings.agentName || '智能助手',
        personalityPrompt: '',
        agentAvatar: '',
        userSalutation: '',
        model: chatSettings.model || '',
        temperature: 0.7,
        maxTokens: 2000,
        enableThinking: true
    };
    enableThinking = !!chatSettings.enableThinking;
    agentName = chatSettings.agentName || '智能助手';
    localStorage.setItem('chatSettings', JSON.stringify(chatSettings));
    // 重置其他设置为默认
    appPreferences = {
        enableAgent: true,
        enableMCP: true,
        mcpServerUrl: 'http://localhost:3001',
        enableNotifications: true,
        enableSound: false,
        enableAnalytics: false,
        theme: 'auto',
        language: 'zh-CN',
        dataRetention: 30,
        enableBuilder: true,
        enableCodeExecution: false
    };
    localStorage.setItem('appPreferences', JSON.stringify(appPreferences));
    applyRuntimePreferences();
    // 重置搜索运行时配置并同步到后端
    searchRuntimeConfig = {
        method: 'auto',
        engine: 'bing',
        maxResults: 8,
        locale: 'zh-CN',
        headless: true,
        timeoutMs: 30000,
        maxQuestions: 3
    };
    fetch('http://localhost:3000/api/settings/search', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchRuntimeConfig)
    }).catch(err => console.warn('重置搜索设置到后端失败:', err));
    applySettingsToUI();
}

// 根据设置更新 UI 上的智能体展示
function updateAgentNameUI() {
    try {
        // 更新欢迎区域副标题
        const subtitle = document.querySelector('.welcome-subtitle');
        if (subtitle) {
            const salutation = (chatSettings && chatSettings.userSalutation && chatSettings.userSalutation.trim()) ? chatSettings.userSalutation.trim() : '';
            if (salutation) {
                subtitle.textContent = `嗨，${salutation}！我是你的智能助手：${agentName}，可以帮你处理各种任务`;
            } else {
                subtitle.textContent = `我是你的智能助手：${agentName}，可以帮你处理各种任务`;
            }
        }

        // 同步更新现有消息中的助手名称
        const nameNodes = document.querySelectorAll('.assistant-name');
        nameNodes.forEach(node => {
            node.textContent = agentName;
        });

        // 可选：更新浏览器标签标题（不影响功能，仅可见）
        if (typeof document !== 'undefined' && document.title) {
            if (!document.title.includes(agentName)) {
                document.title = `MirrorCore - ${agentName}`;
            }
        }
    } catch (err) {
        console.warn('更新智能体名称展示失败:', err);
    }
}

// 根据设置更新现有消息中的助手头像
function updateAssistantAvatarUI() {
    try {
        const avatars = document.querySelectorAll('.assistant-message .message-avatar');
        avatars.forEach(el => {
            if (chatSettings.agentAvatar) {
                el.innerHTML = `<img src="${chatSettings.agentAvatar}" alt="助手头像">`;
                el.style.background = 'transparent';
            } else {
                el.innerHTML = '✨';
                el.style.background = '';
            }
        });
    } catch (err) {
        console.warn('更新助手头像展示失败:', err);
    }
}

// 应用通用偏好至运行时（语言、主题等）
function applyRuntimePreferences() {
    try {
        // 应用语言
        if (appPreferences.language) {
            document.documentElement.lang = appPreferences.language;
        }
        // 主题标记（当前样式未实现暗色/浅色切换，但保留数据属性供将来使用）
        if (appPreferences.theme) {
            document.documentElement.setAttribute('data-theme', appPreferences.theme);
        }
    } catch (err) {
        console.warn('应用通用偏好失败:', err);
    }
}

// 处理智能体头像文件选择
function handleAgentAvatarChange(e) {
    try {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = reader.result;
            if (typeof dataUrl === 'string') {
                chatSettings.agentAvatar = dataUrl;
                localStorage.setItem('chatSettings', JSON.stringify(chatSettings));
                const preview = document.getElementById('agent-avatar-preview');
                if (preview) {
                    preview.src = dataUrl;
                    preview.style.display = 'block';
                }
            }
        };
        reader.readAsDataURL(file);
    } catch (err) {
        console.warn('设置头像失败:', err);
    }
}

// ==================== 对话管理功能 ====================

// 加载对话列表
async function loadConversations() {
    try {
        const response = await fetch('http://localhost:3000/api/chat/conversations');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        conversations = data.conversations || [];
        renderConversationsList();
    } catch (error) {
        console.error('加载对话列表失败:', error);
    }
}

// 渲染对话列表
function renderConversationsList() {
    if (!conversationsList) return;
    
    conversationsList.innerHTML = '';
    
    // 按固定状态和更新时间排序
    const sortedConversations = [...conversations].sort((a, b) => {
        // 固定的对话排在前面
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        
        // 相同固定状态下按更新时间排序
        return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
    
    sortedConversations.forEach(conversation => {
        const item = document.createElement('div');
        item.className = 'conversation-item';
        item.dataset.conversationId = conversation.id;
        
        if (conversation.id === currentConversationId) {
            item.classList.add('active');
        }
        
        if (conversation.isPinned) {
            item.classList.add('pinned');
        }
        
        const date = new Date(conversation.updatedAt);
        const formattedDate = formatDate(date);
        
        item.innerHTML = `
            <div class="conversation-title">${conversation.title}</div>
            <div class="conversation-summary">${conversation.summary}</div>
            <div class="conversation-date">${formattedDate}</div>
        `;
        
        // 左键点击加载对话
        item.addEventListener('click', () => loadConversation(conversation.id));
        
        // 右键显示菜单
        item.addEventListener('contextmenu', (e) => showContextMenu(e, conversation.id));
        
        conversationsList.appendChild(item);
    });
}

// 加载特定对话
async function loadConversation(conversationId) {
    try {
        const response = await fetch(`http://localhost:3000/api/chat/conversations/${conversationId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const conversation = await response.json();
        currentConversationId = conversationId;
        
        // 清空当前消息
        messagesContainer.innerHTML = '';
        
        // 显示消息容器，隐藏欢迎界面
        const welcomeSection = document.getElementById('welcome-section');
        welcomeSection.style.display = 'none';
        messagesContainer.style.display = 'block';
        
        // 渲染对话消息
        conversation.messages.forEach(message => {
            addMessage(message.content, message.role, message.imageData);
        });
        
        // 更新对话列表的活动状态
        renderConversationsList();
        
        // 滚动到底部
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    } catch (error) {
        console.error('加载对话失败:', error);
        alert('加载对话失败，请稍后再试。');
    }
}

// 开始新对话
function startNewConversation() {
    currentConversationId = null;
    
    // 清空消息容器
    messagesContainer.innerHTML = '';
    
    // 显示欢迎界面，确保使用flex布局居中
    const welcomeSection = document.getElementById('welcome-section');
    const chatMain = document.querySelector('.chat-main');
    
    // 强制重置布局 - 先隐藏所有元素
    welcomeSection.style.display = 'none';
    messagesContainer.style.display = 'none';
    
    // 强制重绘和重新计算布局
    if (chatMain) {
        chatMain.offsetHeight; // 触发重绘
    }
    welcomeSection.offsetHeight; // 触发重绘
    
    // 确保父容器布局正确
    if (chatMain) {
        chatMain.style.display = 'flex';
        chatMain.style.flexDirection = 'column';
        chatMain.style.height = '100%';
    }
    
    // 重新显示欢迎界面，使用requestAnimationFrame确保在下一帧渲染
    requestAnimationFrame(() => {
        welcomeSection.style.display = 'flex';
        welcomeSection.style.flex = '1';
        welcomeSection.style.alignItems = 'center';
        welcomeSection.style.justifyContent = 'center';
    });
    
    // 更新对话列表的活动状态
    renderConversationsList();
    
    // 聚焦输入框
    if (messageInput) {
        messageInput.focus();
    }
}

// 切换侧边栏
function toggleSidebar() {
    if (sidebar) {
        sidebar.classList.toggle('collapsed');
    }
}

// 格式化日期
function formatDate(date) {
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
        return '今天';
    } else if (days === 1) {
        return '昨天';
    } else if (days < 7) {
        return `${days}天前`;
    } else {
        return date.toLocaleDateString('zh-CN', { 
            month: 'short', 
            day: 'numeric' 
        });
    }
}

// 生成会话ID
function generateSessionId() {
    return 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

// 右键菜单相关变量
let contextMenu = null;
let renameDialog = null;
let deleteDialog = null;
let deleteConfirmBtn = null;
let deleteErrorEl = null;
let currentContextConversationId = null;

// 初始化右键菜单
function initContextMenu() {
    contextMenu = document.getElementById('context-menu');
    renameDialog = document.getElementById('rename-dialog');
    deleteDialog = document.getElementById('delete-dialog');
    // 删除对话框元素
    deleteConfirmBtn = document.getElementById('delete-confirm');
    deleteErrorEl = document.getElementById('delete-error');
    
    // 右键菜单项事件
    document.getElementById('pin-conversation').addEventListener('click', handlePinConversation);
    document.getElementById('rename-conversation').addEventListener('click', handleRenameConversation);
    document.getElementById('delete-conversation').addEventListener('click', handleDeleteConversation);
    
    // 重命名对话框事件
    document.getElementById('rename-dialog-close').addEventListener('click', closeRenameDialog);
    document.getElementById('rename-cancel').addEventListener('click', closeRenameDialog);
    document.getElementById('rename-confirm').addEventListener('click', confirmRename);
    // 删除对话框事件
    document.getElementById('delete-cancel').addEventListener('click', closeDeleteDialog);
    document.getElementById('delete-confirm').addEventListener('click', confirmDelete);
    
    // 点击其他地方关闭菜单（仅在菜单可见时关闭，避免误清除当前对话ID）
    document.addEventListener('click', (e) => {
        if (contextMenu && contextMenu.style.display === 'block' && !contextMenu.contains(e.target)) {
            hideContextMenu();
        }
    });
    
    // 点击对话框外部关闭对话框
    renameDialog.addEventListener('click', (e) => {
        if (e.target === renameDialog) {
            closeRenameDialog();
        }
    });
    deleteDialog.addEventListener('click', (e) => {
        if (e.target === deleteDialog) {
            closeDeleteDialog();
        }
    });
    
    // 回车键确认重命名
    document.getElementById('rename-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            confirmRename();
        }
    });
}

// 显示右键菜单
function showContextMenu(e, conversationId) {
    e.preventDefault();
    currentContextConversationId = conversationId;
    
    const conversation = conversations.find(c => c.id === conversationId);
    if (!conversation) return;
    
    // 更新固定按钮文本
    const pinItem = document.getElementById('pin-conversation');
    const pinText = pinItem.querySelector('.menu-text');
    const pinIcon = pinItem.querySelector('.material-symbols-outlined');
    
    if (conversation.isPinned) {
        pinText.textContent = '取消固定';
        pinIcon.textContent = 'push_pin';
        pinIcon.style.transform = 'rotate(45deg)';
    } else {
        pinText.textContent = '固定';
        pinIcon.textContent = 'push_pin';
        pinIcon.style.transform = 'none';
    }
    
    // 显示菜单
    contextMenu.style.display = 'block';
    contextMenu.style.left = e.pageX + 'px';
    contextMenu.style.top = e.pageY + 'px';
    
    // 确保菜单不超出屏幕
    const rect = contextMenu.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
        contextMenu.style.left = (e.pageX - rect.width) + 'px';
    }
    if (rect.bottom > window.innerHeight) {
        contextMenu.style.top = (e.pageY - rect.height) + 'px';
    }
}

// 隐藏右键菜单
// 如果 keepId 为 true，则保留当前对话ID，避免在打开重命名/删除对话框后丢失上下文
function hideContextMenu(keepId = false) {
    if (contextMenu) {
        contextMenu.style.display = 'none';
    }
    if (!keepId) {
        currentContextConversationId = null;
    }
}

// 处理固定/取消固定对话
async function handlePinConversation() {
    if (!currentContextConversationId) return;
    
    const conversation = conversations.find(c => c.id === currentContextConversationId);
    if (!conversation) return;
    
    try {
        const response = await fetch(`http://localhost:3000/api/chat/conversations/${currentContextConversationId}/pin`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                isPinned: !conversation.isPinned
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // 更新本地数据
        conversation.isPinned = !conversation.isPinned;
        
        // 重新渲染对话列表
        renderConversationsList();
        
        hideContextMenu();
    } catch (error) {
        console.error('Pin conversation error:', error);
        alert('操作失败，请重试');
    }
}

// 处理重命名对话
function handleRenameConversation() {
    if (!currentContextConversationId) return;
    
    const conversation = conversations.find(c => c.id === currentContextConversationId);
    if (!conversation) return;
    
    // 显示重命名对话框
    const renameInput = document.getElementById('rename-input');
    renameInput.value = conversation.title;
    renameDialog.style.display = 'flex';
    
    // 聚焦并选中文本
    setTimeout(() => {
        renameInput.focus();
        renameInput.select();
    }, 100);

    // 关闭右键菜单但保留当前对话ID，供后续确认重命名使用
    hideContextMenu(true);
}

// 确认重命名
async function confirmRename() {
    if (!currentContextConversationId) return;

    // 快照当前对话ID，避免在事件冒泡中被清空
    const targetId = currentContextConversationId;

    const renameInput = document.getElementById('rename-input');
    const newTitle = renameInput.value.trim();
    
    if (!newTitle) {
        alert('标题不能为空');
        return;
    }
    
    try {
        const response = await fetch(`http://localhost:3000/api/chat/conversations/${targetId}/rename`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: newTitle
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // 更新本地数据
        const conversation = conversations.find(c => c.id === targetId);
        if (conversation) {
            conversation.title = newTitle;
        }
        
        // 重新渲染对话列表
        renderConversationsList();
        
        closeRenameDialog();
    } catch (error) {
        console.error('Rename conversation error:', error);
        alert('重命名失败，请重试');
    }
}

// 关闭重命名对话框
function closeRenameDialog() {
    if (renameDialog) {
        renameDialog.style.display = 'none';
    }
    // 关闭重命名对话框后清除上下文ID，避免后续误用
    currentContextConversationId = null;
}

// 处理删除对话
async function handleDeleteConversation() {
    if (!currentContextConversationId) return;
    
    const conversation = conversations.find(c => c.id === currentContextConversationId);
    if (!conversation) return;
    // 打开自定义删除确认框（统一主题，简化内容）
    if (deleteErrorEl) {
        deleteErrorEl.style.display = 'none';
        deleteErrorEl.textContent = '';
    }
    deleteDialog.style.display = 'flex';

    // 打开删除确认框时，关闭右键菜单但保留当前对话ID，确保后续确认删除可用
    hideContextMenu(true);
}

// 确认执行删除
async function confirmDelete() {
    if (!currentContextConversationId) return;

    // 快照当前对话ID，避免在事件冒泡中被清空
    const targetId = currentContextConversationId;

    try {
        const response = await fetch(`http://localhost:3000/api/chat/conversations/${targetId}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        // 从本地数据中移除
        const index = conversations.findIndex(c => c.id === targetId);
        if (index !== -1) {
            conversations.splice(index, 1);
        }
        // 如果删除的是当前对话，切换到新对话
        if (currentConversationId === targetId) {
            startNewConversation();
        }
        // 重新渲染对话列表
        renderConversationsList();
        closeDeleteDialog();
    } catch (error) {
        console.error('Delete conversation error:', error);
        if (deleteErrorEl) {
            deleteErrorEl.textContent = '删除失败，请重试';
            deleteErrorEl.style.display = 'block';
        }
    }
}

function closeDeleteDialog() {
    if (deleteDialog) {
        deleteDialog.style.display = 'none';
    }
    // 关闭删除对话框后清除上下文ID，避免后续误用
    currentContextConversationId = null;
}

// =======================
// 智能意图识别与搜索/总结
// =======================

// 智能意图识别（中文）
function detectSmartIntent(message) {
    const msg = (message || '').trim();
    const lower = msg.toLowerCase();
    const urlMatch = msg.match(/https?:\/\/[^\s\u4e00-\u9fa5]+/i);
    const openSites = [
        { keys: ['高德开放平台', '高德地图开放平台', 'amap'], name: '高德开放平台', url: 'https://lbs.amap.com/' },
        { keys: ['github', 'git hub', '访问github'], name: 'GitHub', url: 'https://github.com/' },
        { keys: ['百度', 'baidu'], name: '百度', url: 'https://www.baidu.com/' },
        { keys: ['必应', 'bing'], name: 'Bing', url: 'https://www.bing.com/' },
        { keys: ['youtube', '优兔', '油管', 'ytb', 'yt'], name: 'YouTube', url: 'https://www.youtube.com/' },
        { keys: ['bilibili', '哔哩哔哩', 'b站', 'B站', 'B 站', 'b 站', 'bili'], name: 'Bilibili', url: 'https://www.bilibili.com/' }
    ];
    // 打开网站（有头）
    if (/^(打开|帮我打开|访问|进去)\s*/.test(msg)) {
        for (const site of openSites) {
            if (site.keys.some(k => msg.includes(k))) {
                return { type: 'open', url: site.url, name: site.name };
            }
        }
        const domainMatch = msg.match(/访问\s*([a-z0-9\-\.]+)\b/i);
        if (domainMatch) {
            const d = domainMatch[1].toLowerCase();
            const url = d.startsWith('http') ? d : `https://${d}`;
            return { type: 'open', url, name: d };
        }
    }
    // 网址总结（必须 Playwright）
    if (/总结|概述|梳理/.test(msg) && urlMatch) {
        return { type: 'summarize_url', url: urlMatch[0], headed: /有头|弹窗|打开窗口/.test(msg) };
    }
    if (urlMatch && /介绍|总结|分析|说明|这是什么/.test(msg)) {
        return { type: 'summarize_url', url: urlMatch[0], headed: /有头|弹窗|打开窗口/.test(msg) };
    }
    // 快速查询 → DuckDuckGo
    if (/今天的新闻|快讯|速览|马上看看|快速查询/.test(msg)) {
        return { type: 'search_fast', engine: 'duckduckgo' };
    }
    // 专业研究 → Playwright + Bing
    if (/(最新进展|论文|研究|专业|技术动态|量子计算|量子|机器学习|深度学习)/.test(msg)) {
        return { type: 'search_research', engine: 'bing' };
    }
    // 中文搜索 → Playwright + Baidu
    if (/(中国|中文|传统文化|国内|政策|法规|百科)/.test(msg)) {
        return { type: 'search_cn', engine: 'baidu' };
    }
    // 通用“搜索xxx” → 根据语言自动
    if (/^搜(索)?/.test(lower) || /搜索/.test(msg)) {
        const isChinese = /[\u4e00-\u9fa5]/.test(msg);
        return isChinese ? { type: 'search_cn', engine: 'baidu' } : { type: 'search_research', engine: 'bing' };
    }
    return null;
}

// 后台搜索并总结（无头）
async function performSmartSearchAndSummarize(query, intent) {
    const rt = searchRuntimeConfig || {};
    const defaultMode = intent.type === 'search_fast' ? 'auto' : 'playwright';
    const mode = rt.method === 'duckduckgo' ? 'duckduckgo' : (rt.method === 'playwright' ? 'playwright' : defaultMode);
    const engine = intent.engine || rt.engine || (intent.type === 'search_fast' ? 'duckduckgo' : 'bing');
    const headless = typeof rt.headless === 'boolean' ? rt.headless : true;
    const limit = String(rt.maxResults || 8);
    const timeout = String(rt.timeoutMs || 30000);
    const locale = rt.locale || 'zh-CN';
    const needAggregate = /(多个来源|综合|整合|聚合)|python.*最新动态/i.test(query);
    let results = [];
    if (needAggregate) {
        let ddgRes = { results: [] };
        try {
            ddgRes = await fetchJson(`/api/search?${new URLSearchParams({ query, mode: 'duckduckgo', limit, timeoutMs: timeout }).toString()}`);
        } catch (e) {
            console.warn('DuckDuckGo 聚合分支失败，改用 Playwright 聚合：', e);
        }
        const enginePw = engine === 'duckduckgo' ? (rt.engine || 'bing') : engine;
        const pwRes = await fetchJson(`/api/search?${new URLSearchParams({ query, mode: 'playwright', engine: enginePw, headless: String(headless), limit, timeoutMs: timeout, locale }).toString()}`);
        results = dedupeByUrl([...(ddgRes.results || []), ...(pwRes.results || [])]);
    } else {
        const params = new URLSearchParams({ query, mode, engine, headless: String(headless), limit, timeoutMs: timeout, locale });
        let data;
        try {
            data = await fetchJson(`/api/search?${params.toString()}`);
        } catch (e) {
            // 当快速搜索（auto）失败时，回退到 Playwright+Bing
            if (intent.type === 'search_fast') {
                const engineFb = engine === 'duckduckgo' ? (rt.engine || 'bing') : engine;
                const fallbackParams = new URLSearchParams({ query, mode: 'playwright', engine: engineFb, headless: String(headless), limit, timeoutMs: timeout, locale });
                data = await fetchJson(`/api/search?${fallbackParams.toString()}`);
            } else {
                throw e;
            }
        }
        results = data.results || [];
    }
    if (!results || results.length === 0) {
        addMessage('未找到相关结果，请尝试调整关键词。', 'assistant');
        return;
    }
    const summaryPrompt = buildSummaryPrompt(query, results);
    await sendMessageViaSocket(summaryPrompt, null);
}

function dedupeByUrl(items) {
    const seen = new Set();
    const out = [];
    for (const it of items) {
        const u = (it && it.url) || '';
        if (!u || seen.has(u)) continue;
        seen.add(u);
        out.push(it);
    }
    return out;
}

function buildSummaryPrompt(query, results) {
    const top = results.slice(0, 8);
    const lines = top.map((r, i) => `- [${i + 1}] ${r.title || '无标题'}\n  ${r.url || ''}\n  摘要：${r.snippet || ''}`);
    return `请用中文根据以下搜索结果进行总结与回答，要求：\n- 先给出直接回答/结论；\n- 再给出由来与证据（引用条目编号）；\n- 如存在不确定性或多版本信息，请标注；\n- 最后附上参考链接列表。\n\n问题：${query}\n\n搜索结果：\n${lines.join('\n')}\n`;
}

async function fetchJson(url) {
    const res = await fetch(url);
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
    }
    return res.json();
}

// POST JSON 辅助函数
async function postJson(url, data) {
    const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data || {})
    });
    if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || `HTTP ${resp.status}`);
    }
    return await resp.json();
}

// LLM 解析“打开<站点>并搜索<关键词>”并返回可直接打开的URL
async function tryLLMParseSiteSearch(message) {
    const msg = (message || '').trim();
    if (!msg) return null;
    // 仅在同时包含“打开/访问/进去/在…上/用”等动作词与“搜索/搜/查询/检索”时触发
    const hasOpen = /(打开|帮我打开|访问|进去|在|用)/.test(msg);
    const hasSearch = /(搜索|搜|查询|检索)/.test(msg);
    if (!hasOpen || !hasSearch) return null;
    try {
        const res = await postJson('/api/intent/site-search', { text: msg });
        if (res && res.ok && res.intent && res.intent.type === 'open' && res.intent.url) {
            return { type: 'open', url: res.intent.url, name: res.intent.name };
        }
        return null;
    } catch (e) {
        console.warn('LLM 站点搜索意图解析接口错误：', e);
        return null;
    }
}

// 网址访问并总结（Playwright 必须）
async function performUrlVisitAndSummarize(url, headed = true) {
    const rt = searchRuntimeConfig || {};
    const params = new URLSearchParams({ url, headless: String(!headed), timeoutMs: String(rt.timeoutMs || 30000), locale: rt.locale || 'zh-CN' });
    const data = await fetchJson(`/api/search/fetch?${params.toString()}`);
    const text = data.text || '';
    const title = data.title || url;
    if (headed) {
        addMessage(`已在浏览器中打开 ${title}`, 'assistant');
    }
    if (!text || text.length < 200) {
        addMessage('抓取的正文较少，可能页面是动态渲染或受限。已尽力总结。', 'assistant');
    }
    const prompt = `请用中文总结以下网页内容（最多500字），包含：核心结论、关键要点、相关背景、可能的争议。\n网页标题：${title}\n网页地址：${url}\n\n正文：\n${text.slice(0, 8000)}\n`;
    await sendMessageViaSocket(prompt, null);
}
