async function locatorFixInLineStyleTest(driver) {
  await driver.get("https://the-internet.herokuapp.com/login");
  await driver.findElementMulti({ id: "password" }, { xpath: '//*[@id="username_broken"]' }, { css: "#username_broken" }, { name: "username" }).sendKeys("tomsmith");
  await driver.findElementMulti({ id: "password" }).sendKeys("SuperSecretPassword!");
  await driver.findElementMulti({ innerText: "Log" }, { xpath: '//*[@id="login"]/button' }).click();
}

module.exports = locatorFixInLineStyleTest;
