// ── Shared portfolio data — used by HardwareBoard and MobileView ──

export interface Section {
  id: string
  title: string
  tech: string
  desc: string
  desktopOnly?: boolean
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
    title: 'AMD | Conversational AI',
    tech: 'PRODUCT DESIGN',
    desc: 'Designing a conversational AI overlay to simplify feature access and system control for all user types.',
  },
  {
    id: 'PRJ-02',
    title: 'AMD | Design System',
    tech: 'DESIGN SYSTEM DESIGNER',
    desc: 'Built a scalable design system foundation to support major redesign initiative and ensure long-term consistency across products.',
  },
  {
    id: 'PRJ-03',
    title: 'Safe Software | Annotation Tools',
    tech: 'PRODUCT DESIGN',
    desc: 'Redesigning how annotations work in FME. Collapsible, embedded, and always in reach without cluttering the canvas.',
  },
  {
    id: 'PRJ-04',
    title: 'ReGiftCard',
    tech: 'PRODUCT DESIGN',
    desc: 'A dashboard for non-profits to track unused gift cards and replace manual spreadsheet submissions.',
  },
  {
    id: 'PRJ-05',
    title: 'SPATIAL UI',
    tech: 'THREE.JS / REACT / GSAP',
    desc: 'Immersive 3D spatial interface for a data exploration platform. Real-time orbital simulations, procedural geometry, and gesture-driven navigation.',
    desktopOnly: true,
  },
]

export const SECTION_DETAILS: SectionDetail[] = [
  {
    cover: '/sqwam.png',
    // screenCover: not used for ABT-00 (hover disabled)
    overview: "Hi, I'm Georgius Bryan Winata — but Bryan works. And yes, Georgius… gorgeous. I've heard it enough times, I'll save you the effort.",
    role: 'Product Designer',
    year: '2020 — Present',
    specs: [],
    sections: [
      {
        label: 'BACKGROUND',
        title: '',
        body: "Growing up, my dad and I would fix whatever broke around the house. Electrical gadgets, wiring, anything that stopped working. I was mostly just handing him tools, but I was always watching, always curious about what was underneath. That habit of needing to understand how something actually works before touching it never really left me.\n\nIt's probably why I ended up in design, and why I lean into the technical side of it more than most. It's also why this portfolio looks the way it does. At some point it just made sense to build it like a piece of hardware rather than another clean white grid.",
      },
      {
        label: 'WHAT PRODUCT DESIGN IS TO ME',
        title: '',
        body: "Making things feel obvious. Not by simplifying everything, but by structuring complexity in a way that people don't have to think about it. I'm drawn to systems with many moving parts, where clarity, hierarchy, and flow matter more than decoration.\n\nI care about the decisions behind the interface. Why something is placed a certain way, why a flow works or breaks, and how small details shape the overall experience.",
      },
      {
        label: 'MY EXPERIENCE',
        title: '',
        experience: [
          { company: 'AMD',           role: 'Product Design Intern', period: "05' — 12' 2025" },
          { company: 'Safe Software', role: 'Product Design Intern', period: "01' — 08' 2024" },
          { company: 'Vosyn',         role: 'Product Design Intern', period: "09' — 12' 2023" },
        ],
      },
      {
        label: 'SAY HELLO TO ME!',
        title: '',
        contacts: [
          { platform: 'Resume',   handle: 'maa resume',              href: 'https://drive.google.com/file/d/1E8AUWkgri9AAHSLil1fQK9KBzZUQbtnK/view?usp=sharing' },
          { platform: 'Email',    handle: 'bryanwinata112@gmail.com', href: 'mailto:bryanwinata112@gmail.com' },
          { platform: 'LinkedIn', handle: 'linkedin.com/in/gbryanw',  href: 'https://linkedin.com/in/gbryanw' },
          { platform: 'X',        handle: '@gbryanwt',                href: 'https://x.com/gbryanwt' },
        ],
      },
    ],
  },
  {
    cover: '/AMDThumbnail.png',
    screenCover: '/AMDThumbnail.png',
    password: 'amdx', // change this to your preferred password
    passwordDesc: "This case study is protected under NDA. If you'd like to learn more about the work, feel free to reach out directly and I'd be happy to walk you through it.",
    overview: "In the summer of 2025, I joined AMD as a Product Design Intern contributing to one of the largest redesigns AMD Software had undertaken in recent years. My focus was reworking the Overlay View, a lightweight interface that sits on top of any application, designed for quick, in-session control. At the time, the overlay was limited to displaying system metrics. My role was to evolve it into something users could interact with and act through, without leaving whatever they were doing.",
    role: 'Product Design Intern',
    year: '2025',
    specs: [
      { label: 'SCOPE',    value: 'Feature Design — Conversational AI' },
      { label: 'DURATION', value: 'May - December 2025' },
    ],
    sections: [],
    lockedSections: [
      {
        label: 'HIGHLIGHTS',
        bento: [
          { video: '/Convai.mp4', label: 'AMD CHAT',          span: 2 },
          { video: '/Recording.mp4',      label: 'IN-GAME MODE',      span: 1 },
          { image: '/DSHighlight.png',    label: 'VISUAL COMPONENTS', span: 1 },
        ],
      },
      {
        label: 'CONTEXT',
        title: 'The overlay used to do more.',
        body: "Two versions ago, the overlay let users act without leaving their session — compact, fast, and built for mid-game use. Over major updates, it got stripped back to metrics only. Everything else moved into the full application.",
        image: '/OldOverlay.png',
      },
      {
        label: 'PROBLEM SPACE',
        contents: [
          {
            title: 'Read-only metrics, no controls.',
            body: "The overlay became a dashboard you could only look at. Any change meant exiting, opening the full app, and navigating to the right panel — enough friction that most users just didn't bother.",
            image: '/MetricsIssues.png',
          },
          {
            title: 'Settings only experts could parse.',
            body: "As more features moved into the full application, the terminology got increasingly technical. Casual users had no way to know what a setting did or how it'd affect their system.",
            image: '/Technical.png',
          },
        ],
      },
      {
        label: 'THE GOALS',
        title: 'Redefining what the overlay should do.',
        contents: [
          {
            body: 'Restore quick access to the controls users lost, and use AI to help users interact with technical features through natural language — no prior knowledge required.',
            highlight: true,
          },
        ],
      },
      {
        label: 'INITIAL EXPLORATION',
        title: 'Starting with a familiar pattern.',
        body: 'The first concept was a traditional multi-message chatbot inside the overlay. Familiar, but it quickly became visually dense — chat history management in a space built for quick, in-session interactions.',
        image: '/InitialChat.png',
        contents: [
          {
            title: 'Key Insight',
            body: 'A threaded chat adds cognitive load and slows the path from question to action. The overlay needed something faster.',
            highlight: true,
          },
        ],
      },
      {
        label: 'RETHINKING THE INTERACTION MODEL',
        contents: [
          {
            title: 'Describe the problem, get a fix.',
            body: 'Type or say what\'s wrong — "my game is stuttering," "fan is too loud" — and the AI reads your live hardware data and hands you a one-tap fix on the spot.',
            videos: ['/Convai.mp4'],
          },
          {
            title: 'Responses that become controls.',
            body: 'Instead of just text, the assistant can generate a pinnable widget — turning a recommendation into a persistent, actionable control right inside the overlay.',
            videos: ['/Conversational.mp4'],
          },
        ],
      },
      {
        label: 'WIDGETS PANEL',
        contents: [
          {
            title: 'Pinned controls, always accessible.',
            body: 'Pinned widgets persist across overlay sessions — key controls stay visible without interrupting what you\'re doing.',
            image: '/PinnedWidgets.png',
          },
          {
            title: 'Manual widget customization.',
            body: 'Users can also add widgets themselves, tailoring the overlay to their needs beyond what the AI suggests.',
            videos: ['/AddWidget.mp4'],
          },
        ],
      },
      {
        label: 'OVERALL STRUCTURE',
        title: 'Layout built around how users scan.',
        body: 'System info stays right, consistent with the existing overlay. The center is the action space — AMD Chat at the core, widgets panel alongside it.',
        contents: [
          {
            beforeAfter: {
              before: '/StructureDiagram.png',
              after: '/StructureAfter.png',
              beforeLabel: 'DIAGRAM',
              afterLabel: 'DESIGN',
            },
          },
        ],
      },
      {
        label: 'IN GAME MODE',
        contents: [
          {
            title: 'Most-used controls, one click away.',
            body: "Gamers act, they don't browse. The in-game modal surfaces the most-reached-for controls immediately — no navigation needed.",
            image: '/InGameModal.png',
          },
          {
            title: 'Tune performance without touching settings.',
            body: "A single slider adjusts the right combination of graphics settings for your system — no manual parameter tweaking.",
            videos: ['/InGame.mp4'],
          },
          {
            title: 'Start recording without leaving the game.',
            body: 'Screen recording triggers directly from AMD Chat or a keyboard shortcut — no need to open the full application.',
            videos: ['/Recording.mp4'],
          },
        ],
      },
      {
        label: 'THE BIGGER PICTURE',
        title: "Building toward the Full View.",
        body: "While engineering built the overlay foundation, the design team extended the work into the Full View — the space for deeper configuration. The goal: make complex settings understandable and explorable, not just accessible.",
      },
    ],
  },
  {
    cover: '/amdDSHighlight.png',
    screenCover: '/AMDHighlight2.png',
    overview: "When I joined AMD's UX team, the product didn't have a shared design foundation. Designers organized files differently, colors were applied inconsistently, and components varied from screen to screen. The team was also preparing for a full software redesign — which meant the inconsistency wasn't just a current problem, it was about to be a much bigger one.\n\nI took on building the design system from the ground up: not as a cleanup effort, but as the structural layer the redesign would be built on top of.",
    role: 'Design System Designer',
    year: '2025',
    specs: [
      { label: 'SCOPE',    value: 'Design System' },
      { label: 'DURATION', value: 'May - December 2025' },
    ],
    sections: [
      {
        label: 'HIGH-LEVEL AUDIT',
        title: 'Identifying the problems',
        images: ['/colorMismatch.png', '/inconsistentStyling.png'],
        body: 'Before diving into any design system work, I conducted an audit and found two major issues. Colors were applied inconsistently across teams, leading to unclear states and a broken visual hierarchy. Component styling had the same problem, where buttons alone varied across screens in size, corner radius, spacing, and interaction states, revealing a product that had grown without any visual governance.',
      },
      {
        label: 'DESIGN FOUNDATION',
        contents: [                         
          { image: '/primitiveTokens.png', title: 'The push for a better color foundation.', body: 'To keep the design system flexible, I defined primitive tokens as the base color palette and used semantic tokens to apply those colors throughout the components. This allowed components to rely on intent-driven values rather than fixed hex codes.' },
          { images: ['/Tokens1.png', '/ColorStructure.png'], body: 'Once the primitives were set, I mapped them to semantic tokens named by purpose or state. This ensured components always referenced meaningful, role-based tokens, which made updates much smoother and more consistent.' },
          { image: '/radius_spacingtokens.png',  title: 'A proper spacing & radius tokens',  body: 'To bring consistency to layouts, I introduced numeric tokens for spacing and radius based on a structured 4-point scale. By defining a predictable set of spacing and radius tokens, layout decisions became clearer, adjustments were safer to make.' },
          { image: '/TextStyling.png',  title: 'Streamlined text styling',  body: ' I simplified the text-styling by consolidating everything into a single, structured typography scale with clear header and body levels.' },
        ],
      },
      {
        label: 'COMPONENT LIBRARY',
        contents: [
          { images: [ '/ComponentAnatomy.png', '/CommonComponents.png'], title: 'Dissecting the designs', body: 'Before building anything, I went through the approved designs and identified the foundational elements that appeared repeatedly, such as buttons, inputs, tags, toggles. Recognizing these common components early meant I could establish a shared base layer rather than designing each screen in isolation.' },
          { image: '/Slots.jpg', title: 'Supporting multiple variants', body: 'Instead of creating endless variants that would complicate the system, I chose to use the slot method. By treating slots as flexible placeholders, I gave the components room to adapt their content while still maintaining a consistent and polished appearance.' },
        ],
      },
      {
        label: 'DOCUMENTATION',
        title: 'Reducing communication gaps between designers and developers',
        images: ['/guides.png', '/DesignGuides.png'],
        body: "Wrote usage and behavior guidelines for each component. The goal was simple: designers and developers shouldn't have to chase each other down to figure out how something is supposed to work.",
      },
      {
        label: 'OUTCOME',
        title: 'Consistent & maintainable mockups.',
        images: ['/DesignSystemImpact.png', '/DesignSpecs.png'],
        body: 'By the end of the internship, the team had a working system they could actually build with. Updates propagated cleanly across mockups, designers stopped guessing at spacing values, and the redesign had a consistent foundation to grow from.',
      },
      {
        label: 'HOW IT COMES TOGETHER',
        title: 'The vibeeee ~',
        images: ['/DSHighlight.png'],
        body: 'Even as the overlay introduces new features, the design system keeps everything consistent and connected. Shared components and patterns make the interface feel cohesive, so the overlay stays lightweight and easy to navigate without adding visual noise.',
      },
      {
        label: 'CONFIDENTIAL',
        title: 'There\'s more to this.',
        body: "The overlay feature rework is under NDA and can't be shown here. It's the project the design system was built to support.\n\nIf you'd like to walk through that work, reach out and I'm happy to share more in a conversation.",
        contacts: [
          { platform: 'Email',    handle: 'bryanwinata112@gmail.com', href: 'mailto:bryanwinata112@gmail.com' },
          { platform: 'LinkedIn', handle: 'linkedin.com/in/gbryanw',  href: 'https://linkedin.com/in/gbryanw' },
        ],
      },
    ],
  },
  {
    cover: '/SafeThumbnails.png',
    screenCover: '/SafeHighlight2.png',
    overview: "During my internship at Safe Software, I led the end-to-end redesign of the annotation experience in FME Form, a data integration platform used to build complex spatial workflows.\n\nAnnotations play a key role in helping users document logic, explain decisions, and maintain clarity across workflows. However, as workflows grew in complexity, annotations began to introduce more problems than they solved — cluttering the canvas, reducing readability, and making navigation more difficult.",
    role: 'Product Design Intern',
    year: '2025',
    specs: [
      { label: 'TEAM',     value: '4 Members' },
      { label: 'DURATION', value: 'April — September 2025' },
    ],
    sections: [
      {
        label: 'THE IMPACT',
        title: '',
        body: 'The enhanced annotation feature reduced visible canvas clutter by 57%, improving workflow readability and navigation across complex workflows.',
        stat: { value: '57%', label: 'reduction in visible canvas clutter', body: 'The enhanced annotation feature improved workflow readability and navigation across complex workflows.' },
      },
      {
        label: 'PROBLEM SPACE',
        contents: [
          {
            title: 'No visibility controls.',
            body: "Annotations were essential for adding context, but created significant visual clutter and reduced workflow readability. Users had no way to control visibility, leading to overloaded canvases.",
            image: '/ProblemSpace2.png',
          },
          {
            title: 'Lack of customizability & details.',
            body: "Summary annotations don't go deep enough. They describe what an object does, but not why it's configured a certain way. Users end up writing their own custom annotations just to fill in the gaps, adding friction to an already complex workflow.",
            image: '/ProblemSpace1.png',
          },
        ],
      },
      {
        label: 'USER RESEARCH',
        title: 'Understanding what users actually want.',
        body: "To validate our hypothesis, we pulled feedback from the FME Community platform and conducted user interviews. A recurring theme emerged: users wanted annotations to be collapsible and available directly inside the parameter dialog, so context stays visible exactly where configuration decisions are made.\n\nWe also found users tucking annotations into bookmarks just to collapse and hide them; a workaround that kept things tidier but added friction and stripped away context.",
        image: '/WhatUserSaid.png',
        videos: ['/Workaround.mp4'],
      },
      {
        label: 'PROJECT DIRECTION',
        title: 'Creating a more comprehensive annotations.',
        body: 'Following our hypothesis on the problem space, the team identified three potential solutions.',
        cards: [
          { icon: '⊕', title: 'Dynamic Visibility',               body: 'Allow users to toggle annotations between expanded and minimized states.' },
          { icon: '⊡', title: 'Annotation in Parameter Dialog',   body: 'Allow users to embed notes within parameter editor dialogs, where they are defining logic and making decisions that impact the outcomes.' },        ],
      },
      {
        label: 'SOLUTION — ANNOTATION VISIBILITY',
        contents: [
          {
            title: 'Right click menu as access point.',
            body: "We introduced collapsible annotations to reduce visual clutter while preserving access to context. Annotations can be minimized into an icon on the object header, with controls available via right-click and the toolbar for flexible interaction.",
            videos: ['/visibilityannotation.mp4'],
          },
          {
            title: 'Side window as annotation container.',
            body: "When annotations are hidden, they needed somewhere logical to go. I grouped them under a single container, keeping the canvas clean while making sure users could still navigate between them quickly without losing context.",
            image: '/AnnotationContainer.png',
          },
        ],
      },
      {
        label: 'SOLUTION — PARAMETER DIALOG',
        contents: [
          {
            title: 'Adding in-line annotation.',
            body: "Users were constantly switching between the canvas and parameter dialogs to reference their notes. To solve this, I brought annotations directly into the dialog, so context lives right where decisions are being made.",
            videos: ['/safedialogannotation.mp4'],
          },
          {
            title: 'Multi-level visibility.',
            body: "Annotations are accessible across the canvas, and navigator levels, so users can always find context no matter where they're working in a complex workflow.",
            images: ['/AnnotationCanvas.png','/AnnotationNavigator.png']
          },
        ],
      },
      {
        label: 'IMPLEMENTATION',
        title: "What made it to release and what didn't.",
        body: "The annotation in the parameter dialog has been released and is now available to users. However, the annotation visibility feature is on hold due to capacity constraints, though it has been prioritized for future development and remains on the Product Planning page.",
        image: '/linkedInComments.png',
      },
      {
        label: 'RETROSPECTIVE',
        contents: [
          {
            title: 'Collaboration and communication is key.',
            body: "Worked closely with project managers, developers, and designers from the start to keep the project aligned with its goals.",
          },
          {
            title: 'Always consider having backup ideas.',
            body: "Maintaining a bank of ideas enabled the team to adapt efficiently to any changes in project direction and facilitated smoother negotiations with developers.",
          },
        ],
      },
    ],
  },
  {
    cover: '/blueprintHighlight.png',
    screenCover: '/BlueprintHighlight2.png',
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
        title: '',
        images: ['/HighlightBlueprint.png'],
        videos: ['/BlueprintSneak.mp4'],
        body: 'ReGiftCard is still in development. Here are some sneak peek :)',
      },
    ],
  },
  {
    // PRJ-05 — desktop only, renders as video screen (no overlay content)
    overview: 'Immersive 3D spatial interface built for a scientific data exploration platform. Procedurally generated geometry, real-time orbital mechanics, and a gesture-first navigation model — all running at 60fps in-browser with Three.js.',
    role: 'Solo Developer',
    year: '2025',
    specs: [],
    sections: [],
  },
]
