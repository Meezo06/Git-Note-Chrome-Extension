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
        if (!url.startsWith("https://github.com")) return false
        const {ok: isOk} = await fetch(url, {method: 'HEAD'});
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
    const editNoteForm = document.querySelector(".edit-note");
    const editUrlInput = document.getElementById("edit-url-input");
    const editNoteInput = document.getElementById("edit-input");
    const editNoteBtn = document.getElementById("edit-note-btn");
    const cancelEditBtn = document.getElementById("cancel-edit-btn");
    noteFormBtn.onclick = () => newNoteForm.style.display = "block";
    cancelNoteBtn.onclick = () => newNoteForm.style.display = "none";
    cancelEditBtn.onclick = () => editNoteForm.style.display = "none";

    showGeneralNotes();
    setControllers();

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
            showGeneralNotes();
            setControllers();
        }

    })

    removeAllBtn.onclick = async () => {
        await chrome.storage.local.clear();
        showGeneralNotes();
        setControllers();
    }

    async function showGeneralNotes() {
        const notes = Object.entries(await chrome.storage.local.get(null));
        let html = "";
        notes.forEach(([repo, {generalNotes}]) => {
            html += `
                <div id="${repo}">
                    <a href="https://github.com${repo}" target="_blank">Notes of ${repo}</a>        
            `;
            generalNotes.forEach((note, index) => {
                const id = `${repo}-${index}`;
                html += `
                    <div id="${id}">
                        <h3>${note}</h3>
                        <button class="edit-btn">Edit</button>
                        <button class="rmv-btn">Remove</button>
                    </div>
                `
            })
            html += '</div>';    
        })
        notesContainer.innerHTML = html;
    }

    function setControllers() {
        const reposNotes = document.querySelectorAll(".notes div");
        for (const repo of reposNotes) {
            const notes = document.querySelectorAll(`[id="${repo.id}"] div`);
            let i = 0;
            for (const note of notes) {
                const noteText = document.querySelector(`[id="${note.id}"] h3`).textContent;
                document.querySelector(`[id="${note.id}"] .edit-btn`).onclick = () => {
                    editUrlInput.value = `github.com${repo.id}`;
                    editNoteInput.value = noteText;
                    editNoteForm.style.display = "block";
                    editNoteBtn.onclick = async () => {
                        if (!editNoteInput.value) {
                            alert("Enter some note");
                            return;
                        }
                        const repoObj = await chrome.storage.local.get(repo.id);
                        repoObj.repo.generalNotes[i] = editNoteInput.value;
                        chrome.storage.local.set(repoObj);
                        editNoteForm.style.display = "none";
                        showGeneralNotes();
                    }
                }
                document.querySelector(`[id="${note.id}"] .rmv-btn`).onclick = () => {
                    chrome.storage.local.remove(note.id);
                    showGeneralNotes();
                }
                i++;
            }
        }
    }
}

load();