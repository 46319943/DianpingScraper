# Dianping Scraper version 1
This code was first written in 2020. The original purpose is to scrape the comment from Dianping.com. However, as more tasks were planned to be done, the functionality of this repo became really a mess. These individual tasks should be implemented in separated repos.

Moreover, the webpage of dianping.com has changed and the text is no longer encrypted, so the OCR module is no longer needed.

Therefore, to adapt for the new version of dianping.com and make the repo clean, a new implementation of the DianpingScraper is done in the [version 2](https://github.com/46319943/DianpingScraper2).

# Description
DianpingScraper is used to scrape the comments from dianping.com. It use the browser automation and OCR technique to get the text encrypted using custom css font.

# Quick Start
- The entry point is `scrape_dianping.js` written in nodejs.
- The OCR is implemented in `ocr_server.py` using python.

# Extension
Some analysis is conducted using the scraped data. The analysis includes:
- Image label tagging using [Google Vision API](https://cloud.google.com/vision/docs/labels)
- Text sentiment analysis.
- SHAP analysis for the sentiment analysis model.
