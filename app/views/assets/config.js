document.getElementById('config_form').addEventListener('submit', (e) => {
    e.preventDefault();

    window.electron.config.create({
        name: document.getElementById('name').value,
        client_id: document.getElementById('client_id').value,
        extension_secret: document.getElementById('extension_secret').value,
        user_id: document.getElementById('user_id').value
    });
});

window.electron.config.extensions((extensions) => {
    console.log('extensions', extensions);

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

        let a_remove = document.createElement('div');
        a_remove.classList.add('btn');
        a_remove.classList.add('btn-sm');
        a_remove.classList.add('btn-outline-danger');
        a_remove.textContent = 'Remove';

        grp.append(a_remove);

        let li = document.createElement('li');
        dropdown.append(li);
        let li_a = document.createElement('a');
        li.append(li_a);
        li_a.classList.add('dropdown-item');
        li_a.setAttribute('href', '#extension');
        li_a.setAttribute('client_id', extensions[ref].client_id);
        li_a.textContent = extensions[ref].name;
    }
});

document.addEventListener('click', (e) => {
    if (e.target.tagName == 'A') {
        if (e.target.getAttribute('href').startsWith('#')) {
            if (e.target.hasAttribute('client_id')) {
                window.electron.config.select(e.target.getAttribute('client_id'));
                // change to extension tag
                tab('config-tab');
                document.getElementById('run-tab').classList.add('disabled');
            }
            return;
        }
        e.preventDefault();
        window.electron.openWeb(e.target.getAttribute('href'));
    }
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
    document.getElementById('run-tab').classList.remove('disabled');
    // change to run requests
    tab('run-tab');

    processExtension(extension_details);
});
