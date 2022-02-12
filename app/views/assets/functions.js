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

window.electron.extensionAPIResult((data) => {
    errorMsg(`HTTP: ${data.status} Ratelimit: ${data.ratelimitRemain}/${data.ratelimitLimit}`);

    if (data.hasOwnProperty('config')) {
        try {
            console.log(data.config);
            data.config = JSON.parse(data.config);
            console.log(data.config);
            data.config = JSON.stringify(data.config, null, 4);
            console.log(data.config);
            // tick JSON
            document.getElementById('config_content_json').setAttribute('checked', 'checked');
        } catch (e) {
            // not json
            document.getElementById('config_content_json').removeAttribute('checked');
        }
        document.getElementById('config_content').value = data.config;
        document.getElementById('config_version').value = data.version;
    }
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

/*
Chat
*/
document.getElementById('send_extension_chat_message').addEventListener('submit', (e) => {
    e.preventDefault();

    window.electron.extensionAPI('chat', {
        broadcaster_id: document.getElementById('chat_broadcaster_id').value,
        text: document.getElementById('chat_text').value,
        extension_id: document.getElementById('chat_extension_id').value,
        extension_version: document.getElementById('chat_extension_version').value
    });
});
/*
Config service
*/
document.getElementById('config_segment').addEventListener('change', (e) => {
    if (e.target.value == 'global') {
        document.getElementById('config_broadcaster_id').setAttribute('readonly', 'readonly');
    } else {
        document.getElementById('config_broadcaster_id').removeAttribute('readonly');
    }
});
document.getElementById('config_broadcaster_id').setAttribute('readonly', 'readonly');

document.getElementById('config_fetch').addEventListener('click', (e) => {
    window.electron.extensionAPI(
        'getconfiguration',
        {
            extension_id: document.getElementById('config_extension_id').value,
            segment: document.getElementById('config_segment').value,
            broadcaster_id: document.getElementById('config_broadcaster_id').value
        }
    );
});
document.getElementById('config_write').addEventListener('click', (e) => {
    let content = document.getElementById('config_content').value;
    if (document.getElementById('config_content_json').checked) {
        // tidy up
        content = JSON.stringify(JSON.parse(content));
    }

    window.electron.extensionAPI(
        'setconfiguration',
        {
            extension_id: document.getElementById('config_extension_id').value,
            segment: document.getElementById('config_segment').value,
            broadcaster_id: document.getElementById('config_broadcaster_id').value,

            content,
            version: document.getElementById('config_version').value
        }
    );
});
