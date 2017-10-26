require 'json'

d_file = File.open("diaereses.json", "r:UTF-8")
d_string = d_file.read
d_string = d_string[1..-1]
d_json = JSON.parse(d_string)

$trie = {}

class Node

    attr_accessor :word, :letter, :final
    
    def initialize(letter, level)
    
        @letter
        @levels = [level]
        @following = {}
        @word = nil
        @final = false;

    end

    def add_level(level)
        if !@levels.include?(level)
            @levels << level
        end
    end
    
    def [](key)
        return @following[key]
    end
    
    def []=(key, value)
        @following[key] = value
    end
    
    def to_h
        
        ret = {"levels" => @levels}
        if @word != nil
            ret["word"] = @word
        end
        if @following != {}
            ret["following"] = {}
        end
        if @final
            ret["final"] = true
        end
        @following.each{ |letter, follow|
            ret["following"][letter] = follow.to_h
        }
        
        return ret
    end
    
end

# Adds a word to the trie and returns its final node
def add_word(word, level)

    current = nil

    for i in 0..word.length-1
            
        letter = word[i]
        #puts letter + ", "
        if letter == "."
            current.final = true
            return current
        end
        
        if (i == 0)
            
            if $trie[letter] == nil
                current = Node.new(letter, level)
                $trie[letter] = current
            else
                current = $trie[letter]
                current.add_level(level)
            end
        else
            if current[letter] == nil
            
                current[letter] = Node.new(letter, level)
                current = current[letter]
            else
            
                current = current[letter]
                current.add_level(level)
            end
        end
    end
    
    return current        
end

d_json.each {|key, value|

    level = key
    prefixes = value["prefixes"]
    words = value["words"]
    
    for prefix in prefixes 
        final_node = add_word(prefix, level)
        dash_node = Node.new("-", level)        
        final_node["-"] = dash_node
    end
    
    for word in words
        for i in 0...(word.length-1)
            final_node = add_word(word[i], level)
            final_node.word = word[word.length-1]
        end
    end
}

prepared_trie = {}

$trie.each {|key, value|
    prepared_trie[key] = value.to_h
}

#puts prepared_trie

File.open("trie.json","w:UTF-8") do |f|
  f.write(JSON.generate(prepared_trie))
end
