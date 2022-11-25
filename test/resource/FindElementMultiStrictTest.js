async function findElementMultiStrictTest(driver) {
  await driver.get("https://the-internet.herokuapp.com/login");
  await driver
    .findElementMultiStrict(
      { id: "username" },
      { xpath: '//*[@id="password"]' },
      { css: "#username_broken" },
      { name: "password" }
    )
    .sendKeys("tomsmith");
  await driver
    .findElementMultiStrict({ id: "password" })
    .sendKeys("SuperSecretPassword!");
  await driver
    .findElementMultiStrict(
      { innerText: "Log" },
      { xpath: '//*[@id="login"]/button' }
    )
    .click();
}

module.exports = findElementMultiStrictTest;
