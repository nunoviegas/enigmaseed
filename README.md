# enigmaseed
### node script to password scramble your Crypto Wallet Seed Words

It will give you an extra layer of security, in case someone finds your seed words.
Using a password to shift the index of your seeds, you get a 2FA: something you have (a physical note of your seeds) and something you know (a password)

SHIFT CALCULATION: very simple formula - for every character on the password, take its ascii code and add all the codes. From the resulting value, apply 
the MODULUS function to guarantee that you have a value between 0 and 2047. That is the number of the shift to be added to the original word index.

TIP1: you can use a different password for each seed word, depending, for example, on its position

Ex: <br>
*`SEED1  MySuperPass1`*<br>
*`SEED2  MySuperPass2`*

TIP2: according to the BIP39 specs, the first 4 letters of all the words in the list are unique. You can type just those letters at the prompt   


### Usage:<br>
*`node enigmaseed.js {language} {action}`*

language: a BIP39 .json file for the specified language must be present on the ./wordlists/ path

action: `seed` to shift a seed word; `enigma` to recover a seed word
        
There is an interactive menu, where you can supply supply the password and the seed words<br>
This way, your password and seed words will not show on your command line history log
