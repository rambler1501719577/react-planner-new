import { Catalog } from "react-planner";

let catalog = new Catalog();

/**
 * import使用通配符会被解析成多个单文件import语句, 如areas有a,b两个文件夹,
 * 则 import * as Areas from "./catalogs/areas\**\planner-element.jsx;
 * 会被编译成
 * var _plannerElementa = __webpack_require__("../src/catalog/catalogs/areas/a/planner-element.jsx");
 * var _plannerElementb = __webpack_require__("../src/catalog/catalogs/areas/b/planner-element.jsx");
 */
import * as Areas from "./catalogs/areas/**/planner-element.jsx";
import * as Lines from "./catalogs/lines/**/planner-element.jsx";
import * as Holes from "./catalogs/holes/**/planner-element.jsx";
import * as Items from "./catalogs/items/**/planner-element.jsx";

for (let x in Areas) catalog.registerElement(Areas[x]);
for (let x in Lines) catalog.registerElement(Lines[x]);
for (let x in Holes) catalog.registerElement(Holes[x]);
for (let x in Items) catalog.registerElement(Items[x]);

catalog.registerCategory("windows", "Windows", [
    Holes.window,
    Holes.sashWindow,
    Holes.venetianBlindWindow,
    Holes.windowCurtain,
]);
catalog.registerCategory("doors", "Doors", [
    Holes.door,
    Holes.doorDouble,
    Holes.panicDoor,
    Holes.panicDoorDouble,
    Holes.slidingDoor,
]);

export default catalog;
