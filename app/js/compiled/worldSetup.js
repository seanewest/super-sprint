var WorldSetup;

WorldSetup = (function() {
  function WorldSetup(resourcesList) {
    this.jsonLinkedList = resourcesList;
    this.playerCar = null;
    this.otherCars = [];
    this.trackWalls = [];
    this.trackStartPositions = [];
    this.mainLoaderCallback = null;
    this.refWorld = null;
    this.firstCarLoaded = false;
  }

  WorldSetup.prototype.launchMultiLoad = function(callback) {
    this.mainLoaderCallback = callback;
    this.loadResource(this.jsonLinkedList.firstNode);
  };

  WorldSetup.prototype.setWorld = function(world) {
    this.refWorld = world;
  };

  WorldSetup.prototype.loadResource = function(resourceNode) {
    if (resourceNode.data === "") {
      this.loadResource(resourceNode.next);
    }
    return this.loadJSON(resourceNode.data, (function(_this) {
      return function(rawJson) {
        var carBody, carFrontTires, carRearTires, carSet, dirJoints, parsedJson;
        parsedJson = JSON.parse(rawJson);
        parsedJson = _this.preprocessRube(parsedJson);
        _this.refWorld = loadWorldFromRUBE(parsedJson, _this.refWorld);
        if (resourceNode.dataType === "car") {
          carBody = getBodiesByCustomProperty(_this.refWorld, "string", "category", "car_body")[0];
          carRearTires = getBodiesByCustomProperty(_this.refWorld, "string", "category", "wheel_rear");
          carFrontTires = getBodiesByCustomProperty(_this.refWorld, "string", "category", "wheel_front");
          dirJoints = getNamedJoints(_this.refWorld, "direction");
          carSet = {
            carBody: carBody,
            rearTires: carRearTires,
            frontTires: carFrontTires,
            directionJoints: dirJoints
          };
          if (!_this.firstCarLoaded) {
            _this.playerCar = carSet;
            _this.firstCarLoaded = true;
          } else {
            _this.otherCars.push(carSet);
          }
        } else if (resourceNode.dataType === "track") {
          _this.trackWalls = getBodies(_this.refWorld);
          _this.trackStartPositions = getBodiesWithNamesStartingWith(_this.refWorld);
        }
        if (resourceNode.next != null) {
          _this.loadResource(resourceNode.next);
        } else {
          _this.mainLoaderCallback(_this.trackWalls, _this.playerCar, _this.otherCars);
        }
      };
    })(this));
  };

  WorldSetup.prototype.preprocessRube = function(parsedJson) {
    var fixture, index, joint, jsonBody, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2;
    _ref = parsedJson.body;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      jsonBody = _ref[_i];
      if (jsonBody.position !== 0) {
        jsonBody.position.y = jsonBody.position.y * -1;
      }
      if (typeof jsonBody.fixture !== "undefined") {
        _ref1 = jsonBody.fixture;
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          fixture = _ref1[_j];
          if (fixture.hasOwnProperty("polygon")) {
            for (index in fixture.polygon.vertices.y) {
              fixture.polygon.vertices.y[index] = -fixture.polygon.vertices.y[index];
            }
            fixture.polygon.vertices.x.reverse();
            fixture.polygon.vertices.y.reverse();
          }
          if (fixture.hasOwnProperty("chain")) {
            for (index in fixture.chain.vertices.y) {
              fixture.chain.vertices.y[index] = -fixture.chain.vertices.y[index];
            }
            fixture.chain.vertices.x.reverse();
            fixture.chain.vertices.y.reverse();
          }
        }
      }
    }
    if (parsedJson.hasOwnProperty("joint")) {
      _ref2 = parsedJson.joint;
      for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
        joint = _ref2[_k];
        if (joint.anchorA !== 0) {
          joint.anchorA.y = joint.anchorA.y * -1;
        }
        if (joint.anchorB !== 0) {
          joint.anchorB.y = joint.anchorB.y * -1;
        }
        joint.upperLimit = 0;
        joint.lowerLimit = 0;
      }
    }
    return parsedJson;
  };

  WorldSetup.prototype.loadJSON = function(filePath, callback) {
    var xobj;
    xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', filePath, true);
    xobj.onreadystatechange = function() {
      if (xobj.readyState === 4 && xobj.status === 200) {
        callback(xobj.responseText);
      }
    };
    xobj.send(null);
  };

  return WorldSetup;

})();
