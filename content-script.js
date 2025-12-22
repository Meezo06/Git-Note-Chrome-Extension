if (document.getElementById("highlighted-line-menu-positioner")) {
    const lines = document.querySelectorAll(".react-line-number");
    lines.forEach((line, index) => {
        const btn = document.createElement("button");
        btn.style.cursor = "pointer";
        btn.style.padding = "0";
        btn.style.border = "none";
        btn.style.backgroundColor = "transparent";
        btn.onclick = () => {
            
        }
        line.insertAdjacentElement('afterbegin', btn);
    });
}