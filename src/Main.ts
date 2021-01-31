import { App } from "@ailhc/egf-core";
import { FrameworkLoader } from "./boot-loaders/FrameworkLoader";
import GameConfig from "./GameConfig";
import { m, setModuleMap } from "./ModuleMap";
class Main {
	constructor() {
		this.initEngine();
		this.initFramework();
	}
	async initEngine() {
		//根据IDE设置初始化引擎		
		if (window["Laya3D"]) Laya3D.init(GameConfig.width, GameConfig.height);
		else Laya.init(GameConfig.width, GameConfig.height, Laya["WebGL"]);
		Laya["Physics"] && Laya["Physics"].enable();
		Laya["DebugPanel"] && Laya["DebugPanel"].enable();
		Laya.stage.scaleMode = GameConfig.scaleMode;
		Laya.stage.screenMode = GameConfig.screenMode;
		Laya.stage.alignV = GameConfig.alignV;
		Laya.stage.alignH = GameConfig.alignH;
		//兼容微信不支持加载scene后缀场景
		Laya.URL.exportSceneToJson = GameConfig.exportSceneToJson;

		//打开调试面板（通过IDE设置调试模式，或者url地址增加debug=true参数，均可打开调试面板）
		if (GameConfig.debug || Laya.Utils.getQueryString("debug") == "true") Laya.enableDebugPanel();
		if (GameConfig.physicsDebug && Laya["PhysicsDebugDraw"]) Laya["PhysicsDebugDraw"].enable();
		if (GameConfig.stat) Laya.Stat.show();
		Laya.alertGlobalError(true);

		//激活资源版本控制，version.json由IDE发布功能自动生成，如果没有也不影响后续流程
		await new Promise((res) => {
			Laya.ResourceVersion.enable("version.json", Laya.Handler.create(this, res), Laya.ResourceVersion.FILENAME_VERSION);
			
		})
		//激活大小图映射，加载小图的时候，如果发现小图在大图合集里面，则优先加载大图合集，而不是小图
		await new Promise((res)=>{
			Laya.AtlasInfoManager.enable("fileconfig.json", Laya.Handler.create(this,res));
		})
		//加载IDE指定的场景
		GameConfig.startScene && Laya.Scene.open(GameConfig.startScene);
		
	}
	initFramework() {
		const app = new App();
		app.bootstrap([new FrameworkLoader()]);
		setModuleMap(app.moduleMap);
		app.init();
		m.helloWorld.say();
	}
	
}
//激活启动类
new Main();
