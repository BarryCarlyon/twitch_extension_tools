function tab(id) {
    let el = document.getElementById(id);
    if (el) {
        let tab = new bootstrap.Tab(el)
        tab.show();
    }
}

function processExtension(extension_details) {
    let active_extension_id = document.getElementsByClassName('active_extension_id');
    for (let x=0;x<active_extension_id.length;x++) {
        active_extension_id[x].value = extension_details.id;
    }
    let active_version = document.getElementsByClassName('active_version');
    for (let x=0;x<active_version.length;x++) {
        active_version[x].value = extension_details.version;
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
}
