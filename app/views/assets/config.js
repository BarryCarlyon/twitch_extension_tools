document.getElementById('id_convert_owner').addEventListener('click', (e) => {
    document.getElementById('client_secret').classList.remove('is-invalid');
    document.getElementById('user_id').classList.remove('is-invalid');

    if (document.getElementById('client_secret').value == '') {
        // empty
        document.getElementById('client_secret').classList.add('is-invalid');
        return;
    }
    if (document.getElementById('user_id').value == '') {
        document.getElementById('user_id').classList.add('is-invalid');
        return;
    }

    window.electron.ownerConvertToId(
        document.getElementById('client_id').value,
        document.getElementById('client_secret').value,
        document.getElementById('user_id').value
    );
    e.target.closest('.input-group').classList.add('loading');
});
    window.electron.ownerConvertedToId(user_id => {
        console.log('data', user_id);
        document.getElementById('user_id').value = user_id;
        document.getElementById('user_id').closest('.input-group').classList.remove('loading');
    });

document.getElementById('config_form').addEventListener('submit', (e) => {
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
    document.getElementById('create_button').value = "Edit";
});

window.electron.config.extensions((extensions) => {
    console.log('extensions', extensions);

    // reset entry form
    let inputs = document.getElementById('config_form').getElementsByTagName('input');
    for (let x=0;x<inputs.length;x++) {
        if (inputs[x].getAttribute('type') != 'submit') {
            inputs[x].value = '';
        }
    }
    document.getElementById('create_button').value = "Create";

    // draw
    let dropdown = document.getElementById('extension_select');
    dropdown.textContent = '';
    let el = document.getElementById('existing_extensions').getElementsByTagName('tbody')[0];
    el.textContent = '';

    for (var ref in extensions) {
        let row = el.insertRow();

        var cell = row.insertCell();
        cell.textContent = extensions[ref].name;

        var cell = row.insertCell();
        cell.textContent = extensions[ref].client_id;

        var cell = row.insertCell();
        cell.textContent = extensions[ref].user_id;

        var cell = row.insertCell();
        let grp = document.createElement('div');
        cell.append(grp);

        grp.classList.add('btn-group');

        let a_settings = document.createElement('a');
        a_settings.classList.add('btn');
        a_settings.classList.add('btn-sm');
        a_settings.classList.add('btn-outline-primary');
        a_settings.classList.add('website');
        a_settings.setAttribute('href', `https://dev.twitch.tv/console/extensions/${extensions[ref].client_id}/settings`);
        a_settings.textContent = 'Settings';
        grp.append(a_settings);

        let a_versions = document.createElement('a');
        a_versions.classList.add('btn');
        a_versions.classList.add('btn-sm');
        a_versions.classList.add('btn-outline-primary');
        a_versions.classList.add('website');
        a_versions.setAttribute('href', `https://dev.twitch.tv/console/extensions/${extensions[ref].client_id}`);
        a_versions.textContent = 'Versions';

        grp.append(a_versions);

        let a_edit = document.createElement('div');
        a_edit.classList.add('btn');
        a_edit.classList.add('btn-sm');
        a_edit.classList.add('btn-outline-warning');
        a_edit.textContent = 'Edit';
        a_edit.setAttribute('data-client_id', extensions[ref].client_id);

        bindEdit(a_edit, extensions[ref])

        grp.append(a_edit);

        let a_remove = document.createElement('div');
        a_remove.classList.add('btn');
        a_remove.classList.add('btn-sm');
        a_remove.classList.add('btn-outline-danger');
        a_remove.textContent = 'Remove';

        bindRemove(a_remove, extensions[ref])

        grp.append(a_remove);

        let li = document.createElement('li');
        dropdown.append(li);
        let li_a = document.createElement('a');
        li.append(li_a);
        li_a.classList.add('dropdown-item');
        li_a.setAttribute('href', '#extension');
        li_a.setAttribute('data-client_id', extensions[ref].client_id);
        li_a.textContent = extensions[ref].name;
    }
});

function bindEdit(el, ext) {
    el.addEventListener('click', (e) => {
        // load parameters for edit
        window.electron.config.loadForEdit(e.target.getAttribute('data-client_id'));
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
    window.electron.config.remove(e.target.getAttribute('data-client_id'));
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

window.electron.config.extensionDetails((extension_details) => {
    // API response so differing
    document.getElementById('run-tab').classList.remove('disabled');
    // change to run requests
    tab('run-tab');

    let items = document.getElementsByClassName('dropdown-item');
    for (let x=0;x<items.length;x++) {
        items[x].classList.remove('bg-primary');
        if (items[x].getAttribute('data-client_id') == extension_details.id) {
            items[x].classList.add('bg-primary');
        }
    }

    processExtension(extension_details);
    buildLayout(extension_details);

    document.getElementById('extension_details_data').textContent = JSON.stringify(extension_details, null, 4);
});
