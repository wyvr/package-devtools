# Devtools Package

Package for [wyvr](https://wyvr.dev) which contains multiple devtools

-   Data Inspection, view the whole data used on the current page
-   Inspect Hydrated Components, make hydated components visible and inspect the config
-   Media Breakpoints, show the available breakpoints
-   Clear Storage, remove everything in local and session storage
-   Measure Performance, get performance data from the current page
-   ct.css, includes https://csswizardry.com/ct/

## **WARNING: This software is currently under heavy development. It is not considered stable and there may be bugs, incomplete features, or changes without prior notice. Use at your own risk.**


## Install

### Install dependency
Add it to your Node.js Dependencies with 
```bash
pnpm install @wyvr/package-devtools
```
### Add package
Add the package to your `wyvr.js` file

```javascript
export default {
    packages: [
        {
            name: 'DevTools',
            path: '@wyvr/package-devtools',
        },
    ],
};
```

## Usage

Devtools in general are only available in `dev` mode which can by started with 

```bash
wyvr dev
``` 

or by adding the flag `--dev` to your command

## Release Notes

see [Release Notes](RELEASE_NOTES.md)


## Contributing Guidelines

TBD


## License

[MIT](LICENSE.md)
