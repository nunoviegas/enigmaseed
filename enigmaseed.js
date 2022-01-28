//////////////////////////////////////////////////////////
//                    ENIGMA SEED                       //
//////////////////////////////////////////////////////////
// Use this program to scramble the SEED words of your  //
// crypto wallet                                        //
// It will give you an extra layer of security, in case //
// someone finds your seed words.                       //
// Using a password to shift the index of your seeds,   //
// you get a 2FA: something you have (a physical note   //
// of your seeds) and something you know (a password)   //
//                                                      //
// SHIFT CALCULATION: very simple formula - for every   //
// character on the password, take its ascii code and   //
// add all the codes. From the resulting value, apply   //
// the MODULUS function to guarantee that you have a    //
// value between 0 and 2047. That is the number of the  //
// shift to be added to the original word index.        //
//                                                      //
// TIP1: you can use a different password for each seed //
// word, depending, for example, on its position        //
// Ex: SEED1  MySuperPass1                              //
//     SEED2  MySuperPass2                              //
//                                                      //
// TIP2: according to the BIP39 specs the 1st 4 letters //
// of all the words are unique. You can type just those //
// letters on the prompt                                //
//                                                      //
//////////////////////////////////////////////////////////
// Usage:                                               //
// node enigmaseed.js {language} {action}              //
//                                                      //
// language: a BIP39 .json file for the specified       //
// language must be present on the ./wordlists/ path    //
//                                                      //
// action: 'seed' to shift a seed word                  //
//         'enigma' to recover a seed word              //
//                                                      //
// There is an interactive menu, where you can supply   //
// supply the password and the seed words               //
// This way, your password and seed words will not show //
// on your command line history log                     //
//////////////////////////////////////////////////////////


//////////////////////////////////////////////////////////
//         VALIDATE ARGUMENTS                           //
//////////////////////////////////////////////////////////
if(process.argv.length != 4) {
    console.log("Invalid number of arguments!");
    console.log("Usage: node enigmaseed.js {language} {action}");
    console.log("Example: node enigmaseed.js english seed");
    return false;
}

//////////////////////////////////////////////////////////
//            SANITIZE ARGUMENTS                        //
//////////////////////////////////////////////////////////
var lang        = process.argv[2].toLowerCase();
var action      = process.argv[3].toLowerCase();
var password, seed;
const actions   = {"seed": {"signal":1, "prompt":"Seed > "}, "enigma": {"signal":-1, "prompt":"Enigma > "}};

if(actions[action] === undefined){
    console.log("Invalid Action! (", action, ")");
    console.log("Possible Actions: 'seed' or 'enigma'");
    return false;
}

//////////////////////////////////////////////////////////
//                 LOAD LANGUAGE FILE                   //
//////////////////////////////////////////////////////////
var bip39, bip4;
function loadLanguageFile(lang){
    try {
        bip39 = require('./wordlists/'+ lang +'.json');
        bip4 = [];
        bip39.map(word => bip4.push(word.substr(0, 4)));
    } catch(err){
        console.log("Language not available! (", lang, ")");
        return false;
    }
    return true;
}
if(!loadLanguageFile(lang)){
    return false;
};

//////////////////////////////////////////////////////////
//              FIND WORD INDEX                         //
// Only the 1st 4 chars are relevant                    //
//////////////////////////////////////////////////////////
function findOrigin(seed4){
    let orig = bip4.indexOf(seed4);
    return orig;
}

//////////////////////////////////////////////////////////
//                 DISPLAY RESULTS                      //
//////////////////////////////////////////////////////////
function displayResults(delta, orig, dest){
    console.log("shifter:", delta);
    console.log("origin [", orig, "] =", bip39[orig]);
    console.log("destiny [", dest, "] =", bip39[dest]);    
}

//////////////////////////////////////////////////////////
//    CALCULATE SHIFT BASED ON PASSWORD ASCII CODES     //
//////////////////////////////////////////////////////////
function getShifter(pass){
    let counter = 0;
    pass.split("").map(c => counter += c.charCodeAt(0));
    return counter;
}

//////////////////////////////////////////////////////////
//                 SHIFT WORDS                          //
//////////////////////////////////////////////////////////
var shifter = 0;
function shiftWords(shift, orig, act){
    shift *= actions[act].signal; 
    return (orig + shift + 2048) % 2048;
}

//////////////////////////////////////////////////////////
//                 Readline Menu                        //
//////////////////////////////////////////////////////////
const readline = require('readline');
var rl = readline.createInterface(process.stdin, process.stdout);

var origin, destiny, reverse;
var menu = 'PASS';
rl.setPrompt('Password > ');
rl.prompt();
rl.on('line', function(msg) {
    switch(menu){
        case 'PASS':
            password = msg;
            shifter = getShifter(password);
            console.log('PASS: ', password);
            console.log('SHIFTER: ', shifter);
            menu = 'WORD';
            rl.setPrompt('\n("!!Q" to Quit)\n("!!P" to change Password)\n'+actions[action].prompt);            
            break;
        case 'WORD':
            seed = msg;
            if(msg === '!!Q') {
                rl.close();
                return false;
                break;
            }
            if(msg === '!!P'){
                menu = 'PASS';
                rl.setPrompt('Password > ');    
                break;
            }

            origin = findOrigin(seed.substring(0,4));
            //console.log("index of '", seed, "': ", origin);
            if(origin === -1) {
                console.log("Invalid Seed Word! (", seed, ")");
                break;
            }
            destiny = shiftWords(shifter, origin, action);
            displayResults(shifter, origin, destiny);
            console.log("------REVERSE-VERIFY-----------");
            reverse = shiftWords(shifter * -1, destiny, action);
            displayResults(shifter * -1, destiny, reverse);
            break;
            
    }
    rl.prompt();
});
