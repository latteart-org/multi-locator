import { Builder } from "selenium-webdriver";
import { enableMultiLocator, recordFix } from "multi-locator";

describe("ts-jest examples", () => {
  let driver: any;

  beforeEach(async () => {
    driver = await new Builder().forBrowser("chrome").build();
    driver = enableMultiLocator(driver); //add
  });

  afterEach(async () => {
    await driver.quit();
  });

  afterAll(async () => {
    await recordFix(); // add
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
});
