let updater_reset = false;
window.electron.onUpdater((data) => {
    var u = document.getElementById('updater');

    u.classList.add('updating');
    clearTimeout(updater_reset);
    updater_reset = setTimeout(() => {
        u.classList.remove('updating');
    }, 10000);

    switch (data.event) {
        case 'update-error':
            u.innerHTML = 'Update Error';
            break;
        case 'checking-for-update':
            u.innerHTML = 'Checking';
            break;
        case 'update-available':
            u.innerHTML = 'Update Available';
            break;
        case 'update-not-available':
            u.innerHTML = 'Up to Date';
            break;
        case 'download-progress':
            u.innerHTML = 'DL: ' + data.data.percent.toFixed(1) + '%';
            break;
        case 'update-downloaded':
            u.innerHTML = 'Downloaded Restarting';
            break;
    }
});
window.electron.ready();
document.getElementById('updater').addEventListener('click', window.electron.updateCheck);

// so lazy
let links = document.getElementsByTagName('a');
for (let x=0;x<links.length;x++) {
    if (links[x].getAttribute('href').startsWith('https://')) {
        links[x].classList.add('website');
    }
}

document.addEventListener('click', (e) => {
    if (e.target.tagName == 'A') {
        if (e.target.getAttribute('href').startsWith('#')) {
            if (e.target.hasAttribute('data-client_id')) {
                window.electron.config.select(e.target.getAttribute('data-client_id'));
                // change to extension tag
                tab('config-tab');
                document.getElementById('run-tab').classList.add('disabled');
            }
            return;
        }
        e.preventDefault();
        window.electron.openWeb(e.target.getAttribute('href'));
    }

    if (e.target.classList.contains('convertToId')) {
        console.log('has convertToId');
        let field = e.target.getAttribute('data-target');
        let el = document.getElementById(field);
        if (el) {
            console.log('has el', field, el.value);

            window.electron.convertToId(field, el.value);

            e.target.closest('.input-group').classList.add('loading');
        }
    }
});
    window.electron.convertedToId((data) => {
        console.log('convertedToId', data);
        let target = document.getElementById(data.el);
        if (target) {
            console.log('data', data.id);
            target.value = data.id;
            target.closest('.input-group').classList.remove('loading');
        }
    });


function tab(id) {
    let el = document.getElementById(id);
    if (el) {
        let tab = new bootstrap.Tab(el);
        tab.show();
    }
}

function processExtension(extension_details) {
    document.getElementById('run_requests_title').textContent = `${extension_details.name}/${extension_details.id}`;
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
    let install_link = document.getElementsByClassName('install_link');
    for (let x=0;x<install_link.length;x++) {
        install_link[x].setAttribute('href', `https://dashboard.twitch.tv/extensions/${extension_details.id}-${extension_details.version}`);
    }

    let extension_config_service_header = document.getElementById('extension_config_service_header');
    let extension_config_service_required_header = document.getElementById('extension_config_service_required_header');
    if (extension_details.configuration_location == 'hosted') {
        console.log('Config is Hosted');
        extension_config_service_header.closest('.accordion-item').classList.remove('disabled');
        extension_config_service_required_header.closest('.accordion-item').classList.remove('disabled');
    } else {
        console.log('Config is NOT Hosted');
        extension_config_service_header.closest('.accordion-item').classList.add('disabled');
        extension_config_service_required_header.closest('.accordion-item').classList.add('disabled');
    }
    let extension_chat_service_header = document.getElementById('extension_chat_service_header');
    if (extension_details.has_chat_support) {
        console.log('Has chat support');
        extension_chat_service_header.closest('.accordion-item').classList.remove('disabled');
    } else {
        console.log('No chat support');
        extension_chat_service_header.closest('.accordion-item').classList.add('disabled');
    }

    let extension_bitsproducts_header = document.getElementById('extension_bitsproducts_header');
    if (extension_details.bits_enabled) {
        console.log('Has bits support');
        extension_bitsproducts_header.closest('.accordion-item').classList.remove('disabled');
    } else {
        console.log('No bits support');
        extension_bitsproducts_header.closest('.accordion-item').classList.add('disabled');
    }
}
function buildLayout(details) {
    document.getElementById('layout_icon').style.backgroundImage = `url(${details.icon_urls['100x100']})`;

    document.getElementById('layout_name').textContent = details.name;
    document.getElementById('layout_author_name').textContent = details.author_name;

    //document.getElementById('layout_description').textContent = details.description;
    document.getElementById('layout_description').textContent = '';
    let ps = details.description.split("\n");
    ps.forEach(txt => {
        let p = document.createElement('p');
        document.getElementById('layout_description').append(p);
        p.textContent = txt;
    });

    // images
    let screenshots = document.getElementById('layout_screenshots_slides');
    screenshots.textContent = '';
    if (details.screenshot_urls.length > 0) {
        details.screenshot_urls.forEach(url => {
            let item = document.createElement('div');
            screenshots.append(item);
            item.classList.add('carousel-item');

            let img = document.createElement('img');
            item.append(img);
            img.classList.add('d-block');
            img.classList.add('w-100');
            img.setAttribute('src', url);
        });
        document.getElementsByClassName('carousel-item')[0].classList.add('active');
    }

    // additional
    let additional = document.getElementById('layout_additional');
    additional.textContent = '';

    var ap = document.createElement('p');
    additional.append(ap);
    ap.textContent = `Version: ${details.version}`;

    //var ap = document.createElement('p');
    //additional.append(ap);
    //ap.textContent = `Category: ${details.category}`;
    var ap = document.createElement('p');
    additional.append(ap);
    ap.textContent = `Category: NOT IN THE API`;

    var ap = document.createElement('p');
    additional.append(ap);
    ap.textContent = `Support: ${details.support_email}`;

    var ap = document.createElement('p');
    additional.append(ap);

    let words = {
        'component': 'Component',
        'panel': 'Panel',
        'overlay': 'Overlay',
        'mobile': 'Mobile'
    }
    let types = [];
    for (let slot in details.views) {
        if (details.views[slot].viewer_url) {
            if (words.hasOwnProperty(slot)) {
                types.push(words[slot]);
            }
        }
    }

    ap.textContent = `Types: ${types.join(', ')}`;

    if (details.privacy_policy_url != '') {
        var ap = document.createElement('p');
        additional.append(ap);
        ap.textContent = 'Privacy Policy: ';
        var a = document.createElement('a');
        a.classList.add('website');
        a.setAttribute('href', details.privacy_policy_url);
        a.textContent = details.privacy_policy_url;
        ap.append(a);
    }

    if (details.eula_tos_url != '') {
        var ap = document.createElement('p');
        additional.append(ap);
        ap.textContent = 'EULA: ';
        var a = document.createElement('a');
        a.classList.add('website');
        a.setAttribute('href', details.eula_tos_url);
        a.textContent = details.eula_tos_url;
        ap.append(a);
    }
}

window.electron.errorMsg(words => {
    // reset loadings
    let loadings = document.getElementsByClassName('loading');
    for (var x=0;x<loadings.length;x++) {
        loadings[x].classList.remove('loading');
    }
    // draw
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
