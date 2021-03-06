<?php

    session_start();
    
    $filename = '/tmp/bots.conf';
    $fh = fopen($filename, 'w');
    
    foreach ($_SESSION["data"]["nodes"] as $key => $value) {
        fwrite($fh, "[" . $value["id"] . "]\n");
        foreach ($value as $subkey => $subvalue) {
            if ($subkey != 'id') {
                fwrite($fh, $subkey . ': ' . $subvalue . "\n");
            }
        }
        fwrite($fh, "\n");
    }
    fclose($fh);
    
    $edges_array = array();
    foreach ($_SESSION["data"]["edges"] as $key => $value) {
        if (!array_key_exists($value["from"], $edges_array)) {
            $edges_array[$value["from"]] = array();
        }
        array_push($edges_array[$value["from"]], $value["to"]);
    }

    $filename = '/tmp/pipeline.conf';
    $fh = fopen($filename, 'w');
    fwrite($fh, "[Pipeline]\n");
        
    
    foreach ($edges_array as $key => $value) {
        $num_items = count($value);
        $i = 0;
        
        fwrite($fh, $key . " = " . $key . "-queue | ");
        foreach ($value as $subkey) {
            fwrite($fh, $subkey . "-queue");
            if(++$i != $num_items) {
                fwrite($fh, ", ");
            }
        }
        fwrite($fh, "\n");
    }
    
    fclose($fh);

?>
