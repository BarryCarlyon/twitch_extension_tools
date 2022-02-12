function tab(id) {
    let el = document.getElementById(id);
    if (el) {
        let tab = new bootstrap.Tab(el);
        tab.show();
    }
}

function processExtension(extension_details) {
    let active_extension_id = document.getElementsByClassName('active_extension_id');
    for (let x=0;x<active_extension_id.length;x++) {
        active_extension_id[x].value = extension_details.id;
        active_extension_id[x].setAttribute('readonly', 'readonly');
    }
    let active_version = document.getElementsByClassName('active_version');
    for (let x=0;x<active_version.length;x++) {
        active_version[x].value = extension_details.version;
        if (active_version[x].getAttribute('id') != 'change_version') {
            active_version[x].setAttribute('readonly', 'readonly');
        }
    }
    let version_links = document.getElementsByClassName('version_link');
    for (let x=0;x<version_links.length;x++) {
        version_links[x].setAttribute('href', `https://dev.twitch.tv/console/extensions/${extension_details.id}/${extension_details.version}/capabilities`);
    }

    let extension_chat_service_header = document.getElementById('extension_chat_service_header');
    if (extension_details.has_chat_support) {
        extension_chat_service_header.classList.remove('disabled');
    } else {
        extension_chat_service_header.classList.remove('disabled');
    }

    let extension_config_service_header = document.getElementById('extension_config_service_header');
    if (extension_details.extension_config_service_header == 'hosted') {
        extension_config_service_header.classList.remove('disabled');
    } else {
        extension_config_service_header.classList.remove('disabled');
    }

    //let configreq_configuration_version_value = document.getElementById('configreq_configuration_version_value');
    //if (configreq_configuration_version_value) {
    //    configreq_configuration_version_value = extension_details
    //}
}

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
