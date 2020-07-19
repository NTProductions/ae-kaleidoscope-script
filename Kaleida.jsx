// kaleida
var window = new Window("palette", "Kaleida", undefined);
window.orientation = "column";
var groupOne = window.add("group", undefined, "groupOne");
groupOne.orientation = "row";
groupOne.add("statictext", undefined, "Resolution:");
var rEditText = groupOne.add("edittext", undefined, "250");
rEditText.characters = 5;
var groupTwo = window.add("group", undefined, "groupTwo");
var generateButton = groupTwo.add("button", undefined, "Generate");

var triStateCounter = 0;

window.center();
window.show();

generateButton.onClick = function() {
        if(app.project.activeItem == null || !(app.project.activeItem instanceof CompItem)) {
                alert("Please select a composition and layer to apply to");
                return false;
            }
        
        if(app.project.activeItem.selectedLayers.length < 1) {
            alert("Please select at least one layer");
            return false;
            }
        var blurEffect;
        var triangles = [];
        var thisLayer, precomp;
        var layerCounter = 1;
        var w = parseInt(rEditText.text);
        var iterations = Math.ceil(app.project.activeItem.width/w);
        var pos = [0, app.project.activeItem.height/w*.5];
        var indices = [];
        app.beginUndoGroup("Kaleidaaaaa");
        for(var i = 0; i < app.project.activeItem.selectedLayers.length; i++) {
            thisLayer = app.project.activeItem.selectedLayers[i];
            for(var y = 1; y <= iterations*2; y++) {
                for(var x = 1; x <= iterations; x++) {
                    triangles.push(generateTriangle(triStateCounter, thisLayer, iterations));
                    indices.push(layerCounter);
                    setPosition(triangles[triangles.length-1], pos);

                    layerCounter++;
                    triStateCounter++;
                    if(triStateCounter > 5) {
                    triStateCounter = 0;
                    pos+=[w*2, 0];
                    if(pos[0] > app.project.activeItem.width+w) {
                            pos=[0, w*.5*y];
                        }
                    }

                    }
                

                }
            precomp= app.project.activeItem.layers.precompose(indices, "Slices", true);
            blurEffect = thisLayer.Effects.addProperty("ADBE Gaussian Blur 2");
            blurEffect.property(1).setValue(20);
            }
        
        app.endUndoGroup();
    }

function generateTriangle(index, ogLayer, width) {
    var comp = app.project.activeItem;
    var compOrigin = [comp.width*.5, comp.height*.5];
    // we're going to use this origin as our base for our vertices calculations
    var triangleWidth = comp.width/width;
    triangleLayer = ogLayer.duplicate();
    var triangleShape = new Shape();
    triangleShape.vertices = [[compOrigin[0]-triangleWidth*.5, compOrigin[1]-triangleWidth*.5], [compOrigin[0], compOrigin[1]+triangleWidth*.5], [compOrigin[0]+triangleWidth*.5, compOrigin[1]-triangleWidth*.5]];
    var mask = triangleLayer.Masks.addProperty("Mask");
    mask.property("maskShape").setValue(triangleShape);
    
    triangleLayer.property("ADBE Transform Group").property("ADBE Anchor Point").setValue(triangleLayer.property("ADBE Transform Group").property("ADBE Anchor Point").value+[0, triangleWidth*.5]);
    
    var rot;
    var scale = [];
    switch(index) {
        case 0:
        rot = 300;
        scale = [100, 100];
        break;
        case 1:
        rot = 0;
        scale = [-100, 100];
        break;
        case 2:
        rot = 60;
        scale = [100, 100];
        break;
        case 3:
        rot = 240;
        scale = [-100, 100];
        break;
        case 4:
        rot = 180;
        scale = [100, 100];
        break;
        case 5:
        rot = 120;
        scale = [-100, 100];
        break;
        }
    
    triangleLayer.property("ADBE Transform Group").property("ADBE Rotate Z").setValue(rot);
    triangleLayer.property("ADBE Transform Group").property("ADBE Rotate Z").expression = 'value+time*20';
    triangleLayer.property("ADBE Transform Group").property("ADBE Scale").setValue(scale);
    
    return triangleLayer;
    }

function setPosition(layer, position) {
    layer.property("ADBE Transform Group").property("ADBE Position").setValue(position);
    }