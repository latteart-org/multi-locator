const LoginPage = require("../pageobjects/login.page");
const SecurePage = require("../pageobjects/secure.page");
const { enableMultiLocator } = require("../../../../dist/src/DriverProxy");

describe("e2e test with wdio", () => {
  before(async () => {
    driver.setTimeout({ script: 600000 });
    driver = enableMultiLocator(driver);
  });

  after(async () => {
    await driver.recordFix();
  });

  it("fix test script using page object", async () => {
    await LoginPage.open();

    await LoginPage.login("tomsmith", "SuperSecretPassword!");
    await expect(SecurePage.flashAlert).toBeExisting();
    await expect(SecurePage.flashAlert).toHaveTextContaining(
      "You logged into a secure area!"
    );
    await SecurePage.logout();

    const fs = require("fs").promises;

    const fixedScript = await fs.readFile(
      ".multi-locator/fixed/login.page.js",
      "utf-8"
    );

    expect(fixedScript).toBe(`const Page = require("./page");

class LoginPage extends Page {
  get inputUsername() {
    return driver.findElementMulti(
      { id: "username" },
      { xpath: '/html/body/div[2]/div/div/form/div[1]/div/input' },
      { css: "cannot generate 'css' locator for this element" },
      { name: "username" }
    );
  }

  get inputPassword() {
    return driver.findElementMulti({ id: "password" }, { name: "password" }, { xpath: "/html/body/div[2]/div/div/form/div[2]/div/input" });
  }

  get btnSubmit() {
    return driver.findElementMulti(
      { css: ".radius" },
      { innerText: "Login" },
      { xpath: 'button[type="submit"]' }
    );
  }

  async login(username, password) {
    await (await this.inputUsername).setValue(username);
    await (await this.inputPassword).setValue(password);
    await (await this.btnSubmit).click();
  }

  open() {
    return super.open("login");
  }
}

module.exports = new LoginPage();
`);
  });
});
