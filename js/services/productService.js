import { supabase } from '../lib/supabase.js';

export const productService = {
    async getAllActive() {
        const { data, error } = await supabase
            .from('products')
            .select(`
                *,
                inventory (quantity, hide_if_out_of_stock),
                product_images (url, is_main, display_order)
            `)
            .eq('status', 'active')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    async getFeatured() {
        const { data, error } = await supabase
            .from('products')
            .select(`
                *,
                product_images (url, is_main)
            `)
            .eq('status', 'active')
            .eq('is_featured', true)
            .limit(4);

        if (error) throw error;
        return data;
    },

    async save(product) {
        const { data, error } = await supabase
            .from('products')
            .upsert(product)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};
