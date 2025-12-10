async function load() {
    async function getCurrentTabUrl() {
        const [{url: currentTabUrl}] = await chrome.tabs.query(
            {
                active: true,
                currentWindow: true
            }
        )
        return currentTabUrl;
    }

    const isGithubRepo = async (url) => {
        const {ok: isOk} = await fetch(url);
        return isOk;
    }

    const noteFormBtn = document.getElementById("note-form-btn");
    const newNoteForm = document.querySelector(".new-note");
    const cancelNoteBtn = document.getElementById("cancel-note-btn");
    const urlInput = document.getElementById("url-input");
    const addNoteBtn = document.getElementById("add-note-btn");
    const noteInput = document.getElementById("note-input")
    noteFormBtn.onclick = () => newNoteForm.style.display = "block";
    cancelNoteBtn.onclick = () => newNoteForm.style.display = "none";


    let currentUrl = await getCurrentTabUrl();
    await isGithubRepo(currentUrl) ? urlInput.value = currentUrl : urlInput.value = "";

    addNoteBtn.addEventListener('click', () => {
        // change input handling later
        if (!urlInput.value) alert("Please Enter a URL"); 
        else if (!noteInput.value) alert("Please Enter a note to add");
        else {
            const repoRegex = /^(?:https?:\/\/[^/]+)?(\/?[^/?#]+(?:\/[^/?#]+)?)/;
            const [, repo] = urlInput.value.match(repoRegex);
            if(!repo.startsWith("/")) repo = "/" + repo;
        }

    })
}

load();