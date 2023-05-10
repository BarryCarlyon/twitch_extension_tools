window.electron.config.location((loc) => {
    document.getElementById('config_location').textContent = loc;
});

document.getElementById('id_convert_owner').addEventListener('click', (e) => {
    document.getElementById('client_id').classList.remove('is-invalid');
    document.getElementById('client_secret').classList.remove('is-invalid');
    document.getElementById('user_id').classList.remove('is-invalid');

    let invalid = false;
    if (document.getElementById('client_id').value == '') {
        // empty
        document.getElementById('client_id').classList.add('is-invalid');
        invalid = true;
    }
    if (document.getElementById('client_secret').value == '') {
        // empty
        document.getElementById('client_secret').classList.add('is-invalid');
        invalid = true;
    }
    if (document.getElementById('user_id').value == '') {
        document.getElementById('user_id').classList.add('is-invalid');
        invalid = true;
    }
    if (invalid) {
        return;
    }

    window.electron.ownerConvertToId(
        document.getElementById('client_id').value,
        document.getElementById('client_secret').value,
        document.getElementById('user_id').value
    );
    e.currentTarget.closest('.input-group').classList.add('loading');
});

document.getElementById('create_button').addEventListener('click', (e) => {
    e.preventDefault();

    // validate
    let required = [
        'name',
        'client_id',
        'extension_secret',
        'user_id'
    ];
    let valid = true;

    required.forEach(field => {
        document.getElementById(field).classList.remove('is-invalid');
        if (document.getElementById(field).value == '') {
            document.getElementById(field).classList.add('is-invalid');
            valid = false;
        }
    });

    if (!valid) {
        return;
    }

    window.electron.config.create({
        name: document.getElementById('name').value,
        client_id: document.getElementById('client_id').value,
        extension_secret: document.getElementById('extension_secret').value,
        client_secret: document.getElementById('client_secret').value,
        user_id: document.getElementById('user_id').value
    });
});
window.electron.config.loadedForEdit((extension) => {
    let fields = [
        'name',
        'client_id',
        'extension_secret',
        'client_secret',
        'user_id'
    ]
    fields.forEach(field => {
        document.getElementById(field).value = extension[field] ? extension[field] : '';
    });
    document.getElementById('create_button').value = "Edit Extension Configuration";
    // and show modal
    let modal = new bootstrap.Modal(document.getElementById('add_new_extension_modal'));
    modal.show();
});

window.electron.config.extensions((data) => {
    // dismiss dialog
    let modal = bootstrap.Modal.getOrCreateInstance('#add_new_extension_modal');
    modal.hide();

    let { extensions, active_client_id } = data;
    //console.log('extensions', active_client_id, extensions);

    // draw
    let dropdown = document.getElementById('extension_select');
    dropdown.textContent = '';
    let el = document.getElementById('existing_extensions').getElementsByTagName('tbody')[0];
    el.textContent = '';

    if (!extensions || Object.keys(extensions).length == 0) {
        let row = el.insertRow();
        var cell = row.insertCell();
        cell.textContent = 'You have no Extensions Configured. Click "Add New Extension Configuration" to add a configuration';
        cell.classList.add('text-center');
        cell.classList.add('text-danger');
        cell.setAttribute('colspan', 4);
        // and force nudge
        let modal = new bootstrap.Modal(document.getElementById('add_new_extension_modal'));
        modal.show();
        // extra nudge
        errorMsg('You have no Extension Configurations. Add one to continue');
        return;
    }

    // reset entry form
    let inputs = document.getElementById('config_form').getElementsByTagName('input');
    for (let x=0;x<inputs.length;x++) {
        if (inputs[x].getAttribute('type') != 'submit' && inputs[x].getAttribute('type') != 'button') {
            inputs[x].value = '';
        }
    }
    document.getElementById('create_button').value = "Create Extension Configuration";

    for (var ref in extensions) {
        let row = el.insertRow();

        var cell = row.insertCell();
        cell.textContent = extensions[ref].name;

        var cell = row.insertCell();
        cell.classList.add('monospace');
        cell.textContent = extensions[ref].client_id;

        var cell = row.insertCell();
        cell.textContent = extensions[ref].user_id;

        var cell = row.insertCell();
        let grp = document.createElement('div');
        cell.append(grp);

        grp.classList.add('btn-group');

        let usethis = document.createElement('button');
        usethis.classList.add('btn');
        usethis.classList.add('btn-sm');
        usethis.classList.add('btn-outline-success');
        //usethis.textContent = 'Use';

        usethis.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-right" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"/></svg>';

        usethis.setAttribute('title', 'Use this Extension configuration');
        usethis.setAttribute('data-client_id', extensions[ref].client_id);

        bindUse(usethis);
        grp.append(usethis);

        let a_settings = document.createElement('a');
        a_settings.classList.add('btn');
        a_settings.classList.add('btn-sm');
        a_settings.classList.add('btn-outline-primary');
        a_settings.classList.add('website');
        a_settings.setAttribute('href', `https://dev.twitch.tv/console/extensions/${extensions[ref].client_id}/settings`);
        a_settings.setAttribute('title', 'View Extension Settings for this Extension on the Dev Console');
        a_settings.textContent = 'Settings';
        //a_settings.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-gear" viewBox="0 0 16 16"><path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/><path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"/></svg>';

        grp.append(a_settings);

        let a_versions = document.createElement('a');
        a_versions.classList.add('btn');
        a_versions.classList.add('btn-sm');
        a_versions.classList.add('btn-outline-primary');
        a_versions.classList.add('website');
        a_versions.setAttribute('href', `https://dev.twitch.tv/console/extensions/${extensions[ref].client_id}`);
        a_versions.setAttribute('title', 'View Versions for this Extension on the Dev Console');
        a_versions.textContent = 'Versions';

        grp.append(a_versions);

        let a_edit = document.createElement('button');
        a_edit.classList.add('btn');
        a_edit.classList.add('btn-sm');
        a_edit.classList.add('btn-outline-warning');
        a_edit.setAttribute('title', 'Load this Extensions configuration for Editing');
        //a_edit.textContent = 'Edit';
        a_edit.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil" viewBox="0 0 16 16"><path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/></svg>';
        a_edit.setAttribute('data-client_id', extensions[ref].client_id);

        bindEdit(a_edit)
        grp.append(a_edit);

        let a_remove = document.createElement('button');
        a_remove.classList.add('btn');
        a_remove.classList.add('btn-sm');
        a_remove.classList.add('btn-outline-danger');
        a_remove.setAttribute('title', 'Remove this Extensions configuration');
        //a_remove.textContent = 'Delete';
        a_remove.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z"/><path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z"/></svg>'

        bindRemove(a_remove, extensions[ref]);
        grp.append(a_remove);

        let a_revoke = document.createElement('button');
        a_revoke.classList.add('btn');
        a_revoke.classList.add('btn-sm');
        a_revoke.classList.add('btn-outline-danger');
        a_revoke.setAttribute('data-client_id', extensions[ref].client_id);
        a_revoke.setAttribute('title', 'If button is enabled, this button will revoke an App Access Token generated for this Extension');
        a_revoke.textContent = 'Revoke';

        if (extensions[ref].access_token && extensions[ref].access_token != '') {
        } else {
            a_revoke.setAttribute('disabled','disabled');
        }

        bindRevoke(a_revoke, extensions[ref]);
        grp.append(a_revoke);

        let li = document.createElement('li');
        dropdown.append(li);
        let li_a = document.createElement('a');
        li.append(li_a);
        li_a.classList.add('dropdown-item');
        li_a.setAttribute('href', '#extension');
        li_a.setAttribute('data-client_id', extensions[ref].client_id);
        li_a.textContent = extensions[ref].name;
    }

    markDropdown(active_client_id);
});

function bindUse(el) {
    el.addEventListener('click', (e) => {
        // load parameters for use
        window.electron.config.select(e.currentTarget.getAttribute('data-client_id'));
    });
}
function bindEdit(el) {
    el.addEventListener('click', (e) => {
        // load parameters for edit
        window.electron.config.loadForEdit(e.currentTarget.getAttribute('data-client_id'));
    });
}
function bindRevoke(el, ext) {
    el.addEventListener('click', (e) => {
        // load parameters for edit
        window.electron.config.revokeToken(e.currentTarget.getAttribute('data-client_id'));
    });
}
function bindRemove(el, ext) {
    el.addEventListener('click', (e) => {
        document.getElementById('remove_name').textContent = ext.name;
        document.getElementById('actuallyRemove').setAttribute('data-client_id', ext.client_id);
        let modal = new bootstrap.Modal(document.getElementById('rusure_modal'));
        modal.show();
    });
}
document.getElementById('actuallyRemove').addEventListener('click', (e) => {
    window.electron.config.remove(e.currentTarget.getAttribute('data-client_id'));
});

let version_modal = new bootstrap.Modal(document.getElementById('version_modal'));
window.electron.config.requestVersion(() => {
    version_modal.show();
});

document.getElementById('select_version').addEventListener('submit', (e) => {
    e.preventDefault();
    version_modal.hide();
    window.electron.config.selectVersion(document.getElementById('version').value);
});

function markDropdown(client_id) {
    let items = document.getElementsByClassName('dropdown-item');
    for (let x=0;x<items.length;x++) {
        items[x].classList.remove('bg-primary');
        if (client_id || client_id == '') {
            if (items[x].getAttribute('data-client_id') == client_id) {
                items[x].classList.add('bg-primary');
                select_active_extension.textContent = items[x].textContent;
            }
        }
    }
}

function syntaxHighlight(json) {
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
}

// an extension was loaded!
window.electron.config.extensionDetails((extension_details) => {
    // API response so differing
    document.getElementById('run-tab').classList.remove('disabled');
    // change to run requests
    tab('run-tab');

    markDropdown(extension_details.id);

    processExtension(extension_details);
    buildLayout(extension_details);

    // reset bits products table
    let tbl = document.getElementById('bits_products_table');
    tbl.textContent = '';
    let row = tbl.insertRow();
    let cell = document.createElement('th');
    row.append(cell);
    cell.setAttribute('colspan', '7');
    cell.textContent = 'Fetch Products First';
    // reset bits transactions table
    let trnbl = document.getElementById('transactions_table');
    trnbl.textContent = '';
    document.getElementById('transactions_fetch_next').classList.add('d-none');

    // reset resp fields
    let els = document.getElementsByClassName('extension_api_response');
    for (let x=0;x<els.length;x++) {
        els[x].textContent = '';
    }

    // JSON it
    document.getElementById('extension_details_data').innerHTML = syntaxHighlight(JSON.stringify(extension_details, null, 4));
});
