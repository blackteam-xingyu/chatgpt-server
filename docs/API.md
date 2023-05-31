[TOC]


## /openai

```text
openai官方接口
```

#### 公共Header参数

| 参数名 | 示例值 | 参数描述 |
| --- | --- | ---- |
| 暂无参数 |

#### 公共Query参数

| 参数名 | 示例值 | 参数描述 |
| --- | --- | ---- |
| 暂无参数 |

#### 公共Body参数

| 参数名 | 示例值 | 参数描述 |
| --- | --- | ---- |
| 暂无参数 |

#### 预执行脚本

```javascript
暂无预执行脚本
```

#### 后执行脚本

```javascript
暂无后执行脚本
```

## /openai/查询ChatGpt模型

```text
此接口用以查询openai所有的模型，并且返回不同业务推荐的模型
```

#### 接口状态

> 开发中

#### 接口URL

> http://127.0.0.1:3000/openai/models

#### 请求方式

> GET

#### Content-Type

> none

#### 预执行脚本

```javascript
暂无预执行脚本
```

#### 后执行脚本

```javascript
暂无后执行脚本
```

#### 成功响应示例

```javascript
{
	"code": 0,
	"data": {
		"models": [
			"whisper-1"
		],
		"suggest": {
			"chat": [
				"gpt-4"
			],
			"completions": [
				"text-davinci-003"
			],
			"edits": [
				"text-davinci-edit-001"
			],
			"audio": {
				"transcriptions": [
					"whisper-1"
				],
				"translations": [
					"whisper-1"
				]
			},
			"finetunes": [
				"davinci"
			],
			"embeddings": [
				"text-embedding-ada-002"
			],
			"moderations": [
				"text-moderation-stable"
			]
		}
	},
	"message": "响应成功"
}
```

| 参数名 | 示例值 | 参数类型 | 参数描述 |
| --- | --- | ---- | ---- |
| code | 0 | Integer |  |
| data | - | Object |  |
| data.models | whisper-1 | Array | 从openai官网查询到的现有模型 |
| data.suggest | - | Object | 在config.yaml中配置的可调用的模型 |
| data.suggest.chat | gpt-4 | Array |  |
| data.suggest.completions | text-davinci-003 | Array |  |
| data.suggest.edits | text-davinci-edit-001 | Array |  |
| data.suggest.audio | - | Object |  |
| data.suggest.audio.transcriptions | whisper-1 | Array |  |
| data.suggest.audio.translations | whisper-1 | Array |  |
| data.suggest.finetunes | davinci | Array |  |
| data.suggest.embeddings | text-embedding-ada-002 | Array |  |
| data.suggest.moderations | text-moderation-stable | Array |  |
| message | 响应成功 | String | 分为四种，continue(正常返回并继续)，error(错误返回，此时文字可能丢失)，code（返回的chatcode用于联系上下文），end(返回结束，不再会有返回值了) |

## /openai/completions模型

```text
用于诱导性对话，根据需求生成文字，比如写小作文，也可用于聊天(但不建议，因为不支持关联上下文)
```

#### 公共Header参数

| 参数名 | 示例值 | 参数描述 |
| --- | --- | ---- |
| 暂无参数 |

#### 公共Query参数

| 参数名 | 示例值 | 参数描述 |
| --- | --- | ---- |
| 暂无参数 |

#### 公共Body参数

| 参数名 | 示例值 | 参数描述 |
| --- | --- | ---- |
| 暂无参数 |

#### 预执行脚本

```javascript
暂无预执行脚本
```

#### 后执行脚本

```javascript
暂无后执行脚本
```

## /openai/completions模型/completions(一般请求方式)

```text
暂无描述
```

#### 接口状态

> 开发中

#### 接口URL

> http://127.0.0.1:3000/openai/completions

#### 请求方式

> POST

#### Content-Type

> json

#### 请求Body参数

```javascript
{
	"model": "text-davinci-003",
	"prompt": "Say this is a test",
	"max_tokens": 16,
	"temperature": 1,
	"n": 1
}
```

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| model | text-davinci-003 | String | 是 | 模型名称 |
| prompt | Say this is a test | String | 是 | 你的文字 |
| max_tokens | 16 | Integer | 是 | 回答最大token数目(0-2048/4096) |
| temperature | 1 | Integer | 是 | 控制回答的随机程度(0-2) |
| n | 1 | Integer | 是 | 生成结果的数目(流式传输与sse订阅中固定为1，不支持配置) |

#### 预执行脚本

```javascript
暂无预执行脚本
```

#### 后执行脚本

```javascript
暂无后执行脚本
```

#### 成功响应示例

```javascript
{
	"code": 0,
	"data": [
		"\n\nThis is indeed a test."
	],
	"message": "响应成功"
}
```

| 参数名 | 示例值 | 参数类型 | 参数描述 |
| --- | --- | ---- | ---- |
| code | 0 | Integer |  |
| data | This is indeed a test. | Array | 返回流的每一段文字 |
| message | 响应成功 | String |  |

## /openai/completions模型/completions/stream(流式传输方式)

```text
暂无描述
```

#### 接口状态

> 开发中

#### 接口URL

> http://127.0.0.1:3000/openai/completions/stream

#### 请求方式

> POST

#### Content-Type

> json

#### 请求Body参数

```javascript
{
    "model": "text-davinci-003",
    "prompt": "Say This is test",
    "max_tokens": 16,
    "temperature": 1
}
```

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| model | text-davinci-003 | String | 是 | 模型名称 |
| prompt | Say This is test | String | 是 | 你的文字 |
| max_tokens | 16 | Integer | 是 | 回答最大token数目(0-2048/4096) |
| temperature | 1 | Integer | 是 | 控制回答的随机程度(0-2) |

#### 预执行脚本

```javascript
暂无预执行脚本
```

#### 后执行脚本

```javascript
暂无后执行脚本
```

#### 成功响应示例

```javascript
{"code":0,"data":"\n","message":"continue"}
{"code":0,"data":"\n","message":"continue"}
{"code":0,"data":"This","message":"continue"}
{"code":0,"data":" is","message":"continue"}
{"code":0,"data":" a","message":"continue"}
{"code":0,"data":" test","message":"continue"}
{"code":0,"data":".","message":"continue"}
{"code":0,"data":"[DONE]","message":"end"}

```

| 参数名 | 示例值 | 参数类型 | 参数描述 |
| --- | --- | ---- | ---- |
| code | 0 | String |  |
| data | * | String | 返回流的每一段文字当返回[DONE]时结束 |
| message | continue\|error|end | String | 分为三种，continue(正常返回并继续)，error(错误返回，此时文字可能丢失)，end(返回结束，不再会有返回值了) |

## /openai/completions模型/completions/sse(sse订阅方式) 

```text
暂无描述
```

#### 接口状态

> 开发中

#### 接口URL

> http://127.0.0.1:3000/openai/completions/sse

#### 请求方式

> POST

#### Content-Type

> json

#### 请求Body参数

```javascript
{
    "model": "text-davinci-003",
    "prompt": "Say This is test",
    "max_tokens": 16,
    "temperature": 1
}
```

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| model | text-davinci-003 | String | 是 | 模型名称 |
| prompt | Say This is test | String | 是 | 你的文字 |
| max_tokens | 16 | Integer | 是 | 回答最大token数目(0-2048/4096) |
| temperature | 1 | Integer | 是 | 控制回答的随机程度(0-2) |

#### 预执行脚本

```javascript
暂无预执行脚本
```

#### 后执行脚本

```javascript
暂无后执行脚本
```

#### 成功响应示例

```javascript
{"code":0,"data":"\n","message":"continue"}
{"code":0,"data":"\n","message":"continue"}
{"code":0,"data":"This","message":"continue"}
{"code":0,"data":" is","message":"continue"}
{"code":0,"data":" a","message":"continue"}
{"code":0,"data":" test","message":"continue"}
{"code":0,"data":".","message":"continue"}
{"code":0,"data":"[DONE]","message":"end"}

```

| 参数名 | 示例值 | 参数类型 | 参数描述 |
| --- | --- | ---- | ---- |
| code | 0 | String |  |
| data | * | String | 返回流的每一段文字当返回[DONE]时结束 |
| message | continue\|error|end | String | 分为三种，continue(正常返回并继续)，error(错误返回，此时文字可能丢失)，end(返回结束，不再会有返回值了) |

## /openai/chat模型

```text
用于聊天，通用的模型，功能强大，可以实现很多功能。
```

#### 公共Header参数

| 参数名 | 示例值 | 参数描述 |
| --- | --- | ---- |
| 暂无参数 |

#### 公共Query参数

| 参数名 | 示例值 | 参数描述 |
| --- | --- | ---- |
| 暂无参数 |

#### 公共Body参数

| 参数名 | 示例值 | 参数描述 |
| --- | --- | ---- |
| 暂无参数 |

#### 预执行脚本

```javascript
暂无预执行脚本
```

#### 后执行脚本

```javascript
暂无后执行脚本
```

## /openai/chat模型/chat(一般请求方式)

```text
暂无描述
```

#### 接口状态

> 开发中

#### 接口URL

> http://127.0.0.1:3000/openai/chat

#### 请求方式

> POST

#### Content-Type

> json

#### 请求Body参数

```javascript
{
  "chatcode": "MjAyMy0wNS0zMCAxMTowOTo1NQ==",
  "model": "gpt-3.5-turbo",
  "messages": [
    {
      "role": "user",
      "content": "我第一句话是什么"
    }
  ],
  "max_tokens": 1000,
  "temperature": 1,
  "initMessage": {
    "role": "system",
    "content": "现在开始你要扮演一只会说话的猫，每一句话的结尾都要加上“喵~”"
  }
}
```

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| chatcode | MjAyMy0wNS0zMCAxMTowOTo1NQ== | String | 是 | 聊天id用于联系上下文，如果不传则开启新的会话 |
| model | gpt-3.5-turbo | String | 是 | 模型名称 |
| messages | - | Array | 是 | 你的聊天信息 |
| messages.role | user | String | 是 | 角色 |
| messages.content | 我第一句话是什么 | String | 是 | 所说的话 |
| max_tokens | 1000 | Integer | 是 | 回答最大token数目(0-2048/4096) |
| temperature | 1 | Integer | 是 | 控制回答的随机程度(0-2) |
| initMessage | - | Object | 是 | 用于初始化你的会话，一般用于给gpt增加人设或者是初始化功能 |
| initMessage.role | system | String | 是 | - |
| initMessage.content | 现在开始你要扮演一只会说话的猫，每一句话的结尾都要加上“喵~” | String | 是 | - |

#### 预执行脚本

```javascript
暂无预执行脚本
```

#### 后执行脚本

```javascript
暂无后执行脚本
```

#### 成功响应示例

```javascript
{
	"code": 0,
	"data": {
		"chatcode": "MjAyMy0wNS0zMCAxMTowOTo1NQ==",
		"role": "assistant",
		"content": "你第一句话是：“你是什么喵~”"
	},
	"message": "响应成功"
}
```

| 参数名 | 示例值 | 参数类型 | 参数描述 |
| --- | --- | ---- | ---- |
| code | 0 | Integer |  |
| data | - | Object |  |
| data.chatcode | MjAyMy0wNS0zMCAxMTowOTo1NQ== | String | 聊天id用于联系上下文，如果不传则开启新的会话 |
| data.role | assistant | String | 角色 |
| data.content | 你第一句话是：“你是什么喵~” | String | 所说的话 |
| message | 响应成功 | String |  |

## /openai/chat模型/chat/stream(流式传输方式)

```text
暂无描述
```

#### 接口状态

> 开发中

#### 接口URL

> http://127.0.0.1:3000/openai/chat/stream

#### 请求方式

> POST

#### Content-Type

> json

#### 请求Body参数

```javascript
{
  "chatcode": "MjAyMy0wNS0zMCAxMDo1MDozNw==",
  "model": "gpt-3.5-turbo",
  "messages": [
    {
      "role": "user",
      "content": "我上句话说的是什么"
    }
  ],
  "max_tokens": 1000,
  "temperature": 1,
  "initMessage": {
    "role": "system",
    "content": "你是一只会说话的猫，每一句话的结尾都要加上“喵~”"
  }
}
```

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| chatcode | MjAyMy0wNS0zMCAxMDo1MDozNw== | String | 是 | 聊天id用于联系上下文，如果不传则开启新的会话 |
| model | gpt-3.5-turbo | String | 是 | 模型名称 |
| messages | - | Array | 是 | 你的聊天信息 |
| messages.role | user | String | 是 | 角色 |
| messages.content | 我上句话说的是什么 | String | 是 | 所说的话 |
| max_tokens | 1000 | Integer | 是 | 回答最大token数目(0-2048/4096) |
| temperature | 1 | Integer | 是 | 控制回答的随机程度(0-2) |
| initMessage | - | Object | 是 | 用于初始化你的会话，一般用于给gpt增加人设或者是初始化功能 |
| initMessage.role | system | String | 是 | - |
| initMessage.content | 你是一只会说话的猫，每一句话的结尾都要加上“喵~” | String | 是 | - |

#### 预执行脚本

```javascript
暂无预执行脚本
```

#### 后执行脚本

```javascript
暂无后执行脚本
```

#### 成功响应示例

```javascript
{"code":0,"data":"你","message":"continue"}
{"code":0,"data":"上","message":"continue"}
{"code":0,"data":"句","message":"continue"}
{"code":0,"data":"话","message":"continue"}
{"code":0,"data":"说","message":"continue"}
{"code":0,"data":"的","message":"continue"}
{"code":0,"data":"是","message":"continue"}
{"code":0,"data":"“","message":"continue"}
{"code":0,"data":"我","message":"continue"}
{"code":0,"data":"上","message":"continue"}
{"code":0,"data":"句","message":"continue"}
{"code":0,"data":"话","message":"continue"}
{"code":0,"data":"说","message":"continue"}
{"code":0,"data":"的","message":"continue"}
{"code":0,"data":"是","message":"continue"}
{"code":0,"data":"什","message":"continue"}
{"code":0,"data":"么","message":"continue"}
{"code":0,"data":"喵","message":"continue"}
{"code":0,"data":"~","message":"continue"}
{"code":0,"data":"”","message":"continue"}
{"code":0,"data":"MjAyMy0wNS0zMCAxMDo1MDozNw==","message":"code"}
{"code":0,"data":"[DONE]","message":"end"}

```

| 参数名 | 示例值 | 参数类型 | 参数描述 |
| --- | --- | ---- | ---- |
| code | 0 | String |  |
| data | * | String | 返回流的每一段文字,当值为[DONE]时，返回结束 |
| message | continue\|error|code|end | String | 分为四种，continue(正常返回并继续)，error(错误返回，此时文字可能丢失)，code（返回的chatcode用于联系上下文），end(返回结束，不再会有返回值了) |

## /openai/chat模型/chat/sse((sse订阅方式) ) 

```text
暂无描述
```

#### 接口状态

> 开发中

#### 接口URL

> http://127.0.0.1:3000/openai/chat/sse

#### 请求方式

> POST

#### Content-Type

> json

#### 请求Body参数

```javascript
{
  "chatcode": "MjAyMy0wNS0zMCAxMDo1MDozNw==",
  "model": "gpt-3.5-turbo",
  "messages": [
    {
      "role": "user",
      "content": "我上句话说的是什么"
    }
  ],
  "max_tokens": 1000,
  "temperature": 1,
  "initMessage": {
    "role": "system",
    "content": "你是一只会说话的猫，每一句话的结尾都要加上“喵~”"
  }
}
```

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| chatcode | MjAyMy0wNS0zMCAxMDo1MDozNw== | String | 是 | 聊天id用于联系上下文，如果不传则开启新的会话 |
| model | gpt-3.5-turbo | String | 是 | 模型名称 |
| messages | - | Array | 是 | 你的聊天信息 |
| messages.role | user | String | 是 | 角色 |
| messages.content | 我上句话说的是什么 | String | 是 | 所说的话 |
| max_tokens | 1000 | Integer | 是 | 回答最大token数目(0-2048/4096) |
| temperature | 1 | Integer | 是 | 控制回答的随机程度(0-2) |
| initMessage | - | Object | 是 | 用于初始化你的会话，一般用于给gpt增加人设或者是初始化功能 |
| initMessage.role | system | String | 是 | - |
| initMessage.content | 你是一只会说话的猫，每一句话的结尾都要加上“喵~” | String | 是 | - |

#### 预执行脚本

```javascript
暂无预执行脚本
```

#### 后执行脚本

```javascript
暂无后执行脚本
```

#### 成功响应示例

```javascript
{"code":0,"data":"你","message":"continue"}
{"code":0,"data":"上","message":"continue"}
{"code":0,"data":"句","message":"continue"}
{"code":0,"data":"话","message":"continue"}
{"code":0,"data":"说","message":"continue"}
{"code":0,"data":"的","message":"continue"}
{"code":0,"data":"是","message":"continue"}
{"code":0,"data":"“","message":"continue"}
{"code":0,"data":"我","message":"continue"}
{"code":0,"data":"上","message":"continue"}
{"code":0,"data":"句","message":"continue"}
{"code":0,"data":"话","message":"continue"}
{"code":0,"data":"说","message":"continue"}
{"code":0,"data":"的","message":"continue"}
{"code":0,"data":"是","message":"continue"}
{"code":0,"data":"什","message":"continue"}
{"code":0,"data":"么","message":"continue"}
{"code":0,"data":"喵","message":"continue"}
{"code":0,"data":"~","message":"continue"}
{"code":0,"data":"”","message":"continue"}
{"code":0,"data":"MjAyMy0wNS0zMCAxMDo1MDozNw==","message":"code"}
{"code":0,"data":"[DONE]","message":"end"}

```

| 参数名 | 示例值 | 参数类型 | 参数描述 |
| --- | --- | ---- | ---- |
| code | 0 | String |  |
| data | * | String | 返回流的每一段文字,当值为[DONE]时，返回结束 |
| message | continue\|error|code|end | String | 分为四种，continue(正常返回并继续)，error(错误返回，此时文字可能丢失)，code（返回的chatcode用于联系上下文），end(返回结束，不再会有返回值了) |

## /openai/edits模型

```text
该模型用于文章润色
```

#### 公共Header参数

| 参数名 | 示例值 | 参数描述 |
| --- | --- | ---- |
| 暂无参数 |

#### 公共Query参数

| 参数名 | 示例值 | 参数描述 |
| --- | --- | ---- |
| 暂无参数 |

#### 公共Body参数

| 参数名 | 示例值 | 参数描述 |
| --- | --- | ---- |
| 暂无参数 |

#### 预执行脚本

```javascript
暂无预执行脚本
```

#### 后执行脚本

```javascript
暂无后执行脚本
```

## /openai/edits模型/edits

```text
暂无描述
```

#### 接口状态

> 开发中

#### 接口URL

> http://127.0.0.1:3000/openai/edits

#### 请求方式

> POST

#### Content-Type

> json

#### 请求Body参数

```javascript
{
	"model": "text-davinci-edit-001",
	"input": "What day of the wek is it?",
	"instruction": "Fix the spelling mistakes",
	"temperature": 1,
	"n": 1
}
```

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| model | text-davinci-edit-001 | String | 是 | 模型名称 |
| input | What day of the wek is it? | String | 是 | 需要被修改的文字 |
| instruction | Fix the spelling mistakes | String | 是 | 提出修改的目标 |
| temperature | 1 | Integer | 是 | 回答的随机性 |
| n | 1 | Integer | 是 | 生成结果的数目(流式传输与sse订阅中固定为1，不支持配置) |

#### 预执行脚本

```javascript
暂无预执行脚本
```

#### 后执行脚本

```javascript
暂无后执行脚本
```

## /openai/image模型

```text
用于根据文字描述生成图片，本身调用接口时不需要在config.yaml中配置模型（官方不支持选择模型）该系列接口还在开发中，将在未来提供更多支持
```

#### 公共Header参数

| 参数名 | 示例值 | 参数描述 |
| --- | --- | ---- |
| 暂无参数 |

#### 公共Query参数

| 参数名 | 示例值 | 参数描述 |
| --- | --- | ---- |
| 暂无参数 |

#### 公共Body参数

| 参数名 | 示例值 | 参数描述 |
| --- | --- | ---- |
| 暂无参数 |

#### 预执行脚本

```javascript
暂无预执行脚本
```

#### 后执行脚本

```javascript
暂无后执行脚本
```

## /openai/image模型/image

```text
暂无描述
```

#### 接口状态

> 开发中

#### 接口URL

> http://127.0.0.1:3000/openai/image

#### 请求方式

> POST

#### Content-Type

> json

#### 请求Body参数

```javascript
{
	"prompt": "A cute baby sea otter",
	"n": 1,
	"size": "1024x1024",
    "response_format":"b64_json"
}
```

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| prompt | A cute baby sea otter | String | 是 | 你的文字 |
| n | 1 | Integer | 是 | 生成结果的数目(流式传输与sse订阅中固定为1，不支持配置) |
| size | '256x256' \| '512x512' | '1024x1024' | String | 是 | 生成图片的大小 |
| response_format | url \| b64_json | String | 是 | 图片的返回值格式（在线链接或者base64） |

#### 预执行脚本

```javascript
暂无预执行脚本
```

#### 后执行脚本

```javascript
暂无后执行脚本
```

## /steamship

```text
该平台提供了免费的gpt-4接口可以试用一下,但其速度很慢
```

#### 公共Header参数

| 参数名 | 示例值 | 参数描述 |
| --- | --- | ---- |
| 暂无参数 |

#### 公共Query参数

| 参数名 | 示例值 | 参数描述 |
| --- | --- | ---- |
| 暂无参数 |

#### 公共Body参数

| 参数名 | 示例值 | 参数描述 |
| --- | --- | ---- |
| 暂无参数 |

#### 预执行脚本

```javascript
暂无预执行脚本
```

#### 后执行脚本

```javascript
暂无后执行脚本
```

## /steamship/send

```text
暂无描述
```

#### 接口状态

> 开发中

#### 接口URL

> http://127.0.0.1:3000/send

#### 请求方式

> POST

#### Content-Type

> json

#### 请求Body参数

```javascript
{
  "text":"你好",
  "inputFileId":"xxx" 
}
```

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| text | 你好 | String | 是 | - |
| inputFileId | xxx | String | 是 | 非必填，如果需要继续上次的对话，则填写 |

#### 预执行脚本

```javascript
暂无预执行脚本
```

#### 后执行脚本

```javascript
暂无后执行脚本
```

#### 成功响应示例

```javascript
{
  "text":"我是GPT-4,很高兴认识你",
  "fileId":"xxx"
}
```

| 参数名 | 示例值 | 参数类型 | 参数描述 |
| --- | --- | ---- | ---- |
| text | 我是GPT-4,很高兴认识你 | String |  |
| fileId | xxx | String | 用以标记同一组对话，在request中填入inputFileId，可以连接上下文 |
