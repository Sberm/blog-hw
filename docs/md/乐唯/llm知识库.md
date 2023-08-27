# llm知识库文档

项目根目录:

`/root/hw/Langchain-Chatchat`

运行环境(无需手动切换，部署命令中已切换):

```bash
conda activate langchain
conda activate hw
```

## 部署

部署命令(复制自`deploy.sh`, 但请不要直接运行`./deploy.sh`, 如果有哪个接口停止运行了，请单独重启便好):
```bash
# 启动
# 语言模型后端
conda activate langchain && nohup python server/llm_api.py > llm-nohup.log &
# langchain接口
conda activate langchain && nohup python server/api.py > server_api-nohup.log &
# 方便对接java后端的wrapper接口(将java接口转换为langchain接口)
conda activate hw && nohup python api_wrapper.py > api_wrapper-nohup.log &

# webui
conda activate langchain && nohup streamlit run webui.py &

# 多worker(多进程) wrapper(可选用)
conda activate hw && nohup uvicorn api_wrapper:app --workers 3 --host 61.142.208.114 --port 7860 > api_wrapper-nohup.log &

# 如果使用了多worker的wrapper，关闭接口时请使用以下的方法:

# 由于多进程uvicorn的模式是单父进程多子进程，所以不能直接使用 kill -9 杀掉父进程id. 这里提供一个自建命令killu来一键杀掉子进程和父进程
killu <PID>

# 若killu没有用, 如何杀掉多进程的uvicorn后端: 
# 先删所有子进程:
# api -> 查找父进程
kill $(pgrep -P $uvicorn_father_pid)
# 再删父进程:
kill -9 $uvicorn_pid # 再删父进程

# 一不小心删了父进程, 走投无路:
pkill -9 -f ".*/root/anaconda3/envs/hw/bin/python3.11 -c from multiprocessing.spawn import spawn_main; spawn_.*"
```

## llm知识库逻辑

获得用户问题query, 对本地知识库进行检索，若未检索到数据，返回300错误码，若检索到数据，将匹配数据输入chatglm2b语言模型进行润色和处理，返回基于知识库的回答和200错误码

![](/images/docs/乐唯/Snipaste_2023-08-23_14-19-57.png)


## 代码结构
> 由于开源项目代码量和文件量较大，这里仅列出重要的文件

> kill -9 \<PID\> 中的PID几乎都可以通过 `api` 命令得到(除了webui.py。它可以使用`ps aux | grep webui`来找到)

|文件名|作用|启动命令|关闭命令|
|:---:|:---|:---|:---|
|server/llm_api.py|chatglm2语言模型的生成接口|conda activate langchain && nohup python server/llm_api.py > llm-nohup.log &|`kill -9 <PID>` (3个进程，需要执行3次)|
|server/api.py|知识库检索、调用语言模型的总接口|conda activate langchain && nohup python server/api.py > server_api-nohup.log &|`kill -9 <PID>`|
|api_wrapper.py|方便对接java后端的wrapper接口|conda activate hw && nohup uvicorn api_wrapper:app --workers 3 --host 61.142.208.114 --port 7860 > api_wrapper-nohup.log &|`killu <PID>` 若有疑问，请参考上文**部署**中的关闭多worker(多进程)的命令| 
|**server/chat/knowledge_base_chat.py**|知识库检索核心代码, 对知识库检索非常重要。如果想要更改知识库检索的逻辑，改动这个文件|无，仅为调用模块|无，仅为调用模块|
|configs/model_config.py|模型配置文件，包括模型路径和匹配相关度阈值|无，仅为调用模块|无，仅为调用模块|
|webui.py|图形界面，用于导入数据和简单的部署测试|conda activate langchain && nohup streamlit run webui.py &|kill -9 \<PID\>|


## 图形界面

图形界面地址: `http://61.142.208.114:8501/`

#### 1. 如何导入文件

**导入文件小贴士**: 频繁删除向量索引会导致知识库崩溃, 所以，请在处理向量索引的时候，**只添加不删除**!  如果要导入新的数据，请自己新建一个测试知识库，数据向量化，测试数据合格后，再导入到部署知识库`2023-8-21`

将文件(推荐.txt, .csv)放入`/root/hw/Langchain-Chatchat/knowledge_base/<你的知识库名称>/content`

进入webui, 地址: `http://61.142.208.114:8501/`

![](/images/j1.png)

点击链接，进入UI界面。选择知识库管理，切换到相应知识库(现在部署的知识库是: 2023-8-21, 如果要导入测试数据，请新建一个测试知识库)，下面即为已导入的文件。

![](/images/j2.png)


P.S. 也可以使用webui来添加txt, csv文件, 更加便捷。

![](/images/j6.png)


刚刚添加的文件，选择添加至向量库。等待右上角小人停止跑动，向量库从x变成✓, 添加数据成功。


![](/images/j3.png)

使用图形界面测试数据是否成功添加 (如果知识库未搜索到数据，会显示[知识库无匹配])

选择 对话 -> 知识库问答 -> <想要测试的知识库>

![](/images/docs/乐唯/Snipaste_2023-08-23_15-49-44.png)

![](/images/docs/乐唯/Snipaste_2023-08-23_15-51-59.png)


也可以使用使用dtest 测试数据是否成功添加(如果知识库未搜索到数据，会显示[知识库无匹配])

![](/images/j4.png)


反之，有记录

![](/images/j5.png)

#### 删除知识库

下滑，点击删除知识库

适用于测试完导入数据之后，删除不用的测试知识库

![](/images/Snipaste_2023-08-24_17-14-42.png)


## 敏感词过滤

敏感词使用`redis`进行存储, `redis`相关操作命令在此不赘述

如需对redis进行快速增删改查，请使用`redis.ipynb` 这个jupyter notebook文件(推荐使用vscode的远程ssh插件连接到服务器再进行操作，有图形界面可以使用，非常方便)

全部敏感词文件位置: `/root/hw/敏感词过滤/敏感词词库`

可以使用`sadd <敏感词>` 和 `sdel <敏感词>` 来增加和删除敏感词，并动态更新敏感词库

![](/images/docs/乐唯/Snipaste_2023-08-23_15-42-11.png)

## 小工具

> .ipynb为jupyter notebook, 使用vscode的远程ssh插件可以非常方便地运行

|名称|作用|
|:---|:---|
|api|查看所有正在运行的接口程序(*这些程序中都有api三个字, 相当于简化版的 `ps aux \| grep api`*)|
|gpu|查看显卡显存占用情况|
|tsh <文件/文件夹>|将文件移动到废纸篓(位置`/root/.Trash`)|
|dtest <问题>|使用<问题>进行知识库问答(即用于测试知识库模型表现)|
|redis.ipynb|敏感词库快速操作(运行环境: hw)|
|sadd <敏感词>|增加敏感词并更新敏感词库|
|sdel <敏感词>|删除敏感词并更新敏感词库|

## 常见BUG

#### 1. 选择知识库报错

![](/images/docs/乐唯/Snipaste_2023-08-23_15-05-51.png)

解决办法:

`File not found error`代表知识库已不存在，可能是知识库已被删除，新建一个知识库并导入数据即可(已有的稳定数据在`/root/hw/Langchain-Chatchat/婚恋知识库备份`中有保存)

![](/images/docs/乐唯/Snipaste_2023-08-23_15-09-17.png)

#### 2. 使用知识库对话时检索出错

![](/images/docs/乐唯/Snipaste_2023-08-23_15-14-32.png)

解决办法:

可能是因为删除了向量索引，导致向量数据库出错。此时的最好办法是新建一个知识库，重新导入数据并重新创建向量索引。


## 代码改动详解

对langchain-chatchat项目主要改动了如下文件的代码

* server/chat/knowledge_base_chat.py

#### 1. 增加do_shuffle字段(调用时不强制要求), 匹配文本充足时，随机选取其中的几个(可以使得每次生成的回答有所区别)
```python
# 105行
def knowledge_base_chat(query: str = Body(..., description="用户输入", examples=["你好"]),
                        knowledge_base_name: str = Body(..., description="知识库名称", examples=["samples"]),
                        top_k: int = Body(VECTOR_SEARCH_TOP_K, description="匹配向量数"),
                        history: List[History] = Body([],
                                                      description="历史对话",
                                                      examples=[[
                                                          {"role": "user",
                                                           "content": "我们来玩成语接龙，我先来，生龙活虎"},
                                                          {"role": "assistant",
                                                           "content": "虎头虎脑"}]]
                                                      ),
                        stream: bool = Body(False, description="流式输出"),
                        local_doc_url: bool = Body(False, description="知识文件返回本地路径(true)或URL(false)"),
                        do_shuffle: bool = Body(False, description="随机丢弃匹配到的知识"),
                        request: Request = None,
                        ):
```

#### 2. do_shuffle的实现，以及检查检索到的文本是否多于content_length_threshold阈值.

若检索到的文本的长度大于这个阈值，说明匹配到了充足的文本，认为真正检索到了文本。若小于它，认为没有检索到文本。
若没有检索到文本，返回300(这里的300是字符串，且作为纯文本返回，是为了配合后续代码中的return StreamingResponse(knowledge_base_chat_iterator(query, kb, top_k, history, docs), media_type="text/event-stream") 而被使用，是非常丑陋的实现，后续可以改进)

```python
	# 128行
	docs = kb.search_docs(query, top_k)
    if do_shuffle:
        shuffle(docs)
        docs = docs[-4:]
    
    content_length_threshold = 420
    tmp_l = [0]
    tmp_l.extend(docs)
    is_content_valid = lambda docs: reduce(lambda x, y: x + len(y.page_content), docs) >= content_length_threshold
    # print(f"docs length(characters): {reduce(lambda x, y: x + len(y.page_content), tmp_l)}")
    if len(docs) == 0 or \
       not is_content_valid(tmp_l):
        return "300"
```

#### 3. 改动`configs/model_config.py`中的参数

改动知识库匹配相关度阈值
```python
# 知识库匹配相关度阈值，取值范围在0-1之间，SCORE越小，相关度越高，取到1相当于不筛选，建议设置在0.5左右
SCORE_THRESHOLD = 0.49
```

改动chatglm2-6b模型路径
```python
"chatglm2-6b": {
	"local_model_path": "/root/haoyu/ChatGLM2-6B/chatglm2-6b",
	"api_base_url": "http://localhost:8888/v1",  # "name"修改为fastchat服务中的"api_base_url"
	"api_key": "EMPTY"
}
```
