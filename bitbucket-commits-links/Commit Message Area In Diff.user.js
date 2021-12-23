// ==UserScript==
// @name         Bitbucket: Commit Message In Diff
// @namespace    http://tampermonkey.net/
// @version      0.5
// @description  Creates expandable area with message of selected commit on `diff` tab.
// @author       Daniil Nizovkin
// @include      /^https:\/\/bitbucket.associatesys.local\/projects\/[a-zA-Z0-9]+\/repos\/[a-zA-Z0-9]+\/pull-requests\/.*$/
// @run-at       document-idle
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

(function () {
  'use strict'
  var urlRegex = /^https:\/\/bitbucket.associatesys.local\/projects\/([a-zA-Z0-9]+)\/repos\/([a-zA-Z0-9]+)\/pull-requests\/[0-9]+\/commits\/[a-zA-Z0-9]+#*.*$/
  var diffUrlRegex = /^https:\/\/bitbucket.associatesys.local\/projects\/[a-zA-Z0-9]+\/repos\/[a-zA-Z0-9]+\/pull-requests\/[0-9]+\/diff+#*.*$/
  var prevCommitHash
  var prevPageIsDiff = urlRegex.test(document.URL)
  var allCommitsDiffWasPrev = diffUrlRegex.test(document.URL)

  var commitMessageBlockState = 'none'

  window.addEventListener('popstate', function (event) {
    main(event.target.location.href)
  })
  if (!diffUrlRegex.test(document.URL)) {
    main(document.URL)
  }

  function getCommitHashFromURL () {
    var noAnchorURL = document.URL.replace(/#.+/, '')
    return noAnchorURL.substring(noAnchorURL.lastIndexOf('/') + 1)
  }

  function main (str) {
    if (!urlRegex.test(str) || diffUrlRegex.test(str)) {
      allCommitsDiffWasPrev = diffUrlRegex.test(str)
      prevCommitHash = undefined
      prevPageIsDiff = false
      return
    }
    var commitHash = getCommitHashFromURL()
    if (prevCommitHash === commitHash && prevPageIsDiff && !allCommitsDiffWasPrev) {
      return
    }
    prevPageIsDiff = true
    prevCommitHash = commitHash
    if (document.getElementById('parentCommitMsgDiv') != null) {
      Element.prototype.remove = function () {
        this.parentElement.removeChild(this)
      }
      document.getElementById('parentCommitMsgDiv').remove()
    }
    createHTML()

    var match = document.URL.match(urlRegex)
    const xhr = new XMLHttpRequest()
    xhr.responseType = 'json'
    xhr.open('GET', `/rest/api/1.0/projects/${match[1]}/repos/${match[2]}/commits/${commitHash}`)
    xhr.send()

    xhr.onload = function () {
      if (xhr.status !== 200) {
        console.error(`Error: ${xhr.status}: ${xhr.statusText}`)
      } else {
        setMessage(xhr.response.message)
      }
    }

    xhr.onerror = function () {
      console.error(xhr.statusText)
    }
  }

  function setMessage (message) {
    document.getElementById('messagePre').textContent = message
  }

  function createHTML () {
    createCSSClasses()
    var changes = document.getElementsByClassName('changes')[0];
    (async () => {
      while (changes === undefined) {
        await new Promise(resolve => setTimeout(resolve, 100))
        changes = document.getElementsByClassName('changes')[0]
      }
      var divTo = changes.parentElement
      var parentDiv = document.createElement('div')
      var messageDiv = document.createElement('div')
      var messagePre = document.createElement('pre')
      var collapsBtn = document.createElement('button')


      if (commitMessageBlockState === 'block') {
        collapsBtn.textContent = 'Hide commit message'
      } else {
        collapsBtn.textContent = 'Show commit message'
      }
      collapsBtn.setAttribute('class', 'collapsible css-18u3ks8')
      messageDiv.setAttribute('class', 'commitMsgDiv')
      messageDiv.style.display = commitMessageBlockState
      parentDiv.setAttribute('class', 'cmtmsgdiv')
      parentDiv.setAttribute('id', 'parentCommitMsgDiv')
      messagePre.setAttribute('id', 'messagePre')

      messageDiv.appendChild(messagePre)
      parentDiv.appendChild(collapsBtn)
      parentDiv.appendChild(messageDiv)

      divTo.insertBefore(parentDiv, divTo.children[0])

      collapsBtn.addEventListener('click', function () {
        this.classList.toggle('active')
        var content = this.nextElementSibling
        if (content.style.display === 'block') {
          content.style.display = 'none'
          collapsBtn.textContent = 'Show commit message'
          commitMessageBlockState = 'none'
        } else {
          content.style.display = 'block'
          collapsBtn.textContent = 'Hide commit message'
          commitMessageBlockState = 'block'
        }
      })
    })()
  }

  function createCSSClasses () {
    var style = document.createElement('style')
    style.type = 'text/css'
    style.innerHTML = `
.collapsible {
  cursor: pointer;
}
.commitMsgDiv {
  padding: 10px 10px;
  display: none;
  overflow: hidden;
  color: #7A869A;
}
.collapsible:hsover {
  background-color: #bbb;
}
.cmtmsgdiv {
  padding: 0 0 10px 0;
}
            `
    document.getElementsByTagName('head')[0].appendChild(style)
  }
})()
