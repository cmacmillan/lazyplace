function drawPixel(x, y, color) {
    var col = color;
    var url = "/api/place/draw.json";
    var params = "x="+x+"&y="+y+"&color="+col;
    var xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    //Send the proper header information along with the request
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
    xhr.setRequestHeader("x-requested-with", "XMLHttpRequest");
    xhr.setRequestHeader("x-modhash", r.config["modhash"]);
    xhr.withCredentials = true;
    xhr.send(params);
}

var valsToWrite = [];

var currentColor = -1;
var currentRealColor = "darkkhaki;";

var width = 3;
var height = 3;
var offsetX = 0;
var offsetY = 0;
var minutesToWait = 5;

function initArray(){
    for (var i = 0; i < height; i++) {
        var arr = [];
        for (var j = 0; j < width; j++) {
            arr.push(-1);
        }
        valsToWrite.push(arr);
    }
}
initArray();

function createGrid(w, h) {
    retr = '';
    for (var i = 0; i < height; i++) {
        retr += '<tr>';
        for (var j = 0; j < width; j++) {
            retr+='<td data-x-coor="'+i+'" data-y-coor="'+j+'" style="background-color:darkkhaki" onclick="alertCoor(this)"></td>';
        }
        retr += '</tr>';
    }
    return retr;
}

var body = document.getElementsByTagName("body")[0];
var s = '<style>td{width:50px;height:50px;border:1px solid black}.place-palette>* {box-sizing: border-box;display: inline-block;height: 30px;vertical-align: top;width: 30px;}</style><div id="myModal" class="modal"><!-- Modal content --><div class="modal-content"><span class="close">&times;</span><br><button onclick="drawToCanvas()">DRAW!</button>';
s += '<br>Grid size X:<input type="number" value="3" id="xcoor" style="width:50px">';
s += ' Y:<input type="number" id="ycoor" value="3" style="width:50px"><br>';
s += ' X-offset:<input type="number" id="xoffset" value="0" style="width:50px">';
s += ' Y-offset:<input type="number" id="yoffset" value="0" style="width:50px">   This sets where the upper left corner of your image should be drawn';
s += '<br>So (0,0) means draw your image in the very top left.';
s += '<br>Minutes to wait :<input type="number" id="minWait" value="5" style="width:50px">';
s += '<div id=griddiv>';
s += '<table id="theTable">';
s += createGrid(width, height);
s += '</table></div>';
s+='<br>The default beige/tan color means "do not draw anything new to this pixel"<br><div>Selected Color: <div id="place-palette" class="place-palette"> <div id="indicator" class="place-swatch" style="background-color: darkkhaki;"></div></div></div><div id="place-palette" class="place-palette">Select a color:(Tan means no change)<div class="place-swatch"  data-color-id="-1" style="background-color: darkkhaki;" onclick="selectColor(this)"></div><div class="place-swatch"  data-color-id="0"  style="background-color: rgb(255, 255, 255);" onclick="selectColor(this)"></div><div class="place-swatch"  data-color-id="1"  style="background-color: rgb(228, 228, 228);" onclick="selectColor(this)"></div><div class="place-swatch"  data-color-id="2" style="background-color: rgb(136, 136, 136);" onclick="selectColor(this)"></div><div class="place-swatch"  data-color-id="3" style="background-color: rgb(34, 34, 34);" onclick="selectColor(this)"></div><div class="place-swatch"  data-color-id="4" style="background-color: rgb(255, 167, 209);" onclick="selectColor(this)"></div><div class="place-swatch"  data-color-id="5" style="background-color: rgb(229, 0, 0);" onclick="selectColor(this)"></div><div class="place-swatch"  data-color-id="6" style="background-color: rgb(229, 149, 0);" onclick="selectColor(this)"></div><div class="place-swatch"  data-color-id="7" style="background-color: rgb(160, 106, 66);" onclick="selectColor(this)"></div><div class="place-swatch"  data-color-id="8" style="background-color: rgb(229, 217, 0);" onclick="selectColor(this)"></div><div class="place-swatch"  data-color-id="9" style="background-color: rgb(148, 224, 68);" onclick="selectColor(this)"></div><div class="place-swatch"  data-color-id="10" style="background-color: rgb(2, 190, 1);" onclick="selectColor(this)"></div><div class="place-swatch"  data-color-id="11" style="background-color: rgb(0, 211, 221);" onclick="selectColor(this)"></div><div class="place-swatch"  data-color-id="12" style="background-color: rgb(0, 131, 199);" onclick="selectColor(this)"></div><div class="place-swatch"  data-color-id="13" style="background-color: rgb(0, 0, 234);" onclick="selectColor(this)"></div><div class="place-swatch"  data-color-id="14" style="background-color: rgb(207, 110, 228);" onclick="selectColor(this)"></div><div class="place-swatch"  data-color-id="15" style="background-color: rgb(130, 0, 128);" onclick="selectColor(this)"></div></div></div></div>';
var div = document.createElement('div');
div.innerHTML = s;
body.appendChild(div);
var modal = document.getElementById('myModal');
var span = document.getElementsByClassName("close")[0];
var indicator = document.getElementById('indicator');
var table = document.getElementById('theTable');
var grid = document.getElementById('griddiv');

var xcoorbox=document.getElementById("xcoor");
var ycoorbox=document.getElementById("ycoor");
var xoffsetbox=document.getElementById("xoffset");
var yoffsetbox=document.getElementById("yoffset");
var minwaitbox=document.getElementById("minWait");
initCoorBox();
//setTimeout(function(){​xcoorbox.onchange = function() { alert("something")}},1000);
function initCoorBox() {
    xcoorbox.onchange = resizeGrid;
    ycoorbox.onchange = resizeGrid;
    xoffsetbox.onchange = setOffset;
    yoffsetbox.onchange = setOffset;
    minwaitbox.onchange = setMinWait;
}
function setMinWait() {
    if (xoffsetbox.value != "") {
        minutesToWait = parseInt(minwaitbox.value);
    } else {
        minutesToWait = 5;
    }
}

function setOffset() {
    if (xoffsetbox.value != "") {
        offsetX = parseInt(xoffsetbox.value);
    } else {
        offsetX = 1;
    }
    if (yoffsetbox.value != "") {
        offsetY = parseInt(yoffsetbox.value);
    } else {
        offsetY = 1;
    }   
}

span.onclick = function () {
    modal.style.display = "none";
}
modal.style.display = "block";
function resizeGrid() {
    grid.removeChild(table);
    if (xcoorbox.value != "") {
        width = parseInt(xcoorbox.value);
    } else {
        width = 1;
    }
    if (ycoorbox.value != "") {
        height = parseInt(ycoorbox.value);
    } else {
        height = 1;
    }
    table = document.createElement('table');
    table.id = "theTable";
    var a = createGrid(width, height);
    table.innerHTML = a;
    grid.appendChild(table);
    initArray();
}
function alertCoor(item) {
    var x = parseInt(item.getAttribute("data-x-coor"));
    var y = parseInt(item.getAttribute("data-y-coor"));
    item.style.backgroundColor = currentRealColor;
    valsToWrite[x][y] = currentColor;
}
function selectColor(item) {
    indicator.style.backgroundColor = item.style.backgroundColor;
    currentRealColor = item.style.backgroundColor;
    currentColor =  parseInt(item.getAttribute("data-color-id"));
}
function cloneArr(arr) {
    var retr = [];
    for (var i = 0; i < arr.length; i++) {
        var val = [];
        for (var j = 0; j < arr[i].length; j++) {
            val.push(arr[i][j]);
        }
        retr.push(val);
    }
    return retr;
}
//drawPixel(x, y, color) 
function drawToCanvas() {
    var stack = [];

    for (var i=0;i<height;i++){
        for (var j = 0; j < width; j++) {
            var theColor = valsToWrite[i][j];
            if (theColor != -1) {
                stack.push({x:i,y:j,color:theColor});
            }
        }
    }
    emptyStack(stack); 
}


function emptyStack(stack) {
    if (stack.length > 0) {
        var retr = stack.pop();
        console.log("writing color x:"+retr.x+" y:"+retr.y+" color:"+retr.color);
        drawPixel(retr.y+offsetX, retr.x+offsetY, retr.color);
        if (stack.length == 0) {
            alert("Done!");
            return;
        } else {
            setTimeout(function () { emptyStack(stack); }, 1000 * 60 * minutesToWait + 5000);
        }
    } else {
        alert("Done!");
        return;
    }
}