# Steamship-GPT
本程序将访问Steamship—GPT的接口来免费使用GPT-4的功能

1、首先进入Steamship注册并登录https://www.steamship.com/

2、点击Plugin标签，选择GPT-4

3、点击MyInstances，创建一个plugin，将创建一个plugin的名字填入config.yaml的plugin属性中

4、进入工作区后打开F12，点击NetWork找到任意一个接口，从headers中提取x-workspace-id字段，将之填入config.yaml的workspace属性中

5、点击右上角个人设置头像，点击Account,打开API Key标签页，将token复制，填入config.yaml的token属性中

6、执行chatgpt-server，post http://127.0.0.1:3000/send

7、详情可见示例http://tangtangnas.live:9003
#### request
```json5
{
  "text":"你好",
  "inputFileId":"xxx" //非必填，如果需要继续上次的对话，则填写
}
```
#### response
```json5
{
  "text":"我是GPT-4,很高兴认识你",
  "fileId":"xxx" //用以标记同一组对话，在request中填入inputFileId，可以连接上下文
}
```

### config.yaml
```yaml
server:
  port: 3000                          #设置本程序运行的端口
  proxy:                              #如果需要代理可以在这里配置，不需要可以选择删除
    host: 127.0.0.1
    port: 80
  timeout: 150
  url:                                #接口地址，非必要切勿修改
    file: https://api.steamship.com/api/v1/file/create
    block: https://api.steamship.com/api/v1/block/create
    generate: https://api.steamship.com/api/v1/plugin/instance/generate
    status: https://api.steamship.com/api/v1/task/status
steamship:                            #steamship的配置
  token: *****************            #token
  workspace: *****************        #x-workspace-id
  plugin: gpt-4-plugin                #plugin
log:
  path:                               #log文件的地址，默认在./logs下

```
