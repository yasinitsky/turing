let _machineInternal = new Object();

_machineInternal.StateClass = class {
    name;
};

_machineInternal.TransitionClass = class {
    nextState;
    nextValue;
    operation;

    constructor(nextState, nextValue, operation) {
        this.nextState = nextState;
        this.nextValue = nextValue;
        this.operation = operation;
    }
};

class Machine {
    static MOVE_RIGHT = 0;
    static MOVE_LEFT = 1;
    static MOVE_NONE = 2;

    static STATUS_DENY = 0;
    static STATUS_ACCEPT = 1;

    static State = _machineInternal.StateClass;
    static Transition = _machineInternal.TransitionClass;
    
    config;
    memory;
    state;
    status;
    position;

    constructor() {
        this.config = new Object();
        this.config.states = new Object();
    }

    getByteCode() {
        return btoa(JSON.stringify(this.config));
    }

    setByteCode(bytecode) {
        this.config = JSON.parse(atob(bytecode));
    }

    init(input) {
        this.memory = new Array(input.length*11).fill('_');
        for(let i = 0; i < input.length; i++) {
            this.memory[input.length*5 + i] = input[i];
            this.state = this.config.init;
        }
        this.position = input.length*5;
    }

    step() {
        let transitions = this.config.states[this.state];
        let transition = transitions ? transitions[this.memory[this.position]] : null;

        if(!transition) {
            if(this.config.accept.includes(this.state)) {
                this.status = Machine.STATUS_ACCEPT;
            } else {
                this.status = Machine.STATUS_DENY;
            }
            return false;
        }

        this.state = transition.nextState;
        this.memory[this.position] = transition.nextValue;

        if(transition.operation === Machine.MOVE_LEFT) {
            this.position--;
        } else if(transition.operation === Machine.MOVE_RIGHT) {
            this.position++;
        }

        return transition;
    }
};