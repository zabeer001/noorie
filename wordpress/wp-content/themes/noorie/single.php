<?php get_header(); ?><main class="site-main max-w-4xl mx-auto px-4 py-12"><?php while (have_posts()) : the_post(); ?><article <?php post_class(); ?>>
            <h1 class="font-headline text-5xl uppercase mb-4"><?php the_title(); ?></h1>
            <p class="text-sm text-emeraldMid mb-8"><?php echo esc_html(get_the_date()); ?></p><?php if (has_post_thumbnail()) the_post_thumbnail('large', array('class' => 'rounded-2xl mb-8')); ?><div class="prose max-w-none"><?php the_content(); ?></div>
        </article><?php endwhile; ?></main><?php get_footer(); ?>