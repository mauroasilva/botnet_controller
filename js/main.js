var nodes = null;
var edges = null;
var graph = null;

window.onresize = function(event) {
    var container = document.getElementById('mygraph');
    container.style.height = window.innerHeight * 0.8 + "px";
}

function draw() {
    var connectionCount = [];

    // create a graph
    var container = document.getElementById('mygraph');
    container.style.height = window.innerHeight * 0.8 + "px";

    var data = {
        nodes: [],
        edges: []
    }

    $.getJSON('/php/getdata.php', function (jsondata) {
        for (var key in jsondata['nodes']) {
            data.nodes.push(jsondata['nodes'][key]);
        }

        for (var key in jsondata['edges']) {
            data.edges.push(jsondata['edges'][key]);
        }

        continue_drawing(connectionCount, container, data);
    }).error(function() { 
	alert("ERROR LOADING DATA");
        continue_drawing(connectionCount, container, data); 
    });
}

function continue_drawing(connectionCount, container, data) {
    var options = {
        edges: {
            length: 500,
            width: 3,
            style: 'arrow',
            arrowScaleFactor: 0.5
        },
        groups: {
            input: {
                shape: 'dot',
                color: "#2B7CE9" // blue
            },
            output: {
                shape: 'dot',
                color: "#5A1E5C" // purple
            },
            expert: {
                shape: 'dot',
                color: "#C5000B" // red
            }
        },
        stabilize: false,
        dataManipulation: true,
        navigation: true,
        onAdd: function(data,callback) {
            var span = document.getElementById('operation');
            var idInput = document.getElementById('node-id');
            var labelInput = document.getElementById('node-label');
            var groupInput = document.getElementById('node-group');
            var saveButton = document.getElementById('saveButton');
            var cancelButton = document.getElementById('cancelButton');
            var div = document.getElementById('graph-popUp');
            span.innerHTML = "Add Node";
            idInput.value = data.id;
            labelInput.value = data.label;
            groupInput.value = data.group;
            saveButton.onclick = saveData.bind(this,data,callback);
            cancelButton.onclick = clearPopUp.bind();
            div.style.display = 'block';
        },
        onEdit: function(data,callback) {
            var span = document.getElementById('operation');
            var idInput = document.getElementById('node-id');
            var labelInput = document.getElementById('node-label');
            var groupInput = document.getElementById('node-group');
            var saveButton = document.getElementById('saveButton');
            var cancelButton = document.getElementById('cancelButton');
            var div = document.getElementById('graph-popUp');
            span.innerHTML = "Edit Node";
            idInput.value = data.id;
            labelInput.value = data.label;
            groupInput.value = data.group;
            saveButton.onclick = saveData.bind(this,data,callback);
            cancelButton.onclick = clearPopUp.bind();
            div.style.display = 'block';
        },
        onConnect: function(data,callback) {
            if (data.from == data.to) {
                var r=confirm("Do you want to connect the node to itself?");
                if (r==true) {
                    callback(data);
                }
            } else {
                callback(data);
            }
            
            $.get("/php/editedge.php?id=" + data.id + "&from=" + data.from + "&to=" + data.to);
        },
        onDelete: function(data,callback) {
            callback(data);
            alert(JSON.stringify(data));

            data['edges'].forEach(function(entry) {
                $.get("/php/removeedge.php?id=" + entry);
            });
            data['nodes'].forEach(function(entry) {
                $.get("/php/removenode.php?id=" + entry);
            });
        }
    };
    graph = new vis.Graph(container, data, options);

    // add event listeners
    graph.on('select', function(params) {
        document.getElementById('selection').innerHTML = 'Selection: ' + params.nodes;
    });

    graph.on("resize", function(params) {console.log(params.width,params.height)});

    function clearPopUp() {
        var saveButton = document.getElementById('saveButton');
        var cancelButton = document.getElementById('cancelButton');
        saveButton.onclick = null;
        cancelButton.onclick = null;
        var div = document.getElementById('graph-popUp');
        div.style.display = 'none';
    }

    function saveData(data,callback) {
        var idInput = document.getElementById('node-id');
        var labelInput = document.getElementById('node-label');
        var groupInput = document.getElementById('node-group');
        var div = document.getElementById('graph-popUp');
        data.id = idInput.value;
        data.label = labelInput.value;
        data.group = groupInput.value;

        $.get("/php/editnode.php?id=" + data.id + "&label=" + data.label + "&status=" + data.status + "&group=" + data.group);

        clearPopUp();
        callback(data);
    }
}

