<!doctype html>
<html <?php language_attributes(); ?>>

<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width,initial-scale=1"><?php wp_head(); ?>
</head>

<body <?php body_class(); ?>><?php wp_body_open(); ?>
    <div class="bg-emeraldDeep text-emeraldLight text-xs py-2 text-center tracking-widest uppercase font-medium"><span class="inline-block animate-pulse mr-2 text-emeraldBright">●</span><?php echo esc_html(get_theme_mod('noorie_announcement', 'Complimentary Shipping Across Bangladesh on Orders Over ৳4,000')); ?> | <strong>NOOR IS NEAR</strong></div>
    <header class="site-header sticky top-0 z-40 glass-panel border-b border-emeraldMid/15">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            <button class="noorie-menu-toggle lg:hidden p-2" aria-expanded="false" aria-controls="primary-menu"><i class="fa-solid fa-bars text-xl"></i><span class="sr-only"><?php esc_html_e('Menu', 'noorie'); ?></span></button>
            <a href="<?php echo esc_url(home_url('/')); ?>" class="flex items-center gap-3 group" aria-label="<?php bloginfo('name'); ?>">
                <?php if (has_custom_logo()) {
                    the_custom_logo();
                } else { ?><svg class="w-9 h-9 text-emeraldDeep" viewBox="0 0 100 100" fill="none">
                        <circle cx="50" cy="50" r="46" stroke="currentColor" stroke-width="5" />
                        <path d="M30 65V35L50 55L70 35V65" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />
                        <circle cx="50" cy="25" r="4" fill="currentColor" />
                    </svg><span><span class="font-headline text-3xl tracking-wider leading-none block"><?php bloginfo('name'); ?></span><span class="text-[9px] font-semibold tracking-[.3em] uppercase text-emeraldMid">NOOR IS NEAR</span></span><?php } ?>
            </a>
            <nav id="primary-menu" class="noorie-nav hidden lg:block"><?php wp_nav_menu(array('theme_location' => 'primary', 'container' => false, 'fallback_cb' => 'noorie_fallback_menu', 'menu_class' => 'flex items-center gap-8 text-sm font-medium tracking-wide uppercase')); ?></nav>
            <div class="flex items-center gap-3">
                <button class="noorie-search-toggle p-2" aria-expanded="false"><i class="fa-solid fa-magnifying-glass"></i><span class="sr-only"><?php esc_html_e('Search', 'noorie'); ?></span></button>
                <?php if (class_exists('WooCommerce')) : ?><a href="<?php echo esc_url(wc_get_cart_url()); ?>" class="relative p-2" aria-label="<?php esc_attr_e('View cart', 'noorie'); ?>"><i class="fa-solid fa-bag-shopping text-xl"></i><span class="noorie-cart-count absolute -top-1 -right-1 bg-emeraldBright text-emeraldDeep font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white"><?php echo esc_html(noorie_cart_count()); ?></span></a><?php endif; ?>
            </div>
        </div>
        <div class="noorie-search hidden border-t border-emeraldMid/10 px-6 py-4">
            <div class="max-w-3xl mx-auto"><?php get_search_form(); ?></div>
        </div>
    </header>
    <?php function noorie_fallback_menu()
    { ?><ul class="flex items-center gap-8 text-sm font-medium tracking-wide uppercase">
            <li><a href="<?php echo esc_url(home_url('/#collection')); ?>">Collection</a></li>
            <li><a href="<?php echo esc_url(home_url('/#lookbook')); ?>">Lookbook</a></li>
            <li><a href="<?php echo esc_url(home_url('/#qa')); ?>">Q&amp;A</a></li>
        </ul><?php } ?>