var nodes = [];
var edges = [];
var graph = null;
var bots = {};

var CORE_FIELDS = 3;

var popup = document.getElementById("graph-popUp");
var span = document.getElementById('graph-popUp-title');
var table = document.getElementById("graph-popUp-fields");

function disable_file_submit() {
    var file_form = document.getElementById("file-select");
    var graph_row = document.getElementById("graph-row");
    file_form.style.display = 'none';
    graph_row.style.display = 'block';
}

function load_file(elem_id, callback) {
    var file = document.getElementById(elem_id).files[0];
    var file_result = undefined;
    
    var reader = new FileReader();
    reader.onload = (function (event) {
        obj = JSON.parse(event.target.result);
        callback(obj);
    });
    reader.readAsText(file);
}

function verify_files() {
    if (document.getElementById("bots-file").files[0] && 
        document.getElementById("pipeline-file").files[0] && 
        document.getElementById("runtime-file").files[0]) {
        load_file('bots-file', load_bots);
    } else {
        alert('There are some files missing');
    }
    var body = document.getElementsByTagName('body')[0];
    var container = document.getElementsByClassName('container-fluid')[0];
    body.style.height = window.innerHeight * 0.9 + "px";
    container.style.height = window.innerHeight * 0.9 + "px";
}

function load_bots(config) {
    // Do stuff
    // Bots need: label, id, group which corresponds to: label = id = bot_name, group = [collector, parser, expert, output]
    for(bot_group in config) {
        var group = config[bot_group];
        
        available_bots = document.getElementById("available-bots")
        group_title = document.createElement('h5');
        group_title.innerHTML = "&nbsp;&nbsp;" + bot_group;
        available_bots.appendChild(group_title);
        
        for (bot_name in group) {
            var bot = group[bot_name];
            
            var bot_title = document.createElement('button');
            bot_title.setAttribute('type', 'button');
            bot_title.setAttribute('class', 'btn btn-link');
            bot_title.setAttribute('data-toggle', 'tooltip');
            bot_title.setAttribute('data-placement', 'right');
            bot_title.setAttribute('title', bot['description']);
            bot_title.setAttribute('onclick', 'fill_bot("' + bot_group + '", "' + bot_name + '")');
            bot_title.innerHTML = bot_name;
            
            available_bots.appendChild(bot_title);
            available_bots.appendChild(document.createElement('br'));
            
            if (bots[bot_group] === undefined) {
                bots[bot_group] = {};
            }
            
            bots[bot_group][bot_name] = {
                'name': bot['name'],
                'group': bot['group'],
                'module': bot['module'],
                'description': bot['description']
            }
            
            for (parameter in bot['parameters']) {
                var value = bot['parameters'][parameter];
                bots[bot_group][bot_name][parameter] = value;
            }
        }
    }
    
    load_file('runtime-file', load_runtime);
}

function load_runtime(config) {
    // Do stuff
        
    load_file('pipeline-file', load_pipeline);
}

function load_pipeline(config) {
    // Do stuff
        
    disable_file_submit();
    draw();
}

function fill_bot(group, name) {
    var bot = bots[group][name];
    
    for (key in bot) {
        element = document.getElementById("node-" + key)
        
        if (!element) {
            console.info("Creating row");
            new_row = table.insertRow(-1);
            cell1 = new_row.insertCell(0);
            cell2 = new_row.insertCell(1);
            
            cell1.innerHTML = key;
            element = document.createElement("input");
            element.setAttribute('type', 'text');
            cell2.appendChild(element);
        }
        
        console.info("Setting: " + key);
        console.dir(element)
        element.setAttribute('value', bot[key]);    
        console.info("Finished");
    }
}

function draw() {
    var connectionCount = [];

    // create a graph
    var container = document.getElementById('mygraph');

    var data = {
        nodes: nodes,
        edges: edges
    }
    
    popup = document.getElementById("graph-popUp");
    span = document.getElementById('graph-popUp-title');
    table = document.getElementById("graph-popUp-fields");
    
    continue_drawing(connectionCount, container, data);
}

function create_form(title){
    span.innerHTML = title;
    popup.style.top = Math.max(window.innerHeight * 0.5 - 300, 0) + "px";
    popup.style.left = Math.max(window.innerWidth * 0.5 - 150, 0) + "px";
}

function load_form(data){
    for (key in data.custom_fields) {
        new_row = table.insertRow(-1);
        cell1 = new_row.insertCell(0);
        cell2 = new_row.insertCell(1);
        cell3 = new_row.insertCell(2);
        
        cell1.innerHTML = key
        cell2_content = document.createElement("input");
        cell2_content.setAttribute('type', 'text');
        cell2_content.setAttribute('value', data.custom_fields[key]);
        cell2.appendChild(cell2_content);
        
        cell3_content = document.createElement("input");
        cell3_content.setAttribute('type', 'button');
        cell3_content.setAttribute('value', 'delete');
        cell3_content.setAttribute('onclick', 'delete_field(this);');
        cell3.appendChild(cell3_content);
    }
}

function delete_form(){
    
    span.innerHTML = "";    
    
    for (i = table.rows.length-1; i >= 0; i--) { 
        var position = table.rows[i].rowIndex;
        
        if (position >= CORE_FIELDS) {
            table.deleteRow(position);
        }
    }
}

function add_field() {
    new_row = table.insertRow(-1);
    cell1 = new_row.insertCell(0);
    cell2 = new_row.insertCell(1);
    
    cell1_content = document.createElement("input");
    cell2_content = document.createElement("input");
    
    cell1.appendChild(cell1_content);
    cell2.appendChild(cell2_content);
}

function delete_field(row) {
    table.deleteRow(row.parentElement.parentElement.rowIndex);
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
                shape: 'circle',
                color: "#33CC33" // blue
            },
            output: {
                shape: 'database',
                color: "#33CC33" // purple
            },
            expert: {
                shape: 'box',
                color: "#33CC33" // red
            }
        },
        stabilize: false,
        dataManipulation: true,
        navigation: true,
        onAdd: function(data,callback) {
            console.dir(callback);
            var saveButton = document.getElementById('graph-popUp-save');
            var cancelButton = document.getElementById('graph-popUp-cancel');
            var addFieldButton = document.getElementById('graph-popUp-add');
            var div = document.getElementById('graph-popUp');
            create_form("Add Node");
            saveButton.onclick = saveData.bind(this,data,callback);
            addFieldButton.onclick = add_field.bind();
            cancelButton.onclick = clearPopUp.bind();
            div.style.display = 'block';
        },
        onEdit: function(data,callback) {
            var idInput = document.getElementById('node-id');
            var labelInput = document.getElementById('node-label');
            var groupInput = document.getElementById('node-group');
            var saveButton = document.getElementById('graph-popUp-save');
            var cancelButton = document.getElementById('graph-popUp-cancel');
            var addFieldButton = document.getElementById('graph-popUp-add');
            var div = document.getElementById('graph-popUp');
            create_form("Edit Node");
            load_form({'custom_fields': {'cenas': 'asd', 'cenas2': 'asd2'}});
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

    graph.on("resize", function(params) {console.log(params.width,params.height)});

    function clearPopUp() {
        var saveButton = document.getElementById('graph-popUp-save');
        var cancelButton = document.getElementById('graph-popUp-cancel');
        saveButton.onclick = null;
        cancelButton.onclick = null;
        var div = document.getElementById('graph-popUp');
        div.style.display = 'none';
        delete_form();
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

