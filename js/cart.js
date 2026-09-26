function getSignedInUser(){
    return JSON.parse(
        localStorage.getItem('perfectHomeCurrentUser') || 'null'
    );
}

function getSavedAddressesForCheckout(){
    const user = getSignedInUser();

    if(!user) return {};

    const all = JSON.parse(
        localStorage.getItem('perfectHomeAddresses') || '{}'
    );

    return all[user.email] || {};
}

function formatSavedAddress(a){
    if(!a) return '';

    return `${a.street}, ${a.village}, ${a.city}, ${a.state} - ${a.pincode}, ${a.country}`;
}

function escapeCheckout(v){
    return String(v ?? '').replace(
        /[&<>"']/g,
        m => ({
            '&':'&amp;',
            '<':'&lt;',
            '>':'&gt;',
            '"':'&quot;',
            "'":'&#39;'
        }[m])
    );
}


/* =========================================================
   CHECKOUT ADDRESS
   ========================================================= */

function renderCheckoutAddress(){

    const user = getSignedInUser();

    /* Guest checkout */

    if(!user){

        return `
        <div class="checkout-form">

            <h3>Delivery details</h3>

            <input
                id="orderName"
                placeholder="Full name"
                required
            >

            <input
                id="orderPhone"
                placeholder="10-digit mobile number"
                maxlength="10"
                required
            >

            <textarea
                id="orderAddress"
                placeholder="Complete delivery address"
                required
            ></textarea>

            <select id="payment">
                <option>Cash on Delivery</option>
                <option>UPI / Online payment</option>
                <option>Card on Delivery</option>
            </select>

            <button
                class="btn primary full"
                onclick="placeOrder()"
            >
                Place order
            </button>

        </div>
        `;
    }


    const addresses =
        getSavedAddressesForCheckout();

    const types =
        ['home','office']
        .filter(t => addresses[t]);


    /* No saved address */

    if(!types.length){

        return `
        <div class="checkout-form">

            <h3>Delivery address</h3>

            <div class="checkout-no-address">

                <b>No saved address found</b>

                <p>
                    Please add a Home or Office address
                    from your Account before placing the order.
                </p>

                <a
                    class="btn primary full"
                    href="account.html"
                >
                    Add delivery address
                </a>

            </div>

            <select id="payment">
                <option>Cash on Delivery</option>
                <option>UPI / Online payment</option>
                <option>Card on Delivery</option>
            </select>

            <button
                class="btn primary full"
                onclick="placeOrder()"
            >
                Place order
            </button>

        </div>
        `;
    }


    const selected =
        addresses.home
            ? 'home'
            : 'office';


    return `
    <div class="checkout-form">

        <div class="checkout-address-head">

            <div>
                <h3>Delivery address</h3>
                <p>Choose a saved address</p>
            </div>

            <a href="account.html">
                Manage addresses
            </a>

        </div>


        <div class="checkout-address-list">

            ${types.map(type => {

                const a = addresses[type];

                return `
                <label class="checkout-address-card">

                    <input
                        type="radio"
                        name="checkoutAddress"
                        value="${type}"
                        ${type === selected ? 'checked' : ''}
                    >

                    <span class="checkout-address-content">

                        <span class="checkout-address-title">

                            <b>
                                ${
                                    type === 'home'
                                    ? '🏠 Home Address'
                                    : '🏢 Office Address'
                                }
                            </b>

                            <small>
                                ${escapeCheckout(a.name)}
                            </small>

                        </span>

                        <span>
                            ${escapeCheckout(
                                formatSavedAddress(a)
                            )}
                        </span>

                        <span>
                            📱 ${escapeCheckout(a.mobile)}
                            &nbsp; • &nbsp;
                            ✉ ${escapeCheckout(a.email)}
                        </span>

                    </span>

                </label>
                `;

            }).join('')}

        </div>


        <select id="payment">

            <option>
                Cash on Delivery
            </option>

            <option>
                UPI / Online payment
            </option>

            <option>
                Card on Delivery
            </option>

        </select>


        <button
            class="btn primary full"
            onclick="placeOrder()"
        >
            Place order
        </button>

    </div>
    `;
}


/* =========================================================
   RENDER CART
   ========================================================= */

function renderCart(){

    const root =
        document.getElementById('cartArea');

    const cart =
        getCart();


    if(!cart.length){

        root.innerHTML = `

        <div class="empty-cart">

            <div>🛒</div>

            <h2>
                Your cart is empty
            </h2>

            <p>
                Looks like you haven't added anything yet.
            </p>

            <a
                class="btn primary"
                href="products.html"
            >
                Start shopping
            </a>

        </div>

        `;

        return;
    }


    let subtotal = 0;


    const rows =
        cart.map(i => {

            const p =
                PRODUCTS.find(
                    x => x.id === i.id
                );


            if(!p) return '';


            subtotal +=
                p.price * i.qty;


            return `

            <div class="cart-item">

                <img
                    src="${p.img}"
                    alt="${escapeCheckout(p.name)}"
                >

                <div class="cart-item-info">

                    <small>
                        ${escapeCheckout(p.cat)}
                    </small>

                    <h3>
                        ${escapeCheckout(p.name)}
                    </h3>

                    <div class="cart-price">
                        ${money(p.price)}
                    </div>

                    <button
                        class="remove"
                        onclick="removeItem(${p.id})"
                    >
                        Remove
                    </button>

                </div>


                <div class="qty">

                    <button
                        onclick="changeCartQty(${p.id},-1)"
                    >
                        −
                    </button>

                    <b>
                        ${i.qty}
                    </b>

                    <button
                        onclick="changeCartQty(${p.id},1)"
                    >
                        +
                    </button>

                </div>


                <b class="line-total">
                    ${money(p.price * i.qty)}
                </b>

            </div>

            `;

        }).join('');


    const delivery =
        subtotal >= 999
            ? 0
            : 99;


    const total =
        subtotal + delivery;


    root.innerHTML = `

    <div class="cart-layout">

        <section>

            <div class="cart-box">

                ${rows}

            </div>

            <a
                class="continue"
                href="products.html"
            >
                ← Continue shopping
            </a>

        </section>


        <aside class="summary">

            <h2>
                Order summary
            </h2>


            <div>

                <span>
                    Subtotal
                </span>

                <b>
                    ${money(subtotal)}
                </b>

            </div>


            <div>

                <span>
                    Delivery
                </span>

                <b>
                    ${delivery ? '₹99' : 'FREE'}
                </b>

            </div>


            <hr>


            <div class="grand">

                <span>
                    Total
                </span>

                <b>
                    ${money(total)}
                </b>

            </div>


            ${renderCheckoutAddress()}

        </aside>

    </div>
    `;


    const orderBtn =
        document.querySelector(
            '.checkout-form .btn.primary.full:last-child'
        );


    if(orderBtn){

        orderBtn.textContent =
            `Place order · ${money(total)}`;

    }
}


/* =========================================================
   QUANTITY
   ========================================================= */

function changeCartQty(id,n){

    const c =
        getCart();

    const x =
        c.find(i => i.id === id);


    if(!x) return;


    x.qty += n;


    if(x.qty <= 0){

        c.splice(
            c.indexOf(x),
            1
        );

    }


    saveCart(c);

    renderCart();
}


/* =========================================================
   REMOVE ITEM
   ========================================================= */

function removeItem(id){

    saveCart(
        getCart().filter(
            x => x.id !== id
        )
    );

    renderCart();

    toast('Item removed');
}


/* =========================================================
   PLACE ORDER
   ========================================================= */

function placeOrder(){

    const user =
        getSignedInUser();


    const cart =
        getCart();


    if(!cart.length){

        toast(
            'Your cart is empty'
        );

        return;
    }


    let orderData;


    /* =====================================================
       SIGNED-IN USER
       ===================================================== */

    if(user){

        const addresses =
            getSavedAddressesForCheckout();


        const selected =
            document.querySelector(
                'input[name="checkoutAddress"]:checked'
            );


        if(!selected){

            toast(
                'Please add and select a delivery address from Account'
            );

            return;
        }


        const a =
            addresses[selected.value];


        if(!a){

            toast(
                'Selected address is no longer available'
            );

            return;
        }


        orderData = {

            name: a.name,

            ph: a.mobile,

            a: formatSavedAddress(a),

            email: a.email,

            addressType:
                selected.value,

            payment:
                document.getElementById(
                    'payment'
                ).value

        };

    }


    /* =====================================================
       GUEST USER
       ===================================================== */

    else{

        const nameInput =
            document.getElementById(
                'orderName'
            );

        const phoneInput =
            document.getElementById(
                'orderPhone'
            );

        const addressInput =
            document.getElementById(
                'orderAddress'
            );


        const n =
            nameInput
                ? nameInput.value.trim()
                : '';


        const ph =
            phoneInput
                ? phoneInput.value.trim()
                : '';


        const a =
            addressInput
                ? addressInput.value.trim()
                : '';


        if(
            !n ||
            !/^[0-9]{10}$/.test(ph) ||
            !a
        ){

            toast(
                'Please complete your delivery details'
            );

            return;
        }


        orderData = {

            name: n,

            ph: ph,

            a: a,

            email: '',

            addressType: 'guest',

            payment:
                document.getElementById(
                    'payment'
                ).value

        };

    }


    /* =====================================================
       PRODUCTS IN ORDER
       ===================================================== */

    let subtotal = 0;


    const orderItems =
        cart
            .map(item => {

                const product =
                    PRODUCTS.find(
                        p => p.id === item.id
                    );


                if(!product){
                    return null;
                }


                subtotal +=
                    product.price *
                    item.qty;


                return {

                    id: item.id,

                    name: product.name,

                    price: product.price,

                    qty: item.qty,

                    image: product.img

                };

            })
            .filter(Boolean);


    const delivery =
        subtotal >= 999
            ? 0
            : 99;


    const total =
        subtotal + delivery;


    /* =====================================================
       CREATE ORDER ID
       ===================================================== */

    const order =
        'PH' +
        Date.now()
            .toString()
            .slice(-8);


    /* =====================================================
       COMPLETE ORDER OBJECT
       ===================================================== */

    const newOrder = {

        order: order,

        ...orderData,

        date:
            new Date()
                .toLocaleString(),

        items:
            orderItems,

        subtotal:
            subtotal,

        delivery:
            delivery,

        total:
            total,

        status:
            'Order Placed'

    };


    /* =====================================================
       SAVE ALL ORDERS
       ===================================================== */

    const existingOrders =
        JSON.parse(
            localStorage.getItem(
                'perfectHomeOrders'
            ) || '[]'
        );


    existingOrders.unshift(
        newOrder
    );


    localStorage.setItem(
        'perfectHomeOrders',
        JSON.stringify(
            existingOrders
        )
    );


    /* Keep latest order */

    localStorage.setItem(
        'perfectHomeLastOrder',
        JSON.stringify(
            newOrder
        )
    );


    /* Empty cart */

    localStorage.setItem(
        'perfectHomeCart',
        '[]'
    );


    /* =====================================================
       SUCCESS SCREEN
       ===================================================== */

    document.getElementById(
        'cartArea'
    ).innerHTML = `

    <div class="success-order">

        <div class="check">
            ✓
        </div>

        <p class="eyebrow">
            ORDER CONFIRMED
        </p>

        <h1>
            Thank you,
            ${escapeCheckout(
                orderData.name
                    .split(' ')[0]
            )}!
        </h1>

        <p>
            Your Perfect Home order
            <b>#${order}</b>
            has been placed successfully.
        </p>

        <p>
            Total:
            <b>
                ${money(total)}
            </b>
        </p>

        <p>
            Delivery to your
            <b>
                ${
                    orderData.addressType === 'office'
                    ? 'Office'
                    : 'Home'
                }
            </b>
            address.
        </p>

        <p>
            We'll contact you on
            <b>
                ${escapeCheckout(orderData.ph)}
            </b>
            before delivery.
        </p>


        <div
            style="
                display:flex;
                gap:10px;
                justify-content:center;
                flex-wrap:wrap;
                margin-top:20px;
            "
        >

            <a
                class="btn primary"
                href="account.html"
            >
                View My Orders
            </a>

            <a
                class="btn dark"
                href="products.html"
            >
                Continue Shopping
            </a>

        </div>

    </div>

    `;


    updateCartCount();
}


/* =========================================================
   START
   ========================================================= */

document.addEventListener(
    'DOMContentLoaded',
    () => {

        if(
            document.getElementById(
                'cartArea'
            )
        ){

            renderCart();

        }

    }
);
