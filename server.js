const ws = require('ws');
const fs = require('fs');

const cwd = ".";

function write_file_sync(dir, file_name, data) {
    let path = cwd + "/" + dir + "/" + file_name;
    fs.writeFileSync(path, data);
}
function write_file(dir, file_name, data) {
    let path = cwd + "/" + dir + "/" + file_name;
    function callback(err) {
        if (err) throw err;
    }
    fs.writeFile(path, data);
}
function read_file_sync(dir, file_name) {
    let path = cwd + "/" + dir + "/" + file_name;
    return fs.readFileSync(path);
}
function mk_dir_sync(dir) {
    let path = cwd + "/" + dir;
    if (!fs.existsSync(path))
        fs.mkdirSync(path);

}

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

function gen_rnd_JSON_file_tree(file_tree_props) {
    let file_tree = {};
    let nesting_l, nodes_l, cells_l, key_l, val_l;

    nesting_l = file_tree_props.nesting_in;
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

    function is_obj(obj) {
        return typeof obj === 'object';
    }

    let first = true;
    function gen_nodes(curr_depth, node) {
        if (curr_depth === nesting_l - 1) {
            return;
        }

        ++curr_depth;


        let good_luck = Math.random();
        if (good_luck >= 0 / nesting_l || first === true) {
            nodes_l = gen_rnd_int(file_tree_props.nodes_in_min, file_tree_props.nodes_in_max);
            first = false;
        }
        else {
            nodes_l = 0;
        }

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
            if (is_obj(node)) {
                for (let i = 0; i < cells_l; ++i) {
                    key_l = gen_rnd_int(file_tree_props.key_in_min, file_tree_props.key_in_max);
                    val_l = gen_rnd_int(file_tree_props.val_in_min, file_tree_props.val_in_max);
                    let k = gen_rnd_str(key_l);
                    node[key][k] = gen_rnd_str(val_l);
                }
            }
            gen_cells(curr_depth, node[key]);
        }
    }

    let hard_num = 0, hard_denum = 0;
    function calc_difficulty(curr_depth, node) {
        if (curr_depth === 0) {
            for (let key in node) {
                if (!is_obj(node[key])) {
                    // console.log(node[key]);
                    ++hard_denum;
                }
            }
        }
        if (curr_depth === nesting_l - 1) {
            return;
        }

        ++curr_depth;

        for (let key in node) {
            if (is_obj(node[key])) {
                for (let key1 in node[key]) {
                    if (!is_obj(node[key][key1])) {
                        // console.log(node[key][key1]);
                        ++hard_denum;
                    }
                    // console.log(node[key][key1]);
                    ++hard_num;
                }
            }
            calc_difficulty(curr_depth, node[key]);
        }
    }

    gen_nodes(0, file_tree);
    gen_cells(0, file_tree);
    calc_difficulty(0, file_tree);

    console.log(JSON.stringify(file_tree));
    console.log(hard_num);
    console.log(hard_denum);
    console.log("Gen file tree with difficulty: " + hard_num / hard_denum);

    return [file_tree, hard_num / hard_denum];
}

let file_tree_data;
let curr_file_tree_id;
try {
    file_tree_data = JSON.parse(read_file_sync("JSON", "data.json"));
    curr_file_tree_id = parseInt(file_tree_data.curr_file_tree_id);
}
catch {
    file_tree_data = {};
    curr_file_tree_id = 0;
}

let clients = {};
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
                            let file_tree_props = Object.assign(data);
                            delete file_tree_props.command;
                            delete file_tree_props.code;

                            mk_dir_sync("JSON" + "/" + data.dir_in);
                            for (let i = 0; i < data.amount_in; ++i) {
                                let res = gen_rnd_JSON_file_tree(file_tree_props);
                                let file_tree = res[0];
                                write_file_sync(
                                    "JSON" + "/" + data.dir_in,
                                    curr_file_tree_id + ".json", JSON.stringify(file_tree)
                                );
                                file_tree_data[curr_file_tree_id] = {};
                                file_tree_data[curr_file_tree_id].difficulty = res[1];
                                file_tree_data[curr_file_tree_id].path = data.dir_in;
                                ++curr_file_tree_id;
                            }

                            file_tree_data.curr_file_tree_id = curr_file_tree_id;
                            write_file_sync("JSON", "data.json", JSON.stringify(file_tree_data));

                            send_JSON_data(clients[id], {
                                'command': 1000,
                                'code': 0,
                                'file_tree_data': file_tree_data
                            });
                        }

                        if (code == "1") {
                            send_JSON_data(clients[id], {
                                'command': 1000,
                                'code': 1,
                                'file_tree_data': file_tree_data
                            });
                        }
                    }
                }

                if (command === 1001) {
                    if (!is_undef(code)) {
                        if (code == "0") {
                            console.log(data.file_send_seq);
                            send_JSON_data(clients[id], {
                                'command': 1001,
                                'code': 0
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