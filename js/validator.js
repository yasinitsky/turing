class Validator {
    static validateStateName(name) {
        if(name[0] != 'q') {
            return new Compiler.Status(false, `State name should start with letter 'q'.`);
        }

        if(name.length < 2) {
            return new Compiler.Status(false, `State name should contain at least 2 characters.`)
        }

        if(!name.match(/^[0-9a-zA-Z]+$/)) {
            return new Compiler.Status(false, `State name shoud contain only alphanumeric characters.`)
        }

        return new Compiler.Status(true);
    }

    static validateAlphabetCharacter(character) {
        if(character.length != 1) {
            return new Compiler.Status(false, `Each value should contain exactly one character.`);
        }

        if(!character.match(/^[0-9a-zA-Z]+$/) && character[0] != '_') {
            return new Compiler.Status(false, `Alphabet characters should be alphanumeric.`);
        }

        return new Compiler.Status(true);
    }

    static validateOperation(operation) {
        if(operation.length != 1) {
            return new Compiler.Status(false, `Operation should contain only one character.`);
        }

        if(operation[0] != '<' && operation[0] != '>' && operation[0] != '-') {
            return new Compiler.Status(false, `Invalid operation.`);
        }

        return new Compiler.Status(true);
    }
}