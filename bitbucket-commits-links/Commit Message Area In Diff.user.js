// ==UserScript==
// @name         Bitbucket: Commit Message In Diff
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Creates expandable area with message of selected commit on `diff` tab.
// @author       Daniil Nizovkin
// @include      https://bitbucket.associatesys.local/projects/TOS/repos/toschart/pull-requests/*
// @run-at       document-idle
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

(function () {
  'use strict'
  var urlRegex = /https:\/\/bitbucket.associatesys.local\/projects\/TOS\/repos\/toschart\/pull-requests\/[0-9]+\/commits\/[a-zA-Z0-9]+#*.*$/
  window.addEventListener('popstate', function (event) {
    main(event.target.location.href)
  })
  main(document.URL)

  document.URL.substring(document.URL.lastIndexOf('/') + 1)

  function main (str) {
    if (urlRegex.test(str)) {
      createHTML()
      var noAnchorURL = document.URL.replace(/#.+/, '')
      var commitHash = noAnchorURL.substring(noAnchorURL.lastIndexOf('/') + 1)

      const xhr = new XMLHttpRequest()
      xhr.responseType = 'json'
      xhr.open('GET', `/rest/api/1.0/projects/TOS/repos/toschart/commits/${commitHash}`)
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
  }

  function setMessage (message) {
    document.getElementById('messagePre').textContent = message
  }

  function createHTML () {
    createCSSClasses()
    var divTo = document.getElementsByClassName('changes')[0].parentElement
    var parentDiv = document.createElement('div')
    var messageDiv = document.createElement('div')
    var messagePre = document.createElement('pre')
    var collapsBtn = document.createElement('button')

    collapsBtn.textContent = 'Show commit message'
    collapsBtn.setAttribute('class', 'collapsible css-18u3ks8')
    messageDiv.setAttribute('class', 'commitMsgDiv')
    parentDiv.setAttribute('class', 'cmtmsgdiv')
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
      } else {
        content.style.display = 'block'
      }
    })
  }

  function createCSSClasses () {
    var style = document.createElement('style')
    style.type = 'text/css'
    style.innerHTML = `
.collapsible {
  cursor: pointer;
}
.commitMsgDiv {
  padding: 0 18px;
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
