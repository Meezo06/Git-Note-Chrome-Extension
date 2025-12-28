const lineMenu = document.getElementById("highlighted-line-menu-positioner");
const fileRegex = /\/[^/]+\/[^/]+\/blob\/[^/]+(\/.+)/;
const repoRegex = /^(\/[^/]+\/[^/]+)/;
const [, file] = location.path.match(fileRegex);
const repo = location.path.match(repoRegex)[1].replace(/#.*/, "");
if (lineMenu) {
    showLineNotes();
    const modal = document.createElement("dialog");
    modal.id = "lines-modal";
    modal.innerHTML = `
        <div class="modal-header">
            <span>Add line note</span>
            <button class="close-icon" aria-label="Close">
                <svg aria-hidden="true" viewBox="0 0 16 16" version="1.1" width="16" height="16" fill="currentColor">
                    <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z"></path>
                </svg>
            </button>
        </div>
        <div class="modal-body">
            <textarea placeholder="Leave a comment"></textarea>
            <div class="modal-footer">
                <button class="primary-btn">Add Note</button>
            </div>
        </div>
    `;
    lineMenu.insertAdjacentElement("afterbegin", modal);
    document.querySelector(`#${modal.id} .close-icon`).onclick = () => modal.close();
    const addNoteBtn = document.querySelector(`#${modal.id} .primary-btn`);
    const noteInput = document.querySelector(`#${modal.id} textarea`);
    const lines = document.querySelectorAll(".react-line-number");
    lines.forEach((line, index) => {
        const btn = document.createElement("button");        
        btn.textContent = "📝";
        btn.className = "line-note-btn";
        btn.onclick = () => {
            modal.showModal();
            addNoteBtn.onclick = async () => {
                if (!noteInput.value) {
                    alert("Plase enter some note") // change handling later
                    return;
                }
                const repoObj = await chrome.storage.local.get(repo);
                const noteObj = {
                    line: index + 1,
                    note: noteInput.value,
                    createdAt: new Date()
                }
                if (repo in repoObj) {
                    if (!(file in repoObj[repo].files)) {
                        repoObj[repo].files[file] = [];
                    }
                    repoObj[repo].files[file].push(noteObj);
                    chrome.storage.local.set(repoObj);
                }
                else {
                    const newRepo = {
                        [repo]: {
                            generalNotes: [],
                            files: {
                                [file]: []
                            }
                        } 
                    }
                    newRepo[repo].files[file].push(noteObj);
                    chrome.storage.local.set(newRepo);
                }
            }
        }
        line.insertAdjacentElement('afterbegin', btn);
    });
}

async function showLineNotes() {
    const {[repo]: {files: {[file]: lineNotes}}} = await chrome.storage.local.get(repo);
    lineNotes.forEach(({note, lineNumber, date}) => {
        const noteBtn = document.createElement("button");
        noteBtn.className = "note-btn";
        noteBtn.textContent = "Note";
        document.getElementById(`LC${lineNumber}`).insertAdjacentElement("afterend", noteBtn);
    })
}