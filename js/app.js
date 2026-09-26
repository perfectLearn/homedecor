function getCart(){
    return JSON.parse(
        localStorage.getItem('perfectHomeCart') || '[]'
    );
}


function saveCart(c){
    localStorage.setItem(
        'perfectHomeCart',
        JSON.stringify(c)
    );

    updateCartCount();
}


function updateCartCount(){
    const el = document.getElementById('cartCount');

    if(el){
        el.textContent = getCart()
            .reduce((s,x) => s + x.qty, 0);
    }
}


function addToCart(id, qty = 1){

    const c = getCart();

    const item = c.find(x => x.id === id);

    if(item){
        item.qty += qty;
    }
    else{
        c.push({
            id,
            qty
        });
    }

    saveCart(c);

    toast('Added to your cart ✓');
}


function toast(msg){

    let t = document.getElementById('toast');

    if(!t){
        t = document.createElement('div');

        t.id = 'toast';

        document.body.appendChild(t);
    }

    t.textContent = msg;

    t.classList.add('show');

    setTimeout(
        () => t.classList.remove('show'),
        1800
    );
}


/* =========================================================
   HEADER ACCOUNT
   ========================================================= */

function updateHeaderAccount(){

    const accountLinks =
        document.querySelectorAll(
            'header.header nav a[href="account.html"]'
        );

    if(!accountLinks.length) return;

    const user =
        JSON.parse(
            localStorage.getItem(
                'perfectHomeCurrentUser'
            ) || 'null'
        );

    accountLinks.forEach(link => {

        if(user){

            const firstName =
                escapeHeaderText(
                    user.name || 'User'
                ).split(' ')[0];

            link.className =
                'account-link signed-in';

            link.setAttribute(
                'title',
                'Signed in as ' +
                escapeHeaderText(
                    user.name || 'User'
                )
            );

            link.innerHTML =
                '<span class="account-avatar-mini">' +
                firstName.charAt(0).toUpperCase() +
                '</span>' +

                '<span class="account-link-text">' +

                '<strong>Hi, ' +
                firstName +
                '</strong>' +

                '<small><i></i> Signed in</small>' +

                '</span>';

        }
        else{

            link.className =
                'account-link signed-out';

            link.setAttribute(
                'title',
                'Sign in to your Perfect Home account'
            );

            link.innerHTML =
                '<span class="account-icon">♙</span>' +

                '<span class="account-link-text">' +

                '<strong>Account</strong>' +

                '<small>Sign in</small>' +

                '</span>';
        }

    });
}


function escapeHeaderText(value = ''){

    return String(value).replace(
        /[&<>'"]/g,
        c => ({
            '&':'&amp;',
            '<':'&lt;',
            '>':'&gt;',
            "'":'&#39;',
            '"':'&quot;'
        }[c])
    );
}


/* =========================================================
   SEARCH
   ========================================================= */

function performSearch(){

    const input =
        document.getElementById('searchInput');

    const q =
        input?.value.trim() || '';

    if(q){

        location.href =
            'products.html?search=' +
            encodeURIComponent(q);

    }
    else{

        location.href =
            'products.html';
    }
}


/* =========================================================
   SHOP
   ========================================================= */

let currentCategory = 'All';


function initShop(){

    const p =
        new URLSearchParams(
            location.search
        );

    currentCategory =
        p.get('category') || 'All';

    const q =
        p.get('search');

    if(q){

        const s =
            document.getElementById(
                'searchInput'
            );

        if(s){
            s.value = q;
        }
    }

    renderProducts();
}


/* =========================================================
   CATEGORY FILTER
   ========================================================= */

function setCategory(c){

    /*
       IMPORTANT FIX:
       When user clicks a category,
       remove the old search query.

       Example:

       Before:
       products.html?search=chairs

       After clicking Tables:
       products.html?category=Tables
    */

    currentCategory = c;


    const params =
        new URLSearchParams();


    if(c && c !== 'All'){

        params.set(
            'category',
            c
        );
    }


    /*
       Replace the URL without reloading.
       This removes ?search=chairs.
    */

    const newUrl =
        params.toString()
            ? 'products.html?' +
              params.toString()
            : 'products.html';


    window.history.replaceState(
        {},
        '',
        newUrl
    );


    /*
       Clear search box
    */

    const searchInput =
        document.getElementById(
            'searchInput'
        );

    if(searchInput){

        searchInput.value = '';
    }


    /*
       Render the selected category
    */

    renderProducts();
}


/* =========================================================
   RENDER PRODUCTS
   ========================================================= */

function renderProducts(){

    const root =
        document.getElementById(
            'products'
        );

    if(!root) return;


    /*
       Read category from current state
    */

    const category =
        currentCategory || 'All';


    /*
       Search should only be active when
       the page was opened using ?search=
    */

    const params =
        new URLSearchParams(
            location.search
        );


    const q =
        params.get('search') || '';


    const term =
        q.toLowerCase().trim();


    /*
       Filter category first
    */

    let list =
        PRODUCTS.filter(p => {

            const categoryMatch =
                category === 'All' ||
                p.cat === category;


            const searchMatch =
                !term ||
                (
                    p.name +
                    ' ' +
                    p.cat +
                    ' ' +
                    p.desc
                )
                .toLowerCase()
                .includes(term);


            return (
                categoryMatch &&
                searchMatch
            );
        });


    /* Price filter */

    const max =
        document.querySelector(
            'input[name=price]:checked'
        )?.value;


    if(max && max !== 'all'){

        list =
            list.filter(
                p => p.price <= +max
            );
    }


    /* Sorting */

    const sort =
        document.getElementById(
            'sort'
        )?.value;


    if(sort === 'low'){

        list.sort(
            (a,b) => a.price - b.price
        );
    }


    if(sort === 'high'){

        list.sort(
            (a,b) => b.price - a.price
        );
    }


    if(sort === 'rating'){

        list.sort(
            (a,b) => b.rating - a.rating
        );
    }


    /* Result text */

    document.getElementById(
        'resultText'
    ).textContent =

        `${list.length} products` +

        `${
            category !== 'All'
                ? ' in ' + category
                : ''
        }` +

        `${
            term
                ? ' matching “' + q + '”'
                : ''
        }`;


    /* Products */

    root.innerHTML =

        list.length

        ? list
            .map(productCard)
            .join('')

        : `

            <div class="empty-results">

                <div>🔎</div>

                <h2>
                    No furniture found
                </h2>

                <p>
                    Try another search or category.
                </p>

                <a
                    class="btn primary"
                    href="products.html"
                >
                    View all products
                </a>

            </div>

        `;
}


/* =========================================================
   PAGE LOAD
   ========================================================= */

document.addEventListener(
    'DOMContentLoaded',
    () => {

        updateCartCount();

        updateHeaderAccount();


        /* Search */

        const s =
            document.getElementById(
                'searchInput'
            );


        if(s){

            s.addEventListener(
                'keydown',
                e => {

                    if(e.key === 'Enter'){

                        performSearch();
                    }

                }
            );
        }


        /* Featured products */

        const featured =
            document.getElementById(
                'featured'
            );


        if(featured){

            featured.innerHTML =
                PRODUCTS
                    .slice(30,36)
                    .concat(
                        PRODUCTS.slice(0,2)
                    )
                    .map(productCard)
                    .join('');
        }


        /* Shop page */

        if(
            document.getElementById(
                'products'
            )
        ){

            initShop();
        }

    }
);
