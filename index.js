const express = require("express");
const puppeteer = require("puppeteer");
const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

const telegramToken = "6150609043:AAG-XHC9FhHNREIib4yRBStPI5-2M9MDtJ0";
const chatId = "863593436";

const checkInterval = 30 * 60 * 1000;

let lastCheckedValue = null;

async function checkWebsite() {
  const browser = await puppeteer.launch({
      args: [
        "--disable-setuid-sandbox",
        "--no-sandbox",
        "--single-process",
        "--no-zygote",
      ],
      executablePath:
        process.env.NODE_ENV === "production"
          ? process.env.PUPPETEER_EXECUTABLE_PATH
          : puppeteer.executablePath(),
    }); // Set headless to true for production
  const page = await browser.newPage();

  try {
    // Navigate to the website
    await page.goto(
      "https://indiacampus.accenture.com/candidate/#/login/accenture"
    );

    // Log in
    await page.type(
      'input.form-control[name="username"]',
      "ajharul.choudhury10@gmail.com"
    );
    await page.type(
      'input.form-control[name="new-password"]',
      "Ajharulaju123456!!!"
    );
    // Click the "Login" button
    await page.click("a.login"); // Add the appropriate selector for the login button

    // Wait for the login to complete (you may need to wait for a specific element)
    await page.waitForSelector("h2.ng-binding", { timeout: 10000 });

    // Wait for the dynamic content to load
    await page.waitForSelector("div.col-md-6.col-xs-6.ng-binding");
    // Find the element with the class "ng-binding" that contains the text "Submitted: 0"
    const elementText = await page.evaluate(() => {
      return new Promise((resolve) => {
        const waitForDynamicContent = setInterval(() => {
          const submittedDiv = document.querySelector(
            "div.col-md-6.col-xs-6.ng-binding i.fa-floppy-o"
          );
          if (submittedDiv) {
            clearInterval(waitForDynamicContent);
            resolve(submittedDiv.parentElement.textContent.trim());
          }
        }, 1000); // Check every 1 second for the dynamic content
      });
    });

    // Close the browser
    console.log(elementText);

    if (elementText.includes("Submitted: 14")) {
      // Send a Telegram message if the condition is met
      const bot = new TelegramBot(telegramToken);
      bot.sendMessage(chatId, "Submitted: 0 was found on the website.");
      await browser.close();
    }
  } catch (error) {
    console.error("An error occurred:", error);
    await browser.close();
  }
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Start checking the website when the server is up
checkWebsite();

setInterval(checkWebsite, checkInterval);
