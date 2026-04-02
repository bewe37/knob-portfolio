// ── Shared portfolio data — used by HardwareBoard and MobileView ──

export interface Section {
  id: string
  title: string
  tech: string
  desc: string
}

export type SectionDetail = Record<string, any>

export const SECTIONS: Section[] = [
  {
    id: 'ABT-00',
    title: 'Georgius Bryan',
    tech: 'PRODUCT DESIGNER',
    desc: "Powerful tools shouldn't require a PhD to operate. That's the gap I close :)",
  },
  {
    id: 'PRJ-01',
    title: 'AMD | Design System',
    tech: 'DESIGN SYSTEM DESIGNER',
    desc: 'Built a scalable design system foundation to support major redesign initiative and ensure long-term consistency across products.',
  },
  {
    id: 'PRJ-02',
    title: 'Safe Software | Platform Modernization',
    tech: 'PRODUCT DESIGN',
    desc: 'Modernizing FME Form through icon system redesign, annotation tools, and a shared design foundation.',
  },
  {
    id: 'PRJ-03',
    title: 'ReGiftCard',
    tech: 'PRODUCT DESIGN',
    desc: 'A dashboard for non-profits to track unused gift cards and replace manual spreadsheet submissions.',
  },
  {
    id: 'PRJ-04',
    title: 'SPATIAL UI',
    tech: 'THREE.JS / REACT / GSAP',
    desc: 'Immersive 3D spatial interface for a data exploration platform. Real-time orbital simulations, procedural geometry, and gesture-driven navigation.',
  },
  {
    id: 'COM-05',
    title: 'Thanks for visiting',
    tech: 'STILL ALIVE & AVAILABLE',
    desc: "You made it to the end. Respect.\nI'm open to full-time roles and fun side projects — if your idea is weird enough, even better.",
  },
]

export const SECTION_DETAILS: SectionDetail[] = [
  {
    cover: '/sqwam.png',
    overview: "Hi, I'm Georgius Bryan Winata — but Bryan works. And yes, Georgius… gorgeous. I've heard it enough times, I'll save you the effort.",
    role: 'Product Designer',
    year: '2020 — Present',
    specs: [],
    sections: [
      {
        label: 'BACKGROUND',
        body: "Growing up, my dad and I would fix whatever broke around the house. Electrical gadgets, wiring, anything that stopped working. I was mostly just handing him tools, but I was always watching, always curious about what was underneath. That habit of needing to understand how something actually works before touching it never really left me.\n\nIt's probably why I ended up in design, and why I lean into the technical side of it more than most. It's also why this portfolio looks the way it does. At some point it just made sense to build it like a piece of hardware rather than another clean white grid.",
      },
      {
        label: 'WHAT PRODUCT DESIGN IS TO ME',
        body: "Making things feel obvious. Not by simplifying everything, but by structuring complexity in a way that people don't have to think about it. I'm drawn to systems with many moving parts, where clarity, hierarchy, and flow matter more than decoration.\n\nI care about the decisions behind the interface. Why something is placed a certain way, why a flow works or breaks, and how small details shape the overall experience.",
      },
      {
        label: 'MY EXPERIENCE',
        experience: [
          { company: 'AMD',           role: 'Product Design Intern', period: "05' — 12' 2025" },
          { company: 'Safe Software', role: 'Product Design Intern', period: "01' — 08' 2024" },
          { company: 'Vosyn',         role: 'Product Design Intern', period: "09' — 12' 2023" },
        ],
      },
      {
        label: 'SAY HELLO TO ME!',
        contacts: [
          { platform: 'Resume',   handle: 'maa resume',              href: 'https://drive.google.com/file/d/1E8AUWkgri9AAHSLil1fQK9KBzZUQbtnK/view?usp=sharingt' },
          { platform: 'Email',    handle: 'bryanwinata112@gmail.com', href: 'mailto:bryanwinata112@gmail.com' },
          { platform: 'LinkedIn', handle: 'linkedin.com/in/gbryanw',  href: 'https://linkedin.com/in/gbryanw' },
          { platform: 'X',        handle: '@gbryanwt',                href: 'https://x.com/gbryanwt' },
        ],
      },
    ],
  },
  {
    cover: '/AMDThumbnailTop.jpg',
    overview: "When I joined AMD's UX team, the product didn't have a shared design foundation. Designers organized files differently, colors were applied inconsistently, and components varied from screen to screen. The team was also preparing for a full software redesign — which meant the inconsistency wasn't just a current problem, it was about to be a much bigger one.\n\nI took on building the design system from the ground up: not as a cleanup effort, but as the structural layer the redesign would be built on top of.",
    role: 'Design System Designer',
    year: '2025',
    specs: [
      { label: 'SCOPE',    value: 'Design System' },
      { label: 'DURATION', value: 'May - December 2025' },
    ],
    sections: [
      {
        label: 'TOKEN ARCHITECTURE',
        images: ['/Tokens1.png', '/ApplyFoundationalDesignTokens.png', '/ColorStructure.png'],
        body: 'Defined a two-tier color system using primitive and semantic tokens, so components reference intent rather than raw hex values. Spacing and radius followed the same logic, built on a 4-point scale.',
      },
      {
        label: 'COMPONENT LIBRARY',
        images: ['/CommonComponents.png', '/Slots.jpg'],
        body: 'Built foundational components starting from buttons and expanded outward as designs were approved. Used a slot-based approach to keep variants flexible without multiplying the component count.',
      },
      {
        label: 'DOCUMENTATION',
        images: ['/guides.png', '/DesignGuides.png'],
        body: "Wrote usage and behavior guidelines for each component. The goal was simple: designers and developers shouldn't have to chase each other down to figure out how something is supposed to work.",
      },
      {
        label: 'OUTCOME',
        images: ['/DesignSystemImpact.png', '/DesignSpecs.png'],
        body: 'By the end of the internship, the team had a working system they could actually build with. Updates propagated cleanly across mockups, designers stopped guessing at spacing values, and the redesign had a consistent foundation to grow from.',
      },
      {
        label: 'HOW IT COMES TOGETHER',
        images: ['/DSHighlight.png'],
        body: 'Even as the overlay introduces new features, the design system keeps everything consistent and connected. Shared components and patterns make the interface feel cohesive, so the overlay stays lightweight and easy to navigate without adding visual noise.',
      },
    ],
  },
  {
    cover: '/SafeThumbnailCover.jpg',
    overview: "Contributed to Safe Software's product modernization initiative. Evaluating and refining the redesigned FME Platform after UI components were shipped by engineering. Work spanned icon library handoff, annotation feature design, and laying the foundation for a formal design system that emerged directly from the pain of doing handoff without one.",
    role: 'Product Designer',
    year: '2024',
    specs: [
      { label: 'SCOPE',    value: 'End-to-end Feature Rework & Design System' },
      { label: 'DURATION', value: 'Jan — Aug 2024' },
    ],
    sections: [
      {
        label: 'ICONOGRAPHY REDESIGN',
        images: ['/IconographRebranding.png', '/IconRebrandingResult.png', '/IconographRebrandingResult2.png'],
        body: "Led the handoff of a comprehensive icon library redesign spanning 47+ icons aligned to FME Platform's modernized visual language. Defined SVG export specifications and integration guidelines coordinated directly with the engineering team, covering stroke normalization, fill rules, and named layer conventions for automation.",
      },
      {
        label: 'FEATURE ENHANCEMENT — ANNOTATION TOOLS',
        images: ['/AnnotationContainer.png'],
        videos: ['/safedialogannotation.mp4', '/visibilityannotation.mp4'],
        body: "Designed a contextual annotation layer for FME's workspace canvas — enabling users to place notes, grouping labels, and inline documentation directly within complex data transformation pipelines. Prior to this, documentation lived entirely outside the workspace in separate files, creating a context gap for new contributors and making pipeline review sessions slower. The annotation system surfaces context exactly where the work happens, reducing onboarding friction and keeping spatial reasoning intact during reviews.",
      },
      {
        label: 'DESIGN SYSTEM',
        images: ['/ThumbnailV2.png', '/dsexample.png'],
        videos: ['/DSFME.mp4'],
        body: "The iconography handoff surfaced a systemic problem: without a shared token layer, every component handoff required manual cross-referencing between Figma frames and the engineering codebase — a slow, error-prone process that did not scale. Initiated the FME Design System foundation with semantic tokens for color, spacing, typography, and iconography, each with a 1:1 mapping to CSS custom properties via a lightweight codegen step. The icon token layer connects directly to the iconography redesign work, ensuring that every icon variant is referenceable by name rather than by asset path — eliminating the most common class of handoff errors.",
      },
    ],
  },
  {
    cover: '/YUBlueprint.jpg',
    overview: "Fix the 6ix is a Toronto-based non-profit community that distributes gift cards to people who need them most. But keeping track of those cards has always been a manual process: volunteers submit spreadsheets, coordinators piece together the data, and figuring out what's been used, donated, or sitting idle takes more effort than it should.\n\nReGiftCard is the dashboard built to fix that. It gives the Fix the 6ix team a single place to monitor unused gift cards, follow how each one moves through spending or donation, and spot the gaps before they become problems. Less time wrestling with files, more time focused on the people they're actually trying to help.",
    role: 'Lead Designer',
    year: '2026',
    specs: [
      { label: 'SCOPE',    value: 'End to-end Product Development' },
      { label: 'DURATION', value: 'February 2026 - Now' },
    ],
    sections: [
      {
        label: 'SNEAK PEAK',
        images: ['/HighlightBlueprint.png'],
        videos: ['/BlueprintSneak.mp4'],
        body: 'ReGiftCard is still in development. Here are some sneak peek :)',
      },
    ],
  },
  {
    cover: '/bgimage.jpg',
    overview: 'Immersive 3D spatial interface built for a scientific data exploration platform. Procedurally generated geometry, real-time orbital mechanics, and a gesture-first navigation model — all running at 60fps in-browser with Three.js.',
    role: 'Solo Developer',
    year: '2025',
    specs: [
      { label: 'RENDERER',  value: 'Three.js / WebGL' },
      { label: 'ANIMATION', value: 'GSAP / Custom springs' },
      { label: 'GEOMETRY',  value: 'Procedural / instanced' },
      { label: 'TARGET',    value: '60fps desktop + tablet' },
    ],
    process:  'Started with a physics simulation of orbital bodies, then built the UI layer on top — treating the 3D scene as the primary navigation surface rather than a background decoration. All geometry is instanced for draw-call efficiency.',
    outcomes: 'Sustained 60fps on mid-range GPUs with 10,000+ instanced meshes. Navigation latency under 16ms on all tested devices. Selected as a featured experiment on Three.js Journey community showcase.',
  },
  {
    overview: 'Open for full-time and contract engagements in product design and frontend engineering. Experienced with early-stage startups moving fast and established product teams managing complex systems at scale.',
    role: 'Open to Offers',
    year: '2026',
    specs: [
      { label: 'AVAILABILITY', value: 'Immediate' },
      { label: 'ENGAGEMENT',   value: 'Full-time / Contract' },
      { label: 'TIMEZONE',     value: 'UTC+8  (flex overlap)' },
      { label: 'REMOTE',       value: 'Yes — preferred' },
    ],
    contacts: [
      { platform: 'Resume',   handle: 'view resume',              href: 'https://drive.google.com/file/d/1E8AUWkgri9AAHSLil1fQK9KBzZUQbtnK/view?usp=sharingt' },
      { platform: 'Email',    handle: 'bryanwinata112@gmail.com', href: 'mailto:bryanwinata112@gmail.com' },
      { platform: 'LinkedIn', handle: 'linkedin.com/in/gbryanw',  href: 'https://linkedin.com/in/gbryanw' },
      { platform: 'X',        handle: '@gbryanwt',                href: 'https://x.com/gbryanwt' },
    ],
  },
]
