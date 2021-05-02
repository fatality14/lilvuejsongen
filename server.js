const ws = require('ws');
const fs = require('fs');

function host_server(ip, port, connection_foo) {
    serv = new ws.Server({
        host: ip,
        port: port
    });

    serv.on("connection", connection_foo);

    console.log("listening on " + ip + ":" + port);

    return serv;
}

function send_data(sock, data) {
    sock.send(data);
}

function send_JSON_data(sock, data) {
    sock.send(JSON.stringify(data));
}

function setup_sock(sock, open_foo, msg_foo, close_foo, error_foo) {
    sock.on("open", open_foo);
    sock.on("message", msg_foo);
    sock.on("close", close_foo);
    sock.on("error", error_foo);
}

function empty_foo() { }

function is_undef(val) {
    return val === undefined ? true : false;
}

function is_empty_str(val) {
    return val === "" ? true : false;
}

function is_in_collection(val, collection) {
    for (let key in collection) {
        if (collection[key] == val) {
            return true;
        }
    }
    return false;
}

function gen_rnd_int(min, max) {
    min = parseInt(min);
    max = parseInt(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

let clients = {};

let data;

try {
    data = JSON.parse(fs.readFileSync('./mine/ws/data.json'));
} catch {
    data = [];
}

/*
setInterval(function () {
    function callback(err) {
        if (err) throw err;
    }
    fs.writeFile('./mine/ws/logins.json', JSON.stringify(logins), callback);
}, 10000);
*/

let file_tree_props = {};
function gen_rnd_JSON_file_tree(file_tree_props) {
    let file_tree = {};
    let nesting_l, nodes_l, cells_l, key_l, val_l;

    nesting_l = gen_rnd_int(file_tree_props.nesting_in_min, file_tree_props.nesting_in_max);
    nodes_l = gen_rnd_int(file_tree_props.nodes_in_min, file_tree_props.nodes_in_max);
    cells_l = gen_rnd_int(file_tree_props.cells_in_min, file_tree_props.cells_in_max);
    key_l = gen_rnd_int(file_tree_props.key_in_min, file_tree_props.key_in_max);
    val_l = gen_rnd_int(file_tree_props.val_in_min, file_tree_props.val_in_max);

    function count_childs(obj) {
        let child_amount = 0;
        for (key in obj) {
            console.log(key);
            ++child_amount;
        }
        return child_amount;
    }

    function is_node(obj) {
        return typeof obj === 'object';
    }

    function gen_rnd_str(length) {
        var result = [];
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result.push(characters.charAt(Math.floor(Math.random() *
                charactersLength)));
        }
        return result.join('');
    }

    function gen_nodes(curr_depth, node) {
        if (curr_depth === nesting_l - 1) {
            return;
        }

        ++curr_depth;

        nodes_l = gen_rnd_int(file_tree_props.nodes_in_min, file_tree_props.nodes_in_max);
        for (let i = 0; i < nodes_l; ++i) {
            key_l = gen_rnd_int(file_tree_props.key_in_min, file_tree_props.key_in_max);
            let k = gen_rnd_str(key_l);
            node[k] = {};
            gen_nodes(curr_depth, node[k]);
        }
    }

    function gen_cells(curr_depth, node) {
        if (curr_depth === 0) {
            for (let i = 0; i < cells_l; ++i) {
                key_l = gen_rnd_int(file_tree_props.key_in_min, file_tree_props.key_in_max);
                val_l = gen_rnd_int(file_tree_props.val_in_min, file_tree_props.val_in_max);
                let k = gen_rnd_str(key_l);
                node[k] = gen_rnd_str(val_l);
            }
        }
        if (curr_depth === nesting_l - 1) {
            return;
        }

        ++curr_depth;

        for (let key in node) {
            cells_l = gen_rnd_int(file_tree_props.cells_in_min, file_tree_props.cells_in_max);
            for (let i = 0; i < cells_l; ++i) {
                key_l = gen_rnd_int(file_tree_props.key_in_min, file_tree_props.key_in_max);
                val_l = gen_rnd_int(file_tree_props.val_in_min, file_tree_props.val_in_max);
                let k = gen_rnd_str(key_l);
                node[key][k] = gen_rnd_str(val_l);
            }
            gen_cells(curr_depth, node[key]);
        }
    }

    gen_nodes(0, file_tree);
    gen_cells(0, file_tree);

    console.log(JSON.stringify(file_tree));

    return file_tree;
}

function connection_foo(ws) {
    let id = Math.random();

    clients[id] = ws;
    console.log("connection: " + id);

    send_JSON_data(clients[id], {
        'command': 0,
        'id': id
    });

    function msg_foo(msg) {
        console.log('got message: ' + msg);
        let data = JSON.parse(msg);

        if (data) {
            let command = data.command;
            let code = data.code;
            if (!is_undef(command)) {
                if (command === 1000) {
                    if (!is_undef(code)) {
                        if (code == "0") {
                            file_tree_props = Object.assign(data);
                            delete file_tree_props.command;
                            delete file_tree_props.code;

                            let file_tree = gen_rnd_JSON_file_tree(file_tree_props);

                            send_JSON_data(clients[id], {
                                'command': 1000,
                                'code': 0,
                                'file_tree': file_tree
                            });
                        }
                    }
                }
            }
        }
    }

    function close_foo(e) {
        delete clients[id];
    }

    setup_sock(ws, empty_foo, msg_foo, close_foo, empty_foo);
}

let server = host_server('127.0.0.1', 3000, connection_foo);