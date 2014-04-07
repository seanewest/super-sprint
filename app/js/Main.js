﻿(function Main()
{
	// PIXI data
	var stage, renderer;
	var world, mouseJoint;
	var touchX, touchY;
	var isBegin;
	var stats;

	var keyboardHandler = new KeyboardHandler();

	(function init()
	{
		if (!window.requestAnimationFrame)
		{
			window.requestAnimationFrame = (function ()
			{
				console.log("top");
				return window.webkitRequestAnimationFrame ||
				window.mozRequestAnimationFrame ||
				window.oRequestAnimationFrame ||
				window.msRequestAnimationFrame ||
				function (callback)
				{
					window.setTimeout(callback, 1000 / 60);
				};
			})();
		}

		window.onload = onLoad;
	})();

	function onLoad()
	{
		const container = document.createElement("div");
		document.body.appendChild(container);

		stats = new Stats();
		container.appendChild(stats.domElement);
		stats.domElement.style.position = "absolute";

		stage = new PIXI.Stage(0xDDDDDD, true);

		renderer = PIXI.autoDetectRenderer(Consts.STAGE_WIDTH, Consts.STAGE_HEIGHT, undefined, false);
		document.body.appendChild(renderer.view);

		const loader = new PIXI.AssetLoader(["Content/images/car.png"]);
		loader.onComplete = onLoadAssets;
		loader.load();
	}
	function onLoadAssets()
	{
		world = new Box2D.Dynamics.b2World(new Box2D.Common.Math.b2Vec2(1, 1), true);

		CreateWalls();
		car = new Car(stage);
		car.createBody(bodyDef, world, polyFixture);


		//right
		bodyDef.position.Set(STAGE_WIDTH / METER + 1, 0);
		world.CreateBody(bodyDef).CreateFixture(polyFixture);
		bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
		
		for (var i = 0; i < 1; i++)
		{
			bodyDef.position.Set(STAGE_WIDTH / 2 / METER, 0);
			bodyDef.angle = -1;
			//body.ApplyImpulse(impulse, body.GetWorldCenter());

			var body = world.CreateBody(bodyDef);
			var s = MathUtil.rndRange(50, 100);
			polyFixture.shape.SetAsBox(32 / METER, 16 / METER);
			body.CreateFixture(polyFixture);

			bodies.push(body);

			var box = new PIXI.Sprite(PIXI.Texture.fromFrame("Content/images/car.png"));
			stage.addChild(box);
			box.i = i;
			box.anchor.x = box.anchor.y = 0.5;
			box.scale.x = 1;
			box.scale.y = 1;
			actors[actors.length] = box;
		}
		console.log(keyboardHandler.HandleKeyDown);
		document.onkeydown = keyboardHandler.HandleKeyDown.bind(keyboardHandler);
		document.onkeyup = keyboardHandler.HandleKeyUp.bind(keyboardHandler);


		document.addEventListener("mousedown", function (event)
		{
			isBegin = true;
			onMove(event);
			document.addEventListener("mousemove", onMove, true);
		}, true);
		document.addEventListener("mouseup", function (event)
		{
			document.removeEventListener("mousemove", onMove, true);
			isBegin = false;
			touchX = undefined;
			touchY = undefined;
		}, true);
		renderer.view.addEventListener("touchstart", function (event)
		{
			isBegin = true;
			onMove(event);
			renderer.view.addEventListener("touchmove", onMove, true);
		}, true);
		renderer.view.addEventListener("touchend", function (event)
		{
			renderer.view.removeEventListener("touchmove", onMove, true);
			isBegin = false;
			touchX = undefined;
			touchY = undefined;
		}, true);

		update();
	}

	function CreateWalls()
	{
		polyFixture.shape = new b2.shapes.b2PolygonShape();
		polyFixture.density = 1;
		bodyDef.type = b2.dyn.b2Body.b2_staticBody;

		//down
		polyFixture.shape.SetAsBox(10, 1);
		bodyDef.position.Set(9, Consts.STAGE_HEIGHT + 1);
		world.CreateBody(bodyDef).CreateFixture(polyFixture);

		//left
		polyFixture.shape.SetAsBox(1, 100);
		bodyDef.position.Set(-1, 0);
		world.CreateBody(bodyDef).CreateFixture(polyFixture);

		//right
		bodyDef.position.Set(Consts.STAGE_WIDTH + 1, 0);
		world.CreateBody(bodyDef).CreateFixture(polyFixture);
		bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
	}

	function update()
	{
		requestAnimationFrame(update);
		car.updateData(keyboardHandler.Keys);
		if (isBegin && !mouseJoint)
		{
			const dragBody = getBodyAtMouse();
			if (dragBody)
			{
				const jointDef = new Box2D.Dynamics.Joints.b2MouseJointDef();
				jointDef.bodyA = world.GetGroundBody();
				jointDef.bodyB = dragBody;
				jointDef.target.Set(touchX, touchY);
				jointDef.collideConnected = true;
				jointDef.maxForce = 300.0 * dragBody.GetMass();
				mouseJoint = world.CreateJoint(jointDef);
				dragBody.SetAwake(true);
			}
		}

		if (mouseJoint)
		{
			if (isBegin)
				mouseJoint.SetTarget(new Box2D.Common.Math.b2Vec2(touchX, touchY));
			else
			{
				world.DestroyJoint(mouseJoint);
				mouseJoint = null;
			}
		}

		world.Step(1 / 60, 3, 3);
		world.ClearForces();


		const n = actors.length;
		for (var i = 0; i < n; i++)
		{
			var body = bodies[i];
			var actor = actors[i];


			var currentRightNormal = body.GetWorldVector(new Box2D.Common.Math.b2Vec2(1, 0));
			var vCurrentRightNormal = Box2D.Common.Math.b2Math.MulFV(Box2D.Common.Math.b2Math.Dot(currentRightNormal, body.GetLinearVelocity()), currentRightNormal);
			//console.log(vCurrentRightNormal);

			var impulse = Box2D.Common.Math.b2Math.MulFV(-body.GetMass(), vCurrentRightNormal);
			body.ApplyImpulse(impulse, body.GetWorldCenter());
			if (keyboardHandler.Keys.accelerate)
			{
				body.ApplyForce(new Box2D.Common.Math.b2Vec2(1 / METER, 1 / METER), new Box2D.Common.Math.b2Vec2(0, 0));
			}
			var position = body.GetPosition();
			actor.position.x = position.x * 100;
			actor.position.y = position.y * 100;
			actor.rotation = body.GetAngle();
		}
		var body;
		world.QueryAABB(function (fixture)
        {
            if (fixture.GetBody().GetType() != Box2D.Dynamics.b2BodyDef.b2_staticBody)
            {
            	if (fixture.GetShape().TestPoint(fixture.GetBody().GetTransform(), mousePos))
            	{
            		body = fixture.GetBody();
            		return false;
            	}
            }
            return true;
        }, aabb);

		return body;
	}

	function onMove(event)
	{
		if (event["changedTouches"])
		{
			var touche = event["changedTouches"][0];
			touchX = touche.pageX / Consts.METER;
			touchY = touche.pageY / Consts.METER;
		}
		else
		{
			touchX = event.clientX / Consts.METER;
			touchY = event.clientY / Consts.METER;
		}
	}

})();