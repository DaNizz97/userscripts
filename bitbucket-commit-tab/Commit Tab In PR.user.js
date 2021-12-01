// ==UserScript==
// @name         Bitbucket Link To Commit
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Adds additional row to commits tab in PR with the links to separate commit page.
// @author       Daniil Nizovkin
// @include      https://bitbucket.associatesys.local/projects/TOS/repos/toschart/pull-requests/*
// @run-at       document-idle
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

(function () {
  'use strict'
  var alreadyAccepted = false
  window.addEventListener('popstate', function (event) {
    console.log(event)
    const asyncWait = ms => new Promise(resolve => setTimeout(resolve, ms))
    if (event.target.location.pathname.endsWith('commits') && !alreadyAccepted) {
      (async () => {
        await asyncWait(100)
        addNewColumns()
      })()
    } else if (!event.target.location.pathname.endsWith('commits')) {
      alreadyAccepted = false
    }
  })

  if (document.URL.endsWith('commits')) {
    addNewColumns()
  }

  function addNewColumns () {
    alreadyAccepted = true
    var table = document.getElementsByClassName('aui paged-table commits-table')[0]
    // Insert new header
    var headerRow = table.tHead.getElementsByTagName('tr')[0]
    var newCommitCol = document.createElement('th')
    newCommitCol.innerHTML = 'Link to commit'
    newCommitCol.className = 'commit'
    headerRow.insertBefore(newCommitCol, headerRow.children[2])

    // Incert new Cell
    var length = table.tBodies[0].getElementsByTagName('tr').length;
    (async () => {
      while (length === 0) {
        await new Promise(resolve => setTimeout(resolve, 100))
        length = table.tBodies[0].getElementsByTagName('tr').length
      }
      Array.from(table.tBodies[0].getElementsByTagName('tr')).forEach(function (commitRow) {
        var outerSpanCol = document.createElement('span')
        outerSpanCol.innerHTML = commitRow.children[1].getElementsByTagName('span')[0].innerHTML
        outerSpanCol.children[0].children[0].href = outerSpanCol.children[0].children[0].href.replace(new RegExp('pull-requests/[0-9]+/', 'gm'), '')
        outerSpanCol.children[0].children[0].title = 'Link to separate commit page'
        var td = document.createElement('td')
        td.appendChild(outerSpanCol)
        td.className = 'commit'
        commitRow.insertBefore(td, commitRow.children[2])
      })
    })()
  }
})()
