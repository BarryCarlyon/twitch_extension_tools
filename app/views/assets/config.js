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
        a_settings.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-tools" viewBox="0 0 16 16"><path d="M1 0 0 1l2.2 3.081a1 1 0 0 0 .815.419h.07a1 1 0 0 1 .708.293l2.675 2.675-2.617 2.654A3.003 3.003 0 0 0 0 13a3 3 0 1 0 5.878-.851l2.654-2.617.968.968-.305.914a1 1 0 0 0 .242 1.023l3.27 3.27a.997.997 0 0 0 1.414 0l1.586-1.586a.997.997 0 0 0 0-1.414l-3.27-3.27a1 1 0 0 0-1.023-.242L10.5 9.5l-.96-.96 2.68-2.643A3.005 3.005 0 0 0 16 3q0-.405-.102-.777l-2.14 2.141L12 4l-.364-1.757L13.777.102a3 3 0 0 0-3.675 3.68L7.462 6.46 4.793 3.793a1 1 0 0 1-.293-.707v-.071a1 1 0 0 0-.419-.814zm9.646 10.646a.5.5 0 0 1 .708 0l2.914 2.915a.5.5 0 0 1-.707.707l-2.915-2.914a.5.5 0 0 1 0-.708M3 11l.471.242.529.026.287.445.445.287.026.529L5 13l-.242.471-.026.529-.445.287-.287.445-.529.026L3 15l-.471-.242L2 14.732l-.287-.445L1.268 14l-.026-.529L1 13l.242-.471.026-.529.445-.287.287-.445.529-.026z"/></svg>';

        grp.append(a_settings);

        let a_versions = document.createElement('a');
        a_versions.classList.add('btn');
        a_versions.classList.add('btn-sm');
        a_versions.classList.add('btn-outline-primary');
        a_versions.classList.add('website');
        a_versions.setAttribute('href', `https://dev.twitch.tv/console/extensions/${extensions[ref].client_id}`);
        a_versions.setAttribute('title', 'View Versions for this Extension on the Dev Console');
        a_versions.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-file-diff" viewBox="0 0 16 16"><path d="M8 4a.5.5 0 0 1 .5.5V6H10a.5.5 0 0 1 0 1H8.5v1.5a.5.5 0 0 1-1 0V7H6a.5.5 0 0 1 0-1h1.5V4.5A.5.5 0 0 1 8 4m-2.5 6.5A.5.5 0 0 1 6 10h4a.5.5 0 0 1 0 1H6a.5.5 0 0 1-.5-.5"/><path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2zm10-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1"/></svg>';

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
        els[x].textContent = 'Pending';
    }

    // JSON it
    document.getElementById('extension_details_data').innerHTML = syntaxHighlight(JSON.stringify(extension_details, null, 4));
});
