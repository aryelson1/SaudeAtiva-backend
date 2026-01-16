const packageInfo = require('./package.json');
const esbuild = require('esbuild');
const { copy } = require('esbuild-plugin-copy');

esbuild.build({
    entryPoints: ['./built/esm/src/index.js'],
    bundle: true,
    platform: "node",
    minify: true,
    outfile: `dist/${packageInfo.name}.${packageInfo.version}.js`,
    plugins: [
        copy({
            resolveFrom: 'cwd',
            assets: [{
                from: ['./src/generated/prisma/libquery_engine-debian-openssl-3.0.x.so.node'],
                to: ['./dist/src/generated/prisma'],
            }]
        }),
    ],
}).catch((ex) => {
    console.log(ex);
    process.exit(1);
})