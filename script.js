/**
 * 盘搜 (PanSou) 前端逻辑脚本
 */

const API_ENDPOINT = 'https://ps.xxin.top/api/search';

// DOM 元素
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const filterToggle = document.getElementById('filter-toggle');
const filterPanel = document.getElementById('filter-panel');
const resultsContainer = document.getElementById('results-container');
const statusIndicator = document.getElementById('status-indicator');

// 状态管理
let isSearching = false;

/**
 * 切换筛选面板显示/隐藏
 */
filterToggle.addEventListener('click', () => {
    filterPanel.classList.toggle('hidden');
});

/**
 * 触发搜索
 */
async function performSearch() {
    const kw = searchInput.value.trim();
    if (!kw) {
        showStatus('请输入搜索关键词', 'error');
        return;
    }

    if (isSearching) return;

    // 准备参数
    const params = {
        kw,
        res: document.querySelector('#res-group input:checked').value,
        src: document.querySelector('#src-group input:checked').value,
        cloud_types: Array.from(document.querySelectorAll('#cloud-types input:checked')).map(el => el.value),
        filter: {}
    };

    const include = document.getElementById('include-words').value.trim();
    const exclude = document.getElementById('exclude-words').value.trim();

    if (include) params.filter.include = include.split(/[,，]/).map(s => s.trim());
    if (exclude) params.filter.exclude = exclude.split(/[,，]/).map(s => s.trim());

    if (Object.keys(params.filter).length === 0) delete params.filter;

    try {
        startLoading();

        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(params)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || errorData.error || '搜索请求失败');
        }

        const data = await response.json();
        renderResults(data, params.res);

    } catch (error) {
        console.error('Search error:', error);
        showStatus(error.message, 'error');
        resultsContainer.innerHTML = `<div class="empty-state"><i data-lucide="alert-circle" class="huge-icon"></i><p>${error.message}</p></div>`;
        lucide.createIcons();
    } finally {
        stopLoading();
    }
}

/**
 * 进入加载状态
 */
function startLoading() {
    isSearching = true;
    searchBtn.disabled = true;
    statusIndicator.innerHTML = '<div class="loader"></div>';
    resultsContainer.style.opacity = '0.5';
}

/**
 * 停止加载状态
 */
function stopLoading() {
    isSearching = false;
    searchBtn.disabled = false;
    statusIndicator.innerHTML = '';
    resultsContainer.style.opacity = '1';
}

/**
 * 显示提示信息
 */
function showStatus(message, type = 'info') {
    // 这里可以实现一个简单的 Toast 提示
    console.log(`[${type}] ${message}`);
}

// 全局数据缓存
let currentResults = null;
const tabsContainer = document.getElementById('tabs-container');

/**
 * 渲染搜索结果及 Tab 导航
 */
function renderResults(responseData, resMode) {
    const data = responseData.data || responseData;
    const results = data.results || [];
    const mergedByList = data.list || data.merged_by_type || {};

    // 规范化数据格式，统一为 currentResults
    currentResults = {
        mode: resMode,
        all: [],
        byType: {}
    };

    if (resMode === 'merge' || Object.keys(mergedByList).length > 0) {
        // 合并模式数据处理
        for (const [type, links] of Object.entries(mergedByList)) {
            if (!Array.isArray(links)) continue;
            const normalizedLinks = links.map(link => ({
                title: link.note || link.title || '未知资源',
                datetime: link.datetime,
                source: link.source,
                links: [{
                    type: type,
                    url: link.url,
                    password: link.password
                }]
            }));
            currentResults.byType[type] = normalizedLinks;
            currentResults.all.push(...normalizedLinks);
        }
    } else {
        // 原始模式数据处理
        currentResults.all = results;
        results.forEach(item => {
            if (item.links && item.links.length > 0) {
                item.links.forEach(link => {
                    if (!currentResults.byType[link.type]) currentResults.byType[link.type] = [];
                    currentResults.byType[link.type].push(item);
                });
            }
        });
    }

    if (currentResults.all.length === 0) {
        tabsContainer.classList.add('hidden');
        resultsContainer.innerHTML = '<div class="empty-state"><i data-lucide="search-x" class="huge-icon"></i><p>未找到匹配的结果，尝试换个关键词试试？</p></div>';
        lucide.createIcons();
        return;
    }

    renderTabs();
    switchTab('all');
}

/**
 * 渲染 Tab 导航栏
 */
function renderTabs() {
    tabsContainer.innerHTML = '';
    tabsContainer.classList.remove('hidden');

    // “全部”标签
    const allTab = createTabItem('all', '全部', currentResults.all.length);
    tabsContainer.appendChild(allTab);

    // 各网盘类型标签
    Object.entries(currentResults.byType).forEach(([type, items]) => {
        if (items.length === 0) return;
        const tab = createTabItem(type, getCloudName(type), items.length);
        tabsContainer.appendChild(tab);
    });
}

function createTabItem(id, label, count) {
    const tab = document.createElement('div');
    tab.className = 'tab-item' + (id === 'all' ? ' active' : '');
    tab.dataset.tabId = id;
    tab.innerHTML = `<span>${label}</span><span class="tab-count">${count}</span>`;
    tab.onclick = () => switchTab(id);
    return tab;
}

/**
 * 切换 Tab 展示内容
 */
function switchTab(tabId) {
    // 更新 UI 状态
    document.querySelectorAll('.tab-item').forEach(el => {
        el.classList.toggle('active', el.dataset.tabId === tabId);
    });

    // 筛选数据
    const displayData = tabId === 'all' ? currentResults.all : (currentResults.byType[tabId] || []);

    // 渲染容器
    resultsContainer.innerHTML = '';
    displayData.forEach((item, index) => {
        resultsContainer.appendChild(createResultCard(item, index + 1));
    });

    lucide.createIcons();
}

/**
 * 创建结果卡片 DOM
 */
function createResultCard(item, index) {
    const card = document.createElement('div');
    card.className = 'result-card glass';

    const dateStr = item.datetime ? new Date(item.datetime).toLocaleString() : '未知时间';
    const sourceStr = item.source || item.channel || '未知来源';

    let linksHtml = '';
    if (item.links && item.links.length > 0) {
        linksHtml = item.links.map(link => {
            let hostname = '';
            try {
                hostname = new URL(link.url).hostname;
            } catch (e) {
                hostname = 'unknown';
            }
            const iconUrl = hostname !== 'unknown'
                ? `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`
                : '';

            return `
            <a href="${link.url}" target="_blank" class="link-item">
                <div class="link-type">
                    ${iconUrl ? `<img src="${iconUrl}" class="link-icon" alt="${link.type}">` : `<i data-lucide="link" class="link-icon"></i>`}
                    <span>${getCloudName(link.type)}</span>
                </div>
                ${link.password ? `<span class="badge">码: ${link.password}</span>` : '<i data-lucide="external-link" size="16"></i>'}
            </a>
            `;
        }).join('');
    }

    card.innerHTML = `
        <div class="result-index">${index}</div>
        <h2 class="result-title" title="${item.title}">${item.title}</h2>
        <div class="result-meta">
            <span><i data-lucide="calendar" size="12" style="display:inline; vertical-align:middle; margin-right:4px;"></i>${dateStr}</span>
            <span><i data-lucide="hash" size="12" style="display:inline; vertical-align:middle; margin-right:4px;"></i>${sourceStr}</span>
        </div>
        <div class="result-links">
            ${linksHtml}
        </div>
    `;

    return card;
}

/**
 * 获取网盘友好名称
 */
function getCloudName(type) {
    const names = {
        baidu: '百度网盘',
        aliyun: '阿里云盘',
        quark: '夸克网盘',
        tianyi: '天翼云盘',
        uc: 'UC网盘',
        pikpak: 'PikPak',
        xunlei: '迅雷云盘',
        115: '115网盘',
        magnet: '磁力链接',
        ed2k: '电驴链接'
    };
    return names[type] || type;
}

// 绑定搜索事件
searchBtn.addEventListener('click', performSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch();
});
