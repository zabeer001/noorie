<?php
if (! defined('ABSPATH')) exit;

function noorie_setup()
{
    load_theme_textdomain('noorie', get_template_directory() . '/languages');
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('custom-logo', array('height' => 80, 'width' => 240, 'flex-height' => true, 'flex-width' => true));
    add_theme_support('woocommerce');
    add_theme_support('wc-product-gallery-zoom');
    add_theme_support('wc-product-gallery-lightbox');
    add_theme_support('wc-product-gallery-slider');
    register_nav_menus(array('primary' => __('Primary Menu', 'noorie'), 'footer' => __('Footer Menu', 'noorie')));
}
add_action('after_setup_theme', 'noorie_setup');

function noorie_assets()
{
    // The approved landing page is self-contained so its exact styling and
    // interactions are not changed by the shared WooCommerce theme assets.
    if (is_front_page()) {
        if (class_exists('WooCommerce')) {
            wp_enqueue_script('wc-add-to-cart');
            wp_enqueue_script('wc-cart-fragments');
            wp_enqueue_script(
                'noorie-storefront',
                get_template_directory_uri() . '/assets/js/storefront.js',
                array('jquery', 'wc-add-to-cart', 'wc-cart-fragments'),
                wp_get_theme()->get('Version'),
                true
            );
            wp_add_inline_script(
                'noorie-storefront',
                'window.NOORIE_STORE = ' . wp_json_encode(noorie_get_storefront_data()) . ';',
                'before'
            );
        }
        return;
    }
    wp_enqueue_style('noorie-fonts', 'https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@300;400;500;600;700&display=swap', array(), null);
    wp_enqueue_style('noorie-icons', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css', array(), '6.4.0');
    wp_enqueue_script('tailwind', 'https://cdn.tailwindcss.com', array(), null, false);
    wp_add_inline_script('tailwind', "tailwind.config={theme:{extend:{colors:{emeraldDeep:'#042b1f',emeraldDark:'#063e2c',emeraldMid:'#0b6649',emeraldBright:'#10b981',emeraldLight:'#e6f4f0',offWhite:'#f8faf9'},fontFamily:{headline:['Anton','sans-serif'],body:['Inter','sans-serif']}}}};", 'before');
    wp_enqueue_style('noorie-style', get_stylesheet_uri(), array(), wp_get_theme()->get('Version'));
    wp_enqueue_script('noorie-theme', get_template_directory_uri() . '/assets/js/theme.js', array(), wp_get_theme()->get('Version'), true);
}
add_action('wp_enqueue_scripts', 'noorie_assets');

function noorie_cart_count()
{
    return function_exists('WC') && WC()->cart ? WC()->cart->get_cart_contents_count() : 0;
}
function noorie_cart_fragments($fragments)
{
    ob_start(); ?><span class="noorie-cart-count absolute -top-1 -right-1 bg-emeraldBright text-emeraldDeep font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white"><?php echo esc_html(noorie_cart_count()); ?></span><?php
                                                                                                                                                                                                                                                                    $fragments['span.noorie-cart-count'] = ob_get_clean();
                                                                                                                                                                                                                                                                    $fragments['#cartCountBadge'] = '<span id="cartCountBadge" class="bg-white text-emerald-900 px-2 py-0.5 rounded-full text-xs font-extrabold">' . esc_html(noorie_cart_count()) . '</span>';
                                                                                                                                                                                                                                                                    return $fragments;
                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                add_filter('woocommerce_add_to_cart_fragments', 'noorie_cart_fragments');

function noorie_body_classes($classes)
{
    if (! is_front_page()) {
        $classes[] = 'bg-offWhite text-emeraldDeep antialiased';
    }
    return $classes;
}
                                                                                                                                                                                                                                                                add_filter('body_class', 'noorie_body_classes');

                                                                                                                                                                                                                                                                function noorie_woocommerce_wrapper_start()
                                                                                                                                                                                                                                                                {
                                                                                                                                                                                                                                                                    echo '<main class="site-main max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">';
                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                function noorie_woocommerce_wrapper_end()
                                                                                                                                                                                                                                                                {
                                                                                                                                                                                                                                                                    echo '</main>';
                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                remove_action('woocommerce_before_main_content', 'woocommerce_output_content_wrapper', 10);
                                                                                                                                                                                                                                                                remove_action('woocommerce_after_main_content', 'woocommerce_output_content_wrapper_end', 10);
                                                                                                                                                                                                                                                                add_action('woocommerce_before_main_content', 'noorie_woocommerce_wrapper_start', 10);
                                                                                                                                                                                                                                                                add_action('woocommerce_after_main_content', 'noorie_woocommerce_wrapper_end', 10);
                                                                                                                                                                                                                                                                function noorie_customize_register($customizer)
                                                                                                                                                                                                                                                                {
                                                                                                                                                                                                                                                                    $customizer->add_section('noorie_store', array('title' => __('Noorie Storefront', 'noorie'), 'priority' => 30));
                                                                                                                                                                                                                                                                    $customizer->add_setting('noorie_announcement', array('default' => 'Complimentary Shipping Across Bangladesh on Orders Over ৳4,000', 'sanitize_callback' => 'sanitize_text_field'));
                                                                                                                                                                                                                                                                    $customizer->add_control('noorie_announcement', array('label' => __('Announcement', 'noorie'), 'section' => 'noorie_store'));
                                                                                                                                                                                                                                                                    $customizer->add_setting('noorie_hero_image', array('sanitize_callback' => 'esc_url_raw'));
                                                                                                                                                                                                                                                                    $customizer->add_control(new WP_Customize_Image_Control($customizer, 'noorie_hero_image', array('label' => __('Hero image', 'noorie'), 'section' => 'noorie_store')));
                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                add_action('customize_register', 'noorie_customize_register');

/**
 * Convert a WooCommerce product into safe data for the homepage storefront.
 */
function noorie_storefront_product($product)
{
    if (! $product instanceof WC_Product) {
        return null;
    }

    $terms = get_the_terms($product->get_id(), 'product_cat');
    $categories = array();
    if (is_array($terms)) {
        foreach ($terms as $term) {
            $categories[] = array(
                'id'   => (int) $term->term_id,
                'name' => $term->name,
                'slug' => $term->slug,
            );
        }
    }

    $image_id = $product->get_image_id();
    $image = $image_id ? wp_get_attachment_image_url($image_id, 'woocommerce_single') : wc_placeholder_img_src('woocommerce_single');
    $attributes = array();
    $variations = array();

    if ($product->is_type('variable')) {
        foreach ($product->get_variation_attributes() as $attribute_name => $options) {
            $attributes[] = array(
                'name'    => wc_attribute_label($attribute_name, $product),
                'key'     => wc_variation_attribute_name($attribute_name),
                'options' => array_values(array_map('strval', $options)),
            );
        }

        foreach ($product->get_available_variations('objects') as $variation) {
            $variation_image_id = $variation->get_image_id();
            $variations[] = array(
                'id'          => $variation->get_id(),
                'attributes'  => $variation->get_variation_attributes(),
                'price_html'  => $variation->get_price_html(),
                'image'       => $variation_image_id ? wp_get_attachment_image_url($variation_image_id, 'woocommerce_single') : $image,
                'purchasable' => $variation->is_purchasable() && $variation->is_in_stock(),
            );
        }
    }

    $description = $product->get_short_description() ?: $product->get_description();

    return array(
        'id'          => $product->get_id(),
        'name'        => $product->get_name(),
        'type'        => $product->get_type(),
        'url'         => $product->get_permalink(),
        'image'       => $image,
        'price_html'  => $product->get_price_html(),
        'description' => wp_trim_words(wp_strip_all_tags($description), 24),
        'categories'  => $categories,
        'stock'       => $product->get_stock_status(),
        'purchasable' => $product->is_purchasable() && $product->is_in_stock(),
        'featured'    => $product->is_featured(),
        'attributes'  => $attributes,
        'variations'  => $variations,
    );
}

/**
 * Return all public product/category/cart data consumed by the homepage.
 */
function noorie_get_storefront_data()
{
    $products = array();
    $categories = array();

    if (class_exists('WooCommerce')) {
        $objects = wc_get_products(
            array(
                'status'  => 'publish',
                'limit'   => -1,
                'orderby' => 'menu_order',
                'order'   => 'ASC',
            )
        );

        usort($objects, static function ($a, $b) {
            $menu_order = $a->get_menu_order() <=> $b->get_menu_order();
            if (0 !== $menu_order) {
                return $menu_order;
            }
            $a_date = $a->get_date_created();
            $b_date = $b->get_date_created();
            return ($b_date ? $b_date->getTimestamp() : 0) <=> ($a_date ? $a_date->getTimestamp() : 0);
        });

        foreach ($objects as $product) {
            $data = noorie_storefront_product($product);
            if ($data) {
                $products[] = $data;
                foreach ($data['categories'] as $category) {
                    $categories[$category['slug']] = $category;
                }
            }
        }
    }

    uasort($categories, static function ($a, $b) {
        return strcasecmp($a['name'], $b['name']);
    });

    return array(
        'products'      => $products,
        'categories'    => array_values($categories),
        'cart_count'    => noorie_cart_count(),
        'cart_url'      => function_exists('wc_get_cart_url') ? wc_get_cart_url() : home_url('/cart/'),
        'checkout_url'  => function_exists('wc_get_checkout_url') ? wc_get_checkout_url() : home_url('/checkout/'),
        'ajax_url'      => admin_url('admin-ajax.php'),
        'wc_ajax_url'   => class_exists('WC_AJAX') ? WC_AJAX::get_endpoint('%%endpoint%%') : home_url('/?wc-ajax=%%endpoint%%'),
        'cart_nonce'    => wp_create_nonce('noorie-cart'),
        'cart_html'     => noorie_get_cart_panel_html(),
        'currency_code' => function_exists('get_woocommerce_currency') ? get_woocommerce_currency() : 'BDT',
    );
}

/**
 * Render the live cart drawer panel used initially and in cart fragments.
 */
function noorie_get_cart_panel_html()
{
    ob_start();
    ?>
    <div id="noorieCartContents" class="bg-white w-full max-w-md h-full flex flex-col justify-between border-l-2 border-emerald-300 shadow-2xl p-6 overflow-y-auto">
        <div>
            <div class="flex items-center justify-between pb-4 border-b border-emerald-200">
                <div><span class="font-anton text-2xl text-emerald-950">YOUR BAG</span><p class="text-[10px] font-bold tracking-widest text-emerald-700">LIVE WOOCOMMERCE CART</p></div>
                <button type="button" id="closeCartBtn" class="btn-glass-white w-9 h-9 rounded-full font-bold" aria-label="<?php esc_attr_e('Close cart', 'noorie'); ?>">✕</button>
            </div>
            <div id="cartItemsList" class="py-4 space-y-3">
                <?php if (function_exists('WC') && WC()->cart && ! WC()->cart->is_empty()) : ?>
                    <?php foreach (WC()->cart->get_cart() as $cart_item_key => $cart_item) :
                        $product = $cart_item['data'];
                        if (! $product || ! $product->exists()) continue;
                        $image = $product->get_image('woocommerce_thumbnail', array('class' => 'w-full h-full object-cover'));
                        ?>
                        <div class="glass-card rounded-2xl p-3 flex items-center gap-3" data-cart-key="<?php echo esc_attr($cart_item_key); ?>">
                            <a href="<?php echo esc_url($product->get_permalink($cart_item)); ?>" class="w-14 h-16 rounded-xl overflow-hidden bg-emerald-50 shrink-0"><?php echo wp_kses_post($image); ?></a>
                            <div class="min-w-0 flex-1"><a href="<?php echo esc_url($product->get_permalink($cart_item)); ?>" class="font-anton text-sm text-emerald-950 block truncate"><?php echo esc_html($product->get_name()); ?></a><div class="text-[11px] text-emerald-700"><?php echo wp_kses_post(wc_get_formatted_cart_item_data($cart_item)); ?></div><div class="font-anton text-sm text-emerald-800 mt-1"><?php echo wp_kses_post(WC()->cart->get_product_subtotal($product, $cart_item['quantity'])); ?></div></div>
                            <div class="flex items-center gap-1"><button type="button" data-cart-qty="<?php echo esc_attr($cart_item_key); ?>" data-qty="<?php echo esc_attr(max(0, $cart_item['quantity'] - 1)); ?>" class="btn-glass-white w-7 h-7 rounded-lg font-anton text-xs">−</button><span class="font-anton text-xs w-5 text-center"><?php echo esc_html($cart_item['quantity']); ?></span><button type="button" data-cart-qty="<?php echo esc_attr($cart_item_key); ?>" data-qty="<?php echo esc_attr($cart_item['quantity'] + 1); ?>" class="btn-glass-white w-7 h-7 rounded-lg font-anton text-xs">+</button></div>
                        </div>
                    <?php endforeach; ?>
                <?php else : ?>
                    <div class="text-center py-10"><div class="font-anton text-xl text-emerald-900">YOUR BAG IS EMPTY</div><p class="text-xs text-emerald-700 font-semibold mt-2">Add a product to begin your order.</p></div>
                <?php endif; ?>
            </div>
        </div>
        <div class="pt-4 border-t border-emerald-200 space-y-4">
            <div class="flex justify-between items-center bg-emerald-50 rounded-2xl p-4 border border-emerald-200"><span class="font-anton text-lg text-emerald-950">SUBTOTAL</span><span class="font-anton text-xl text-emerald-700"><?php echo function_exists('WC') && WC()->cart ? wp_kses_post(WC()->cart->get_cart_subtotal()) : esc_html(wc_price(0)); ?></span></div>
            <a href="<?php echo esc_url(wc_get_checkout_url()); ?>" class="btn-glass-emerald w-full py-3.5 rounded-full font-anton text-base tracking-wider flex justify-center">SECURE CHECKOUT</a>
            <a href="<?php echo esc_url(wc_get_cart_url()); ?>" class="btn-glass-white w-full py-3 rounded-full font-anton text-sm tracking-wider flex justify-center">VIEW CART</a>
        </div>
    </div>
    <?php
    return ob_get_clean();
}

function noorie_storefront_cart_fragments($fragments)
{
    $fragments['#noorieCartContents'] = noorie_get_cart_panel_html();
    return $fragments;
}
add_filter('woocommerce_add_to_cart_fragments', 'noorie_storefront_cart_fragments');

function noorie_update_cart_quantity()
{
    check_ajax_referer('noorie-cart', 'nonce');
    if (! function_exists('WC') || ! WC()->cart) {
        wp_send_json_error(array('message' => __('Cart is unavailable.', 'noorie')), 400);
    }

    $key = isset($_POST['cart_key']) ? wc_clean(wp_unslash($_POST['cart_key'])) : '';
    $quantity = isset($_POST['quantity']) ? max(0, wc_stock_amount(wp_unslash($_POST['quantity']))) : 0;
    if (! $key || ! isset(WC()->cart->get_cart()[$key])) {
        wp_send_json_error(array('message' => __('Cart item was not found.', 'noorie')), 404);
    }

    WC()->cart->set_quantity($key, $quantity, true);
    wp_send_json_success(
        array(
            'count' => WC()->cart->get_cart_contents_count(),
            'html'  => noorie_get_cart_panel_html(),
        )
    );
}
add_action('wp_ajax_noorie_update_cart', 'noorie_update_cart_quantity');
add_action('wp_ajax_nopriv_noorie_update_cart', 'noorie_update_cart_quantity');

/**
 * Add a selected variation while retaining values for wildcard attributes.
 */
function noorie_add_variable_to_cart()
{
    check_ajax_referer('noorie-cart', 'nonce');

    $product_id = isset($_POST['product_id']) ? absint($_POST['product_id']) : 0;
    $variation_id = isset($_POST['variation_id']) ? absint($_POST['variation_id']) : 0;
    $product = wc_get_product($product_id);
    $variation_product = wc_get_product($variation_id);

    if (! $product || ! $product->is_type('variable') || ! $variation_product || ! $variation_product->is_type('variation') || $variation_product->get_parent_id() !== $product_id) {
        wp_send_json_error(array('message' => __('Invalid product variation.', 'noorie')), 400);
    }

    $selected = array();
    foreach ($product->get_variation_attributes() as $attribute_name => $options) {
        $key = wc_variation_attribute_name($attribute_name);
        $value = isset($_POST[$key]) ? wc_clean(wp_unslash($_POST[$key])) : '';
        if ('' === $value) {
            wp_send_json_error(array('message' => __('Please select every product option.', 'noorie')), 400);
        }
        $selected[$key] = $value;
    }

    if (! WC()->cart->add_to_cart($product_id, 1, $variation_id, $selected)) {
        wp_send_json_error(array('message' => __('This variation could not be added to the cart.', 'noorie')), 400);
    }

    do_action('woocommerce_ajax_added_to_cart', $product_id);
    WC_AJAX::get_refreshed_fragments();
}
add_action('wp_ajax_noorie_add_variable_to_cart', 'noorie_add_variable_to_cart');
add_action('wp_ajax_nopriv_noorie_add_variable_to_cart', 'noorie_add_variable_to_cart');
