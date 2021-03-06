class Game
    constructor:() ->
        @consts = new ConstsDef()
        @stats = new Stats()
        @pixiStage = new PIXI.Stage(0xDDDDDD, true)
        @universe = new Universe(@consts, @pixiStage, ()=> @stats.update())
        @canvas = document.getElementById('canvas')
        @canvas.width = @consts.STAGE_WIDTH_PIXEL
        @canvas.height = @consts.STAGE_HEIGHT_PIXEL

        @debugDraw()
        @initWindowAnimationFrame()

    initWindowAnimationFrame: ()->
        if (!window.requestAnimationFrame)
            window.requestAnimationFrame =  () ->
                return  window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                (callback, element) -> window.setTimeout(callback, 1000 / 60)
        window.onload = @initPixi;
        return

    initPixi:()=>
        container = document.createElement("div");
        document.body.appendChild(container);

        #Stats
        container.appendChild(@stats.domElement);
        @stats.domElement.style.position = "absolute";

        #PIXI
        @pixiRenderer = PIXI.autoDetectRenderer(@consts.STAGE_WIDTH_PIXEL, @consts.STAGE_HEIGHT_PIXEL, undefined, false);
        document.getElementById('gameContainer').appendChild(@pixiRenderer.view);
        background = PIXI.Sprite.fromImage('assets/tracks/images/track0.png');
        @pixiStage.addChild(background);
        pixiLoader = new PIXI.AssetLoader([CarsConfig[0].spritePath]);
        pixiLoader.onComplete = @loadUniverse;
        pixiLoader.load();

    loadUniverse:()=>
        @universe.loadBox2d()

    debugDraw:()->
        debugDrawer = new b2.dyn.b2DebugDraw();
        debugDrawer.SetSprite(document.getElementById("canvas").getContext("2d"))
        debugDrawer.SetDrawScale(100.0)
        debugDrawer.SetFillAlpha(0.5)
        debugDrawer.SetLineThickness(10.0)
        debugDrawer.SetFlags(
            b2.dyn.b2DebugDraw.e_shapeBit |
            b2.dyn.b2DebugDraw.e_jointBit |
            b2.dyn.b2DebugDraw.e_controllerBit |
            b2.dyn.b2DebugDraw.e_pairBit
            #  | b2.dyn.b2DebugDraw.e_centerOfMassBit
            );
        @universe.world.SetDebugDraw(debugDrawer);


game = new Game()