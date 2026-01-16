import dotenv from 'dotenv';
import path from 'path';

let dotenvPath = __dirname;
let rootReached = false;
let dotenvFound = !dotenv.config({ path: path.resolve(dotenvPath, ".env") }).error;
while (!rootReached && !dotenvFound) {
    dotenvPath = path.resolve(dotenvPath, "..");
    rootReached = path.parse(dotenvPath).root == dotenvPath;
    dotenvFound = !dotenv.config({ path: path.resolve(dotenvPath, ".env") }).error;
}