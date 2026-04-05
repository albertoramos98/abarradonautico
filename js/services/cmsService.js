import { supabase } from '../lib/supabase.js';

export const cmsService = {
    async getContent() {
        const { data, error } = await supabase
            .from('site_content')
            .select('*');

        if (error) throw error;
        
        return data.reduce((acc, item) => {
            acc[item.key] = item.value;
            return acc;
        }, {});
    }
};
