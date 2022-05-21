document.getElementById('change_version_form').addEventListener('submit', (e) => {
    e.preventDefault();
    window.electron.config.selectVersion(document.getElementById('change_version').value);
});

window.electron.extensionAPIResult((data) => {
    resetLoadings();
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

document.getElementById('extension_config_service_form').addEventListener('submit', (e) => {
    e.preventDefault();
});
document.getElementById('extension_config_service_fetch').addEventListener('click', (e) => {
    window.electron.extensionAPI(
        'getconfiguration',
        {
            extension_id: document.getElementById('config_extension_id').value,
            segment: document.getElementById('config_segment').value,
            broadcaster_id: document.getElementById('config_broadcaster_id').value
        }
    );
});
document.getElementById('extension_config_service_write').addEventListener('click', (e) => {
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

document.getElementById('configreq_form').addEventListener('submit', (e) => {
    e.preventDefault();

    window.electron.extensionAPI(
        'setconfigurationreq',
        {
            extension_id: document.getElementById('configreq_extension_id').value,
            extension_version: document.getElementById('configreq_extension_version').value,

            broadcaster_id: document.getElementById('configreq_broadcaster_id').value,
            required_configuration: document.getElementById('configreq_required_configuration').value
        }
    );
});

document.getElementById('pubsub_target').addEventListener('change', (e) => {
    document.getElementById('pubsub_is_global_broadcast').value = 'yes';
    document.getElementById('pubsub_target_whisper').setAttribute('disabled','disabled');
    document.getElementById('pubsub_broadcaster_id').setAttribute('disabled','disabled');

    if (e.target.value == 'whisper') {
        document.getElementById('pubsub_target_whisper').removeAttribute('disabled');
    }

    if (e.target.value == 'broadcast' || e.target.value == 'whisper') {
        document.getElementById('pubsub_broadcaster_id').removeAttribute('disabled');
        document.getElementById('pubsub_is_global_broadcast').value = 'no';
    }
});

document.getElementById('pubsub_form').addEventListener('submit', (e) => {
    e.preventDefault();

    let message = document.getElementById('pubsub_message').value;
    if (document.getElementById('pubsub_content_json').checked) {
        // tidy up
        message = JSON.stringify(JSON.parse(message));
    }

    window.electron.extensionAPI(
        'sendpubsub',
        {
            target: [ document.getElementById('pubsub_target').value ],
            target_whisper: document.getElementById('pubsub_target_whisper').value,
            broadcaster_id: document.getElementById('pubsub_broadcaster_id').value,
            is_global_broadcast: (document.getElementById('pubsub_is_global_broadcast').value == 'yes' ? true : false),
            message
        }
    );
});
