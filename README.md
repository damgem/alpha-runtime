# UpperAlpha

UpperAlpha is a web-based IDE for a Assemlby language "α-Notation" which has been theorized in the module "Systemnahme Informatik (SS 2021)" at Uni Bonn.

I started this personal project because of some annoying bugs in [LowerAlpha](https://github.com/SirkoHoeer/LowerAlpha).
(Okay and mainly because I really enjoy creating grammars 😛)

## Get Started
Simply visit [https://damgem.github.io/upperalpha/](https://damgem.github.io/upperalpha/)


## Goals
 - **easy to install/use:**
    
    A web app is plug'n'play and requires no installation.<br>
    Also CodeMirror is a simple yet powerful web code editor.
 
 - **bug free:**

    The usage of [PEGJS](https://pegjs.org/) allows for well structured code. <br>
    Typescript is used to make sure everything fits together. 


## Build
You can choose to clone this repo and compile everything yourself.

```bash
git clone https://github.com/damgem/upperalpha.git
cd upperalpha
npm install
npm run build
```
The resulting build will be located in `./dist`.


If you'd like to change the build process, the current build process consists of:
 - creating a parser from `grammar.pegjs` - parser can be created as a typescript module via the `ts-pegjs` node module
 - transpiling all typescript source files into ES2015 javascript files
 - bundling all javascript files via webpack

## Contribution
I'm happy about every feature request and bug fix. 🙂
