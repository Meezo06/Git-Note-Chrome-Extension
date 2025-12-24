if (document.getElementById("highlighted-line-menu-positioner")) {
    const lines = document.querySelectorAll(".react-line-number");
    lines.forEach((line, index) => {
        const modal = document.createElement("dialog");
        const btn = document.createElement("button");
        modal.id = `line-${index + 1}-modal`
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
        btn.textContent = "📝";
        btn.className = "line-note-btn";
        btn.onclick = () => {
            modal.showModal();
        }
        line.insertAdjacentElement("afterbegin", modal);
        line.insertAdjacentElement('afterbegin', btn);
        document.querySelector(`#${modal.id} .close-icon`).onclick = () => modal.close();
    });
}