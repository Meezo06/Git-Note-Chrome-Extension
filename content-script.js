if (document.getElementById("highlighted-line-menu-positioner")) {
    const lines = document.querySelectorAll(".react-line-number");
    lines.forEach((line) => {
        const modal = document.createElement("dialog");
        const btn = document.createElement("button");
        btn.textContent = "📝";
        btn.className = "line-note-btn";
        btn.onclick = () => {
            modal.showModal();
        }
        line.insertAdjacentElement("afterbegin", modal);
        line.insertAdjacentElement('afterbegin', btn);
    });
}