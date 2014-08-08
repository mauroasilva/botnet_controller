function generate_startup_conf(nodes) {
    conf_string = '';
    
    for (id in nodes) {
        var bot=nodes[id];
        
        conf_string += '[' + id + ']\n<br>';
        
        for (key in bot) {
            if (key != 'group' && key != 'name' && key != 'module' && key != 'description') {
                continue;
            }
            
            conf_string += key + ' = ' + JSON.stringify(bot[key]) + '\n<br>';
        }
        
        conf_string += '\n<br>';
    }
    
    return conf_string;
}
