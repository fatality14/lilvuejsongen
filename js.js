function connect(addr, open_foo, msg_foo, close_foo, error_foo) {
    let sock = new WebSocket(addr);
    sock.onopen = open_foo;
    sock.onmessage = msg_foo;
    sock.onclose = close_foo;
    sock.onerror = error_foo;

    return sock;
}

function is_undef(val) {
    return val === undefined ? true : false;
}

function is_in_collection(val, collection) {
    for (let key in collection) {
        if (collection[key] == val) {
            return true;
        }
    }
    return false;
}

function open_foo(e) {
}

function close_foo(e) {
    if (e.wasClean) {
        console.log(`[close] Соединение закрыто чисто, код=${e.code} причина=${e.reason}`);
    } else {
        console.log('[close] Соединение прервано по причине ' + e.code, true);
    }
}

function error_foo(e) {
    console.log(`[error] ${e.message}`);
}

let file_seq = [];
let file_send_seq = {};
let file_send_seq_counter = 0;

let folder_sel_opt = [], document_sel_opt = [];
let folder_sel;
function configure_selection_opt(file_tree_data) {
    let folders = {};
    //console.log(file_tree_data);
    if (file_tree_data === undefined) {
        return;
    }
    for (let key in file_tree_data) {
        if (file_tree_data[key].path !== undefined) {
            folders[file_tree_data[key].path] = "v";
        }
    }

    for (let key in folders) {
        if (!is_in_collection(key, folder_sel_opt)) {
            folder_sel_opt.push(key);
        }
    }

    //document_sel_opt = [];
    //console.log(folder_sel);
    console.log(file_tree_data);
    for (let key in file_tree_data) {
        //console.log(key);
        //console.log(file_tree_data[key].path);

        if (key !== "curr_file_tree_id") {
            if (file_tree_data[key].path === folder_sel) {
                document_sel_opt.push(key + " " + file_tree_data[key].difficulty);
            }
        }
    }
}

let user_id;
let file_tree_data;
function msg_foo(e) {
    let data = JSON.parse(e.data);
    if (data) {
        console.log(data);

        let command = data.command;
        if (!is_undef(command)) {
            //establish connection
            if (command === 0) {
                user_id = data.id;
            }

            //get file tree hierarchy
            if (command === 1000) {
                let code = data.code;
                if (code === 0 || code === 1) {
                    file_tree_data = data.file_tree_data;
                    console.log(file_tree_data);
                }
            }

            //get data sending status
            if (command === 1001) {
                let code = data.code;
                if (code === 0) {
                    console.log("all set");
                }
                if (code === 1) {
                    console.log(data);
                }
            }
        }
    }
}

let socket = connect("ws://127.0.0.1:3000", open_foo, msg_foo, close_foo, error_foo);

function send_data(sock, data) {
    sock.send(data);
}

function send_JSON_data(sock, data) {
    sock.send(JSON.stringify(data));
}

Vue.component("vue-two-range-slider", {
    template: `
    <div>
        <p class ="vue-input-p">{{label}}</p>
        <vue-range-slider :min="min" :max="max" :bg-style="bgStyle" :tooltip-style="tooltipStyle" :process-style="processStyle" v-model="value"></vue-range-slider>
    </div>
    `,
    props: {
        'identify': {
            default: 'null'
        },
        'label': {
            default: this.identify
        },
        'min': {
            default: 0
        },
        'max': {
            default: 100
        }
    },
    data() {
        return {
            value: [this.min, this.max]
        }
    },
    created() {
        this.bgStyle = {
            backgroundColor: '#fff',
            boxShadow: 'inset 0.5px 0.5px 3px 1px rgba(0,0,0,.36)'
        }
        this.tooltipStyle = {
            backgroundColor: 'rgba(0,0,0,.16)',
            borderColor: 'rgba(0,0,0,.16)',
            color: 'rgb(0,0,0)'
        }
        this.processStyle = {
            backgroundColor: '#999'
        }
        VueRangeSlider.methods.handleKeyup = () => console.log;
        VueRangeSlider.methods.handleKeydown = () => console.log;
    },
    watch: {
        value: {
            handler: function () {
                this.$emit('newdata', [this.identify, this.value]);
            },
            deep: true
        }
    }
});
Vue.component("vue-text-input", {
    template: `
    <div>
        <p class ="vue-input-p">{{label}}</p>
        <input class="vue-input" type="text" v-model="value_ret">
    </div>
    `,
    props: {
        'identify': {
            default: 'null'
        },
        'label': {
            default: this.identify
        },
        'value_type': {
            default: "int"
        },
        'value': {
            default: ""
        }
    },
    data() {
        return {
            value_ret: this.value
        }
    },
    watch: {
        value_ret: {
            handler: function () {
                if (this.value_type === "int") {
                }
                else if (this.value_type === "string") {

                }
                //...//
                this.$emit('newdata', [this.identify, this.value_ret]);
            },
            deep: true
        }
    }
});
Vue.component("vue-button", {
    template: `
    <div>
        <input class="vue-button" type="button" :value="label" @click="click">
    </div>
    `,
    props: {
        'identify': {
            default: 'null'
        },
        'label': {
            default: this.identify
        }
    },
    data() {
        return {
        }
    },
    methods: {
        click: function () {
            this.$emit('newdata', [this.identify]);
        }
    }
});
Vue.component("vue-select", {
    template: `
    <div>
        <p class ="vue-input-p">{{label}}</p>
        <select class="vue-select" v-model="value_ret">
            <option v-for="option in options" :value="option">
                {{option}}
            </option>
        </select>
    </div>
    `,
    props: {
        'identify': {
            default: 'null'
        },
        'label': {
            default: this.identify
        },
        'options': {
            default() {
                return [];
            }
        }
    },
    data() {
        return {
            value_ret: this.value
        }
    },
    watch: {
        value_ret: {
            handler: function () {
                if (this.value_type === "int") {
                }
                else if (this.value_type === "string") {

                }
                //...//
                this.$emit('newdata', [this.identify, this.value_ret]);
            },
            deep: true
        }
    }
});

function clickSend() {
    send_JSON_data(socket, {
        "command": 1000,
        "code": 0,

        "nesting_in": nesting,

        "nodes_in_min": nodes[0] + "",
        "nodes_in_max": nodes[1] + "",

        "cells_in_min": cells[0] + "",
        "cells_in_max": cells[1] + "",

        "key_in_min": key[0] + "",
        "key_in_max": key[1] + "",

        "val_in_min": val[0] + "",
        "val_in_max": val[1] + "",

        "amount_in": amount,
        "dir_in": dir
    });
    console.log("sent");
}
let nesting = 2, nodes = [1, 10], cells = [1, 10], key = [5, 10], val = [5, 10], amount = 3, dir = "test", send;
Vue.component("tab-jsongeneration", {
    template: `
    <div>
        <vue-text-input :value="2" :value_type="'int'" @newdata="handleData($event)" :identify="'nesting'" :label="'Nesting'"></vue-text-input>
        <vue-two-range-slider :min="1" :max="10" @newdata="handleData($event)" :identify="'nodes'" :label="'Nodes'"></vue-two-range-slider>
        <vue-two-range-slider :min="1" :max="10" @newdata="handleData($event)" :identify="'cells'" :label="'Cells'"></vue-two-range-slider>
        <vue-two-range-slider :min="5" :max="10" @newdata="handleData($event)" :identify="'key'" :label="'Key'"></vue-two-range-slider>
        <vue-two-range-slider :min="5" :max="10" @newdata="handleData($event)" :identify="'val'" :label="'Val'"></vue-two-range-slider>
        <vue-text-input :value="3" :value_type="'int'" @newdata="handleData($event)" :identify="'amount'" :label="'Amount'"></vue-text-input>
        <vue-text-input :value="'test'" :value_type="'string'" @newdata="handleData($event)" :identify="'dir'" :label="'Dir'"></vue-text-input>
        <vue-button @newdata="handleData($event)" :identify="'send'" :label="'Send'"></vue-button>
    </div>
    `,
    methods: {
        handleData: function (e) {
            if (e[0] === "nesting") {
                nesting = e[1];
                console.log(nesting);
            }
            if (e[0] === "nodes") {
                nodes = e[1];
                console.log(nodes);
            }
            if (e[0] === "cells") {
                cells = e[1]
                console.log(cells);
            }
            if (e[0] === "key") {
                key = e[1];
                console.log(key);
            }
            if (e[0] === "val") {
                val = e[1];
                console.log(val);
            }
            if (e[0] === "amount") {
                amount = e[1];
                console.log(amount);
            }
            if (e[0] === "dir") {
                dir = e[1];
                console.log(dir);
            }
            if (e[0] === "send") {
                send = true;
                clickSend();
                console.log(send);
            }
        }
    },
    data() {
        return {
        }
    }
});

let get, document_sel, add, time = 3, add_sequence, send_sequence;
function addDocumentClick() {
    if (document_sel !== undefined) {
        file_seq.push(document_sel.split(" ")[0]);
    }
    console.log(file_seq);
}
function addSequenceClick() {
    if (file_seq.length !== 0) {
        file_send_seq[file_send_seq_counter] = {
            "file_seq": file_seq,
            "time": time + ""
        };
        ++file_send_seq_counter;
        file_seq = [];
    }
    console.log(file_send_seq_counter);
    console.log(file_send_seq);
}

function getDataClick() {
    send_JSON_data(socket, {
        "command": 1000,
        "code": 1
    });
}
function sendSeqClick() {
    send_JSON_data(socket, {
        "command": 1001,
        "code": 0,
        "file_send_seq": file_send_seq
    });
}
Vue.component("tab-datasending", {
    template: `
    <div>
        <vue-button @newdata="handleData($event)" :identify="'get'" :label="'Get'"></vue-button>
        <vue-select :options="folder_sel_options" @newdata="handleData($event)" :identify="'folder_sel'" :label="'Folder'"></vue-select>
        <vue-select :options="document_sel_options" @newdata="handleData($event)" :identify="'document_sel'" :label="'Document'"></vue-select>
        <vue-button @newdata="handleData($event)" :identify="'add'" :label="'Add'"></vue-button>
        <vue-text-input :value="3" :value_type="'int'" @newdata="handleData($event)" :identify="'time'" :label="'Time'"></vue-text-input>
        <vue-button @newdata="handleData($event)" :identify="'add_sequence'" :label="'Add sequence'"></vue-button>
        <vue-button @newdata="handleData($event)" :identify="'send_sequence'" :label="'Send sequence'"></vue-button>
    </div>
    `,
    methods: {
        handleData: function (e) {
            if (e[0] === "get") {
                get = true;
                getDataClick();
                setTimeout(function () { configure_selection_opt(file_tree_data); }, 100);
                console.log(get);
            }
            if (e[0] === "folder_sel") {
                folder_sel = e[1];
                configure_selection_opt(file_tree_data);
                console.log(folder_sel);
            }
            if (e[0] === "document_sel") {
                document_sel = e[1];
                console.log(document_sel);
            }
            if (e[0] === "add") {
                add = true;
                addDocumentClick();
                console.log(add);
            }
            if (e[0] === "time") {
                time = e[1];
                console.log(time);
            }
            if (e[0] === "add_sequence") {
                add_sequence = true;
                addSequenceClick();
                console.log(add_sequence);
            }
            if (e[0] === "send_sequence") {
                send_sequence = true;
                sendSeqClick();
                console.log(send_sequence);
            }
        }
    },
    data() {
        return {
            folder_sel_options: folder_sel_opt,
            document_sel_options: document_sel_opt
        }
    }
});

new Vue({
    el: "#mode",
    data: {
        currentTab: "Data sending",
        tabs: ["JSON generation", "Data sending"]
    },
    computed: {
        currentTabComponent: function () {
            return "tab-" + this.currentTab.toLowerCase().replace(/[_ ]/g, "");
        }
    }
});

/*
function connect(addr, open_foo, msg_foo, close_foo, error_foo) {
    let sock = new WebSocket(addr);
    sock.onopen = open_foo;
    sock.onmessage = msg_foo;
    sock.onclose = close_foo;
    sock.onerror = error_foo;

    return sock;
}

function is_undef(val) {
    return val === undefined ? true : false;
}

function open_foo(e) {
}

function close_foo(e) {
    if (e.wasClean) {
        console.log(`[close] Соединение закрыто чисто, код=${e.code} причина=${e.reason}`);
    } else {
        console.log('[close] Соединение прервано по причине ' + e.code, true);
    }
}

function error_foo(e) {
    console.log(`[error] ${e.message}`);
}

let file_seq = [];
let file_send_seq = {};
let file_send_seq_counter = 0;
function configure_file_selection(file_tree_data) {
    let folders = {};
    for (let key in file_tree_data) {
        if (file_tree_data[key].path !== undefined) {
            folders[file_tree_data[key].path] = "v";
        }
    }

    folder_sel.innerHTML = "";
    for (let key in folders) {
        let opt = document.createElement("option");
        opt.value = key;
        opt.innerText = key;
        folder_sel.appendChild(opt);
    }

    function fill_document_sel() {
        document_sel.innerHTML = "";
        for (let key in file_tree_data) {
            if (file_tree_data[key].path === folder_sel.value) {
                let opt = document.createElement("option");
                opt.value = key;
                opt.innerText = key + " " + file_tree_data[key].difficulty;
                document_sel.appendChild(opt);
            }
        }
    }

    fill_document_sel();
    folder_sel.onchange = function () {
        fill_document_sel();
    }

    add_document_in.onclick = function () {
        file_seq.push(document_sel.value);
        console.log(file_seq);
    }
    add_seq_in.onclick = function () {
        if (file_seq.length !== 0) {
            file_send_seq[file_send_seq_counter] = {
                "file_seq": file_seq,
                "time": time_in.value
            };
            ++file_send_seq_counter;
            file_seq = [];
        }
        console.log(file_send_seq_counter);
        console.log(file_send_seq);
    }
}

let user_id;
let file_tree_data;
function msg_foo(e) {
    let data = JSON.parse(e.data);
    if (data) {
        console.log(data);

        let command = data.command;
        if (!is_undef(command)) {
            //establish connection
            if (command === 0) {
                user_id = data.id;
            }

            //get file tree hierarchy
            if (command === 1000) {
                let code = data.code;
                if (code === 0 || code === 1) {
                    file_tree_data = data.file_tree_data;
                    console.log(file_tree_data);

                    configure_file_selection(file_tree_data);
                }
            }

            //get data sending status
            if (command === 1001) {
                let code = data.code;
                if (code === 0) {
                    console.log("all set");
                }
                if (code === 1) {
                    console.log(data);
                }
            }
        }
    }
}

let socket = connect("ws://127.0.0.1:3000", open_foo, msg_foo, close_foo, error_foo);

function send_data(sock, data) {
    sock.send(data);
}

function send_JSON_data(sock, data) {
    sock.send(JSON.stringify(data));
}

send_in.onclick = function () {
    send_JSON_data(socket, {
        "command": 1000,
        "code": 0,

        "nesting_in": nesting_in.value,

        "nodes_in_min": nodes_in_min.value,
        "nodes_in_max": nodes_in_max.value,

        "cells_in_min": cells_in_min.value,
        "cells_in_max": cells_in_max.value,

        "key_in_min": key_in_min.value,
        "key_in_max": key_in_max.value,

        "val_in_min": val_in_min.value,
        "val_in_max": val_in_max.value,

        "amount_in": amount_in.value,
        "dir_in": dir_in.value
    });
}

get_data_in.onclick = function () {
    send_JSON_data(socket, {
        "command": 1000,
        "code": 1
    });
}

send_seq_in.onclick = function () {
    send_JSON_data(socket, {
        "command": 1001,
        "code": 0,
        "file_send_seq": file_send_seq
    });
}
*/