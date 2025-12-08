async function load() {
    async function getCurrentTabUrl() {
        const [{url: currentTabUrl}] = await chrome.tabs.query(
            {
                active: true,
                currentWindow: true
            }
        )
        console.log(currentTabUrl);
        return currentTabUrl;
    }

    const isGithubRepo = async (url) => {
        const repoRegex = /^https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/?$/;
        const {ok} = await fetch(url);
        return repoRegex.test(url) && ok;
    }

    const noteFormBtn = document.getElementById("note-form-btn");
    const newNoteForm = document.querySelector("form");
    const cancelNoteBtn = document.getElementById("cancel-note-btn");
    const urlInput = document.getElementById("url-input");
    noteFormBtn.onclick = () => newNoteForm.style.display = "block";
    cancelNoteBtn.onclick = () => newNoteForm.style.display = "none";


    let currentUrl = await getCurrentTabUrl();
    await isGithubRepo(currentUrl) ? urlInput.value = currentUrl : urlInput.value = "";
}

load();