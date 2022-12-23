let _viewInternal = new Object();

_viewInternal.EditorClass = class {
    constructor() {
        const textarea = document.querySelector('.content-compiler-input');
        const lines = document.querySelector('.content-compiler-lines');
        const button = document.querySelector('.content-compiler-button');
        let textareaContent = "";

        textarea.addEventListener('input', event => {
            textareaContent = event.target.value;
            const numberOfLines = textareaContent.split('\n').length;
            lines.innerHTML = Array(numberOfLines).fill('<span></span>').join('');
        });

        button.addEventListener('click', event => {
            let compiler = new Compiler();
            let error = document.getElementById('content-compiler-error');

            error.style.display = 'none';

            let result = compiler.compile(textareaContent);
            if(result.status === false) {
                error.firstChild.innerHTML = `Error in line ${result.line}: ` + result.message;
                error.style.display = 'block';
                return;
            }

            window.location = 'simulation.html?code=' + result.message;
        });
    }
};

_viewInternal.UrlParserClass = class {
    get(key) {
        const params = new Proxy(new URLSearchParams(window.location.search), {
            get: (searchParams, prop) => searchParams.get(prop),
        });

        return params[key];
    }
};

_viewInternal.MachineVisualizerClass = class {
    machine;

    constructor(bytecode) {
        this.machine = new Machine();
        this.machine.setByteCode(bytecode);

        this.memory = document.getElementById('content-memory');
        this.startBtn = document.getElementById('content-data-input-group-start-btn');
        this.input = document.getElementById('content-data-input-group-input');
        this.verdict = document.getElementById('content-verdict');

        this.startBtn.addEventListener('click', (event) => {
            let input = this.input.value.trim();
            this.#init(input);
            this.#runMachine();
        });
    }

    #init(input) {
        this.machine.init(input);
        this.memory.innerHTML = "";

        let buffer = 50*5*input.length > window.innerWidth/2 ? 5*input.length : window.innerWidth/100;

        for(let i = 0; i < buffer; i++) {
            let cell = document.createElement(`div`);
            cell.className = "content-memory-cell";
            cell.innerHTML = "_";
            this.memory.appendChild(cell);
        }

        for(let i = 0; i < input.length; i++) {
            let cell = document.createElement(`div`);
            cell.className = "content-memory-cell";
            cell.innerHTML = input[i];
            if(i === 0) {
                cell.id = "content-memory-cell-active";
            }
            this.memory.appendChild(cell);
        }

        for(let i = 0; i < buffer; i++) {
            let cell = document.createElement(`div`);
            cell.className = "content-memory-cell";
            cell.innerHTML = "_";
            this.memory.appendChild(cell);
        }

        this.memory.scrollLeft = (this.memory.scrollWidth - this.memory.clientWidth)/2;
    }

    async #runMachine() {
        let transition;
        this.verdict.innerHTML = 'Working...';
        document.getElementsByClassName('content-verdict')[0].style.display = 'block';

        while(transition = this.machine.step()) {
            let activeCell = document.getElementById('content-memory-cell-active');
            await this.#sleep(1000);
            activeCell.innerHTML = transition.nextValue;
            await this.#sleep(1000);
            activeCell.id = '';
            if(transition.operation === Machine.MOVE_LEFT) {
                activeCell.previousElementSibling.id = 'content-memory-cell-active';
            } else if(transition.operation === Machine.MOVE_RIGHT) {
                activeCell.nextElementSibling.id = 'content-memory-cell-active';
            }
        }

        if(this.machine.status === 1) {
            this.verdict.innerHTML = 'Accepted';
        } else {
            this.verdict.innerHTML = 'Denied';
        }
    }

    #sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

class View {
    index() {
        this.Editor = new _viewInternal.EditorClass();
    }

    simulation() {
        let bytecode = new _viewInternal.UrlParserClass().get('code');
        
        if(!bytecode) {
            window.location = 'index.html';
        }

        this.MachineVisualizer = new _viewInternal.MachineVisualizerClass(bytecode);
    }
};