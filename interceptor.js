async function interception(page) {
  await page.setRequestInterception(true);
  page.on("request", (request) => {
    if (request.resourceType() === "image") {
      if (request.url().includes("img.meituan.net")) {
        request.abort();
      } else {
        request.continue();
      }
    } else request.continue();
  });
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, "webdriver", {
      get: () => undefined,
    });
  });
}
