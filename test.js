const { Builder, By, Key, until } = require('selenium-webdriver');
const { assert } = require('chai');

describe('Selenium Test', function () {
  let driver;
  const elementTimeout = 10000;
  const poNumber = generateRandomString(10);

  this.beforeEach(async function () {
    return new Promise(async (resolve, reject) => {
      try {
        driver = await new Builder().forBrowser('chrome').build();
        resolve();
      } catch (error) {
        console.error('Error creating WebDriver instance:', error);
        reject(error);
      }
    });
  });

  this.afterEach(async function () {
    await driver.quit();
  });

  it('E2E test, up to setting PO as Arrived', async function () {
    await driver.get('https://staging.wms.cozey.ca/');
    await driver.findElement(By.id('username')).sendKeys('menan+qatest@cozey.ca');
    await driver.findElement(By.id('password')).sendKeys('Qatest123!');
    await driver.findElement(By.xpath(`//div[contains(@class, 'cdc80f5fa')]/button`)).click();

    // Wait for left nav menu to load
    await driver.wait(async function () {
        const elements = await driver.findElements(By.className('my-2'));
        return elements.length == 5;
      }, elementTimeout, "Left navigation menu not loading up within 10 seconds");

    (await driver.findElements(By.className('my-2')))[1].click();

    // Wait for add PO shows up
    await driver.wait(async function () {
        const elements = await driver.findElements(By.className('uppercase py-2 hover:bg-slate-300 w-full'));
        return elements.length == 3;
      }, elementTimeout, "PO sub menu not loading up in 10 seconds");

    (await driver.findElements(By.className('uppercase py-2 hover:bg-slate-300 w-full')))[2].click();
    
    // Wait for Add PO page to finish loading
    await driver.wait(
        until.elementLocated(By.xpath(`//button/span[contains(text(), 'Confirm')]`)),
        elementTimeout,
        "Add PO page not finished loading in 10 seconds"
    );
    
    // Create PO

    await driver.findElement(By.name('po')).sendKeys(poNumber);
    await driver.wait(
        until.elementLocated(By.name('parts.0.expectedQuantity')),
        elementTimeout,
        'Element not found'
      ).sendKeys('1');

    await driver.findElement(By.xpath(`//button/span[contains(text(), 'Confirm')]`)).click();
    await driver.findElement(By.css('.chakra-button.css-7olaof')).click();

    // Wait for confirmation dialog to disappear
    await driver.wait(async function () {
        const elements = await driver.findElements(By.className('css-4imiq5'));
        return elements.length === 0;
      }, elementTimeout, 'Confirmation dialog did not disappear within 10 seconds');

    // Wait for search PO on All Purchase Order page shows up
    await driver.wait(
        until.elementLocated(By.css('.chakra-input.css-ouq3xx')),
        elementTimeout,
        "Search PO on All PO page does not show up within timeout"
    ).sendKeys(poNumber);

    await driver.wait(
        until.elementLocated(By.xpath(`//button[contains(text(), 'Apply Filters')]`)),
        elementTimeout,
        "Search PO on All PO page does not show up within timeout"
    ).click();

    // Select PO
    await driver.wait(
        until.elementLocated(By.xpath(`//a[contains(text(), '${poNumber}')]`)),
        elementTimeout,
        "Select PO to edit"
    ).click();

    // Wait for Modify PO page finished loading
    await driver.wait(
        until.elementLocated(By.xpath(`//button[contains(text(), 'Confirm')]`)),
        elementTimeout,
        "Modify PO page not finished loading in 10 seconds"
    );
    await driver.wait(
        until.elementLocated(By.name('parts.0.expectedQuantity')),
        elementTimeout,
        "Modify PO page not finished loading in 10 seconds"
    );

    // Select Arrived as status
    // Locate the dropdown element by its name attribute
    await driver.findElement(By.name('status')).sendKeys('a');
    await driver.findElement(By.name('notes')).click();
    await driver.findElement(By.name('notes')).sendKeys('PO has arrived', Key.RETURN);
    await driver.wait(
        until.elementLocated(By.xpath(`//button[contains(text(), 'Apply Filters')]`)),
        elementTimeout,
        "Search PO on All PO page does not show up within timeout"
    ).click();

    // Confirm change
    await driver.findElement(By.xpath(`//button[contains(text(), 'Confirm')]`)).click();
    await driver.wait(
        until.elementLocated(By.name('partsModal.0.actualQuantity')),
        elementTimeout,
        'Element not found'
      ).sendKeys('1');
    await driver.findElement(By.xpath(`//button[contains(text(), 'Done')]`)).click();
    await driver.wait(
        until.elementLocated(By.xpath(`//div[contains(@class, 'chakra-popover__body css-1ews2c8')]/button[contains(text(), 'Confirm')]`)),
        elementTimeout,
        'Element not found'
      ).click();
    
  });

  it('Arrived PO has status dropdown disabled', async function () {
    await driver.get('https://staging.wms.cozey.ca/');
    await driver.findElement(By.id('username')).sendKeys('menan+qatest@cozey.ca');
    await driver.findElement(By.id('password')).sendKeys('Qatest123!');
    await driver.findElement(By.xpath(`//div[contains(@class, 'cdc80f5fa')]/button`)).click();

    // Wait for left nav menu to load
    await driver.wait(async function () {
        const elements = await driver.findElements(By.className('my-2'));
        return elements.length == 5;
      }, elementTimeout, "Left navigation menu not loading up within 10 seconds");

    (await driver.findElements(By.className('my-2')))[1].click();

    // Wait for all PO shows up
    await driver.wait(async function () {
        const elements = await driver.findElements(By.className('uppercase py-2 hover:bg-slate-300 w-full'));
        return elements.length == 3;
      }, elementTimeout, "PO sub menu not loading up in 10 seconds");

    (await driver.findElements(By.className('uppercase py-2 hover:bg-slate-300 w-full')))[0].click();    
    await driver.wait(
        until.elementLocated(By.className('css-1qb8wiq')),
        elementTimeout,
        "All PO page not finished loading in 10 seconds"
    );

    // Wait for search PO on All Purchase Order page shows up
    await driver.wait(
        until.elementLocated(By.css('.chakra-input.css-ouq3xx')),
        elementTimeout,
        "Search PO on All PO page does not show up within timeout"
    ).sendKeys(poNumber);

    await driver.wait(
        until.elementLocated(By.xpath(`//button[contains(text(), 'Apply Filters')]`)),
        elementTimeout,
        "Search PO on All PO page does not show up within timeout"
    ).click();

    // Select PO
    await driver.wait(
        until.elementLocated(By.xpath(`//a[contains(text(), '${poNumber}')]`)),
        elementTimeout,
        "Select PO to edit"
    ).click();

    // Wait for Modify PO page finished loading
    await driver.wait(
        until.elementLocated(By.xpath(`//button[contains(text(), 'Confirm')]`)),
        elementTimeout,
        "Modify PO page not finished loading in 10 seconds"
    );
    await driver.wait(
        until.elementLocated(By.name('parts.0.expectedQuantity')),
        elementTimeout,
        "Modify PO page not finished loading in 10 seconds"
    );
    
    assert.isFalse(await driver.findElement(By.name('status')).isEnabled());
    
  });

  it('Add PO fails without PO number', async function () {
    await driver.get('https://staging.wms.cozey.ca/');
    await driver.findElement(By.id('username')).sendKeys('menan+qatest@cozey.ca');
    await driver.findElement(By.id('password')).sendKeys('Qatest123!');
    await driver.findElement(By.xpath(`//div[contains(@class, 'cdc80f5fa')]/button`)).click();

    // Wait for left nav menu to load
    await driver.wait(async function () {
        const elements = await driver.findElements(By.className('my-2'));
        return elements.length == 5;
      }, elementTimeout, "Left navigation menu not loading up within 10 seconds");

    (await driver.findElements(By.className('my-2')))[1].click();

    // Wait for add PO shows up
    await driver.wait(async function () {
        const elements = await driver.findElements(By.className('uppercase py-2 hover:bg-slate-300 w-full'));
        return elements.length == 3;
      }, elementTimeout, "PO sub menu not loading up in 10 seconds");

    (await driver.findElements(By.className('uppercase py-2 hover:bg-slate-300 w-full')))[2].click();
    
    // Wait for Add PO page to finish loading
    await driver.wait(
        until.elementLocated(By.xpath(`//button/span[contains(text(), 'Confirm')]`)),
        elementTimeout,
        "Add PO page not finished loading in 10 seconds"
    );
    
    // Create PO
    await driver.wait(
        until.elementLocated(By.name('parts.0.expectedQuantity')),
        elementTimeout,
        'Element not found'
      );

    await driver.findElement(By.xpath(`//button/span[contains(text(), 'Confirm')]`)).click();
    await driver.findElement(By.css('.chakra-button.css-7olaof')).click();

    // Wait and check for toast message
    const toastMessage = await driver.wait(
        until.elementLocated(By.xpath(`//div[@data-status = 'error']`)),
        elementTimeout
      ).getText();

    assert.equal(toastMessage, "Important fields are missing.");
  });

  // Add more test cases as needed
});

function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
  
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters.charAt(randomIndex);
    }
  
    return result;
  }
  