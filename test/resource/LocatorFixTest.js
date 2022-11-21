async function locatorFixTest(driver) {
  await driver.get("https://the-internet.herokuapp.com/login");
  await driver
    .findElementMulti(
      { id: "username_broken" },
      { xpath: '//*[@id="username_broken"]' },
      { css: "#username_broken" },
      { name: "username" }
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
}

module.exports = locatorFixTest;
