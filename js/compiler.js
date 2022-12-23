let _compilerInternal = new Object();

_compilerInternal.StatusClass = class {
    status;
    message;
    line;

    constructor(status, message = "", line = 0) {
        this.status = status;
        this.message = message;
        this.line = line;
    }
};

_compilerInternal.ConfigurationCommands = new Object();

_compilerInternal.ConfigurationCommands['alphabet'] = (machine, value) => {
    let status = new Compiler.Status(true);
    value = value.trim();
    let values = value.split(',')

    values = values.map(element => { return element.trim() });
    for(let i = 0; i < values.length; i++) {
        element = values[i].trim();

        if(!element) {
            return new Compiler.Status(false, `Expected character after ','.`)
        }

        let result = Validator.validateAlphabetCharacter(element);
        if(result.status === false) return result;
    }

    machine.config.alphabet = values;
    return status;
};

_compilerInternal.ConfigurationCommands['init'] = (machine, value) => {
    value = value.trim();

    let result = Validator.validateStateName(value);
    if(result.status === false) return result;

    machine.config.init = value;
    return new Compiler.Status(true);
};

_compilerInternal.ConfigurationCommands['accept'] = (machine, value) => {
    value = value.trim();
    let values = value.split(',')

    values = values.map(element => { return element.trim() });
    for(let i = 0; i < values.length; i++) {
        element = values[i].trim();

        if(!element) {
            return new Compiler.Status(false, `Expected state name after ','.`);
        }

        let result = Validator.validateStateName(element);
        if(result.status === false) return result;
    }

    machine.config.accept = values;
    return new Compiler.Status(true);
};

class Compiler {
    machine;

    constructor() {
        Compiler.Status = _compilerInternal.StatusClass;
    }

    compile(text) {
        this.machine = new Machine();

        let lines = text.split('\n');
        
        for(let i = 0; i < lines.length; i++){
            let result = this.#proccessLine(this.machine, lines[i]);

            if(result.status === false) {
                result.line = i+1;
                return result;
            }
        }

        if(!this.machine.config.alphabet) {
            return new Compiler.Status(false, "You should provide machine alphabet.");
        }

        if(!this.machine.config.init) {
            return new Compiler.Status(false, "You should provide initial state.");
        }

        return new Compiler.Status(true, this.machine.getByteCode());
    }

    #proccessLine(machine, line) {
        line = line.trim();

        if(line.length === 0) return new Compiler.Status(true);

        if(line.startsWith('//')) return new Compiler.Status(true);
        
        let keys = Object.keys(_compilerInternal.ConfigurationCommands);
        for(let key in keys) {
            if(line.startsWith(keys[key])) {
                let value = line.split(':')[1];
                value = value.trim();

                if(value === undefined) {
                    return new Compiler.Status(false, `Expected ':' and value after ${keys[key]}.`);
                }
                
                return _compilerInternal.ConfigurationCommands[keys[key]](machine, value);
            }
        }

        let currState = line.split(',')[0].trim();

        let result = Validator.validateStateName(currState);
        if(result.status === false) return result;

        let comma = line.indexOf(',');
        if(comma == -1) {
            return new Compiler.Status(false, `Expected comma and [currentValue].`);
        }

        line = line.slice(comma+1);
        let currValue = line.split('->')[0].trim();

        result = Validator.validateAlphabetCharacter(currValue);
        if(result.status === false) return result;

        let arrow = line.indexOf('->');
        if(arrow == -1) {
            return new Compiler.Status(false, `Expected '->' and [newState].`);
        }

        line = line.slice(arrow+2);
        let newState = line.split(',')[0].trim();
        
        console.log(newState);
        result = Validator.validateStateName(newState);
        if(result.status === false) return result;

        comma = line.indexOf(',');
        if(comma == -1) {
            return new Compiler.Status(false, `Expected comma and [newValue].`);
        }
    
        line = line.slice(comma+1);
        let newValue = line.split(',')[0].trim();

        result = Validator.validateAlphabetCharacter(newValue);
        if(result.status === false) return result;

        comma = line.indexOf(',');
        if(comma == -1) {
            return new Compiler.Status(false, `Expected comma and [operation]`);
        }

        line = line.slice(comma+1);
        let operation = line.trim();
        
        result = Validator.validateOperation(operation);
        if(result.status === false) return result;
        
        let transition = new Machine.Transition(newState, newValue, this.#operationToCode(operation));
        
        if(!machine.config.states[currState]) {
            machine.config.states[currState] = new Object();
        }

        machine.config.states[currState][currValue] = transition;
        return new Compiler.Status(true);
    }

    #operationToCode(operation) {
        switch(operation) {
            case '<':
                return Machine.MOVE_LEFT;
            case '>':
                return Machine.MOVE_RIGHT;
            case '-':
                return Machine.MOVE_NONE;
        }
    }
}