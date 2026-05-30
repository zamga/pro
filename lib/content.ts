/**
 * content.ts
 * ---------------------------------------------------------------------------
 * Single source of truth for all editorial copy used across the Obsidian
 * Capital marketing site. Strongly typed and frozen with `as const` so that
 * section components consume literal, immutable values.
 *
 * Audience: institutional & accredited investors (GPs and LPs).
 * Tone: precise, restrained, confident, editorial.
 * ---------------------------------------------------------------------------
 */

/* -------------------------------------------------------------------------- */
/* Shared primitives                                                          */
/* -------------------------------------------------------------------------- */

export interface NavLink {
  label: string;
  href: string;
}

export interface SectionHeading {
  eyebrow: string;
  title: string;
}

/** A figure that animates from 0 → `countTo` on scroll into view. */
export interface Metric {
  label: string;
  /** Pre-formatted display string, used as the accessible / fallback value. */
  value: string;
  /** Numeric target the counter animates toward. */
  countTo: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

export interface ProcessStep {
  index: string;
  title: string;
  body: string;
}

export interface StrategyItem {
  index: string;
  title: string;
  body: string;
  points?: readonly string[];
}

export interface CaseStudy {
  id: string;
  type: string;
  amount: string;
  counterparty: string;
  region: string;
  year: string;
  structure: string;
  outcome: string;
}

export interface Pillar {
  title: string;
  body: string;
}

/* -------------------------------------------------------------------------- */
/* 1. Navigation                                                              */
/* -------------------------------------------------------------------------- */

export const nav = {
  brand: "Obsidian",
  links: [
    { label: "Strategies", href: "#strategies" },
    { label: "Thesis", href: "#thesis" },
    { label: "Track Record", href: "#track-record" },
    { label: "Facilities", href: "#facilities" },
    { label: "Data Room", href: "#portal" },
    { label: "Contact", href: "#contact" },
  ],
} as const;

/* -------------------------------------------------------------------------- */
/* 2. Hero                                                                    */
/* -------------------------------------------------------------------------- */

export const hero = {
  eyebrow: "Private Credit · Fund Finance",
  title: "Capital, structured against the unseen.",
  lede:
    "Obsidian Capital provides bespoke financing to fund managers and their portfolios — solving for liquidity, leverage, and continuity where conventional lenders cannot underwrite the complexity.",
  metrics: [
    {
      label: "Capital deployed",
      value: "$4.2B+",
      countTo: 4.2,
      prefix: "$",
      suffix: "B+",
      decimals: 1,
    },
    {
      label: "Facilities originated",
      value: "140",
      countTo: 140,
    },
    {
      label: "Investing since",
      value: "2011",
      countTo: 2011,
    },
  ],
} as const;

/* -------------------------------------------------------------------------- */
/* 3. Marquee                                                                 */
/* -------------------------------------------------------------------------- */

export const marquee = [
  "Net Asset Value Facilities",
  "GP & Management Co. Credit",
  "Asymmetric Arbitrage Funding",
  "Secondary LP Liquidity",
] as const;

/* -------------------------------------------------------------------------- */
/* 4. Thesis                                                                  */
/* -------------------------------------------------------------------------- */

export const thesis = {
  eyebrow: "Thesis",
  title: "Underwriting the structure, not the cycle.",
  intro:
    "We do not attempt to time markets. We build facilities whose repayment is insulated from them — secured against diversified collateral, governed by tight covenants, and structured so that principal is returned before equity participates in the outcome.",
  steps: [
    {
      index: "01",
      title: "Origination",
      body:
        "Every opportunity arrives through relationships built over more than a decade — never auctions or intermediaries. We engage early, when a manager's need is specific and a structure can still be shaped to our terms.",
    },
    {
      index: "02",
      title: "Underwriting",
      body:
        "We diligence the underlying assets line by line, stress the portfolio against adverse marks, and size the facility to a conservative loan-to-value. Downside protection is established before any return is assumed.",
    },
    {
      index: "03",
      title: "Structuring",
      body:
        "Capital is deployed through a defined payment waterfall, with maintenance covenants, security over fund interests, and step-in rights that keep us senior to equity throughout the life of the facility.",
    },
  ],
} as const;

/* -------------------------------------------------------------------------- */
/* 5. Strategies                                                              */
/* -------------------------------------------------------------------------- */

export const strategies = {
  eyebrow: "Strategies",
  title: "Four ways we put capital to work.",
  items: [
    {
      index: "01",
      title: "Net Asset Value Facilities",
      body:
        "Senior financing secured against the diversified net asset value of a mature fund's portfolio, enabling managers to fund follow-ons, accelerate distributions, or bridge to realization without selling into a soft market.",
      points: [
        "Secured against diversified portfolio NAV",
        "Conservative loan-to-value with maintenance covenants",
        "Three- to five-year tenor, amortizing on realizations",
      ],
    },
    {
      index: "02",
      title: "GP & Management Co. Credit",
      body:
        "Capital advanced against management-fee streams and GP commitments, allowing partnerships to fund their own alignment, seed successor vehicles, or finance generational transitions in ownership.",
      points: [
        "Secured against contracted fee streams",
        "Cash-flow sweeps and minimum-coverage covenants",
        "Aligned with long-dated firm continuity",
      ],
    },
    {
      index: "03",
      title: "Asymmetric Arbitrage Funding",
      body:
        "Structured leverage for defined, hedged, and event-driven situations where the spread is identifiable and the downside is bounded — sized so that a single position cannot impair the facility.",
      points: [
        "Defined catalysts and bounded loss",
        "Position-level concentration limits",
        "Daily mark-to-market with margin discipline",
      ],
    },
    {
      index: "04",
      title: "Secondary LP Liquidity",
      body:
        "Preferred and structured capital that delivers liquidity to limited partners against existing fund stakes, priced to a discount and repaid ahead of the underlying equity through the distribution waterfall.",
      points: [
        "Priced to net asset value with downside cushion",
        "Senior position in the distribution waterfall",
        "Diversified across vintages and managers",
      ],
    },
  ],
} as const;

/* -------------------------------------------------------------------------- */
/* 6. Track Record                                                            */
/* -------------------------------------------------------------------------- */

export const trackRecord = {
  eyebrow: "Track Record",
  title: "A record measured in returned principal.",
  stats: [
    {
      label: "Capital deployed",
      value: "$4.2B+",
      countTo: 4.2,
      prefix: "$",
      suffix: "B+",
      decimals: 1,
    },
    {
      label: "Active facilities",
      value: "140",
      countTo: 140,
    },
    {
      label: "Realized gross IRR",
      value: "14.2%",
      countTo: 14.2,
      suffix: "%",
      decimals: 1,
    },
    {
      label: "Realized principal loss rate",
      value: "0.0%",
      countTo: 0,
      suffix: "%",
      decimals: 1,
    },
    {
      label: "Average facility life",
      value: "3.4 yrs",
      countTo: 3.4,
      suffix: " yrs",
      decimals: 1,
    },
  ],
  note:
    "Returns reflect disciplined underwriting rather than market beta; dispersion across the book is driven principally by the quality of the underlying manager. Past performance is shown for illustration and does not guarantee future results.",
} as const;

/* -------------------------------------------------------------------------- */
/* 7. Case Studies / Facilities                                               */
/* -------------------------------------------------------------------------- */

export const caseStudies = {
  eyebrow: "Facilities",
  title: "Selected facilities, anonymized.",
  items: [
    {
      id: "fac-01",
      type: "NAV Facility",
      amount: "$480M",
      counterparty: "North American multi-strategy fund",
      region: "United States",
      year: "2022",
      structure:
        "Senior secured against diversified portfolio NAV at a sub-25% loan-to-value, with quarterly maintenance covenants.",
      outcome:
        "Funded two years of follow-on capital; repaid in full ahead of schedule from realizations.",
    },
    {
      id: "fac-02",
      type: "GP Credit",
      amount: "$165M",
      counterparty: "European buyout sponsor",
      region: "Western Europe",
      year: "2021",
      structure:
        "Advanced against contracted management-fee streams with a cash-flow sweep and minimum-coverage covenant.",
      outcome:
        "Financed a generational ownership transition; amortizing on schedule with full coverage maintained.",
    },
    {
      id: "fac-03",
      type: "Secondary LP Liquidity",
      amount: "$310M",
      counterparty: "Institutional limited partner",
      region: "Asia-Pacific",
      year: "2023",
      structure:
        "Preferred capital priced to a discount to NAV, senior in the distribution waterfall across multiple vintages.",
      outcome:
        "Delivered immediate liquidity against illiquid stakes; on track to return principal ahead of equity.",
    },
    {
      id: "fac-04",
      type: "Arbitrage Funding",
      amount: "$220M",
      counterparty: "Event-driven credit manager",
      region: "United Kingdom",
      year: "2020",
      structure:
        "Structured leverage on a hedged, catalyst-driven book with position-level concentration limits and daily margin.",
      outcome:
        "Held through a period of dislocation without a covenant breach; realized at target spread.",
    },
    {
      id: "fac-05",
      type: "NAV Facility",
      amount: "$540M",
      counterparty: "North American private-equity fund",
      region: "Canada",
      year: "2024",
      structure:
        "Senior secured against a concentrated, high-quality portfolio with step-in rights and an amortization schedule.",
      outcome:
        "Bridged the fund to a successful continuation vehicle; currently amortizing as expected.",
    },
  ],
} as const;

/* -------------------------------------------------------------------------- */
/* 8. Platform                                                                */
/* -------------------------------------------------------------------------- */

export const platform = {
  eyebrow: "Platform",
  title: "A platform built on relationships, not transactions.",
  paragraphs: [
    "Since 2011, Obsidian Capital has financed a deliberately small number of managers — partners we have underwritten across cycles and returned capital to time and again. That continuity is the platform: it gives us proprietary access to opportunities before they are competed, and the standing to shape terms that protect our capital first.",
    "We do not chase volume. Each facility is underwritten by the same senior team that originates it, and capital is committed only where the structure, the collateral, and the counterparty all hold. Discipline is not a constraint on the franchise — it is the franchise.",
  ],
  pillars: [
    {
      title: "Proprietary Origination",
      body:
        "Opportunities reach us through relationships, not auctions — allowing us to engage early and structure on our terms rather than competing on price.",
    },
    {
      title: "Underwriting Discipline",
      body:
        "Every facility is diligenced asset by asset and stressed against adverse outcomes, with conservative loan-to-value and covenants set before capital is committed.",
    },
    {
      title: "Aligned Capital",
      body:
        "Our principals invest alongside our partners in every facility, ensuring that how we manage risk is identical to how we manage our own.",
    },
  ],
} as const;

/* -------------------------------------------------------------------------- */
/* 9. Data Room                                                               */
/* -------------------------------------------------------------------------- */

export const dataRoom = {
  eyebrow: "Data Room",
  title: "A locked portal for verified partners.",
  lockLabel: "Encrypted",
  card: {
    heading: "Limited Partner Access",
    body:
      "Diligence materials, audited performance, and facility documentation are available to verified limited partners and prospective counterparties. Access is granted on request following a brief verification.",
  },
  inputPlaceholder: "Enter your access key",
  buttonLabel: "Decrypt",
  messages: {
    idle: "Access is restricted to verified partners.",
    success: "Verified. Opening the data room.",
    errorPrefix: "Access denied",
  },
} as const;

/* -------------------------------------------------------------------------- */
/* 10. Contact                                                                */
/* -------------------------------------------------------------------------- */

export const contact = {
  eyebrow: "Contact",
  title: "Begin a conversation.",
  body:
    "Tell us about your fund and the situation you are solving for. A partner reviews every inquiry directly and will respond within one business day.",
  fields: {
    name: "Name",
    firm: "Firm",
    email: "Email",
    note: "How can we help?",
  },
  successMessage:
    "Thank you. Your note has reached a partner, and we will respond within one business day.",
} as const;

/* -------------------------------------------------------------------------- */
/* 11. Footer                                                                 */
/* -------------------------------------------------------------------------- */

export const footer = {
  brand: "Obsidian",
  links: nav.links,
  copyrightHolder: "Obsidian Capital Partners",
  disclaimer:
    "For institutional and accredited counterparties only. This site is for informational purposes and is not an offer to sell or a solicitation of an offer to buy any security.",
  legalLinks: [
    { label: "Terms", href: "#" },
    { label: "Privacy", href: "#" },
    { label: "Form ADV", href: "#" },
    { label: "Disclosures", href: "#" },
  ],
} as const;

/* -------------------------------------------------------------------------- */
/* Aggregate default export                                                   */
/* -------------------------------------------------------------------------- */

export const content = {
  nav,
  hero,
  marquee,
  thesis,
  strategies,
  trackRecord,
  caseStudies,
  platform,
  dataRoom,
  contact,
  footer,
} as const;

export type Content = typeof content;

export default content;
