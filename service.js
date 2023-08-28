const { Builder, By, Key, until } = require("selenium-webdriver");
const https = require("https");
const fs = require("fs");
const decompress = require("decompress");

(async () => {
  let driver = await new Builder().forBrowser("chrome").build();
  try {
    await driver.get(
      "https://www.bcb.gov.br/estabilidadefinanceira/cooperados_cooperativa",
    );
    await driver.tim;
    await driver.wait(until.titleIs("Cooperados por Cooperativa"), 1000);
    const accept = await driver.findElement(
      By.xpath("/html/body/app-root/bcb-cookies/div/div/div/div/button[2]"),
    );

    if (accept) await accept.click();
    await driver.wait(
      until.elementLocated(
        By.xpath(
          "/html/body/app-root/app-root/div/div/main/dynamic-comp/div/div/div[2]/div[2]/bcb-download-filter/div/ng-select",
        ),
      ),
    );
    const el2 = await driver.findElement(
      By.xpath(
        "/html/body/app-root/app-root/div/div/main/dynamic-comp/div/div/div[2]/div[2]/bcb-download-filter/div/ng-select",
      ),
    );
    if (el2)
      await el2.getText().then(async (text) => {
        if (text) await el2.click();
      });
    const list = await driver.findElements(
      By.xpath(
        "/html/body/app-root/app-root/div/div/main/dynamic-comp/div/div/div[2]/div[2]/bcb-download-filter/div/ng-select/ng-dropdown-panel/div/div[2]/div",
      ),
    );
    if (list) {
      for (const item of list) {
        let text = await item.getText();
        text = text.trim().split(" ")[0];
        const fileName = text.replace("/", "");
        const downloadable = `https://www.bcb.gov.br/content/estabilidadefinanceira/divulgacaoCCO/cont2/${fileName}CCOCOOPERATIVA.zip`;
        const file = fs.createWriteStream(`downloads/${fileName}.zip`);
        const request = https.get(downloadable, function(response) {
          response.pipe(file);
          file.on("finish", function() {
            file.close();
            console.log(downloadable);
            decompress(`downloads/${fileName}.zip`, "downloads").then(() => {
              console.log(`Unzip ${fileName}.zip`);
              fs.unlink(`downloads/${fileName}.zip`, (err) => {
                if (err) throw err;
                console.log(`Removendo ${fileName}.zip`);
              });
            });
          });
        });
      }
    }
  } catch (error) {
    console.log(error);
  } finally {
    await driver.quit();
  }
})();
