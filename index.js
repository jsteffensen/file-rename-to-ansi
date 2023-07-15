const fsp = require('fs').promises;
const puppeteer = require('puppeteer');

(async () => {
    const fileDir = 'C:\\Users\\root\\Music\\4K YouTube to MP3';
    let filenameArray = await getFileList(fileDir);

    const browser = await puppeteer.launch({headless:false});
    const page = await browser.newPage();
    await page.setViewport({ width: 1600, height: 1200 });

    await page.goto('https://translate.google.com/?sl=th&tl=en&op=translate', { waitUntil: 'networkidle0' });

    let acceptButtonDk = await page.$("button[aria-label='Acceptér alle']");
    acceptButtonDk.click();

    await delay(2000);


    for(f=0; f<filenameArray.length; f++) {
        let filename = filenameArray[f];

        if(filename.indexOf('.mp3')>0) {
            await clickTextArea(page);
            await delay(1000);

            await typeToPage(page, filename);
            await delay(3000);

            let translationSpan = await page.$("span[jsname='W297wb']");
            let translatedName = await getInnerText(page, translationSpan);
            translatedName = translatedName.replace(/ *\[[^\]]*]/g, '');
            translatedName = translatedName.replace(/\s*\(.*?\)\s*/g, '');
            translatedName = translatedName.replace(/[/\\?%*:|"<>]/g, '');
            translatedName = translatedName.replace('official', '');
            translatedName = translatedName.replace('Official', '');
            translatedName = translatedName.replace('OFFICIAL', '');
            translatedName = translatedName.trim();
            if(translatedName.indexOf('mp3')==-1 && translatedName.indexOf('MP3')==-1) {
                translatedName = translatedName + '.mp3'
            }

            console.log(translatedName);
            await fsp.rename(fileDir + '\\' + filename, fileDir + '\\' + translatedName);

            await clickClearButton(page);

            delay(1000);
        }
    }

    console.log('complete');
    await browser.close();
})();

async function clickTextArea(page) {
    let textArea = await page.$("textarea[aria-label='Source text']");
    let textAreaDk = await page.$("textarea[aria-label='Kildetekst']");

    if(textArea) {
        textArea.click();
    } else if(textAreaDk) {
        textAreaDk.click();
    }
}

async function clickClearButton(page) {
    let clearButton = await page.$("button[aria-label='Clear source text']");
    let clearButtonDk = await page.$("button[aria-label='Ryd kildetekst']");
    if(clearButton) {
        clearButton.click();
    } else if(clearButtonDk) {
        clearButtonDk.click();
    }
}

async function typeToPage(page, string) {
    for (var i = 0; i < string.length; i++) {
        page.keyboard.sendCharacter(string.charAt(i));
    }
}

async function getFileList(path) {
    let files = await fsp.readdir(path);
    return files;
}

async function getInnerText(page, element){
    const innerText = await page.evaluate(el => el.textContent, element)
    return innerText;
}

async function countdown(n) {
    for(i=n; i>0; i--) {
        console.log(i);
        await delay(1000);
    }
}

function delay(time) {
    return new Promise(function(resolve) {
        setTimeout(resolve, time)
    });
}