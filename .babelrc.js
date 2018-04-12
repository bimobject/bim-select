const DEBUG = process.env.NODE_ENV === 'development';

module.exports = {
    presets: [
        ['@babel/preset-env', {
            useBuiltIns: 'usage',
            debug: DEBUG,
        }]
    ]
}
