function generate_pipeline_conf(edges) {
    var pipeline_conf = '';
    var edge_from_dict = {};
    var edge_to_dict = {};
    var done = {};
    
    for (index in edges) {
        var edge = edges[index];
        
        if (!edge_from_dict[edge.from]) {
            edge_from_dict[edge.from] = {};
        }
        edge_from_dict[edge.from][edge.to] = true;
        edge_to_dict[edge.to] = true;
        
        console.info(edge.from + ' - ' + edge.to);
    }
    
    for (from in edge_from_dict) {
        if (edge_to_dict[from]) {
            pipeline_conf += from + ' = ' + from + '-queue | ';
        } else {
            pipeline_conf += from + ' = None | ';
        }
        
        for (to in edge_from_dict[from]) {
            pipeline_conf += to + '-queue,';
        }
        
        pipeline_conf = pipeline_conf.substring(0, pipeline_conf.length - 1);
        pipeline_conf += '\n<br>'
        
        done[from] = true;
    }
    
    for (to in edge_to_dict) {
        if (done[to]) {
            continue;
        }
        
        pipeline_conf += to + ' = ' + to + '-queue | None\n<br>';
    }
    
    return pipeline_conf;
}
