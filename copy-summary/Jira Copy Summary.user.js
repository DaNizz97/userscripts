// ==UserScript==
// @name         Jira Copy Summary
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  copies full summart of Jira ticket including the ticket number.
// @author       Daniil Nizovkin
// @match        https://tosjira.associatesys.local/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

(function () {
  'use strict'

  var copyBtn = document.getElementById('copycopy')
  copyBtn.addEventListener('click', function () {
    // Already contains space at the end
    var issueKey = document.getElementById('dx-issuekey-val-h1').textContent
    var summary = document.getElementById('summary-val').textContent
    navigator.clipboard.writeText(issueKey + summary)
    console.log('copied to clipboard: ' + issueKey + summary)
  })
})()
