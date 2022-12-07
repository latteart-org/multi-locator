const { Options } = require("selenium-webdriver/chrome");
const { Builder } = require("selenium-webdriver");
const { enableMultiLocator } = require("../../dist/src/Api");
const { writeFile, readFile } = require("fs/promises");
const { locatorOrderFile } = require("../../dist/src/Constant");

jest.setTimeout(100000);

describe("end-to-end test", () => {
  let driver;

  beforeEach(async () => {
    const screen = {
      width: 640,
      height: 480,
    };
    const options = new Options().headless().windowSize(screen);
    driver = await new Builder()
      .forBrowser("chrome")
      .setChromeOptions(options)
      .build();
    driver = enableMultiLocator(driver);

    await writeFile(locatorOrderFile, "name\ninnerText\ncss\nxpath\nid");
  });

  afterEach(async () => {
    await driver.quit();
  });

  it("test locator fix for plain selenium", async () => {
    const locatorFixTest = require("../resource/LocatorFixTest.js");
    await locatorFixTest(driver);
    await driver.recordFix();

    await new Promise((resolve) => setTimeout(resolve, 1000));
    const fixedScript = await readFile(
      ".multi-locator/fixed/LocatorFixTest.js",
      "utf-8"
    );

    expect(fixedScript).toBe(`async function locatorFixTest(driver) {
  await driver.get("https://the-internet.herokuapp.com/login");
  await driver
    .findElementMulti(
      { id: "username" },
      { xpath: '/html/body/div[2]/div/div/form/div[1]/div/input' },
      { css: "cannot generate 'css' locator for this element" },
      { name: "username" }
    )
    .sendKeys("tomsmith");
  await driver
    .findElementMulti({ id: "password" })
    .sendKeys("SuperSecretPassword!");
  await driver
    .findElementMulti(
      { innerText: "Login" },
      { xpath: '//*[@id="login"]/button' }
    )
    .click();
}

module.exports = locatorFixTest;
`);
  });

  it("test locator extension for plain selenium", async () => {
    const locatorExtensionTest = require("../resource/LocatorExtensionTest.js");
    await locatorExtensionTest(driver);
    await driver.recordFix();

    // If there is no wait, somehow the fixedScript becomes empty.
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const fixedScript = await readFile(
      ".multi-locator/fixed/LocatorExtensionTest.js",
      "utf-8"
    );
    expect(fixedScript).toBe(`async function locatorExtensionTest(driver) {
  await driver.get("https://the-internet.herokuapp.com/login");
  await driver.findElementMulti({ id: "username" }, { name: "username" }, { xpath: "/html/body/div[2]/div/div/form/div[1]/div/input" }).sendKeys("tomsmith");
  await driver.findElementMulti({ id: "password" }, { name: "password" }, { xpath: "/html/body/div[2]/div/div/form/div[2]/div/input" }).sendKeys("SuperSecretPassword!");
  await driver.findElementMulti({ xpath: "/html/body/div[2]/div/div/form/button" }, { innerText: "Login" }, { css: ".radius" }).click();
}

module.exports = locatorExtensionTest;
`);
  });

  it("test findElementMultiStrict for plain selenium", async () => {
    const findElementMultiStrictTest = require("../resource/FindElementMultiStrictTest.js");
    await findElementMultiStrictTest(driver);
    await driver.recordFix();

    // If there is no wait, somehow the fixedScript becomes empty.
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const fixedScript = await readFile(
      ".multi-locator/fixed/FindElementMultiStrictTest.js",
      "utf-8"
    );

    expect(fixedScript)
      .toBe(`async function findElementMultiStrictTest(driver) {
  await driver.get("https://the-internet.herokuapp.com/login");
  await driver
    .findElementMultiStrict(
      { id: "username" },
      { xpath: '/html/body/div[2]/div/div/form/div[1]/div/input' },
      { css: "cannot generate 'css' locator for this element" },
      { name: "username" }
    )
    .sendKeys("tomsmith");
  await driver
    .findElementMultiStrict({ id: "password" })
    .sendKeys("SuperSecretPassword!");
  await driver
    .findElementMultiStrict(
      { innerText: "Login" },
      { xpath: '//*[@id="login"]/button' }
    )
    .click();
}

module.exports = findElementMultiStrictTest;
`);
  });
});
