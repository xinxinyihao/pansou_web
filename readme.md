### 搜索API

搜索网盘资源。

**接口地址**：`/api/search`  
**请求方法**：`POST` 或 `GET`  
**Content-Type**：`application/json`（POST方法）  
**是否需要认证**：取决于`AUTH_ENABLED`配置

**POST请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| kw | string | 是 | 搜索关键词 |
| channels | string[] | 否 | 搜索的频道列表，不提供则使用默认配置 |
| conc | number | 否 | 并发搜索数量，不提供则自动设置为频道数+插件数+10 |
| refresh | boolean | 否 | 强制刷新，不使用缓存，便于调试和获取最新数据 |
| res | string | 否 | 结果类型：all(返回所有结果)、results(仅返回results)、merge(仅返回merged_by_type)，默认为merge |
| src | string | 否 | 数据来源类型：all(默认，全部来源)、tg(仅Telegram)、plugin(仅插件) |
| plugins | string[] | 否 | 指定搜索的插件列表，不指定则搜索全部插件 |
| cloud_types | string[] | 否 | 指定返回的网盘类型列表，支持：baidu、aliyun、quark、tianyi、uc、mobile、115、pikpak、xunlei、123、magnet、ed2k，不指定则返回所有类型 |
| ext | object | 否 | 扩展参数，用于传递给插件的自定义参数，如{"title_en":"English Title", "is_all":true} |
| filter | object | 否 | 过滤配置，用于过滤返回结果。格式：{"include":["关键词1","关键词2"],"exclude":["排除词1","排除词2"]}。include为包含关键词列表（OR关系），exclude为排除关键词列表（OR关系） |

**GET请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| kw | string | 是 | 搜索关键词 |
| channels | string | 否 | 搜索的频道列表，使用英文逗号分隔多个频道，不提供则使用默认配置 |
| conc | number | 否 | 并发搜索数量，不提供则自动设置为频道数+插件数+10 |
| refresh | boolean | 否 | 强制刷新，设置为"true"表示不使用缓存 |
| res | string | 否 | 结果类型：all(返回所有结果)、results(仅返回results)、merge(仅返回merged_by_type)，默认为merge |
| src | string | 否 | 数据来源类型：all(默认，全部来源)、tg(仅Telegram)、plugin(仅插件) |
| plugins | string | 否 | 指定搜索的插件列表，使用英文逗号分隔多个插件名，不指定则搜索全部插件 |
| cloud_types | string | 否 | 指定返回的网盘类型列表，使用英文逗号分隔多个类型，支持：baidu、aliyun、quark、tianyi、uc、mobile、115、pikpak、xunlei、123、magnet、ed2k，不指定则返回所有类型 |
| ext | string | 否 | JSON格式的扩展参数，用于传递给插件的自定义参数，如{"title_en":"English Title", "is_all":true} |
| filter | string | 否 | JSON格式的过滤配置，用于过滤返回结果。格式：{"include":["关键词1","关键词2"],"exclude":["排除词1","排除词2"]} |

**POST请求示例**：

```bash
# 未启用认证
curl -X POST http://localhost:8888/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "kw": "速度与激情",
    "channels": ["tgsearchers3", "xxx"],
    "conc": 2,
    "refresh": true,
    "res": "merge",
    "src": "all",
    "plugins": ["jikepan"],
    "cloud_types": ["baidu", "quark"],
    "ext": {
      "title_en": "Fast and Furious",
      "is_all": true
    }
  }'

# 启用认证时（需要添加Authorization头）
curl -X POST http://localhost:8888/api/search \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "kw": "速度与激情",
    "res": "merge"
  }'

# 使用过滤器（只返回包含“合集”或“全集”，且不包含“预告”或“花絮”的结果）
curl -X POST http://localhost:8888/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "kw": "唐朝诡事录",
    "filter": {
      "include": ["合集", "全集"],
      "exclude": ["预告", "花絮"]
    }
  }'
```

**GET请求示例**：

```bash
# 未启用认证
curl "http://localhost:8888/api/search?kw=速度与激情&res=merge&src=tg"

# 启用认证时（需要添加Authorization头）
curl "http://localhost:8888/api/search?kw=速度与激情&res=merge" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# 使用过滤器（GET方式需要URL编码JSON）
curl "http://localhost:8888/api/search?kw=唐朝诡事录&filter=%7B%22include%22%3A%5B%22合集%22%2C%22全集%22%5D%2C%22exclude%22%3A%5B%22预告%22%5D%7D"
```

**成功响应**：

```json
{
  "total": 15,
  "results": [
    {
      "message_id": "12345",
      "unique_id": "channel-12345",
      "channel": "tgsearchers3",
      "datetime": "2023-06-10T14:23:45Z",
      "title": "速度与激情全集1-10",
      "content": "速度与激情系列全集，1080P高清...",
      "links": [
        {
          "type": "baidu",
          "url": "https://pan.baidu.com/s/1abcdef",
          "password": "1234",
          "datetime": "2023-06-10T14:23:45Z",
          "work_title": "速度与激情全集1-10"
        }
      ],
      "tags": ["电影", "合集"],
      "images": [
        "https://cdn1.cdn-telegram.org/file/xxx.jpg"
      ]
    },
    // 更多结果...
  ],
  "merged_by_type": {
    "baidu": [
      {
        "url": "https://pan.baidu.com/s/1abcdef",
        "password": "1234",
        "note": "速度与激情全集1-10",
        "datetime": "2023-06-10T14:23:45Z",
        "source": "tg:频道名称",
        "images": [
          "https://cdn1.cdn-telegram.org/file/xxx.jpg"
        ]
      },
      // 更多百度网盘链接...
    ],
    "quark": [
      {
        "url": "https://pan.quark.cn/s/xxxx",
        "password": "",
        "note": "凡人修仙传",
        "datetime": "2023-06-10T15:30:22Z",
        "source": "plugin:插件名",
        "images": []
      }
    ],
    "aliyun": [
      // 阿里云盘链接...
    ]
  }
}
```

> [!NOTE]
> **实际响应适配**：在某些部署环境下，API 可能会将结果嵌套在 `data` 对象中，逻辑上等同于：
> - 完整数据：`data.results` (原始列表) 或 `data.list` (按类型合并)
> - 如果启用了 `res=merge`，建议优先解析 `data.list`。

**字段说明**：

**SearchResult对象**：
- `message_id`: 消息ID
- `unique_id`: 全局唯一标识符
- `channel`: 来源频道名称
- `datetime`: 消息发布时间
- `title`: 消息标题
- `content`: 消息内容
- `links`: 网盘链接数组
- `tags`: 标签数组（可选）
- `images`: TG消息中的图片链接数组（可选）

**Link对象**：
- `type`: 网盘类型（baidu、quark、aliyun等）
- `url`: 网盘链接地址
- `password`: 提取码/密码
- `datetime`: 链接更新时间（可选）
- `work_title`: 作品标题（可选）
  - 用于区分同一消息中多个作品的链接
  - 当一条消息包含≤4个链接时，所有链接使用相同的work_title
  - 当一条消息包含>4个链接时，系统会智能识别每个链接对应的作品标题

**MergedLink对象**：
- `url`: 网盘链接地址
- `password`: 提取码/密码
- `note`: 资源说明/标题
- `datetime`: 链接更新时间
- `source`: 数据来源标识
  - `tg:频道名称`: 来自Telegram频道
  - `plugin:插件名`: 来自指定插件
  - `unknown`: 未知来源
- `images`: TG消息中的图片链接数组（可选）
  - 仅在来源为Telegram频道且消息包含图片时出现


**错误响应**：

```json
// 参数错误
{
  "code": 400,
  "message": "关键词不能为空"
}

// 未授权（启用认证但未提供Token）
{
  "error": "未授权：缺少认证令牌",
  "code": "AUTH_TOKEN_MISSING"
}

// Token无效或过期
{
  "error": "未授权：令牌无效或已过期",
  "code": "AUTH_TOKEN_INVALID"
}
```