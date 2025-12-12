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
    const notesContainer = document.querySelector(".notes");
    const removeAllBtn = document.getElementById("remove-all-btn");
    noteFormBtn.onclick = () => newNoteForm.style.display = "block";
    cancelNoteBtn.onclick = () => newNoteForm.style.display = "none";


    let currentUrl = await getCurrentTabUrl();
    await isGithubRepo(currentUrl) ? urlInput.value = currentUrl : urlInput.value = "";

    addNoteBtn.addEventListener('click', async () => {
        // change input handling later
        if (!urlInput.value) alert("Please Enter a URL"); 
        else if (!noteInput.value) alert("Please Enter a note to add");
        else {
            const repoRegex = /^(?:https?:\/\/[^/]+)?(\/?[^/?#]+(?:\/[^/?#]+)?)/;
            let [, repo] = urlInput.value.match(repoRegex);
            if(!repo.startsWith("/")) repo = "/" + repo;
            const isRepoStored = await !chrome.storage.local.get(repo) ? true : false;
            if (!isRepoStored) {
                chrome.storage.local.set({
                    [repo]: 
                    {
                        generalNotes: [noteInput.value],
                        files: {}
                    }
                });
            }
            else {
                const {repo: {
                    generalNotes: repoNotes,
                    files: repoLineNotes
                    }
                } = await chrome.storage.local.get(repo);
                chrome.storage.local.set({
                    [repo]:
                    {
                        genralNotes: [...repoNotes, noteInput.value],
                        files: repoLineNotes
                    }
                });
            }
            await showGeneralNotes();
        }

    })

    removeAllBtn.onclick = async () => {
        await chrome.storage.local.clear();
        await showGeneralNotes();
    }

    async function showGeneralNotes() {
        notesContainer.innerHTML = "";
        const notes = Object.entries(await chrome.storage.local.get(null));
        console.log(notes);
        notes.forEach(([repo, {generalNotes}]) => {
            notesContainer.innerHTML += `
                <div id="${repo}">
                    <a href="https://github.com${repo}" target="_blank">Notes of ${repo}</a>        
            `;
            generalNotes.forEach((note, index) => {
                notesContainer.innerHTML += `
                    <div id="${repo}-${index}">
                        <h3>${note}</h3>
                    </div>
                `
            })
            notesContainer.innerHTML += '</div>';    
        })
    }

    await showGeneralNotes();
}

load();