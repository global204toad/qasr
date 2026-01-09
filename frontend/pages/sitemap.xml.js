// Dynamic sitemap generation for SEO
import { productsAPI } from '../../lib/api';
import { SITE_CONFIG } from '../../lib/seo';

function generateSiteMap(products) {
    const baseUrl = SITE_CONFIG.siteUrl;

    return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
           xmlns:xhtml="http://www.w3.org/1999/xhtml">
     <!-- Homepage -->
     <url>
       <loc>${baseUrl}</loc>
       <lastmod>${new Date().toISOString()}</lastmod>
       <changefreq>daily</changefreq>
       <priority>1.0</priority>
       <xhtml:link rel="alternate" hreflang="ar" href="${baseUrl}"/>
       <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/en"/>
     </url>
     
     <!-- Products Page -->
     <url>
       <loc>${baseUrl}/products</loc>
       <lastmod>${new Date().toISOString()}</lastmod>
       <changefreq>daily</changefreq>
       <priority>0.9</priority>
       <xhtml:link rel="alternate" hreflang="ar" href="${baseUrl}/products"/>
       <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/en/products"/>
     </url>
     
     <!-- About Page -->
     <url>
       <loc>${baseUrl}/about</loc>
       <lastmod>${new Date().toISOString()}</lastmod>
       <changefreq>monthly</changefreq>
       <priority>0.7</priority>
     </url>
     
     <!-- Contact Page -->
     <url>
       <loc>${baseUrl}/contact</loc>
       <lastmod>${new Date().toISOString()}</lastmod>
       <changefreq>monthly</changefreq>
       <priority>0.7</priority>
     </url>
     
     <!-- SEO Landing Pages -->
     <url>
       <loc>${baseUrl}/maksrat</loc>
       <lastmod>${new Date().toISOString()}</lastmod>
       <changefreq>weekly</changefreq>
       <priority>0.8</priority>
     </url>
     
     <url>
       <loc>${baseUrl}/m7msa</loc>
       <lastmod>${new Date().toISOString()}</lastmod>
       <changefreq>weekly</changefreq>
       <priority>0.8</priority>
     </url>
     
     <url>
       <loc>${baseUrl}/qasr-nuts</loc>
       <lastmod>${new Date().toISOString()}</lastmod>
       <changefreq>weekly</changefreq>
       <priority>0.8</priority>
     </url>
     
     <!-- Individual Product Pages -->
     ${products
            .map((product) => {
                return `
       <url>
         <loc>${baseUrl}/products/${product._id}</loc>
         <lastmod>${product.updatedAt || new Date().toISOString()}</lastmod>
         <changefreq>weekly</changefreq>
         <priority>0.8</priority>
         <xhtml:link rel="alternate" hreflang="ar" href="${baseUrl}/products/${product._id}"/>
         <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/en/products/${product._id}"/>
       </url>
     `;
            })
            .join('')}
   </urlset>
 `;
}

export async function getServerSideProps({ res }) {
    try {
        // Fetch all products
        const response = await productsAPI.getAll({ limit: 1000 });
        const products = response.data.data || [];

        // Generate the XML sitemap
        const sitemap = generateSiteMap(products);

        res.setHeader('Content-Type', 'text/xml');
        res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate');
        res.write(sitemap);
        res.end();

        return {
            props: {},
        };
    } catch (error) {
        console.error('Error generating sitemap:', error);

        // Return a basic sitemap even if there's an error
        const basicSitemap = generateSiteMap([]);
        res.setHeader('Content-Type', 'text/xml');
        res.write(basicSitemap);
        res.end();

        return {
            props: {},
        };
    }
}

// Default export to prevent Next.js errors
export default function Sitemap() {
    return null;
}
