nlog.js
=====

一个和badjs后端对接的前端错误上报脚本, 支持console关联上报.

和后端约定的协议:


| 字段名    |  是否必选  |  类型     | 字段说明 |
| :------------ | :--------: | --------: | :------ |
| bid       |   是       | 整数      | 业务id        |
| mid       |   否       | 字符串    | monitor上报id |
| level     |   否       | 字符串    | NLOG日志等级<p>默认值：4<ul><li>1：debug，调试日志，开发调试用</li><li>2：INFO，信息日志，一般打一些关键的流水日志用</li><li>4：warn，告警日志，一般的错误日志</li><li>8：error，错误日志，上报一些关键性的错误，导致整个功能不可用的错误</li></ul></p> |
| msg       |   否       | 字符串    | 最多支持20个字段，用“&#124;_&#124;”分隔 <p><ul><li>1:出错信息(必填)</li><li>2:URL(必填)</li><li>3:错误行号(必填)</li></ul>...</p> |