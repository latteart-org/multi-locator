const Page = require("./page");

class LoginPage extends Page {
  get inputUsername() {
    return driver.findElementMulti(
      { id: "username-miss" },
      { xpath: '//*[@id="username"]-miss' },
      { css: "#username > miss" },
      { name: "username" }
    );
  }

  get inputPassword() {
    return driver.findElement({ id: "password" });
  }

  get btnSubmit() {
    return driver.findElementMulti(
      { css: "#login > button > miss" },
      { innerText: "Logi" },
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
