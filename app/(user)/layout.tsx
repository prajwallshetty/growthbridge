import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { getSettings } from "@/lib/actions/cms";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings().catch(() => null);
  
  const title = settings?.seoDefaultTitle || "Growth Bridge — Creative Digital Agency in Mangalore";
  const desc = settings?.seoDefaultDescription || "Helping ambitious businesses build, launch and scale digital experiences. Premium websites, AI automation, brand systems, and digital products in Mangalore, India.";
  
  const keywords = [
  // Agency
  "creative digital agency mangalore",
  "creative agency mangalore",
  "digital agency mangalore",
  "digital agency mangaluru",
  "best digital agency mangalore",
  "branding agency mangalore",
  "marketing agency mangalore",
  "full service digital agency mangalore",

  // Web Development
  "web development company mangalore",
  "web development company mangaluru",
  "website development mangalore",
  "website development company mangalore",
  "custom web development mangalore",
  "business website development mangalore",
  "corporate website design mangalore",
  "ecommerce website development mangalore",
  "shopify development mangalore",
  "wordpress development mangalore",
  "react js development mangalore",
  "next js development mangalore",
  "mern stack development mangalore",
  "web application development mangalore",
  "responsive website design mangalore",
  "website redesign mangalore",
  "landing page design mangalore",

  // Web Design
  "web design services mangalore",
  "web design services mangaluru",
  "website designer mangalore",
  "professional website designer mangalore",
  "custom website design mangalore",
  "modern web design mangalore",
  "startup website design mangalore",
  "portfolio website design mangalore",

  // Software Development
  "software development in mangalore",
  "software company mangalore",
  "software development company mangalore",
  "custom software development mangalore",
  "enterprise software development mangalore",
  "saas development mangalore",
  "crm development mangalore",
  "erp software development mangalore",
  "mobile app development mangalore",
  "android app development mangalore",
  "ios app development mangalore",

  // UI UX
  "ui ux design mangalore",
  "ui ux designer mangalore",
  "ux research mangalore",
  "product design mangalore",
  "app ui design mangalore",
  "website ui ux design mangalore",
  "figma designer mangalore",
  "wireframing services mangalore",
  "prototype design mangalore",

  // SEO
  "seo company mangalore",
  "seo agency mangalore",
  "local seo services mangalore",
  "technical seo mangalore",
  "seo expert mangalore",
  "seo consultant mangalore",
  "google ranking services mangalore",
  "search engine optimization mangalore",
  "organic seo mangalore",

  // Digital Marketing
  "digital marketing mangalore",
  "digital marketing agency mangalore",
  "online marketing mangalore",
  "performance marketing mangalore",
  "social media marketing mangalore",
  "facebook ads agency mangalore",
  "instagram marketing mangalore",
  "google ads agency mangalore",
  "ppc services mangalore",
  "content marketing mangalore",
  "email marketing mangalore",

  // Branding
  "brand systems design",
  "branding services mangalore",
  "brand identity design mangalore",
  "logo design mangalore",
  "visual identity design mangalore",
  "brand strategy mangalore",
  "corporate branding mangalore",
  "rebranding services mangalore",

  // AI
  "ai automation agency mangalore",
  "ai agency mangalore",
  "ai development company mangalore",
  "chatbot development mangalore",
  "ai chatbot services mangalore",
  "business automation mangalore",
  "workflow automation mangalore",
  "ai integration services mangalore",
  "openai integration mangalore",
  "generative ai development mangalore",
  "llm development mangalore",
  "ai consulting mangalore",

  // E-commerce
  "ecommerce development mangalore",
  "shopify agency mangalore",
  "woocommerce development mangalore",
  "online store development mangalore",
  "ecommerce website design mangalore",

  // Startup
  "startup branding mangalore",
  "startup website development mangalore",
  "startup marketing agency mangalore",
  "mvp development mangalore",
  "product development mangalore",

  // Industries
  "real estate website development mangalore",
  "restaurant website design mangalore",
  "hospital website development mangalore",
  "education website development mangalore",
  "hotel website development mangalore",
  "manufacturing software mangalore",

  // Local Variants
  "best web development company in mangalore",
  "best web design company in mangalore",
  "best seo company in mangalore",
  "best software company in mangalore",
  "best digital marketing agency in mangalore",
  "top web development company mangalore",
  "top digital agency mangalore",
  "website company near me",
  "digital marketing near me",
  "web designer near me",

  // Technology
  "react development company mangalore",
  "nextjs development company mangalore",
  "node js development mangalore",
  "python development company mangalore",
  "javascript development mangalore",
  "api development mangalore",
  "cloud application development mangalore",
  "database development mangalore",

  // Misc
  "website maintenance mangalore",
  "website hosting mangalore",
  "domain registration mangalore",
  "website speed optimization mangalore",
  "conversion rate optimization mangalore",
  "website audit mangalore",
  "digital transformation company mangalore",
  "business automation solutions mangalore",
  "technology consulting mangalore",
  "creative studio mangalore"
];

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://growthbridge.live";

  return {
    metadataBase: new URL(baseUrl),
    title,
    description: desc,
    keywords,
    openGraph: {
      title,
      description: desc,
      type: "website",
      images: [
        {
          url: "/opengraph-image.png",
          width: 1200,
          height: 630,
          alt: "Growth Bridge — Creative Digital Agency",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      images: ["/opengraph-image.png"],
    },
  };
}

export default async function UserRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSettings().catch(() => null);

  const schemaJson = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "name": "Growth Bridge",
    "image": "https://growthbridge.live/opengraph-image.png",
    "@id": "https://growthbridge.live/#website",
    "url": "https://growthbridge.live",
    "telephone": settings?.phoneNumber || "+91 62827 59863",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": settings?.officeAddress || "Near NMPT Gate, Jappinamogaru, NH 66 Byepass, Mangaluru",
      "addressLocality": "Mangalore",
      "addressRegion": "Karnataka",
      "postalCode": "575002",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 12.9141,
      "longitude": 74.8560
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
      ],
      "opens": "09:00",
      "closes": "18:00"
    },
    "sameAs": [
      settings?.socialTwitter || "https://twitter.com/growthbridge",
      settings?.socialLinkedin || "https://www.linkedin.com/company/growth-bridge-global",
      settings?.socialGithub || "https://github.com/growthbridge"
    ].filter(Boolean)
  };

  return (
    <html lang="en" className={inter.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJson) }}
        />
      </head>
      <body className={`${inter.className} antialiased min-h-screen bg-[#FCFBF8] text-[#111111]`}>
        {settings?.maintenanceMode ? (
          <div className="min-h-screen flex flex-col lg:flex-row items-center justify-center p-6 md:p-12 relative overflow-hidden gap-12 lg:gap-16 w-full">
            {/* background design rays */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(244,197,66,0.06)_0%,_transparent_60%)] pointer-events-none" />

            {/* Left Text Block */}
            <div className="max-w-[480px] w-full relative z-20 flex flex-col items-center lg:items-start text-center lg:text-left shrink-0">
              {/* Glowing indicator */}
              <div className="flex items-center gap-2 mb-6">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F4C542] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#F4C542]"></span>
                </span>
                <span className="text-[12px] font-extrabold uppercase tracking-[0.15em] text-[#6A6A6A]">Growth Bridge Maintenance</span>
              </div>

              <h1 className="text-[clamp(32px,5vw,48px)] font-extrabold tracking-tight leading-[1.1]">
                Refining our
                <br />
                digital spaces.
              </h1>

              <p className="mt-5 text-[15px] leading-[1.65] text-[#6A6A6A] font-medium">
                We are performing scheduled updates and tuning our infrastructure. We'll be back online shortly. For urgent inquiries, reach out directly.
              </p>

              <div className="mt-8 pt-6 border-t border-[#E9E3DA] w-full flex flex-col gap-1.5 text-[13px] font-semibold text-[#6A6A6A]">
                <span>Email: <a href={`mailto:${settings?.contactEmail || "hello@growthbridge.live"}`} className="text-[#111111] hover:underline font-bold">{settings?.contactEmail || "hello@growthbridge.live"}</a></span>
                <span>Phone: <span className="text-[#111111] font-bold">{settings?.phoneNumber || "+91 62827 59863"}</span></span>
              </div>
            </div>

            {/* Right Image Block */}
            <div className="max-w-[500px] w-full relative z-20 flex justify-center float-gentle shrink-0">
              <div className="relative w-full aspect-square rounded-[36px] bg-[#FCFBF8] border border-[#E9E3DA] p-6 shadow-[0_15px_45px_rgba(0,0,0,0.03)] flex items-center justify-center overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/maintenance.png"
                  alt="Growth Bridge System Maintenance"
                  className="w-full h-full object-contain rounded-[20px]"
                />
              </div>
            </div>
          </div>
        ) : (
          children
        )}
      </body>
    </html>
  );
}
