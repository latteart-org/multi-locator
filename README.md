# MULOC: Introducing Multiple Locators for End-to-End Testing

MULOC improves the robustness of test scripts by adding support for using multiple locators in E2E testing libraries through extended APIs.  
MULOC currently supports Selenium WebDriver and WebdriverIO, and has been confirmed to work with Jest, ts-jest, and Mocha.

# Features

- Improving the robustness of test scripts by using multiple locators
- Automatic repair of broken locators
- Converting single-locator test scripts to multi-locator ones
- Automatic locator prioritization tailored to your project

# Usage

See [here](https://github.com/latteart-org/multi-locator/tree/main/example/tests) for a complete usage example.

## for Selenium WebDriver

### Setup

`enableMultiLocator()` extends `selenium-webdriver` as follows:

```js
// part of a test script with selenium
const { Builder } = require("selenium-webdriver");
const { enableMultiLocator } = require("multi-locator");

let driver = await new Builder().forBrowser("chrome").build();
driver = enableMultiLocator(driver);
```

### Find Element by Multiple Locators

You can use `findElementMulti()` instead of `findElement()` in Selenium.  
Arguments of `findElementMulti()` must be in hash format.  
`findElementMulti()` locates web elements by trying locators in the order specified in `.multi-locator/locator-order.config`.  
If a locator fails to locate a web element, the next locator is tried.  
If the configuration file does not exist, the locators are tried from the beginning of the argument.

```js
await driver.get("https://the-internet.herokuapp.com/login");
await driver
  .findElementMulti(
    { id: "username" },
    { xpath: '//*[@id="username"]' },
    { css: "#username" },
    { name: "username" }
  )
  .sendKeys("tomsmith");
```

### Automatic Locator Repair

If an application update has caused some locators to break, multiple locators can still be used to identify a web element as long as at least one of the locators is correct.
MULOC can be used to record the fixes for the broken locators by calling `recordFix()` once before the end of the test.

```js
await driver
  .findElementMulti(
    { id: "username_broken" }, // broken
    { xpath: '//*[@id="username_broken"]' }, // broken
    { css: "#username" },
    { name: "username_broken" } // broken
  )
  .sendKeys("tomsmith");
await driver.recordFix(); // require
```

Run `npx muloc show fix <file name>` after executing the test.  
Then the test script with the locators fixed will be output to your console.  
If the fix is OK, you can apply it to the file with `npx muloc apply fix <file path>`.

### Automatic Locator Extension

MULOC can convert test scripts using `findElement` to those using `findElementMulti`.  
It adds as many of the available locators as possible to the argument.

```js
await driver.findElement({ id: "password" }).sendKeys("SuperSecretPassword!");
await driver.recordFix();
```

After executing the test, running `npx muloc show fix <file name>` outputs:

```js
// formatted
await driver
  .findElementMulti(
    { id: "password" },
    { name: "password" },
    { xpath: "/html/body/div[2]/div/div/form/div[2]/div/input" }
  )
  .sendKeys("SuperSecretPassword!");
await driver.recordFix();
```

### Automatic Locator Prioritization

`npx muloc apply order` generates `locator-order.config` that prioritizes more robust locator types based on the number of times the locator types have been modified in the past.  
Locator fix history is stored in `.multi-locator/fix_history.json`.

`npx muloc show order` shows the order of the locator types described in the config file.  
`npx muloc fix clear` clears the fix history.

## for WebdriverIO

It is almost the same as for Selenium WebDriver, but there are some differences in coding rule.  
First, you need to extend the `browser` or `driver` object.

```js
browser = enableMultiLocator(browser);
await browser.url("https://the-internet.herokuapp.com/login");
```

Unlike in Selenium, it is not possible to chain `setValue()` or `click()` with the value returned by `findElementMulti` without resolving `Promise`.  
You must resolve the `Promise` or enclose it in `$()` before chaining the method.

```js
// cannot chain methods without await
await (
  await browser.findElementMulti(
    { id: "username_broken" },
    { xpath: '//*[@id="username_broken"]' },
    { css: "#username" },
    { name: "username_broken" }
  )
).setValue("tomsmith");

// or use $ to avoid outer await
$(await browser.findElement({ id: "password" })).setValue(
  "SuperSecretPassword!"
);
```

# APIs

- `enableMultiLocator(<driver>|<browser>)`

returns an extended driver so that the following functions can be available.

- `findElement({<locator type>: <locator value>})`

collects information to extend the locator in addition to the ordinary `findElement` behavior.

- `findElementMulti({<locator type>: <locator value>}, ...)`

takes multiple locators as arguments and tries them in the order specified in the config file.  
If there is no config, this tries the locators sequentially, starting with the first locator in the argument.

- `findElementMultiStrict({<locator type>: <locator value>}, ...)`

ignores the configured locator order and tries the locators from the beginning of the arguments.

- `recordFix()`

Call this only once before finishing tests to record the modifications.  
Repaired test scripts `.multi-locator/fixed/<file name>` and `fix_history.json` are generated.

# Commands

- `muloc show fix <file name>`

outputs a modified test script given a file name (not a file path).

- `muloc apply fix <file path>`

By giving a file path (not a file name), this applies the modification to the specified file.

- `muloc show order`

outputs the content of `.multi-locator/locator-order.config`

- `muloc apply order`

calculates the order of locators based on the content of `fix_history.json` and generates `.multi-locator/locator-order.config`.

- `muloc clear fix`

clears `fix_history.json`.

# Locator Type

The following locators can be used:  
`id`, `name`, `xpath`, `linkText`, `partialLinkText`, `innerText`, `partialInnerText`, `css`

# Limitations

## Coding Style

Please provide a locator as a string directly as an argument for `findElement()` or `findElementMulti()`.  
Using a variable that contains a string representing the locator will not work correctly.

```js
// ok
await driver.findElement({ id: "password" }).sendKeys("SuperSecretPassword!");

// also ok
const element = driver.findElement({ id: "password" })
await element.sendKeys("sendKeys("SuperSecretPassword!")")

// not work
const locatorValue = "password";
await driver.findElement({ id: `${locatorValue}` }).sendKeys("SuperSecretPassword!");

// not work
const locator = { id: "password" };
await driver.findElement(locator).sendKeys("SuperSecretPassword!");
```

## Locator Type

Currently, MULOC does not support specifying locators using methods like `By.id` or `By.css`.
