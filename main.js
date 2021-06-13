/**
 * @file main
 * @date 2021-04-21
 * @description
 * Function implementation
 * 1. Compose a menu board by receiving data from the Datalink.
 * 2. Check the sold-out in the menu and apply the effect.
 * 3. If there is no use by the user for a certain period of time, it switches to the default page.
 * @copyright Copyright (c) 2021 Samsung Electronics, Visual Display Division. All Rights Reserved.
 */

let timer = undefined;
let timeout = 5;
let defaultPageName = 'Page1';
const menuDivs = [];

$wp.setDefaultCallback((object) => {
    switch (object.type) {
        case 'state':
            setCallbackByPlayState(object.sub, object.data);
            break;
        case 'udp':
            getMessage(object.data);
            break;
        case 'datalink':
            setDataLinkData(object.data);
            break;
        default:
            break;
    }
});

function setCallbackByPlayState(state, data) {
    switch (state) {
        case 'ready':
            // get UserData - 'data' is UserData of this WebContent
            getUserData(data);
			break;
        case 'play':
            // to receive a keydown event from a remote controller or keyboard,
            // need to focus on the playback time.
            window.focus();
            setClickEventListener();
            break;
        case 'stop':
            // for prevent memory leak problem
            $wp = null;
            break;
        default:
            break;
    }
}

function getUserData(userData) {
    if (!userData) {
        return;
    }

    timeout = userData.timeout ? parseInt(userData.timeout, 10) : timeout;
    defaultPageName = userData.defaultPageName || defaultPageName;
}

function setDefaultContent() {
    // if there is a user click event, reset the timer to initialize the current page playback time.
    if (timer) {
        clearTimeout(timer);
        timer = null;
    }

    // if there is no user click event during the timeout, setTimeout() is used to move to the page where the default content is played.
    timer = setTimeout(() => {
        $wp.content.movePage(defaultPageName);
    }, timeout * 1000);
}

function setClickEventListener() {
    setDefaultContent();

    // if user click webContent area, reset timer for stay current page during timeout.
    // you can change 'document.body' to an element in webAuthor or another div tag.
    document.body.addEventListener('click', () => {
        setDefaultContent();
    });

}

function getMessage(message) {
    // when page name or something is received by a udp message, the page is switched.
    if (message === '1') {
        $wp.content.movePage(defaultPageName);
        return;
    }
    $wp.content.movePage(message);
}

