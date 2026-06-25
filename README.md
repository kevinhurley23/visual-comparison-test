# Visual Comparison Test

## About

This repo contains a testing script that allows us to take screenshots of a list of pages, on both prod and either stg or dev, at multiple viewport sizes, and compare the screenshots using the pixelmatch library to find where pages on one environment don't match the other environment. It also contains a small Svelte app to show a report of the test results.

## Prerequisites

You must have NodeJS installed on your machine to install dependencies and run the script.

## Installation

- Clone this repo into a folder on your local machine, then cd into it
- Run `npm install` *note: if you are on a Bryant machine, you will not be able to run this command in PowerShell. Command Prompt might work. Git Bash definitely works.*

## Usage

Before testing, you will probably want to refresh all the DBs on the testing environment (unless you have created testing content on the environment that you can't delete) and run `mdrush cr`; this will help avoid false test failures because the content on a page in prod is different than dev/stg.

With your terminal inside the `visual-comparison-test` folder, run `node run-test.js` to execute the script that takes the screenshots and generates diff images. By default, the script will compare prod against dev, but you can test the staging environment instead by adding the `--env=stg` flag.

There is a folder called `page-lists` which contains several JSON files, specifying URLs to be tested. `run-test.js` will import one of these files to generate its array of testing pages. By default, it will use the `all.json` list, which contains one page of every content type on every site. You can choose a different pagelist by passing in the `--pagelist` flag, e.g. `--pagelist=homepages`.

This script will also automatically call Svelte's build command and launch the `index.html` file that gets generated; there is no need to run `npm run dev` or any other commands to view the report page.

## Current Known Issues

- Pages with Countdown or Sponsor Slider components will usually fail the diff because of their animated elements. There might be a way to make the Sponsor Sliders pause and make the Countdowns display a specific time during these tests to avoid false failures.
- The magnifying glass icon in the header, which opens the search bar, often fails to display during the test, leading to failed diffs where the icon loaded in one environment and not the other. I don't know why this happens.