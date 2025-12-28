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

    const getRepoName = (url) => {
        const repoRegex = /^(?:(?:https?:\/\/)?[\w.-]+\.[^/]+)?(\/?[^/?#]+(?:\/[^/?#]+)?)/;
        let [, repo] = url.match(repoRegex);
        if(!repo.startsWith("/")) repo = "/" + repo;
        return repo;
    }

    const showCurrentNotes = async () => {
        const isRepo = await isGithubRepo(await getCurrentTabUrl());
        if(isRepo) {
            const repoName = getRepoName(await getCurrentTabUrl());
            await showGeneralNotes(repoName);
        }
        else {
            await showGeneralNotes();
        }
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

    let currentUrl = await getCurrentTabUrl();
    if(await isGithubRepo(currentUrl)) {
        const repoName = getRepoName(currentUrl);
        urlInput.value = "github.com" + repoName;
        await showGeneralNotes(repoName);
    }
    else {
        urlInput.value = "";
        await showGeneralNotes();
    }
    
    setControls();

    addNoteBtn.addEventListener('click', async () => {
        // change input handling later
        if (!urlInput.value) alert("Please Enter a URL"); 
        else if (!noteInput.value) alert("Please Enter a note to add");
        else {
            const repo = getRepoName(urlInput.value);
            const isRepoStored = repo in await chrome.storage.local.get(repo);
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
                const {[repo]: {
                    generalNotes: repoNotes,
                    files: repoLineNotes
                    }
                } = await chrome.storage.local.get(repo);
                chrome.storage.local.set({
                    [repo]:
                    {
                        generalNotes: [...repoNotes, noteInput.value],
                        files: repoLineNotes
                    }
                });
            }
            await showCurrentNotes();
            setControls();
        }

    })

    removeAllBtn.onclick = async () => {
        await chrome.storage.local.clear();
        await showCurrentNotes();
        setControls();
    }

    async function showGeneralNotes(viewedRepo = "") {
        const notes = viewedRepo ? 
        Object.entries(await chrome.storage.local.get(viewedRepo)) : 
        Object.entries(await chrome.storage.local.get(null));
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

    function setControls() {
        const reposNotes = document.querySelectorAll(".notes div");
        
        for (const repo of reposNotes) {
            const notes = document.querySelectorAll(`[id="${repo.id}"] div`);
            let i = 0;
            
            for (const note of notes) {
                const currentIndex = i;
                const noteText = document.querySelector(`[id="${note.id}"] h3`).textContent;
                
                document.querySelector(`[id="${note.id}"] .edit-btn`).onclick = () => {
                    editUrlInput.value = `github.com${repo.id}`;
                    editNoteInput.value = noteText;
                    editNoteForm.style.display = "block";
                    
                    editNoteBtn.onclick = async () => {
                        try {
                            if (!editNoteInput.value) {
                                alert("Enter some note");
                                return;
                            }
                            const repoObj = await chrome.storage.local.get(repo.id);
                            repoObj[repo.id].generalNotes[currentIndex] = editNoteInput.value;
                            await chrome.storage.local.set(repoObj);
                            editNoteForm.style.display = "none";
                            await showGeneralNotes();
                            setControls();
                        } catch (error) {
                            console.error("Error during edit:", error);
                        }
                    }
                }
                
                document.querySelector(`[id="${note.id}"] .rmv-btn`).onclick = async () => {
                    try {
                        const repoObj = await chrome.storage.local.get(repo.id);
                        if (repoObj[repo.id].generalNotes.length === 1) {
                            await chrome.storage.local.remove(repo.id);
                            await showGeneralNotes();
                            setControls();
                            return;
                        }
                        repoObj[repo.id].generalNotes.splice(currentIndex, 1);
                        await chrome.storage.local.set(repoObj);
                        await showGeneralNotes();
                        setControls();
                    } catch (error) {
                        console.error("Error during remove:", error);
                    }
                }
                
                i++;
            }
        }
    }
}

load();