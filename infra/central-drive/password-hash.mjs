import {passwordHash} from './auth.mjs';
// Read from stdin, not command-line arguments or repository files.
let value='';for await(const chunk of process.stdin)value+=chunk;
console.log(await passwordHash(value.replace(/\r?\n$/,'')));
