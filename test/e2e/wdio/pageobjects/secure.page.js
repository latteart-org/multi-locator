const Page = require("./page");

/**
 * sub page containing specific selectors and methods for a specific page
 */
class SecurePage extends Page {
  /**
   * define selectors using getter methods
   */
  get flashAlert() {
    return $("#flash");
  }

  get logoutBtn() {
    // return $('//*[@id="content"]/div/a');
    return driver.findElementMulti(
      { xpath: "/html/body/div[2]/div/div/a" },
      { xpath: "miss" }
    );
  }

  async logout() {
    await (await this.logoutBtn).click();
  }
}

module.exports = new SecurePage();
