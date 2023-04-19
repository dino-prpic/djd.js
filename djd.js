// Dynamic JSON Data - djd.js


// ANCHOR path
let address = [];
function addToAddress(key) {
    if (key[0].match(/^\d/)) {
        address[address.length - 1] += `[${key}]`;
    } else {
        address.push(key);
    }
}

// const localPaths = [];


// ANCHOR event
function handleChange(key, value) {
    if (key[0] !== '_') {
        console.log(`Setting ${key} to:`);
        console.log(value);

        // fire custom event
        const event = new CustomEvent('data-changed', {
            detail: {
                key,
                value
            }
        });
        document.dispatchEvent(event);

    }
}

// ANCHOR proxy
const handler = {
    get(target, key) {
        if (typeof target[key] === 'object' && target[key] !== null) {
            addToAddress(key);
            return new Proxy(target[key], handler);
        } else {
            // address = [];
            return target[key];
        }
    },
    set(target, key, value) {
        // address.push(key);
        addToAddress(key);
        handleChange(address.join('.'), value);
        address = [];
        return Reflect.set(...arguments);
    }
};
const data = {};
const djd = new Proxy(data, handler);

// ANCHOR API
class Interface {
    get get() {
        return data;
    }
    value(address) {
        return eval(`this.get.${address}`);
    }

    get set() {
        return djd;
    }

    changed(address, callback) {
        const any = address[address.length - 1] === '*';
        if (any) address = address.slice(0, -1);

        document.addEventListener('data-changed', (e) => {
            let {key, value} = e.detail;
            let data;
            if (address.startsWith(key)) {
                key = address.replace(key, '');
                data = eval(`value${key}`);
            } else if (any && key.startsWith(address)) {
                data = this.value(address);
                eval(`data${key.replace(address, '')} = value`);
            } else {
                return;
            }
            
            callback(data);

        });
    }

    browser(path, defaultValue = {}) {
        // path can be a-zA-Z
        if (!path.match(/^[a-zA-Z]+$/)) throw new Error('Local path can be aA-zZ');

        // check if path already exists
        // if (localPaths.includes(path)) return;

        // localPaths.push(path);

        // create localstorage
        const value = JSON.parse(localStorage.getItem(path)) || defaultValue;
        
        this.changed(`${path}*`, (value) => {
            localStorage.setItem(path, JSON.stringify(value));
        });
        
        window.addEventListener('storage', (e) => {
            if (e.key === path) {
                this.set[path] = JSON.parse(e.newValue);
            }
        });
        
        this.set[path] = value;

    }
}
const api = new Interface();
export default api;






// ANCHOR web component
// dynamic-data web component
class DynamicData extends HTMLElement {
    constructor() {
        super();
    }

    template = 'value'

    connectedCallback() {
        // const template = this.textContent;
        const template = this.innerHTML;
        console.log(template);
        if (template) this.template = template;


        this.innerHTML = '';
        this.key = this.dataset.get;

        api.changed(this.key, (value) => {
            this._render(value);
        });
    }

    _render(value = '') {
        this.innerHTML = eval(this.template);
    }
}

customElements.define('dynamic-data', DynamicData);