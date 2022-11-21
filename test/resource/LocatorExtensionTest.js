async function locatorExtensionTest(driver) {
  await driver.get("https://the-internet.herokuapp.com/login");
  await driver.findElement({ id: "username" }).sendKeys("tomsmith");
  await driver.findElement({ id: "password" }).sendKeys("SuperSecretPassword!");
  await driver.findElement({ xpath: '//*[@id="login"]/button' }).click();
}

module.exports = locatorExtensionTest;
