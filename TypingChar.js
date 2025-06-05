// TypingChar.js - JavaScript version for browser testing
class TypingChar {
    constructor(character, pattern) {
        this.character = character;
        this.patterns = Array.isArray(pattern) ? pattern : [pattern];
        this.currentPatternIndex = 0;
        this.typed = '';
        this.completed = false;
    }

    getCharacter() {
        return this.character;
    }

    getCurrentPattern() {
        return this.patterns[this.currentPatternIndex];
    }

    getTyped() {
        return this.typed;
    }

    isCompleted() {
        return this.completed;
    }

    processKey(key) {
        if (this.completed) {
            return false;
        }

        const currentPattern = this.getCurrentPattern();
        const nextExpected = currentPattern[this.typed.length];

        if (nextExpected === key) {
            this.typed += key;
            if (this.typed === currentPattern) {
                this.completed = true;
            }
            return true;
        }

        return false;
    }

    canAcceptKey(key) {
        if (this.completed) {
            return false;
        }

        const currentPattern = this.getCurrentPattern();
        const nextExpected = currentPattern[this.typed.length];
        return nextExpected === key;
    }

    switchToSingleNPattern() {
        if (this.character === 'ん' && this.typed === 'n') {
            // Find the 'n' pattern and switch to it
            const nPatternIndex = this.patterns.findIndex(pattern => pattern === 'n');
            if (nPatternIndex !== -1) {
                this.currentPatternIndex = nPatternIndex;
                this.completed = true;
                return true;
            }
        }
        return false;
    }

    switchToPattern(targetPattern) {
        const patternIndex = this.patterns.findIndex(pattern => pattern === targetPattern);
        if (patternIndex !== -1) {
            this.currentPatternIndex = patternIndex;
            this.typed = '';
            this.completed = false;
            return true;
        }
        return false;
    }

    getRemainingPattern() {
        if (this.completed) {
            return '';
        }
        const currentPattern = this.getCurrentPattern();
        return currentPattern.slice(this.typed.length);
    }
}
