// 全局变量
let agentName = 'MirrorCore 智能助手';
let selectedImage = null;
let currentConversationId = null;
let conversations = [];

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

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
    // 直接显示聊天界面
    showChatInterface();
    
    // 绑定事件监听器
    bindEventListeners();
    
    // 初始化发送按钮状态
    updateSendButtonState();
    
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
            <p>你好！我是 ${agentName}，你的本地智能助手。</p>
            <p>我可以帮你处理各种任务，提供智能对话和协助。</p>
            <p>试试对我说："你好" 或 "帮我搜索信息"</p>
        `;
    }
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
    // 获取AI回复
    const response = await getAIResponse(message, imageData);
    if (response) {
        addMessage(response.response.content, 'assistant');
        
        // 更新当前对话ID
        if (response.conversationId) {
            currentConversationId = response.conversationId;
            // 重新加载对话列表以显示新对话或更新现有对话
            await loadConversations();
        }
    }
}

// 获取AI回复
async function getAIResponse(message, imageData) {
    try {
        // 显示加载状态
        const loadingMessage = addMessage('正在思考中...', 'assistant');
        const loadingBubble = loadingMessage.querySelector('.message-bubble');
        loadingBubble.classList.add('loading');
        
        // 准备请求数据
        const requestData = {
            conversationId: currentConversationId,
            message: message
        };
        
        // 如果有选中的图片，添加到请求中
        if (imageData) {
            requestData.imageData = imageData;
        }

        const response = await fetch('http://localhost:3000/api/chat/message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // 移除加载消息
        loadingMessage.remove();
        
        return data;
    } catch (error) {
        console.error('获取AI回复时出错:', error);
        
        // 移除加载消息并显示错误
        const loadingMessage = messagesContainer.querySelector('.loading');
        if (loadingMessage) {
            loadingMessage.closest('.message').remove();
        }
        
        addMessage('抱歉，发生了错误。请稍后再试。', 'assistant');
        return null;
    }
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
        avatar.innerHTML = '✨'; // Gemini风格的星星图标
    }
    
    // 创建消息气泡
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    
    let imageHtml = '';
    if (image) {
        imageHtml = `<div class="message-image"><img src="${image}" alt="上传的图片" onclick="openImageModal('${image}')"></div>`;
    }
    
    bubble.innerHTML = `
        <div class="message-content">
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

// 打开设置
function openSettings() {
    alert('设置功能正在开发中，敬请期待！');
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
let currentContextConversationId = null;

// 初始化右键菜单
function initContextMenu() {
    contextMenu = document.getElementById('context-menu');
    renameDialog = document.getElementById('rename-dialog');
    
    // 右键菜单项事件
    document.getElementById('pin-conversation').addEventListener('click', handlePinConversation);
    document.getElementById('rename-conversation').addEventListener('click', handleRenameConversation);
    document.getElementById('delete-conversation').addEventListener('click', handleDeleteConversation);
    
    // 重命名对话框事件
    document.getElementById('rename-dialog-close').addEventListener('click', closeRenameDialog);
    document.getElementById('rename-cancel').addEventListener('click', closeRenameDialog);
    document.getElementById('rename-confirm').addEventListener('click', confirmRename);
    
    // 点击其他地方关闭菜单
    document.addEventListener('click', (e) => {
        if (contextMenu && !contextMenu.contains(e.target)) {
            hideContextMenu();
        }
    });
    
    // 点击对话框外部关闭对话框
    renameDialog.addEventListener('click', (e) => {
        if (e.target === renameDialog) {
            closeRenameDialog();
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
function hideContextMenu() {
    if (contextMenu) {
        contextMenu.style.display = 'none';
    }
    currentContextConversationId = null;
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
    
    hideContextMenu();
}

// 确认重命名
async function confirmRename() {
    if (!currentContextConversationId) return;
    
    const renameInput = document.getElementById('rename-input');
    const newTitle = renameInput.value.trim();
    
    if (!newTitle) {
        alert('标题不能为空');
        return;
    }
    
    try {
        const response = await fetch(`http://localhost:3000/api/chat/conversations/${currentContextConversationId}/rename`, {
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
        const conversation = conversations.find(c => c.id === currentContextConversationId);
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
}

// 处理删除对话
async function handleDeleteConversation() {
    if (!currentContextConversationId) return;
    
    const conversation = conversations.find(c => c.id === currentContextConversationId);
    if (!conversation) return;
    
    if (!confirm(`确定要删除对话"${conversation.title}"吗？此操作不可撤销。`)) {
        hideContextMenu();
        return;
    }
    
    try {
        const response = await fetch(`http://localhost:3000/api/chat/conversations/${currentContextConversationId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // 从本地数据中移除
        const index = conversations.findIndex(c => c.id === currentContextConversationId);
        if (index !== -1) {
            conversations.splice(index, 1);
        }
        
        // 如果删除的是当前对话，切换到新对话
        if (currentConversationId === currentContextConversationId) {
            startNewConversation();
        }
        
        // 重新渲染对话列表
        renderConversationsList();
        
        hideContextMenu();
    } catch (error) {
        console.error('Delete conversation error:', error);
        alert('删除失败，请重试');
    }
}