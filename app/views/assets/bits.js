document.getElementById('bits_fetch').addEventListener('submit', (e) => {
    e.preventDefault();
    e.target.classList.add('loading');
    getProducts();
});
function getProducts() {
    let should_include_all = document.getElementById('bits_fetch_should_include_all').value == 'yes' ? 'true' : 'false';
    window.electron.bits.getProducts(should_include_all);
}

window.electron.bits.gotProducts((products) => {
    let tbl = document.getElementById('bits_products_table');
    tbl.textContent = '';

    products.forEach(product => {
        let { sku, cost, in_development, display_name, expiration, is_broadcast } = product;

        let row = tbl.insertRow();
        row.setAttribute('id', `bits_products_${sku}`);
        cellInput(row, sku, 'sku', sku);

        let { amount, type } = cost;
        cellInput(row, sku, 'amount', amount);

        cellInput(row, sku, 'in_development', in_development);
        cellInput(row, sku, 'display_name', display_name);
        cellInput(row, sku, 'expiration', expiration);
        cellInput(row, sku, 'is_broadcast', is_broadcast);

        let btn_group = document.createElement('div');
        btn_group.classList.add('btn-group');

        let cell = row.insertCell();
        cell.append(btn_group);

        let save = document.createElement('div');
            save.classList.add('btn');
            save.classList.add('btn-sm');
            save.classList.add('btn-outline-primary');
            save.setAttribute('data-sku', sku);
            //save.textContent = 'Pencil';
            save.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil" viewBox="0 0 16 16"><path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/></svg>';

        btn_group.append(save);
        bindBitsEdit(save, sku);

        let expire = document.createElement('div');
            expire.classList.add('btn');
            expire.classList.add('btn-sm');
            expire.classList.add('btn-outline-danger');
            expire.setAttribute('data-sku', sku);
            //expire.textContent = 'Crosss';
            expire.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg>';

        btn_group.append(expire);
        bindBitsDelete(expire, sku);
    });
});

    function bindBitsEdit(save, sku) {
        save.addEventListener('click', (e) => {
            editProduct(sku);
        });
    }
    function bindBitsDelete(expire, sku) {
        expire.addEventListener('click', (e) => {
            //let sku = e.target.getAttribute('data-sku');
            let expiration = document.getElementById(`bits_product_expiration_${sku}`).value;
            if (expiration == '') {
                let now = new Date();
                expiration = now.toISOString();
            }
            document.getElementById(`bits_product_expiration_${sku}`).value = expiration;

            editProduct(sku);
        });
    }

function editProduct(sku) {
    let data = {
        sku,
        cost: {
            amount: document.getElementById(`bits_product_amount_${sku}`).value,
            type: 'bits'
        },
        in_development: (document.getElementById(`bits_product_in_development_${sku}`).value == 'true' ? true : false),
        display_name: document.getElementById(`bits_product_display_name_${sku}`).value,
        is_broadcast: (document.getElementById(`bits_product_is_broadcast_${sku}`).value == 'true' ? true : false)
    }
    if (document.getElementById(`bits_product_expiration_${sku}`).value != '') {
        data.expiration = document.getElementById(`bits_product_expiration_${sku}`).value;
    }

    document.getElementById(`bits_products_${sku}`).classList.add('loading');

    window.electron.bits.createProduct(data);
}

function cellInput(row, sku, name, value) {
    let cell = row.insertCell();

    let inp = document.createElement('input');
    inp.classList.add('form-control');

    if (name == 'sku') {
        inp.setAttribute('readonly', 'readonly');
    }

    switch (name) {
        case 'in_development':
        case 'is_broadcast':
            inp = document.createElement('select');
            inp.classList.remove('form-control');
            inp.classList.add('form-select');

            let opt_yes = document.createElement('option');
            opt_yes.value = 'true';
            opt_yes.textContent= 'true';
            inp.append(opt_yes);

            let opt_no = document.createElement('option');
            opt_no.value = 'false';
            opt_no.textContent= 'false';
            inp.append(opt_no);

            break;

        case 'amount':
            inp.setAttribute('type', 'number');

            inp.setAttribute('step', '1');
            inp.setAttribute('min', '1');
            inp.setAttribute('max', '10000');
            inp.setAttribute('length', '5');

            break;

        case 'display_name':
            inp.setAttribute('length', '255');
        default:
            inp.setAttribute('type', 'text');
    }

        inp.setAttribute('name', `${name}[${sku}]`);
        inp.setAttribute('id', `bits_product_${name}_${sku}`);
        inp.value = value;

    cell.append(inp);
}

document.getElementById('bits_product_new_create').addEventListener('click', (e) => {
    e.preventDefault();

    // validate

    // go
    let data = {
        sku: document.getElementById('bits_product_new_sku').value,
        cost: {
            amount: document.getElementById('bits_product_new_cost').value,
            type: 'bits'
        },
        in_development: (document.getElementById('bits_product_new_in_development').value == 'true' ? true : false),
        display_name: document.getElementById('bits_product_new_display_name').value,
        is_broadcast: (document.getElementById('bits_product_new_is_broadcast').value == 'true' ? true : false)
    }
    if (document.getElementById('bits_product_new_expiration').value != '') {
        data.expiration = document.getElementById('bits_product_new_expiration').value;
    }

    document.getElementById('bits_products_new').classList.add('loading');
    window.electron.bits.createProduct(data);
});
window.electron.bits.createdProduct(() => {
    document.getElementById('bits_products_new').classList.remove('loading');
    // product created
    let fields = document.getElementById('bits_products_new').getElementsByTagName('input');
    for (let x=0;x<fields.length;x++) {
        if (fields[x].getAttribute('type') == 'text') {
            fields[x].value = '';
        }
    }
    getProducts();
});
