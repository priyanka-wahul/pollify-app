// Hide options for Yes/No and True/False
const pollType = document.getElementById("pollType");
const optionsSection = document.getElementById("optionsSection");

if (pollType && optionsSection) {

    pollType.addEventListener("change", () => {

        if (
            pollType.value === "yesno" ||
            pollType.value === "truefalse"
        ) {
            optionsSection.style.display = "none";
        } else {
            optionsSection.style.display = "block";
        }

    });

}

// Add Option Button
const addOptionBtn = document.getElementById("addOptionBtn");
const optionsContainer = document.getElementById("optionsContainer");

if (addOptionBtn && optionsContainer){
addOptionBtn.addEventListener("click", () => {

    const input =
        document.createElement("input");

    input.type = "text";
    input.name = "options";

    input.className =
        "form-control mb-2";

    input.placeholder = "New Option";

    optionsContainer.appendChild(input);

});
}
//poll page logic
const copyBtn = document.getElementById("copyBtn");
console.log("Button:", copyBtn);
if (copyBtn) {

    copyBtn.addEventListener("click", () => {

        const pollLink =
            document.getElementById("pollLink");
            console.log("Link:", pollLink);
        navigator.clipboard.writeText(
            pollLink.value
        );

        const alertBox = document.getElementById("copyAlert");
         console.log("Alert:", alertBox);
        alertBox.classList.remove("d-none");
        setTimeout(() => {
            alertBox.classList.add("d-none");
        }, 3000);

    });

}
