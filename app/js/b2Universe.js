﻿var B2Universe = function (consts)
{
	var me = this;
	//World & Gravity
	this.world = new b2.dyn.b2World(new b2.cMath.b2Vec2(0, 0), true);
	var contactListener = new Box2D.Dynamics.b2ContactListener();
	this.cars = [];
	this.consts = consts;
	var DEGTORAD  = 2 * Math.PI / 360;

	var carPlaced = 0;

	var puddleRandomDirectionArray = new Array(1, -1);
	this.HandleContact = function(contact, began)
	{
		var contactInfo = this.ExtractContactType(contact);
		if(contactInfo.type === "wall")
			return;
		if(began)
		{
			switch(contactInfo.type)
			{
				case "cp": me.cars[0].checkPointManager.Step(parseInt(contactInfo.id)); break;
				case "puddle":me.cars[0].adherence = false;	me.cars[0].paddleEffect = puddleRandomDirectionArray[Math.floor(Math.random()*2)];break;
				case "boost": var boostVector = new b2.cMath.b2Vec2(contactInfo.boostVector.x, contactInfo.boostVector.y);  me.cars[0].ApplyImpulse(boostVector); break;
			}
		}
		else
		{
			me.cars[0].adherence = true;
			me.cars[0].paddleEffect = 0;
		}
	};

	this.ExtractContactType = function(contact)
	{
		aData = contact.GetFixtureA();
		bData = contact.GetFixtureB();

		if(aData.name === "wallFixture" || bData.name === "wallFixture")
		{
			return {"type":"wall"};
		}

		if(aData.name.indexOf("cp") === 0)
			return {"type":"cp", "id":aData.name.substr(2, 3)};
		if(bData.name.indexOf("cp") === 0)
			return {"type":"cp", "id":bData.name.substr(2, 3)};
		if(aData.name.indexOf("boost") === 0)
		{
			return { "type":"boost", "boostVector":aData.customProperties[0].vec2 };
		}
		if(bData.name.indexOf("boost") === 0)
		{
			return { "type":"boost", "boostVector":bData.customProperties[0].vec2 };
		}
	};

	contactListener.BeginContact = function(contact)
	{
		me.HandleContact(contact, true);
	};
	contactListener.EndContact = function(contact) {
		me.HandleContact(contact, false);
	};
	this.world.SetContactListener(contactListener);

	this.CreatePuddles = function()
	{
		var bodyDef = new b2.dyn.b2BodyDef();
		bodyDef.position.Set(this.consts.STAGE_WIDTH_B2 / 4, this.consts.STAGE_HEIGHT_B2 / 2);
		var groundBody = this.world.CreateBody(bodyDef);

		var puddleFixtureDef = new b2.dyn.b2FixtureDef();
		puddleFixtureDef.shape = new b2.shapes.b2PolygonShape();
		puddleFixtureDef.isSensor = true;
		puddleFixtureDef.shape.SetAsBox( 1, 1, new b2.cMath.b2Vec2(-10,15), 20*DEGTORAD );


		var groundAreaFixture = groundBody.CreateFixture(puddleFixtureDef);
		groundAreaFixture.SetUserData( { friction:0.5 });
		// me.world.CreateBody(bodyDef).CreateFixture(groundAreaFixture, 0);

		// puddleFixtureDef.shape.SetAsBox( 9, 5, new b2.cMath.b2Vec2(5,20), -40*DEGTORAD );
		// groundAreaFixture = groundBody.CreateFixture(puddleFixtureDef);
		// groundAreaFixture.SetUserData( {friction:0.2} );
	};

	this.PositionTrack = function(trackWalls)
	{
		for (var i = trackWalls.length - 1; i >= 0; i--)
		{
			var position = trackWalls[i].GetPosition();
			trackWalls[i].SetPosition(new b2.cMath.b2Vec2(position.x + this.consts.STAGE_WIDTH_B2 / 2, position.y +this.consts.STAGE_HEIGHT_B2 / 2));

		}

	};

	this.AddCar = function(carInstance, pixiStage)
	{
		carInstance.checkPointManager = new CheckPointManager(3);
		this.cars.push(carInstance);
		carInstance.b2Body.SetPosition(new b2.cMath.b2Vec2(3, 3));
		pixiStage.addChild(carInstance.pixiSprite);

		var body = getBodiesWithNamesStartingWith(this.world, "start");
		var pos = body[carPlaced++].GetPosition();
		console.log(pos);
		carInstance.b2Body.SetPosition(pos);
		//console.log(this.cars);
	};

};