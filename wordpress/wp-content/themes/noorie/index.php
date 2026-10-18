<?php get_header(); ?>
<main class="site-main max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <?php if (have_posts()) : ?><header class="mb-10">
            <h1 class="font-headline text-5xl uppercase"><?php single_post_title(); ?></h1>
        </header>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8"><?php while (have_posts()) : the_post(); ?><article <?php post_class('glass-card rounded-2xl p-6'); ?>><?php if (has_post_thumbnail()) the_post_thumbnail('large', array('class' => 'rounded-xl mb-5')); ?><h2 class="font-headline text-2xl uppercase"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
                    <div class="text-sm text-emeraldMid mt-2"><?php echo esc_html(get_the_date()); ?></div>
                    <div class="mt-4"><?php the_excerpt(); ?></div>
                </article><?php endwhile; ?></div>
        <div class="mt-10"><?php the_posts_pagination(); ?></div><?php else : ?><p><?php esc_html_e('Nothing found.', 'noorie'); ?></p><?php endif; ?>
</main><?php get_footer(); ?>