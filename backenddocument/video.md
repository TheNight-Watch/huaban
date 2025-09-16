POST https://ark.cn-beijing.volces.com/api/v3/contents/generations/tasks    运行
本文介绍创建视频生成任务 API 的输入输出参数，供您使用接口时查阅字段含义。模型会依据传入的图片及文本信息生成视频，待生成完成后，您可以按条件查询任务并获取生成的视频。
 
 

请求参数 
跳转 响应参数请求体

model string 必选
您需要调用的模型的 ID （Model ID），开通模型服务，并查询 Model ID 。
您也可通过 Endpoint ID 来调用模型，获得限流、计费类型（前付费/后付费）、运行状态查询、监控、安全等高级能力，可参考获取 Endpoint ID。

content object[] 必选
输入给模型，生成视频的信息，支持文本信息和图片信息。
 

callback_url string 可选
填写本次生成任务结果的回调通知地址。当视频生成任务有状态变化时，方舟将向此地址推送 POST 请求。
回调请求内容结构与查询任务API的返回体一致。
回调返回的 status 包括以下状态：
queued：排队中。
running：任务运行中。
succeeded： 任务成功。（如发送失败，即5秒内没有接收到成功发送的信息，回调三次）
failed：任务失败。（如发送失败，即5秒内没有接收到成功发送的信息，回调三次）

return_last_frame Boolean 默认值 false
仅doubao-seedance-1-0-lite-i2v支持该参数true：返回生成视频的尾帧图像。尾帧图像的格式为 png，宽高像素值与生成的视频一致，无水印。您可通过查询视频生成任务接口获取视频的尾帧图像。
false：不返回生成视频的尾帧图像。




模型文本命令(选填)
在文本提示词后追加 --[parameters] ，控制视频输出的规格，包括宽高比、帧率、分辨率等。
不同模型，可能对应支持不同的参数与取值，详见 模型文本命令比较 。当输入的参数或取值不符合所选的模型时，内容会被忽略或报错。 

resolution  string 简写 rs
不同模型默认值不同，一般是720pdoubao-seedance-1-0-pro 默认值：1080p视频分辨率，枚举值：
不同模型支持的取值不同，详见 模型文本命令比较。
480p
720p
1080p

ratio string 简写 rt
不同模型默认值不同，一般是16:9wan2.1-14b-i2v，wan2-1-14b-flf2v，仅支持 keep_ratiodoubao-seedance-1-0-pro 图生视频，doubao-seedance-1-0-lite-i2v首帧或首尾帧图生视频，默认值：adaptive生成视频的宽高比例。不同模型支持的宽高比和具体像素值见下方表格。
 
 
21:9
16:9 
4:3
1:1
3:4
9:16
9:21
keep_ratio：所生成视频的宽高比与所上传图片的宽高比保持一致。
adaptive：根据所上传图片的比例，自动选择最合适的宽高比。

duration Integer 默认值 5秒 简写 dur
生成视频时长，单位：秒。Wan2.1 仅支持 5 秒，Seedance 支持 3~12 秒。
不同模型支持的取值不同，详见 模型文本命令比较。

framespersecond  Integer 简写 fps
帧率，即一秒时间内视频画面数量。枚举值：
不同模型支持的取值不同，详见 模型文本命令比较。
16 
24

watermark Boolean 默认值 false 简写 wm
生成视频是否包含水印。枚举值：
false：不含水印。
true：含有水印。

seed Integer 默认值 -1 简写 seed
种子整数，用于控制生成内容的随机性。取值范围：[-1, 2^32-1]之间的整数。
注意
当不指定seed值或令seed取值为-1时，会使用随机数替代。
改变seed值，是相同的请求获得不同结果的一种方法。对相同的请求使用相同的seed值会产生类似的结果，但不保证完全一致。

camerafixed Boolean 默认值 false 简写 cf
是否固定摄像头。枚举值：
部分模型支持该参数，详见 模型文本命令比较。
true：固定摄像头。平台会在用户提示词中追加固定摄像头，实际效果不保证。
false：不固定摄像头。


响应参数
跳转 请求参数id string
视频生成任务 ID 。创建视频生成任务为异步接口，获取 ID 后，需要通过 查询视频生成任务 API 来查询视频生成任务的状态。任务成功后，会输出生成视频的video_url。