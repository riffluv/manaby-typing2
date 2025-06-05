// TypingEngine.js - JavaScript version for browser testing
class TypingEngine {
    constructor() {
        this.chars = [];
        this.currentIndex = 0;
        this.completed = false;
    }

    setWord(word) {
        this.chars = [];
        this.currentIndex = 0;
        this.completed = false;

        // Convert each character to TypingChar with patterns from latin-table
        for (let i = 0; i < word.length; i++) {
            const char = word[i];
            const patterns = this.getCharacterPatterns(char);
            this.chars.push(new TypingChar(char, patterns));
        }
    }    getCharacterPatterns(char) {
        // Use the global LATIN_TABLE from latin-table-converter.js
        if (typeof LATIN_TABLE !== 'undefined' && LATIN_TABLE[char]) {
            console.log(`Found patterns for ${char}:`, LATIN_TABLE[char]);
            return LATIN_TABLE[char];
        }
          // Fallback patterns for common characters
        const fallbackPatterns = {
            'プ': ['pu'],
            'ロ': ['ro'],
            'グ': ['gu', 'ggu'],
            'ラ': ['ra'],
            'ミ': ['mi'],
            'ン': ['n', 'nn', 'xn'],
            'ん': ['n', 'nn', 'xn']
        };
        
        console.log(`Using fallback patterns for ${char}:`, fallbackPatterns[char] || [char]);
        return fallbackPatterns[char] || [char];
    }

    processKey(key) {
        if (this.completed || this.currentIndex >= this.chars.length) {
            return false;
        }

        // Handle special "ん" logic first
        if (this.handleNCharacterLogic(key)) {
            return true;
        }

        // Normal key processing
        const currentChar = this.chars[this.currentIndex];
        const result = currentChar.processKey(key);

        if (result && currentChar.isCompleted()) {
            this.currentIndex++;
            if (this.currentIndex >= this.chars.length) {
                this.completed = true;
            }
        }

        return result;
    }

    handleNCharacterLogic(key) {
        if (this.currentIndex >= this.chars.length) {
            return false;
        }

        const currentChar = this.chars[this.currentIndex];
        
        // Check if current character is "ん" with partial input "n"
        if ((currentChar.getCharacter() === 'ん' || currentChar.getCharacter() === 'ン') && 
            currentChar.getTyped() === 'n' && 
            !currentChar.isCompleted()) {
            
            // Check if there's a next character
            if (this.currentIndex + 1 < this.chars.length) {
                const nextChar = this.chars[this.currentIndex + 1];
                const nextCharPatterns = nextChar.patterns;
                
                // Find a pattern in next character that starts with the input key
                const matchingPattern = nextCharPatterns.find(pattern => pattern.startsWith(key));
                
                if (matchingPattern) {
                    console.log(`「ん」パターン切り替え: "${currentChar.getTyped()}" -> "n" 完成, 次の文字「${nextChar.getCharacter()}」のパターン: ${matchingPattern}`);
                    
                    // Complete current "ん" character with single "n"
                    if (currentChar.switchToSingleNPattern()) {
                        this.currentIndex++;
                        
                        // Switch next character to the matching pattern and process the key
                        if (nextChar.switchToPattern(matchingPattern)) {
                            return nextChar.processKey(key);
                        }
                    }
                }
            }
        }

        return false;
    }

    getCurrentIndex() {
        return this.currentIndex;
    }

    getChars() {
        return this.chars;
    }

    isCompleted() {
        return this.completed;
    }

    getCurrentChar() {
        if (this.currentIndex < this.chars.length) {
            return this.chars[this.currentIndex];
        }
        return null;
    }

    getProgress() {
        return {
            current: this.currentIndex,
            total: this.chars.length,
            percentage: this.chars.length > 0 ? (this.currentIndex / this.chars.length) * 100 : 0
        };
    }
}
