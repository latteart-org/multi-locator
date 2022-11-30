const { enableMultiLocator } = require("multi-locator");

describe("wdio sample", function () {
  beforeEach(() => {
    browser = enableMultiLocator(browser); //add
  });
  this.afterEach(() => {
    browser.recordFix();
  });

  it("fix locator sample", async () => {
    await browser.url("https://the-internet.herokuapp.com/login");
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
    await (
      await browser.findElementMulti(
        { innerText: "Log" },
        { xpath: '//*[@id="login"]/button' }
      )
    ).click();
  });
});
