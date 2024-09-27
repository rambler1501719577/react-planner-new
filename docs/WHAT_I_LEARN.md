## webpack 通配符导入

```javascript
import * as Areas from "./catalogs/areas/**/planner-element.jsx";
import * as Lines from "./catalogs/lines/**/planner-element.jsx";
import * as Holes from "./catalogs/holes/**/planner-element.jsx";
import * as Items from "./catalogs/items/**/planner-element.jsx";
```

最初看代码, 大概知道是批量导入, 但是修改 react-planner 代码有发现通配符写法失效, 问 chatgpt,误导我, 让我以为是在哪里配置了什么插件

后来发现原生就支持, 只不过会被 webpack 编译, 将批量变为逐个导入

> 这里错了, gpt 是对的, webpack 本身不支持批量导入, 或者说只有用 require.context 实现批量
> 此项目支持批量是因为在 babelrc 中配置了 import-glob 插件, 这个插件支持 import "/abc/\*\*/react-planner.jsx"

如 areas 有 a,b 两个文件夹, 则

```javascript
import * as Areas from "./catalogs/areas\**\planner-element.jsx;
```

会被编译成

```javascript
var _plannerElementa = __webpack_require__(
    "../src/catalog/catalogs/areas/a/planner-element.jsx"
);
var _plannerElementb = __webpack_require__(
    "../src/catalog/catalogs/areas/b/planner-element.jsx"
);
```
