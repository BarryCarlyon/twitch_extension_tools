window.electron.errorMsg(words => {
    errorMsg(words);
});
function errorMsg(words) {
    let alert = document.getElementById('alert');

    if (!alert) {
        alert = document.createElement('div');
        alert.setAttribute('id', 'alert');

        alert.classList.add('alert');
        alert.classList.add('alert-warning');
        alert.classList.add('alert-dismissable');
        alert.classList.add('fade');
        alert.classList.add('show');
        //alert.classList.add('bg-warning');

        let b = document.createElement('button');
        b.classList.add('btn-close');
        b.setAttribute('data-bs-dismiss', 'alert');
        alert.append(b);
        document.body.append(alert);
    }

    let sp = document.createElement('p');
    sp.textContent = words;
    alert.append(sp);
}


document.getElementById('change_version_form').addEventListener('submit', (e) => {
    e.preventDefault();
    window.electron.config.selectVersion(document.getElementById('change_version').value);
});

document.getElementById('send_extension_chat_message').addEventListener('submit', (e) => {
    e.preventDefault();

    window.electron.extensionAPI('chat', {
        broadcaster_id: document.getElementById('chat_broadcaster_id').value,
        text: document.getElementById('chat_text').value,
        extension_id: document.getElementById('chat_extension_id').value,
        extension_version: document.getElementById('chat_extension_version').value
    });
});

window.electron.extensionAPIResult((data) => {
    errorMsg(`HTTP: ${data.status} Ratelimit: ${data.ratelimitRemain}/${data.ratelimitLimit}`);
});

let els = document.getElementsByClassName('char_count');
for (let x=0;x<els.length;x++) {
    charCount(els[x]);
}
function charCount(counter) {
    let target = counter.getAttribute('data-of');
    let monEl = document.getElementById(target);
    if (monEl) {
        monEl.addEventListener('keyup', (e) => {

            counter.textContent = e.target.value.length;
        });
    }
}
