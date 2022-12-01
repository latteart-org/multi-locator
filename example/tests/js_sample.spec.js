const { Builder } = require("selenium-webdriver");
const { enableMultiLocator } = require("multi-locator");
const { mkdir, writeFile } = require("fs/promises");

jest.setTimeout(100000);

describe("jest examples", () => {
  let driver;

  beforeEach(async () => {
    driver = await new Builder().forBrowser("chrome").build();
    driver = enableMultiLocator(driver); //add
  });

  afterEach(async () => {
    await driver.quit();
    await driver.recordFix(); // add
  });

  it("Fix locator sample", async () => {
    await driver.get("https://the-internet.herokuapp.com/login");
    await driver
      .findElementMulti(
        { id: "username_broken" },
        { xpath: '//*[@id="username_broken"]' },
        { css: "#username" },
        { name: "username_broken" }
      )
      .sendKeys("tomsmith");
    await driver
      .findElementMulti({ id: "password" })
      .sendKeys("SuperSecretPassword!");
    await driver
      .findElementMulti(
        { innerText: "Log" },
        { xpath: '//*[@id="login"]/button' }
      )
      .click();
  });

  it("Expand locator sample", async () => {
    await driver.get("https://the-internet.herokuapp.com/login");
    await driver.findElement({ id: "username" }).sendKeys("tomsmith");
    await driver
      .findElement({ id: "password" })
      .sendKeys("SuperSecretPassword!");
    await driver.findElement({ xpath: '//*[@id="login"]/button' }).click();
  });

  it.only("Locator order sample", async () => {
    await mkdir("./.multi-locator", { recursive: true });

    // set locator priority "id -> name"
    await writeFile(
      "./.multi-locator/locator-order.config",
      "id\nname",
      "utf-8"
    );
    await driver.get("https://the-internet.herokuapp.com/login");
    await driver
      // id is used first
      .findElementMulti({ name: "password" }, { id: "username" })
      .sendKeys("tomsmith");
    await driver
      // name is used first
      .findElementMultiStrict({ name: "password" }, { id: "username" })
      .sendKeys("SuperSecretPassword!");
    await driver.findElementMulti({ xpath: '//*[@id="login"]/button' }).click();
    // clear locator priority
    await writeFile("./.multi-locator/locator-order.config", "", "utf-8");
  });
});
